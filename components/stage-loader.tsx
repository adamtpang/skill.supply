"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";

export type ServerStage = "reading" | "ikigai" | "packaging";

const STEPS = [
  { label: "Reading you", sub: "parsing wins, skills, loves" },
  { label: "Finding your ikigai", sub: "love × craft × market" },
  { label: "Matching you to the market", sub: "naming and scoring 5 targets" },
  { label: "Packaging you", sub: "writing the ATS resume" },
  { label: "Drafting your opening move", sub: "the intro for target #1" },
] as const;

// Which visual step each server stage lands on, and the cosmetic advance
// within long stages (the model does both halves inside one call).
const STAGE_STEP: Record<ServerStage, number> = { reading: 0, ikigai: 1, packaging: 3 };
const COSMETIC_ADVANCE_MS: Partial<Record<ServerStage, number>> = { ikigai: 9000, packaging: 7000 };

export function StageLoader({
  stage,
  headline,
  teaser,
}: {
  stage: ServerStage;
  headline: string | null;
  teaser: string | null;
}) {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const base = STAGE_STEP[stage];
    setStep((s) => Math.max(s, base));
    const advance = COSMETIC_ADVANCE_MS[stage];
    if (advance == null) return;
    const t = setTimeout(() => setStep((s) => Math.max(s, base + 1)), advance);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60));
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 sm:p-8"
      role="status"
      aria-label="Your supply report is being generated"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Agent running
        </p>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {mm}:{ss}
        </p>
      </div>

      <ol className="space-y-4">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "pending";
          return (
            <li key={s.label} className="flex items-start gap-3">
              <span
                aria-hidden
                className={
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border " +
                  (state === "done"
                    ? "border-foreground bg-foreground text-background"
                    : state === "active"
                      ? "border-brand text-brand"
                      : "border-border text-transparent")
                }
              >
                {state === "done" ? (
                  <Check className="size-3" strokeWidth={3} />
                ) : state === "active" ? (
                  <LoaderCircle className="size-3 motion-safe:animate-spin" />
                ) : null}
              </span>
              <div className="min-w-0">
                <p
                  className={
                    "text-sm leading-5 font-medium " +
                    (state === "pending" ? "text-muted-foreground/60" : "text-foreground")
                  }
                >
                  {s.label}
                  {state === "active" && <span className="motion-safe:animate-pulse">…</span>}
                </p>
                {state !== "pending" && (
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                )}
                {i === 0 && state === "done" && headline && (
                  <p className="mt-1 text-xs text-foreground/80">
                    <span className="text-muted-foreground">found:</span> {headline}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {teaser && (
        <blockquote className="mt-6 border-l-2 border-brand pl-4 text-sm leading-relaxed text-foreground italic">
          “{teaser}”
        </blockquote>
      )}
    </div>
  );
}
