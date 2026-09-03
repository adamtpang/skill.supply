# Resume Improver: peer research and product contract

Date: 2026-08-31

## Product promise

Paste a resume, optionally add a target role and job description, receive a 0 to 100 evidence score, fix one prioritized issue, and rescan. The candidate never pays.

The score is a decision aid. It is not an official ATS score, a recruiter prediction, or a measure of the candidate's worth.

## Current peers

### Lightmark

Source: https://www.lightmark.app/ and https://www.lightmark.app/about

Useful mechanics:

- Independent scorecards prevent one aggregate number from hiding the real blocker.
- Every failed check includes observed evidence, the smallest recommended change, and a done-when condition.
- Hard evidence failures cap the aggregate score.
- One prioritized Improve prompt turns diagnosis into an iteration loop.

### Rezi

Source: https://www.rezi.ai/rezi-docs/the-rezi-score-explained and https://www.rezi.ai/rezi-docs/the-finish-up-tab

Useful mechanics:

- A 1 to 100 score updates as the resume changes.
- Feedback is attached to specific sections and bullets.
- A supplied job description drives role-specific optimization.
- Rezi explicitly says there is no universal official ATS resume score.

### Resume Worded

Source: https://resumeworded.com/resume-helper and https://resumeworded.com/resume-optimizer

Useful mechanics:

- More than 30 checks grouped into understandable categories.
- Line-level feedback supports repeated upload and rescore loops.
- Categories include impact, brevity, style, skills, and ATS readability.

### Teal

Source: https://tealhq.com/tool/resume-job-description-match and https://help.tealhq.com/en/articles/9524748-using-the-resume-analyzer

Useful mechanics:

- Resume quality and job-description match are separate concepts.
- Missing keywords are recommendations, not permission to add unsupported claims.
- Teal explicitly says a higher score does not prove recruiter advancement.

## Saturation

Generic ATS scorecards, keyword counters, and AI bullet rewriting are crowded. Their weak point is false precision. Most cannot show that their number predicts an interview, and keyword optimization can reward dishonest copying.

skill.supply's wedge is live demand plus proof integrity:

- Current employer demand comes from public job postings already indexed by skill.supply.
- Resume quality is decomposed into independent scorecards with evidence receipts.
- Missing proof becomes a question or task, never an invented metric.
- Target alignment is capped when no target role or job description is supplied.

## Version 1 scoring contract

| Scorecard | Points |
| --- | ---: |
| Proof and impact | 25 |
| Role-market alignment | 20 |
| Ownership and scope | 15 |
| Clarity and brevity | 15 |
| Structure and portability | 10 |
| Technical and domain specificity | 10 |
| Claim integrity cues | 5 |
| Total | 100 |

Caps:

- Under 120 words: 49.
- No recognizable Experience or Projects section: 59.
- No target role or job description: 88.
- Target role but no job description: 92.
- Live posting sample unavailable: 92.

Every failed or partial check must expose:

1. Observed evidence.
2. Smallest truthful change.
3. Done-when condition.
4. Points available.

## Market-data contract

Version 1 uses current public postings to measure current demand. It does not claim resume-to-interview causality.

The future outcome-calibrated layer requires explicit opt-in receipts for application, response, interview, and offer events. Raw resume text and personal identifiers should not be collected for model calibration. Each aggregate must expose sample size, date range, role family, geography, and uncertainty. No score weight should change from outcome data until the sample is large enough to resist one employer or candidate dominating it.

## Anti-patterns

- Never call the score an ATS score.
- Never invent a metric, responsibility, technology, employer, or outcome.
- Never reward a keyword without a plausible evidence location.
- Never hide a failed proof gate inside the aggregate score.
- Never imply current job-posting frequency proves hiring success.
- Never train on private resume text without explicit informed consent.
