# Claude Code prompt: perfect skill.supply into a placement engine

Paste below the line into a Claude Code session opened IN the skill.supply repo.
First read `README.md`, `lib/agent.ts`, `lib/prompts.ts`, `lib/companies.ts`,
`lib/jobs.ts`, `lib/schema.ts`, and `app/page.tsx`.

---

You are perfecting **skill.supply** for its one purpose: **help a person find meaningful,
well-paying work.** Today it produces a strong report (ikigai fit, a packaged resume and
one-liner, five targets, and one intro for target #1) and then stops. A report is not a
job. Close the loop so the tool ends with a person able to send five real applications
today, each to a well-paid role they are a genuine fit for.

## Keep what is good
- The single-page, no-auth, no-database, zero-secret design. The report compresses into
  the URL hash. Do not add a backend or a login. If you need persistence, keep using the
  hash or add an explicit, optional export, never a required account.
- The streaming NDJSON stage UX (Reading you, Finding your ikigai, Matching, Packaging).
- The ikigai framing. "Meaningful" is the love-x-mastery half and it is already here.
  Strengthen it, do not bury it under money.

## What to build

1. **Finish the placement, not one intro but five.** Today only target #1 gets a tailored
   intro. Generate a tailored, non-generic intro for ALL five targets, plus a short
   **"how to get in" plan** per target (who to contact, the specific angle, the proof to
   show). Wire this to the existing `/getin` API and `/companies` directory so a named
   target company routes to its get-in plan. The report should end with five open doors
   and the exact way to walk through each.

2. **Make "well-paying" real.** Right now targets are matched on fit. Add compensation
   grounding: each target carries a realistic comp range for that role and market, and the
   matching reasoning weighs earning power alongside ikigai. Update `lib/schema.ts` so each
   target has `compRange` and `compBasis`, and `lib/prompts.ts` so the model reasons about
   what companies actually pay. Lead the packaging with the person's earning power, not just
   their vibe. Meaningful AND well-paid, both, on purpose.

3. **Ground the five targets in real companies.** Use `lib/companies.ts` and `lib/jobs.ts`
   so the five are real, currently-hiring-shaped companies with real role titles, not vague
   archetypes. Where a live role exists, name it. Where you fall back to an archetype, label
   it clearly as an archetype so the person is not misled.

4. **Ship an application kit they can actually use.** Add an "Export my kit" action that
   produces a clean, copy-pasteable bundle: the packaged resume, the one-liner, and for each
   of the five targets the intro plus the get-in plan. This is the artifact that turns a
   report into sent applications. Keep it client-side (no backend).

5. **Prove it on three real people.** Run the finished flow on three honest inputs: a
   senior engineer, a career-switcher with a thin resume, and a new grad. Paste the three
   outputs. Each must yield five real, well-paid, genuine-fit targets with five usable
   intros and five get-in plans, or fix the prompts until it does.

## Constraints
- No em dashes (the site's voice). No auth, no database, no required payment.
- This is NOT the Next.js you know: read `node_modules/next/dist/docs/` before writing code.
- Keep the extraction on `claude-haiku-4-5` and the reasoning on `claude-sonnet-5`.
- Every claim about a person or a company must be defensible from the input or labeled as
  an estimate. Do not invent a specific salary as fact, give a reasoned range.

## Definition of done
Paste a background, get: ikigai fit, a packaged resume and one-liner leading with earning
power, and five real well-paid targets, each with a tailored intro and a get-in plan, all
exportable as one kit. Typecheck and build pass. Three real runs pasted as evidence, each
good enough that the person could send five applications the same day.
