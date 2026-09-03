# S-tier target contract

Locked 2026-08-27 from Adam's definition: an S-tier problem, an S-tier hiring budget, S-tier people, and an S-tier location on Earth.

## The unit being judged

A top tech company is not a logo. The actual target is a specific tuple:

`company + team + role + offer + required work location`

The same company can contain an S-tier team and a poor team. A strong company cannot compensate for a weak manager, an unfunded role, or an unworkable location.

## The AND gate

Score each axis from 0 to 100, but calculate target quality from the weakest axis:

`targetQuality = min(problem, hiringBudget, people, location)`

An opportunity is S-tier only when:

- every axis is at least 85
- every hard constraint passes
- every material claim has a source and date
- no required axis is unknown

Do not average away a fatal weakness. A 100 problem, 100 budget, 100 people, and 40 location is a 40 target, not an 85 target.

## Axis 1: S-tier problem

Judge the problem the team and role actually work on, not the company's mission statement.

An S-tier problem has:

- large human, scientific, economic, or civilizational consequence
- a credible technical attack available now
- strong leverage from software, AI, capital, data, hardware, or distribution
- evidence that leadership treats it as a current priority
- a durable reason the company can win
- a role close enough to the core problem for the employee's work to matter
- genuine candidate interest that can survive years of difficulty

Reject or cap the score when the problem is hype without a user, important but not tractable, peripheral to the role, ethically unacceptable to the candidate, or unsupported by current company action.

## Axis 2: S-tier hiring budget

Hiring budget means the specific team's approved capacity and willingness to hire. Company valuation and total funding are only indirect evidence.

An S-tier hiring budget has:

- a live, approved role or a decision maker confirming paid headcount
- compensation that creates meaningful savings after the required location's cost
- credible equity or another ownership mechanism when appropriate
- sufficient company runway or revenue to support the role
- relocation, visa, health, equipment, and travel support appropriate to the arrangement
- a hiring process fast enough to match the stated urgency
- willingness to pay for a scoped trial when trial work is requested

Evidence strength, strongest first:

1. Written offer or official compensation band for the exact role
2. Hiring-manager confirmation of approved headcount and terms
3. Official live role plus current company financial evidence
4. Funding, valuation, or headcount growth without role-level confirmation

Funding alone cannot earn an S-tier hiring-budget score. If the compensation, headcount approval, or work arrangement is unknown, the axis remains unverified.

## Axis 3: S-tier people

Judge the direct manager and close collaborators first. Famous founders and distant employees are weak evidence.

An S-tier people environment has:

- direct peers with exceptional, inspectable work
- a manager with evidence of developing and trusting strong individual contributors
- high standards without normalized abuse or chaos
- intellectual honesty, integrity, and willingness to correct mistakes
- a density of people the candidate can learn from and wants to become more like
- evidence of fast feedback, real ownership, and low political drag
- a reachable team, not merely geographic proximity to admired people

Public work, technical writing, talks, open-source behavior, former-employee accounts, and the interview loop can provide evidence. Prestige, follower count, and office location cannot substitute for it.

## Axis 4: S-tier location

Judge the location the candidate must actually inhabit, not the headquarters listed on a company profile.

`portal.voyage` owns this axis. Its current scoring model combines:

- cost and runway
- field-specific career density
- admired people and ambient scene quality

It also applies visa, language, climate, and timezone as hard filters rather than quiet score deductions.

For an onsite or hybrid role, score the required city. For a remote role, score the candidate's real residence plus legal employment, payroll, travel, and timezone requirements. Proximity is not access, and a famous city is not automatically an S-tier place for a particular person.

## Target quality is separate from candidate match

The four axes above answer: `Is this opportunity worth wanting?`

Candidate match answers a different question: `Can this person win and thrive in it?`

Match should evaluate:

- proof of fit
- honest capability gaps and ETA
- eligibility
- access path
- mechanism to win
- candidate-specific compensation floor and financial urgency

Do not lower the S-tier target bar because a mediocre role is easier to obtain. Do not call an exceptional target actionable when the candidate has no credible path to it. Maintain both scores.

## Required evidence packet

Every S-tier target must record:

| Field | Minimum evidence |
| --- | --- |
| Problem | Current product, strategy, customer, technical, or research evidence tied to the team |
| Hiring budget | Exact live role or decision-maker confirmation, compensation evidence, and company capacity evidence |
| People | Named manager or owner plus direct-team proof, with unknowns visible |
| Location | Required work arrangement scored through `portal.voyage`, with all hard constraints checked |
| Match | Candidate proof, honest gap, ETA, access path, and one mechanism to win |

The status is one of:

- `rejected`: a hard constraint or axis fails
- `investigate`: one or more axes remain unknown
- `qualified`: all axes pass but one or more are below 85
- `s-tier`: all four axes are at least 85 and the evidence packet is complete

## Product behavior

`skill.supply` should search broadly, investigate narrowly, and campaign only against qualified targets. It may still surface a fast bridge-income role because financial urgency changes pursuit order, but it must label that role as a stabilization opportunity rather than quietly lowering the S-tier definition.
