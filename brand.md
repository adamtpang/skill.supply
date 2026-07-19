# Brand: skill.supply

_Status: active_

## Positioning

skill.supply is an AI career agent. Tagline: **"You're the supply. We make you irresistible."**
It treats a person as the supply side of a market and makes their value legible: ikigai-market
fit → packaging (resume + one-liner) → placement (5 targets + opening move).

## Voice

Sharp, warm, direct. A brilliant friend who knows the market, never an HR department.
Candor is the product: honest fit scores, honest gaps. No corporate fluff, no hype words,
no "passionate", no "perfect fit". No em dashes or en dashes anywhere: commas, colons,
periods, and parentheses instead (this rule is enforced in the model prompts too).

## Color

Chrome is monochrome; color is reserved for data and marks.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--background` | white | near-black | page |
| `--foreground` | near-black `oklch(0.145 0 0)` | near-white | text |
| `--primary` | near-black | near-white | buttons (monochrome chrome) |
| `--brand` | indigo `oklch(0.511 0.230 277)` (≈ #4f46e5) | `oklch(0.68 0.16 277)` | fit scores, the wordmark dot, pull-quote rules, active states |
| `--muted-foreground` | gray | gray | secondary text |

Rule: **never** use `--brand` for large surfaces or button fills. It marks data and moments
(scores, the ikigai quote, checklist numerals), which keeps it powerful.

## Typography

- Sans: Geist (`--font-sans`) for UI and body.
- Mono: Geist Mono (`--font-geist-mono`) for eyebrows (11px, tracking 0.14em, uppercase),
  scores, timestamps, the wordmark `skill.supply`.
- Hierarchy over decoration: tight tracking on display sizes, muted second lines.

## Motifs

- The wordmark renders as `skill.supply` with the `.` in `--brand`.
- Report sections use numbered mono eyebrows: `01 · YOUR IKIGAI`.
- The one-liner ("You are the person who ___") is always a left-bordered pull-quote.
- Restraint: Linear/Rezi energy. Generous spacing, real hierarchy, one accent.
