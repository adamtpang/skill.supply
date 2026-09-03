# skill.supply Career Center

## North star

Minimize the candidate's time to an accepted dream job. Do not optimize for application count, generated documents, messages, or profile volume.

The first customer is Adam. The system must still be safe and useful for any candidate without placing Adam's private profile in the public application bundle.

## The product

The Career Center is the candidate's job coach and job center. It maintains one private career case, diagnoses the current bottleneck, and returns one highest-value next action.

Target quality is governed by [`S_TIER_TARGET_SPEC.md`](S_TIER_TARGET_SPEC.md). An S-tier target is a specific company, team, role, offer, and required location whose problem, hiring budget, people, and place all pass independently. Candidate match is scored separately.

The suite has three clear owners:

1. `darktalent.tech` finds underpriced talent through public proof, trajectory, kinetic ability, market access, confidence, and consent. It owns the Talent Card.
2. `skill.supply` finds funded teams with named capability gaps, creates Need Cards, judges matches, prepares campaigns and applications, supports interviews, and records placements.
3. `company.university` closes a named, company-specific gap when a short learning sprint can create decisive proof. It owns the Gap Plan and verified proof artifact.

`skillmarketcap.com` is consolidated into `skill.supply` as the demand intelligence layer. It is not a separate candidate journey.

## Shared objects

| Object | Owner | Required contents |
| --- | --- | --- |
| Talent Card | darktalent.tech | Public proof, ability, potential, trajectory, confidence, and consent |
| Need Card | skill.supply | Funded team, named capability gap, urgency, budget evidence, and likely owner |
| Match | skill.supply | Proof of fit, honest gap, access path, and ETA |
| Gap Plan | company.university | Shortest company-specific sprint and verified proof artifact |
| Campaign | skill.supply | Research, useful work, Loom, drafts, application, interview preparation, and follow-up |
| Placement | skill.supply | Offer, acceptance, retention, and labeled outcome returned to the scoring loop |

## Perfect feature set

### 1. Private career file

- Candidate-supplied identity and constraints
- Verified employment, project, education, and skill evidence
- Reusable application answers with provenance and last-verified dates
- Dream-job definition and offer decision rule
- Public Talent Card link and confidence
- Local-first import and export

### 2. Demand intelligence

- Current official roles and company career pages
- Hiring velocity, funding, team growth, and compensation evidence where available
- A Need Card with named capability, urgency, likely owner, and budget hypothesis
- Every estimate labeled as a hypothesis with source and date
- Ranking for high candidate demand and low verified talent supply
- Separate problem, hiring-budget, people, and location scores using the S-tier AND gate

### 3. Match and gap analysis

- Proof of fit against the actual job description and team problem
- Honest missing evidence or capability
- ETA to close the gap
- Reachability of the hiring team
- Candidate-confirmed product use as a ranking signal, never an inferred fact
- Clear reject reasons for low-fit roles

### 4. Company-specific learning

- Training starts only after a named demand signal
- The shortest sprint that changes the hiring decision
- A useful, externally verifiable proof artifact
- Stop conditions when training will not materially improve the match

### 5. Proactive campaign

- Company and team research
- Budget and problem hypotheses
- Contact map based on public role relevance
- Useful insight or small proof artifact
- Loom outline
- Email, DM, and follow-up drafts
- Manual application handoff
- Interview story and objection preparation

### 6. Outcome learning

- Qualified target, manual outreach, application, interview, offer, acceptance, and retention events
- Reasons for rejection, withdrawal, and acceptance
- Match-score calibration from placement outcomes
- Candidate consent and correction controls

## Do

- Start from verified demand.
- Prefer proof over pedigree.
- Separate sourced facts, candidate-supplied facts, and hypotheses.
- Give every number a source and date or mark it unknown.
- Work on one qualified target and one next action at a time.
- Make the candidate perform every external communication and submission.
- Keep candidates free.
- Feed placement and retention outcomes back into scoring.

## Do not

- Do not bulk auto-apply.
- Do not optimize application or message volume.
- Do not infer private wealth, protected traits, health, or family status.
- Do not call a budget or problem hypothesis a fact.
- Do not begin generic training before a named demand signal.
- Do not send, submit, publish, react, connect, archive, or mark anything read as the candidate.
- Do not expose a private career file in the public application bundle.
- Do not celebrate 1,000 Talent Cards before proving one placement.

## First vertical slice

The `/center` route implements a local-first Career Case with:

- one candidate source of truth
- one active target
- the nine-step placement path
- one current bottleneck
- one next action
- outcome counters
- import and export
- a bounded Career Center agent task
- strict prepare-only communication guardrails

The next product test is one real candidate, one real funded need, one company-specific proof artifact, one manual campaign, and one measured outcome.
