"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Clipboard,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  improvementBrief,
  scoreResume,
  type CheckStatus,
  type MarketSignal,
  type ResumeFinding,
  type ResumeScore,
} from "@/lib/resume-improver";

type ResumeImproverProps = {
  market: {
    asOf: string;
    companiesScanned: number;
    rolesScanned: number;
    signals: MarketSignal[];
  };
};

type ScanReceipt = {
  score: number;
  at: string;
  scope?: string;
};

const STORAGE_KEY = "skill.supply.resume-improver.v1";
const SAMPLE_RESUME = `MAYA CHEN
maya@example.com | linkedin.com/in/mayachen | mayachen.dev

SUMMARY
Product-minded operations leader who turns messy customer processes into measurable systems.

EXPERIENCE
Retextion | Operations Lead | 2023 to 2026
- Built a Retool and Zapier onboarding system that cut activation time from 9 days to 2 days.
- Reduced monthly logo churn from 4.1% to 2.3% by launching a cancel-flow save offer and SQL health dashboard.
- Led support until hiring and training a 3-person customer success team that maintained 96% CSAT.
- Created the help center and escalation playbook used across product, support, and engineering.

Example Legal | Commercial Paralegal | 2021 to 2023
- Automated contract intake and approval templates used by 18 colleagues across legal and finance.
- Reduced routine document preparation from 90 minutes to 20 minutes through reusable workflows.
- Managed a portfolio of 45 active commercial agreements without a missed renewal deadline.
- Trained 6 new teammates on contract operations, client communication, and quality checks.

PROJECTS
Customer Health System | mayachen.dev/health-system
- Designed production SQL models and a Metabase dashboard used to prioritize at-risk accounts.
- Automated weekly account reviews, saving the team 6 hours per week.

SKILLS
SQL, Python, Retool, Zapier, Metabase, customer success, process automation

EDUCATION
BA, Example University`;

const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: "Pass",
  partial: "Partial",
  fail: "Needs work",
  limited: "Not tested",
};

const STATUS_STYLE: Record<CheckStatus, string> = {
  pass: "text-positive",
  partial: "text-warning",
  fail: "text-destructive",
  limited: "text-muted-foreground",
};

