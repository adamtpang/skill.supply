# skill.supply application agent

The application agent is the execution layer after discovery, fit, and readiness. It uses
[Browser Harness](https://github.com/browser-use/browser-harness) to operate the candidate's real
Helium session while skill.supply supplies the evidence and guardrails. Helium is Chromium-based,
and Browser Harness supports any Chromium browser through a DevTools connection.

## Boundary

The agent may open one employer application, fill facts supplied by the candidate, upload the exact
resume selected by the candidate, and prepare the final review. It may not fabricate, answer legal or
sensitive questions by inference, bypass browser controls, run a bulk application queue, or submit
without approval for that exact application.

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

1. Choose a live role from `/companies`, or open `/apply` and paste a job URL.
2. Add candidate facts, the evidence-backed resume or supply report, and the exact local resume path.
3. Copy the agent task or download the JSON packet.
4. Paste the task into Codex or Claude Code opened in this repository.
5. The application agent uses Browser Harness to fill all deterministic fields.
6. The agent stops for missing or sensitive answers and again before final submission.
7. After explicit approval, it submits once and verifies visible confirmation.

The web page is client-only. Candidate contact details and private answers are not posted to a
skill.supply API and are not stored by the service.
