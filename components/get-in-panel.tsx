"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";
import type { WayIn, WayInEvent } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";

type Phase = "idle" | "running" | "need_more" | "error" | "done";

const STAGE_LABEL: Record<string, string> = {
  reading: "Reading you",
  targeting: `Sizing up the fit`,
  drafting: "Drafting your way in",
};

export function GetInPanel({ slug, companyName }: { slug: string; companyName: string }) {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState("reading");
  const [question, setQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wayIn, setWayIn] = useState<WayIn | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  function handleEvent(event: WayInEvent) {
    switch (event.type) {
      case "stage":
        setStage(event.stage);
        break;
      case "need_more":
        setQuestion(event.question);
        setPhase("need_more");
        break;
      case "result":
        setWayIn(event.wayIn);
        setPhase("done");
        break;
      case "error":
        setError(event.message);
        setPhase("error");
        break;
    }
  }

  async function run() {
    if (input.trim().length === 0 || phase === "running") return;
    setPhase("running");
    setStage("reading");
    setQuestion(null);
    setError(null);
    setWayIn(null);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/getin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, background: input }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `The agent returned HTTP ${res.status}.`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) if (line.trim()) handleEvent(JSON.parse(line) as WayInEvent);
      }
      if (buffer.trim()) handleEvent(JSON.parse(buffer) as WayInEvent);
      setPhase((p) => {
        if (p === "running") {
          setError("The stream ended early. Run it again.");
          return "error";
        }
        return p;
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something broke. Run it again.");
      setPhase("error");
    }
  }

  if (phase === "done" && wayIn) {
    return <WayInResult wayIn={wayIn} companyName={companyName} onRestart={() => setPhase("idle")} />;
  }

  return (
    <div className="space-y-4">
      {phase === "need_more" && question && (
        <div className="rounded-xl border border-border bg-muted/40 p-4" role="alert">
          <p className="text-sm leading-relaxed">{question}</p>
        </div>
      )}
      {phase === "error" && error && (
        <div
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {phase === "running" ? (
        <div
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5"
          role="status"
        >
          <LoaderCircle className="size-4 text-brand motion-safe:animate-spin" aria-hidden />
          <p className="text-sm font-medium">
            {STAGE_LABEL[stage]}
            <span className="motion-safe:animate-pulse">…</span>
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
        >
          <label htmlFor="getin-bg" className="sr-only">
            Your background
          </label>
          <Textarea
            id="getin-bg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your background and I will draft your honest way into ${companyName}: the fit, the angle, the intro, and the proof to build.`}
            className="max-h-[360px] min-h-[160px] overflow-y-auto rounded-xl bg-card p-4 text-[0.925rem] leading-relaxed"
            required
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" className="h-11 px-5" disabled={input.trim().length === 0}>
              {phase === "error" || phase === "need_more" ? (
                <>
                  <RefreshCw aria-hidden /> Try again
                </>
              ) : (
                <>
                  Draft my way in <ArrowRight aria-hidden />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">≈ 20 seconds · honest fit, not hype</p>
          </div>
        </form>
      )}
    </div>
  );
}

function FitBadge({ score }: { score: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-mono text-3xl leading-none font-medium tabular-nums text-brand">
        {score}
      </span>
      <span className="font-mono text-xs text-muted-foreground">/100 fit</span>
    </div>
  );
}

function WayInResult({
  wayIn,
  companyName,
  onRestart,
}: {
  wayIn: WayIn;
  companyName: string;
  onRestart: () => void;
}) {
  const { intro } = wayIn;
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-4">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Your fit for {companyName}
          </p>
          <FitBadge score={wayIn.fit_score} />
        </div>
        <p className="text-[0.925rem] leading-relaxed">{wayIn.fit_snapshot}</p>
      </div>

      <div>
        <h3 className="mb-2 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Your angle
        </h3>
        <p className="text-[0.925rem] leading-relaxed">{wayIn.angle}</p>
      </div>

      {wayIn.readiness && (
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Time to become their obvious hire
            </h3>
            <p className="font-mono text-sm tabular-nums text-brand">
              {wayIn.readiness.score}/100 ready today
            </p>
          </div>

          <p className="flex flex-wrap items-baseline gap-2 text-[0.925rem] leading-relaxed">
            <span className="font-mono text-3xl leading-none font-medium tabular-nums text-brand">
              {wayIn.readiness.eta_weeks === 0 ? "Now" : `${wayIn.readiness.eta_weeks}w`}
            </span>
            <span>{wayIn.readiness.verdict}</span>
          </p>

          {wayIn.readiness.gaps.length > 0 && (
            <ol className="mt-4 space-y-3 border-t border-border pt-4">
              {wayIn.readiness.gaps.map((g, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <span className="font-mono text-xs leading-5 tabular-nums text-brand">
                    {g.weeks}w
                  </span>
                  <span className="text-sm leading-relaxed font-medium">{g.gap}</span>
                  <span aria-hidden />
                  <span className="text-[0.8rem] leading-relaxed text-muted-foreground">
                    {g.close_it}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            This is your course of study for {companyName}. Close these and you are not applying,
            you are the obvious hire.
          </p>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Your opening move
          </h3>
          <CopyButton
            getText={() =>
              intro.subject ? `Subject: ${intro.subject}\n\n${intro.message}` : intro.message
            }
            label="Copy message"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          {intro.subject && (
            <p className="mb-3 border-b border-border pb-3 text-sm">
              <span className="text-muted-foreground">Subject: </span>
              <span className="font-semibold">{intro.subject}</span>
            </p>
          )}
          <p className="text-[0.925rem] leading-relaxed whitespace-pre-wrap">{intro.message}</p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {intro.channel === "email" ? "Send as a cold email." : "Send as a LinkedIn DM."}
        </p>
      </div>

      <div className="rounded-xl border-l-2 border-brand bg-muted/40 p-4 sm:p-5">
        <h3 className="mb-1.5 text-sm font-semibold">Build this to get noticed</h3>
        <p className="text-sm leading-relaxed">{wayIn.proof_move}</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">This week</h3>
        <ol className="space-y-2">
          {wayIn.next_moves.map((move, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-mono text-xs leading-5 text-brand tabular-nums">{i + 1}.</span>
              {move}
            </li>
          ))}
        </ol>
      </div>

      <Button type="button" variant="outline" onClick={onRestart}>
        <RefreshCw aria-hidden /> Draft for a different background
      </Button>
    </div>
  );
}
