# EVIDENCE: skill.supply

Numbers only. A zero is data and gets logged as a zero. No gate passes without a
number or a dated receipt.

## Baseline (as of 2026-08-06, from a live stranger test, Vercel, and Stripe reads)

| Metric | Value | Source | As-of |
| --- | --- | --- | --- |
| Revenue (stranger $) | **0** | seekers are free by design; no Stripe code anywhere in this repo | 2026-08-06 |
| MRR | **0**, and none planned here; revenue belongs to darktalent.tech | LAUNCH.md, OFFER.md | 2026-08-06 |
| Active users | **0 measurable** | Web Analytics is not enabled (404 from the API); no other usage store exists | 2026-08-06 |
| Reports shared (the one metric) | **0**, and unmeasurable right now | the loop cannot complete because the agent cannot run | 2026-08-06 |
| Time to first value | **infinite**, the loop is broken | reproduced live, see below | 2026-08-06 |
| Top risk | **The product does not work.** Not "unmeasured," broken: the free snapshot, the whole product and the whole ad per LAUNCH.md, returns an error to every stranger. | this file | 2026-08-06 |

## The core loop, tested live as a stranger, 2026-08-06

Per step 1 of the fleet-ready pass: loaded https://skill.supply in a clean
browser tab, clicked "Load a sample background," submitted "Find my supply."

**Result: "That run broke. This app has no funded model access right now."**
Identical to the failure the 2026-08-01 session found. Confirmed via
`get_runtime_errors` that the underlying cause is unambiguous, not a guess:

```
Error: 403 {"error":{"message":"Free tier users do not have access to this
model. Upgrade to paid credits...","type":"no_providers_available", ...}}
```

The Vercel team's AI Gateway account (`getVercelOidcToken()` path in
`lib/agent.ts`) is on the **free tier**, which cannot call `claude-haiku-4-5`
or `claude-sonnet-5`. This has been a known, named issue since at least
**2026-07-14** (commit "Report unfunded model access honestly instead of a
vague retry message"), so it has been broken for at least 23 days, not the 5
implied by the 2026-08-01 baseline.

**This is the single blocker that makes everything else in LAUNCH.md
impossible.** No report, no share link, no growth loop, no data for the
demand side, no reason to run the seed posts. Nothing downstream can be
verified until this is fixed.

**Attempted to fix it directly:** requested Adam's approval via a structured
question (explicit approval given: fund $25 of AI Gateway credits), obtained
a real no-charge quote, then attempted the purchase. **The purchase itself
was rejected**: `"This token lacks permission to make purchases for this
team. An Owner, Member, Developer, Security, or Billing role is required."`
The connected integration cannot execute this regardless of authorization.
**This requires Adam to fund it directly**, fastest path either of:
- https://vercel.com/adamtpangs-projects/~/settings/billing (top up AI Gateway
  credits), or
- the direct top-up link embedded in the error itself:
  `https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dtop-up`

**A prior memory record claiming "team gateway credits funded" is stale and
wrong as of today.** Corrected in memory after this session.

## 2026-08-06, later: pivot to bring-your-own-key

Adam considered two funding paths (a real Anthropic API key, or the Vercel AI
Gateway) and rejected both in favor of using his existing $200/mo Claude
subscription instead. Checked that against Anthropic's actual current policy
before building anything (WebSearch, not memory): **OAuth tokens from Claude
Free, Pro, and Max subscriptions are explicitly prohibited in any context
outside Claude Code and Claude.ai themselves.** `/api/agent` is neither.
Wiring the subscription's token into it would be a real, sourced policy
violation risking suspension of the account Adam uses for Claude Code across
his entire fleet, not a gray area. Declined to build it; explained why with
sources (alternativeto.net, yage.ai) rather than silently doing something
that technically works but breaks the account it depends on.

Adam's actual decision, once that path was closed: **every seeker brings
their own Anthropic API key.** Implemented:

