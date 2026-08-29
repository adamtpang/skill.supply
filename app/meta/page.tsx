import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import {
  MARKET_AS_OF,
  HEADLINE,
  STATS,
  SECTORS,
  RISING,
  PLAYS,
  SOURCES,
  TIER_LABEL,
  type Tier,
} from "@/lib/market";

export const metadata: Metadata = {
  title: "The job market meta",
  description:
    "A tier list of the job market as of June 2026: which sectors are actually hiring, what the numbers mean for a job seeker, and the one signal that is still rising.",
};

const TIER_STYLE: Record<Tier, string> = {
  S: "bg-brand text-brand-foreground",
  A: "bg-foreground text-background",
  B: "bg-muted text-foreground",
  C: "bg-muted text-muted-foreground",
  D: "bg-destructive/10 text-destructive",
};

export default function MetaPage() {
  const maxIndex = Math.max(...SECTORS.map((s) => s.index));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Companies
        </Link>
      </header>

      <main className="flex-1 pb-16">
        {/* Verdict */}
        <section className="pt-12 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            The meta · {MARKET_AS_OF}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
            {HEADLINE.verdict}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-balance text-muted-foreground">
            {HEADLINE.line}
          </p>
        </section>

        {/* Numbers */}
        <section className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-card p-4">
              <p className="font-mono text-2xl font-medium tracking-tight tabular-nums text-brand">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium">{s.label}</p>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </section>

        {/* Tier list */}
        <section className="mt-12">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Sector tier list
          </h2>
          <p className="mt-2 mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Job postings by sector, indexed so that 100 equals February 2020. About half of all
            sectors are still below that line.
          </p>

          <ul className="space-y-2">
            {SECTORS.map((s) => (
              <li
                key={s.name}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-4"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold ${TIER_STYLE[s.tier]}`}
                  title={TIER_LABEL[s.tier]}
                >
                  {s.tier}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{s.name}</span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {s.read}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className={`block font-mono text-lg tabular-nums ${s.index >= 100 ? "text-brand" : "text-destructive"}`}
                  >
                    {s.index}
                  </span>
                </span>
                <span />
                <span className="col-span-2 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span
                    className={`block h-full rounded-full ${s.index >= 100 ? "bg-brand" : "bg-destructive/60"}`}
                    style={{ width: `${(s.index / maxIndex) * 100}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* The rising line */}
        <section className="mt-8 rounded-xl border border-brand/30 border-l-2 border-l-brand bg-card p-5 sm:p-6">
          <p className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.14em] text-brand uppercase">
            <TrendingUp className="size-3.5" aria-hidden />
            The one line still going up
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-4xl font-medium tracking-tight tabular-nums text-brand">
              {RISING.value}
            </span>
            <span className="text-base font-medium">{RISING.label}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{RISING.note}</p>
        </section>

        {/* How to play it */}
        <section className="mt-12">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            How to play this meta
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {PLAYS.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="mb-1.5 text-sm font-semibold text-balance">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom line */}
        <section className="mt-8 rounded-xl bg-muted/40 p-5 sm:p-6">
          <p className="text-[0.95rem] leading-relaxed">
            <span className="font-semibold">The bottom line.</span> In a frozen market, the winning
            move is not more applications, it is more proof per application. One opening per seeker
            means you are not competing on volume, you are competing on whether a specific person
            believes you will solve a specific problem.
          </p>
          <Link
            href="/companies"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Find the companies actually hiring
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </section>

        {/* Sources */}
        <section className="mt-10 border-t border-border pt-6">
          <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Sources
          </h2>
          <ul className="mt-3 space-y-1.5">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-baseline gap-1 rounded text-sm text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {s.name}
                  <ArrowUpRight className="size-3 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Figures as of {MARKET_AS_OF} and rounded. Labor data is revised often, so treat these as
            directional and check the source before quoting a number.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · get any job with career AI agent
          helpers.
        </p>
      </footer>
    </div>
  );
}
