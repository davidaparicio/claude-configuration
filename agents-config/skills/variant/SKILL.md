---
name: variant
description: Build several genuinely different versions of one UI piece behind a picker on the real page. Use when the user asks which version, wants variants, alternatives, or to flip between design directions.
disable-model-invocation: true
---

Build three versions of one piece of UI that differ on purpose. Host them on the real page behind a picker and stop so the user chooses.

Scope one piece. Restate what it is, where it renders, and what it must do. If the brief spans several, name the one the others hang off and offer the rest as later runs.

Read the styling system, tokens, density, voice, and the page the piece lives on. With no project, use neutral grays, one accent, and the system font stack.

Pick one primary axis and put each variant on a different position. Secondary choices follow from it:
- Structure or Density → `better-layout`
- Emphasis → `better-colors`
- Type → `better-typography`
- Voice → `better-writing`

Name each variant by its direction (`Quiet`, `Editorial`, `Dense`). Go to five only when asked or the space is genuinely wide.

Before a variant enters the picker it must clear this floor: accessible name, keyboard parity, visible focus, no clip at 320px, no meaning on color alone. Drop a direction that can only work by breaking it.

Host on the page that will contain the piece, with real chrome, neighbours, and product-shaped content. Select with `?variant=<name>`. Open `picker.md` for the picker spec. Render one variant at a time, full size. If no page can host it, one self-contained HTML file with the same picker.

Flip through every variant first. Return a tradeoffs table (axis position, right when, costs). Say where the picker is running, which key flips it, and which width you judged at. Never mark a favourite. If asked directly, answer from usage frequency and product personality. On a choice, ship that variant in place, then delete the others and the harness. Asked for another round, keep the harness and pick new positions. Until promotion, the harness never imports from production and production never imports from the harness.

Do not review existing UI; that is `better` or `interface-review`.
