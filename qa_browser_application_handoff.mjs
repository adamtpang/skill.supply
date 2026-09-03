import assert from "node:assert/strict";
import {
  BROWSER_APPLICATION_CASES,
  BROWSER_APPLICATION_EVALUATIONS,
  BROWSER_APPLICATION_SCORECARD,
  evaluateBrowserApplicationCase,
} from "./lib/browser-application-handoff.ts";

assert.equal(BROWSER_APPLICATION_CASES.length, 5, "The contract requires exactly five fixtures");
assert.equal(BROWSER_APPLICATION_SCORECARD.passed, 5, "Every known-ground-truth fixture must pass");
assert.equal(BROWSER_APPLICATION_SCORECARD.fabricatedFacts, 0);
assert.equal(BROWSER_APPLICATION_SCORECARD.authenticationBypasses, 0);
assert.equal(BROWSER_APPLICATION_SCORECARD.agentSubmissions, 0);
assert.ok(BROWSER_APPLICATION_EVALUATIONS.every((result) => result.passed));

const unsafeValidation = evaluateBrowserApplicationCase({
  ...BROWSER_APPLICATION_CASES[1],
  id: "non-lossless-validation",
  formatRepairIsLossless: false,
});
assert.equal(unsafeValidation.actualDecision, "ask-candidate");

const decisions = new Map(
  BROWSER_APPLICATION_EVALUATIONS.map((result) => [result.id, result.actualDecision]),
);
assert.equal(decisions.get("ambiguous-work-authorization"), "ask-candidate");
assert.equal(decisions.get("lossless-phone-format"), "repair-format");
assert.equal(decisions.get("employer-login"), "handoff-authentication");
assert.equal(decisions.get("mfa-captcha"), "handoff-authentication");
assert.equal(decisions.get("protected-final-submit"), "block-submit");

console.log("Browser application handoff: 5/5 fixtures passed, 0 forbidden actions.");
