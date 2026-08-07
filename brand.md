# Brand: skill.supply

Structure inherited from Aether/brand.md; this project's accent is indigo `#4f46e5`
(`oklch(0.511 0.230 277)`), chosen because the product's whole pitch is trust and
seriousness applied to a person's career data: indigo reads as considered and
professional without the coldness of pure blue or the alarm of red, and it stays out
of the way of the monochrome chrome so it only means something when it appears.

_Status: active_

## Positioning

skill.supply is an AI career agent. Tagline: **"You're the supply. We make you irresistible."**
It treats a person as the supply side of a market and makes their value legible: ikigai-market
fit → packaging (resume + one-liner) → placement (5 targets + opening move).

Skill Market Cap is a capability inside skill.supply, not a separate brand. It makes market demand
legible from real public roles, then hands the person back to the agent to turn demanded skills into
proof and a placement path. `skillmarketcap.com` is an acquisition domain for `/skills`.

The application agent is the execution layer. It uses Browser Harness to prepare one grounded
application in the candidate's own browser and makes human review visible as a product feature. It
never becomes an auto-apply spray tool, and the candidate owns the final Submit action.

## Voice

Sharp, warm, direct. A brilliant friend who knows the market, never an HR department.
Candor is the product: honest fit scores, honest gaps. No corporate fluff, no hype words,
no "passionate", no "perfect fit". No em dashes or en dashes anywhere: commas, colons,
periods, and parentheses instead (this rule is enforced in the model prompts too).

## Token structure: audit findings (2026-08-07)

The live token file is `app/globals.css`. Actual count of project-authored custom
properties there is 77 unique names (about 38 semantic tokens, each doubled by the
Tailwind v4 `@theme inline` aliasing layer that maps `--color-X` to `var(--X)`, plus a
7-step radius scale). The "184 custom properties" figure used to scope this audit
overcounts: it is `app/globals.css` (77) plus the properties defined inside the imported
third-party stylesheet `tw-animate-css` (178 animation-easing and duration tokens, none
of them color, none of them authored by this project). Those third-party tokens are not
part of skill.supply's design system and are out of scope for this document.

**Assessment: already semantically organized, not flat.** This is a standard shadcn +
Tailwind v4 setup. Mapped against the Aether/brand.md layering:

1. Primitives (a raw hue ramp, e.g. `--indigo-050`...`--indigo-900`): **absent.** Every
   semantic token holds a raw `oklch()` value directly. This is the one real structural
   gap versus the canonical shape.
2. Semantic surfaces: present (`--background`, `--card`, `--popover`, `--sidebar`).
3. Semantic text: present (`--foreground`, `--muted-foreground`).
4. Semantic borders: present (`--border`, `--input`, `--ring`).
5. Interactive triads: partial. `--primary` / `--secondary` / `--accent` exist as base
   tokens; hover/active states are handled by Tailwind opacity/shade utilities at the
   component layer rather than dedicated `-hover` / `-active` custom properties. Works,
   just not the same shape as the canonical triad.
6. Sentiment: partial, see below.
7. Shadows: no dedicated shadow tokens; components use Tailwind's default shadow scale.
8. Dark theme: present and correct, a `.dark` block re-pointing the semantic layer only.

Given this, the file was **documented as-is rather than restructured**, per the
Aether/brand.md hedge for shadcn setups that are already semantic. Adding a primitives
ramp under the existing semantic names would be a real structural improvement, but doing
it as a background pass on a live product risks a computed-color slip for a gap that
today costs nothing visible. Recorded here as an open backlog item, not done silently.

The one line worth reading in the file itself: `app/globals.css:54`, `--brand:
oklch(0.511 0.230 277)`, commented "skill.supply brand accent: indigo, used for data,
never for chrome." That comment is accurate. Grepped across `app/` and `components/`:
the brand token is wired into the wordmark dot, fit scores, active/focus states, and
pull-quote rules, exactly as documented, and never into a button fill or large surface.

## Sentiment: open decision, not resolved here

Aether/brand.md specifies a shared portfolio sentiment set: positive `#1F7A4D` family,
negative `#A23B2E` family, warning `#96702A` family. skill.supply's `globals.css` only
defines `--destructive` (`oklch(0.577 0.245 27.325)` light / `oklch(0.704 0.191
22.216)` dark, shadcn's stock red, roughly `#dc2626`). There is no `--positive` or
`--warning` token at all yet. This is a real mismatch against the portfolio standard:
`--destructive` does not match the `#A23B2E` negative family, and green/amber sentiment
tokens simply don't exist here yet (fit scores currently render in the indigo brand
color rather than a green/red spread).

Left as an open decision per Adam, not silently overwritten: skill.supply may want
its own sentiment read (fit scores as indigo intensity rather than green/red) since it's
scoring compatibility, not pass/fail. If skill.supply later adds true good/bad states
(e.g. "interview within 30 days" outcomes), wire those to the shared portfolio sentiment
hues at that point.

## Color

Chrome is monochrome; color is reserved for data and marks.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--background` | white | near-black | page |
| `--foreground` | near-black `oklch(0.145 0 0)` | near-white | text |
| `--primary` | near-black | near-white | buttons (monochrome chrome) |
| `--brand` | indigo `oklch(0.511 0.230 277)` (≈ #4f46e5) | `oklch(0.68 0.16 277)` | fit scores, the wordmark dot, pull-quote rules, active states |
| `--muted-foreground` | gray | gray | secondary text |
| `--destructive` | shadcn stock red `oklch(0.577 0.245 27.325)` (≈ #dc2626) | `oklch(0.704 0.191 22.216)` | form/validation errors only; does not match portfolio negative family, see above |

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

## Shared component audit (2026-08-07)

Verified against the live source, not assumed:

- **Beta bar** (`components/beta-bar.tsx`): present and wired into `app/layout.tsx`
  (renders on every page). Links to WhatsApp if `NEXT_PUBLIC_ADAM_WA` is set, otherwise
  falls back to a mailto. Fixed one em dash in the copy ("Beta, tell me what sucked"),
  no visual or functional change otherwise.

- **Placement-stories evidence slot** (`components/placement-stories.tsx`): present and
  wired into `app/page.tsx`. `PLACEMENT_STORIES` is an empty array with the comment
  "Real placements only. This section stays invisible until the first true story lands
  here." The component returns `null` when the array is empty, confirmed. No fabricated
  testimonials. Correct, matches the shared pattern exactly.

- **Founding-offer pricing section** (`components/founding-offer.tsx`): **drift found.**
  The component file exists and is well-formed, but it is not imported or rendered
  anywhere in `app/`. `app/page.tsx` carries an explicit comment explaining why: "Seekers
  never pay: LAUNCH.md wins every conflict, ruled by Adam 2026-08-01. The $69
  FoundingOffer that lived here charged seekers and is retired; the demand side
  monetizes on darktalent.tech." So this is not a bug: it's a dead component left in the
  repo after a deliberate product ruling that seekers stay free forever and companies pay
  on the demand side (darktalent.tech) instead. Flagging because the task briefing assumed
  it "still exists and renders correctly," and the accurate state is it exists but no
  longer renders, on purpose. Fixed the same em dash in its dead code for cleanliness
  ("Founding report ($69)"), but did not re-wire it into any page: that would reverse a
  named product ruling and is outside this task's scope. If `founding-offer.tsx` is
  meant to be deleted rather than kept as dead code, that's a call for Adam.
