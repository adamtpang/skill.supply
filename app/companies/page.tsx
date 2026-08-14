import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { COMPANIES, AS_OF } from "@/lib/companies";
import { OFFICIAL_CAREERS } from "@/lib/careers";
import { fetchJobCounts } from "@/lib/jobs";
import { rankByMomentum, formatUsd } from "@/lib/momentum";
import { CompanyCard } from "@/components/company-card";
import { CompanySearch } from "@/components/company-search";

export const metadata: Metadata = {
  title: "The best companies to work for",
  description:
    "A curated directory of high-potential companies to work for in the age of AI: the problem they solve, the founding team, and the stats. Then an AI agent drafts your way in.",
};

export default async function CompaniesPage() {
  const counts = await fetchJobCounts(COMPANIES.map((c) => c.slug));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const momentum = rankByMomentum(COMPANIES);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <nav className="flex items-center gap-4" aria-label="Market navigation">
          <Link
            href="/skills"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Skills
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Your report
          </Link>
        </nav>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            The directory
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
            The best companies to work for
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            High-potential companies in the age of AI: what they solve, who founded them, and the
            stats. Pick one and an AI agent drafts your honest way in.
          </p>
          {total > 0 && (
            <p className="mt-4 font-mono text-xs tracking-wide text-muted-foreground">
              <span className="text-brand">{total.toLocaleString()}</span> open roles live right now
              across {COMPANIES.length} companies
            </p>
          )}
        </section>

        <section className="mb-10">
          <CompanySearch />
        </section>

        {momentum.length > 0 && (
          <section className="mb-10">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Fastest-growing, by funding velocity
              </h2>
            </div>
            <p className="mb-3 max-w-xl text-xs leading-relaxed text-muted-foreground">
              A public market cap gainers list only covers stock tickers, and the companies worth
              chasing right now are mostly private. This ranks by valuation growth between
              hand-verified, dated funding rounds instead, annualized so different time spans
              compare fairly. A company with only one disclosed valuation gets no rank, not a
              guessed one.
            </p>
            <ol className="overflow-hidden rounded-xl border border-border bg-card">
              {momentum.map(({ company, momentum: m }, i) => (
                <li key={company.slug} className="border-b border-border last:border-b-0">
                  <a
                    href={`/companies/${company.slug}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium">{company.name}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      {m.annualizedMultiple ? (
                        <span className="font-mono text-sm font-semibold text-brand tabular-nums">
                          {m.annualizedMultiple.toFixed(1)}x/yr
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatUsd(m.totalRaisedUsd)} raised
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Official career pages
            </h2>
            <p className="text-xs text-muted-foreground">Workday and proprietary boards</p>
          </div>
          <ul className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-2">
            {OFFICIAL_CAREERS.map((career) => (
              <li key={career.name} className="border-b border-border last:border-b-0 sm:odd:border-r">
                <a
                  href={career.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-sm font-medium outline-none transition-colors hover:bg-muted/50 hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {career.name}
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/skills"
          className="mb-10 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-5 outline-none transition-colors hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="block font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Skill Market Cap
            </span>
            <span className="mt-1 block text-sm font-medium">
              See which skills these companies are hiring for right now.
            </span>
          </span>
          <span className="shrink-0 text-sm font-medium text-brand">View live demand</span>
        </Link>

        <h2 className="mb-4 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Hand-picked
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMPANIES.map((c) => (
            <CompanyCard key={c.slug} company={c} openRoles={counts[c.slug] ?? 0} />
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Curated set, stats hand-verified from public reporting as of {AS_OF}. More companies soon.
        </p>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · get any job with career AI agent
          helpers. No accounts, no database.
        </p>
      </footer>
    </div>
  );
}
