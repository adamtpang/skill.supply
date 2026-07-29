import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DreamPanel } from "@/components/dream-panel";

export const metadata: Metadata = {
  title: "Your dream job, written for you",
  description:
    "Tell the agent everything about you professionally. It writes the job description you should be hired into, then scores every live role at any company against it.",
};

export default function DreamPage() {
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
        <section className="pt-12 pb-8 sm:pt-16">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            The inversion
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
            Stop reading job descriptions. Write yours.
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            Tell the agent everything about you professionally, once. It writes the job description
            you should be hired into, then judges every real posting against it. Your ideal becomes
            the filter instead of the job board.
          </p>
        </section>

        <DreamPanel />
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          skill<span className="text-brand">.</span>supply · your profile is saved on your device,
          never on a server.
        </p>
      </footer>
    </div>
  );
}
