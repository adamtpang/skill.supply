# Top-tech resume benchmark

Prepared 2026-08-31. This benchmark asks a narrower and more useful question
than "best resume of all time": what patterns recur in exceptional public
engineering resumes and in the current roles Adam wants?

There is no objective all-time ranking. The corpus below combines public
resumes from engineers who reached OpenAI, Anthropic, Stripe, Google, Apple,
Netflix, and AWS; one exceptional early-career resume; authoritative university
guidance; and current OpenAI role requirements. Company and school prestige are
excluded from the score. The document must win on proof.

## Peers found for elite technical resumes

| Peer or reference | Concrete pattern worth studying | Source |
| --- | --- | --- |
| Luke Farritor | One page. Early-career work is made credible through 13,000 downloads, 2,000 monthly web users, trained daily users, awards, a 50-guitar hardware build, and a $14,000 Kickstarter. | Local copy: `C:\Users\adamp\Desktop\win\Admin\Resume Docs\Luke_Farritor_Resume.pdf` |
| Adam Georgiou, OpenAI MTS | Each project combines mechanism, scale, and outcome: 100M-row migration, zero downtime and data loss, hundreds of GB, hundreds of thousands of API calls per day, and a 30 percent page-load improvement. | https://www.adamgeorgiou.com/resume.html |
| Chanzo Bryan, OpenAI MTS | Uses operational scale and economic effect: billions of records, 400 percent page-load speedup, 200 percent report speedup, and more than $20,000 in storage savings. | https://chanzobryan.com/resume/ |
| Andrei Cioara, OpenAI MTS | Names launches and visible ownership rather than generic responsibilities, including ChatGPT Search and Apple Intelligence features. The public PDF is one page. | https://andrei.cioara.me/CV_Andrei_Cioara.pdf |
| Colton Weaver, Anthropic MTS | Compresses a career into a sharp technical identity: distributed systems, product infrastructure, API design, and ownership of Stripe's account model. | https://www.coltonweaver.com/ |
| Christopher Andrejewski, Anthropic MTS | Very concise, plain-language bullets. Strongest lines identify user or operational effect, such as reducing customer incidents and saving engineering time. Some vague bullets show the limit of brevity without proof. | https://jew.ski/resume/ |
| Franklin Hu, former Stripe staff engineer | Shows organization-level leverage: grew a team from 3 to 30 engineers, eliminated an attack surface, migrated AWS regions with no downtime, and reduced spend 10 percent. | https://thisisfranklin.com/resume/ |
| dphang software-engineering template | One-page, conventional structure with contact, experience, skills, and education. The author reports recruiter interviews at Microsoft, Google, Square, Uber, and Compass and no major parsing problems. | https://github.com/dphang/resume |
| MIT CAPD | Recommends action, task, outcome, and accomplishment. It explicitly asks candidates to quantify scale such as users, budget, data, or team size. | https://capd.mit.edu/resources/resumes-writing-about-your-skills/ |
| Stanford engineering sample | Uses concrete demonstrations even for students: robot degrees of freedom, team size, fundraising, and a successful physical behavior. | https://careered.stanford.edu/sites/g/files/sbiybj22801/files/media/file/resume-and-cover-letter-examples.pdf |
| Harvard career guide | Requires specific, active, fact-based, quantified language written for fast scanning, with tailoring to the target position. | Local copy: `C:\Users\adamp\Desktop\win\Admin\Resume Docs\Harvard University FREE Resumes & Cover Letters Templates.pdf` |
| OpenAI Codex role | Defines full stack as UI, workflow orchestration, agents and prompts, backend systems, cloud infrastructure, and developer tooling. | https://openai.com/careers/full-stack-software-engineer-codex-san-francisco/ |
| OpenAI API Experience role | Values end-to-end ownership from product definition and UX through backend implementation, launch, measurement, iteration, reliability, and developer empathy. | https://openai.com/careers/full-stack-software-engineer-api-experience-new-york-city/ |

