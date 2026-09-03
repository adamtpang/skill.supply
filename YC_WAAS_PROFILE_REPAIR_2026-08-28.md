# YC Work at a Startup profile repair

Audited read-only through Adam's authenticated Helium session on 2026-08-28. The profile is submitted and visible to YC companies, but its current preview materially understates Adam and contains stale or malformed data.

No external profile field was edited.

## Why this is urgent

The Sira application page warns that Adam's qualifications may not match a 1+ year Founding Engineer role. The company-facing preview explains why:

| Profile surface | Current visible state | Corrective action |
| --- | --- | --- |
| Current city | Alameda, California | Replace with Adam's actual current city after he confirms it. The canonical profile supports only Malaysia, UTC+8. |
| Engineering experience | Less than 1 year | Set the integer field from `0` to `2`, the conservative end of the supported 2 to 3 year range. |
| Work dates | Every job shows `Invalid date - Invalid date` | Adam must provide exact start and end months. Do not guess. |
| Role narrative | Says Adam wants a remote engineering role | Replace with a small-team, high-agency, AI-agent and developer-tools narrative that includes relocation. |
| Relocation | Willing to relocate, but no destinations selected | Select San Francisco Bay Area, New York City, and Anywhere in the US if Adam confirms all remain accurate. |
| Strongest skills | TypeScript and Next.js shown as intermediate; current list omits browser and agent evidence | Recalibrate only evidence-backed skills. |
| Proud project | `legends.guide` | Replace with skill.supply or Helium Harness. |
| Current proof | No Helium Harness, skill.supply, or summon.company | Add the strongest current public work. |
| Daily-use companies | Vercel, Anthropic, and ElevenLabs are described as daily-use companies | Remove unless Adam reconfirms each product, frequency, workflow, and observed friction. |
| Education | Duplicate or malformed certification entries | Keep App Academy as the clear completed program. Remove or fix unmatched certificate entries. |

## Exact manual changes

### Location

- Current city: ask Adam. Do not infer that he is still in Forest City.
- US work authorization: keep `Yes`.
- Sponsorship required: keep `No`.
- Remote: keep `I'm open to working remotely`.
- Relocation: keep `Yes`.
- Relocation presets: select `San Francisco Bay Area`, `New York City`, and `Anywhere in the US` if Adam confirms them.

### Role

- Job function: keep `Engineering`.
- Engineering role: keep `Full stack`; add product-oriented or backend choices only if the UI offers them and Adam wants them.
- Job type: keep `Full-time employee`.
- Professional software-engineering experience: change `0` to `2`.
- GitHub: keep `https://github.com/adamtpang`.

### Skills

Use no more than ten. Recommended evidence-backed set, subject to the platform's available labels:

1. TypeScript: Advanced
2. Next.js: Advanced
3. React: Intermediate
4. Node.js: Intermediate
5. Python: Intermediate
6. Playwright: Intermediate
7. AI Agents: Intermediate
8. Prompt Engineering: Advanced
9. Git: Intermediate
10. Amazon Web Services: Intermediate only if Adam still endorses that level

Remove MongoDB, Ruby on Rails, or generic Data Analytics before omitting a more relevant agent, testing, or Node.js skill.

### About headline

Use:

> Full-stack TypeScript engineer who ships AI agent tooling end to end.

### What are you looking for in your next role?

Use:

> I am looking for a product or full-stack engineering role on a small, high-agency team building reliable AI agents, developer tools, or operational software. I do my best work owning ambiguous problems end to end, talking with users, and turning feedback into tested product. My strongest current proof includes Helium Harness, a tested Helium-specific derivative of browser-use/browser-harness; skill.supply, a Next.js career agent with structured outputs and live ATS inventory; and agent-auditability work in summon.company with Playwright and Vitest. I am a US citizen, open to US relocation, and available as soon as possible.

### Proud project

Use skill.supply as the general YC-profile answer:

> I built skill.supply from an empty repository into a deployed Next.js 16 career agent in under two weeks. The product combines structured Anthropic outputs, Zod validation, streamed run states, live job inventory from public ATS APIs, and explicit human-review boundaries for high-impact actions. The important engineering problem was not generating persuasive text. It was making every recommendation traceable to current job evidence and keeping applications under human control. The project is public at https://github.com/adamtpang/skill.supply and deployed at https://skill.supply.

For browser-agent applications, lead the direct message with Helium Harness instead of replacing the general profile answer.

## Work-history repair rules

Do not repair dates until Adam supplies exact months. Once supplied, keep only supported facts:

- Quantus: Ambassador, remote, since July 2026.
- EIGN: Software Engineer and B2B Sales, remote. End month required. Do not describe Lightmark as a multi-provider LLM evaluation pipeline unless Adam confirms that a separate or earlier system existed and supplies provenance. The current product is an AI-visibility website diagnostic.
- Anchor Marianas: founder and personal holding company. Sold and delivered software to clients, including Hilton. Start month required.
- International Distributors Inc.: Sales Associate, Guam. Exact dates required. Do not repeat the current revenue and account-count claims unless Adam re-approves them.
- Guam Power Authority: GIS Engineer, Guam. Automated a legacy Excel workflow from approximately two hours to approximately two minutes. Exact dates required.

Remove or verify any additional role that is not in `data/profiles/adam-pangelinan/profile.md`.

## Final manual QA

After Adam edits and saves:

1. Open the company-facing preview.
2. Confirm the location is current.
3. Confirm the top line shows at least 2 years of experience.
4. Confirm no work entry says `Invalid date`.
5. Confirm the profile says open to US relocation, not remote-only.
6. Confirm Helium Harness, skill.supply, and summon.company are represented accurately.
7. Confirm no unverified daily-use, revenue, customer-count, or authorship claim remains.
8. Reopen the Sira role and confirm the platform mismatch warning is gone or document the remaining reason.

Adam must make and save every external profile change himself.
