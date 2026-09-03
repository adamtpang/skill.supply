# skill.supply

**You're the supply. We make you irresistible.**

The transfer market for human talent. It combines live market intelligence with an AI career
agent: paste your background (resume, LinkedIn text, or a few honest paragraphs) and a server-side
Claude agent

1. **Discovers** your ikigai-market fit: what you love × what you're great at × what
   companies actually pay for,
2. **Packages** you: a sharp ATS-friendly resume plus the one-liner, *you are the person
   who ___*,
3. **Places** you: five named targets (real companies or sharp archetypes) with honest fit
   scores and gaps, and a tailored, non-generic intro message for target #1.

The market side indexes live roles from public company job boards. `/skills` is the consolidated
home of **Skill Market Cap**: an hourly demand ranking based on explicit skill mentions in those
real roles. The standalone `skillmarketcap.com` domain redirects into this surface. It remains an
acquisition asset, not a separate product or a fourth pillar in the talent suite.

`/center` is the local-first Career Center and the primary candidate journey. It keeps one private
Career Case with a factual profile, one active target, the current bottleneck, the first unfinished
placement step, and one next action. It coordinates the Talent Card from `darktalent.tech`, demand,
matching, campaigns, applications, and placement in `skill.supply`, plus company-specific Gap Plans
from `company.university`. The candidate can import, export, or copy a bounded agent task. Nothing
is communicated or submitted externally by the product. See [`CAREER_CENTER.md`](CAREER_CENTER.md).

`/campaign` is the sniper layer before an application. It turns a reusable `profile.md` into exactly
five company campaigns. A target can be a live role or simply a company and team. The version 2
packet records confirmed product use, a sourced budget hypothesis, three problem hypotheses with
confidence, a people map, proof of fit, useful research, a scoped artifact, a Loom outline, separate
email and DM drafts, a formal-application path, a follow-up, and one next action. Legacy version 1
packets import automatically. Drafts stay in local browser storage or a downloaded JSON packet.

`/apply` is the Browser Harness application-agent handoff after a campaign earns the formal form.
It builds a client-only packet from one job, candidate facts, an evidence-backed profile, and the
exact local resume path. A project agent then uses the candidate's real Helium session to fill
deterministic fields and pauses for missing or sensitive answers. It must never send a message or
click Submit. The candidate performs every external action manually. See
[`APPLICATION_AGENT.md`](APPLICATION_AGENT.md).

No auth. No database. No payments. The finished report is compressed into the URL hash, so a
share link (`/s#…`) reproduces it with zero backend.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Claude API: `claude-haiku-4-5` for extraction, `claude-sonnet-5` for the ikigai/matching
  reasoning and the packaging, forced to JSON via structured outputs (`messages.parse` + zod)
- Streaming: the agent route emits NDJSON stage events so the UI shows real progress
  (*Reading you → Finding your ikigai → Matching → Packaging → Drafting*)
- Deployed on Vercel (`app/api/agent` runs with `maxDuration = 300`)

## Setup

```bash
npm install
cp .env.example .env.local   # add your key…
npm run dev                  # http://localhost:3000
```

One env var:

| Variable | What |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API key: <https://console.anthropic.com> |

…or **zero env vars**: the free report runs on bring-your-own-key. The seeker pastes their
own Anthropic API key on the page. The server uses it for that request, never logs it, and
never persists it server-side. The client can remember it in that browser's `localStorage`
until the seeker chooses “Forget key.” skill.supply never carries the AI bill.

There is deliberately **no paid-provider fallback**. A Vercel AI Gateway path (OIDC token
against `ai-gateway.vercel.sh`, billed per token to the team's card) was removed 2026-08-23.
When no key is available the agent fails loudly instead of quietly spending money. Do not add
that path, or any equivalent, back.

## How it works

```
paste ──▶ POST /api/agent (NDJSON stream)
            ├─ extract   claude-haiku-4-5   → structured facts, honesty gate (asks for more if thin)
            ├─ ikigai+match  claude-sonnet-5 → read + 5 scored targets
            └─ package   claude-sonnet-5 ×2 in parallel → ATS resume + intro for target #1
        ◀── stage events … final SupplyReport JSON
report ──▶ "Copy share link" → /s#<lz-string payload>  (whole report lives in the URL)
```

Key files: [`lib/agent.ts`](lib/agent.ts) (the chain), [`lib/prompts.ts`](lib/prompts.ts)
(the brains), [`lib/schema.ts`](lib/schema.ts) (zod schemas → structured outputs),
[`app/api/agent/route.ts`](app/api/agent/route.ts) (streaming route),
[`lib/share.ts`](lib/share.ts) (URL-hash encoding).

## Non-goals (v1)

Auth, accounts, database, payments, recruiter workflow, unsupported salary claims, invented market
trends, bulk auto-applying, agent-sent outreach, and agent-performed submission. Public Greenhouse, Ashby, and Lever
inventory is labeled live. Agent-generated targets remain targets to pursue unless they are linked
to a public opening. Candor is the product.
