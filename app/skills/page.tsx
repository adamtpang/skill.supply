import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CircleHelp } from "lucide-react";
import { fetchSkillMarket } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Skill Market Cap",
  description:
    "See which skills appear most often across live roles at high-potential companies, then turn your own evidence into a way in.",
  alternates: { canonical: "/skills" },
};

export default async function SkillsPage() {
  const market = await fetchSkillMarket();
  const coverage =
    market.rolesScanned === 0 ? 0 : Math.round((market.rolesClassified / market.rolesScanned) * 100);
  const refreshed = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(market.asOf));

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
            href="/companies"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Companies
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
            Skill Market Cap, now inside skill.supply
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tighter text-balance sm:text-4xl">
            See what the market is asking for
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            A live demand snapshot built from the actual roles published by the high-potential
            companies in our transfer market. Use it to choose what to prove, not what course to
            buy.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          <Metric label="Roles scanned" value={market.rolesScanned.toLocaleString()} />
          <Metric label="Companies live" value={market.companiesScanned.toLocaleString()} />
          <Metric label="Skill markets" value={market.signals.length.toLocaleString()} />
          <Metric label="Roles classified" value={`${coverage}%`} />
        </section>

        <section className="mt-8" aria-labelledby="rankings-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Live rankings
              </p>
              <h2 id="rankings-title" className="mt-1 text-xl font-semibold tracking-tight">
                Skills by explicit hiring demand
              </h2>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">Refreshed {refreshed}</p>
          </div>

          {market.signals.length > 0 ? (
            <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {market.signals.map((skill, index) => (
                <li key={skill.slug} className="grid gap-4 p-4 sm:grid-cols-[2rem_1fr_9rem] sm:p-5">
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <h3 className="font-semibold tracking-tight">{skill.name}</h3>
                      <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                        {skill.category}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {skill.matchingRoles.toLocaleString()} matching roles across{" "}
                      {skill.companiesHiring} {skill.companiesHiring === 1 ? "company" : "companies"}
                    </p>
                    {skill.examples.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {skill.examples.map((job) => (
                          <a
                            key={`${job.company}:${job.url}`}
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-full items-center gap-1 truncate rounded text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <span className="truncate">
                              {job.title} at {job.company}
                            </span>
                            <ArrowUpRight className="size-3 shrink-0" aria-hidden />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <p className="font-mono text-xl font-semibold tabular-nums text-brand">
                      {skill.demandScore}
                    </p>
                    <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                      Demand score
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${skill.demandScore}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                      {skill.shareOfRoles}% of roles
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border border-border bg-muted/40 p-5 text-sm leading-relaxed text-muted-foreground">
              The public job boards did not answer this refresh. The rankings will return when the
              source boards do.
            </p>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
          <div className="flex gap-3">
            <CircleHelp className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold">How the score works</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                We classify functional demand from public job titles and teams. For named technical
                stacks such as Python and TypeScript, we also scan requirements, but only on
                technical roles. A role can count toward more than one skill, so shares can overlap.
                The most-mentioned skill scores 100 and the rest are indexed against it. This is a
                directional sample, not the whole labor market.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We do not show salary or 7-day trends yet. Those require source-backed compensation
                data and stored daily snapshots. Invented precision would be worse than no number.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Your market cap
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              Demand only matters when you can prove the skill.
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Paste your background. The agent finds the intersection between what the market needs
              and what your work already demonstrates.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Find my market fit
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · the transfer market for human talent
          capital. Candidates never pay.
        </p>
      </footer>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-brand">{value}</p>
    </div>
  );
}
