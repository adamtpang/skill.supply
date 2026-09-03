import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CareerCenterPanel } from "@/components/career-center-panel";

export const metadata: Metadata = {
  title: "Career Center",
  description:
    "A private, evidence-first career case that coordinates talent proof, verified demand, gap closing, campaigns, applications, interviews, and placement.",
  alternates: { canonical: "/center" },
};

export default function CareerCenterPage() {
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
          href="/"
          className="inline-flex items-center gap-1.5 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Home
        </Link>
      </header>

      <main className="flex-1 pb-16">
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Career Center
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-tighter text-balance sm:text-5xl">
            From hidden ability to the right offer.
          </h1>
          <p className="mt-4 max-w-3xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Keep one truthful career file, identify one funded team with a real need, close only the
            gap that matters, and prepare the smallest useful move toward an offer. Candidates never
            pay. Nothing is sent or submitted for you.
          </p>
        </section>

        <CareerCenterPanel />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · private by default · candidates never
          pay · every external action stays manual
        </p>
      </footer>
    </div>
  );
}
