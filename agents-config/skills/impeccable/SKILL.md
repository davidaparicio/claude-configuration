---
name: impeccable
description: Route production frontend design work. Use when designing, redesigning, critiquing, auditing, polishing, clarifying, hardening, or improving websites, landing pages, dashboards, app UI, or design systems.
---

Ship production frontend. Refuse backend-only work. Do not stop until the target is complete, responsive, on-brand, and visually verified.

Run once per session: `node .agents/skills/impeccable/scripts/context.mjs`. Skip if its output is already in this conversation. On `NO_PRODUCT_MD`, stop and follow [init.md](reference/init.md). On `UPDATE_AVAILABLE`, ask once about updating, then continue.

If the first word is a command, read `reference/<command>.md` next. `teach` means `init`. Then read at least one existing CSS, token, theme, or component file.

Load [brand.md](reference/brand.md) when design is the product (marketing, landing, campaign, portfolio). Load [product.md](reference/product.md) when design serves the product (app, admin, dashboard, tool). Pick by task cue, then the surface in focus, then `register` in PRODUCT.md.

If that file read found no committed brand colors, run `node .agents/skills/impeccable/scripts/palette.mjs` and compose OKLCH around the seed. Skip when existing tokens already own the palette. In shadcn projects, use theme tokens; never generic `blue-*` / `sky-*` / `cyan-*` / `indigo-*` accents.

Refuse: side-stripe borders, gradient text, decorative glass, hero-metric templates, identical icon-card grids, uppercase eyebrows on every section, numbered 01/02/03 scaffolding unless the section is a real sequence, overflowed headings, 1px border plus ≥16px blur shadow, card radius ≥24px, sketchy SVG, stripe backgrounds, "X theater" copy, em dashes, marketing buzzwords. Body contrast ≥4.5:1. Hero `clamp()` max ≤6rem. Display tracking ≥ -0.04em.

No argument: if init is already running, finish it. Else run `node .agents/skills/impeccable/scripts/context-signals.mjs`, recommend 2–3 commands, list the rest, and wait. Never auto-run. Prefer `document` when code exists without DESIGN.md; `critique <surface>` when never critiqued; `polish` when the latest critique has a low score or open p0/p1; scope `audit` / `polish` to dirty files on one surface; lead with `live` only if `devServer.running`. If `scan.targets` is set, run `node .agents/skills/impeccable/scripts/detect.mjs --json <targets>` and fold hits into the picks.

Commands: `craft` `shape` `init` `document` `extract` `critique` `audit` `polish` `bolder` `quieter` `distill` `harden` `onboard` `animate` `colorize` `typeset` `layout` `delight` `overdrive` `clarify` `adapt` `optimize` `live`. First word matching or clearly mapping to one: load its reference and treat the rest as the target. If two fit, ask once.

`craft` still runs setup first; [craft.md](reference/craft.md) owns the rest. If setup blocks on init, finish init, refresh context, then resume.

Pin or unpin a command: `node .agents/skills/impeccable/scripts/pin.mjs <pin|unpin> <command>`. Report the script result.
