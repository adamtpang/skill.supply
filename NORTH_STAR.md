# North star — the platonic ideal version of skill.supply

One sentence: paste your messy background in, and a free AI agent hands you back the sharp resume, the one-liner, and five named companies worth pitching, so no capable person stays hidden for lack of packaging.

## The horizon (Adam's ruling, 2026-08-14)

The end state, in Adam's own words: a career AI agent that autonomously does
the best things for a person's career, maximizing income, finding the best
opportunities for growth, and helping them take those shots, so they climb
to the highest skill, growth, and slope they can reach.

What that decomposes into, honestly:

- **Exists today:** discovery (any company's live board via resolver +
  aggregators), judgment (dream JD, chase/maybe/skip verdicts, honest ETA
  per gap), market intelligence (funding-velocity momentum ranking), and
  proof-artifact machinery (megawatt.fun shipped out of one afternoon of
  this repo's own job search).
- **Still to build:** the review-queue applicator (crawl and rank at scale,
  the human one-clicks every send), a standing opportunity scanner on a
  cadence, and outcome tracking that learns which shots landed.
- **Two boundaries that keep it honest:** the agent finds, ranks, drafts,
  and queues every shot, but the human takes them (that line is what keeps
  output signal instead of spam, per this repo's own funnel data: warm and
  targeted converts 12-18%, cold mass converts 2-5%). And wealth beyond
  placement is moneymeta.fun's lane; skill.supply owns discovery, matching,
  the ETA, the intro, and the fee, per ECOSYSTEM.md.

## The offer
- Who it's for: job seekers and career changers with a real background but a messy story (resume, LinkedIn text, or a few honest paragraphs).
- What they get: a Claude agent that discovers their ikigai-market fit (love x craft x what companies pay for), packages a sharp ATS-ready resume plus a one-liner, and places them against five named target companies with honest fit scores and an opening message.
- What it costs: free for seekers, by design (Adam's ruling, 2026-08-01). Demand-side (companies) monetizes separately on darktalent.tech.

## What this is NOT (scope guard)
- Not a job board, ATS, or applicant database — no accounts, no stored data, your data stays in your link.
- Not where seekers pay. The former $69 "Founding report" offer is retired; a stale production deploy is still showing that CTA and is actively misleading — this is a live bug, not a pricing decision, and needs redeploying off the current commit.
- Not the demand-side product. Company/recruiter monetization lives at darktalent.tech, not here.

## Progress ladder (fact-based, not vibes)
- [x] 0. Core loop works — the actual product function runs end to end for a real user
- [x] 1. Discoverable — sitemap, robots, meta description
- [ ] 2. Tracked — analytics wired in code AND confirmed live
- [ ] 3. Instrumented — named funnel events beyond raw pageviews
- [ ] 4. Payable — real automated checkout, not mailto or invoice-only
- [ ] 5. Converted — at least one verified stranger sale

**Progress: 2/6 (33%)**

Notes: stage 0 confirmed by reading `components/agent-flow.tsx` and `app/page.tsx` — the discover/package/place flow streams from `/api/agent` end to end (user supplies their own Claude API key). Stage 2 is wired in code (`@vercel/analytics`) but confirmed via curl this week that the analytics script 404s at the Vercel platform layer despite being toggled on in the dashboard, so it does not count as live. Stage 4 stays unchecked on purpose (seekers are free by design) but the stale $69 CTA still live in production is a real bug worth fixing regardless of the ladder.

## Next milestone
Get the Vercel analytics 404 resolved (support ticket or redeploy) so stage 2 is actually confirmed live, and in the same pass kill the stale deploy so the retired $69 CTA stops showing to real visitors.
