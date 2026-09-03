# OpenAI Plugin Developer Platform role assessment

Checked 2026-08-29 against OpenAI's official role page, its current Ashby job
and form APIs, current plugin and app product materials, current public work by
people in the ecosystem, Adam's canonical profile, and `portal.voyage`.

## Verdict

Campaign for [Software Engineer, Plugin Developer Platform](https://jobs.ashbyhq.com/openai/71838fdf-4476-490c-81b6-4bf0746f6774).

This is now Adam's best OpenAI role. It is more direct than Full Stack Software
Engineer, Codex because the role explicitly accepts open-source projects,
developer tools, APIs, SDKs, platforms, and internal tools as relevant proof.
It spans plugins, connectors, MCP, interactive apps, web interfaces, backend
systems, developer conversations, publishing, and safe execution. It states no
degree or experience floor.

Do not apply to several adjacent OpenAI roles at once. Use this as the primary
OpenAI application and keep the prepared Codex application as a recruiter
redirect or later independent backup.

This target does not beat Browserbase yet. Its candidate match is excellent,
but the exact manager, coaching evidence, normal hours, launch cadence, and
recovery remain unknown. People is 83, which keeps the target below the
campaign's S-tier threshold of 85.

## S-tier gate

| Axis | Score | Evidence | Binding gap |
| --- | ---: | --- | --- |
| Problem | 99 | OpenAI says this team owns APIs, SDKs, interfaces, and backend systems that let developers extend ChatGPT and Codex through plugins, connectors, MCP, and interactive apps. OpenAI reports more than 5 million weekly Codex users and is building toward an open plugin ecosystem across Codex and ChatGPT. | Adam must confirm that plugin and developer-platform work is a problem he wants to own for years, not merely a tool category he currently encounters. |
| Hiring budget | 99 | The exact role is listed in OpenAI's official feed, was published 2026-08-18, and offers $185,000 to $490,000 plus equity and relocation assistance. The application is accepting candidates. | Exact level, cash placement, equity value, relocation package, interview speed, and offer timing are unknown. |
| People | 83 | Public work shows a strong current peer group. Corey Ching works on Codex developer experience and publicly demonstrates plugin sharing and the open ecosystem. Yiren Lu publicly identifies with OpenAI's ecosystem work and contributed current Apps SDK and MCP material. Recent `openai/plugins` pull requests show Will Wang shipping marketplace integrations with review from `alexsong-oai`, `xl-openai`, and automated Codex review. The repository has active public review, documentation, and compatibility work. | None of these people is proven to be Adam's direct manager. No current direct-report coaching example is verified. Yiren describes the Apps SDK launch period as both fun and intense and says partners sprinted hard. Normal hours, recurring launch pressure, on-call, weekend work, and recovery are unknown. Company-wide employee reports remain mixed and are only supporting risk signals. |
| Location | 91 | The role is hybrid in San Francisco for three office days per week and includes relocation assistance. Adam is a US citizen, needs no sponsorship, and is open to US relocation. San Francisco is a top AI and company-building market in `portal.voyage`, and the published compensation can support meaningful savings above its floor. | Adam must confirm three office days, choose a realistic relocation date, and verify that the eventual level and offer support the move. |

`targetQuality = min(99, 99, 83, 91) = 83`

Status: `investigate`. Candidate match: 95. Access strength: 93.

## Why Adam can win

- EVID-008 is the clearest public developer-tool proof. Adam adapted
  `browser-use/browser-harness` into a Helium-specific Python and CDP tool with
  Windows discovery, launch behavior, documentation, packaging, and a current
  full local result of 141 passed with 2 Windows symlink skips.
- EVID-001 proves an end-to-end TypeScript, React, and Next.js agent product
  with live ATS data, structured model output, validation, streamed state, and
  explicit human-review boundaries.
- EVID-002 proves substantial work in an existing open-source agent codebase,
  including 155 personal commits, a register-truth reconciler, a 12-scenario
  known-ground-truth evaluation, documentation workflow, Playwright, and
  Vitest.
- EVID-006 adds founder-led developer and customer conversations, selling, and
  software delivery.
- Adam is currently working inside a plugin, skill, MCP, and connector
  environment. That is relevant product exposure, but frequency and one real
  friction must come from Adam before being claimed externally.

## Honest match gaps

- Adam has approximately 28 to 29 supportable non-overlapping months of paid
  engineering work. The role states no floor, but the compensation and scope
  imply a very high bar.
- Helium Harness is public and tested, but only two commits are Adam's original
  work beyond the upstream version. No external adoption or user count is
  approved.
- No public proof currently shows an Adam-authored production SDK or API used
  at scale.
- `books-as-plugins` is a private, Claude-specific local project with no remote
  or external users. Its architecture may support an interview answer after
  Adam reviews it, but it should not lead the application and its copyrighted
  study corpus must not be published.
- Adam has not published a ChatGPT or Codex plugin and has no approved Apps SDK
  submission, plugin adoption, or marketplace metric.
- No approved evidence proves large-scale backend or distributed-systems
  ownership.
- The exact manager, coaching pattern, normal workweek, launch burden, and
  recovery are unknown.

## Exact-team public evidence

The public work is unusually inspectable for a private company:

- `openai/plugins` contains OpenAI's current curated Codex plugin examples and
  exposes plugin manifests, skills, apps, MCP configuration, agents, commands,
  hooks, and assets.
- Will Wang's 2026-08-26 pull request added remote marketplace integrations,
  changed scope through eleven commits, received automated Codex review and two
  human approvals, and merged the same day.
- A second pull request reconciled curated plugins, app-backed integrations,
  local MCP support, tests, and marketplace definitions through a reviewed,
  iterative change set.
- Corey Ching publicly demonstrates current plugin sharing, custom workplace
  distribution, curated-directory links, and the intended open ecosystem.
- Yiren Lu publicly discusses the Apps SDK, authenticated MCP servers, developer
  distribution, and the intensity of the original launch period.

This proves high-quality peers, active review, product breadth, and real
developer-facing work. It does not prove the reporting line or a sustainable
operating cadence, so it cannot clear the people gate by itself.

## Current application contract

A read-only query to Ashby's public `ApiJobPosting` operation confirmed the
role is listed. No value was entered and no form state was changed.

Required fields and acknowledgements:

1. legal name
2. email
3. resume
4. phone number
5. current location
6. exact available start date
7. authorization to work in the United States
8. future sponsorship requirement
9. ability to work from a US office three days per week
10. applicant arbitration acknowledgement
11. certification that the applicant personally completed the application and
    that the answers are true

Preferred name and `Additional Information` are optional. Gender, race, veteran
status, and disability questions are voluntary. There is no required essay.

The personal-completion certification controls the workflow. Codex may prepare
the resume, truthful answer sheet, and optional statement. Adam must personally
enter, review, acknowledge, and submit every field.

## Win mechanism

Lead with one platform thesis:

> I build developer tools and full-stack agent products that make automation inspectable in the environment where it actually runs, then turn the failure boundaries into tests, documentation, and human-control contracts.

Use this evidence order:

1. Helium Harness for a public developer tool, environment discovery, CDP,
   packaging, documentation, and tests
2. skill.supply for full-stack product ownership, structured agent workflows,
   live data, and human review
3. summon.company for open-source work, existing-codebase depth, truth
   reconciliation, and known-ground-truth evaluation

Do not build a speculative plugin just to apply. A thin demo with no users would
be weaker than the existing tested public tool. If OpenAI asks for a work sample,
the best bounded follow-up is a small contribution that fixes an observed issue
in an OpenAI-owned public plugin surface, with tests and documentation.

## Manual public route

Corey Ching is a current public face for the exact Codex plugin surface, but no
source found says he is the hiring manager or invites application messages.
Adam may manually send one respectful, proof-led note after applying. Do not ask
for a referral.

Copy-ready draft:

> Hi Corey, I applied for Software Engineer, Plugin Developer Platform. I adapted browser-use/browser-harness into a public Helium-specific CDP tool with Windows discovery, packaging, documentation, and a current 141-test pass result: https://github.com/adamtpang/helium-harness. What recurring plugin-builder failure is the team most urgently hiring this role to solve?

Adam must review and send this himself. Nothing has been messaged.

## People and workload questions

Ask during the first human conversation:

1. Who directly manages this role?
2. What has that person done recently to help an engineer grow or broaden
   platform ownership?
3. Which current collaborators would review the new hire's APIs and SDKs?
4. What are normal weekly hours outside launches?
5. How often do launches, partner deadlines, or incidents require nights or
   weekends?
6. How does the team recover after a high-intensity launch?
7. What evidence distinguishes excellent developer-platform judgment from a
   polished but low-adoption tool?

Do not certify S-tier if the manager remains undefined, recurring uncontrolled
nights or weekends are normal, recovery is weak, or the role is leveled beyond
Adam's credible path.

## Adam gates

1. Confirm that three San Francisco office days per week are acceptable.
2. Give a realistic San Francisco relocation date or date range.
3. Give an exact available start date.
4. Describe actual current Codex and plugin usage: frequency, surfaces, one
   workflow, and one observed friction. Say only what is true.
5. Review the arbitration agreement and personal-completion certification.

## Sources

- [Official Plugin Developer Platform role](https://openai.com/careers/software-engineer-plugin-developer-platform-san-francisco/)
- [Official Ashby role](https://jobs.ashbyhq.com/openai/71838fdf-4476-490c-81b6-4bf0746f6774)
- [Codex for every role, tool, and workflow](https://openai.com/index/codex-for-every-role-tool-workflow/)
- [Developers can submit apps to ChatGPT](https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/)
- [OpenAI plugin examples](https://github.com/openai/plugins)
- [OpenAI role-specific plugin templates](https://github.com/openai/role-specific-plugins)
- [Remote marketplace integration pull request](https://github.com/openai/plugins/pull/387)
- [Curated plugin reconciliation pull request](https://github.com/openai/plugins/pull/388)
- [Corey Ching on Codex plugin sharing](https://www.linkedin.com/posts/coreyching_codex-thursday-ships-you-can-now-share-activity-7463303880421031939-2TfY)
- [Yiren Lu on the Apps SDK and MCP](https://www.linkedin.com/in/yiren-lu-6300681a)
- `data/profiles/adam-pangelinan/profile.md`
- `C:\Users\adamp\Aether\portal.voyage\data\cities.json`
