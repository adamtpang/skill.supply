/**
 * Job aggregators.
 *
 * Our direct pipes (Greenhouse, Ashby, Lever, Workday) give depth: every live
 * role at a named company, with full description text, free and in real time.
 * They give no breadth, because they only answer "what is open at X".
 *
 * Aggregators are the opposite. They answer "what is open anywhere that matches
 * this", across thousands of employers we will never wire by hand. So they run
 * as a breadth layer beside the direct pipes, never instead of them.
 *
 * Every provider below works with no API key, so this ships without a signup.
 * Adzuna and TheirStack are wired too and switch on when their keys are set:
 *   ADZUNA_APP_ID + ADZUNA_APP_KEY   free tier, ~1,000 calls a month
 *   THEIRSTACK_API_KEY               paid, 315k+ sources including most ATSs
 *
 * Caveat worth knowing: the keyless providers skew heavily remote and tech, so
 * they are weak for looking up a specific large employer. That is what the
 * direct pipes are for.
 */
import type { Job } from "./jobs";

export type AggregatedJob = Job & { company: string; source: string; postedAt: string | null };

type Provider = {
  name: string;
  needsKey?: boolean;
  fetchJobs: (query: string, limit: number) => Promise<AggregatedJob[]>;
};

const UA = "skill.supply";
const TIMEOUT_MS = 12000;

