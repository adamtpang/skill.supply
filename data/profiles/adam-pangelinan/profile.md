# Adam Pangelinan — application profile

Single source of truth for filling Adam's job applications. Read this file before asking him a question. Use a recorded answer when the form's wording matches it. Ask only for a blank item under [Open questions](#open-questions-ask-adam), or when the form needs a fact this file does not record.

This file is safe to commit. It stores city-level location only. It does not contain a phone number or a street address. Do not add either.

Last assembled 2026-11-24. Employment dates, titles, and the public project list come from the resume at [adampang.com/cv](https://adampang.com/cv), file `src/app/cv/resume.json` in `adamtpang/adampang.com`, last updated Nov 1, 2026. Older skill.supply resume builders from August 2026 disagree with that resume. Those older lines are listed under [Superseded answers](#superseded-answers) and must not be typed into a form.

Machine-readable twin: [`profile.json`](profile.json).

## Identity

| Field | Answer |
| --- | --- |
| Legal name | Adam Pangelinan |
| Goes by | Adam Pang |
| Email | adamtpang@gmail.com |
| Website | https://adampang.com |
| Resume | https://adampang.com/cv |
| GitHub | https://github.com/adamtpang |
| LinkedIn | https://www.linkedin.com/in/adamtpang/ |

Use the legal name on a legal-name field and Adam Pang on a preferred-name field.

## Location

| Field | Answer |
| --- | --- |
| Current city | New Braunfels, TX |
| Relocation | Will move to Austin for the right job |
| Locations listed on his YC profile | Austin, Seattle, Dubai |

City only. Do not look up or type a street, ZIP code, or phone number.

## Work authorization

Authorized to work in the United States. Does not need visa sponsorship now or in the future.

This repo also records that he is a US citizen (`lib/candidate.ts`, resume builders). Use that only when the form asks about citizenship. The authorization answer above is the one that maps to "authorized to work" and "sponsorship" questions.

Also recorded in `lib/candidate.ts`, and not restated after that file:

- Does not currently have Singapore work authorization and requires employer sponsorship for a Singapore work visa.
- Will not take employment in Malaysia.

## Education

| School | Credential | Dates |
| --- | --- | --- |
| High school | Diploma | not recorded |
| University of Guam | One semester of Computer Science. No degree. | not recorded |
| App Academy | Certificate | 2023 |

No university degree. App Academy's 2023 certificate is the completed program on the Nov 1, 2026 resume (`https://appacademy.io`).

## Headline

Forward Deployed Engineer | I build AI agents for real businesses | Solo Grok Bot Hackathon winner (won solo, Austin, Oct 2026).

## Target roles

Forward Deployed Engineer, Applied AI, and Solutions Engineer at fast-moving AI startups and YC teams.

## Compensation

Willing to go below a $120,000 listed minimum.

The exact expected annual base salary is not recorded. Leave it blank and ask. Do not type the unapproved Partly range from `PARTLY_PRODUCT_ENGINEER_US_ASSESSMENT_2026-08-29.md`.

## EEO

Default: decline to self-identify.

Use that default for voluntary race, gender, ethnicity, disability, and veteran self-identification questions. His choice on a specific form remains his. If he has already picked a different answer for that form, use his choice. Do not infer a demographic answer.

Veteran status itself has no saved answer. See open questions.

## Work history

Dates and titles below are the Nov 1, 2026 resume. Copy them as written. The resume leaves EIGN's title empty, so a form that requires an EIGN title is an open question.

### Quantus — Ambassador — Jul 2026 to present

https://quantus.com

- Built [vc.fail](https://vc.fail): 28 of the top 100 VCs hold a quantum-related asset. Built [exchange.fail](https://exchange.fail): 841 of 947 exchanges list no post-quantum coins.

`YC_WAAS_PROFILE_REPAIR_2026-08-28.md` also calls this role remote.

### EIGN — title not on the resume — Dec 2025 to Jan 2026

https://eign.xyz

- B2B outreach and AI SEO internal tools.

### Guam Power Authority — Intern — Summer 2024

- Wrote a Python script, used by interns, that cut an Excel workflow from ~2 hours to ~2 minutes per run.

`YC_WAAS_PROFILE_REPAIR_2026-08-28.md` places this role in Guam.

### International Distributors — Sales Associate — Oct 2020 to Apr 2021

The Nov 1, 2026 resume has no bullets for this role. `YC_WAAS_PROFILE_REPAIR_2026-08-28.md` places it in Guam and says not to repeat revenue or account-count claims. Do not add those claims.

## Projects

Public project list from the Nov 1, 2026 resume. Use this list on a resume or project field.

### Garage Sale

https://grokbothackathon.vercel.app — GitHub: https://github.com/adamtpang/grokbothackathon

Grok agents that find Marketplace deals, price items, write listings and draft buyer replies, with human approval on every step. Built in 2.5 hours.

### summon.guide

https://summon.guide — GitHub: https://github.com/adamtpang/summon.guide

Chat with 58 AI mentors from history, with cited sources, side-by-side compare and a council mode.

### youchop.app

https://youchop.app/chop — GitHub: https://github.com/adamtpang/youchop.app

Paste a YouTube link, get timestamped chapters ready for the description. 66 commits, built solo.

### megawatt.fun

https://megawatt.fun

A page on the Kardashev scale with a small battery game.

### senrajobs.com

https://senrajobs.com

Jobs at David Senra's guests' companies.

## Achievement on the resume

Grok Bot Hackathon, Winner (solo), Austin, Oct 2026.

The same resume, as of Nov 1, 2026, also lists 5,660 GitHub contributions and 362 pull requests on https://github.com/adamtpang. Treat those two counts as a snapshot from that date.

## Skills on the resume

Recorded Nov 1, 2026:

- Languages: TypeScript, Python, JavaScript, Bash
- Frameworks: React, Next.js, Node.js, FastAPI
- AI: Grok, Anthropic and OpenAI APIs, tool use, MCP, structured outputs, evals
- Infra: Vercel, Redis, Git, Playwright

`lib/candidate.ts` still holds an older evidence bank (skill.supply, summon.company, darktalent.tech, company.university) used by this repo's scoring notes. That bank is not the public resume project list. Do not swap it in for the projects above.

## Superseded answers

August 2026 resume builders in this repo (`build_canonical_top_tech_resume_pdf.py` and the role-specific builders) and `lib/candidate.ts` still contain older lines. Do not type them into a form.

- Current location Forest City, Johor, Malaysia, or any UTC+8 overlap. Current city is New Braunfels, TX.
- EIGN as "Software Engineer and B2B Sales", "one-month trial, ended Dec 2025", or a Lightmark multi-provider evaluation pipeline. The resume line is Dec 2025 to Jan 2026, title blank, "B2B outreach and AI SEO internal tools."
- Anchor Marianas, Founder and Software Engineer, Oct 2024 to present. That line is not on the Nov 1, 2026 resume.
- Guam Power Authority as "Workflow Automation | 2024" or "GIS Engineer", and the April / June 13 / August 18 2024 notes in `EVIDENCE.md`. The resume line is Intern, Summer 2024.
- Tropicode, August through October 2023. `EVIDENCE.md` mentions it and records no title. It is not on the Nov 1, 2026 resume.
- App Academy as "2022 to 2023 | San Francisco". The resume line is Certificate, 2023.
- "Currently at Network School."
- "Available as soon as possible" and "no notice period."
- "Open to relocation worldwide."
- A proposed Partly base of $120,000 to $135,000.
- International Distributors revenue or account-count wording.
- "Company careers page" as the answer to how he heard about a role, unless he says that for the specific role.

## Open questions (ask Adam)

No saved answer. Leave the field blank and ask. Do not infer.

- Expected annual base salary number — TODO
- Veteran / protected veteran / military spouse status — TODO
- Willingness to take a drug screen — TODO
- Willingness to travel, and what percent — TODO
- Shift / overtime availability — TODO
- Ever employed by a specific company the form names — TODO
- Reliable transportation — TODO
- 18 or older — TODO
- English fluency — TODO
- Earliest start date — TODO
- Notice period — TODO
- References — TODO
- Relocation assistance needs — TODO
- How he heard about the role — TODO
- EIGN job title, when a form requires one — TODO
