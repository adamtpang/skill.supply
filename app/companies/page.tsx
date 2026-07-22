import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { COMPANIES, AS_OF } from "@/lib/companies";
import { fetchJobCounts } from "@/lib/jobs";
import { CompanyCard } from "@/components/company-card";

export const metadata: Metadata = {
  title: "The best companies to work for",
  description:
    "A curated directory of high-potential companies to work for in the age of AI: the problem they solve, the founding team, and the stats. Then an AI agent drafts your way in.",
};

export default async function CompaniesPage() {
  const counts = await fetchJobCounts(COMPANIES.map((c) => c.slug));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between pt-6">
        <a
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Your report
        </a>
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