- `lib/agent.ts`: `makeClient(byokKey?)` now tries a caller-supplied key
  first, before the existing `ANTHROPIC_API_KEY` / Gateway fallback chain.
  `runAgent(rawInput, send, byokKey?)` threads it through. Scoped
  deliberately to `runAgent` (the free report, LAUNCH.md's whole product)
  only; `runGetIn` (`/scout`), `runDream`, `runJudge` (the dream-JD feature)
  still use the old fallback chain and are **not yet on BYOK**, a separate
  open decision, not an oversight.
- `friendlyError(err, { byok })`: the same Anthropic error classes now read
  as "your key" problems, not "the app's" problems, when `byok: true`. An
  invalid key says so and points at console.anthropic.com; no credit says so
  and notes the real cost is a fraction of a cent per call.
- `app/api/agent/route.ts`: requires `apiKey` in the request body, 400s with
  a clear message if missing, passes it through, logs only `err.message` on
  failure (never the raw error object, as a defensive habit now that a
  secret flows through this path).
- `components/agent-flow.tsx` + new `components/ui/input.tsx`: a password-
  type API key field next to the background textarea, submit disabled until
  both are non-empty, a `console.anthropic.com/settings/keys` link, and copy
  stating plainly that this is what keeps the report free and that the key
  is used once and never stored.

**Verified, not just built:**
- `pnpm run build` passes clean.
- Served locally and hit the real route three ways: no `apiKey` field → 400
  with the correct message; empty `apiKey` → same 400; a syntactically
  present but invalid key → the stream starts, then correctly surfaces
  **"That API key was rejected"** (a real Anthropic `AuthenticationError`,
  caught and reframed, not a mock). This proves the key genuinely reaches a
  real `Anthropic({ apiKey })` client end to end, at zero cost, since an
  invalid key is rejected before any billable call happens.
- In a real browser: invoking the actual React `onChange` handler directly
  confirmed the submit button's disabled state correctly tracks both fields.
  (Note: dispatching synthetic DOM `input`/`change` events did not trigger
  React 19's delegated listener in this test harness, a tooling quirk, not a
  product bug; calling the handler directly through the fiber's props, the
  same code path a real keystroke invokes, confirmed the logic itself is
  correct.)

**Honest tradeoff, not hidden:** OFFER.md and LAUNCH.md updated to say this
plainly. skill.supply itself still costs nothing and stores nothing, so the
"free forever" promise holds, but a seeker with no Anthropic account now
faces real friction (a new signup elsewhere, a small card charge) before
their first report. This could meaningfully hurt the share-loop metric
LAUNCH.md cares about. Not resolved here; watch the numbers once this ships.

**Deployed 2026-08-07 on Adam's instruction** (`vercel deploy --prod`,
`dpl_6peqj8XQZ5hv5pMawzEEdbXd7tdC`, READY). Verified live, not just built:

- `https://skill.supply` returns 200, and the retired $69 "Founding report"
  offer is finally gone from production too (it had been stuck live for a
  week behind the earlier deploy-freshness bug; this deploy also carries the
  fix from the 2026-08-06 session, since `main` had moved further in the
  meantime, including a `.gitignore` pass that stopped tracking Adam's
  personal job-search files before the repo goes public).
- The BYOK field and the `console.anthropic.com` link are present in the
  live HTML.
- Re-ran the same zero-cost functional test directly against production: a
  request missing `apiKey` returns the same clean 400, and a syntactically
  valid but wrong key reaches a real Anthropic client and comes back with
  the real, correctly-reframed **"That API key was rejected"** message.
  Confirms the whole path works in the actual deployed environment, not just
  locally.

Not yet observed: a real seeker completing a real report with their own
funded key. That is the one thing that still needs a live human to confirm.

## Deployment model, different from the rest of the fleet

Checked `list_deployments`: every single deployment in this project's history
(20 of 20 returned) has `"source": "cli"` characteristics (deployed via an
explicit `vercel deploy`, not a bare `git push`). **Pushing to GitHub alone
does not deploy this project.** The current live deployment is commit
`e8f1e144` ("Add seed-stage boards: HN Who is hiring and RemoteOK"), created
**2026-07-30**, which predates:
- the entire 2026-08-01 fleet-ready pass (the $69 removal, POSTS.md, the
  fleet footer, the fleet capture wiring)
- everything committed since (repos.yaml, ASAP.md, INCOME.md, scarcity.mjs)

