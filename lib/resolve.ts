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
import { findTenant, fetchWorkdayJobs } from "./workday";
import { findProprietary } from "./proprietary";
import { findRendered } from "./rendered";
import { findCompanyJobs } from "./aggregator";

export type Resolved = {
  query: string;
  name: string;
  provider: "greenhouse" | "ashby" | "lever" | "workday" | "proprietary" | "rendered" | "aggregator";
  board: string;
  jobs: Job[];
  /** Set only for the rendered tier: when the snapshot was captured. */
  capturedAt?: string;
  careersUrl?: string;
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

  // Strip markup so a job description is model-readable plain text.
  const plain = (v: unknown): string | null => {
    const s = str(v);
    if (!s) return null;
    return s
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;|&#34;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  };

  if (provider === "greenhouse") {
    const title = str(raw.title);
    const url = str(raw.absolute_url);
    if (!title || !url) return null;
    const loc = raw.location as { name?: string } | undefined;
    return {
      id: String(raw.id ?? url),
      title,
      url,
      location: loc?.name ?? null,
      team: null,
      description: plain(raw.content),
    };
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
      description: plain(raw.descriptionPlain) ?? plain(raw.descriptionHtml),
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
    description: plain(raw.descriptionPlain) ?? plain(raw.description),
  };
}

async function tryProbe(slug: string, probe: Probe): Promise<Resolved | null> {
  try {
    // Greenhouse only returns descriptions when asked for them.
    const url =
      probe.provider === "greenhouse" ? `${probe.url}?content=true` : probe.url;
    const res = await fetch(url, {
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

  // A few giants run their own applicant system but still serve public JSON.
  for (const slug of slugs) {
    const own = findProprietary(slug);
    if (!own) continue;
    const jobs = await own.fetchJobs(60);
    if (jobs.length > 0) {
      return { query: input, name: own.name, provider: "proprietary", board: slug, jobs };
    }
  }

  // Most of the largest employers run Workday, whose careers page is a JS app
  // but whose underlying JSON endpoint is public. Check that first.
  for (const slug of slugs) {
    const tenant = findTenant(slug);
    if (!tenant) continue;
    const jobs = await fetchWorkdayJobs(tenant);
    if (jobs.length > 0) {
      return {
        query: input,
        name: tenant.name,
        provider: "workday",
        board: `${tenant.tenant}/${tenant.site}`,
        jobs,
      };
    }
  }

  for (const slug of slugs) {
    const results = await Promise.all(probes(slug).map((p) => tryProbe(slug, p)));
    const hit = results.find((r): r is Resolved => r !== null);
    if (hit) return { ...hit, query: input, name: input.trim() };
  }

  // Roles read off a careers page that serves no API. A snapshot rather than
  // live data, so it only runs once every direct pipe has missed.
  const snapshot = findRendered(input);
  if (snapshot) {
    return {
      query: input,
      name: snapshot.name,
      provider: "rendered",
      board: snapshot.careersUrl,
      jobs: snapshot.jobs,
      capturedAt: snapshot.capturedAt,
      careersUrl: snapshot.careersUrl,
    };
  }

  // True last resort: ask the aggregators. Coverage of any one employer is
  // patchy, but it means a company we have never wired can still return roles.
  const aggregated = await findCompanyJobs(input, 40);
  if (aggregated.length > 0) {
    return {
      query: input,
      name: aggregated[0].company,
      provider: "aggregator",
      board: [...new Set(aggregated.map((j) => j.source))].join(", "),
      jobs: aggregated,
    };
  }

  return null;
}
