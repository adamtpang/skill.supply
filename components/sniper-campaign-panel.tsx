"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Save,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CAMPAIGN_CHECKLIST_ITEMS,
  CAMPAIGN_GUARDRAILS,
  CAMPAIGN_STORAGE_KEY,
  LEGACY_CAMPAIGN_STORAGE_KEY,
  PROBLEM_HYPOTHESIS_COUNT,
  SNIPER_TARGET_COUNT,
  applicationHref,
  campaignAgentTask,
  emptyChecklist,
  emptyProblemHypothesis,
  emptyTarget,
  makeSniperCampaign,
  targetResearchAgentTask,
  targetSourceUrl,
  validateResearchTarget,
  validateSniperCampaign,
  type BudgetType,
  type CampaignChecklist,
  type CampaignChecklistId,
  type CampaignStage,
  type ChecklistStatus,
  type ContactStatus,
  type HypothesisConfidence,
  type ProblemHypothesis,
  type ProblemStatus,
  type SniperCampaignInput,
  type SniperTarget,
  type TargetMode,
  type UsageFrequency,
} from "@/lib/campaign";

const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const TEXTAREA_CLASS = "min-h-24 rounded-xl bg-card p-3 text-sm leading-relaxed";

type ActionStatus =
  | "idle"
  | "saved"
  | "copied"
  | "research-copied"
  | "downloaded"
  | "imported"
  | "error";

function freshCampaign(): SniperCampaignInput {
  return {
    candidateName: "",
    campaignName: "Daily-use dream five",
    candidateProfile: "",
    targetingPreference:
      "Prioritize companies whose products the candidate authentically uses, especially daily-use workflows. Never infer product use without candidate confirmation.",
    targets: Array.from({ length: SNIPER_TARGET_COUNT }, (_, index) => emptyTarget(index)),
  };
}

