# skill.supply design system

Shapeable contract 0.1.0. Status: adopted. This file is generated from `.shapeable/design-system.json`. Edit the JSON source, then render again.

## Read this first

- Read NORTH_STAR.md, brand.md, and .shapeable/design-system.json before changing product-facing design.
- Treat this site's identity and product boundaries as constraints, not optional inspiration.
- Inspect the current implementation and audit evidence before proposing a visual change.

## Intent and north star

Make a capable person's market value legible through an honest, proof-first career instrument that feels sharp, warm, direct, and unlike an HR portal.

Paste a messy background in and receive a sharp resume, a defensible one-liner, and five named companies worth pitching, with the human retaining control of every external action.

## Identity

Signature: A restrained transfer-market editorial with the precision of a career agent's working desk: monochrome, candid, proof-heavy, and punctuated by one indigo signal color.

Traits: sharp, warm, direct, editorial, confident, anti-HR.

Preserve:

- The candidates-never-pay promise.
- The sharp and warm anti-HR voice.
- Monochrome chrome with restrained indigo data accents.
- The Geist Sans and Geist Mono contrast.
- Evidence-first transfer-market framing.
- Human control over applications and external communication.

Never become:

- Shapeable's colorful editorial audit identity.
- A generic card-heavy SaaS dashboard.
- A loud gradient recruiting marketplace.
- A corporate HR portal.
- A Mobbin visual clone.

## Color

Hierarchy comes from typography, spacing, and proof. Chrome stays monochrome. Indigo is a scarce signal for the mark, selected data, focus, and decisive state. Sentiment colors describe real outcomes, not compatibility scores.

| Token | Role | Light | Dark | Usage |
| --- | --- | --- | --- | --- |
| `background` | page canvas | oklch(1 0 0) | oklch(0.145 0 0) | The page and full-width reading surfaces. |
| `foreground` | primary text | oklch(0.145 0 0) | oklch(0.985 0 0) | Body copy, headings, and primary interface labels. |
| `surface` | contained surface | oklch(1 0 0) | oklch(0.205 0 0) | Forms, reports, and overlays only when containment clarifies function. |
| `muted` | quiet surface and secondary text | oklch(0.97 0 0) | oklch(0.269 0 0) | Secondary surfaces and supporting metadata, paired with the matching muted foreground token. |
| `border` | structural separator | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | Hairline structure where spacing alone cannot communicate grouping. |
| `brand` | indigo decision signal | oklch(0.511 0.230 277) | oklch(0.68 0.16 277) | Wordmark dot, selected data, pull-quote rules, focus, and active states. Never a large surface or default button fill. |
| `destructive` | negative outcome or destructive action | #A23B2E | #E8877A | True errors and destructive actions, never ordinary low fit. |
| `positive` | verified positive outcome | #1F7A4D | #6FC796 | Completed or verified positive outcomes, not decorative reassurance. |
| `warning` | caution requiring attention | #96702A | #E0B85E | Material cautions and incomplete evidence. |

## Typography

Geist Sans carries reading and direct action. Geist Mono marks navigation, market evidence, sequence, scores, timestamps, and the wordmark. Hierarchy is typographic, not ornamental.

| Role | Family | Fallback | Usage |
| --- | --- | --- | --- |
| interface and editorial reading | Geist Sans | Arial, Helvetica, sans-serif | Body copy, headings, form controls, and buttons. |
| market evidence and machine precision | Geist Mono | Consolas, ui-monospace, monospace | Navigation, eyebrows, scores, timestamps, sequences, and the wordmark. |

| Token | Size | Line height | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- | --- |
| `display` | clamp(2.5rem, 7vw, 5.5rem) | 0.95 | 650 | -0.045em | One decisive homepage proposition. |
| `heading` | clamp(1.75rem, 4vw, 3rem) | 1.05 | 620 | -0.035em | Major report and process sections. |
| `subheading` | 1.25rem | 1.3 | 600 | -0.02em | Named findings, targets, and step titles. |
| `body` | 1rem | 1.65 | 400 | 0 | Primary reading copy and form guidance. |
| `label` | 0.75rem | 1.4 | 560 | 0.1em | Mono eyebrows and compact evidence labels. Never below 12px for essential text. |

## Spatial and visual foundations

Spacing: 4px base, Generous editorial whitespace around compact evidence and controls. density, scale 0, 4, 8, 12, 16, 24, 32, 48, 64, 80px.

Shape: radii 0, 4, 8, 10px. Border: One-pixel neutral hairlines. Use borders only when whitespace cannot explain the boundary. Elevation: Nearly flat. Use overlays with a restrained shadow, not floating card stacks. Signature: Square editorial blocks with modest rounding on inputs and controls.

Layout: A centered 768px editorial measure. Full-width bands are rare. Internal content reflows from one mobile column to bounded desktop compositions without hiding core work. Maximum content width 768px, 12 columns, 20px default gutter, breakpoints 390, 640, 768, 1024, 1440px.

