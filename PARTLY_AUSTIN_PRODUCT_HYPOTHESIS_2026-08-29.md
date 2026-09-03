# Partly Austin product hypothesis

Prepared 2026-08-29. This is a public-source product hypothesis, not a claim of
Partly product access, automotive expertise, or customer validation.

## Direct answer

The most useful proactive artifact for the Product Engineer, US role is a
supervised parts-basket review concept for Austin body shops. It should help an
experienced estimator resolve conflicts among insurer constraints, supplier
availability, price, delivery time, and part confidence without removing the
estimator from the decision.

This is more credible than a generic parts chatbot. Partly's own Austin field
research says US estimators already use sophisticated tools and have developed
personal workflows for protecting margin. The opportunity is to remove tedious
decision work while preserving the judgment those workflows encode.

## Observed facts

- Partly's Product Engineer posting makes direct customer observation a weekly
  responsibility. It asks the engineer to prototype quickly, instrument the
  result, own a product surface's metrics, and move work from manual operation
  toward supervised delegation.
- Partly leaders recently visited independent Austin body shops before bringing
  PartlyAI to that segment. Their public account says insurers materially shape
  estimates, accepted parts and labor, and supported prices. Estimators have
  developed individual routines for protecting margin within those constraints.
- Partly's body-shop page describes integrations with estimating and body-shop
  management systems, supplier price and availability, AI-generated parts
  baskets, multi-supplier ordering, and operational analytics.
- Partly's body-shop page reports 2.7 times fewer supplementaries, 2.4 times
  fewer returns, and 20 percent lower key-to-key time. It does not publish the
  sample, baseline, study design, or confidence interval, so these figures are
  company-reported context, not validated targets for this hypothesis.

## Inference, clearly labeled

The likely high-value product problem is not finding any plausible part. It is
helping an estimator reach a trusted basket decision when multiple plausible
parts, insurer rules, supplier constraints, and margin consequences disagree.

The estimator's override is valuable product data. A supervised interface can
capture why a recommendation was rejected without pretending the model knows
more than the practitioner.

## Prototype: Trust-Weighted Basket Review

Use synthetic data only unless Partly provides an approved sandbox.

### Inputs

- Vehicle and estimate line-item context
- Candidate parts and fitment evidence
- Supplier price, availability, and delivery estimate
- Shop business rules
- Insurer price or part-type constraints

### Decision surface

For each estimate line, show:

1. Recommended part and supplier
2. Fitment and source evidence
3. Confidence level and unresolved uncertainty
4. Insurer or shop-rule conflicts
5. Price, delivery, and estimated margin trade-offs
6. Human actions: approve, override, defer, or request another option

The prototype must never place an order. Approval remains a protected human
action. Every override should capture a short reason such as fitment concern,
insurer rule, preferred supplier, delivery risk, or margin protection.

## Smallest useful experiment

Test five synthetic repair jobs containing known conflicts:

1. High-confidence exact fit with acceptable price and availability
2. Exact fit that violates an insurer price rule
3. Cheaper alternative with ambiguous fitment
4. Correct part with unacceptable delivery time
5. Conflicting supplier and shop-preference signals

For each job, define the expected recommendation, required human decision, and
forbidden action before running the prototype. The agent should earn autonomy
only when its observed precision supports a threshold agreed by the operator.

## Metrics

### Immediate prototype metrics

- Time from estimate line to approved basket decision
- Override rate by model-confidence band
- Percentage of recommendations with complete supporting evidence
- Percentage of low-confidence cases correctly escalated
- Distribution of override reasons

### Production outcome metrics

- Supplementary rate
- Return rate
- Key-to-key time
- Estimated margin preserved per repair order

Do not claim improvement in the production outcomes until a real controlled
pilot measures them.

## Why Adam can credibly discuss this

- skill.supply demonstrates a deployed TypeScript and React product with live
  data, structured outputs, validation, streamed state, and human review.
- summon.company demonstrates an auditable agent workflow, task receipts, and a
  known-ground-truth evaluation with 12 of 12 expected classifications and zero
  false auto-closes in two security or payment cases.
