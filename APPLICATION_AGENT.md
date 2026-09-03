# skill.supply application agent

The application agent is the execution layer after discovery, fit, and readiness. It uses
[Browser Harness](https://github.com/browser-use/browser-harness) to operate the candidate's real
Helium session while skill.supply supplies the evidence and guardrails. Helium is Chromium-based,
and Browser Harness supports any Chromium browser through a DevTools connection.

## Boundary

The agent may open one employer application, fill facts supplied by the candidate, upload the exact
resume selected by the candidate, and prepare the final review. It may not fabricate, answer legal or
sensitive questions by inference, bypass browser controls, run a bulk application queue, or click the
final Submit action. This remains true even if the candidate approves the answers or asks the agent to
submit. The candidate performs the final action manually.

`data/profiles/<profile-id>/profile.md` is the local reusable source of truth. It holds verified
facts, stable evidence IDs, interview stories, ownership boundaries, honest gaps, and approved form
answers. Update it whenever the candidate supplies or corrects a fact. The agent may use a recorded
answer only when the employer's question has the same jurisdiction and meaning. It must pause when
the form asks for a more specific date, a numerical compensation expectation, a new legal status,
or anything not recorded there.

This is deliberate. Auto-applying manufactures noise. The product is a truthful, high-signal
application that the candidate can defend in an interview.

## Setup

Browser Harness is a local Python tool and is not bundled into the Vercel deployment:

```powershell
uv tool install --python 3.12 --upgrade --force browser-harness
New-Item -ItemType Directory -Force $env:USERPROFILE\.codex\skills\browser-harness
browser-harness skill | Set-Content -Encoding utf8 $env:USERPROFILE\.codex\skills\browser-harness\SKILL.md
browser-harness recordings disable
```

Then open `chrome://inspect/#remote-debugging` inside Helium, allow remote debugging for that browser
instance, and approve the attach popup if Helium shows one. Browser Harness can also connect to a
separately launched Helium process through `BU_CDP_URL` when an isolated profile is preferable.

## Flow

1. Build exactly five qualified roles, companies, or teams in `/campaign`, or import a reviewed packet.
2. For one target, verify the official source, budget and problem hypotheses, relevant person, and useful opening move.
3. When the campaign earns a formal application, send that target to `/apply`.
4. Add candidate facts, the evidence-backed profile, and the exact local resume path.
5. Copy the agent task or download the JSON packet.
6. Paste the task into Codex or Claude Code opened in this repository.
7. The application agent uses Browser Harness to fill all deterministic fields.
8. The agent stops for missing or sensitive answers and again before final submission.
9. The candidate reviews the packet and clicks Submit manually. The agent never performs that action.

The web page is client-only. Candidate contact details and private answers are not posted to a
skill.supply API and are not stored by the service.
