import type {
  CompanyShots,
  DaysToHireObservation,
  Observation,
  OpenPostingsCount,
  PostingOpenObservation,
  ResponseTimeObservation,
} from "../data/shots/types";

export const LOW_CONFIDENCE_BELOW = 10;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DASH = /[\u2013\u2014]/;

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Whole UTC days from the first posted date to the retrieval date. */
export function daysOpen(firstPosted: string, retrieved: string): number {
  if (!isIsoDate(firstPosted) || !isIsoDate(retrieved)) {
    throw new Error(`Invalid posting dates: ${firstPosted} to ${retrieved}`);
  }
  const start = Date.parse(`${firstPosted}T00:00:00Z`);
  const end = Date.parse(`${retrieved}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

export function isLowConfidence(n: number | null): boolean {
  return n !== null && n < LOW_CONFIDENCE_BELOW;
}

export function formatN(n: number | null): string {
  if (n === null) return "n unknown";
  return `n ${n.toLocaleString("en-US")}`;
}

export function formatLocation(location: string | null): string {
  return location ?? "location unknown";
}

export function isResponse(obs: Observation): obs is ResponseTimeObservation {
  return obs.metric === "response_time_distribution";
}

export function isDaysToHire(obs: Observation): obs is DaysToHireObservation {
  return obs.metric === "days_to_hire";
}

export function isPosting(obs: Observation): obs is PostingOpenObservation {
  return obs.metric === "posting_open_since";
}

/** Roles a person can filter to. "All roles" stays the company-wide reference, not a filter row. */
export function roleOptions(company: CompanyShots): string[] {
  const roles = new Set<string>();
  for (const obs of company.observations) {
    if (obs.role !== "All roles") roles.add(obs.role);
  }
  return [...roles].sort((a, b) => a.localeCompare(b, "en"));
}

export function observationsForRole(company: CompanyShots, role: string): Observation[] {
  if (role === "all") return [...company.observations];
  return company.observations.filter((obs) => obs.role === role);
}

export function companyWideHire(company: CompanyShots): DaysToHireObservation[] {
  return company.observations.filter(
    (obs): obs is DaysToHireObservation => isDaysToHire(obs) && obs.role === "All roles",
  );
}

export function assertCompanyShots(companies: readonly CompanyShots[]): void {
  const slugs = new Set<string>();
  for (const company of companies) {
    walkStrings(company, company.slug);
    if (!company.name.trim() || !company.slug.trim()) {
      throw new Error("Company name and slug are required");
    }
    if (slugs.has(company.slug)) throw new Error(`Duplicate shots slug ${company.slug}`);
    slugs.add(company.slug);
    if (!company.board.url.startsWith("https://")) {
      throw new Error(`${company.slug} board url must be https`);
    }

    const ids = new Set<string>();
    for (const obs of company.observations) {
      if (ids.has(obs.id)) throw new Error(`Duplicate observation ${company.slug}/${obs.id}`);
      ids.add(obs.id);
      assertSourced(company.slug, obs);
      if (obs.metric === "response_time_distribution") {
        if (!obs.reportedAs.trim() || obs.buckets.length === 0) {
          throw new Error(`${obs.id} needs a reported label and at least one bucket`);
        }
        for (const bucket of obs.buckets) {
          if (!bucket.label.trim() || !Number.isFinite(bucket.percent) || bucket.percent < 0) {
            throw new Error(`${obs.id} has a bucket that is not a published percent`);
          }
        }
      }
      if (obs.metric === "days_to_hire") {
        if (!Number.isFinite(obs.days) || obs.days < 0) {
          throw new Error(`${obs.id} has a days to hire value that is not a number`);
        }
      }
      if (obs.metric === "posting_open_since") {
        if (!obs.postingUrl.startsWith("https://")) {
          throw new Error(`${obs.id} posting url must be https`);
        }
        if (daysOpen(obs.firstPosted, obs.retrieved) < 0) {
          throw new Error(`${obs.id} was retrieved before its first posted date`);
        }
      }
    }

    for (const count of company.openPostings) {
      if (ids.has(count.id)) throw new Error(`Duplicate id ${company.slug}/${count.id}`);
      ids.add(count.id);
      assertSourced(company.slug, count);
      if (!Number.isInteger(count.count) || count.count < 0) {
        throw new Error(`${count.id} count must be a non-negative integer`);
      }
    }
  }
}

function assertSourced(
  slug: string,
  row: { id: string; sourceName: string; sourceUrl: string; retrieved: string },
): void {
  if (!row.sourceName.trim()) throw new Error(`${slug}/${row.id} is missing a source name`);
  if (!row.sourceUrl.startsWith("https://")) {
    throw new Error(`${slug}/${row.id} source url must be https`);
  }
  if (!isIsoDate(row.retrieved)) throw new Error(`${slug}/${row.id} retrieved date is invalid`);
}

function walkStrings(value: unknown, path: string): void {
  if (typeof value === "string") {
    if (DASH.test(value)) throw new Error(`Em or en dash in ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      walkStrings(nested, `${path}.${key}`);
    }
  }
}

export function openPostingPairs(counts: readonly OpenPostingsCount[]): {
  location: OpenPostingsCount;
  companyWide: OpenPostingsCount;
} | null {
  const locations = counts.filter((count) => count.location !== null);
  const wides = counts.filter((count) => count.location === null);
  if (locations.length !== 1 || wides.length !== 1) return null;
  const location = locations[0];
  const companyWide = wides[0];
  if (
    location.sourceUrl !== companyWide.sourceUrl ||
    location.retrieved !== companyWide.retrieved
  ) {
    return null;
  }
  return { location, companyWide };
}
