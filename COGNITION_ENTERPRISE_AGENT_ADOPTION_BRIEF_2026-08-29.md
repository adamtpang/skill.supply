# Enterprise agent adoption scorecard

Prepared for a Cognition Applied AI Engineer conversation. This is a
public-safe working hypothesis based on Adam Pangelinan's own agent-product and
workflow-evaluation experience. It does not describe Cognition's private
customers, systems, or roadmap.

## Thesis

An agent deployment becomes durable when one real workflow has all four:

1. a measured baseline
2. a known-ground-truth acceptance set
3. explicit human-review boundaries
4. an outcome metric the engineering team trusts

Raw run volume is not adoption. The useful question is whether the team can
delegate a repeatable class of work with predictable review cost and failure
handling.

## Thirty-day scorecard

| Week | Deliverable | Evidence | Decision |
| --- | --- | --- | --- |
| 1 | Select one narrow workflow and record the current time, failure modes, handoffs, and owner | Baseline sample with task-level receipts | Continue only if the workflow is repeated, measurable, and safe to test |
| 2 | Build 10 to 20 representative cases, including sensitive and ambiguous failures | Known-ground-truth set with expected outcomes | Do not scale if the team cannot agree on what a correct result means |
| 3 | Run the agent with explicit stop, review, escalation, and rollback rules | Case-level result, review minutes, false-positive and false-negative counts | Fix the dominant failure before adding volume |
| 4 | Compare the new workflow with baseline and document the operating playbook | Cycle time, accepted output rate, human-review time, rework, and user confidence | Expand only if the outcome improves without hiding review cost or risk |

## Example from Adam's work

The summon.company register-truth workflow had five possible states and twelve
known scenarios. The real pipeline classified 12 of 12 correctly, with zero
false automatic closures in 2 security or payment cases. A focused rerun passed
15 of 15 tests.

The important pattern is not the product domain. It is the deployment contract:

- define the states before measuring the agent
- include sensitive cases in the acceptance set
- make uncertainty visible instead of forcing a confident answer
- preserve a human decision where a wrong automatic action is costly
- keep a receipt that can be inspected after the run

## Questions for an enterprise engineering team

1. Which repeated workflow currently consumes the most review time?
2. What does a correct result look like to the person who owns that workflow?
3. Which failures can be retried, which need escalation, and which must stop?
4. What context does the agent need, and what context must it never access?
5. Which metric would make the team trust the deployment enough to expand it?
6. What would cause the team to roll the workflow back?

## Failure conditions

Reject the deployment hypothesis when:

- the workflow is too rare to establish a baseline
- success depends on an unrecorded expert judgment that cannot be made explicit
- the test set excludes the costly failures
- the only metric is agent activity or token consumption
- human review is hidden rather than counted
- there is no owner for escalation and rollback

## Discussion prompt

The highest-value feedback is whether Cognition's strongest enterprise
deployments use a similar order of operations, and where this scorecard is too
slow, too narrow, or missing a decisive adoption signal.

