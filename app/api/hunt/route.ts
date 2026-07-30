import { runJudge, friendlyError } from "@/lib/agent";
import { DreamJobSchema, type DreamJob } from "@/lib/dream";
import { searchAggregators, activeProviders, type AggregatedJob } from "@/lib/aggregator";

export const runtime = "nodejs";
export const maxDuration = 300;

/** How many found roles we score in one pass. */
const MAX_SCORED = 14;

/**
 * Turn the dream JD into searches an aggregator can answer.
 *
 * The title is the best single query, but it is usually decorated ("Founding
 * Engineer, AI-Native Product (0-to-1 Full-Stack)"), and searching that verbatim
 * matches nothing. So strip the decoration, then add a broader fallback so a
 * narrow title still returns a pool worth ranking.
 */
export function deriveQueries(dream: DreamJob): string[] {
  const core = dream.title
    .replace(/\([^)]*\)/g, " ")
    .split(/[,–|/]/)[0]
    .replace(/\b(senior|staff|principal|lead|junior|entry|level|i{1,3}|sr\.?|jr\.?)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = core.split(" ").filter(Boolean);
  const queries = new Set<string>();

  if (core) queries.add(core.toLowerCase());
  // The last two words are usually the role itself ("product engineer").
  if (words.length > 2) queries.add(words.slice(-2).join(" ").toLowerCase());
  // The bare noun catches everything the phrase misses.
  if (words.length > 1) queries.add(words[words.length - 1].toLowerCase());

  // A domain term from the problems widens the net without losing the thread.
  const domain = dream.problems
    .join(" ")
    .toLowerCase()
    .match(/\b(ai|ml|infrastructure|platform|growth|security|data|design|fintech|health|devtools?|agent|llm)\b/);
  if (domain && words.length > 0) {
    queries.add(`${domain[1]} ${words[words.length - 1].toLowerCase()}`);
  }

  return [...queries].slice(0, 4);
}

export async function POST(req: Request) {
  let body: { dream?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = DreamJobSchema.safeParse(body.dream);
  if (!parsed.success) {
    return Response.json({ error: "Build your dream job first." }, { status: 400 });
  }
  const dream = parsed.data;

  const queries = deriveQueries(dream);
  const batches = await Promise.all(queries.map((q) => searchAggregators(q, 25)));

  /**
   * The same role is often posted once per city, so an exact-title key lets ten
   * copies of one job through and they eat the whole scoring budget. Strip the
   * trailing location qualifier before comparing.
   */
  const roleKey = (job: AggregatedJob) =>
    `${job.company.toLowerCase()}|${job.title
      .toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .replace(/\s*[-–,|]\s*(remote|hybrid|onsite|us|usa|uk|emea|apac|latam|europe|worldwide|anywhere).*$/i, " ")
      .replace(/\s+/g, " ")
      .trim()}`;

  // Merge across queries, keeping the first (best-ranked) sighting of each role.
  const byKey = new Map<string, AggregatedJob>();
  for (const job of batches.flat()) {
    const key = roleKey(job);
    if (!byKey.has(key)) byKey.set(key, job);
  }

  /**
   * One employer posting many roles should not crowd out the rest of the market
   * either, so allow at most a few per company in the scored set.
   */
  const MAX_PER_COMPANY = 3;
  const perCompany = new Map<string, number>();
  const found: AggregatedJob[] = [];
  for (const job of byKey.values()) {
    const c = job.company.toLowerCase();
    const n = perCompany.get(c) ?? 0;
    if (n >= MAX_PER_COMPANY) continue;
    perCompany.set(c, n + 1);
    found.push(job);
  }

  if (found.length === 0) {
    return Response.json({
      found: false,
      queries,
      providers: activeProviders(),
      message:
        "The aggregators returned nothing for this profile. They skew remote and tech-heavy, so try scoring a named company instead.",
    });
  }

  // Prefer roles that carry real description text: a title alone scores poorly.
  const candidates = [...found].sort(
    (a, b) => (b.description?.length ?? 0) - (a.description?.length ?? 0)
  );

  try {
    const judged = await runJudge(
      dream,
      "the open market",
      // The judge sees one flat list, so name the employer inline.
      candidates.slice(0, MAX_SCORED).map((j) => ({
        id: j.id,
        title: `${j.title} at ${j.company}`,
        location: j.location,
        description: j.description,
      }))
    );

    const byId = new Map(found.map((j) => [j.id, j]));
    const verdicts = judged.verdicts.map((v) => ({ ...v, job: byId.get(v.job_id) ?? null }));

    return Response.json({
      found: true,
      queries,
      providers: activeProviders(),
      searched: found.length,
      scored: verdicts.length,
      verdicts,
    });
  } catch (err) {
    console.error("[hunt]", err);
    return Response.json({ error: friendlyError(err) }, { status: 502 });
  }
}
