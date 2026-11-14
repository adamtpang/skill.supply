import type {
  CompanyShots,
  DaysToHireObservation,
  Observation,
  OpenPostingsCount,
  PayObservation,
  PayUnit,
  PayValues,
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

export function isPay(obs: Observation): obs is PayObservation {
  return obs.metric === "pay";
}

export function formatPayMoney(value: number, unit: PayUnit): string {
  const amount =
    unit === "hour"
      ? Number.isInteger(value)
        ? value.toFixed(0)
        : value.toFixed(2)
      : value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return unit === "hour" ? `$${amount}/hr` : `$${amount}/yr`;
}

/** Render one pay figure in the source unit. Does not convert hour to year. */
export function formatPayFigure(obs: PayObservation): string {
  if (obs.kind === "unknown" || (obs.kind === "estimate" && !obs.values)) return "Pay: unknown";
  if (obs.kind === "posted" && !obs.values) return "Posted: none listed";
  if (!obs.values) return "Pay: unknown";
  const values = obs.values;
  if (values.average !== null) {
    const bits = [`average ${formatPayMoney(values.average, values.unit)}`];
    if (values.min !== null) bits.push(`low ${formatPayMoney(values.min, values.unit)}`);
    if (values.max !== null) bits.push(`high ${formatPayMoney(values.max, values.unit)}`);
    if (values.median !== null) bits.push(`median ${formatPayMoney(values.median, values.unit)}`);
    return `Estimate: ${bits.join(", ")}`;
  }
  const range = formatPayRange(values);
  const median = values.median === null ? "" : `, median ${formatPayMoney(values.median, values.unit)}`;
  const prefix = obs.kind === "posted" ? "Posted" : "Estimate";
  return range ? `${prefix}: ${range}${median}` : "Pay: unknown";
}

function formatPayRange(values: PayValues): string | null {
  const { min, max, unit } = values;
  if (min !== null && max !== null && min !== max) {
    return `${formatPayMoney(min, unit)} to ${formatPayMoney(max, unit)}`;
  }
  if (min !== null) return formatPayMoney(min, unit);
  if (max !== null) return formatPayMoney(max, unit);
  return null;
}

export function payForRole(company: CompanyShots, role: string): PayObservation[] {
  return company.observations.filter((obs): obs is PayObservation => isPay(obs) && obs.role === role);
}

/** Every role that has any figure, pay data first, then roles whose pay is unknown. */
export function payCardRoles(company: CompanyShots, roleFilter: string): string[] {
  const roles = new Set<string>();
  for (const obs of company.observations) roles.add(obs.role);
  const list = [...roles].filter((role) => roleFilter === "all" || role === roleFilter);
  return list.sort((a, b) => payRank(company, a) - payRank(company, b) || a.localeCompare(b, "en"));
}

function payRank(company: CompanyShots, role: string): number {
  const pays = payForRole(company, role);
  if (pays.length === 0) return 3;
  if (pays.every((obs) => obs.scope === "company")) return 2;
  if (pays.some((obs) => obs.sameLocation && obs.kind === "posted")) return 0;
  return 1;
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
      if (obs.metric === "pay") assertPay(company.slug, obs);
      else assertSourced(company.slug, obs);
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

function assertPay(slug: string, obs: PayObservation): void {
  if (!obs.sourceName.trim()) throw new Error(`${slug}/${obs.id} is missing a source name`);
  if (obs.sourceUrl !== null && !obs.sourceUrl.startsWith("https://")) {
    throw new Error(`${slug}/${obs.id} source url must be https or null`);
  }
  if (!isIsoDate(obs.retrieved)) throw new Error(`${slug}/${obs.id} retrieved date is invalid`);
  if (obs.kind === "unknown" && obs.values !== null) {
    throw new Error(`${slug}/${obs.id} unknown pay must not invent an amount`);
  }
  if (obs.kind === "estimate" && obs.values === null) {
    throw new Error(`${slug}/${obs.id} estimate is missing published amounts`);
  }
  if (!obs.values) return;
  const numbers = [obs.values.min, obs.values.max, obs.values.median, obs.values.average];
  if (!numbers.some((value) => value !== null)) {
    throw new Error(`${slug}/${obs.id} pay values are empty`);
  }
  for (const value of numbers) {
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      throw new Error(`${slug}/${obs.id} has a pay amount that is not a number`);
    }
  }
  if (obs.values.min !== null && obs.values.max !== null && obs.values.min > obs.values.max) {
    throw new Error(`${slug}/${obs.id} pay min is above max`);
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
