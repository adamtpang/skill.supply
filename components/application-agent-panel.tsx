"use client";

import { useEffect, useState } from "react";
import { Bot, Check, Copy, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  HUMAN_REVIEW_FIELDS,
  applicationAgentTask,
  makeApplicationPacket,
  type ApplicationPacketInput,
} from "@/lib/application";

const SAVED_EVIDENCE_KEY = "skill.supply.application.evidence";
const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type InitialJob = Pick<ApplicationPacketInput, "company" | "title" | "url">;

const EMPTY_CANDIDATE = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  resumePath: "",
  evidence: "",
  privateAnswers: "",
};

export function ApplicationAgentPanel({ initialJob }: { initialJob: InitialJob }) {
  const [job, setJob] = useState(initialJob);
  const [candidate, setCandidate] = useState(EMPTY_CANDIDATE);
  const [status, setStatus] = useState<"idle" | "copied" | "downloaded" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedEvidence = window.sessionStorage.getItem(SAVED_EVIDENCE_KEY);
      if (savedEvidence) {
        setCandidate((current) => ({ ...current, evidence: savedEvidence }));
        window.sessionStorage.removeItem(SAVED_EVIDENCE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function setCandidateField(field: keyof typeof EMPTY_CANDIDATE, value: string) {
    setCandidate((current) => ({ ...current, [field]: value }));
  }

  function validate(): string | null {
    if (!job.url.trim()) return "Add the job application URL.";
    try {
      const url = new URL(job.url);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad protocol");
    } catch {
      return "Use a complete http or https job application URL.";
    }
    if (!job.company.trim() || !job.title.trim()) return "Add the company and role title.";
    if (!candidate.fullName.trim() || !candidate.email.trim()) {
      return "Add your full name and email so the agent can identify you honestly.";
    }
    if (!candidate.evidence.trim()) {
      return "Paste your resume, supply report, or evidence-backed background.";
    }
    return null;
  }

  function packet() {
    return makeApplicationPacket({ ...job, ...candidate });
  }

  async function copyTask() {
    const message = validate();
    if (message) {
      setError(message);
      setStatus("error");
      return;
    }
    await navigator.clipboard.writeText(applicationAgentTask(packet()));
    setError("");
    setStatus("copied");
    window.setTimeout(() => setStatus("idle"), 2500);
  }

  function downloadPacket() {
    const message = validate();
    if (message) {
      setError(message);
      setStatus("error");
      return;
    }
    const application = packet();
    const blob = new Blob([JSON.stringify(application, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug(application.job.company)}-${slug(application.job.title)}-application.json`;
    link.click();
    URL.revokeObjectURL(url);
    setError("");
    setStatus("downloaded");
    window.setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <AgentFact eyebrow="Browser" value="Your Helium session" />
        <AgentFact eyebrow="Agent" value="Browser Harness" />
        <AgentFact eyebrow="Control" value="You click Submit" />
      </section>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void copyTask();
        }}
      >
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            01 · Target
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Company">
              <input
                value={job.company}
                onChange={(event) => setJob((current) => ({ ...current, company: event.target.value }))}
                className={INPUT_CLASS}
                placeholder="Anthropic"
                autoComplete="organization"
              />
            </Field>
            <Field label="Role">
              <input
                value={job.title}
                onChange={(event) => setJob((current) => ({ ...current, title: event.target.value }))}
                className={INPUT_CLASS}
                placeholder="Software Engineer"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Application URL">
                <div className="flex gap-2">
                  <input
                    value={job.url}
                    onChange={(event) => setJob((current) => ({ ...current, url: event.target.value }))}
                    className={INPUT_CLASS}
                    placeholder="https://company.com/jobs/..."
                    inputMode="url"
                  />
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open job application in a new tab"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            02 · Candidate facts
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            These values stay in this browser until you copy or download the packet. skill.supply
            does not send or store them.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full legal name">
              <input
                value={candidate.fullName}
                onChange={(event) => setCandidateField("fullName", event.target.value)}
                className={INPUT_CLASS}
                autoComplete="name"
              />
            </Field>
            <Field label="Email">
              <input
                value={candidate.email}
                onChange={(event) => setCandidateField("email", event.target.value)}
                className={INPUT_CLASS}
                type="email"
                autoComplete="email"
              />
            </Field>
            <Field label="Phone, if you want it filled">
              <input
                value={candidate.phone}
                onChange={(event) => setCandidateField("phone", event.target.value)}
                className={INPUT_CLASS}
                type="tel"
                autoComplete="tel"
              />
            </Field>
            <Field label="Location">
              <input
                value={candidate.location}
                onChange={(event) => setCandidateField("location", event.target.value)}
                className={INPUT_CLASS}
                autoComplete="address-level2"
                placeholder="Singapore"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Resume file path on this computer, optional">
                <input
                  value={candidate.resumePath}
                  onChange={(event) => setCandidateField("resumePath", event.target.value)}
                  className={INPUT_CLASS}
                  placeholder="C:\Users\you\Documents\resume.pdf"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            03 · Evidence and private answers
          </p>
          <div className="mt-4 space-y-4">
            <Field label="Resume, supply report, or evidence-backed background">
              <Textarea
                value={candidate.evidence}
                onChange={(event) => setCandidateField("evidence", event.target.value)}
                className="min-h-52 rounded-xl bg-card p-4 text-sm leading-relaxed"
                placeholder="Paste only facts you can defend: roles, dates, shipped work, metrics, skills, and education."
              />
            </Field>
            <Field label="Candidate-supplied private answers, optional">
              <Textarea
                value={candidate.privateAnswers}
                onChange={(event) => setCandidateField("privateAnswers", event.target.value)}
                className="min-h-28 rounded-xl bg-card p-4 text-sm leading-relaxed"
                placeholder="Example: I require sponsorship. Earliest start date: 1 October. Do not answer demographic questions."
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            <div>
              <h2 className="font-semibold">The last click always belongs to you</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The agent fills facts and prepares the application. It must pause for these fields
                and must never click Submit, even after you approve the answers. You review and
                perform the final action manually.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {HUMAN_REVIEW_FIELDS.map((field) => (
                  <li key={field} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-brand" aria-hidden />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {status === "error" && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="lg" className="h-11 px-5">
            {status === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
            {status === "copied" ? "Agent task copied" : "Copy agent task"}
          </Button>
          <Button type="button" variant="outline" size="lg" className="h-11" onClick={downloadPacket}>
            {status === "downloaded" ? <Check aria-hidden /> : <Download aria-hidden />}
            {status === "downloaded" ? "Packet downloaded" : "Download packet"}
          </Button>
          <p className="basis-full text-xs leading-relaxed text-muted-foreground sm:basis-auto">
            Paste the copied task into Codex or Claude Code in this repo. The registered agent uses
            Browser Harness with Helium through Chromium&apos;s debugging connection.
          </p>
        </div>
      </form>
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

function AgentFact({ eyebrow, value }: { eyebrow: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <p className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{eyebrow}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
        {eyebrow === "Agent" && <Bot className="size-3.5 text-brand" aria-hidden />}
        {value}
      </p>
    </div>
  );
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "job"
  );
}
