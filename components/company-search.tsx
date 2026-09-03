"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, FileCheck2, LoaderCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs";
import { applicationHref } from "@/lib/application";
import { scoreResume, type MarketSignal } from "@/lib/resume-improver";

type MarketCompany = {
  rank: number;
  symbol: string | null;
  marketCap: string | null;
  country: string | null;
  profileUrl: string;
};

type ScoredJob = Job & { resumeScore?: number };

type Result =
  | {
      found: true;
      name: string;
      provider: string;
      count: number;
      jobs: ScoredJob[];
      market?: MarketCompany | null;
    }
  | {
      found: false;
      message: string;
      officialCareer?: { name: string; url: string } | null;
      market?: MarketCompany | null;
    };

const SUGGESTED = ["AppLovin", "Nvidia", "Stripe", "Databricks", "Palantir", "Figma"];
const RESUME_STORAGE_KEY = "skill.supply.resume-improver.v1";

export function CompanySearch({
  marketSignals = [],
  suggestedCompanies = SUGGESTED,
  indexedCompanies,
}: {
  marketSignals?: MarketSignal[];
  suggestedCompanies?: string[];
  indexedCompanies?: number;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function search(query: string) {
    const term = query.trim();
    if (!term || loading) return;
    setQ(term);
    setLoading(true);
    setResult(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/resolve?q=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      });
      const payload = (await res.json()) as Result;
      if (payload.found) {
        const resume = savedResume();
        payload.jobs = payload.jobs
          .map((job) => ({
            ...job,
            resumeScore:
              resume && job.description
                ? scoreResume({
                    resume,
                    targetRole: job.title,
                    jobDescription: job.description,
                    market: marketSignals,
                  }).score
                : undefined,
          }))
          .sort(
            (a, b) =>
              (b.resumeScore ?? -1) - (a.resumeScore ?? -1) || a.title.localeCompare(b.title)
          );
      }
      setResult(payload);
    } catch {
      if (!controller.signal.aborted) {
        setResult({ found: false, message: "Could not reach the job board. Try again." });
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function matchResume(job: Job) {
    let saved: Record<string, unknown> = {};
    try {
      const current = window.localStorage.getItem(RESUME_STORAGE_KEY);
      if (current) saved = JSON.parse(current) as Record<string, unknown>;
    } catch {
      // A fresh local draft is enough when stored state is unavailable.
    }
    window.localStorage.setItem(
      RESUME_STORAGE_KEY,
      JSON.stringify({
        ...saved,
        targetRole: job.title,
        jobDescription: job.description ?? "",
      })
    );
    window.location.assign("/resume");
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(q);
        }}
        className="flex flex-wrap gap-2"
      >
        <label htmlFor="company-q" className="sr-only">
          Search any company for live roles
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="company-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          placeholder="Search a company or ticker: NVIDIA, NVDA, fal.ai"
            className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-[0.925rem] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-5" disabled={loading || !q.trim()}>
          {loading ? <LoaderCircle className="motion-safe:animate-spin" aria-hidden /> : null}
          {loading ? "Looking" : "Find roles"}
        </Button>
      </form>

      {!result && !loading && (
        <p className="mt-3 text-xs text-muted-foreground">
          {indexedCompanies ? `${indexedCompanies.toLocaleString()} public companies indexed. ` : ""}
          Try{" "}
          {suggestedCompanies.map((s, i) => (
            <span key={s}>
              {i > 0 && ", "}
              <button
                type="button"
                onClick={() => search(s)}
                className="rounded font-medium text-foreground underline underline-offset-4 outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {s}
              </button>
            </span>
          ))}
        </p>
      )}

      {result && !loading && (
        <div className="mt-4">
          {result.found ? (
            <>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {result.name}
                    <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                      via {result.provider}
                    </span>
                  </p>
                  {result.market && (
                    <a
                      href={result.market.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex rounded font-mono text-[11px] text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      Public rank #{result.market.rank}
                      {result.market.symbol ? ` · ${result.market.symbol}` : ""}
                      {result.market.marketCap ? ` · $${result.market.marketCap}` : ""}
                      {result.market.country ? ` · ${result.market.country}` : ""}
                    </a>
                  )}
                </div>
                <p className="font-mono text-xs tabular-nums text-brand">{result.count} live</p>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {result.jobs.slice(0, 10).map((job, index) => (
                  <li key={job.id} className="flex flex-wrap items-center gap-2 p-2 pl-4">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-baseline justify-between gap-4 rounded-lg py-2 outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <span className="min-w-0">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="block truncate text-sm font-medium">{job.title}</span>
                          {index === 0 && job.resumeScore !== undefined && (
                            <span className="shrink-0 rounded bg-brand/10 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wide text-brand uppercase">
                              Best match
                            </span>
                          )}
                        </span>
                        {(job.location || job.team) && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {[job.team, job.location].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </a>
                    {job.resumeScore !== undefined && (
                      <span className="font-mono text-[11px] font-medium tabular-nums text-brand">
                        {job.resumeScore}/100
                      </span>
                    )}
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => matchResume(job)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium outline-none transition-colors hover:border-foreground/25 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <FileCheck2 className="size-3.5 text-brand" aria-hidden />
                        Resume
                      </button>
                      <Link
                        href={applicationHref(job, result.name)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium outline-none transition-colors hover:border-foreground/25 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Bot className="size-3.5 text-brand" aria-hidden />
                        Apply
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              {result.count > 10 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Showing 10 of {result.count}. Every role links straight to their board.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{result.message}</p>
              {result.market && (
                <a
                  href={result.market.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex rounded font-mono text-[11px] text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Public rank #{result.market.rank}
                  {result.market.symbol ? ` · ${result.market.symbol}` : ""}
                  {result.market.marketCap ? ` · $${result.market.marketCap}` : ""}
                  {result.market.country ? ` · ${result.market.country}` : ""}
                </a>
              )}
              {result.officialCareer && (
                <a
                  href={result.officialCareer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Open {result.officialCareer.name} careers
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function savedResume(): string | null {
  try {
    const saved = window.localStorage.getItem(RESUME_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as { resume?: unknown };
    return typeof parsed.resume === "string" && parsed.resume.trim().length >= 40
      ? parsed.resume
      : null;
  } catch {
    return null;
  }
}
