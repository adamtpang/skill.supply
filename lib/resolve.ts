/**
 * The universal company resolver: type any company name, find its public
 * applicant-tracking board, return its live roles.
 *
 * Most companies publish openings through Greenhouse, Ashby, or Lever, and all
 * three expose an open job-board API. So the whole index is legitimate public
 * data: no scraping, no terms-of-service risk, no database.
 *
 * Mega-caps on Workday or a proprietary stack will not resolve. That is fine,
 * and we say so honestly instead of pretending the index is complete.
 */
import type { Job } from "./jobs";

export type Resolved = {
  query: string;
  name: string;
  provider: "greenhouse" | "ashby" | "lever";
  board: string;
  jobs: Job[];
};

/** Name to candidate slugs: "AppLovin" -> applovin, app-lovin, applovincorp. */
function slugCandidates(input: string): string[] {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\.(com|ai|io|co|app|dev|inc|org|net)\b.*$/, "")
    .replace(/[^a-z0-9 -]/g, "")
    .trim();
  if (!base) return [];

  const squashed = base.replace(/[\s-]+/g, "");
  const dashed = base.replace(/\s+/g, "-");
  return [...new Set([squashed, dashed, squashed + "inc", squashed + "hq"])].filter(Boolean);
}

type Probe = { provider: Resolved["provider"]; url: string };

function probes(slug: string): Probe[] {
  return [
    { provider: "greenhouse", url: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs` },
    { provider: "ashby", url: `https://api.ashbyhq.com/posting-api/job-board/${slug}` },
    { provider: "lever", url: `https://api.lever.co/v0/postings/${slug}?mode=json` },
  ];
}

function normalize(raw: Record<string, unknown>, provider: Resolved["provider"]): Job | null {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

  if (provider === "greenhouse") {
    const title = str(raw.title);
    const url = str(raw.absolute_url);
    if (!title || !url) return null;
    const loc = raw.location as { name?: string } | undefined;
    return { id: String(raw.id ?? url), title, url, location: loc?.name ?? null, team: null };
  }

  if (provider === "ashby") {
    if (raw.isListed === false) return null;
    const title = str(raw.title);
    const url = str(raw.jobUrl) ?? str(raw.applyUrl);
    if (!title || !url) return null;
    return {
      id: String(raw.id ?? url),
      title,
      url,
      location: str(raw.location),
      team: str(raw.department) ?? str(raw.team),
    };
  }

  // Lever
  const title = str(raw.text);
  const url = str(raw.hostedUrl) ?? str(raw.applyUrl);
  if (!title || !url) return null;
  const cats = (raw.categories ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id ?? url),
    title,
    url,
    location: str(cats.location),
    team: str(cats.team),
  };
}

async function tryProbe(slug: string, probe: Probe): Promise<Resolved | null> {
  try {
    const res = await fetch(probe.url, {
      headers: { "user-agent": "skill.supply" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw: unknown[] = Array.isArray(data) ? data : (data?.jobs ?? []);
    const jobs = raw
      .map((j) => normalize(j as Record<string, unknown>, probe.provider))
      .filter((j): j is Job => j !== null);
    if (jobs.length === 0) return null;
    return { query: slug, name: slug, provider: probe.provider, board: slug, jobs };
  } catch {
    return null;
  }
}

/** Resolve a company name to its live board. Returns null when nothing public exists. */
export async function resolveCompany(input: string): Promise<Resolved | null> {
  const slugs = slugCandidates(input);
  if (slugs.length === 0) return null;

  for (const slug of slugs) {
    const results = await Promise.all(probes(slug).map((p) => tryProbe(slug, p)));
    const hit = results.find((r): r is Resolved => r !== null);
    if (hit) return { ...hit, query: input, name: input.trim() };
  }
  return null;
}