async function getJson(url: string, init?: RequestInit): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "user-agent": UA, accept: "application/json", ...(init?.headers ?? {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v.trim() : null;

/** Strip markup and clamp, so descriptions stay model-readable and small. */
function plain(v: unknown, max = 2000): string | null {
  const s = str(v);
  if (!s) return null;
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function matches(query: string, ...fields: (string | null)[]): boolean {
  if (!query.trim()) return true;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

/* ------------------------------- providers ------------------------------- */

const arbeitnow: Provider = {
  name: "arbeitnow",
  async fetchJobs(query, limit) {
    const data = await getJson("https://www.arbeitnow.com/api/job-board-api");
    const rows = ((data as { data?: Record<string, unknown>[] })?.data ?? []).slice(0, 300);
    const out: AggregatedJob[] = [];
    for (const r of rows) {
      const title = str(r.title);
      const url = str(r.url);
      const company = str(r.company_name);
      if (!title || !url || !company) continue;
      if (!matches(query, title, company, str(r.description))) continue;
      out.push({
        id: `arbeitnow:${str(r.slug) ?? url}`,
        title,
        url,
        company,
        location: str(r.location) ?? (r.remote ? "Remote" : null),
        team: null,
        description: plain(r.description),
        source: "arbeitnow",
        postedAt: typeof r.created_at === "number" ? new Date(r.created_at * 1000).toISOString() : null,
      });
      if (out.length >= limit) break;
    }
    return out;
  },
};

const remotive: Provider = {
  name: "remotive",
  async fetchJobs(query, limit) {
    const url = query.trim()
      ? `https://remotive.com/api/remote-jobs?limit=${limit * 3}&search=${encodeURIComponent(query)}`
      : `https://remotive.com/api/remote-jobs?limit=${limit * 3}`;
    const data = await getJson(url);
    const rows = (data as { jobs?: Record<string, unknown>[] })?.jobs ?? [];
    const out: AggregatedJob[] = [];
    for (const r of rows) {
      const title = str(r.title);
      const link = str(r.url);
      const company = str(r.company_name);
      if (!title || !link || !company) continue;
      out.push({
        id: `remotive:${r.id ?? link}`,
        title,
        url: link,
        company,
        location: str(r.candidate_required_location) ?? "Remote",
        team: str(r.category),
        description: plain(r.description),
        source: "remotive",
        postedAt: str(r.publication_date),
      });
      if (out.length >= limit) break;
    }
    return out;
  },
};

const themuse: Provider = {
  name: "themuse",
  async fetchJobs(query, limit) {
    const data = await getJson("https://www.themuse.com/api/public/jobs?page=1");
    const rows = (data as { results?: Record<string, unknown>[] })?.results ?? [];
    const out: AggregatedJob[] = [];
    for (const r of rows) {
      const title = str(r.name);
      const company = str((r.company as { name?: string } | undefined)?.name);
      const refs = r.refs as { landing_page?: string } | undefined;
      const url = str(refs?.landing_page);
      if (!title || !company || !url) continue;
      const locations = Array.isArray(r.locations)
        ? (r.locations as { name?: string }[]).map((l) => l.name).filter(Boolean).join(", ")
        : null;
      if (!matches(query, title, company, locations)) continue;
      out.push({
        id: `themuse:${r.id ?? url}`,
        title,
        url,
        company,
        location: locations,
        team: null,
        description: plain(r.contents),
        source: "themuse",
        postedAt: str(r.publication_date),
      });
      if (out.length >= limit) break;
    }
    return out;
  },
};

const jobicy: Provider = {
  name: "jobicy",
  async fetchJobs(query, limit) {
    const data = await getJson(`https://jobicy.com/api/v2/remote-jobs?count=${Math.min(limit * 2, 50)}`);
    const rows = (data as { jobs?: Record<string, unknown>[] })?.jobs ?? [];
    const out: AggregatedJob[] = [];
    for (const r of rows) {
      const title = str(r.jobTitle);
      const url = str(r.url);
      const company = str(r.companyName);
      if (!title || !url || !company) continue;
      if (!matches(query, title, company, str(r.jobExcerpt))) continue;
      out.push({
        id: `jobicy:${r.id ?? url}`,
        title,
        url,
        company,
        location: str(r.jobGeo),
        team: Array.isArray(r.jobIndustry) ? String(r.jobIndustry[0]) : str(r.jobIndustry),
        description: plain(r.jobExcerpt ?? r.jobDescription),
        source: "jobicy",
        postedAt: str(r.pubDate),
      });
      if (out.length >= limit) break;
    }
    return out;
  },
};

/**
 * Hacker News "Ask HN: Who is hiring?".
 *
 * The best free source of seed-stage and founding roles anywhere: founders post
 * their own openings, monthly, with equity and comp stated in plain text. Those
 * jobs rarely reach a conventional aggregator, which is exactly the gap our
 * dream-JD hunt kept hitting.
 *
 * Each top-level comment is one posting. The convention is
 * "Company | Role | Location | Comp | URL", loosely followed, so parse
 * defensively and keep the whole comment as the description, which is richer
 * than most job boards provide.
 */
const hnWhoIsHiring: Provider = {
  name: "hn-whoishiring",
  async fetchJobs(query, limit) {
    const search = (await getJson(
      "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&query=hiring&hitsPerPage=1"
    )) as { hits?: { objectID?: string; title?: string }[] } | null;

    const threadId = search?.hits?.find((h) => /who is hiring/i.test(h.title ?? ""))?.objectID;
    if (!threadId) return [];

    const thread = (await getJson(`https://hn.algolia.com/api/v1/items/${threadId}`)) as {
      children?: { id?: number; author?: string; text?: string }[];
    } | null;

    const out: AggregatedJob[] = [];
    for (const c of thread?.children ?? []) {
      if (!c.text) continue;

      const text = c.text
        .replace(/<p>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&#x2F;/g, "/")
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (text.length < 40) continue;

      const headline = text.split("\n")[0].trim();
      const parts = headline
        .split(/\s*[|•]\s*|\s+[-–—]\s+/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) continue;

      const company = parts[0].replace(/\s*\([^)]*\)\s*$/, "").slice(0, 60);
      if (!company || company.length < 2) continue;

      // The role is whichever segment names a job, else the next segment along.
      const ROLE =
        /(engineer|developer|scientist|designer|manager|founding|lead|architect|analyst|researcher|devops|sre|full[- ]?stack|frontend|backend|product|ops|marketer|sales|intern)/i;
      const title = (parts.slice(1).find((p) => ROLE.test(p)) ?? parts[1] ?? "Open role").slice(0, 90);

      const remote = /\bremote\b/i.test(headline);
      const location =
        parts.slice(1).find((p) => /remote|onsite|hybrid|,\s*[A-Z]{2}\b|USA|US only|Europe|UK|SF|NYC|London|Berlin/i.test(p)) ??
        (remote ? "Remote" : null);

      const link = text.match(/https?:\/\/[^\s)"']+/)?.[0] ?? null;

      if (!matches(query, title, company, text)) continue;

      out.push({
        id: `hn:${c.id ?? `${company}-${title}`}`,
        title,
        url: link ?? `https://news.ycombinator.com/item?id=${c.id}`,
        company,
        location,
        team: null,
        // The full comment is the job description, and a good one.
        description: text.slice(0, 2500),
        source: "hn-whoishiring",
        postedAt: null,
      });
      if (out.length >= limit) break;
    }
    return out;
  },
};

/** RemoteOK: startup-heavy, free, no key. */
const remoteok: Provider = {
  name: "remoteok",
  async fetchJobs(query, limit) {
    const data = await getJson("https://remoteok.com/api");
    const rows = Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
    const out: AggregatedJob[] = [];
    for (const r of rows) {
      // The first element is a legal notice, not a job.
      const title = str(r.position);
      const company = str(r.company);
      const url = str(r.url) ?? str(r.apply_url);
      if (!title || !company || !url) continue;
      if (!matches(query, title, company, str(r.description))) continue;
      out.push({
        id: `remoteok:${r.id ?? url}`,
        title,
        url,
        company,
        location: str(r.location) ?? "Remote",
        team: Array.isArray(r.tags) ? String(r.tags[0]) : null,
        description: plain(r.description),
        source: "remoteok",
        postedAt: str(r.date),
      });
      if (out.length >= limit) break;
    }
    return out;
  },
};

/** Adzuna: broad, non-remote-biased, and free at about 1,000 calls a month. */
const adzuna: Provider = {
  name: "adzuna",
  needsKey: true,
  async fetchJobs(query, limit) {
    const id = process.env.ADZUNA_APP_ID;
    const key = process.env.ADZUNA_APP_KEY;
    if (!id || !key) return [];
    const params = new URLSearchParams({
      app_id: id,
      app_key: key,
      results_per_page: String(Math.min(limit, 50)),
      "content-type": "application/json",
    });
    if (query.trim()) params.set("what", query);
    const data = await getJson(`https://api.adzuna.com/v1/api/jobs/us/search/1?${params}`);
    const rows = (data as { results?: Record<string, unknown>[] })?.results ?? [];
    return rows
      .map((r): AggregatedJob | null => {
        const title = str(r.title);
        const url = str(r.redirect_url);
        const company = str((r.company as { display_name?: string } | undefined)?.display_name);
        if (!title || !url || !company) return null;
        return {
          id: `adzuna:${r.id ?? url}`,
          title,
          url,
          company,
          location: str((r.location as { display_name?: string } | undefined)?.display_name),
          team: str((r.category as { label?: string } | undefined)?.label),
          description: plain(r.description),
          source: "adzuna",
          postedAt: str(r.created),
        };
      })
      .filter((j): j is AggregatedJob => j !== null);
  },
};

/** TheirStack: the widest coverage, including most ATS platforms. Paid. */
const theirstack: Provider = {
  name: "theirstack",
  needsKey: true,
  async fetchJobs(query, limit) {
    const key = process.env.THEIRSTACK_API_KEY;
    if (!key) return [];
    const data = await getJson("https://api.theirstack.com/v1/jobs/search", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        page: 0,
        limit: Math.min(limit, 50),
        posted_at_max_age_days: 30,
        ...(query.trim() ? { job_title_or: [query] } : {}),
      }),
    });
    const rows = (data as { data?: Record<string, unknown>[] })?.data ?? [];
    return rows
      .map((r): AggregatedJob | null => {
        const title = str(r.job_title);
        const url = str(r.url) ?? str(r.final_url);
        const company = str(r.company) ?? str(r.company_name);
        if (!title || !url || !company) return null;
        return {
          id: `theirstack:${r.id ?? url}`,
          title,
          url,
          company,
          location: str(r.location),
          team: null,
          description: plain(r.description),
          source: "theirstack",
          postedAt: str(r.date_posted),
        };
      })
      .filter((j): j is AggregatedJob => j !== null);
  },
};

const PROVIDERS: Provider[] = [
  // Seed-stage first: these carry the founding roles the big boards never see.
  hnWhoIsHiring,
  remoteok,
  arbeitnow,
  remotive,
  themuse,
  jobicy,
  adzuna,
  theirstack,
];

/** Which providers are usable right now, given the keys present. */
export function activeProviders(): string[] {
  return PROVIDERS.filter(
    (p) =>
      !p.needsKey ||
      (p.name === "adzuna" && process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) ||
      (p.name === "theirstack" && process.env.THEIRSTACK_API_KEY)
  ).map((p) => p.name);
}

/**
 * Search every available aggregator at once and merge the results. A provider
 * that is slow, down, or unkeyed simply contributes nothing.
 */
export async function searchAggregators(query: string, limit = 40): Promise<AggregatedJob[]> {
  const results = await Promise.all(
    PROVIDERS.map(async (p) => {
      try {
        return await p.fetchJobs(query, limit);
      } catch {
        return [];
      }
    })
  );

  // The same role often appears on several boards, so dedupe on company+title.
  const seen = new Set<string>();
  const merged: AggregatedJob[] = [];
  for (const job of results.flat()) {
    const key = `${job.company.toLowerCase()}|${job.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(job);
  }

  // Some providers search fuzzily, so "founding engineer" came back with a
  // sales role on top. Rank by how well the TITLE actually matches, and drop
  // anything that matches nowhere, rather than trusting each provider's idea
  // of relevance.
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (terms.length === 0) {
    merged.sort((a, b) => (b.postedAt ?? "").localeCompare(a.postedAt ?? ""));
    return merged.slice(0, limit);
  }

  const score = (job: AggregatedJob): number => {
    const title = job.title.toLowerCase();
    const rest = `${job.company} ${job.location ?? ""} ${job.team ?? ""} ${job.description ?? ""}`.toLowerCase();
    let n = 0;
    for (const t of terms) {
      if (title.includes(t)) n += 10;
      else if (rest.includes(t)) n += 1;
    }
    // Reward a title that contains the whole phrase, not just the words.
    if (title.includes(query.toLowerCase())) n += 15;
    return n;
  };

  return merged
    .map((job) => ({ job, relevance: score(job) }))
    .filter((x) => x.relevance > 0)
    .sort((a, b) =>
      b.relevance !== a.relevance
        ? b.relevance - a.relevance
        : (b.job.postedAt ?? "").localeCompare(a.job.postedAt ?? "")
    )
    .slice(0, limit)
    .map((x) => x.job);
}

/** Roles at one named company, as seen by the aggregators. */
export async function findCompanyJobs(company: string, limit = 40): Promise<AggregatedJob[]> {
  const jobs = await searchAggregators(company, limit * 2);
  const needle = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return jobs
    .filter((j) => j.company.toLowerCase().replace(/[^a-z0-9]/g, "").includes(needle))
    .slice(0, limit);
}
