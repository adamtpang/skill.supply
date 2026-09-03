# OpenAI Full Stack Codex role assessment

Checked 2026-08-29 against OpenAI's official careers page, its current Ashby
job and form APIs, current Codex product materials, public Codex team evidence,
Adam's canonical profile, and `portal.voyage`.

## Verdict

Campaign for [Full Stack Software Engineer, Codex](https://jobs.ashbyhq.com/openai/5ebd5f66-75db-4a96-8d39-babc14f1c582).

This is Adam's strongest newly discovered role-level match. It has no stated
years or degree floor, directly asks for TypeScript, end-to-end product
ownership, agent workflows, developer tools, reliability, observability, and
user feedback, and publishes a $255,000 to $405,000 base range plus equity.

A same-day audit of nine live Codex engineering roles confirms that this is the
best single OpenAI application for Adam. The closest alternative, Computer Use
and Frontier Interfaces, has stronger Windows and interaction adjacency but
less direct evidence for Adam's desktop-product depth. The newer persistent
Agents product role explicitly requires 7+ years and is not an honest target.

It is not yet certified S-tier. The exact people manager is unknown and the
public team evidence combines exceptional peers and product leadership with
exact-team signs of a demanding operating cadence. People is 82 until a direct
manager, coaching evidence, and normal working cadence are verified. Adam must also
confirm relocation and three office days in San Francisco or Seattle.

## S-tier gate

| Axis | Score | Evidence | Binding gap |
| --- | ---: | --- | --- |
| Problem | 99 | The role works on the developer-facing Codex IDE extension and terminal interface across design, implementation, review, testing, debugging, remediation, maintenance, documentation, support, and open-source sustainability. The team owns agent workflows, orchestration, cloud infrastructure, developer tooling, reliability, observability, scalability, and performance. | Adam must confirm his actual Codex usage and that this remains a problem he wants to work on for years. |
| Hiring budget | 99 | The exact role is live in OpenAI's official feed, was published 2026-06-12, and lists $255,000 to $405,000 plus equity. The form is accepting applications and the role can be based in San Francisco or Seattle. | Exact level, equity value, relocation package, interview speed, and offer placement are unknown. |
| People | 82 | Thibault Sottiaux now leads OpenAI core products, including Codex. Alexander Embiricos is the Codex product lead and directly recruited full-stack engineers. Public team evidence shows strong peers, open-source behavior, a Codex-assisted onboarding system, and unusual product ownership. Current hires Philipp Spiess and Gabriel Cohen provide team-growth evidence, while Derrick Choi records more than a year of continuity. | None of the named leaders is proven to be the direct manager for this role, and no current direct-report coaching example is verified. Exact-team evidence also shows an engineer being paged during the original launch interview, a flaky rollout alert that had not been fully tuned, more than 100 bug-bash issues with most fixed within 24 hours, a ship-on-day-one onboarding norm, and leadership language about moving incredibly quickly. Recent anonymous company-wide reviews add pushy-atmosphere, turnover, and people-investment concerns alongside strong learning reports. Normal hours, on-call frequency, launch cadence, and recovery remain unverified. |
| Location | 91 | The official feed lists hybrid San Francisco with Seattle as a secondary location. The application requires three US office days per week. Adam is a US citizen, needs no sponsorship, and is open to US relocation. San Francisco is a top AI market in `portal.voyage`; the lower end of the published band can support savings after relocation. | Adam must choose San Francisco or Seattle, confirm three office days, and give a relocation date. `portal.voyage` does not currently contain Seattle, so only San Francisco has a repository-backed location score. |

`targetQuality = min(99, 99, 82, 91) = 82`

Status: `investigate`. Candidate match: 96. Access strength: 93.

## People-axis re-audit

The positive case is real. Public Codex material describes a roughly 40-person
team with one product manager and two designers, current engineers show that the
team is still adding people, and Thibault describes Codex itself as an onboarding
guide that helps new hires set up a computer, understand the codebase, and begin
shipping. That supports exceptional peers, fast feedback, and an unusually high
degree of ownership.

The same evidence prevents an S-tier people score. The team's public launch
interview captured engineer Calvin French-Owen being paged for failed rollouts;
the alert was described as flaky and not fully tuned before launch. Another
public account says a one-hour bug bash produced more than 100 issues and most
were fixed within 24 hours. The onboarding account also describes shipping on
day one, while Alexander asks for engineers who move incredibly quickly. These
facts do not prove recurring abusive hours, but they do prove operational
pressure and leave normal on-call frequency, night and weekend cadence, and
post-launch recovery unresolved. Anonymous OpenAI-wide reviews are mixed and
are treated only as supporting risk signals, not as proof about Codex.

## Why Adam can win

- EVID-001 proves a deployed TypeScript, React, and Next.js agent product with
  streamed progress, structured model output, live ATS data, Zod validation,
  and human review boundaries.
- EVID-002 proves substantial work in an existing agent codebase, including a
  register-truth reconciler, 12 of 12 known-ground-truth classifications, zero
  false auto-closes in security or payment cases, and Playwright and Vitest.
- EVID-008 proves public developer-tool adaptation in Python: Helium discovery,
  Windows support, CDP launch behavior, packaging, documentation, and a current
  full local result of 141 passed with 2 Windows symlink skips.
- EVID-006 adds founder-led customer discovery, selling, and delivery.
- Adam's strongest role shape in the canonical profile is full-stack TypeScript
  agent and developer-tools engineering. This role asks for that shape without
  an explicit seniority floor.

## Honest gaps

- Adam has 2 to 3 years of recorded engineering experience. The role does not
  state a floor, but the compensation band and scope imply a very high bar.
- No approved evidence proves large-scale cloud infrastructure ownership,
  distributed-systems depth, or production Rust. TypeScript is the supported
  match; Rust is an honest gap.
- skill.supply has no approved user, revenue, placement, or conversion claim.
- Adam's exact frequency, workflow, and observed friction using Codex are not
  recorded. This assessment proves current exposure, not daily use.
- The exact manager, coaching pattern, on-call burden, launch hours, and normal
  workweek are unknown.
- Adam has not chosen San Francisco or Seattle or confirmed three office days.

## Current Codex role-family audit

OpenAI's official board lists 28 Codex openings. A read-only pass over the
official Ashby feed compared the nine closest product, applied AI, harness, and infrastructure roles instead
of treating all Codex jobs as interchangeable.

| Role | Current decision | Why |
| --- | --- | --- |
| [Full Stack Software Engineer, Codex](https://jobs.ashbyhq.com/openai/5ebd5f66-75db-4a96-8d39-babc14f1c582) | `primary` | No stated years or degree floor. Direct TypeScript, full-stack product, agent-workflow, developer-tool, evaluation, reliability, and user-feedback match. San Francisco or Seattle. |
| [Software Engineer, Computer Use and Frontier Interfaces](https://jobs.ashbyhq.com/openai/39a709f3-6e9e-45e9-94eb-43a1c2aaaeaf) | `backup` | No stated years floor, same published compensation band, and strong Windows, computer-use, prototyping, and interaction adjacency. Adam's public proof is browser discovery and CDP reliability, not a shipped desktop or OS-integrated user product. San Francisco only. |
| [Full Stack Software Engineer, Agent Enablement](https://jobs.ashbyhq.com/openai/2d7f1028-ce9b-49c7-acc8-782714ca1cf4) | `backup` | No stated years floor and strong full-stack, user-control, agent-observability, and customer overlap. Identity, permissions, governance, compliance, subscription billing, and ecosystem protocol depth are less proven. San Francisco only. |
| [Applied AI Engineer, Codex Core Agent](https://jobs.ashbyhq.com/openai/577e6673-0a4a-491b-9a0d-facbdd3bdf3c) | `redirect only` | No stated years floor and unusually strong evaluation, failure-analysis, prompting, tool-use, feedback-loop, and user-outcome adjacency. Adam lacks approved production ML, fine-tuning, model-deployment, and deep Python ML-tooling proof. |
| [AI Systems Engineer, Codex Agents](https://jobs.ashbyhq.com/openai/de06790a-7243-4e33-a6f1-e7bd34009588) | `reject` | The harness and evaluation language is exact, but the role expects production distributed or ML systems, inference and GPU-stack debugging, sandboxing, Rust layers, and leadership across scoped or multi-team AI systems work. Adam's harness derivative and evaluations do not prove that depth. |
| [Software Engineer, Codex Core Agents](https://jobs.ashbyhq.com/openai/7ade7a12-845c-4e3a-af23-c028420bd181) | `reject` | The role centers production distributed infrastructure, containers, sandboxing, virtualization, stateful orchestration, fleet economics, and optional Rust. Adam has adjacent reliability proof but not the required production infrastructure ownership. |
| [Software Engineer, Cloud Agents](https://jobs.ashbyhq.com/openai/f6278b60-dd42-4aa8-a3cd-c105f75ae8ae) | `reject` | The official feed explicitly requires 9+ years plus large-scale backend, platform, distributed-systems, and cloud ownership. |
| [Product Engineer, Full Stack - Agents](https://jobs.ashbyhq.com/openai/5ed99d32-eed1-4679-b7b4-037de073e57c) | `reject` | The official feed explicitly requires 7+ years of professional full-stack or product-engineering experience. Adam records 2 to 3 years. |
| [Software Engineer, Web Layer](https://jobs.ashbyhq.com/openai/915a325b-55f6-44e2-8314-34ec0d8bb2c9) | `reject` | The work is browser-adjacent, but the role is mostly backend C++ and Chromium and asks for a strong C++ browser developer. That is not Adam's current proof. |

Do not scatter applications across this family. Lead with the current Full
Stack Codex role. Keep Computer Use as the one independent backup. Consider
Applied AI Core Agent only if an OpenAI recruiter redirects Adam after reviewing
his evaluation and failure-analysis proof.

## Current application schema

A read-only query to Ashby's public `ApiJobPosting` operation confirmed the
live application. No value was entered and no form state was changed.

Required fields and acknowledgements:

1. legal name
2. email
3. resume
4. phone number
5. current location
6. exact available start date
7. US work authorization
8. future sponsorship requirement
9. ability to work from a US office three days per week
10. applicant arbitration acknowledgement
11. certification that the applicant personally completed the application and
    that the answers are true

Preferred name and `Additional Information` are optional. Gender, race, veteran
status, and disability questions are voluntary.

The personal-completion certification is controlling. Codex may prepare the
resume, truthful answer sheet, and optional statement, but Adam must personally
enter, review, acknowledge, and submit this application. Do not use a browser
agent to fill it.

## Proof-first win mechanism

Lead with one coherent trust thesis rather than a generic list of AI projects:

> I build full-stack agent products that make progress, evidence, and human control inspectable, then test the failure boundaries in the environment where the agent actually runs.

The evidence chain is:

1. skill.supply for end-to-end TypeScript product ownership and streamed agent
   state
2. summon.company for known-ground-truth evaluation and truth reconciliation
3. Helium Harness for real browser-environment reliability, Windows discovery,
   packaging, and public tests

Do not build a speculative Codex clone. A concise application that connects
these three shipped or verified surfaces to the job description is stronger.

## Manual public route

Alexander Embiricos has publicly invited Codex product candidates to send one
link and one or two sentences about something they helped build. Adam must
review and send any message himself.

Copy-ready draft:

> Hi Alexander, I am applying for Full Stack Software Engineer, Codex. I adapted browser-use/browser-harness into a Helium-specific CDP harness with Windows discovery, packaging, documentation, and tests; the current local suite passes 141 tests with 2 Windows symlink skips: https://github.com/adamtpang/helium-harness. The throughline in my work is making agent behavior dependable and inspectable in the real environment where it runs.

This follows the requested one-link, one-to-two-sentence format. Do not ask for
a referral and do not attach private files.

## People and workload questions

Ask during the first human conversation:

1. Who directly manages this Full Stack Codex role?
2. What has that person done recently to help an engineer grow or broaden
   product ownership?
3. What are normal weekly hours outside launch periods?
4. How often do launches, incidents, or on-call require nights or weekends?
5. How does the team recover after a high-intensity launch?
6. How are product engineers evaluated across speed, product judgment,
   reliability, and user impact?
7. Which part of the role is currently most constrained: frontend experience,
   agent workflow design, orchestration, or cloud infrastructure?

Do not certify S-tier if the manager remains undefined, recurring 60-hour weeks
or weekend launches are normal, recovery is weak, or the role is leveled beyond
Adam's credible path.

## Adam gates

1. Exact current city in Malaysia.
2. Exact available start date.
3. San Francisco or Seattle preference and realistic relocation date.
4. Confirmation that three US office days per week are acceptable.
5. Actual Codex usage: frequency, surfaces used, workflow, and one observed
   friction. Say only what is true.
6. Review of the arbitration agreement and personal-completion certification.

## Sources

- [Official Full Stack Codex role](https://openai.com/careers/full-stack-software-engineer-codex-san-francisco/)
- [Official Ashby role](https://jobs.ashbyhq.com/openai/5ebd5f66-75db-4a96-8d39-babc14f1c582)
- [OpenAI careers and benefits](https://openai.com/careers/)
- [Codex across roles, tools, and workflows](https://openai.com/index/codex-for-every-role-tool-workflow/)
- [Scaling Codex to enterprises](https://openai.com/index/scaling-codex-to-enterprises-worldwide/)
- [OpenAI harness engineering](https://openai.com/index/harness-engineering/)
- [Alexander Embiricos recruiting for Codex product](https://www.linkedin.com/posts/embirico_product-manager-codex-activity-7381097039801032704-x86Z)
- [Alexander Embiricos recruiting full-stack Codex engineers](https://www.linkedin.com/posts/embirico_were-hiring-full-stack-and-infra-engineers-activity-7336165239987613696-e-tr)
- [Codex team structure and one-hour bug bash](https://www.linkedin.com/posts/gregorojstersek_interestingly-openais-codex-team-is-effectively-activity-7431717922810564608-x94W)
- [Codex-assisted onboarding and ship-on-day-one account](https://www.linkedin.com/posts/gregorojstersek_ai-tools-are-the-onboarding-buddy-for-ai-native-activity-7432443348927266816-Q6L4)
- [Codex launch interview with an on-call page](https://www.linkedin.com/posts/nidhiyashwanth_openai-codex-softwareengineering-activity-7329253602995200000-dPUi)
- [Philipp Spiess joining the Codex app team](https://www.linkedin.com/posts/philipp-spiess_big-news-today-is-my-first-day-at-openai-activity-7449845730363494400-WhDw)
- [Gabriel Cohen joining the Codex team](https://www.linkedin.com/posts/gabecohen_im-excited-to-share-that-ive-joined-the-activity-7434664088879783936-urql)
- [Derrick Choi's one-year Codex team account](https://www.linkedin.com/posts/derrickchoi_this-month-marked-my-1-year-anniversary-at-activity-7455277395382726656-cOeD)
- [Current OpenAI employee reviews](https://www.glassdoor.com/Reviews/OpenAI-Reviews-E2210885.htm)
- [Current OpenAI Codex role search](https://openai.com/careers/search/?q=codex)
- [Computer Use and Frontier Interfaces role](https://openai.com/careers/software-engineer-computer-use-and-frontier-interfaces-san-francisco/)
- [Agent Enablement role](https://openai.com/careers/full-stack-software-engineer-agent-enablement-san-francisco/)
- [Applied AI Engineer, Codex Core Agent](https://openai.com/careers/applied-ai-engineer-codex-core-agent-san-francisco/)
- [AI Systems Engineer, Codex Agents](https://openai.com/careers/ai-systems-engineer-codex-agents-san-francisco/)
- [Software Engineer, Codex Core Agents](https://openai.com/careers/software-engineer-codex-core-agents-san-francisco/)
- [Software Engineer, Cloud Agents](https://openai.com/careers/software-engineer-cloud-agents-san-francisco/)
- [Web Layer role](https://openai.com/careers/software-engineer-web-layer-san-francisco/)
- [Gav Verma recruiting for Codex engineering](https://www.linkedin.com/posts/vermagav_software-engineer-codex-for-teams-activity-7416567539524100096-bx4s)
- [OpenAI plan to acquire Ona](https://openai.com/index/openai-to-acquire-ona/)
- [Johannes Landgraf on joining the Codex team](https://www.linkedin.com/posts/johanneslandgraf_ona-is-joining-openai-as-part-of-the-codex-activity-7470855553288876032-ICqa)
- `data/profiles/adam-pangelinan/profile.md`
- `C:\Users\adamp\Aether\portal.voyage\data\cities.json`
