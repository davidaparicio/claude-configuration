# Report manifest

`scripts/build-report.mjs` reads one JSON file and writes one self-contained HTML page.
Write the manifest as you execute the flow — one entry per proof-matrix row — then build.

Build the HTML only when the run has **more than 4 captures**; smaller runs send the captures
directly in chat instead (see SKILL.md). The manifest is written for every run either way.

## Commands

```bash
node <skill>/scripts/build-report.mjs <artifacts-dir>/report.json --open
```

| Option | Effect |
|---|---|
| `--out <file>` | Output path. Default: `report.html` next to the manifest. |
| `--open` | Open the finished report with the OS default handler (`open` / `xdg-open` / `start`). |
| `--link-images` | Reference screenshots by relative path instead of base64-inlining them. Smaller file, but it only renders next to the artifacts folder. Default is inline, so the single `.html` is portable. |

Exit code `0` = built, `2` = built but one or more referenced screenshots were missing (the
script lists them and the page shows a red placeholder). Never report PASS on exit code `2`.

Inlined screenshots cost roughly 1.4× their bytes. A ~20-step run of full-page 1440px PNGs
lands near 6 MB, which browsers open instantly. Past ~25 MB, or when an embedded viewer stalls,
rebuild with `--link-images` and keep the HTML beside its artifacts folder.

## Shape

```jsonc
{
  "title": "Proof of Functionality",          // optional, header eyebrow
  "claim": "Focus mode opens the editor fullscreen with a save bar",
  "verdict": "PASS",                          // PASS | NOT PROVEN | BLOCKED
  "artifactsDir": "/abs/path/to/screenshots", // optional; relative screenshot paths resolve from here
                                              // (default: the manifest's own directory)

  "environment": {                             // free-form key/value, rendered in order
    "Surface": "http://localhost:3002",
    "Runtime": "Next 16 dev via Portly",
    "Account": "melvynmal@gmail.com (OTP)",
    "Driver": "Playwright 1.57 chromium 1440x900"
  },

  "acceptanceCriteria": [
    { "id": "AC1", "text": "A toolbar control enters focus mode" },
    { "id": "AC2", "text": "Focus mode covers the full viewport" }
  ],

  "steps": [
    {
      "id": "F01",                             // used as the anchor; keep ordered + zero-padded
      "title": "Editor in normal mode",
      "ac": ["AC1"],                           // ids from acceptanceCriteria; drives the coverage table
      "action": "Open the campaign editor",
      "expected": "Focus button present in the toolbar",
      "observed": "Button rendered with `aria-label=\"Enter focus mode\"`",
      "status": "PASS",                        // PASS | FAIL | NOT PROVEN | BLOCKED | SKIPPED
      "screenshot": "F01-normal-mode.png",     // relative to artifactsDir, or absolute
      "route": "/orgs/acme/campaigns/cmp_1",   // or "url" / "command"
      "timestamp": "2026-08-01 14:51 UTC",
      "evidence": [                            // collapsible raw blocks — stdout, JSON, logs, DOM reads
        { "label": "DOM read-back", "text": "{ \"inFocus\": true }" },
        { "label": "pnpm ts", "text": "tsc --noEmit", "exitCode": 0 }
      ]
    }
  ],

  "analysis": [                                // the reflection — see SKILL.md "Reflect Before You Report"
    {
      "title": "Mechanism — why it works now",
      "body": "First paragraph.\n\nBlank line starts a new paragraph; inline `code`, **bold**, [links](https://example.com) work.",
      "steps": ["F04", "F10"]                  // step ids backing the claim; rendered as jump links
    },
    { "title": "Discoveries", "body": "…", "steps": ["F09"] },
    { "title": "Edge cases and residual risk", "body": "…" }
  ],

  "commands": [                                // how the reader sees it themselves; rendered "Run it yourself"
    { "label": "Launch the app", "command": "portly restart lumail.io/dev", "url": "http://localhost:3002" },
    { "label": "Open this report", "command": "open /abs/path/report.html" }
  ],

  "runtimeChecks": [
    { "label": "Console errors", "status": "ok", "detail": "none" },
    { "label": "Failed requests", "status": "warn", "detail": "third-party `/ingest/flags` only" },
    { "label": "Persistence read-back", "status": "ok", "detail": "marker survived reload" }
  ],

  "notes": [
    "Pre-existing bubble-menu mispositioning — identical in both modes, not caused by this change."
  ]
}
```

## Rules

- Every visual step gets its own `screenshot`. Do not merge steps to save captures.
- Every non-visual step gets at least one `evidence` block with the raw command, output, or state read-back.
  The block's body key is `text` (`output` and `content` are accepted aliases).
- `analysis` is required on every run: at least the Mechanism, Discoveries, and Edge-cases-and-residual-risk
  cards, each a real explanation backed by `steps` ids — never a restatement of the matrix.
- `commands` is required on every run: first entry launches or reaches the verified surface (with `url` when
  one exists), last entry reopens this report. Copy-paste runnable, no placeholders. The build prints a
  `note:` when either section is missing — treat that note as work left to do.
- Set `status` from what the evidence shows, never from intent. Any non-PASS step forces `verdict` to
  `NOT PROVEN` or `BLOCKED`.
- An acceptance criterion with no step referencing its `id` renders as `UNCOVERED` — that is a gate failure.
- Rebuild the report after any code, config, data, or environment change; stale artifacts invalidate the gate.
- `action`, `expected`, `observed`, `detail`, `text` in criteria, and `notes` support inline `` `code` ``,
  `**bold**`, and `[label](https://url)`. Everything else is escaped.

## Rendered sections

The flow IS the page; everything else is an annex. One centered max-width column (Tailwind-style
tokens, light/dark) — it never stretches wall-to-wall on a large display.

**The flow.** A slim sticky bar (verdict badge + steps/criteria tally), the claim, then every step in
order: `id` + title, the observed result in one line, and the capture at full column width. Steps
without a screenshot show their raw evidence text in the same frame — the text is the capture. PASS
steps stay quiet (a green dot on the rail); FAIL/BLOCKED steps get a loud pill and a tinted frame.
Under each capture, a collapsed `Details` row holds action, expected, where, when, and the raw
evidence blocks.

**The inspector.** Click any capture to open it full size next to the step's own claim — observed,
action, expected, raw evidence — cloned from the flow step, so there is one source of truth. `←`/`→`
walk the flow, clicking the image toggles 1:1 zoom at the clicked point, `i` hides the side panel,
`Esc` closes. The URL tracks the open step as `#v-<id>`, so a single step can be linked to directly.

**The annex.** Collapsed `details` sections after the flow: run it yourself (open by default, copyable
launch/open commands) → analysis → environment → acceptance-criteria coverage → proof matrix → runtime
checks → notes, then a one-line proof gate + timestamp. Printable, no external requests.

Captures render at full column width in one scrolling column. If a run gets past ~30 steps, consider
splitting it into separate verifications.
