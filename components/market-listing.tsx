import { MARKET_AS_OF, RISING, SOURCES } from "@/lib/market";

// The hero's anchor: a person shown as a market listing, companies as buyers.
// The demand signal is the real, sourced Indeed figure from lib/market.ts. The
// person and the buyer rows are an illustrative example and say so.
const PRIOR_PEAK = { value: 3.3, label: "2022 peak" };
const NOW = { value: Number.parseFloat(RISING.value), label: MARKET_AS_OF };

const EXAMPLE_BUYERS: Array<[string, number]> = [
  ["Fintech infra, Series A", 86],
  ["Payments API startup", 81],
  ["Vertical SaaS, ops-heavy", 77],
];

export function MarketListing() {
  const scale = Math.max(PRIOR_PEAK.value, NOW.value);
  return (
    <figure
      aria-label="Example: a person shown as a market listing"
      className="rounded-2xl border border-border bg-card p-5 shadow-[0_30px_60px_-30px_rgba(13,15,26,0.25)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
            Supply &middot; operator-engineer
          </p>
          <p className="mt-2 font-heading text-2xl leading-tight font-bold tracking-tight">
            Payments, Python, early-stage ops
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-3xl leading-none font-bold text-positive">{RISING.value}</p>
          <p className="mt-1 font-mono text-xs whitespace-nowrap text-muted-foreground">postings mention AI</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 font-mono text-xs text-muted-foreground">
        {[PRIOR_PEAK, NOW].map((point) => (
          <div key={point.label} className="contents">
            <span className="w-20">{point.label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-muted">
              <span
                className={`block h-full rounded-full ${point === NOW ? "bg-positive" : "bg-muted-foreground/40"}`}
                style={{ width: `${(point.value / scale) * 100}%` }}
              />
            </span>
            <span className="w-10 text-right">{point.value}%</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Share of US job postings mentioning AI, an all-time high.{" "}
        <a
          href={SOURCES[0].url}
          target="_blank"
          rel="noreferrer"
          className="rounded underline underline-offset-2 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Indeed Hiring Lab
        </a>
      </p>

      <div className="mt-5 border-t border-border">
        {EXAMPLE_BUYERS.map(([buyer, fit]) => (
          <div
            key={buyer}
            className="grid grid-cols-[1fr_4rem_2rem] items-center gap-3 border-b border-border py-2.5 text-sm sm:grid-cols-[1fr_7.5rem_2rem]"
          >
            <span className="min-w-0">{buyer}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-brand" style={{ width: `${fit}%` }} />
            </span>
            <span className="text-right font-mono text-xs text-muted-foreground">{fit}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Illustrative example person and buyers. The AI figure is real.
      </figcaption>
    </figure>
  );
}
