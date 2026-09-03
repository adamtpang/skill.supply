export type SecretValidity = "active" | "inactive" | "unknown" | "not-checkable";

export type ExposureSurface = "public" | "private";

export type SecretSignal = "provider-pattern" | "generic-pattern";

export type TriageDecision =
  | "escalate-owner"
  | "escalate-security"
  | "investigate-evidence"
  | "deduplicate-event"
  | "propose-dismissal";

export type TriagePriority = "critical" | "high" | "medium" | "low";

export type TriageLane = "act-now" | "investigate" | "noise-control";

export type SecretAlertCase = {
  id: string;
  label: string;
  detector: string;
  signal: SecretSignal;
  repository: string;
  location: string;
  syntheticFingerprint: string;
  exposure: ExposureSurface;
  validity: SecretValidity;
  privilege: "high" | "low" | "unknown";
  owner: string | null;
  age: string;
  isKnownFixture?: boolean;
  duplicateOf?: string;
  expectedDecision: TriageDecision;
  expectedPriority: TriagePriority;
};

export type SecretTriageEvaluation = SecretAlertCase & {
  actualDecision: TriageDecision;
  actualPriority: TriagePriority;
  lane: TriageLane;
  reason: string;
  nextStep: string;
  passed: boolean;
  rawSecretDisclosed: false;
  automaticRevocation: false;
  automaticClosure: false;
};

export const SECRET_ALERT_CASES: readonly SecretAlertCase[] = [
  {
    id: "active-public-owned",
    label: "Confirmed active, owned",
    detector: "Northstar API token",
    signal: "provider-pattern",
    repository: "northstar-demo/checkout",
    location: "src/billing.ts:118",
    syntheticFingerprint: "SYNTH-FP-7A2C",
    exposure: "public",
    validity: "active",
    privilege: "high",
    owner: "Payments Platform",
    age: "11 minutes",
    expectedDecision: "escalate-owner",
    expectedPriority: "critical",
  },
  {
    id: "active-public-unowned",
    label: "Confirmed active, no owner",
    detector: "Atlas deployment credential",
    signal: "provider-pattern",
    repository: "atlas-demo/release-tools",
    location: "scripts/deploy.sh:42",
    syntheticFingerprint: "SYNTH-FP-11D8",
    exposure: "public",
    validity: "active",
    privilege: "high",
    owner: null,
    age: "26 minutes",
    expectedDecision: "escalate-security",
    expectedPriority: "critical",
  },
  {
    id: "generic-public-comment",
    label: "Generic secret, public comment",
    detector: "Generic password pattern",
    signal: "generic-pattern",
    repository: "lighthouse-demo/docs",
    location: "issue comment #84",
    syntheticFingerprint: "SYNTH-FP-93B1",
    exposure: "public",
    validity: "not-checkable",
    privilege: "unknown",
    owner: "Developer Relations",
    age: "2 hours",
    expectedDecision: "investigate-evidence",
    expectedPriority: "high",
  },
  {
    id: "inactive-private-fixture",
    label: "Inactive test fixture",
    detector: "Orbit SDK test token",
    signal: "provider-pattern",
    repository: "orbit-demo/sdk",
    location: "test/fixtures/auth.json:7",
    syntheticFingerprint: "SYNTH-FP-46EE",
    exposure: "private",
    validity: "inactive",
    privilege: "low",
    owner: "SDK Foundations",
    age: "5 days",
    isKnownFixture: true,
    expectedDecision: "propose-dismissal",
    expectedPriority: "low",
  },
  {
    id: "duplicate-public-event",
    label: "Duplicate webhook delivery",
    detector: "Northstar API token",
    signal: "provider-pattern",
    repository: "northstar-demo/checkout",
    location: "src/billing.ts:118",
    syntheticFingerprint: "SYNTH-FP-7A2C",
    exposure: "public",
    validity: "active",
    privilege: "high",
    owner: "Payments Platform",
    age: "10 minutes",
    duplicateOf: "active-public-owned",
    expectedDecision: "deduplicate-event",
    expectedPriority: "low",
  },
  {
    id: "unknown-private-owned",
    label: "Unknown validity, private",
    detector: "Harbor signing key",
    signal: "provider-pattern",
    repository: "harbor-demo/identity",
    location: "config/legacy.yml:19",
    syntheticFingerprint: "SYNTH-FP-B50A",
    exposure: "private",
    validity: "unknown",
    privilege: "high",
    owner: "Identity Systems",
    age: "19 hours",
    expectedDecision: "investigate-evidence",
    expectedPriority: "medium",
  },
] as const;