Motion: Motion explains progress, change, or causality. It never decorates waiting or reading. Durations 0, 120, 180ms. Easing cubic-bezier(0.2, 0, 0, 1) Reduced motion: All non-essential animation and smooth scrolling become instantaneous under prefers-reduced-motion: reduce.

Focus: 2px solid var(--brand) Offset: 2px against the current surface Rule: Every interactive element has a visible focus-visible state with at least WCAG 2.2 AA non-text contrast.

Imagery: Show the work: resumes, target lists, fit evidence, market data, and verified outcomes. Let evidence carry the visual interest.

Allowed:

- Redacted real proof artifacts.
- Directly labelled market data visualizations.
- Candidate-owned screenshots used with permission.
- Simple diagrams that explain the agent's work.

Forbidden:

- Stock recruiting photography.
- Decorative AI illustration.
- Abstract gradients used to imply intelligence.
- Fabricated profiles, placements, or testimonials.

## Product patterns

### candidate-input

Make it safe and obvious to provide a messy background without pretending the data is already polished.

Rules:

- State what can be pasted and what remains private.
- Keep the primary input and primary action in one visual field.
- Never place an API key or personal background into analytics.

Required states:

- empty
- ready
- submitting
- validation-error
- service-error

### agent-progress

Reveal useful progress without fake precision or distracting motion.

Rules:

- Name the current work in plain language.
- Use indigo only for the active signal.
- Allow the user to stop or recover when the process fails.

Required states:

- queued
- working
- partial-result
- complete
- failed
- cancelled

### evidence-report

Turn a career judgment into inspectable evidence and a clear next move.

Rules:

- Lead with the candidate's strongest truthful positioning.
- Separate fact, inference, uncertainty, and recommendation.
- Use direct labels instead of color-only meaning.
- Make copying and sharing explicit actions.

Required states:

- complete
- incomplete-evidence
- no-qualified-targets
- shared
- print

### human-control-gate

Keep the candidate visibly responsible for every application and external communication.

Rules:

- Describe what the agent prepared and what it did not send.
- Require human review before the final external action.
- Never imply that an application was submitted when it was only drafted.

Required states:

- drafted
- needs-review
- approved-by-human
- submitted-by-human

## Content and voice

A brilliant friend who understands the market: sharp, warm, candid, and useful. Never an HR department and never a motivational poster.

Rules:

- Use short declarative sentences and concrete nouns.
- Say what the evidence supports and name uncertainty.
- Prefer honest fit, gap, proof, target, and next move language.
- State that candidates never pay wherever pricing ambiguity could occur.
- State human control wherever external communication could be inferred.
- Use commas, colons, periods, and parentheses instead of em or en dashes.

Banned patterns:

- Corporate HR euphemisms.
- Passionate, perfect fit, rockstar, ninja, and world-class.
- Claims without evidence.
- Fake urgency and manipulative scarcity.
- Copy that implies autonomous sending or applying.

## Responsive rules

### mobile-first-reflow

At 390px, navigation, forms, reports, tables, and actions reflow without horizontal scrolling or clipped essential content.

Acceptance: Document width equals viewport width and the audit reports zero offscreen essential text.

### comfortable-actions

All controls are at least 24 by 24 CSS pixels. Primary mobile actions and dense standalone controls target 44 by 44 CSS pixels.

Acceptance: Automated geometry audit reports zero controls below 24px and human review confirms comfortable primary actions at 390px.

### desktop-measure

At 1440px, the main reading measure remains bounded and evidence never stretches into an unreadable line length.

Acceptance: The primary content remains at or below 768px except for explicitly labelled comparative graphics.

### same-capability

Mobile and desktop expose the same core candidate workflow and evidence. Layout may change, capability may not disappear.

Acceptance: The audit's route and interaction matrix passes at both 390x844 and 1440x900.

## Accessibility rules

### contrast

Text and controls meet WCAG 2.2 AA contrast in light and dark themes, including focus, error, warning, and positive states.

Acceptance: Automated checks pass and the final human review verifies no meaning depends on subtle gray alone.

### keyboard

Every action is reachable, named, operable, and visibly focused by keyboard in a logical order.

Acceptance: A keyboard-only pass reaches the complete candidate flow without traps or invisible focus.

### reduced-motion

Reduced-motion preference disables smooth scrolling and all non-essential transitions or animation.

Acceptance: The identical mobile and desktop audit reports zero reduced-motion violations.

### semantic-status

Progress, errors, and completion are announced semantically and never communicated by color alone.

Acceptance: Screen-reader inspection identifies labels, status changes, errors, and recovery actions.

### readable-type

Essential text is at least 12px. Body copy targets 16px with a readable measure and line height.

Acceptance: Automated type audit reports zero essential text below 12px at 390px and 1440px.

