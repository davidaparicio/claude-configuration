---
name: verify
description: Prove that a feature, fix, application, workflow, API, or CLI actually works through current runtime evidence. Use when the user asks to verify, prove, demonstrate, confirm, test end to end, browser-test, capture screenshots, validate a fix in the real app, or refuses an unproven completion claim.
---

# Verify

## Objective

Your objective is now to prove that it works.

Do not answer the weaker question “Does it probably work?” Prove the requested behavior through the real user surface and produce enough current evidence for another person to independently follow the flow and reach the same conclusion.

Verification is a completion gate, not a final commentary step.

## Non-Negotiable Rules

- Do not claim success from code inspection, typecheck, lint, tests, mocks, or confidence alone.
- Exercise the real feature in the intended runtime through the same surface a user uses.
- Capture a screenshot for every observable visual step of the flow, not only the final screen.
- Give every non-visual step durable raw evidence: command, exit code, response, log, trace, file, or state read-back. Capture the terminal too when the harness supports it.
- Deliver the evidence where it is easiest to see: **more than 4 captures → one generated HTML report, opened for the user; 4 or fewer → send the captures directly in chat** through the harness's file surface. Never paste a large gallery into chat, and never build an HTML page for a 2-screenshot run.
- Map every acceptance criterion to one or more evidence-backed flow steps.
- Inspect relevant console errors, page errors, failed requests, crashes, and logs.
- Treat missing, stale, ambiguous, or contradictory evidence as `NOT PROVEN`.
- Never offer to skip verification, accept the current state, or finish without re-verifying.
- Invalidate and replace affected evidence after every code, configuration, data, or environment change.
- Continue diagnosing, fixing, and re-verifying until the proof gate is PASS.

If the user explicitly restricts the task to read-only verification, respect that boundary: do not fix failures. Keep the verdict `NOT PROVEN`, exhaust safe read-only evidence paths, and report the exact blocker instead of pretending the feature works.

## Define the Claim

Extract the claim to prove from the user request and current task context. Write measurable acceptance criteria before interacting with the app.

Identify:

- the target feature or fix;
- the intended environment and real user surface;
- the starting state and required account, role, fixture, or data;
- the happy path;
- relevant validation, error, permission, persistence, refresh, relaunch, and regression behavior;
- the observable result that would prove each criterion.

When the request refers to work just completed, use the original request and actual diff as context. Do not silently narrow the claim to the easiest part to demonstrate.

## Load Project Rules

Before launching or touching the runtime, read verification instructions in this order:

1. `.agents/rules/` files about verification, QA, browser, simulator, testing, or E2E
2. `AGENTS.md`
3. `CLAUDE.md`
4. `README.md`, package scripts, test configuration, and launch configuration

Follow the project-approved browser, simulator, auth, seed, and launch workflow. Check whether the app is already reachable before starting, restarting, or stopping a service.

## Build a Proof Matrix

Create the matrix before executing the flow:

| ID | Acceptance criterion | Starting state | Real action | Expected observable result | Required evidence | Status |
|---|---|---|---|---|---|---|
| F01 | AC1 | ... | ... | ... | Screenshot | NOT PROVEN |

Include a separate row for:

- reaching the correct initial surface;
- each user action, route transition, submitted request, or meaningful state change;
- each intermediate state needed to understand that the flow is progressing correctly;
- the final successful result;
- every relevant negative, permission, persistence, refresh, relaunch, or regression path implied by the claim.

Do not merge multiple observable steps to reduce the number of captures. Every visual row requires its own screenshot.

## Exercise the Real Flow

For every matrix row, in order:

1. Establish the documented starting state.
2. Perform the real action through the real surface.
3. Wait for the expected result; a click, request submission, or navigation attempt is not proof of its outcome.
4. Inspect the resulting UI or output plus relevant errors, network failures, crashes, and logs.
5. Capture the evidence immediately.
6. Record the environment, route or command, action, observed result, timestamp, and absolute artifact path.
7. Mark PASS only when the evidence visibly or mechanically demonstrates the expected result.

Use ordered artifact names such as:

```text
F01-initial-state.png
F02-action-result.png
F03-final-success.png
```

Keep every artifact for one verification run in a single directory, and append each executed row to `report.json` in that same directory as you go — not at the end from memory. The manifest is the record of the run; the HTML report is built from it.