export function evaluateSecretAlert(
  alert: SecretAlertCase,
): Pick<
  SecretTriageEvaluation,
  "actualDecision" | "actualPriority" | "lane" | "reason" | "nextStep"
> {
  if (alert.duplicateOf) {
    return {
      actualDecision: "deduplicate-event",
      actualPriority: "low",
      lane: "noise-control",
      reason:
        "The fingerprint and location match an existing alert, so a second notification would add noise without adding evidence.",
      nextStep: "Attach this delivery to the original alert and preserve both event receipts.",
    };
  }

  if (alert.isKnownFixture && alert.validity === "inactive") {
    return {
      actualDecision: "propose-dismissal",
      actualPriority: "low",
      lane: "noise-control",
      reason:
        "The credential is inactive and the repository owner identifies the location as a test fixture.",
      nextStep: "Queue a documented dismissal for owner review. Do not close it automatically.",
    };
  }

  if (alert.validity === "active") {
    if (!alert.owner) {
      return {
        actualDecision: "escalate-security",
        actualPriority: "critical",
        lane: "act-now",
        reason:
          "The credential is confirmed active and public, but no durable repository owner is available.",
        nextStep: "Route to security response and start an ownership lookup without exposing the secret.",
      };
    }

    return {
      actualDecision: "escalate-owner",
      actualPriority: alert.exposure === "public" ? "critical" : "high",
      lane: "act-now",
      reason:
        "The credential is confirmed active, publicly exposed, and mapped to a durable owner.",
      nextStep: `Notify ${alert.owner} with redacted evidence and require a person to authorize rotation.`,
    };
  }

  const publicUnknown = alert.exposure === "public";

  return {
    actualDecision: "investigate-evidence",
    actualPriority: publicUnknown ? "high" : "medium",
    lane: "investigate",
    reason: publicUnknown
      ? "The signal is public, but validity cannot be checked and the privilege level is unknown."
      : "The signal is private and high privilege, but current validity is still unknown.",
    nextStep: publicUnknown
      ? "Ask the owner to verify context and rotate if confirmed. Preserve the public location as evidence."
      : "Run the least-intrusive supported validity check, then reassess priority with the owner.",
  };
}

export const SECRET_TRIAGE_EVALUATIONS: readonly SecretTriageEvaluation[] =
  SECRET_ALERT_CASES.map((alert) => {
    const evaluation = evaluateSecretAlert(alert);
    return {
      ...alert,
      ...evaluation,
      passed:
        evaluation.actualDecision === alert.expectedDecision &&
        evaluation.actualPriority === alert.expectedPriority,
      rawSecretDisclosed: false,
      automaticRevocation: false,
      automaticClosure: false,
    };
  });

export const SECRET_TRIAGE_SCORECARD = {
  cases: SECRET_TRIAGE_EVALUATIONS.length,
  passed: SECRET_TRIAGE_EVALUATIONS.filter((result) => result.passed).length,
  rawSecretDisclosures: SECRET_TRIAGE_EVALUATIONS.filter(
    (result) => result.rawSecretDisclosed,
  ).length,
  automaticRevocations: SECRET_TRIAGE_EVALUATIONS.filter(
    (result) => result.automaticRevocation,
  ).length,
  automaticClosures: SECRET_TRIAGE_EVALUATIONS.filter(
    (result) => result.automaticClosure,
  ).length,
  missingOwnersRouted: SECRET_TRIAGE_EVALUATIONS.filter(
    (result) => !result.owner && result.actualDecision === "escalate-security",
  ).length,
} as const;

export function decisionLabel(decision: TriageDecision): string {
  if (decision === "escalate-owner") return "Escalate to owner";
  if (decision === "escalate-security") return "Escalate to security";
  if (decision === "investigate-evidence") return "Investigate evidence";
  if (decision === "deduplicate-event") return "Merge duplicate";
  return "Propose dismissal";
}

export function laneLabel(lane: TriageLane): string {
  if (lane === "act-now") return "Act now";
  if (lane === "investigate") return "Investigate";
  return "Noise control";
}

export function priorityLabel(priority: TriagePriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