## Saturation check

The format is saturated. A clean one-page technical resume is table stakes, not
a differentiator. The scarce signal is externally legible proof: adoption,
scale, money, reliability, or a technically specific result with a credible
link. Visual novelty does not compensate for missing proof.

## Blind scoring rubric

Names, employers, schools, and prestige are ignored. Only the stated evidence
is scored.

| Dimension | Weight | What earns full credit |
| --- | ---: | --- |
| External impact and scale | 30 | Users, money, latency, reliability, adoption, or operational change with defensible numbers |
| Technical depth | 20 | Specific mechanisms, constraints, architecture, or root cause rather than tool lists |
| Ownership | 15 | Clear personal scope, decisions, leadership, or end-to-end responsibility |
| Ten-second scan | 15 | One page, strong hierarchy, compact bullets, no filler |
| Credibility | 10 | Every claim is bounded, attributable, and supported by a link or recorded fact |
| Target relevance | 10 | The first half maps directly to agent products, developer tools, reliability, and full-stack ownership |

## Scorecard

These scores compare the documents, not the people. They are judgment calls
under the rubric above, not hiring probabilities.

| Resume | Impact /30 | Depth /20 | Ownership /15 | Scan /15 | Credibility /10 | Relevance /10 | Total /100 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Adam Georgiou | 29 | 20 | 15 | 13 | 10 | 10 | 97 |
| Franklin Hu | 27 | 19 | 15 | 13 | 10 | 9 | 93 |
| Andrei Cioara | 26 | 19 | 15 | 14 | 10 | 9 | 93 |
| Luke Farritor | 29 | 17 | 14 | 14 | 10 | 8 | 92 |
| Chanzo Bryan | 27 | 18 | 15 | 13 | 10 | 9 | 92 |
| Christopher Andrejewski | 18 | 16 | 14 | 14 | 9 | 8 | 79 |
| Adam's prior Desktop resume | 14 | 18 | 14 | 14 | 9 | 10 | 79 |
| New canonical Adam resume | 16 | 19 | 15 | 15 | 10 | 10 | 85 |

## What to actually borrow

1. Put the strongest mechanism and result in the first half of every bullet.
   summon.company now leads with the real reconciliation pipeline, 12 of 12
   known scenarios, and zero sensitive false closes.
2. Keep the counterintuitive Quantus story. Five logical adapters on two
   physical GPUs is memorable, technically specific, and externally reviewed.
3. Use one general identity: full-stack software engineer focused on agent
   systems, developer tools, and reliability. Do not make the default resume a
   frontend-only document.
4. Preserve links as evidence, not decoration. Every selected project links to
   a deployment, evaluation, issue, or public repository.
5. Prefer a verified small result over an impressive unsupported claim. The
   two-hour to two-minute workflow stays. Old claims about hundreds of routers,
   a 1,000-person community, and unverified Lightmark architecture stay out.

## What not to borrow

- Do not imitate senior-scale claims. Adam has 2 to 3 years of experience and
  should not imply OpenAI, Stripe, Google, Netflix, or Apple scale.
- Do not turn every bullet into a percentage. A precise mechanism is stronger
  than a fabricated metric.
- Do not use a decorative two-column layout, skill bars, icons, a headshot, or
  an oversized summary. They consume proof space and add parsing risk.
- Do not rely on company names or a bootcamp credential to carry the document.

## Binding gap

The remaining gap is not writing. It is verified external impact. The rewrite
can move the document from 79 to about 85 by improving selection, focus, and
proof density. Reaching the low 90s requires receipts such as:

- how many people used the Guam Power Authority automation and how often;
- the exact customer outcome from the Hilton or other Anchor Marianas delivery;
- real skill.supply completed reports, repeat users, or successful interviews;
- real IDI Guam traffic, inquiries, or operational use;
- external summon.company users, contributors, references, or adoption.

Those numbers must be measured or confirmed. They cannot be written into
existence.
