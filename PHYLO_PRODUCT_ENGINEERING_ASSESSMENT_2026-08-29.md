# Phylo Product Engineering assessment

Checked 2026-08-29 against Phylo's official Ashby feed, official product and
company materials, current public team evidence, Adam's canonical profile, and
a read-only inspection of the live application form.

## Verdict

Pursue [Member of Technical Staff, Product Engineering](https://jobs.ashbyhq.com/phylo/c691cf71-cb9f-4ca3-a7e4-8b82bd91fca2)
as a high-priority investigation after Adam confirms genuine interest in
biomedical discovery and onsite work in South San Francisco.

This is one of Adam's cleanest mechanical matches. The role asks for 2 or more
years, React or TypeScript, frontend-leaning full-stack ownership, agent
interfaces, developer tools, isolated execution, and AI-native workflows.
Adam has approximately 28 to 29 supportable non-overlapping paid engineering
months and direct proof across most of that surface. There is no stated degree
requirement.

It is not yet an S-tier workplace. The public record shows an unusually strong
founding team and inspectable technical work, but does not identify Adam's direct
manager or show how that person develops engineers. Normal weekly hours,
on-call, launch recovery, and whether the speed culture is sustainable are also
unknown.

## S-tier gate

| Axis | Score | Evidence | Binding gap |
| --- | ---: | --- | --- |
| Problem | 98 | Phylo is turning agentic AI into a working biomedical research environment. Its launch report says Biomni reached tens of thousands of scientists across more than 7,000 labs and organizations, and alpha users were already running thousands of monthly queries. The product role owns the core scientist-facing experience, not a peripheral internal tool. | Adam has not confirmed that biomedical discovery is a problem he wants to stay close to for years. He has not confirmed current Biomni use. |
| Hiring budget | 86 | The exact role is live at $200,000 to $300,000 base plus equity. Phylo announced a $13.5 million seed round co-led by a16z and Menlo Ventures' Anthology Fund with Anthropic, reports a 20-person team after doubling, and is hiring across several technical roles. | Exact equity, relocation, level placement, hiring speed, revenue, burn, and runway are unknown. A 20-person team plus several $200,000 to $300,000 roles is meaningful spend against a $13.5 million seed. |
| People | 83 | CEO Kexin Huang and co-founder Yuanhao Qu built Biomni from Stanford research. Tianwei She publicly recruits product engineers and has relevant prior experience at Factory, Moveworks, and Scale AI. Zixin Huang's current technical writing exposes real work on agent-managed sandboxes. The current team also reports backgrounds from Anthropic, Notion, Factory, Scale AI, and Stanford. | The exact direct manager is not named. Public evidence does not establish current coaching, feedback quality, normal hours, on-call, recovery, or whether `excellence and speed` remains sustainable. |
| Location | 91 | The official role is onsite in South San Francisco. The Bay Area is Adam's strongest recorded AI and startup market. He is a US citizen, requires no sponsorship, and is recorded as open to worldwide relocation. The salary band can support Bay Area savings if the offer is not at an unexpectedly low level. | Adam must confirm onsite South San Francisco and give a relocation window. Relocation support and the exact weekly office cadence are not stated. |

`targetQuality = min(98, 86, 83, 91) = 83`

**Status: `investigate`.** The target fails certification on the people gate and
required unknowns, not on candidate fit.

## Why the problem is real now

- [Phylo's launch report](https://phylo.bio/blog/company-fundraising-announcement)
  says Biomni was adopted by tens of thousands of scientists across more than
  7,000 labs, biopharma companies, and healthcare organizations.
- The same report says the product integrates more than 300 databases, software
  systems, and analytical tools. Alpha users were already sending thousands of
  monthly queries, and a Ginkgo Bioworks case study reduced work described as
  taking weeks to hours.
- Phylo has since launched [Biomni MCP, Desktop, and Mobile](https://phylo.bio/blog/biomni-everywhere),
  which makes the product-engineering surface broader than a single web chat.
- Current official announcements show enterprise deployment with
  [Ono Pharmaceutical](https://phylo.bio/blog/ono-partnership) and
  [Chugai Pharmaceutical](https://phylo.bio/blog/chugai-partnership).
- [Agent-managed sandbox work](https://phylo.bio/blog/agent-managed-sandboxes-for-scientific-workloads)
  demonstrates that the nice-to-have execution-environment requirement maps to
  a real current product system.

## Candidate match

**Candidate match: 97. Access strength: 98.**

### Direct matches

- EVID-001 is a deployed TypeScript, React, and Next.js agent product with live
  ATS ingestion, structured model output, Zod validation, streamed run state,
  and explicit human-review boundaries.
- EVID-002 adds 155 personal commits inside an existing agent platform fork,
  Playwright and Vitest, and a 12-scenario known-ground-truth evaluation that
  classified 12 of 12 cases correctly with zero false auto-closes in two
  security or payment cases.
- EVID-008 is a public Helium-specific derivative of
  browser-use/browser-harness with Python, CDP, Windows discovery, packaging,
  documentation, and a current full local result of 141 passing tests with 2
  Windows symlink skips.
- Adam's recorded paid-engineering total clears the role's 2-year minimum
  without inflating it to three completed years.
- Adam is a US citizen and can truthfully answer that he does not require visa
  sponsorship.

### Honest gaps

- No approved evidence establishes biomedical research or life-sciences domain
  depth.
- No approved evidence establishes production billing, metering, enterprise
  permissions, or authentication ownership at Phylo's likely scale.
- Adam has no verified production-user, revenue, traffic, latency, or uptime
  metric for his current agent products.
- Adam has not confirmed using Biomni Lab or described an authentic product
  friction. Do not imply product use.
- The role expects high autonomy at a seed-stage company. Clearing a 2-year
  minimum does not prove the team will level Adam inside the $200,000 to
  $300,000 band.

## Live application finding

A read-only Helium Harness inspection confirmed the live form contains:

- required name and email
- required resume
- a current-location field
- required LinkedIn URL
- a yes or no sponsorship question
- one optional `Anything else you'd like the team to know?` field
- an invisible reCAPTCHA and final submit

There is no required essay in the rendered form. Nothing was entered, uploaded,
or submitted. Adam must perform every external action himself.

## Win mechanism

Do not build a speculative biology demo before talking to the team. Lead with a
role-specific one-page resume and three existing proofs:

1. skill.supply for TypeScript, React, live integrations, streamed state, and
   end-to-end product ownership.
2. The register-truth evaluation for traceable agent correctness and explicit
   failure boundaries.
3. Helium Harness for agent tooling, environment discovery, packaging, and
   tested systems behavior.

The optional note should connect those proofs to scientist-facing agent work
without claiming biology expertise:

> I build full-stack agent products where users need to understand what the
> system is doing before they trust the result. My recent work includes a
> deployed TypeScript and Next.js product with streamed agent state, a
> 12-scenario known-ground-truth evaluation with 12 of 12 correct
> classifications, and a public Helium-specific browser harness with 141 passing
> tests and 2 platform skips. Phylo stands out because the product challenge is
> not merely generating an answer. It is making long-running, tool-using agent
> work steerable, reliable, and usable by scientists. I am a US citizen, require
> no sponsorship, and am open to relocating to South San Francisco.

Adam should manually review and enter this text if he chooses to apply.

## People and workload calibration

Tianwei She publicly says Phylo is hiring agent, product, and infrastructure
engineers and invites interested people to contact him. Adam may manually send
this note after reviewing it:

> Hi Tianwei, I saw that you are hiring product engineers for Biomni Lab. The
> frontend-leaning full-stack role maps closely to my TypeScript agent-product
> work and a public browser harness I maintain. Before I apply, one calibration
> question: who directly develops the person in this role, and what is one recent
> example of that person helping an engineer grow in scope or judgment? I am not
> asking for a referral.

The first human conversation must also answer:

1. Who is the direct manager, and who reviews product and architecture choices?
2. What concrete example shows that person developing an engineer?
3. What were normal weekly hours during the last eight weeks?
4. How often did the team work nights or weekends, and what recovery followed?
5. Is there an on-call rotation? What is the typical incident load?
6. Why has this role remained open since February: selectivity, growth, or a
   changed scope?
7. What level and equity range map to Adam's approximately 28 to 29 months and
   public proof?
8. Does Phylo provide relocation assistance, and how many office days are
   required?

Promote only if the named manager supplies a credible development example and
the workload evidence is sustainable. Reject as non-S-tier if the manager stays
unknown, recurring uncontrolled nights or weekends are normal, or the offer and
relocation package cannot support Bay Area savings.

## Required Adam confirmations

Before any application action, Adam must confirm:

1. Whether accelerating biomedical discovery is genuinely compelling enough to
   work on for years.
2. Whether onsite work in South San Francisco is acceptable.
3. A realistic relocation window.
4. Whether he has used Biomni Lab. If yes, record actual frequency and one
   observed friction. If no, answer `No` and do not embellish.
5. The current city on application day. Until Adam reports a move, the grounded
   answer is Forest City, Johor, Malaysia, recorded 2026-08-22.

## Sources

- [Official Phylo role](https://jobs.ashbyhq.com/phylo/c691cf71-cb9f-4ca3-a7e4-8b82bd91fca2)
- [Phylo company launch and seed announcement](https://phylo.bio/blog/company-fundraising-announcement)
- [Phylo About](https://phylo.bio/about)
- [a16z investment announcement](https://a16z.com/announcement/why-we-invested-in-phylo/)
- [Tianwei She public profile and current hiring activity](https://www.linkedin.com/in/tianwei-she)
- [Zixin Huang on agent-managed sandboxes](https://phylo.bio/blog/agent-managed-sandboxes-for-scientific-workloads)
