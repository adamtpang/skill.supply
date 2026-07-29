/**
 * Adapters for employers that run their own applicant system instead of a
 * third-party ATS. Crawler discovery cannot help here: there is no Greenhouse or
 * Workday URL to find. But several of these still serve a public JSON endpoint
 * that their own careers page calls, which is all we need.
 *
 * Each adapter is hand-verified against the live endpoint before being added.
 */
import type { Job } from "./jobs";

export type ProprietaryBoard = { name: string; fetchJobs: (limit: number) => Promise<Job[]> };

const UA = "skill.supply";

/** Amazon publishes search.json, the same endpoint amazon.jobs itself calls. */
async function fetchAmazon(limit: number): Promise<Job[]> {
  try {
    const res = await fetch(
      `https://www.amazon.jobs/en/search.json?result_limit=${Math.min(limit, 100)}&sort=recent`,
      { headers: { "user-agent": UA, accept: "application/json" }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { jobs?: Record<string, unknown>[] };
    const out: Job[] = [];

    for (const j of data.jobs ?? []) {
      const title = typeof j.title === "string" ? j.title.trim() : null;
      const path = typeof j.job_path === "string" ? j.job_path : null;
      if (!title || !path) continue;

      const description =
        [j.description, j.basic_qualifications]
          .filter((v): v is string => typeof v === "string")
          .join(" ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim() || null;

      out.push({
        id: path,
        title,
        url: `https://www.amazon.jobs${path}`,
        location: typeof j.location === "string" ? j.location : null,
        team: typeof j.business_category === "string" ? j.business_category : null,
        description,
      });
    }

    return out;
  } catch {
    return [];
  }
}

export const PROPRIETARY_BOARDS: Record<string, ProprietaryBoard> = {
  amazon: { name: "Amazon", fetchJobs: fetchAmazon },
  amazoncom: { name: "Amazon", fetchJobs: fetchAmazon },
};

export function findProprietary(input: string): ProprietaryBoard | null {
  return PROPRIETARY_BOARDS[input.toLowerCase().replace(/[^a-z0-9]/g, "")] ?? null;
}
