/**
 * Funding momentum: the private-company analog of a public "market cap gain"
 * column. Most companies worth targeting right now (Anthropic, Cursor, Base
 * Power, Saronic) are private, so a stock-ticker gainers list never covers
 * them. This computes growth from hand-verified, dated funding rounds
 * instead, same honesty discipline as lib/companies.ts: round and hedge,
 * never invent a number a source didn't state.
 *
 * A company with fewer than two valued rounds gets no multiple, only a
 * one-line basis explaining why, rather than a fabricated score.
 */
import type { Company, FundingRound } from "./companies";

export type Momentum = {
  slug: string;
  totalRaisedUsd: number;
  latestRound: FundingRound;
  /** Valuation multiple between the earliest and latest disclosed valuation. */
  multiple?: number;
  months?: number;
  /** Multiple normalized to a 12-month window, so different time spans compare fairly. */
  annualizedMultiple?: number;
  basis: string;
};

function monthsBetween(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(1, months);
}

export function formatUsd(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
  return `$${amount.toLocaleString()}`;
}

export function computeMomentum(company: Company): Momentum | null {
  const rounds = company.funding_rounds;
  if (!rounds || rounds.length === 0) return null;

  const sorted = [...rounds].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const totalRaisedUsd = sorted.reduce((sum, r) => sum + (r.amount_usd ?? 0), 0);
  const latestRound = sorted[sorted.length - 1];
  const valued = sorted.filter((r): r is FundingRound & { valuation_usd: number } => r.valuation_usd != null);

  if (valued.length < 2) {
    return {
      slug: company.slug,
      totalRaisedUsd,
      latestRound,
      basis: latestRound.amount_usd
        ? `Raised ${formatUsd(latestRound.amount_usd)} in its ${latestRound.round} (${latestRound.date}); no earlier disclosed valuation to compare against, so no growth multiple.`
        : `${latestRound.round} (${latestRound.date}) disclosed a valuation but no earlier round to compare it against.`,
    };
  }

  const first = valued[0];
  const last = valued[valued.length - 1];
  const months = monthsBetween(first.date, last.date);
  const multiple = last.valuation_usd / first.valuation_usd;
  const annualizedMultiple = multiple ** (12 / months);

  return {
    slug: company.slug,
    totalRaisedUsd,
    latestRound,
    multiple,
    months,
    annualizedMultiple,
    basis: `Valuation went from ${formatUsd(first.valuation_usd)} (${first.date}) to ${formatUsd(last.valuation_usd)} (${last.date}): ${multiple.toFixed(2)}x in ${months} months.`,
  };
}

/** Companies with real funding history, ranked fastest-growing first. Silent on the rest. */
export function rankByMomentum(companies: Company[]): { company: Company; momentum: Momentum }[] {
  return companies
    .map((company) => {
      const momentum = computeMomentum(company);
      return momentum ? { company, momentum } : null;
    })
    .filter((x): x is { company: Company; momentum: Momentum } => x !== null)
    .sort((a, b) => (b.momentum.annualizedMultiple ?? 0) - (a.momentum.annualizedMultiple ?? 0));
}
