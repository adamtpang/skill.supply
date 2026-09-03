# Browser-agent reliability: attribute the failure before retrying

Prepared for Spur on 2026-08-29 from public product material and Adam Pangelinan's public Helium Harness work. This is a proposed evaluation contract, not a claim about Spur's private architecture or measured performance.

## The decision

A browser-agent run should not return only `passed` or `failed`. It should identify which reliability layer produced the result:

1. **Environment and session:** the intended browser, profile, tab, locale, viewport, and CDP session were available and stable.
2. **Interaction:** the agent interpreted the task and completed the intended actions against the observed interface.
3. **Assertion and evidence:** the resulting UI, network traffic, console state, and other available evidence support the verdict.

This separation matters because a page-level retry cannot repair a wrong profile, a detached session, or missing evidence. Misattribution turns reliability work into guesswork and can create false passes.

## Minimal run record

Every evaluated run should retain enough structured data to answer five questions:

| Field | Question answered |
| --- | --- |
| Environment fingerprint | Did the agent use the intended browser, profile, locale, viewport, and target origin? |
| Intent and preconditions | What outcome was requested, and what had to be true before actions began? |
| Action timeline | What did the agent observe, decide, and do? |
| Evidence bundle | Which UI, network, console, recording, or application-state evidence supports the verdict? |
| Terminal classification | Did the task pass, fail, need a safe retry, or require a person, and at which layer? |

## Ten synthetic acceptance cases

These cases use controlled fixtures. They do not touch customer applications or production accounts.

| ID | Injected condition | Correct classification | Safe response |
| --- | --- | --- | --- |
| E01 | Expected browser executable is absent | Environment failure | Stop with the missing dependency and discovery paths checked |
| E02 | Remote debugging is disabled | Environment failure | Ask for explicit browser permission, then reconnect |
| E03 | CDP attaches to the wrong profile or tab | Environment failure | Invalidate the run before any action |
| E04 | Session detaches after the third action | Environment failure | Preserve the trace and resume only if identity and state can be re-established |
| I01 | A modal obscures the intended control | Interaction failure | Re-observe, close or handle the modal if policy permits, then continue |
| I02 | Labels and layout change while intent stays constant | Interaction challenge | Recover from semantics and visible state, not a stale selector |
| I03 | Login, MFA, CAPTCHA, payment, or consent appears | Human boundary | Pause with a precise handoff and perform no consequential action |
| A01 | UI shows success while the network request fails | Assertion failure | Return failed with both pieces of conflicting evidence |
| A02 | Request succeeds but the resulting business value is wrong | Assertion failure | Return failed with the expected and observed semantic values |
| A03 | A retry could duplicate a purchase, message, or submission | Action-safety failure | Do not retry automatically; require a person to decide |

## Hard gates

The evaluation fails if any of these occur:

- A run passes without the evidence required by its assertion.
- A wrong browser, profile, origin, or tab is treated as a page failure.
- Conflicting UI and network evidence is collapsed into success.
- A login, MFA, CAPTCHA, payment, consent, message, or submission boundary is crossed automatically.
- A retry can duplicate a consequential action without an idempotency guarantee or human decision.
- The terminal report hides which layer failed or what evidence is missing.

## Baseline metrics

Start with metrics that expose failure quality, not just task completion:

- false-pass rate
- correct failure-layer attribution
- evidence completeness
- safe recovery rate
- unsafe or duplicate retry count
- median time from failure to actionable diagnosis

For this ten-case fixture set, the first acceptable baseline is zero false passes, zero automatic high-impact retries, and ten of ten correct layer classifications. Recovery rate and speed should be optimized only after those gates pass.

## What I would build first

1. Add the three-layer terminal classification and environment fingerprint to a small controlled runner.
2. Implement E01 through E04 as deterministic CDP and session fixtures.
3. Add I01 through I03 using local pages with controlled UI changes and handoff boundaries.
4. Add A01 through A03 with mocked network responses and semantic assertions.
5. Publish every failure, not only the aggregate score, then fix the highest-severity class without changing the held-out fixtures.

## Relevant proof

I adapted [browser-use/browser-harness](https://github.com/browser-use/browser-harness) into [Helium Harness](https://github.com/adamtpang/helium-harness), a public Helium-specific CDP derivative. The work adds Windows browser discovery, Helium profile and executable detection, Helium-first launch behavior, packaging, documentation, and unit coverage. A fresh full local run on 2026-08-29 passed 141 tests with 2 Windows-only symlink skips. The focused admin and discovery file passed 41 with the same 2 skips.

That proves work at the environment and session layer. It does not prove production scale, Spur product usage, or knowledge of Spur's internal architecture. The proposed evaluation above is the next layer I would validate with the team.

## Public sources used

- [Spur careers](https://www.spurtest.com/careers)
- [Spur technical blog](https://www.spurtest.com/blog)
- [Spur on Y Combinator](https://www.ycombinator.com/companies/spur)
- [Applied AI Product Engineer](https://jobs.ashbyhq.com/spur/3e021029-67f0-4574-a1b2-8517fa531529)
