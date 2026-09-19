import type { Metadata } from "next";
import { AgentFlow } from "@/components/agent-flow";
import { PlacementStories } from "@/components/placement-stories";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded font-heading text-xl font-extrabold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6 sm:min-w-6"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <nav className="flex items-center justify-end gap-x-4 sm:gap-x-6" aria-label="Main navigation">
          <Link
            href="/companies"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6 sm:min-w-6"
          >
            Companies
          </Link>
          <Link
            href="https://skillmarketcap.com"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6 sm:min-w-6"
          >
            Skill demand
          </Link>
          <Link
            href="/resume"
            className="hidden min-h-11 min-w-11 sm:inline-flex items-center justify-center rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6 sm:min-w-6"
          >
            Resume
          </Link>
        </nav>
      </header>

      <main className="flex-1 pb-16">
        {/* Seekers never pay: LAUNCH.md wins every conflict, ruled by Adam
            2026-08-01. The $69 FoundingOffer that lived here charged seekers
            and is retired; the demand side monetizes on darktalent.tech. */}
        <AgentFlow />
        <div className="mx-auto max-w-3xl">
          <PlacementStories />
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <nav aria-label="All tools" className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/center" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Center
          </Link>
          <Link href="/campaign" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Campaign
          </Link>
          <Link href="/apply" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Apply
          </Link>
          <Link href="/resume" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Resume
          </Link>
          <Link href="https://skillmarketcap.com" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Skills
          </Link>
          <Link href="/companies" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Companies
          </Link>
          <Link href="/dream" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Dream
          </Link>
          <Link href="/meta" className="inline-flex min-h-11 items-center rounded font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-h-6">
            Meta
          </Link>
        </nav>
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · candidates never pay. Career Center data
          stays on this device unless you move it manually.
        </p>
      </footer>
    </div>
  );
}