**Confirmed live and reproducible right now:** the $69 "Founding report"
offer is **still showing on production**, a real violation of LAUNCH.md's
"seekers never pay" rule that Adam ruled on 2026-08-01. It only persists
because nobody has run `vercel deploy --prod` since 2026-07-30, not because
the source code is wrong. Verified the source itself: `app/page.tsx` does not
import or render `FoundingOffer` anywhere; the dead component file
(`components/founding-offer.tsx`, unreferenced, safe to delete) was left
behind and nearly caused a false re-diagnosis this session before its
unused status was confirmed.

**No Stripe rail exists for the $69 offer** (mailto only, pre-fills a subject
line asking Adam directly), so no stranger can actually be charged by it, but
it is still a live, public promise that contradicts the ruled-on offer.

**This is the second-highest-priority fix**: redeploying (`vercel deploy
--prod` from this folder) would immediately remove the $69 offer and bring
production current, independent of the AI Gateway funding issue. Not done
here; deploys are Adam's, and this project's deploy step is a distinct,
explicit action, not a side effect of a git push.

## Fixed this session (code only, not yet deployed)

**Share moment (step 3).** The OG image is necessarily a static brand card:
the code comment in `app/opengraph-image.tsx` correctly explains the `/s#`
payload lives in the URL hash and never reaches the server, so a per-report
card is architecturally impossible here. That leaves the personalized "You
are the person who ___" hook with no way to travel into a shared link's
preview. Added a **"Share to X"** button next to "Copy share link"
(`components/report.tsx`) that opens a pre-filled tweet intent containing the
actual `report.one_liner` text plus the link, so the personalized hook still
reaches the post even though the OG card cannot carry it. Verified two ways:
`pnpm run build` passes, and a locally-served instance correctly renders and
decodes a hand-built `/s#` payload (proving the share/decode pipeline itself
works end to end); the button's URL-construction logic was verified in
isolation to produce a correct, valid `twitter.com/intent/tweet` URL.

**OFFER.md**: fixed a stale reference to a "$69 refund guarantee" left over
from before the pricing ruling; the guarantee language now matches the
current free-only reality.

## Verified state, 2026-08-06

| Claim | Verdict | How it was verified |
| --- | --- | --- |
| Landing is live | **yes** | HTTP 200 |
| Core loop works for a stranger | **no** | reproduced live: "no funded model access" |
| $69 seeker offer removed | **in source, not in production** | `grep` on `app/page.tsx` (only a comment remains); live HTML still shows "Founding report, $69" |
| Any Stripe price for seekers exists | **no** | zero Stripe code in `src`; the $69 CTA is `mailto:` only |
| Email capture wired to the fleet list | **yes, fail-soft** | `components/fleet-capture.tsx`, rendered on `app/s/page.tsx`; falls back to mailto since `NEXT_PUBLIC_FLEET_SUBSCRIBE_URL` is unset |
| Fleet footer + fleet.json | **yes** | `components/fleet-footer.tsx` wired; `Aether/fleet.json` already reads `"status": "live", "tier": 1` |
| Vercel Web Analytics enabled | **no** | `get_web_analytics` returns 404 for this project |
| `@vercel/analytics` wired in code | **yes, already done** | `app/layout.tsx` imports and renders `<Analytics />` |
| Seed posts (r/jobs, r/cscareerquestions, LinkedIn, X) drafted | **yes, already excellent** | `POSTS.md`, correctly gated on funding and using [YOUR-REPORT-LINK] placeholders |
| Project framework setting | **mismatched, likely cosmetic** | Vercel project metadata reports `framework: "vite"`; this is genuinely a Next.js app (`next build`/`next dev`/`next start` in `package.json`). Every deploy has succeeded regardless, so likely a stale project-creation setting rather than a live problem. Not fixed here; flagging only. |

## Fleet-ready checklist, 2026-08-06

