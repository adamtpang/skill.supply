"use client";

import { ArrowRight, Bot, Link2, RefreshCw, Share2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { SupplyReport } from "@/lib/schema";
import { shareUrl } from "@/lib/share";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Markdown, markdownToPlainText } from "@/components/markdown";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </p>
  );
}

function Section({
  eyebrow,
  children,
  actions,
}: {
  eyebrow: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        {actions}
      </div>
      {children}
    </section>
  );
}

function FitScore({ score }: { score: number }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      <p className="font-mono text-2xl leading-none font-medium tabular-nums text-brand">
        {score}
        <span className="text-xs text-muted-foreground">/100</span>
      </p>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-brand motion-safe:transition-[width] motion-safe:duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function SupplyReportView({
  report,
  shared = false,
  onRestart,
}: {
  report: SupplyReport;
  shared?: boolean;
  onRestart?: () => void;
}) {
  const [linkCopied, setLinkCopied] = useState(false);
  const date = new Date(report.at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl(report, window.location.origin));
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {
      /* clipboard denied */
    }
  }

  // The static brand OG card can't carry the personal one-liner (the report
  // lives in the URL hash, so the server never sees it to render a per-report
  // card). A pre-filled tweet is the one channel where the actual hook,
  // "You are the person who ___", still travels with the share.
  function shareToX() {
    const text = `${report.one_liner}\n\nFree AI career agent, no signup:`;
    const url = shareUrl(report, window.location.origin);
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  function beginApplication() {
    window.sessionStorage.setItem("skill.supply.application.evidence", report.resume_markdown);
    window.location.assign("/apply");
  }

  const intro = report.intro;

  return (
    <article className="space-y-10">
      {/* Masthead */}
      <header>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <Eyebrow>Supply report{report.name ? ` · ${report.name}` : ""}</Eyebrow>
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">{date}</p>
        </div>
        <blockquote className="border-l-2 border-brand pl-5 text-2xl leading-snug font-medium tracking-tight text-balance sm:text-[1.75rem]">
          {report.one_liner}
        </blockquote>
        <p className="mt-4 pl-5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{report.positioning_tagline}</span>
          {" · "}
          {report.headline}
        </p>
      </header>

      {/* Ikigai */}
      <Section eyebrow="01 · Your ikigai">
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["What you love", report.ikigai.love],
              ["What you're great at", report.ikigai.craft],
              ["What the market pays for", report.ikigai.market],
            ] as const
          ).map(([title, body]) => (
            <div key={title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border-l-2 border-brand bg-muted/40 p-4 sm:p-5">
          <h3 className="mb-1.5 text-sm font-semibold">The sweet spot</h3>
          <p className="text-sm leading-relaxed">{report.ikigai.sweet_spot}</p>
        </div>
      </Section>

      {/* Matches */}
      <Section eyebrow="02 · Where you're wanted">
        <ol className="space-y-3">
          {report.matches.map((m, i) => (
            <li key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                    {m.company_kind === "archetype" ? " · archetype" : ""}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-balance">{m.company}</h3>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
                <FitScore score={m.fit_score} />
              </div>
              <p className="mt-3 text-sm leading-relaxed">{m.why_you_fit}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/70">Honest gap:</span> {m.watch_out}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Targets, not job listings. Picked for structural need, ranked by honest fit.
        </p>
      </Section>

      {/* Resume */}
      <Section
        eyebrow="03 · Your resume"
        actions={
          <div className="flex gap-2">
            <CopyButton getText={() => report.resume_markdown} label="Copy Markdown" />
            <CopyButton
              getText={() => markdownToPlainText(report.resume_markdown)}
              label="Copy plain text"
            />
          </div>
        }
      >
        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <Markdown text={report.resume_markdown} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          ATS-friendly: single column, standard headings, your real numbers only.
        </p>
      </Section>

      {/* Opening move */}
      <Section eyebrow="04 · Your opening move">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              To <span className="font-medium text-foreground">{report.matches[0]?.company}</span>
              {" · "}
              {intro.channel === "email" ? "cold email" : "LinkedIn DM"}
            </p>
            <CopyButton
              getText={() =>
                intro.subject ? `Subject: ${intro.subject}\n\n${intro.message}` : intro.message
              }
              label="Copy message"
            />
          </div>
          {intro.subject && (
            <p className="mb-3 border-b border-border pb-3 text-sm">
              <span className="text-muted-foreground">Subject: </span>
              <span className="font-semibold">{intro.subject}</span>
            </p>
          )}
          <p className="text-[0.925rem] leading-relaxed whitespace-pre-wrap">{intro.message}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/70">Why this works: </span>
          {intro.why_this_works}
        </p>
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold">This week</h3>
          <ol className="space-y-2">
            {intro.next_moves.map((move, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-mono text-xs leading-5 text-brand tabular-nums">
                  {i + 1}.
                </span>
                {move}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Share / footer */}
      <Section eyebrow={shared ? "Made with skill.supply" : "05 · Send it"}>
        {shared ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              This report was generated by an AI career agent in about a minute.
            </p>
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors outline-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Run yours <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="lg" onClick={copyLink}>
              <Link2 aria-hidden />
              {linkCopied ? "Link copied. Go post it" : "Copy share link"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={shareToX}>
              <Share2 aria-hidden />
              Share to X
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={beginApplication}>
              <Bot aria-hidden />
              Apply with agent
            </Button>
            {onRestart && (
              <Button type="button" variant="outline" size="lg" onClick={onRestart}>
                <RefreshCw aria-hidden />
                Start over
              </Button>
            )}
            <p className="basis-full text-xs text-muted-foreground sm:basis-auto">
              The whole report is encoded in the link. No account, no database.
            </p>
          </div>
        )}
      </Section>
    </article>
  );
}