While executing, also log surprises the moment they happen — unexpected behavior, odd timings, failed fix attempts, anything a future reader would ask about. Park them in the manifest `notes`; they are the raw material for the analysis, and recollection at the end loses them.

### Visual apps

- Capture the initial screen and every observable step after each action.
- Keep the relevant state visible; avoid crops that remove the context needed to understand the proof.
- Record the exact URL, app route, device, simulator, or build.
- Reference every screenshot from the report manifest so it lands in the HTML report.
- Check responsive or native variants only when they are part of the claim, affected scope, or acceptance criteria.

### CLI tools

- Run the exact command a user would run.
- Preserve stdout, stderr, and exit code.
- Verify the resulting filesystem or remote state when the command claims a side effect.
- Capture the terminal at each meaningful step when possible.

### APIs and background behavior

- Preserve the exact request and response.
- Verify authentication, status, body, and the resulting durable state.
- Read back the state from the authoritative surface rather than trusting an accepted or queued response.
- Capture associated logs or terminal output and any user-visible consequence.

## Evaluate the Proof Gate

Set the proof gate to PASS only when this expression is true:

```text
every acceptance criterion is covered
AND every proof-matrix row is PASS
AND every required artifact exists and is current
AND no observed error invalidates the claim
AND the manifest carries the analysis cards and the run-it-yourself commands
AND the current evidence was delivered — HTML report rebuilt and opened when the run has
    more than 4 captures, captures sent directly in chat otherwise
```

Anything else is `NOT PROVEN`.

## Continue Until Proven

While the proof gate is not PASS:

1. Identify the exact failing behavior or missing evidence.
2. Find the root cause with the shortest real feedback loop.
3. Apply the smallest in-scope fix, unless the task is explicitly read-only.
4. Run relevant static checks and automated tests.
5. Reset or relaunch into a clean verification state.
6. Re-run every affected flow step.
7. Replace every invalidated artifact, then re-deliver the evidence: rebuild and reopen the HTML report (more than 4 captures) or resend the captures in chat (4 or fewer).
8. Re-evaluate the complete matrix, not only the previously failing row.

There is no retry limit. Difficulty, elapsed time, or repeated failed attempts are not completion conditions.

If progress depends on genuinely unavailable access, credentials, hardware, external approval, or a third-party state, exhaust safe alternatives. Do not claim success and do not close the objective. Report `BLOCKED — NOT PROVEN`, include the exact blocker and attempted paths, and request the precise action needed to resume. Only an explicit user cancellation can end the objective without proof.

## Reflect Before You Report

The evidence proves the claim; the analysis makes the report worth reading. The reader was not there — give them the thinking, not just the captures. After the matrix is complete, stop and reason over the whole run, then write `analysis` entries in the manifest. Each entry is a titled card backed by step IDs:

- **Mechanism** — the causal chain from code to observed behavior: why the feature works now, and the root cause when the run included a fix.
- **Discoveries** — what the runtime revealed that reading the code never would: bugs caught while verifying, surprising timings, dead paths, misleading APIs.
- **Tried and rejected** — fixes or approaches that failed during the run and the precise reason each one failed.
- **Edge cases and residual risk** — what was deliberately probed beyond the happy path, what remains unproven, and what could still break in production.
- **Recommendations** — concrete follow-ups with enough context to act on without this session.

Rules:

- Write Mechanism, Discoveries, and Edge cases and residual risk on every run; add the other cards whenever the run produced material for them.
- Back every claim with the step IDs that prove it (`"steps": ["F04", "F10"]`) so the reader can jump straight to the evidence.
- Depth over volume: one paragraph explaining *why* beats five restating *what*. A card that merely restates the matrix means the reflection is not done — dig until it says something the matrix cannot.

## Build the HTML Report

**Threshold: build the HTML report only when the run has more than 4 captures.** A run with 4 or fewer captures skips the HTML entirely and delivers the captures directly in chat (see "Report the Proof in Chat"). The manifest `report.json` is written for every run regardless — it is the record of the run.

For larger runs the chat is not the deliverable: the run produces one self-contained HTML page holding the whole proof — flow, screenshots, raw evidence, annex — and that page is what the user reads.

