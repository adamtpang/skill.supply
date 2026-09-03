# Zach Yadegari stealth founding engineer application

Checked 2026-08-30 and updated 2026-08-31. This packet is for the public Google Form at
https://docs.google.com/forms/d/e/1FAIpQLSe9Zl3yAQQbdm9bEicUAhT5PFzmdWok9_emFNuT159ZITg03w/viewform.

## Recommendation

Apply. This is a high-upside investigation, not a certified S-tier employer
yet. The exact product is undisclosed, but the engineering questions reveal a
direct match to Adam's work on agent tools, known-ground-truth evaluations,
latency, proactive notifications, browser control, and protected final
actions.

Public hiring evidence says Zach raised $5 million to build an AI product
beyond the chatbox, expects a hardware component, offers 1 to 10 percent
equity plus a competitive base, and is recruiting AI founding engineers. The
missing gates are the exact product, investors, company entity, location,
cash compensation, vesting and dilution, manager and team, working hours,
on-call load, and recovery expectations.

## Current form state

The Google Form is open in Adam's authenticated Helium session on the final
page. Google shows `Draft saved`, and the `Submit` button is visible.

- Page one is staged with the canonical identity and application email,
  current Forest City location, the summon.company evaluation, Quantus issue
  and pull request, GitHub, LinkedIn, and AI Founding Engineer selected.
- All seven engineering text areas are staged, including the finalized Cleared
  production-failure answer and the IDI Guam shipped-product answer.
- The common final page is staged. The optional other-role field remains blank.
- Nothing was submitted. There is no confirmation page or response receipt.

Browser receipts:

- Form and schema audit:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\google-form-intake-audit-20260830`
- Engineering page inspection:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\google-form-page-two-audit-20260830`
- Staged engineering answers:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\zach-stealth-engineering-page-staged-retry1-20260830`
- Repaired and verified interruption answer:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\zach-stealth-engineering-state-check-20260830`
- Staged page one:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\zach-stealth-page-one-staged-20260830`
- Manual review handoff:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\zach-stealth-manual-review-handoff-20260830`
- Final proof update and saved-draft verification:
  `C:\Users\adamp\.config\browser-harness\agent-workspace\recordings\zach-stealth-proof-update-20260831`

## Page one

- Name: `Adam Pangelinan`
- Email: use the canonical application email from `data/profiles/adam-pangelinan/profile.md`
- Links, one per line:
  - `https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md`
  - `https://github.com/Quantus-Network/quantus-miner/issues/61`
  - `https://github.com/Quantus-Network/quantus-miner/pull/62`
  - `https://github.com/adamtpang`
  - `https://www.linkedin.com/in/adamtpang/`
- Current base: `Forest City, Johor, Malaysia`
- Role: `AI Founding Engineer`

## Engineering page

### Where do you work?

Anchor Marianas, my software company. I work remotely from Forest City,
Johor, Malaysia.

### Something shipped and used

https://idiguam.vercel.app

I rebuilt and shipped the customer-facing website for International
Distributors, a retained client and wholesale food distributor serving Guam
and Micronesia since 1980. It provides products, hours, payment information,
careers, contact details, and a wholesale-account inquiry path.

The hardest technical part was replacing a legacy Wix site without creating
conflicting operational information or losing inquiries. I moved business
facts into a typed shared data layer, generated visible content, metadata, and
structured data from the same source, and built lead capture with explicit
delivery states and a fallback path when the form provider is unavailable.

### Tool selection and regression control

I would not expose a flat catalog. First narrow tools by intent, current
state, permissions, and required arguments; give tools mutually exclusive
descriptions and typed schemas; reject invalid calls deterministically; and
put confirmation in front of consequential actions. Then keep a versioned
known-ground-truth suite covering correct-tool, no-tool, ambiguous,
permission-denied, and multi-step cases. Any prompt or tool change must pass
the whole suite with per-intent accuracy, false-action rate, latency, and cost
deltas, followed by shadow or canary monitoring.

I used this pattern in summon.company: its real reconciliation pipeline
classified 12 of 12 known-ground-truth scenarios correctly and produced zero
false auto-closes in its security and payment cases.

### Production LLM failure

Approval-ready draft, supported by Adam-authored commits and dated production
receipts:

