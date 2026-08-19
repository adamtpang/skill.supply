import type { Metadata } from "next";
import { AgentFlow } from "@/components/agent-flow";
import { PlacementStories } from "@/components/placement-stories";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <nav className="flex items-center gap-4" aria-label="Market navigation">
          <Link
            href="/apply"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Apply
          </Link>
          <Link
            href="https://skillmarketcap.com"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Skills
          </Link>
          <Link
            href="/companies"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Companies
          </Link>
          <Link
            href="/dream"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Dream
          </Link>
          <Link
            href="/meta"
            className="rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Meta
          </Link>
        </nav>
      </header>

      <main className="flex-1 pb-16">
        {/* Seekers never pay: LAUNCH.md wins every conflict, ruled by Adam
            2026-08-01. The $69 FoundingOffer that lived here charged seekers
            and is retired; the demand side monetizes on darktalent.tech. */}
        <AgentFlow />
        <PlacementStories />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · no accounts, no database; your data
          stays in your link. Agent runs on Claude.
        </p>
      </footer>
    </div>
  );
}
