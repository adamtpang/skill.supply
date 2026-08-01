# OFFER — skill.supply

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

- **Free snapshot: $0, forever.** The full agent run, no signup, nothing
  stored, you own the output. This is the wedge and it never gets a paywall
  (LAUNCH.md rule: do not bolt payments onto seekers).
- **Founding report: $69 one-time** (added to the page 2026-07-30): a
  concierge deep pass delivered within 48 hours, refund if no interview
  within 30 days. Fulfilled by mailto today; no Stripe rail exists.
- **Companies: pay on darktalent.tech**, not here.

## Grand-slam checks

- [x] Dream outcome is clear and valuable (the job you should have, named)
- [x] Perceived likelihood is high (real live openings scored, not advice)
- [x] Time delay is short (snapshot instant; founding report inside 48h)
- [x] Effort is low (paste a background, that is the whole job)
- [x] Risk is reversed (free tier owns the loop; $69 refunds if no interview
      in 30 days)

## The one metric

Reports shared: `/s#` links opened by someone other than their creator. That
is the viral coefficient, and it predicts everything downstream including the
demand side. Log it weekly in EVIDENCE.md.

## Open pricing question (for Adam, do not resolve silently)

LAUNCH.md (2026-07-23) says seekers never pay. The $69 founding report
(2026-07-30) charges seekers. The reconciliation used here: the free loop is
untouched and unlimited, and $69 buys optional concierge depth, not access.
If that reading is wrong, remove the FoundingOffer section from app/page.tsx;
if it is right, the $69 stays mailto-only until it has a first buyer.
