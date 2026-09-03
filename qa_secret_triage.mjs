import assert from "node:assert/strict";
import {
  SECRET_ALERT_CASES,
  SECRET_TRIAGE_EVALUATIONS,
  SECRET_TRIAGE_SCORECARD,
  evaluateSecretAlert,
} from "./lib/secret-triage.ts";

assert.equal(SECRET_ALERT_CASES.length, 6, "The proof contract requires six fixtures");
assert.equal(SECRET_TRIAGE_SCORECARD.passed, 6, "Every known-ground-truth fixture must pass");
assert.equal(SECRET_TRIAGE_SCORECARD.rawSecretDisclosures, 0);
assert.equal(SECRET_TRIAGE_SCORECARD.automaticRevocations, 0);
assert.equal(SECRET_TRIAGE_SCORECARD.automaticClosures, 0);
assert.equal(SECRET_TRIAGE_SCORECARD.missingOwnersRouted, 1);
assert.ok(SECRET_TRIAGE_EVALUATIONS.every((result) => result.passed));
assert.ok(
  SECRET_ALERT_CASES.every((fixture) => fixture.syntheticFingerprint.startsWith("SYNTH-FP-")),
  "Every fingerprint must be visibly synthetic",
);

const decisions = new Map(
  SECRET_TRIAGE_EVALUATIONS.map((result) => [result.id, result.actualDecision]),
);

assert.equal(decisions.get("active-public-owned"), "escalate-owner");
assert.equal(decisions.get("active-public-unowned"), "escalate-security");
assert.equal(decisions.get("generic-public-comment"), "investigate-evidence");
assert.equal(decisions.get("inactive-private-fixture"), "propose-dismissal");
assert.equal(decisions.get("duplicate-public-event"), "deduplicate-event");
assert.equal(decisions.get("unknown-private-owned"), "investigate-evidence");

const unownedActive = evaluateSecretAlert({
  ...SECRET_ALERT_CASES[0],
  id: "active-private-unowned",
  exposure: "private",
  owner: null,
});
assert.equal(unownedActive.actualDecision, "escalate-security");

const inactiveButUnverified = evaluateSecretAlert({
  ...SECRET_ALERT_CASES[3],
  id: "inactive-not-fixture",
  isKnownFixture: false,
});
assert.equal(inactiveButUnverified.actualDecision, "investigate-evidence");
assert.equal(inactiveButUnverified.actualPriority, "medium");

console.log(
  JSON.stringify(
    {
      cases: SECRET_TRIAGE_SCORECARD.cases,
      passed: SECRET_TRIAGE_SCORECARD.passed,
      rawSecretDisclosures: SECRET_TRIAGE_SCORECARD.rawSecretDisclosures,
      automaticRevocations: SECRET_TRIAGE_SCORECARD.automaticRevocations,
      automaticClosures: SECRET_TRIAGE_SCORECARD.automaticClosures,
      missingOwnersRouted: SECRET_TRIAGE_SCORECARD.missingOwnersRouted,
    },
    null,
    2,
  ),
);

