"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardCopy,
  Download,
  ExternalLink,
  LockKeyhole,
  RotateCcw,
  Target,
  Upload,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CAREER_CENTER_STORAGE_KEY,
  CAREER_GUARDRAILS,
  CAREER_OBJECTS,
  CAREER_STEPS,
  careerAgentTask,
  careerProgress,
  careerStepHref,
  currentCareerStep,
  emptyCareerCase,
  makeCareerCase,
  nextCareerAction,
  readCareerCase,
  type CareerCase,
  type CareerStepId,
  type CareerStepStatus,
} from "@/lib/career-center";
import { cn } from "@/lib/utils";

const STEP_STATUSES: Array<{ value: CareerStepStatus; label: string }> = [
  { value: "not-started", label: "Not started" },
  { value: "working", label: "Working" },
  { value: "blocked", label: "Blocked" },
  { value: "complete", label: "Complete" },
];

type ActionStatus = "idle" | "saved" | "copied" | "downloaded" | "imported" | "error";

export function CareerCenterPanel() {
  const [careerCase, setCareerCase] = useState<CareerCase>(emptyCareerCase);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [message, setMessage] = useState("Loading your private career file...");
  const importRef = useRef<HTMLInputElement>(null);

  const currentStep = useMemo(() => currentCareerStep(careerCase), [careerCase]);
  const progress = useMemo(() => careerProgress(careerCase), [careerCase]);
  const allComplete = CAREER_STEPS.every((step) => careerCase.steps[step.id] === "complete");
  const actionHref = careerStepHref(careerCase, currentStep.id);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const raw = window.localStorage.getItem(CAREER_CENTER_STORAGE_KEY);
      const stored = raw ? readCareerCase(raw) : null;
      if (stored) setCareerCase(stored);
      setReady(true);
      setMessage(stored ? "Career file restored from this device." : "Private career file ready.");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(
        CAREER_CENTER_STORAGE_KEY,
        JSON.stringify(makeCareerCase(careerCase)),
      );
      setStatus("saved");
      setMessage("Saved on this device. Nothing was sent or submitted.");
    }, 300);
    return () => window.clearTimeout(timer);
  }, [careerCase, ready]);

  function updateCandidate<K extends keyof CareerCase["candidate"]>(
    field: K,
    value: CareerCase["candidate"][K],
  ) {
    setCareerCase((current) => ({
      ...current,
      candidate: { ...current.candidate, [field]: value },
    }));
  }

  function updateTarget<K extends keyof CareerCase["activeTarget"]>(
    field: K,
    value: CareerCase["activeTarget"][K],
  ) {
    setCareerCase((current) => ({
      ...current,
      activeTarget: { ...current.activeTarget, [field]: value },
    }));
  }

  function updateMetric<K extends keyof CareerCase["metrics"]>(field: K, raw: string) {
    const value = Math.max(0, Math.round(Number(raw) || 0));
    setCareerCase((current) => ({
      ...current,
      metrics: { ...current.metrics, [field]: value },
    }));
  }

  function updateStep(stepId: CareerStepId, stepStatus: CareerStepStatus) {
    setCareerCase((current) => ({
      ...current,
      steps: { ...current.steps, [stepId]: stepStatus },
    }));
  }

  function completeCurrentStep() {
    updateStep(currentStep.id, "complete");
  }

  async function copyAgentTask() {
    try {
      await navigator.clipboard.writeText(careerAgentTask(careerCase));
      setAction("copied", "Career agent task copied. It includes the guardrails and current case.");
    } catch {
      setAction("error", "Clipboard access was blocked. Download the career file instead.");
    }
  }

  function downloadCareerFile() {
    const packet = makeCareerCase(careerCase);
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug(packet.candidate.name) || "candidate"}-career-case.json`;
    link.click();
    URL.revokeObjectURL(url);
    setAction("downloaded", "Career file downloaded. Review it before sharing it anywhere.");
  }

  async function importCareerFile(file: File | undefined) {
    if (!file) return;
    const parsed = readCareerCase(await file.text());
    if (!parsed) {
      setAction("error", "That file is not a valid skill.supply career case.");
      return;
    }
    setCareerCase(parsed);
    setAction("imported", "Career file imported. Review the facts before using it.");
  }

  function resetCareerFile() {
    const confirmed = window.confirm(
      "Reset the career file stored in this browser? Download a copy first if you may need it.",
    );
    if (!confirmed) return;
    window.localStorage.removeItem(CAREER_CENTER_STORAGE_KEY);
    setCareerCase(emptyCareerCase());
    setAction("saved", "Career file reset on this device.");
  }

  function setAction(nextStatus: ActionStatus, nextMessage: string) {
    setStatus(nextStatus);
    setMessage(nextMessage);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <Fact eyebrow="Goal" value="Accepted dream job, as soon as possible" />
        <Fact eyebrow="Method" value="Demand, proof, match, campaign, placement" />
        <Fact eyebrow="Control" value="You perform every external action" />
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_15rem] lg:items-end">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-brand uppercase">
              One next action
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentStep.number} · {currentStep.owner} · {currentStep.label}
            </p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {allComplete ? "Review the offer and placement outcome." : nextCareerAction(careerCase)}
            </h2>
            {careerCase.currentBottleneck ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Current bottleneck: {careerCase.currentBottleneck}
              </p>
            ) : null}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress}% complete</span>
              <span>{CAREER_STEPS.filter((step) => careerCase.steps[step.id] === "complete").length}/9</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" aria-label={`${progress}% complete`}>
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <SmartActionLink href={actionHref}>Open this step</SmartActionLink>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={completeCurrentStep}
              disabled={allComplete}
            >
              <Check aria-hidden />
              Mark step complete
            </Button>
          </div>
        </div>
        <div className="border-t border-border bg-muted/35 px-5 py-3 sm:px-7">
          <p
            role={status === "error" ? "alert" : "status"}
            className={cn(
              "flex items-center gap-2 text-xs",
              status === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <LockKeyhole className="size-3.5" aria-hidden />
            {ready ? message : "Loading your private career file..."}
          </p>
        </div>
      </section>

      <section id="career-file" className="scroll-mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <SectionHeading
          number="01"
          title="Career file"
          description="Keep factual identity, evidence, constraints, and the definition of a dream job in one private source of truth. This browser stores it locally."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Candidate name" hint="Candidate supplied">
            <Input
              value={careerCase.candidate.name}
              onChange={(event) => updateCandidate("name", event.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </Field>
          <Field label="Talent Card score" hint="Sourced or leave unknown">
            <Input
              value={careerCase.candidate.talentScore}
              onChange={(event) => updateCandidate("talentScore", event.target.value)}
              placeholder="Score, confidence, and date"
            />
          </Field>
          <Field label="Goal" hint="One measurable outcome" wide>
            <Input
              value={careerCase.candidate.goal}
              onChange={(event) => updateCandidate("goal", event.target.value)}
            />
          </Field>
          <Field label="Dream job definition" hint="The offer decision rule" wide>
            <Textarea
              value={careerCase.candidate.dreamJobDefinition}
              onChange={(event) => updateCandidate("dreamJobDefinition", event.target.value)}
              className="min-h-24"
            />
          </Field>
          <Field label="Factual profile" hint="Facts, constraints, proof links, and unknowns" wide>
            <Textarea
              value={careerCase.candidate.factualProfile}
              onChange={(event) => updateCandidate("factualProfile", event.target.value)}
              placeholder="Verified work history, projects, skills, outcomes, location, work authorization, compensation constraints, and links. Mark unknowns."
              className="min-h-36"
            />
          </Field>
          <Field label="Talent Card URL" hint="darktalent.tech">
            <Input
              type="url"
              value={careerCase.candidate.talentCardUrl}
              onChange={(event) => updateCandidate("talentCardUrl", event.target.value)}
              placeholder="https://darktalent.tech/..."
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <SectionHeading
          number="02"
          title="One active target"
          description="Choose a team with evidenced demand. Keep sourced facts separate from your proof and from honest gaps."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Company" hint="Sourced fact">
            <Input
              value={careerCase.activeTarget.company}
              onChange={(event) => updateTarget("company", event.target.value)}
              placeholder="Company"
            />
          </Field>
          <Field label="Team or role" hint="Sourced fact">
            <Input
              value={careerCase.activeTarget.teamOrRole}
              onChange={(event) => updateTarget("teamOrRole", event.target.value)}
              placeholder="Team, role, or capability need"
            />
          </Field>
          <Field label="Official source URL" hint="Careers page, role, or team source" wide>
            <Input
              type="url"
              value={careerCase.activeTarget.officialUrl}
              onChange={(event) => updateTarget("officialUrl", event.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Demand evidence" hint="Source, date, urgency, and budget evidence" wide>
            <Textarea
              value={careerCase.activeTarget.demandEvidence}
              onChange={(event) => updateTarget("demandEvidence", event.target.value)}
              placeholder="What proves this team has a current, funded capability gap? Label estimates as hypotheses."
              className="min-h-28"
            />
          </Field>
          <Field label="Proof of fit" hint="Candidate supplied and externally verifiable">
            <Textarea
              value={careerCase.activeTarget.proofOfFit}
              onChange={(event) => updateTarget("proofOfFit", event.target.value)}
              placeholder="The strongest line of proof for this need"
              className="min-h-28"
            />
          </Field>
          <Field label="Honest gap" hint="Do not hide it">
            <Textarea
              value={careerCase.activeTarget.honestGap}
              onChange={(event) => updateTarget("honestGap", event.target.value)}
              placeholder="The specific missing capability or evidence"
              className="min-h-28"
            />
          </Field>
          <Field label="ETA to close gap" hint="Hypothesis in weeks">
            <Input
              value={careerCase.activeTarget.etaWeeks}
              onChange={(event) => updateTarget("etaWeeks", event.target.value)}
              placeholder="Example: 2 weeks"
            />
          </Field>
          <Field label="Company-specific gap plan" hint="company.university">
            <Input
              value={careerCase.activeTarget.gapPlan}
              onChange={(event) => updateTarget("gapPlan", event.target.value)}
              placeholder="Proof artifact or learning sprint"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <SectionHeading
          number="03"
          title="Placement path"
          description="The first unfinished step controls the next action. Blocked is useful when the reason is named."
        />
        <div className="mt-6 divide-y divide-border rounded-xl border border-border">
          {CAREER_STEPS.map((step) => {
            const isCurrent = step.id === currentStep.id && !allComplete;
            const href = careerStepHref(careerCase, step.id);
            return (
              <div
                key={step.id}
                className={cn(
                  "grid gap-4 p-4 sm:grid-cols-[2.75rem_1fr_9rem] sm:items-center",
                  isCurrent && "bg-brand/5",
                )}
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border font-mono text-xs",
                    careerCase.steps[step.id] === "complete"
                      ? "border-brand bg-brand text-white"
                      : isCurrent
                        ? "border-brand text-brand"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {careerCase.steps[step.id] === "complete" ? <Check className="size-4" /> : step.number}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="text-sm font-semibold">{step.label}</h3>
                    <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                      {step.owner}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                  <SmartTextLink href={href}>Open tool</SmartTextLink>
                </div>
                <label>
                  <span className="sr-only">Status for {step.label}</span>
                  <select
                    value={careerCase.steps[step.id]}
                    onChange={(event) => updateStep(step.id, event.target.value as CareerStepStatus)}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {STEP_STATUSES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section id="case-notes" className="scroll-mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <SectionHeading
          number="04"
          title="Coach and outcomes"
          description="Diagnose the bottleneck, override the next action only when needed, and track outcomes instead of activity volume."
        />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MetricField
            label="Qualified targets"
            value={careerCase.metrics.qualifiedTargets}
            onChange={(value) => updateMetric("qualifiedTargets", value)}
          />
          <MetricField
            label="Manual outreach"
            value={careerCase.metrics.manualOutreach}
            onChange={(value) => updateMetric("manualOutreach", value)}
          />
          <MetricField
            label="Applications"
            value={careerCase.metrics.applications}
            onChange={(value) => updateMetric("applications", value)}
          />
          <MetricField
            label="Interviews"
            value={careerCase.metrics.interviews}
            onChange={(value) => updateMetric("interviews", value)}
          />
          <MetricField
            label="Offers"
            value={careerCase.metrics.offers}
            onChange={(value) => updateMetric("offers", value)}
          />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Current bottleneck" hint="The constraint that most delays the offer" wide>
            <Textarea
              value={careerCase.currentBottleneck}
              onChange={(event) =>
                setCareerCase((current) => ({ ...current, currentBottleneck: event.target.value }))
              }
              placeholder="Example: no target has both verified demand and a strong proof-of-fit line"
              className="min-h-24"
            />
          </Field>
          <Field label="Next action override" hint="Leave blank to use the placement path" wide>
            <Input
              value={careerCase.nextActionOverride}
              onChange={(event) =>
                setCareerCase((current) => ({ ...current, nextActionOverride: event.target.value }))
              }
              placeholder="One concrete action that can finish today"
            />
          </Field>
          <Field label="Case notes" hint="Interview evidence, objections, decisions, and outcome labels" wide>
            <Textarea
              value={careerCase.notes}
              onChange={(event) =>
                setCareerCase((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Keep facts, candidate claims, and hypotheses visibly separate."
              className="min-h-36"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeading
            number="05"
            title="Hand the case to an AI agent"
            description="Copy a bounded task with the case, ownership map, and strict prepare-only communication rules."
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void importCareerFile(event.target.files?.[0])}
            />
            <Button type="button" variant="outline" onClick={() => importRef.current?.click()}>
              <Upload aria-hidden />
              Import
            </Button>
            <Button type="button" variant="outline" onClick={downloadCareerFile}>
              <Download aria-hidden />
              Download
            </Button>
            <Button type="button" onClick={() => void copyAgentTask()}>
              <ClipboardCopy aria-hidden />
              Copy agent task
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAREER_OBJECTS.map((object) => (
            <div key={object.id} className="rounded-xl border border-border bg-background p-4">
              <p className="font-mono text-[10px] tracking-wide text-brand uppercase">{object.owner}</p>
              <h3 className="mt-1 text-sm font-semibold">{object.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{object.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-border bg-muted/35 p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="size-4 text-brand" aria-hidden />
            <h2 className="text-sm font-semibold">Operating guardrails</h2>
          </div>
          <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
            {CAREER_GUARDRAILS.map((guardrail) => (
              <li key={guardrail} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                {guardrail}
              </li>
            ))}
          </ul>
        </div>
        <Button type="button" variant="ghost" onClick={resetCareerFile}>
          <RotateCcw aria-hidden />
          Reset local file
        </Button>
      </section>
    </div>
  );
}

function SmartActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(buttonVariants({ size: "lg" }), "w-full")}
    >
      {children}
      {external ? <ExternalLink aria-hidden /> : <ArrowRight aria-hidden />}
    </Link>
  );
}

function SmartTextLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="mt-2 inline-flex items-center gap-1 rounded text-xs font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {children}
      {external ? <ExternalLink className="size-3" aria-hidden /> : <ArrowRight className="size-3" aria-hidden />}
    </Link>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {number}
      </p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  wide = false,
  children,
}: {
  label: string;
  hint: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block space-y-2", wide && "sm:col-span-2")}>
      <span className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-medium">
        {label}
        <span className="font-normal text-muted-foreground">{hint}</span>
      </span>
      {children}
    </label>
  );
}

function MetricField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-xl border border-border bg-background p-3">
      <span className="block min-h-8 text-[11px] leading-tight text-muted-foreground">{label}</span>
      <Input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 border-0 px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
      />
    </label>
  );
}

function Fact({ eyebrow, value }: { eyebrow: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
