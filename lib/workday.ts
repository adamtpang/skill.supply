/**
 * Workday adapter.
 *
 * Most of the world's largest employers run Workday, and their careers pages are
 * JavaScript apps that a plain fetch cannot read. But every Workday tenant also
 * serves a public JSON endpoint (the "cxs" API) that the careers page itself
 * calls. We use that: structured data, no browser, no scraping.
 *
 * The only hard part is discovery, since each tenant has its own subdomain and
 * site slug. Verified tenants live in the map below. Anything not in the map is
 * discovered separately (see scripts/discover-boards.mjs) and added here.
 */
import type { Job } from "./jobs";

export type WorkdayTenant = { tenant: string; wd: string; site: string; name: string };

/** Hand-verified against the live endpoint. Every entry returned real roles. */
export const WORKDAY_TENANTS: Record<string, WorkdayTenant> = {
  nvidia: { tenant: "nvidia", wd: "wd5", site: "NVIDIAExternalCareerSite", name: "NVIDIA" },
  salesforce: { tenant: "salesforce", wd: "wd12", site: "External_Career_Site", name: "Salesforce" },
  adobe: { tenant: "adobe", wd: "wd5", site: "external_experienced", name: "Adobe" },
  mastercard: { tenant: "mastercard", wd: "wd1", site: "CorporateCareers", name: "Mastercard" },
  comcast: { tenant: "comcast", wd: "wd5", site: "Comcast_Careers", name: "Comcast" },
  disney: { tenant: "disney", wd: "wd5", site: "disneycareer", name: "Disney" },
  intel: { tenant: "intel", wd: "wd1", site: "External", name: "Intel" },
  pfizer: { tenant: "pfizer", wd: "wd1", site: "PfizerCareers", name: "Pfizer" },
  broadcom: { tenant: "broadcom", wd: "wd1", site: "External_Career", name: "Broadcom" },
  // Discovered by crawling careers pages, then verified against the live API.
  samsung: { tenant: "sec", wd: "wd3", site: "Samsung_Careers", name: "Samsung" },
  visa: { tenant: "visa", wd: "wd5", site: "Visa", name: "Visa" },
  caterpillar: { tenant: "cat", wd: "wd5", site: "CaterpillarCareers", name: "Caterpillar" },
  roche: { tenant: "roche", wd: "wd3", site: "roche-ext", name: "Roche" },
  homedepot: { tenant: "homedepot", wd: "wd5", site: "CareerDepot", name: "Home Depot" },
  merck: { tenant: "msd", wd: "wd5", site: "SearchJobs", name: "Merck" },
  rtx: { tenant: "globalhr", wd: "wd5", site: "REC_RTX_Ext_Gateway", name: "RTX" },
  amgen: { tenant: "amgen", wd: "wd1", site: "Careers", name: "Amgen" },
  santander: { tenant: "santander", wd: "wd3", site: "SantanderCareers", name: "Santander" },
};

const PAGE_SIZE = 20;

function jobUrl(t: WorkdayTenant, externalPath: string): string {
  return `https://${t.tenant}.${t.wd}.myworkdayjobs.com/en-US/${t.site}${externalPath}`;
}

/** Look up a verified tenant by a loose company name. */
export function findTenant(input: string): WorkdayTenant | null {
  const key = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  return WORKDAY_TENANTS[key] ?? null;
}

/** List live roles for a Workday tenant. Titles and locations, no descriptions. */
export async function fetchWorkdayJobs(t: WorkdayTenant, limit = 60): Promise<Job[]> {
  const jobs: Job[] = [];

  for (let offset = 0; offset < limit; offset += PAGE_SIZE) {
    let page: unknown;
    try {
      const res = await fetch(
        `https://${t.tenant}.${t.wd}.myworkdayjobs.com/wday/cxs/${t.tenant}/${t.site}/jobs`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "user-agent": "skill.supply" },
          body: JSON.stringify({ appliedFacets: {}, limit: PAGE_SIZE, offset, searchText: "" }),
          next: { revalidate: 3600 },
        }
      );
      if (!res.ok) break;
      page = await res.json();
    } catch {
      break;
    }

    const postings = (page as { jobPostings?: Record<string, unknown>[] })?.jobPostings ?? [];
    if (postings.length === 0) break;

    for (const p of postings) {
      const title = typeof p.title === "string" ? p.title.trim() : null;
      const path = typeof p.externalPath === "string" ? p.externalPath : null;
      if (!title || !path) continue;
      jobs.push({
        id: path,
        title,
        url: jobUrl(t, path),
        location: typeof p.locationsText === "string" ? p.locationsText.trim() : null,
        team: null,
        description: null,
      });
    }

    const total = (page as { total?: number })?.total ?? 0;
    if (jobs.length >= total) break;
  }

  return jobs;
}

/**
 * Workday's list endpoint omits the job description, so fetch it per role. Only
 * call this for the handful of roles actually being scored: it is one request
 * each.
 */
export async function hydrateWorkdayDescriptions(t: WorkdayTenant, jobs: Job[]): Promise<Job[]> {
  return Promise.all(
    jobs.map(async (job) => {
      try {
        const res = await fetch(
          `https://${t.tenant}.${t.wd}.myworkdayjobs.com/wday/cxs/${t.tenant}/${t.site}${job.id}`,
          {
            headers: { "user-agent": "skill.supply", accept: "application/json" },
            next: { revalidate: 86400 },
          }
        );
        if (!res.ok) return job;
        const data = (await res.json()) as {
          jobPostingInfo?: { jobDescription?: string; jobRequisitionLocation?: unknown };
        };
        const html = data?.jobPostingInfo?.jobDescription;
        if (typeof html !== "string") return job;
        const description = html
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;|&#160;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/&quot;|&#34;/gi, '"')
          .replace(/&#39;|&apos;/gi, "'")
          .replace(/\s+/g, " ")
          .trim();
        return { ...job, description };
      } catch {
        return job;
      }
    })
  );
}
