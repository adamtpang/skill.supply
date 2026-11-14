import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SHOTS } from "@/data/shots";
import { ShotsBoard } from "@/components/shots/shots-board";

export const metadata: Metadata = {
  title: "Which shots go in",
  description:
    "Where cold applications land: how often people hear back, how fast a process moves, days to hire, and how long postings stay open. Per company and per role, with the source, sample size, and retrieval date on every number.",
  alternates: { canonical: "/shots" },
};

export default function ShotsPage() {
  return (
    <div className="legible-text-surface mobile-touch-surface mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <nav className="flex items-center gap-4" aria-label="Shots navigation">
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
            Home
          </Link>
        </nav>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Shots
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
            Which shots go in
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A cold application is a shot. This page shows where those shots land, and what they pay:
            how often people hear back, how fast a process moves, how many days a hire takes, how
            long a posting stays open, and the posted or estimated pay for each role. Figures are
            per company and per role. Every number keeps its source, its sample size, and the date
            it was retrieved. Missing numbers stay unknown. Nothing here is averaged across sources,
            converted from hourly to annual, or filled in.
          </p>
        </section>

        <ShotsBoard companies={SHOTS} />
      </main>
    </div>
  );
}