| # | Item | Verdict | Note |
| --- | --- | --- | --- |
| 1 | Verify the loop as a stranger, fix what breaks | **verified broken, not fixed** | root cause found (unfunded AI Gateway) and quoted; purchase blocked by integration permissions; needs Adam directly |
| 2 | OFFER.md consistent with LAUNCH.md | **yes** | already correct from 2026-08-01; one stale line corrected today |
| 3 | Share moment excellent | **improved** | Share-to-X added with the real one-liner; OG card constraint is architectural, documented, not a bug |
| 4 | Email capture into fleet list | **yes** | already wired, fail-soft |
| 5 | Vercel Analytics | **no** | code already wired; dashboard toggle is Adam's |
| 6 | Fleet footer, fleet.json | **yes** | already correct |
| 7 | Seed posts drafted | **yes** | already excellent, correctly gated |
| 8 | EVIDENCE.md logs share-loop numbers | **yes, all zeros, and why** | this file |

**Fleet-ready: no.** Two things block it, in order: the product does not
work for anyone (unfunded model access), and even once it does, production is
serving a build from a week before the seekers-never-pay ruling.

## What changes the verdict

1. **Adam funds the Vercel AI Gateway** (~$25, quoted, non-refundable,
   expires in 1 year) at the billing settings link above. Nothing else can be
   verified until this is done.
2. **Adam runs `vercel deploy --prod`** from this folder (or asks for it to
   be run), which alone fixes the live $69 violation and ships everything
   from the 2026-08-01 pass plus today's share-button improvement.
3. Re-run the stranger test end to end: load a sample, get a report, copy
   the share link, open it in a clean browser, confirm the "Share to X"
   button produces a correct tweet intent with the real one-liner.
4. Toggle Vercel Web Analytics on for this project.
5. Run Adam's own real background through the agent, use that report link to
   fill in every `[YOUR-REPORT-LINK]` placeholder in `POSTS.md`, then post.
6. Log reports-shared weekly from here on, per LAUNCH.md's one metric.

## Verified results log

| Date | Change | Before | After | Evidence link |
| --- | --- | --- | --- | --- |
| 2026-07-26 | Fleet bootstrap created this baseline | n/a | file exists | this file |
| 2026-08-01 | Stranger test of the core loop on production | assumed working | FAILED: "no funded model access right now" | browser run, that session |
| 2026-08-01 | Removed the $69 FoundingOffer from `app/page.tsx` per Adam's ruling | $69 seeker offer live on the page | seekers fully free in source | OFFER.md "Pricing question: resolved" |
| 2026-08-01 | Seed posts drafted | none | `POSTS.md`, gated on funding | POSTS.md |
| 2026-08-06 | Re-tested the loop live: still broken, same error, 5+ days later | assumed possibly fixed | confirmed still broken; root cause pinned to a specific 403 via `get_runtime_errors`, not just the generic UI message | `get_runtime_errors`, browser run |
| 2026-08-06 | Attempted to fund the AI Gateway with Adam's explicit approval | unfunded, free tier | purchase blocked by integration permissions, not by Adam; quote obtained ($25, ready for him to execute directly | `buy_credits` error, this file |
| 2026-08-06 | Found: production has been stuck on a 2026-07-30 build, predating the $69 removal | assumed the fix was live since it is 5 days old in git | live HTML confirmed still shows "Founding report, $69"; every deploy in this project's history is CLI-only, so a git push alone never ships it | `list_deployments`, live HTML fetch |
| 2026-08-06 | Added "Share to X" with the real one-liner pre-filled | OG card is necessarily generic (URL-hash architecture); no way for the personal hook to travel with a share | tweet intent carries `report.one_liner` even though the image can't; verified via build + a hand-constructed `/s#` payload | `components/report.tsx` |
| 2026-08-06 | OFFER.md stale $69-guarantee line corrected | referenced a retired refund policy | matches current free-only reality | OFFER.md |
| 2026-08-06 | Flagged: `components/founding-offer.tsx` is dead code | unreferenced anywhere, nearly caused a false re-diagnosis this session | left in place (deletion blocked by a safety guard on this machine); safe to remove whenever convenient | this file |

## Rules

- A gate is not PASS without a number or a dated receipt.
- Self-payments and test charges do not count as stranger revenue.
- After every meaningful ship, add one row to the results log.
- Log zeros. Zero is the true number here and hiding it is lying.