## Attributed influences

Use the principles. Never transfer proprietary assets, layouts, source code, screenshots, or trade dress.

### [Linear](https://linear.app)

Author: Linear design team

Principle: Use near-monochrome surfaces and reserve one accent for meaningful state.

Take: Let weight, spacing, and evidence carry hierarchy. Spend indigo only when it communicates a decision or active state.

Do not copy: Do not copy Linear's layout, gradients, component shapes, animation, assets, or trade dress.

### [Vitsoe](https://www.vitsoe.com)

Author: Vitsoe

Principle: Treat restraint and longevity as a product position.

Take: Prefer durable typography, clear structure, and proof over seasonal visual novelty.

Do not copy: Do not copy Vitsoe's product photography, grid, typography treatment, assets, or trade dress.

### [GOV.UK Design System](https://design-system.service.gov.uk)

Author: Government Digital Service

Principle: A pattern should carry research, usage conditions, and a retirement path.

Take: Record the evidence and acceptance conditions behind career-flow patterns instead of treating the component library as the system.

Do not copy: Do not copy GOV.UK components, crown identity, typography, content, or visual trade dress.

### [Shopify Polaris](https://polaris.shopify.com)

Author: Shopify design team

Principle: Content guidance is a first-class design-system layer.

Take: Encode candid voice rules, error formulas, human-control language, and banned recruiting cliches alongside visual tokens.

Do not copy: Do not copy Polaris components, layouts, illustrations, tokens, or Shopify trade dress.

### [Daring Fireball](https://daringfireball.net)

Author: John Gruber

Principle: A clear measure, strong voice, and minimal vocabulary can remain legible for decades.

Take: Keep the editorial spine and let direct writing do more work than decorative interface chrome.

Do not copy: Do not copy Daring Fireball's exact layout, typography, colors, marks, content, or trade dress.

## Agent decision rules

- Choose the smallest reversible change that fixes the highest-impact measured problem.
- Preserve Skill Supply's editorial transfer-market identity while improving usability.
- Use indigo as a scarce signal, never as generic chrome or a decorative surface.
- Prefer fewer elements, stronger hierarchy, plain language, and real evidence.
- Design mobile and desktop together and verify both on the identical audit matrix.
- When evidence and owner direction conflict, stop and request owner review.

Forbidden:

- Do not apply Shapeable's palette, layout, typography, or visual motifs.
- Do not genericize the product into a card-heavy SaaS dashboard.
- Do not introduce gradients, decorative AI art, recruiting stock photography, or HR cliches.
- Do not copy proprietary assets, layout, source code, screenshots, or trade dress from an influence.
- Do not invent claims, placements, profiles, proof, or testimonials.
- Do not send applications or external messages, and do not imply that the agent did.
- Do not overwrite brand.md, CLAUDE.md, or unrelated repository instructions without explicit owner-approved adoption.

Review checklist:

- The 390x844 and 1440x900 profiles both show zero horizontal overflow and zero clipped essential content.
- Essential labels are at least 12px, every control is at least 24px, and primary mobile actions are comfortable at 44px.
- Keyboard, focus, status announcements, contrast, and reduced motion pass.
- Claims have evidence and candidates-never-pay language is unambiguous.
- The candidate retains explicit control of every external action.
- The result still looks and sounds unmistakably like Skill Supply, not Shapeable or another influence.
- Build, bounded lint comparison, protected preview, identical rescan, rollback, and human visual review are recorded.

## Governance

Owner: Adam Pang

Source of truth: .shapeable/design-system.json after adoption; this central artifact remains the generated draft and audit record.

Versioning: Semantic versioning. Patch clarifies without changing identity, minor adds compatible tokens or patterns, major changes the visual or product language.

Adoption: Owner approval is required before Shapeable writes the pack into skill.supply or adds the managed Claude import. Adoption must preserve unrelated repository instructions and include rollback.

Deviations: Record intentional deviations beside the affected pattern with rationale, evidence, owner, and a review date. Do not silently fork tokens.

Review cadence: Review after each accepted Shapeable cure, after a material product-positioning change, and at least every six months.

## Runnable evidence

- Run: `npm run build`
  Scope: Run from C:/Users/adamp/Aether/skill.supply.
  Expected: The Skill Supply production build completes without a new error.
- Run: `npm run audit:site -- --url https://skill.supply --output artifacts/audits/skill-supply-rescan`
  Scope: Run from C:/Users/adamp/Aether/shapeable.art against the protected preview first, then production only after owner promotion approval.
  Expected: The configured mobile and desktop matrix reaches 100/100 with 100% coverage, sufficient confidence, and no material regression.
- Run: `npm test`
  Scope: Run from C:/Users/adamp/Aether/shapeable.art before exporting or adopting the pack.
  Expected: Shapeable contract, renderer, factory, and audit tests pass.
