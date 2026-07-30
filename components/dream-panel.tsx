"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CircleAlert, LoaderCircle, RefreshCw, Search } from "lucide-react";
import type { DreamJob, Verdict } from "@/lib/dream";
import type { Job } from "@/lib/jobs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ScoredJob = Job & { company?: string; source?: string };
type ScoredVerdict = Verdict & { job: ScoredJob | null };
type JudgeState =
  | { kind: "idle" }
  | { kind: "running"; company: string }
  | { kind: "none"; message: string }
  | { kind: "done"; company: string; total: number; verdicts: ScoredVerdict[] }
  | { kind: "error"; message: string };

const KEY_BG = "skillsupply.background";
const KEY_WISH = "skillsupply.wishes";
const KEY_DREAM = "skillsupply.dream";

const REC_STYLE: Record<Verdict["recommend"], string> = {
  chase: "bg-brand text-brand-foreground",
  maybe: "bg-muted text-foreground",
  skip: "bg-muted text-muted-foreground",
};

export function DreamPanel() {
  const [background, setBackground] = useState("");
  const [wishes, setWishes] = useState("");
  const [dream, setDream] = useState<DreamJob | null>(null);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [company, setCompany] = useState("");
  const [judge, setJudge] = useState<JudgeState>({ kind: "idle" });
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // The profile lives on this device. No account, no database, still persistent.
  useEffect(() => {
    try {
      setBackground(localStorage.getItem(KEY_BG) ?? "");
      setWishes(localStorage.getItem(KEY_WISH) ?? "");
      const saved = localStorage.getItem(KEY_DREAM);
      if (saved) setDream(JSON.parse(saved) as DreamJob);
    } catch {
      /* storage blocked, the page still works for one session */
    }
    setLoaded(true);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function buildDream() {
    if (background.trim().length < 80 || building) return;
    setBuilding(true);
    setBuildError(null);
    setJudge({ kind: "idle" });
    try {
      const res = await fetch("/api/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background, wishes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      setDream(data.dream as DreamJob);
      try {
        localStorage.setItem(KEY_BG, background);
        localStorage.setItem(KEY_WISH, wishes);
        localStorage.setItem(KEY_DREAM, JSON.stringify(data.dream));
      } catch {
        /* not fatal */
      }
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : "Could not build your dream job.");
    } finally {
      setBuilding(false);
    }
  }

  async function checkCompany(name: string) {
    const target = name.trim();
    if (!target || !dream || judge.kind === "running") return;
    setJudge({ kind: "running", company: target });
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream, company: target }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      if (data.found === false) {
        setJudge({ kind: "none", message: data.message });
        return;
      }
      setJudge({
        kind: "done",
        company: data.company,
        total: data.total,
        verdicts: data.verdicts as ScoredVerdict[],
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      setJudge({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not score that company.",
      });
    }
  }

  /** Search every aggregator for roles matching the dream JD, then score them. */
  async function huntEverywhere() {
    if (!dream || judge.kind === "running") return;
    setJudge({ kind: "running", company: "every board we can reach" });
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      if (data.found === false) {
        setJudge({ kind: "none", message: data.message });
        return;
      }
      setJudge({
        kind: "done",
        company: "the open market",
        total: data.searched,
        verdicts: data.verdicts as ScoredVerdict[],
      });
    } catch (err) {
      if (controller.signal.aborted) return;
      setJudge({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not search the boards.",
      });
    }
  }

  function reset() {
    setDream(null);
    setJudge({ kind: "idle" });
    try {
      localStorage.removeItem(KEY_DREAM);
    } catch {
      /* not fatal */
    }
  }

  if (!loaded) {
    return <div className="h-40 rounded-xl bg-muted motion-safe:animate-pulse" aria-hidden />;
  }

  // Step 1: no dream job yet.
  if (!dream) {
    return (
      <div className="space-y-4">
        {buildError && (
          <div
            className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">{buildError}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            buildDream();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="dream-bg" className="mb-1.5 block text-sm font-medium">
              Everything about you, professionally
            </label>
            <Textarea
              id="dream-bg"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Resume, projects, what you have shipped, what you are great at, what you actually enjoy, constraints like location or visa. The more you give, the sharper the JD."
              className="max-h-[420px] min-h-[200px] overflow-y-auto rounded-xl bg-card p-4 text-[0.925rem] leading-relaxed"
              required
            />
          </div>

          <div>
            <label htmlFor="dream-wish" className="mb-1.5 block text-sm font-medium">
              Dream companies or roles <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="dream-wish"
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="e.g. Ramp, Anthropic, anything early stage in AI. Or a role: founding engineer, head of ops."
              className="max-h-[140px] min-h-[72px] overflow-y-auto rounded-xl bg-card p-4 text-[0.925rem] leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="lg"
              className="h-11 px-5"
              disabled={building || background.trim().length < 80}
            >
              {building ? (
                <>
                  <LoaderCircle className="motion-safe:animate-spin" aria-hidden /> Writing your JD
                </>
              ) : (
                <>
                  Write my dream job <ArrowRight aria-hidden />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Saved on this device only. No account, no database.
            </p>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: the dream JD exists. Show it, then score real companies against it.
  return (
    <div className="space-y-8">
      <article className="rounded-xl border border-border bg-card p-5 sm:p-7">
        <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Your dream job
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance">{dream.title}</h2>
        <p className="mt-3 border-l-2 border-brand pl-4 text-[0.95rem] leading-relaxed italic">
          {dream.one_line}
        </p>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="mb-1 text-sm font-semibold">The company</dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">{dream.company_shape}</dd>
          </div>
          <div>
            <dt className="mb-1 text-sm font-semibold">Compensation</dt>
            <dd className="text-sm leading-relaxed">
              <span className="font-mono text-brand">{dream.comp_range}</span>
              <span className="block text-muted-foreground">{dream.comp_basis}</span>
            </dd>
          </div>
        </dl>

        <Section title="Problems you would own" items={dream.problems} />
        <Section title="Must have" items={dream.must_haves} />
        <Section title="Deal breakers" items={dream.deal_breakers} muted />

        <div className="mt-6 rounded-lg bg-muted/40 p-4">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Why you: </span>
            {dream.why_you}
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-1.5 rounded text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <RefreshCw className="size-3" aria-hidden />
          Rewrite it
        </button>
      </article>

      {/* The filter */}
      <section>
        <h2 className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Judge the market against it
        </h2>
        <p className="mt-2 mb-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Hunt every board we can reach, or check one company by name. Either way each role is
          scored against your dream JD, and most will not match. Knowing which ones do is the
          point.
        </p>

        <div className="mb-4">
          <Button
            type="button"
            size="lg"
            className="h-11 px-5"
            onClick={huntEverywhere}
            disabled={judge.kind === "running"}
          >
            {judge.kind === "running" ? (
              <LoaderCircle className="motion-safe:animate-spin" aria-hidden />
            ) : (
              <Search aria-hidden />
            )}
            Hunt every board
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Searches live job aggregators using your JD, then scores what it finds.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkCompany(company);
          }}
          className="flex flex-wrap gap-2"
        >
          <label htmlFor="judge-company" className="sr-only">
            Company to judge
          </label>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="judge-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ramp, Anthropic, Stripe…"
              className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-[0.925rem] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-11 px-5"
            disabled={judge.kind === "running" || !company.trim()}
          >
            {judge.kind === "running" ? (
              <LoaderCircle className="motion-safe:animate-spin" aria-hidden />
            ) : null}
            {judge.kind === "running" ? "Scoring" : "Score their roles"}
          </Button>
        </form>

        {judge.kind === "running" && (
          <p className="mt-4 text-sm text-muted-foreground" role="status">
            Pulling live roles at {judge.company} and scoring each against your JD
            <span className="motion-safe:animate-pulse">…</span>
          </p>
        )}

        {judge.kind === "none" && (
          <p className="mt-4 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
            {judge.message}
          </p>
        )}

        {judge.kind === "error" && (
          <div
            className="mt-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            role="alert"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">{judge.message}</p>
          </div>
        )}

        {judge.kind === "done" && (
          <div className="mt-5">
            <p className="mb-3 text-sm text-muted-foreground">
              Scored {judge.verdicts.length} of {judge.total} live roles at{" "}
              <span className="font-medium text-foreground">{judge.company}</span>, best first.
            </p>
            <ul className="space-y-3">
              {judge.verdicts.map((v) => (
                <li key={v.job_id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase ${REC_STYLE[v.recommend]}`}
                        >
                          {v.recommend}
                        </span>
                        {v.job?.location && (
                          <span className="text-xs text-muted-foreground">{v.job.location}</span>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-base font-semibold text-balance">
                        {v.job?.title ?? "Role"}
                      </h3>
                      {v.job?.company && (
                        <p className="text-sm text-muted-foreground">
                          {v.job.company}
                          {v.job.source && (
                            <span className="ml-2 font-mono text-[10px] tracking-wide">
                              via {v.job.source}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-2xl leading-none font-medium tabular-nums text-brand">
                        {v.score}
                      </span>
                      <span className="block font-mono text-[10px] text-muted-foreground">
                        vs dream
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed">{v.verdict}</p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Bullets label="Matches" items={v.matches} />
                    <Bullets label="Gaps" items={v.gaps} muted />
                  </div>

                  {v.job?.url && (
                    <a
                      href={v.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 rounded text-xs font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      See the posting
                      <ArrowUpRight className="size-3" aria-hidden />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

function Section({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={`flex gap-2.5 text-sm leading-relaxed ${muted ? "text-muted-foreground" : ""}`}
          >
            <span aria-hidden className="text-brand">
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bullets({ label, items, muted }: { label: string; items: string[]; muted?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="mt-1 space-y-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-[0.8rem] leading-relaxed ${muted ? "text-muted-foreground" : ""}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
