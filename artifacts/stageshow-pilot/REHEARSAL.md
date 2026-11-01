# Rehearsal: skill.supply hero scene (Stageshow pilot)

Gold: `static-card` (kept: hero window plus one satellite straddling its lower-left edge over filler rows, three real rows, one gutter of 24px, a hard crop). Changed: corner bleed for a hero beside copy instead of a pinned card, the product is the real report's "Where you're wanted" list, site tokens and fonts (Public Sans, JetBrains Mono, Schibsted Grotesk, indigo #4f46e5, green #0f8a5f).

Medium: still (no script), so the poster frame is the only frame, also under reduced motion.

Word budget: "skill.supply" (address), "Where you're wanted", "Fintech infra, Series A" 86/100, "Payments API startup" 81/100, "Vertical SaaS, ops-heavy" 77/100, "5.9%" with "of US job postings mention AI". Everything else is placeholder. Targets and scores are the illustrative examples the previous card already used; the caption labels them illustrative and sources the 5.9% to Indeed Hiring Lab (June 2026).

Captured: page widths 1440 (wide design 500x400 at 1:1) and 390 (compact design 350x320, satellite dropped), reduced motion at 1440 and 390, light theme only (the site has no dark toggle).

Film (first pass, `film-pass1-*`):
- both widths: 6 x `kit override` on `.ss-row*`. False positive: Next bundles the vendored kit CSS into the host's chunks, so film's `/kit/` href test no longer recognizes it. The flagged selectors are the kit's own `Row.css` rules; the scene's CSS has no `.ss-row` selector. Cleared by filming with a copy of film.mjs whose only change skips rules inside `@layer stageshow` (every kit rule lives there).
- 390: `clipped` on two titles (ellipsis) and `framing: window shows 256x356, narrower than tall`. Fixed by redesigning compact (satellite dropped, window at one gutter, wider column).
- Second iteration, 390: `uneven gutters` and three `framing` lines on the satellite moved over the title bar. Fixed by dropping the satellite in compact; the caption carries the figure.
- Third iteration: a JS-off check at 390 found the page 520px wide before hydration (the stage draws at design size until it measures). Fixed by clipping the stage's wrapper; that clip then drew `double corner` (18px, then 0px, around the stage's 16px), fixed by giving the wrapper the same 16px corner.

Final (`film-final-*`, patched film; the patch is `film-checks-layer-patch.diff`): `rehearsal passed` at 1440 and 390, and with `--reduced`. The unpatched film still prints the 6 `kit override` false positives at both widths. 390 also prints `layout: div.ss-row leaves -17px below its last child`: the fourth (filler) card is cut by the stage's bottom edge on purpose (a list running off a bled bottom edge); it is not a gate line.

Review (fresh-eye subagent, frames only): 1 empty top-left corner (kept: same window inset as the gold, room for the straddling satellite); 2 list stopped above the crop (fixed: five cards, the fifth cut 24px); 3 heaviest mark is an off-story stat (kept on purpose: the 5.9% is the only real, sourced figure and the hero copy promises "what the market wants"; reduced to 26px, no longer tabular); 4 bar-only row mid-frame (fixed: three real rows, filler only under the satellite and the crop); 5 bar sublines under real titles (fixed: removed); 6 "5 . 9%" spacing (fixed: tabular figures off).

Not checked: dark theme, widths between 440 and 1024, the look of the pre-hydration paint (the kit scales in JS, so before hydration the wide design draws at 1:1, now clipped to the column; only the overflow was checked, not the visual), a second fresh-eye pass after the fixes.
