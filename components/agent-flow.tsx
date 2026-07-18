"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, RefreshCw } from "lucide-react";
import type { AgentEvent, SupplyReport } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StageLoader, type ServerStage } from "@/components/stage-loader";
import { SupplyReportView } from "@/components/report";

const SAMPLE = `I'm Maya Chen, 27. Last 3 years I was employee #2 at a Shopify-apps startup (Retextion, ~$1.2M ARR when I left). Title said "operations" but I did everything: built our onboarding flow in Retool + Zapier which cut activation time from 9 days to 2, ran support until I hired and trained a 3-person team (CSAT 96%), wrote all our help docs, and ended up owning our churn number — got monthly logo churn from 4.1% to 2.3% by building a cancel-flow save offer and a health-score dashboard in SQL + Metabase.

Before that: 2 years as a paralegal doing commercial contracts, which I hated, except the part where I built the doc-automation templates everyone still uses.

What I actually love: being the first person to touch a messy process and making it run itself. Spreadsheets that become systems. Talking to angry customers until they're not angry. I taught myself SQL and enough Python to be dangerous with scripts. I write clearly and fast.

Looking for: early ops/CX role at a startup where I can own a number. US-remote or NYC. Don't want big-company process theater.`;

const STEPS_STRIP = [
  ["Discover", "An agent reads you and finds your ikigai–market fit — love × craft × what companies pay for."],
  ["Package", "A sharp ATS resume plus the one-liner: you are the person who ___."],
  ["Place", "Five named targets with honest fit scores, and your opening message for #1."],
] as const;

type Phase = "idle" | "running" | "need_more" | "error" | "done";

export function AgentFlow() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState<ServerStage>("reading");
  const [headline, setHeadline] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [question, setQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SupplyReport | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if ((phase === "done" || phase === "running") && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  function handleEvent(event: AgentEvent) {
    switch (event.type) {
      case "stage":
        setStage(event.stage);
        break;
      case "profile":
        setHeadline(event.headline);
        break;
      case "teaser":
        setTeaser(event.one_liner);
        break;
      case "need_more":
        setQuestion(event.question);
        setPhase("need_more");
        break;
      case "result":
        setReport(event.report);
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
    setHeadline(null);
    setTeaser(null);
    setQuestion(null);
    setError(null);
    setReport(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
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
        for (const line of lines) {
          if (line.trim()) handleEvent(JSON.parse(line) as AgentEvent);
        }
      }
      if (buffer.trim()) handleEvent(JSON.parse(buffer) as AgentEvent);
      // If the stream closed without a terminal event, surface it.
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

  function restart() {
    abortRef.current?.abort();
    setPhase("idle");
    setReport(null);
    setTeaser(null);
    setHeadline(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (phase === "done" && report) {
    return (
      <div ref={topRef} className="scroll-mt-10">
        <SupplyReportView report={report} onRestart={restart} />
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-10">
      {/* Hero */}
      <section className="pt-14 pb-10 sm:pt-20">
        <h1 className="text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">
          You&rsquo;re the supply.
          <br />
          <span className="text-muted-foreground">We make you irresistible.</span>
        </h1>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
          An AI career agent that reads you, finds your ikigai–market fit, and names the five
          companies that should be fighting to hire you — with the resume and the opening message
          to make it happen.
        </p>
      </section>

      {/* Flow */}
      <div className="space-y-4">
        {phase === "need_more" && question && (
          <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5" role="alert">
            <p className="mb-1 font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              One more thing
            </p>
            <p className="text-sm leading-relaxed">{question}</p>
          </div>
        )}
        {phase === "error" && error && (
          <div
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:p-5"
            role="alert"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="text-sm font-medium">That run broke.</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {phase === "running" ? (
          <StageLoader stage={stage} headline={headline} teaser={teaser} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run();
            }}
          >
            <label htmlFor="background" className="sr-only">
              Your background — resume, LinkedIn text, or a few honest paragraphs
            </label>
            <Textarea
              id="background"
              name="background"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your resume, your LinkedIn About + Experience, or just write honestly: what you've built, what you're great at, what you love doing…"
              className="max-h-[420px] min-h-[220px] overflow-y-auto rounded-xl bg-card p-4 text-[0.925rem] leading-relaxed"
              required
            />
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Button
                type="submit"
                size="lg"
                className="h-11 px-5 text-[0.925rem]"
                disabled={input.trim().length === 0}
              >
                {phase === "need_more" || phase === "error" ? (
                  <>
                    <RefreshCw aria-hidden /> Run it again
                  </>
                ) : (
                  <>
                    Find my supply <ArrowRight aria-hidden />
                  </>
                )}
              </Button>
              <p className="text-xs leading-relaxed text-muted-foreground">
                ≈ a minute · no signup · nothing stored —<br className="sm:hidden" /> your report
                lives in a link only you hold
              </p>
            </div>
            {input.trim().length === 0 && (
              <p className="mt-4 text-xs text-muted-foreground">
                No resume handy?{" "}
                <button
                  type="button"
                  className="rounded font-medium text-foreground underline underline-offset-4 outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                  onClick={() => setInput(SAMPLE)}
                >
                  Load a sample background
                </button>{" "}
                to see what the agent does.
              </p>
            )}
          </form>
        )}

        {/* How it works */}
        {phase !== "running" && (
          <section aria-label="How it works" className="grid gap-4 border-t border-border pt-8 sm:grid-cols-3 sm:gap-6">
            {STEPS_STRIP.map(([title, body], i) => (
              <div key={title}>
                <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
                  0{i + 1} <span className="ml-1 text-foreground normal-case">{title}</span>
                </p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
