import { runJudge, friendlyError } from "@/lib/agent";
import { resolveCompany } from "@/lib/resolve";
import { DreamJobSchema } from "@/lib/dream";

export const runtime = "nodejs";
export const maxDuration = 180;

/** How many live roles we score in one pass. Enough to be useful, small enough to stay fast. */
const MAX_ROLES = 12;

export async function POST(req: Request) {
  let body: { dream?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = DreamJobSchema.safeParse(body.dream);
  if (!parsed.success) {
    return Response.json({ error: "Build your dream job first." }, { status: 400 });
  }
  const company = typeof body.company === "string" ? body.company.trim() : "";
  if (!company) {
    return Response.json({ error: "Name a company to check." }, { status: 400 });
  }

  const resolved = await resolveCompany(company);
  if (!resolved) {
    return Response.json(
      {
        found: false,
        message: `No public job board found for "${company}". Companies on Workday or a private stack cannot be scored this way.`,
      },
      { status: 200 }
    );
  }

  // A big company can have 400 openings, and we only score a handful. Picking
  // them by description length would score whichever posting happened to be
  // wordiest, so rank by how plausibly the TITLE matches the dream JD first.
  const stop = new Set([
    "the", "and", "for", "with", "you", "your", "that", "this", "into", "from",
    "not", "who", "are", "her", "his", "our", "their", "them", "than", "when",
    "would", "will", "have", "has", "own", "owns", "role", "job", "work", "team",
    "company", "product", "products", "stage", "early", "like", "real", "one",
  ]);
  const terms = new Set(
    `${parsed.data.title} ${parsed.data.problems.join(" ")} ${parsed.data.must_haves.join(" ")}`
      .toLowerCase()
      .split(/[^a-z0-9+#.]+/)
      .filter((w) => w.length > 2 && !stop.has(w))
  );

  const relevance = (title: string) => {
    const words = title.toLowerCase().split(/[^a-z0-9+#.]+/);
    return words.reduce((n, w) => (terms.has(w) ? n + 1 : n), 0);
  };

  const candidates = [...resolved.jobs].sort((a, b) => {
    const byRelevance = relevance(b.title) - relevance(a.title);
    if (byRelevance !== 0) return byRelevance;
    return (b.description?.length ?? 0) - (a.description?.length ?? 0);
  });

  try {
    const judged = await runJudge(parsed.data, resolved.name, candidates.slice(0, MAX_ROLES));
    const byId = new Map(resolved.jobs.map((j) => [j.id, j]));
    const verdicts = judged.verdicts.map((v) => ({
      ...v,
      job: byId.get(v.job_id) ?? null,
    }));

    return Response.json({
      found: true,
      company: resolved.name,
      provider: resolved.provider,
      total: resolved.jobs.length,
      scored: verdicts.length,
      verdicts,
    });
  } catch (err) {
    console.error("[judge]", err);
    return Response.json({ error: friendlyError(err) }, { status: 502 });
  }
}
