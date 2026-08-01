"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, LoaderCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs";
import { applicationHref } from "@/lib/application";

type Result =
  | { found: true; name: string; provider: string; count: number; jobs: Job[] }
  | {
      found: false;
      message: string;
      officialCareer?: { name: string; url: string } | null;
    };

const SUGGESTED = ["AppLovin", "Nvidia", "Stripe", "Databricks", "Palantir", "Figma"];

export function CompanySearch() {
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
      setResult((await res.json()) as Result);
    } catch {
      if (!controller.signal.aborted) {
        setResult({ found: false, message: "Could not reach the job board. Try again." });
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
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
            placeholder="Search any company: AppLovin, Stripe, Nvidia…"
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
          Try{" "}
          {SUGGESTED.map((s, i) => (
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
                <p className="text-sm font-medium">
                  {result.name}
                  <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                    via {result.provider}
                  </span>
                </p>
                <p className="font-mono text-xs tabular-nums text-brand">{result.count} live</p>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {result.jobs.slice(0, 10).map((job) => (
                  <li key={job.id} className="flex items-center gap-2 p-2 pl-4">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-baseline justify-between gap-4 rounded-lg py-2 outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{job.title}</span>
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
                    <Link
                      href={applicationHref(job, result.name)}
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium outline-none transition-colors hover:border-foreground/25 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Bot className="size-3.5 text-brand" aria-hidden />
                      Apply
                    </Link>
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