export function SniperCampaignPanel() {
  const [campaign, setCampaign] = useState<SniperCampaignInput>(freshCampaign);
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [activeTarget, setActiveTarget] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const current = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      const legacy = window.localStorage.getItem(LEGACY_CAMPAIGN_STORAGE_KEY);
      const parsed = (current ? readCampaign(current) : null) ?? (legacy ? readCampaign(legacy) : null);
      if (parsed) setCampaign(parsed);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function setTopField(
    field: "candidateName" | "campaignName" | "candidateProfile" | "targetingPreference",
    value: string,
  ) {
    setCampaign((current) => ({ ...current, [field]: value }));
  }

  function updateTarget(index: number, transform: (target: SniperTarget) => SniperTarget) {
    setCampaign((current) => ({
      ...current,
      targets: current.targets.map((target, targetIndex) =>
        targetIndex === index ? transform(target) : target,
      ),
    }));
  }

  function saveDraft() {
    const packet = makeSniperCampaign(campaign);
    window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(packet));
    setAction("saved", "Saved on this device. No server received the campaign.");
  }

  async function copyTask() {
    const error = validateSniperCampaign(campaign);
    if (error) return setAction("error", error);
    try {
      await navigator.clipboard.writeText(campaignAgentTask(makeSniperCampaign(campaign)));
      setAction("copied", "Five-target campaign agent task copied.");
    } catch {
      setAction("error", "Clipboard access was blocked. Download the JSON packet instead.");
    }
  }

  async function copyResearchTask(index: number) {
    const target = campaign.targets[index];
    const error = validateResearchTarget(target, index);
    if (error) return setAction("error", error);
    try {
      await navigator.clipboard.writeText(targetResearchAgentTask(campaign, target, index));
      setActiveTarget(index);
      setAction("research-copied", `Research task copied for ${target.company}.`);
    } catch {
      setAction("error", "Clipboard access was blocked. Save the campaign and try again.");
    }
  }

  function downloadPacket() {
    const error = validateSniperCampaign(campaign);
    if (error) return setAction("error", error);
    const packet = makeSniperCampaign(campaign);
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug(packet.candidateName)}-${slug(packet.campaignName)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setAction("downloaded", "Version 2 campaign packet downloaded.");
  }

  async function importPacket(file: File | undefined) {
    if (!file) return;
    const parsed = readCampaign(await file.text());
    if (!parsed) return setAction("error", "That file is not a five-target campaign packet.");
    setCampaign(parsed);
    setAction("imported", "Campaign imported and migrated. Review it before copying a task.");
  }

  function setAction(nextStatus: ActionStatus, nextMessage: string) {
    setStatus(nextStatus);
    setMessage(nextMessage);
    if (nextStatus !== "error") {
      window.setTimeout(() => {
        setStatus("idle");
        setActiveTarget(null);
        setMessage("");
      }, 3000);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <CampaignFact eyebrow="Target" value="Any role, company, or team" />
        <CampaignFact eyebrow="Method" value="Research, insight, proof, outreach" />
        <CampaignFact eyebrow="Control" value="You perform every external action" />
      </section>

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              01 · Source of truth
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Paste the reusable profile once. Record the kinds of companies you want, including
              whether authentic product use should be a ranking signal. The agent may not improve
              the truth.
            </p>
          </div>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => void importPacket(event.target.files?.[0])}
          />
          <Button type="button" variant="outline" onClick={() => importRef.current?.click()}>
            <Upload aria-hidden />
            Import packet
          </Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Candidate name">
            <input
              value={campaign.candidateName}
              onChange={(event) => setTopField("candidateName", event.target.value)}
              className={INPUT_CLASS}
              autoComplete="name"
            />
          </Field>
          <Field label="Campaign name">
            <input
              value={campaign.campaignName}
              onChange={(event) => setTopField("campaignName", event.target.value)}
              className={INPUT_CLASS}
              placeholder="Daily-use dream five"
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Targeting preference">
              <Textarea
                value={campaign.targetingPreference}
                onChange={(event) => setTopField("targetingPreference", event.target.value)}
                className={TEXTAREA_CLASS}
                placeholder="What makes a company worth scarce campaign time?"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="profile.md or evidence bank">
              <Textarea
                value={campaign.candidateProfile}
                onChange={(event) => setTopField("candidateProfile", event.target.value)}
                className="max-h-[520px] min-h-64 rounded-xl bg-card p-4 font-mono text-xs leading-relaxed"
                placeholder="Paste verified identity, constraints, proof IDs, story bank, and reusable answers."
              />
            </Field>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            02 · Dream five
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Start with only a company and official URL. Copy that target&apos;s research task to
            investigate budget, problems, people, useful work, Loom, email, DM, application, and
            follow-up. Every guess stays visibly labeled as a hypothesis.
          </p>
        </div>

        <div className="space-y-4">
          {campaign.targets.map((target, index) => (
            <TargetEditor
              key={target.id}
              index={index}
              target={target}
              copyingResearch={status === "research-copied" && activeTarget === index}
              onCopyResearch={() => void copyResearchTask(index)}
              onChange={(transform) => updateTarget(index, transform)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="font-semibold">Prepare deeply, act manually</h2>
            <ul className="mt-3 space-y-2">
              {CAMPAIGN_GUARDRAILS.map((rule) => (
                <li key={rule} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {message && (
        <p
          className={`rounded-lg border p-3 text-sm ${
            status === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-border bg-muted/40 text-muted-foreground"
          }`}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" className="h-11 px-5" onClick={() => void copyTask()}>
          {status === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
          {status === "copied" ? "Task copied" : "Copy five-target task"}
        </Button>
        <Button type="button" variant="outline" size="lg" className="h-11" onClick={saveDraft}>
          {status === "saved" ? <Check aria-hidden /> : <Save aria-hidden />}
          {status === "saved" ? "Saved" : "Save on device"}
        </Button>
        <Button type="button" variant="outline" size="lg" className="h-11" onClick={downloadPacket}>
          {status === "downloaded" ? <Check aria-hidden /> : <Download aria-hidden />}
          {status === "downloaded" ? "Downloaded" : "Download JSON"}
        </Button>
      </div>
    </div>
  );
}

function TargetEditor({
  index,
  target,
  copyingResearch,
  onCopyResearch,
  onChange,
}: {
  index: number;
  target: SniperTarget;
  copyingResearch: boolean;
  onCopyResearch: () => void;
  onChange: (transform: (target: SniperTarget) => SniperTarget) => void;
}) {
  const descriptor = target.mode === "open-role" ? target.roleTitle : target.team;
  const targetLabel = target.company
    ? `${target.company}${descriptor ? ` · ${descriptor}` : ""}`
    : "Unresearched target";

  function field<K extends keyof SniperTarget>(key: K, value: SniperTarget[K]) {
    onChange((current) => ({ ...current, [key]: value }));
  }

  function nested<K extends "dailyUse" | "budgetHypothesis" | "contact" | "openingMove">(
    group: K,
    key: keyof SniperTarget[K],
    value: SniperTarget[K][keyof SniperTarget[K]],
  ) {
    onChange((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value },
    }));
  }

  function problem(
    problemIndex: number,
    key: keyof ProblemHypothesis,
    value: ProblemHypothesis[keyof ProblemHypothesis],
  ) {
    onChange((current) => ({
      ...current,
      problemHypotheses: current.problemHypotheses.map((item, itemIndex) =>
        itemIndex === problemIndex ? { ...item, [key]: value } : item,
      ),
    }));
  }

  function checklist(id: CampaignChecklistId, value: ChecklistStatus) {
    onChange((current) => ({
      ...current,
      checklist: { ...current.checklist, [id]: value },
    }));
  }

  const sourceUrl = targetSourceUrl(target);

  return (
    <details className="group overflow-hidden rounded-xl border border-border bg-card" open={index === 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Target {String(index + 1).padStart(2, "0")} · {target.mode}
          </p>
          <h2 className="mt-1 truncate text-sm font-semibold sm:text-base">{targetLabel}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-1 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
          {target.stage}
        </span>
      </summary>

      <div className="space-y-7 border-t border-border p-5 sm:p-6">
        <div>
          <SectionLabel>Opportunity seed</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Target type">
              <select
                value={target.mode}
                onChange={(event) => field("mode", event.target.value as TargetMode)}
                className={INPUT_CLASS}
              >
                <option value="company-team">company or team</option>
                <option value="open-role">live open role</option>
              </select>
            </Field>
            <Field label="Company">
              <input
                value={target.company}
                onChange={(event) => field("company", event.target.value)}
                className={INPUT_CLASS}
                placeholder="A product you actually use"
              />
            </Field>
            <Field label="Team or problem owner">
              <input
                value={target.team}
                onChange={(event) => field("team", event.target.value)}
                className={INPUT_CLASS}
                placeholder="Agents, developer experience, growth"
              />
            </Field>
            <Field label="Official company or team URL">
              <UrlInput
                value={target.companyUrl}
                onChange={(value) => field("companyUrl", value)}
                label={`Open ${target.company || "company"} page`}
              />
            </Field>
            {target.mode === "open-role" && (
              <>
                <Field label="Role title">
                  <input
                    value={target.roleTitle}
                    onChange={(event) => field("roleTitle", event.target.value)}
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Official role URL">
                  <UrlInput
                    value={target.roleUrl}
                    onChange={(value) => field("roleUrl", value)}
                    label={`Open ${target.company || "target"} role`}
                  />
                </Field>
              </>
            )}
            <Field label="Location or work model">
              <input
                value={target.location}
                onChange={(event) => field("location", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Official source checked at">
              <input
                value={target.sourceCheckedAt}
                onChange={(event) => field("sourceCheckedAt", event.target.value)}
                className={INPUT_CLASS}
                placeholder="YYYY-MM-DD"
              />
            </Field>
            <Field label="Campaign stage">
              <select
                value={target.stage}
                onChange={(event) => field("stage", event.target.value as CampaignStage)}
                className={INPUT_CLASS}
              >
                {(["research", "contact", "artifact", "apply", "follow-up", "closed"] as const).map(
                  (stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ),
                )}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Concrete fit verdict">
                <Textarea
                  value={target.fitVerdict}
                  onChange={(event) => field("fitVerdict", event.target.value)}
                  className={TEXTAREA_CLASS}
                  placeholder="Why this company or team deserves scarce campaign time."
                />
              </Field>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={onCopyResearch}>
              {copyingResearch ? <Check aria-hidden /> : <Search aria-hidden />}
              {copyingResearch ? "Research task copied" : "Copy research task"}
            </Button>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Open source
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>

        <div>
          <SectionLabel>Authentic product use</SectionLabel>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Product affinity is a strong ranking signal only after the candidate confirms the real
            workflow. Browser history or project files are not permission to claim daily use.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Product used">
              <input
                value={target.dailyUse.product}
                onChange={(event) => nested("dailyUse", "product", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Frequency">
              <select
                value={target.dailyUse.frequency}
                onChange={(event) =>
                  nested("dailyUse", "frequency", event.target.value as UsageFrequency)
                }
                className={INPUT_CLASS}
              >
                {(["unconfirmed", "daily", "weekly", "monthly", "rarely"] as const).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Real workflow">
              <Textarea
                value={target.dailyUse.workflow}
                onChange={(event) => nested("dailyUse", "workflow", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Observed friction or delight">
              <Textarea
                value={target.dailyUse.observedFriction}
                onChange={(event) => nested("dailyUse", "observedFriction", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <label className="flex items-start gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={target.dailyUse.confirmedByCandidate}
                onChange={(event) =>
                  nested("dailyUse", "confirmedByCandidate", event.target.checked)
                }
                className="mt-0.5 size-4 rounded border-input"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                Candidate confirms this product, frequency, and workflow are accurate.
              </span>
            </label>
          </div>
        </div>

        <div>
          <SectionLabel>Budget hypothesis</SectionLabel>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            This is a decision aid, not inside information. The range needs public signals,
            assumptions, and an honest confidence level.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Budget type">
              <select
                value={target.budgetHypothesis.type}
                onChange={(event) =>
                  nested("budgetHypothesis", "type", event.target.value as BudgetType)
                }
                className={INPUT_CLASS}
              >
                {(["unknown", "role", "team", "project"] as const).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estimated range, currency and period">
              <input
                value={target.budgetHypothesis.range}
                onChange={(event) => nested("budgetHypothesis", "range", event.target.value)}
                className={INPUT_CLASS}
                placeholder="Unknown, or sourced estimate such as USD X to Y per year"
              />
            </Field>
            <Field label="Confidence">
              <select
                value={target.budgetHypothesis.confidence}
                onChange={(event) =>
                  nested(
                    "budgetHypothesis",
                    "confidence",
                    event.target.value as HypothesisConfidence,
                  )
                }
                className={INPUT_CLASS}
              >
                {(["low", "medium", "high"] as const).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Dated source URLs">
              <Textarea
                value={target.budgetHypothesis.sourceUrls}
                onChange={(event) => nested("budgetHypothesis", "sourceUrls", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Evidence and reasoning bridge">
              <Textarea
                value={target.budgetHypothesis.basis}
                onChange={(event) => nested("budgetHypothesis", "basis", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Assumptions and holes">
              <Textarea
                value={target.budgetHypothesis.assumptions}
                onChange={(event) => nested("budgetHypothesis", "assumptions", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
          </div>
        </div>

        <div>
          <SectionLabel>Problem hypotheses</SectionLabel>
          <div className="mt-3 space-y-3">
            {target.problemHypotheses.map((item, problemIndex) => (
              <div key={item.id} className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  Hypothesis {problemIndex + 1}
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Problem">
                    <Textarea
                      value={item.problem}
                      onChange={(event) => problem(problemIndex, "problem", event.target.value)}
                      className={TEXTAREA_CLASS}
                    />
                  </Field>
                  <Field label="Likely owner">
                    <Textarea
                      value={item.ownerPersona}
                      onChange={(event) => problem(problemIndex, "ownerPersona", event.target.value)}
                      className={TEXTAREA_CLASS}
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={item.status}
                      onChange={(event) =>
                        problem(problemIndex, "status", event.target.value as ProblemStatus)
                      }
                      className={INPUT_CLASS}
                    >
                      {(["observed", "inferred", "validated"] as const).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Confidence">
                    <select
                      value={item.confidence}
                      onChange={(event) =>
                        problem(
                          problemIndex,
                          "confidence",
                          event.target.value as HypothesisConfidence,
                        )
                      }
                      className={INPUT_CLASS}
                    >
                      {(["low", "medium", "high"] as const).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Evidence">
                    <Textarea
                      value={item.evidence}
                      onChange={(event) => problem(problemIndex, "evidence", event.target.value)}
                      className={TEXTAREA_CLASS}
                    />
                  </Field>
                  <Field label="Source URL">
                    <input
                      value={item.sourceUrl}
                      onChange={(event) => problem(problemIndex, "sourceUrl", event.target.value)}
                      className={INPUT_CLASS}
                      inputMode="url"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Cost of inaction">
                      <Textarea
                        value={item.costOfInaction}
                        onChange={(event) =>
                          problem(problemIndex, "costOfInaction", event.target.value)
                        }
                        className={TEXTAREA_CLASS}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Candidate proof</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Proof of fit, use profile evidence IDs">
              <Textarea
                value={target.proofOfFit}
                onChange={(event) => field("proofOfFit", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Honest gap or risk">
              <Textarea
                value={target.honestGap}
                onChange={(event) => field("honestGap", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
          </div>
        </div>

        <div>
          <SectionLabel>Human path</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Person, or team persona until verified">
              <input
                value={target.contact.name}
                onChange={(event) => nested("contact", "name", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Role or relationship to the problem">
              <input
                value={target.contact.role}
                onChange={(event) => nested("contact", "role", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Public professional URL">
              <input
                value={target.contact.url}
                onChange={(event) => nested("contact", "url", event.target.value)}
                className={INPUT_CLASS}
                inputMode="url"
              />
            </Field>
            <Field label="Verification status">
              <select
                value={target.contact.status}
                onChange={(event) =>
                  nested("contact", "status", event.target.value as ContactStatus)
                }
                className={INPUT_CLASS}
              >
                <option value="unverified">unverified</option>
                <option value="team-persona">team persona</option>
                <option value="verified-person">verified person</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Why this is the right person">
                <Textarea
                  value={target.contact.whyThisPerson}
                  onChange={(event) => nested("contact", "whyThisPerson", event.target.value)}
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Useful opening move</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Useful research or insight">
              <Textarea
                value={target.openingMove.usefulInsight}
                onChange={(event) => nested("openingMove", "usefulInsight", event.target.value)}
                className={TEXTAREA_CLASS}
                placeholder="A concise finding the team can use even if no role exists."
              />
            </Field>
            <Field label="Specific low-friction ask">
              <Textarea
                value={target.openingMove.ask}
                onChange={(event) => nested("openingMove", "ask", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Proof artifact title">
              <input
                value={target.openingMove.artifactTitle}
                onChange={(event) => nested("openingMove", "artifactTitle", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Artifact scope and finish line">
              <Textarea
                value={target.openingMove.artifactScope}
                onChange={(event) => nested("openingMove", "artifactScope", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Loom outline">
              <Textarea
                value={target.openingMove.loomOutline}
                onChange={(event) => nested("openingMove", "loomOutline", event.target.value)}
                className={TEXTAREA_CLASS}
              />
            </Field>
            <Field label="Email draft, candidate sends manually">
              <Textarea
                value={target.openingMove.emailDraft}
                onChange={(event) => nested("openingMove", "emailDraft", event.target.value)}
                className="min-h-32 rounded-xl bg-card p-3 text-sm leading-relaxed"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="DM draft, candidate sends manually">
                <Textarea
                  value={target.openingMove.dmDraft}
                  onChange={(event) => nested("openingMove", "dmDraft", event.target.value)}
                  className="min-h-28 rounded-xl bg-card p-3 text-sm leading-relaxed"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Follow-up draft, candidate sends manually">
                <Textarea
                  value={target.openingMove.followUpDraft}
                  onChange={(event) => nested("openingMove", "followUpDraft", event.target.value)}
                  className="min-h-24 rounded-xl bg-card p-3 text-sm leading-relaxed"
                />
              </Field>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>Proactive checklist</SectionLabel>
          <div className="mt-3 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {CAMPAIGN_CHECKLIST_ITEMS.map((item) => (
              <label key={item.id} className="flex items-center justify-between gap-3 bg-card p-3">
                <span className="text-xs leading-relaxed text-muted-foreground">{item.label}</span>
                <select
                  value={target.checklist[item.id]}
                  onChange={(event) => checklist(item.id, event.target.value as ChecklistStatus)}
                  className="h-8 max-w-40 rounded-lg border border-input bg-card px-2 text-[11px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label={`${item.label} status`}
                >
                  {(
                    [
                      "not-started",
                      "researching",
                      "drafted",
                      "ready-for-adam",
                      "completed-by-adam",
                      "skipped",
                    ] as const
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Next move</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="One action for the candidate, not a list">
              <input
                value={target.nextAction}
                onChange={(event) => field("nextAction", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            {target.mode === "open-role" && target.company && target.roleTitle && target.roleUrl && (
              <a
                href={applicationHref(target)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Prepare application
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}

function UrlInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
        inputMode="url"
      />
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

function CampaignFact({ eyebrow, value }: { eyebrow: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function readCampaign(raw: string): SniperCampaignInput | null {
  try {
    const value = JSON.parse(raw) as unknown;
    if (
      !isRecord(value) ||
      typeof value.candidateName !== "string" ||
      typeof value.campaignName !== "string" ||
      typeof value.candidateProfile !== "string" ||
      !Array.isArray(value.targets) ||
      value.targets.length !== SNIPER_TARGET_COUNT
    ) {
      return null;
    }
    return {
      candidateName: value.candidateName,
      campaignName: value.campaignName,
      candidateProfile: value.candidateProfile,
      targetingPreference:
        textValue(value.targetingPreference) ||
        "Prioritize companies whose products the candidate authentically uses. Confirm the product, frequency, and workflow before making that claim.",
      targets: value.targets.map(hydrateTarget),
    };
  } catch {
    return null;
  }
}

function hydrateTarget(value: unknown, index: number): SniperTarget {
  const base = emptyTarget(index);
  if (!isRecord(value)) return base;
  const rawDailyUse = isRecord(value.dailyUse) ? value.dailyUse : {};
  const rawBudget = isRecord(value.budgetHypothesis) ? value.budgetHypothesis : {};
  const rawContact = isRecord(value.contact) ? value.contact : {};
  const rawMove = isRecord(value.openingMove) ? value.openingMove : {};
  const mode = isTargetMode(value.mode)
    ? value.mode
    : textValue(value.roleTitle) && textValue(value.roleUrl)
      ? "open-role"
      : "company-team";
  const stage = isCampaignStage(value.stage) ? value.stage : base.stage;
  const legacyPain = textValue(value.hiringPain);
  const legacyEvidence = textValue(value.painEvidence);
  const rawProblems = Array.isArray(value.problemHypotheses) ? value.problemHypotheses : [];
  const problemHypotheses = Array.from({ length: PROBLEM_HYPOTHESIS_COUNT }, (_, problemIndex) => {
    const rawProblem = rawProblems[problemIndex];
    if (isRecord(rawProblem)) return hydrateProblem(rawProblem, problemIndex);
    if (problemIndex === 0 && (legacyPain || legacyEvidence)) {
      return {
        ...emptyProblemHypothesis(0),
        problem: legacyPain,
        status: "inferred" as const,
        confidence: legacyEvidence ? ("medium" as const) : ("low" as const),
        evidence: legacyEvidence,
        sourceUrl: textValue(value.roleUrl),
      };
    }
    return emptyProblemHypothesis(problemIndex);
  });

  return {
    id: textValue(value.id) || base.id,
    mode,
    company: textValue(value.company),
    team: textValue(value.team),
    companyUrl: textValue(value.companyUrl),
    roleTitle: textValue(value.roleTitle),
    roleUrl: textValue(value.roleUrl),
    location: textValue(value.location),
    sourceCheckedAt: textValue(value.sourceCheckedAt),
    fitVerdict: textValue(value.fitVerdict),
    dailyUse: {
      product: textValue(rawDailyUse.product),
      frequency: isUsageFrequency(rawDailyUse.frequency)
        ? rawDailyUse.frequency
        : base.dailyUse.frequency,
      workflow: textValue(rawDailyUse.workflow),
      observedFriction: textValue(rawDailyUse.observedFriction),
      confirmedByCandidate: rawDailyUse.confirmedByCandidate === true,
    },
    budgetHypothesis: {
      type: isBudgetType(rawBudget.type) ? rawBudget.type : base.budgetHypothesis.type,
      range: textValue(rawBudget.range),
      confidence: isHypothesisConfidence(rawBudget.confidence)
        ? rawBudget.confidence
        : base.budgetHypothesis.confidence,
      basis: textValue(rawBudget.basis),
      sourceUrls: textValue(rawBudget.sourceUrls),
      assumptions: textValue(rawBudget.assumptions),
    },
    problemHypotheses,
    proofOfFit: textValue(value.proofOfFit),
    honestGap: textValue(value.honestGap),
    contact: {
      name: textValue(rawContact.name),
      role: textValue(rawContact.role),
      url: textValue(rawContact.url),
      status: isContactStatus(rawContact.status) ? rawContact.status : base.contact.status,
      whyThisPerson: textValue(rawContact.whyThisPerson),
    },
    openingMove: {
      artifactTitle: textValue(rawMove.artifactTitle),
      artifactScope: textValue(rawMove.artifactScope),
      usefulInsight: textValue(rawMove.usefulInsight),
      loomOutline: textValue(rawMove.loomOutline),
      emailDraft: textValue(rawMove.emailDraft),
      dmDraft: textValue(rawMove.dmDraft) || textValue(rawMove.message),
      followUpDraft: textValue(rawMove.followUpDraft),
      ask: textValue(rawMove.ask),
    },
    checklist: hydrateChecklist(value.checklist, {
      legacyPain,
      legacyEvidence,
      contactName: textValue(rawContact.name),
      artifactScope: textValue(rawMove.artifactScope),
      loomOutline: textValue(rawMove.loomOutline),
      message: textValue(rawMove.message),
    }),
    stage,
    nextAction: textValue(value.nextAction),
  };
}

function hydrateProblem(value: Record<string, unknown>, index: number): ProblemHypothesis {
  const base = emptyProblemHypothesis(index);
  return {
    id: textValue(value.id) || base.id,
    problem: textValue(value.problem),
    status: isProblemStatus(value.status) ? value.status : base.status,
    confidence: isHypothesisConfidence(value.confidence) ? value.confidence : base.confidence,
    ownerPersona: textValue(value.ownerPersona),
    evidence: textValue(value.evidence),
    sourceUrl: textValue(value.sourceUrl),
    costOfInaction: textValue(value.costOfInaction),
  };
}

function hydrateChecklist(
  value: unknown,
  legacy: {
    legacyPain: string;
    legacyEvidence: string;
    contactName: string;
    artifactScope: string;
    loomOutline: string;
    message: string;
  },
): CampaignChecklist {
  const base = emptyChecklist();
  if (isRecord(value)) {
    for (const item of CAMPAIGN_CHECKLIST_ITEMS) {
      const status = value[item.id];
      if (isChecklistStatus(status)) base[item.id] = status;
    }
    return base;
  }

  if (legacy.legacyEvidence) base["research-company"] = "drafted";
  if (legacy.contactName) base["map-team"] = "drafted";
  if (legacy.legacyPain) base["problem-hypotheses"] = "drafted";
  if (legacy.artifactScope) base["proof-artifact"] = "drafted";
  if (legacy.loomOutline) base.loom = "drafted";
  if (legacy.message) base.dm = "drafted";
  return base;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isTargetMode(value: unknown): value is TargetMode {
  return ["open-role", "company-team"].includes(value as TargetMode);
}

function isCampaignStage(value: unknown): value is CampaignStage {
  return ["research", "contact", "artifact", "apply", "follow-up", "closed"].includes(
    value as CampaignStage,
  );
}

function isContactStatus(value: unknown): value is ContactStatus {
  return ["verified-person", "team-persona", "unverified"].includes(value as ContactStatus);
}

function isHypothesisConfidence(value: unknown): value is HypothesisConfidence {
  return ["low", "medium", "high"].includes(value as HypothesisConfidence);
}

function isProblemStatus(value: unknown): value is ProblemStatus {
  return ["observed", "inferred", "validated"].includes(value as ProblemStatus);
}

function isBudgetType(value: unknown): value is BudgetType {
  return ["role", "team", "project", "unknown"].includes(value as BudgetType);
}

function isUsageFrequency(value: unknown): value is UsageFrequency {
  return ["daily", "weekly", "monthly", "rarely", "unconfirmed"].includes(
    value as UsageFrequency,
  );
}

function isChecklistStatus(value: unknown): value is ChecklistStatus {
  return [
    "not-started",
    "researching",
    "drafted",
    "ready-for-adam",
    "completed-by-adam",
    "skipped",
  ].includes(value as ChecklistStatus);
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "campaign"
  );
}
