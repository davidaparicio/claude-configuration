---
name: use-artifacts
description: Create Claude-style local HTML artifacts under ~/.agents/artifacts. Use when building plans, prototypes, visualizations, dashboards, diagrams, options, or reusable standalone pages.
disable-model-invocation: true
user-invocable: true
---

Create a standalone HTML artifact only when the work is substantial, visual or reusable, and does not belong in a product repo. Skip tiny answers and in-repo product changes unless asked.

Always write to `~/.agents/artifacts/<id>/`. Never write a repo-local `.agents/artifacts`.

Pick a kind: `variations` `croquis` `thinking` `feature-plan` `security-review` `implementation-plan` `interactive` `dashboard` `visualization` `document` `diagram` `prototype` `reference`. Default to a thinking page. Any plan kind must include both a content draft and croquis. Interactive only when the user asks for a mini-app or controls. Variations: 3–6 full-width rows of low-fidelity options, no masthead, no leading ranking.

Style in this order: the user's words, then the app's real tokens (match its theme exactly), then a subject-specific identity. Sketch color, type, and layout in `HIGHLOGIC.md` before HTML. Define tokens on `:root` and both color schemes unless the identity is deliberately single-theme, recorded in `HIGHLOGIC.md`. Restyle the scaffold; never ship its placeholder look. No secrets, no Anthropic API, no CDN fonts.

Scaffold with:

```bash
python3 ~/.agents/skills/use-artifacts/scripts/create_artifact.py "<short title>" --style "<requested, project:app-name, or subject-specific>" --kind thinking
```

If the page needs download or local data, inline `~/.agents/skills/use-artifacts/assets/local-runtime.js` in a `<script>` tag (no `src`) and record `capabilities` in `manifest.json`. Web research goes through `$exa-search`.

Keep `index.html`, `HIGHLOGIC.md`, and `manifest.json` current. On a substantial rewrite, copy `index.html` to `versions/<timestamp>-index.html` first.

Verify by opening `index.html` (serve the folder only if the browser requires it). Stop when you return the local `index.html` path, the selected style, and what you verified.
