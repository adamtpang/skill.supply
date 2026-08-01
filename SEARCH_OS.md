# The Job Search Line

A job search is a production line, not a lottery. Every stage has a conversion
rate, and total output is capped by the worst one. That single fact invalidates
most job search advice, because "apply to more jobs" adds input to a line that
is usually blocked somewhere downstream.

This document is the operating manual. Run it weekly. Fix one thing at a time.

---

## 1. The line

| # | stage | what it means | you control |
| --- | --- | --- | --- |
| 1 | **Sourced** | postings pulled from all channels | which channels |
| 2 | **Qualified** | survives location, visa, and skill filters | the filters |
| 3 | **Researched** | brief exists, hook identified | tooling and time |
| 4 | **Sent** | it left your outbox | discipline |
| 5 | **Replied** | a human answered | subject line and hook |
| 6 | **Screened** | first conversation happened | speed and logistics |
| 7 | **Interviewing** | past the first round | the spoken story |
| 8 | **Offer** | terms on the table | proof and price |

Automate 1 to 3. Never automate 4 to 8.

---

## 2. The two numbers that decide everything

Reply rate depends almost entirely on whether you addressed a **person** or an
**inbox**. Everything else in the funnel is roughly fixed.

| path | reply rate | sends per offer |
| --- | --- | --- |
| Personalized, named human, real hook | ~22% | **~51** |
| Form submission, no name | ~3% | **~371** |

Same person. Same resume. Same outcome. **Seven times the work.**

This is the whole argument for research: not because it is virtuous, but because
it divides your workload by seven. If you take one thing from this document,
take the arithmetic.

> **The check that catches a doomed search:**
> `qualified targets ÷ sends per offer`
> If that is below 1.0, your board cannot produce an offer no matter how well
> you work it. Effort does not fix arithmetic. Most people never run this
> division and spend months confused about why nothing lands.

---

## 3. Constraint diagnosis

Find the first row whose symptom matches. That is your constraint. **Work only
on it.** Everything downstream of a blocked stage is unmeasurable, so any effort
spent there is guesswork.

| symptom | constraint | why it happens | the fix |
| --- | --- | --- | --- |
| Board expects <1 offer | **BOARD ARITHMETIC** | too few targets, or too few named humans | raise the personalized ratio first (7x), then widen sources |
| <20 qualified roles | **SUPPLY** | channels too narrow | add channels, never loosen filters |
| <10 sent | **THROUGHPUT** | researching instead of shipping | send until 10 are out; nothing else is measurable yet |
| <10% reply on 10+ sends | **MESSAGE** | subject or opening line is generic | rewrite the first sentence; is it a person or an inbox? |
| replies do not become calls | **CONVERSION** | second email is losing them | propose a specific time; answer the obvious objection first |
| calls do not advance | **STORY** | spoken pitch weaker than written | 90 seconds, out loud, one concrete thing you built |
| interviews do not close | **PROOF OR PRICE** | real gap, or comp mismatch | ask what tipped it; if a gap repeats twice, go build it |

**The rule:** fix one. Re-measure. Only then look at the next.

---

## 4. The standardization checklist

Per application. Target 25 minutes. If a step takes longer, it should be tooled.

### Before (automated, seconds)
- [ ] Role passes the location and visa filter, with the posting's own stated location as the source of truth
- [ ] Fit score computed against evidence you can actually defend
- [ ] Gaps listed explicitly
- [ ] Days-open known (past 21 days means their pipeline failed, which is good for you)
- [ ] Company brief generated: what they build, what they actually run on, money signals
- [ ] Decision maker resolved, or explicitly marked "no contact published"

### The 25 minutes (only you can do this)
- [ ] **The hook.** One specific, recent, checkable detail proving you looked. If the sentence could be sent to any company, it is dead.
- [ ] **Their hardest problem**, one sentence, in their words.
- [ ] **The stack reality check.** Job posts understate. Read the page source. A "bonus" language that the whole product runs on is not a bonus.
- [ ] **Your disqualifier, stated first.** Do not make them find it. Naming it buys more credibility than hiding it ever saves.
- [ ] **One question at the end.** A sharp technical question is the most reliable way to get a founder to reply.

### Never
- [ ] Never claim work you cannot defend in one follow-up question
- [ ] Never inflate a number. Check the actual commit count
- [ ] Never send to an address you guessed
- [ ] Never wait on a reply before sending the next one

---

## 5. Weekly rhythm

**Monday.** Rerun the hunt. HN's "Who is hiring" refreshes on the first weekday
of the month and everything else churns constantly. Regenerate briefs.

**Tuesday to Thursday.** Send. Personalized targets first, always. Timebox.

**Friday.** Follow up on day-4 threads. Run the diagnostic. Read the constraint.

**Any day.** Follow up at day 4 and day 10 on everything unanswered. Silence is
the default, not a rejection. Most people send once and conclude they lost.

---

## 6. The compounding move

Everything above is linear: you work, you get output, you stop working, output
stops.

One thing is not. **Contribute upstream to the open source your target companies
depend on.** A merged pull request is public, permanent, verifiable proof that
you collaborate asynchronously in someone else's codebase, which is exactly what
a remote employer cannot otherwise verify about you.

Supabase hired most of its first fifty engineers this way and did no outbound
recruiting until after the thirty-second hire. It is the only channel here that
keeps working after you stop.

Do it in parallel with the line. Not instead of it.

---

## 7. What this replaces

The default process is: search, apply, wait, repeat. It is serial, so every
stage idles while you wait on the previous one. It also gets harder over time,
because gaps accumulate and confidence drops.

This process runs every stage in parallel and instruments the whole thing, so
that at any moment you know the single thing worth working on.

The goal is not one offer. It is several at once, because that is the only
version where you are choosing rather than accepting.

---

## Commands

```bash
node scripts/hunt-remote.mjs        # 1. source
node scripts/score-fit.mjs          # 2. qualify
node scripts/find-contacts.mjs      # 3. resolve decision makers
node scripts/company-brief.mjs      # 4. research
node scripts/build-tracker.mjs      # 5. board
node scripts/diagnose-funnel.mjs    # 6. what is the constraint right now
```
