/**
 * Roles pulled off careers pages that expose no API.
 *
 * Around sixty of the largest employers run their own careers site with no
 * third-party board behind it. Their jobs are public but only exist as rendered
 * HTML, so scripts/render-jobs.mjs reads them ahead of time and commits the
 * result. That keeps the live site fast and free: no crawler runs at request
 * time, and there is no crawler key in production.
 *
 * The tradeoff is freshness. This data is a snapshot, so it is served last,
 * after every live API source, and carries the date it was captured.
 */
import rendered from "../scripts/rendered-jobs.json";
import type { Job } from "./jobs";

type RenderedCompany = {
  name: string;
  careersUrl: string;
  renderedAt: string;
  jobs: { title: string; url: string; location: string | null; team: string | null }[];
};

const BY_KEY: Map<string, RenderedCompany> = (() => {
  const map = new Map<string, RenderedCompany>();
  const companies = (rendered as { companies?: Record<string, RenderedCompany> }).companies ?? {};
  for (const company of Object.values(companies)) {
    if (!company?.name || !company.jobs?.length) continue;
    map.set(normalize(company.name), company);
  }
  return map;
})();

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export type RenderedResult = { name: string; careersUrl: string; capturedAt: string; jobs: Job[] };

/** Look up pre-rendered roles for a company. Null when we have none. */
export function findRendered(input: string): RenderedResult | null {
  const company = BY_KEY.get(normalize(input));
  if (!company) return null;

  return {
    name: company.name,
    careersUrl: company.careersUrl,
    capturedAt: company.renderedAt,
    jobs: company.jobs.map((j, i) => ({
      id: `${j.url}#${i}`,
      title: j.title,
      url: j.url,
      location: j.location,
      team: j.team,
      description: null,
    })),
  };
}

/** How many companies we hold rendered roles for. */
export function renderedCompanyCount(): number {
  return BY_KEY.size;
}
