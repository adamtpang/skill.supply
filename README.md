# skill.supply

**You're the supply. We make you irresistible.**

An AI career agent in a single page: paste your background (resume, LinkedIn text, or a few
honest paragraphs) and a server-side Claude agent

1. **Discovers** your ikigai–market fit — what you love × what you're great at × what
   companies actually pay for,
2. **Packages** you — a sharp ATS-friendly resume plus the one-liner: *you are the person
   who ___*,
3. **Places** you — five named targets (real companies or sharp archetypes) with honest fit
   scores and gaps, and a tailored, non-generic intro message for target #1.

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
cp .env.example .env.local   # add your key
npm run dev                  # http://localhost:3000
```

One env var:

| Variable | What |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude API key — <https://console.anthropic.com> |

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

Auth, accounts, database, payments, live job-board scraping, recruiter side. The agent names
*targets to pursue*, never claims a live opening exists — candor is the product.