- The Guam Power Authority workflow demonstrates that Adam can compress a
  repetitive operational process from about two hours to about two minutes.
- Anchor Marianas supports a limited founder and customer-delivery claim. No
  contract value, adoption metric, or customer outcome should be added.

Adam does not have recorded automotive, collision-repair, Partly-product, or
Rust experience. The hypothesis should be offered as a question for domain
experts, not as a prescription.

## Two-minute Loom outline

### 0:00 to 0:20

State the observed Austin problem: experienced estimators protect margin through
personal decision routines shaped by insurer, supplier, price, and timing
constraints.

### 0:20 to 0:50

Show the proposed decision surface. Emphasize evidence, uncertainty, and the
protected human approval boundary.

### 0:50 to 1:20

Walk through one synthetic conflict. Show why the system escalates instead of
choosing a plausible but weakly supported part.

### 1:20 to 1:45

Explain the five-case known-ground-truth evaluation and the immediate metrics.

### 1:45 to 2:00

Ask for correction: which estimator decision currently creates the most costly
delay or avoidable rework in the Austin workflow?

## Copy-ready application line

Adam must review this before using it.

> Based on Partly's public Austin field research, I drafted a one-page experiment
> for a confidence-ranked parts-basket review that preserves estimator control
> and measures approval time, override rate, evidence completeness, and
> escalation quality. I treated it as a hypothesis for practitioners to correct,
> not as a claim of automotive expertise.

## Likely calibration contact

Partly publicly identifies Matt Goodson as Director of Engineering, while his
public profile and hiring activity describe him as Director of Product
Engineering and show him promoting Product Engineer hiring. This makes him a
strong likely calibration contact. No public source confirms that the Austin
role reports to him.

Copy-ready manual note:

> Hi Matt, I read Partly's Product Engineer role and the team's recent Austin
> body-shop observations. I drafted a one-page supervised parts-basket review
> hypothesis that keeps estimator approval protected and measures override
> reasons and escalation quality. I am a TypeScript product engineer who has
> built known-ground-truth agent evaluations in another domain. If useful, I can
> share the page. My main question is: which estimator decision currently causes
> the most costly delay or avoidable rework in the Austin workflow?

Adam must send any message himself.

## Compensation evidence and recommended answer

Partly publishes only `competitive base salary plus equity`. There is no reliable
public employer-provided band for this role.

Third-party estimates disagree materially:

- Glassdoor has shown ranges from approximately $77,000 to $122,000 and from
  $99,000 to $155,000 for the same title.
- A third-party Staff or Senior Staff listing estimates $135,000 to $160,000,
  but that is a more senior Partly role and not an employer-published band.
- Levels.fyi reports much lower company-wide figures that appear dominated by
  non-US observations and should not be used as an Austin benchmark.

Recommended answer for Adam to approve:

> I am targeting $120,000 to $135,000 USD in base salary, depending on level,
> equity, relocation support, and the total package.

This range is an informed negotiation position, not a discovered Partly band.
If Adam prioritizes maximum screening probability over compensation protection,
the lower-risk alternative is:

> I am flexible on base salary and would like to understand the approved range,
> equity, and relocation package for the role.

## Sources

- [Partly Product Engineer, US](https://jobs.ashbyhq.com/partly.com/f401e327-32ca-488f-a3f2-3e399ba6121b)
- [Partly body-shop solution](https://www.partly.com/solutions/bodyshops)
- [Partly leadership](https://www.partly.com/about)
- [Engineering at Partly](https://www.partly.com/post/engineering-at-partly)
- [Matt Goodson public profile and Austin field-research activity](https://www.linkedin.com/in/matt-goodson-nz)
- [Glassdoor Partly job estimates](https://www.glassdoor.com/Jobs/Partly-Group-Jobs-E5331701.htm)
- [Third-party Partly Staff or Senior Staff estimate](https://www.theladders.com/job/staff-senior-staff-software-engineer-austin-partly-group-limited-austin-tx_88291220)
- [Levels.fyi Partly salary page](https://www.levels.fyi/companies/partly/salaries)

