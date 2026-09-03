# summon.company and Quantus technical proof

Prepared 2026-08-31 for applications and interviews. This is a truthful proof
package, not a claim of sole authorship over either upstream project.

## Positioning

I build reliable agent systems and can descend into lower-level infrastructure
when the abstraction breaks.

## summon.company

### Short application version

I extended a Paperclip-derived agent-company system with a register-truth
reconciler and an end-to-end evaluation suite. Twelve known-ground-truth
scenarios cover all five reconciliation outcomes. The suite classified 12 of
12 correctly and produced zero false auto-closes for its security and payment
cases, even when the code evidence appeared satisfied.

### Interview version

The failure mode was organizational state drifting away from repository truth.
A generated register could claim that work remained open after the code changed,
or close a sensitive finding merely because a shallow code probe passed. I built
an evaluation around the real `reconcileRegister()` pipeline rather than testing
only isolated helper functions.

The scenarios cover landed fixes, partial improvements, untouched claims,
contradicted evidence, missing anchors, multi-probe disagreement, and sensitive
security or payment findings that must remain human-reviewed. The known-ground-
truth suite scored 12 of 12 across `closed`, `partial`, `open`, `contradicted`,
and `needs_human`, with zero false auto-closes on the two sensitive cases.

A separate run against a real register from a clone that was 269 commits stale
classified seven findings closed, one partial, and one as needing human review.
The synthetic suite proves the decision logic against known answers; the stale-
register run shows that it remains useful on messy repository history.

### Evidence

- Evaluation report:
  https://github.com/adamtpang/summon.company/blob/master/outbound/register-truth-eval/EVAL-REPORT.md
- Repository:
  https://github.com/adamtpang/summon.company
- Known-ground-truth result: 12/12 across five statuses.
- Sensitive-case result: 0/2 false auto-closes.

### Boundary

summon.company is a derivative of Paperclip. Adam contributed the reconciler,
evaluation, and related integrity features. Do not imply that Adam authored the
upstream Paperclip system.

## Quantus

### Short application version

I root-caused a production OOM in a Rust GPU miner on Windows. `wgpu` exposed
five adapters for two physical GPUs because Vulkan and DX12 each enumerated the
same devices and also included a CPU-emulated Basic Render Driver. The miner
created a worker for every entry and exhausted memory during startup. A
maintainer verified the diagnosis, reviewed my proposed fix, and shipped the
corrected upstream adapter-selection strategy.

### Interview version

The miner reported five GPU devices on a laptop containing one integrated AMD
GPU and one discrete NVIDIA GPU. Tracing `GpuEngine::init` showed that the
enumeration contained each physical card once per backend plus Microsoft's CPU-
emulated adapter. The worker pool treated all five entries as independent GPUs,
so multiple contexts competed for the same VRAM and the process panicked during
chunk allocation.

I captured the environment, adapter list, crash, initialization path, and
proposed filtering CPU adapters and deduplicating physical devices. Maintainer
review confirmed the diagnosis but found a critical flaw in my first patch:
grouping by PCI vendor and device IDs would collapse legitimate rigs containing
multiple identical GPUs. That review led to the safer architecture: select a
single preferred backend and retain every adapter within it. The corrected fix
was merged upstream.

This is a useful engineering story because both parts are real. The production
root cause was correct and actionable, while review exposed a generalization
error in the first implementation before it could cause silent hashrate loss.

### Evidence

- Reproduction and root cause:
  https://github.com/Quantus-Network/quantus-miner/issues/61
- Adam's proposed implementation and maintainer review:
  https://github.com/Quantus-Network/quantus-miner/pull/62
- Corrected upstream implementation:
  https://github.com/Quantus-Network/quantus-miner/pull/67

### Boundary

Adam's pull request 62 was closed rather than merged. Do not claim that Adam's
code shipped. Claim the verified diagnosis, proposed implementation, review
iteration, and causal path to the corrected upstream fix.

## Combined one-liner

I build agent systems whose decisions can be evaluated against known truth, and
I can trace failures through Rust, GPU enumeration, drivers, and memory behavior
when the infrastructure underneath those agents breaks.
