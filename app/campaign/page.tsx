import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SniperCampaignPanel } from "@/components/sniper-campaign-panel";

export const metadata: Metadata = {
  title: "Five-target company campaign",
  description:
    "Turn any five roles, companies, or teams into evidence-backed opportunity dossiers with budget and problem hypotheses, useful work, and manual outreach drafts.",
  alternates: { canonical: "/campaign" },
};

export default function CampaignPage() {
  return (
    <div className="legible-text-surface mobile-touch-surface mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between gap-4 pt-6">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <Link
          href="/dream"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Define the target
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Sniper campaign
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tighter text-balance sm:text-5xl">
            Five companies. Real use. Useful ways in.
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Start with a live role or simply a team whose product you use. Research what might be
            funded, label every problem guess, find the likely owner, and prepare the smallest
            useful insight, artifact, Loom, email, or DM. You perform every external action.
          </p>
        </section>

        <SniperCampaignPanel />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · candidates never pay. Campaign drafts
          stay on this device unless you copy or download them.
        </p>
      </footer>
    </div>
  );
}
