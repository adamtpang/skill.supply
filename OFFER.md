# OFFER: skill.supply

Filled 2026-08-01. No brackets. Two-sided by design; see LAUNCH.md for the
growth model and the open pricing question at the bottom for the one tension.

## One-liner (supply side, the seeker)

For **job seekers in a painful search** (new grads, career switchers, laid-off
tech workers) who struggle with **applying scattershot to hundreds of listings
that were never theirs**, **skill.supply** is a **free AI career agent** that
**writes the job description they should be hired into, scores real live
openings against it, and hands them a shareable, exportable kit: fit, resume,
five named targets, and the opening move**. Unlike **job boards that start
from listings**, we **start from the person and make the market come to them.
The free report is the product and the ad; the share link is the growth loop.**

## One-liner (demand side, who actually pays)

For **founders and hiring managers** who struggle with **500 blind
applications per opening**, **darktalent.tech** (the paired demand side)
sells **access to this scored, packaged talent pool**: pre-matched shortlists
instead of resume roulette. skill.supply builds the supply; darktalent
monetizes the demand. Revenue for this pairing is measured on darktalent.

## Price

- **Free snapshot: $0, forever.** No skill.supply signup, nothing stored on
  skill.supply, you own the output. This is the wedge and it never gets a
  paywall (LAUNCH.md rule: do not bolt payments onto seekers).
- **Companies: pay on darktalent.tech**, not here.
- **Retired 2026-08-01: the $69 founding report.** It charged seekers, which
  contradicted LAUNCH.md. Adam ruled "LAUNCH.md wins every conflict: seekers
  never pay," so the FoundingOffer section was removed from app/page.tsx the
  same day. No Stripe rail ever existed for it and it had zero buyers, so
  nothing was refunded or migrated.

**Changed 2026-08-06: bring-your-own-key.** The Vercel AI Gateway that ran the
free agent was unfunded and broken (see EVIDENCE.md). Rather than skill.supply
paying for every seeker's run, the seeker now pastes their own Anthropic API
key alongside their background; it is used only in memory for that one run,
never logged, never persisted. This keeps the $0 price genuinely free (no
skill.supply cost, ever) but adds real friction: a seeker who has never used
the Anthropic API now has to create an account and add a few dollars of
credit at console.anthropic.com before they get a report. That is a real
tension with LAUNCH.md's "no signup, just paste and go" promise, decided by
Adam directly rather than something to paper over. Watch the share-loop
metric for whether this friction kills conversion; if it does, the honest
fallback is fund Anthropic API access or the Gateway directly instead.

## Grand-slam checks

- [x] Dream outcome is clear and valuable (the job you should have, named)
- [x] Perceived likelihood is high (real live openings scored, not advice)
- [x] Time delay is short (snapshot instant; founding report inside 48h)
- [ ] Effort is low: **weakened 2026-08-06.** Paste a background, that used
      to be the whole job. Now also paste an Anthropic API key, which for
      most job seekers means a new signup elsewhere and a small card charge
      first. Honest about this rather than claiming it is still low.
- [x] Risk is reversed (free, no signup on skill.supply itself, nothing
      stored; there is nothing to lose by trying it beyond the small
      Anthropic credit the seeker funds themselves)

## The one metric

Reports shared: `/s#` links opened by someone other than their creator. That
is the viral coefficient, and it predicts everything downstream including the
demand side. Log it weekly in EVIDENCE.md.

## Pricing question: resolved

LAUNCH.md (2026-07-23) says seekers never pay. The $69 founding report
(2026-07-30) charged seekers. Adam resolved it 2026-08-01: LAUNCH.md wins
every conflict, seekers never pay. The FoundingOffer is removed. Any future
revenue idea for this product must charge the demand side via darktalent.tech.