Cleared, my WhatsApp triage agent, worked in demos and had 35 green tests, but
production exposed a broken state assumption: the linked-device history showed
6 unread chats while the real inbox had about 30, and protocol payloads appeared
as messages. The model could therefore produce a confident ranking over an
incomplete and polluted inbox.

I moved correctness ahead of inference. I added deterministic protocol
filtering, scanned all 402 active chats for open loops, replayed fresh read-only
app state, separated "unread" from "reply owed," surfaced missing-draft states,
and made clearing versioned so a conversation returns after a newer message.
Production verification then found 31 true unread chats, 45 clear reply-owed
actions, zero protocol previews, and 41 passing tests. The lesson was that model
quality cannot compensate for a broken state model, so I now make coverage and
omissions observable before asking a model to rank or act.

Evidence: `C:\Users\adamp\Aether\beeper.chat\EVIDENCE.md`, commits `a202fd8`,
`595c5cf`, and `51d32ba`, all authored from Adam's recorded Git identity.

### When to interrupt

An interruption must clear explicit thresholds: expected user value, time
sensitivity, confidence, reversibility, novelty, user preferences, and a
frequency cap. Low-confidence items stay silent or enter a digest. I would
measure dismiss, snooze, open, action, downstream completion, undo and
complaint rates, plus sampled interruption regret, and compare incremental
value against a holdout instead of optimizing click-through rate. Every alert
needs `why`, `not now`, and `never for this category` controls.

### Time to first token

The path is client and network, auth and session, validation, context
retrieval, tool routing, model queue and prefill, server buffering, return
network, and render. Instrument spans and p50 and p95 first. I would cut
sequential critical-path work before changing models: stream immediately,
move nonessential retrieval and tools after the first token, parallelize
independent reads, cache stable context and tool schemas, and shrink the
prompt. I would switch models only if traces show queue or prefill dominates
and the quality suite still passes.

### Real-world actions

No blanket yes or no. Auto-act only inside a user-authored standing policy for
low-risk, reversible, bounded actions, with preview, idempotency, spend and
rate limits, an audit log, and undo. Require fresh approval for external
communication, purchases, money movement, deletion, permission changes,
public posting, an ambiguous recipient or scope, a new action category, or
anything outside the limits. For send or buy, stage the action and ask.

### Building now outside work

I am building skill.supply, an AI career agent that turns a candidate's
evidence into an honest fit ranking, tailored application material, and a
protected browser handoff. I also extend summon.company, a Paperclip-derived
agent-company system, where I built a register-truth reconciler and a
12-scenario known-ground-truth evaluation with zero false auto-closes on its
security and payment cases. The throughline is making agent decisions
observable, testable, and reversible before they touch a real account.

## Final page

### Why work on an early AI product you cannot see yet?

The questions reveal enough of the problem: many tools, real accounts,
proactive judgment, latency, and human approval. That is exactly the agent
boundary I want to work on. Secrecy is acceptable if the first call is candid
about the product, team, location, ownership, and operating expectations. I
care more about the problem and people than a known brand.

### Earliest start date

`As soon as possible`

### Another role

Leave blank. AI Founding Engineer is the concrete fit.

### How did you hear about this?

`Zach Yadegari's Instagram post`

### Anything else

I am a US citizen, need no US employment sponsorship, and am open to worldwide
relocation. My strongest production stack is TypeScript, React, Next.js, and
Node. My public work also includes a known-ground-truth agent evaluation and a
root-cause investigation of a Rust and wgpu miner OOM that maintainers verified
and fixed upstream. I have 2 to 3 years of engineering experience and prefer a
small team where I can own the path from an ambiguous user problem to measured
behavior in production.

## Manual boundary

Codex may stage factual fields and draft answers. Adam reviews the full form,
confirms the production-failure story and discovery source, makes any consent
or attestation decisions, and performs the final submission. Nothing in this
packet is a submission receipt.

## Public sources

- Zach Yadegari's current public hiring post, checked 2026-08-30 through a
  public index: $5 million raised, AI beyond the chatbox, 1 to 10 percent
  equity plus competitive base, and hiring for three founding tracks.
- Zach's current public follow-up, checked 2026-08-30 through a public index:
  a hardware component is planned.
- The live Google Form and its public form schema, checked 2026-08-30.