The page IS the flow: a slim sticky verdict bar, the claim, then every step in order — title, one-line observed result, full-width capture (steps without a screenshot show their raw evidence text instead). Everything else — commands, analysis, environment, criteria coverage, matrix, checks, notes — is an annex of collapsed sections at the end. Clicking a capture opens an inspector that pairs it with the claim it backs, with 1:1 zoom and `←`/`→` through the flow. That is why the manifest must reference every screenshot: an artifact left out of `steps[]` is invisible.

Write the manifest, build, open:

```bash
node "$SKILL_DIR/scripts/build-report.mjs" <artifacts-dir>/report.json --open
```

`$SKILL_DIR` is this skill's own directory — the folder containing `SKILL.md`. Resolve it from the path the harness used to load this skill. If that is unavailable, locate it once:

```bash
ls -d ~/.claude/skills/verify ~/.codex/skills/verify ~/.agents/skills/verify 2>/dev/null | head -1
```

Read `reference/report-manifest.md` for the manifest shape before writing it. In short: `claim`, `verdict`, `environment`, `acceptanceCriteria`, one `steps` entry per proof-matrix row (`id`, `title`, `ac`, `action`, `expected`, `observed`, `status`, `screenshot`, `evidence[]`), `analysis`, `commands`, `runtimeChecks`, `notes`.

`commands` is required on every run: the first entry is the exact command that launches or reaches the verified surface (Portly server plus its URL, CLI invocation, or API request); the last entry reopens the evidence — `open <abs>/report.html` when the HTML was built, `open <artifacts-dir>` for small runs without one. Copy-paste runnable, no placeholders.

The generator is dependency-free Node — it runs the same from Codex, Claude Code, or a bare shell. It inlines screenshots as data URIs, so the single `.html` stays viewable when copied or shared.

Rules:

- Build the report from the manifest you wrote **during** the run, not from recollection afterwards.
- Exit code `2` means a referenced screenshot is missing. That is `NOT PROVEN` — fix and rebuild.
- Rebuild and reopen after every fix. A report generated before the last change is stale evidence.
- Never hand-write the HTML. Fix the generator instead if a run needs something it cannot express.

### Open it for the user

Open the report through the surface the current harness actually has, in this order:

1. **Claude Code** — `SendUserFile` with `display: "render"` on the `.html` path, so it opens in the side panel. Also pass `--open` for the real browser.
2. **Codex or any CLI harness** — `--open` already handed the file to the OS default browser. Confirm which command ran.
3. **No GUI available (SSH, container, CI)** — skip `--open`, print the absolute path and the `file://` URL, and say the environment is headless.

## Report the Proof in Chat

### Small runs — 4 captures or fewer: the chat IS the report

No HTML. Send every capture directly through the harness's file surface — Claude Code: one `SendUserFile` call with all screenshots and `display: "render"`; Codex or any CLI: print each absolute path. In the message, one line per step: `F01 — title: observed`. Then the summary block below, minus the report path (the second `bash` block opens the artifacts directory instead, e.g. `open <artifacts-dir>`).

### Larger runs — the chat points at the report

Keep the chat message short. It points at the report; it does not duplicate it. Never paste the screenshot gallery into chat.

Every chat report — PASS or not — ends with two runnable `bash` blocks: one that launches or reaches the verified surface (the exact command used for this run, with the URL as a comment), one that opens the HTML report. Same commands as the manifest `commands`, no placeholders.

````markdown
## Proof of Functionality — PASS

**Claim:** ...
**Report:** /abs/path/report.html (opened in the browser)

11 steps · 11 PASS · 0 FAIL — every acceptance criterion covered.

- Console/page errors: none
- Failed requests: none relevant
- Persistence/read-back: PASS

Worth knowing: <the sharpest insight from the analysis, or anything the user must act on, or "nothing">

See it yourself:

```bash
portly restart lumail.io/dev   # app → http://localhost:3002
```

```bash
open /abs/path/report.html
```
````

Include the full matrix in chat only when the user explicitly asks for it, or when the harness cannot open or render the HTML at all. A PASS without current delivered evidence is invalid — the HTML report for larger runs, the captures themselves in chat for small runs.

## Completion Condition

Stop only when one of these conditions is true:

1. `PASS`: every acceptance criterion and flow step is proven with current evidence.
2. The user explicitly cancels the verification objective.

An external blocker is not completion. Keep the objective open as `BLOCKED — NOT PROVEN` and state exactly what is needed to continue.
