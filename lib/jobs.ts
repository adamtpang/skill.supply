/**
 * Live roles, pulled from each company's PUBLIC applicant-tracking board.
 * Greenhouse and Ashby both publish an open job-board API, so this is real
 * inventory with no scraping and no terms-of-service risk. We cache the small
 * normalized result hourly, not the multi-megabyte provider response.
 */

import { unstable_cache } from "next/cache";

export type Job = {
  id: string;
  title: string;
  url: string;
  location: string | null;
  team: string | null;
  /** Plain-text requirements when the public board exposes them. Server-side only today. */
  description?: string | null;
};

type Board = { provider: "greenhouse" | "ashby"; board: string };

/** Verified live boards, keyed by company slug. */
export const BOARDS: Record<string, Board> = {
  anthropic: { provider: "greenhouse", board: "anthropic" },
  cursor: { provider: "ashby", board: "cursor" },
  ramp: { provider: "ashby", board: "ramp" },
  perplexity: { provider: "ashby", board: "perplexity" },
  linear: { provider: "ashby", board: "linear" },
  mercor: { provider: "ashby", board: "mercor" },
  "base-power": { provider: "ashby", board: "base-power" },
  saronic: { provider: "ashby", board: "saronic" },
  apptronik: { provider: "greenhouse", board: "apptronik" },
};

const REVALIDATE = 3600; // an hour is fresh enough for a job board

async function loadJobs(slug: string, includeDescriptions: boolean): Promise<Job[]> {
  const board = BOARDS[slug];
  if (!board) return [];

  const url =
    board.provider === "greenhouse"
      ? `https://boards-api.greenhouse.io/v1/boards/${board.board}/jobs${includeDescriptions ? "?content=true" : ""}`
      : `https://api.ashbyhq.com/posting-api/job-board/${board.board}`;

  try {
    const res = await fetch(url, {
      headers: { "user-agent": "skill.supply" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const raw: unknown[] = Array.isArray(data) ? data : (data?.jobs ?? []);

    return raw
      .map((j) => normalize(j as Record<string, unknown>, board.provider, includeDescriptions))
      .filter((j): j is Job => j !== null);
  } catch {
    // A job board being down should never take the company page with it.
    return [];
  }
}

const fetchCachedJobs = unstable_cache(
  async (slug: string) => loadJobs(slug, false),
  ["public-job-boards-v2"],
  { revalidate: REVALIDATE, tags: ["public-job-boards"] }
);

export async function fetchJobs(slug: string): Promise<Job[]> {
  return fetchCachedJobs(slug);
}

/** Used only inside the cached skill-market aggregation. */
export async function fetchJobsWithDescriptions(slug: string): Promise<Job[]> {
  return loadJobs(slug, true);
}

function normalize(
  j: Record<string, unknown>,
  provider: Board["provider"],
  includeDescriptions: boolean
): Job | null {
  if (provider === "greenhouse") {
    const title = str(j.title);
    const url = str(j.absolute_url);
    if (!title || !url) return null;
    const loc = j.location as { name?: string } | undefined;
    return {
      id: String(j.id ?? url),
      title,
      url,
      location: loc?.name ?? null,
      team: null,
      description: includeDescriptions ? plainText(j.content) : null,
    };
  }

  // Ashby
  if (j.isListed === false) return null;
  const title = str(j.title);
  const url = str(j.jobUrl) ?? str(j.applyUrl);
  if (!title || !url) return null;
  return {
    id: String(j.id ?? url),
    title,
    url,
    location: str(j.location),
    team: str(j.department) ?? str(j.team),
    description: includeDescriptions
      ? plainText(j.descriptionPlain) ?? plainText(j.descriptionHtml)
      : null,
  };
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function plainText(v: unknown): string | null {
  const value = str(v);
  if (!value) return null;
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Open-role counts for the whole directory, fetched in parallel. */
export async function fetchJobCounts(slugs: string[]): Promise<Record<string, number>> {
  const entries = await Promise.all(
    slugs.map(async (slug) => [slug, (await fetchJobs(slug)).length] as const)
  );
  return Object.fromEntries(entries);
}
