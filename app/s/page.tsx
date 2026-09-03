"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SupplyReport } from "@/lib/schema";
import { decodeReport } from "@/lib/share";
import { SupplyReportView } from "@/components/report";
import { FleetCapture } from "@/components/fleet-capture";

export default function SharePage() {
  const [state, setState] = useState<"loading" | "invalid" | "ok">("loading");
  const [report, setReport] = useState<SupplyReport | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const payload = window.location.hash.slice(1);
      const decoded = payload ? decodeReport(payload) : null;
      if (decoded) {
        setReport(decoded);
        setState("ok");
      } else {
        setState("invalid");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="legible-text-surface mobile-touch-surface mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between pt-6 pb-10">
        <Link
          href="/"
          className="rounded font-mono text-sm font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          skill<span className="text-brand">.</span>supply
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Run yours <ArrowRight className="size-3" aria-hidden />
        </Link>
      </header>

      <main className="flex-1 pb-16" aria-busy={state === "loading"}>
        {state === "loading" && (
          <div className="space-y-4" aria-hidden>
            <div className="h-6 w-40 rounded bg-muted motion-safe:animate-pulse" />
            <div className="h-20 rounded-xl bg-muted motion-safe:animate-pulse" />
            <div className="h-40 rounded-xl bg-muted motion-safe:animate-pulse" />
          </div>
        )}
        {state === "invalid" && (
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h1 className="text-lg font-semibold">This link doesn&rsquo;t hold a report.</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Supply reports live entirely inside their link. This one is missing its payload or
              got truncated when it was shared. Ask for the link again, or generate your own in
              about a minute.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Run your own <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}
        {state === "ok" && report && (
          <>
            <SupplyReportView report={report} shared />
            <FleetCapture />
          </>
        )}
      </main>

      <footer className="border-t border-border py-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Made with skill<span className="text-brand">.</span>supply · an AI career agent. No
          account required; this shareable copy is encoded in the link.
        </p>
      </footer>
    </div>
  );
}
