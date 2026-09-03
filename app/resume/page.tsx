import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResumeImprover } from "@/components/resume-improver";
import { fetchSkillMarket } from "@/lib/skills";

export const metadata: Metadata = {
  title: "Free Resume Improver",
  description:
    "Score your resume from 0 to 100, see the evidence behind every point, and improve one truthful change at a time against current hiring demand.",
  alternates: { canonical: "/resume" },
};

export default async function ResumePage() {
  const market = await fetchSkillMarket();
  const signals = market.signals.map(
    ({ slug, name, demandScore, matchingRoles, companiesHiring }) => ({
      slug,
      name,
      demandScore,
      matchingRoles,
      companiesHiring,
    })
  );

  return (
    <div className="legible-text-surface mobile-touch-surface mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <Link
          href="/center"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Career Center
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-brand uppercase">
            Free resume improver
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
            Make every point earn its place.
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Get a 0 to 100 evidence score, see exactly what cost you points, fix the highest-leverage
            issue, and rescan. Current public job postings shape the market layer. Your claims remain
            yours.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-muted-foreground">
            <span>7 independent scorecards</span>
            <span>Evidence for every check</span>
            <span>No invented achievements</span>
          </div>
        </section>

        <ResumeImprover
          market={{
            asOf: market.asOf,
            companiesScanned: market.companiesScanned,
            rolesScanned: market.rolesScanned,
            signals,
          }}
        />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · free for candidates. Resume drafts stay
          on this device.
        </p>
      </footer>
    </div>
  );
}