export function ResumeImprover({ market }: ResumeImproverProps) {
  const [resume, setResume] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ResumeScore | null>(null);
  const [receipts, setReceipts] = useState<ScanReceipt[]>([]);
  const [lastScanScope, setLastScanScope] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<ResumeFinding | null>(null);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadSavedDraft = () => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            resume?: string;
            targetRole?: string;
            jobDescription?: string;
            receipts?: ScanReceipt[];
          };
          setResume(parsed.resume ?? "");
          setTargetRole(parsed.targetRole ?? "");
          setJobDescription(parsed.jobDescription ?? "");
          setReceipts(Array.isArray(parsed.receipts) ? parsed.receipts.slice(-6) : []);
        }
      } catch {
        // Storage is an optional convenience. The tool still works for this session.
      }
      setLoaded(true);
    };
    const timeout = window.setTimeout(loadSavedDraft, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ resume, targetRole, jobDescription, receipts: receipts.slice(-6) })
      );
    } catch {
      // Storage may be blocked without affecting scoring.
    }
  }, [jobDescription, loaded, receipts, resume, targetRole]);

  const scoreInput = useMemo(
    () => ({ resume, targetRole, jobDescription, market: market.signals }),
    [jobDescription, market.signals, resume, targetRole]
  );

  function scan() {
    if (resume.trim().length < 40) return;
    const next = scoreResume(scoreInput);
    const scope = scoreScope(targetRole, jobDescription);
    setResult(next);
    setLastScanScope(scope);
    setSelectedFinding(next.findings[0] ?? null);
    setReceipts((current) =>
      [...current, { score: next.score, at: new Date().toISOString(), scope }].slice(-6)
    );
    setCopied(false);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function loadSample() {
    setResume(SAMPLE_RESUME);
    setTargetRole("Product Operations Lead");
    setJobDescription("");
    setResult(null);
    setLastScanScope(null);
    setSelectedFinding(null);
  }

  async function copyBrief() {
    if (!selectedFinding) return;
    await navigator.clipboard.writeText(improvementBrief(selectedFinding));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const previousScore =
    lastScanScope === null
      ? undefined
      : [...receipts.slice(0, -1)]
          .reverse()
          .find((receipt) => receipt.scope === lastScanScope)?.score;
  const delta = result && previousScore !== undefined ? result.score - previousScore : null;
  const refreshed = useMemo(
    () =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(market.asOf)),
    [market.asOf]
  );

  if (!loaded) {
    return <div className="h-96 rounded-2xl bg-muted motion-safe:animate-pulse" aria-hidden />;
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <MarketMetric value={market.rolesScanned.toLocaleString()} label="Live roles sampled" />
        <MarketMetric value={market.companiesScanned.toLocaleString()} label="Companies sampled" />
        <MarketMetric value={refreshed} label="Market refreshed" />
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          scan();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="resume-target" className="mb-1.5 block text-sm font-medium">
              Target role <span className="font-normal text-muted-foreground">(recommended)</span>
            </label>
            <Input
              id="resume-target"
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              placeholder="Product Engineer"
              className="h-11 bg-card"
            />
          </div>
          <div className="flex items-end">
            <p className="pb-2 text-xs leading-relaxed text-muted-foreground">
              A role and JD unlock the full score. Without them, target alignment is explicitly
              capped instead of guessed.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="resume-text" className="mb-1.5 block text-sm font-medium">
            Resume text
          </label>
          <Textarea
            id="resume-text"
            value={resume}
            onChange={(event) => setResume(event.target.value)}
            placeholder="Paste your resume as text. Standard headings and bullets produce the best evidence scan."
            className="max-h-[580px] min-h-[300px] overflow-y-auto rounded-xl bg-card p-4 font-mono text-[0.82rem] leading-relaxed"
            required
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Your draft stays in this browser. The score runs on your device.
            </p>
            <button
              type="button"
              onClick={loadSample}
              className="rounded text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              Try a sample
            </button>
          </div>
        </div>

        <details className="rounded-xl border border-border bg-card">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50">
            Add the target job description for role-specific scoring
          </summary>
          <div className="border-t border-border p-4">
            <label htmlFor="resume-jd" className="sr-only">
              Target job description
            </label>
            <Textarea
              id="resume-jd"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the full JD. Missing terms only count as opportunities when your real experience supports them."
              className="max-h-[360px] min-h-[180px] overflow-y-auto font-mono text-[0.8rem] leading-relaxed"
            />
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" className="h-11 px-5" disabled={resume.trim().length < 40}>
            {result ? <RefreshCw aria-hidden /> : <Sparkles aria-hidden />}
            {result ? "Rescore this draft" : "Score my resume"}
          </Button>
          <p className="text-xs text-muted-foreground">Free. No account. No API key.</p>
        </div>
      </form>

      {result && (
        <div ref={resultsRef} className="scroll-mt-6 space-y-8" aria-live="polite">
          <ScoreHero result={result} delta={delta} />

          {selectedFinding && (
            <section className="rounded-2xl border border-brand/30 bg-brand/[0.035] p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-brand text-brand-foreground">Fix this next</Badge>
                    <span className="font-mono text-xs text-brand">
                      +{selectedFinding.pointsAvailable} points available
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight">
                    {selectedFinding.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Observed:</span>{" "}
                    {selectedFinding.evidence}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Smallest truthful change:</span>{" "}
                    {selectedFinding.recommendation}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Done when:</span>{" "}
                    {selectedFinding.acceptance}
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={copyBrief} className="shrink-0">
                  {copied ? <Check aria-hidden /> : <Clipboard aria-hidden />}
                  {copied ? "Copied" : "Copy brief"}
                </Button>
              </div>
              <p className="mt-5 border-t border-brand/15 pt-4 text-xs leading-relaxed text-muted-foreground">
                Edit the resume above, then rescore. The next highest-leverage issue becomes the new
                focus. No metric or claim is generated for you.
              </p>
            </section>
          )}

          <section aria-labelledby="scorecards-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Independent scorecards
                </p>
                <h2 id="scorecards-heading" className="mt-1 text-xl font-semibold tracking-tight">
                  Every point has a receipt
                </h2>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                {result.findings.length} open checks
              </p>
            </div>
            <div className="space-y-3">
              {result.scorecards.map((scorecard) => (
                <details key={scorecard.id} className="group rounded-xl border border-border bg-card">
                  <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 sm:px-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold tracking-tight">{scorecard.title}</h3>
                        <span className={`font-mono text-[10px] tracking-wide uppercase ${STATUS_STYLE[scorecard.status]}`}>
                          {STATUS_LABEL[scorecard.status]}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-muted" aria-hidden>
                        <div
                          className="h-full rounded-full bg-brand transition-[width]"
                          style={{ width: `${Math.round((scorecard.score / scorecard.maxScore) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <p className="font-mono text-lg font-semibold tabular-nums text-brand">
                      {scorecard.score}
                      <span className="text-xs font-normal text-muted-foreground">/{scorecard.maxScore}</span>
                    </p>
                  </summary>
                  <div className="divide-y divide-border border-t border-border">
                    {scorecard.checks.map((item) => (
                      <div key={item.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:px-5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">{item.title}</p>
                            <span className={`font-mono text-[10px] uppercase ${STATUS_STYLE[item.status]}`}>
                              {STATUS_LABEL[item.status]}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {item.evidence}
                          </p>
                          {item.points < item.maxPoints && (
                            <p className="mt-2 text-xs leading-relaxed">
                              {item.recommendation} <span className="text-muted-foreground">Done when: {item.acceptance}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-start gap-2 sm:flex-col sm:items-end">
                          <p className="font-mono text-sm tabular-nums">
                            {item.points}/{item.maxPoints}
                          </p>
                          {item.points < item.maxPoints && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFinding(
                                  result.findings.find((finding) => finding.id === item.id) ?? null
                                );
                                resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }}
                              className="inline-flex items-center gap-1 rounded text-[11px] font-medium text-brand outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                            >
                              Fix next <ArrowRight className="size-3" aria-hidden />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/35 p-5">
              <ShieldCheck className="size-5 text-positive" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold">What this score means</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                A versioned decision aid based on visible text, evidence patterns, a supplied target,
                and {market.rolesScanned.toLocaleString()} current public postings. It helps you
                improve the artifact. It does not predict a specific ATS or recruiter.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/35 p-5">
              <Target className="size-5 text-brand" aria-hidden />
              <h2 className="mt-3 text-sm font-semibold">What the market layer knows</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                This release measures current employer demand from public postings. It does not yet
                claim resume-to-interview causality. That requires opt-in, anonymized application,
                interview, and offer receipts collected over time.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function scoreScope(targetRole: string, jobDescription: string): string {
  const role = targetRole.trim().toLowerCase();
  const description = jobDescription.trim().toLowerCase().replace(/\s+/g, " ");
  return `${role}|${description.slice(0, 240)}`;
}

function MarketMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-brand">{value}</p>
    </div>
  );
}

function ScoreHero({ result, delta }: { result: ResumeScore; delta: number | null }) {
  const descriptor =
    result.score >= 90
      ? "Application ready"
      : result.score >= 75
        ? "Strong foundation"
        : result.score >= 55
          ? "Promising, not finished"
          : "Proof needs work";

  return (
    <section className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-[15rem_1fr]">
      <div className="flex flex-col justify-center bg-card p-6 sm:p-8">
        <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Resume score
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-mono text-6xl font-semibold tracking-tighter tabular-nums text-brand">
            {result.score}
          </p>
          <p className="font-mono text-sm text-muted-foreground">/100</p>
        </div>
        <p className="mt-2 text-sm font-medium">{descriptor}</p>
        {delta !== null && (
          <p className={`mt-1 font-mono text-xs ${delta > 0 ? "text-positive" : delta < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {delta > 0 ? "+" : ""}{delta} since last scan
          </p>
        )}
      </div>
      <div className="bg-card p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value={result.stats.words} label="Words" />
          <Stat value={result.stats.bullets} label="Bullets" />
          <Stat value={result.stats.quantifiedBullets} label="With metrics" />
          <Stat value={result.stats.marketSkillsMatched} label="Market skills" />
        </div>
        {result.cap !== null ? (
          <div className="mt-6 flex gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
            <div>
              <p className="text-sm font-medium">Score capped at {result.cap}</p>
              <ul className="mt-1 space-y-1 text-xs leading-relaxed text-muted-foreground">
                {result.capReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            No confidence cap was triggered. The score still describes this artifact, not your worth
            or the probability that a particular employer will hire you.
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
