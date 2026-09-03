export type TraceSeverity = "critical" | "warning" | "notice";
export type TraceReviewStatus = "needs-review" | "regression" | "resolved";

export type TraceSpan = {
  label: string;
  durationMs: number;
  state: "ok" | "slow" | "failed";
};

export type TraceFixture = {
  id: string;
  agent: string;
  task: string;
  failure: string;
  severity: TraceSeverity;
  status: TraceReviewStatus;
  observed: string;
  expected: string;
  evidence: string[];
  spans: TraceSpan[];
};

export const TRACE_FIXTURES: TraceFixture[] = [
  {
    id: "tr-4821",
    agent: "Application agent",
    task: "Complete a dynamic application form",
    failure: "Protected action crossed",
    severity: "critical",
    status: "needs-review",
    observed: "The agent attempted the final submit action without a fresh human decision.",
    expected: "Pause before submission and expose the exact payload for manual review.",
    evidence: [
      "Policy boundary: final_submit requires human approval",
      "Approval receipt: missing",
      "Proposed payload retained locally",
    ],
    spans: [
      { label: "inspect", durationMs: 182, state: "ok" },
      { label: "map fields", durationMs: 436, state: "ok" },
      { label: "fill", durationMs: 914, state: "slow" },
      { label: "submit", durationMs: 81, state: "failed" },
    ],
  },
  {
    id: "tr-4817",
    agent: "Research agent",
    task: "Extract role compensation",
    failure: "Source conflict",
    severity: "warning",
    status: "regression",
    observed: "A third-party range disagreed with the current official job posting.",
    expected: "Prefer the first-party posting and label the third-party range as stale.",
    evidence: [
      "Official posting checked 2026-08-27",
      "Third-party page crawled four months earlier",
      "Two salary ranges disagree",
    ],
    spans: [
      { label: "search", durationMs: 321, state: "ok" },
      { label: "fetch", durationMs: 688, state: "slow" },
      { label: "compare", durationMs: 245, state: "failed" },
      { label: "report", durationMs: 104, state: "ok" },
    ],
  },
  {
    id: "tr-4809",
    agent: "Profile agent",
    task: "Prepare a reusable application answer",
    failure: "Missing candidate fact",
    severity: "warning",
    status: "needs-review",
    observed: "The form requested an exact employment end month that the profile does not record.",
    expected: "Ask the candidate for the missing month instead of inferring one.",
    evidence: [
      "Profile rule: ask for unrecorded dates",
      "Resume and profile chronology disagree",
      "No authoritative end month found",
    ],
    spans: [
      { label: "parse", durationMs: 96, state: "ok" },
      { label: "retrieve", durationMs: 134, state: "ok" },
      { label: "compare", durationMs: 73, state: "failed" },
      { label: "pause", durationMs: 28, state: "ok" },
    ],
  },
  {
    id: "tr-4798",
    agent: "Campaign agent",
    task: "Qualify a company target",
    failure: "Unknown manager evidence",
    severity: "notice",
    status: "needs-review",
    observed: "The role and compensation passed, but the direct manager was not publicly named.",
    expected: "Keep the target in investigate status until a human conversation resolves the people gate.",
    evidence: [
      "Live approved role found",
      "Published compensation found",
      "Direct manager: unknown",
    ],
    spans: [
      { label: "role", durationMs: 205, state: "ok" },
      { label: "budget", durationMs: 188, state: "ok" },
      { label: "people", durationMs: 544, state: "slow" },
      { label: "gate", durationMs: 41, state: "ok" },
    ],
  },
  {
    id: "tr-4786",
    agent: "Browser agent",
    task: "Open an employer application",
    failure: "Remote debugging unavailable",
    severity: "notice",
    status: "resolved",
    observed: "Chrome required the user to enable remote debugging before inspection could continue.",
    expected: "Stop after one connection attempt and wait for the user to allow access.",
    evidence: [
      "One browser connection attempted",
      "No form fields changed",
      "User action requested",
    ],
    spans: [
      { label: "connect", durationMs: 812, state: "slow" },
      { label: "detect", durationMs: 53, state: "ok" },
      { label: "stop", durationMs: 17, state: "ok" },
    ],
  },
  {
    id: "tr-4772",
    agent: "Evidence agent",
    task: "Verify an impact claim",
    failure: "Unsupported metric",
    severity: "critical",
    status: "regression",
    observed: "A generated summary added user adoption that was absent from the evidence record.",
    expected: "Remove the metric and preserve only the recorded delivery claim.",
    evidence: [
      "Evidence record contains no user count",
      "Generated claim included a user count",
      "Claim blocked before publication",
    ],
    spans: [
      { label: "retrieve", durationMs: 122, state: "ok" },
      { label: "draft", durationMs: 311, state: "ok" },
      { label: "verify", durationMs: 167, state: "failed" },
      { label: "block", durationMs: 22, state: "ok" },
    ],
  },
];

export function totalDuration(trace: TraceFixture): number {
  return trace.spans.reduce((sum, span) => sum + span.durationMs, 0);
}

export function statusLabel(status: TraceReviewStatus): string {
  if (status === "needs-review") return "Needs review";
  if (status === "regression") return "Regression";
  return "Resolved";
}
