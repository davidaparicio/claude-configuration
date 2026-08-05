---
name: debug-code
description: Debug errors and performance regressions with a tight red-capable feedback loop, ranked falsifiable hypotheses, focused fixes, regression tests, and real runtime verification.
argument-hint: "[error description or context] [-a for auto mode]"
---

<objective>
Debug errors through six stages: initialize, build and minimize a red-capable feedback loop, compare fixes, select one, implement it with a regression test, and verify the original runtime path.
</objective>

<quick_start>
**Debug an error (interactive):**
```bash
/debug login page crashes on submit
```

**Auto mode (fully automatic, use recommended solutions):**
```bash
/debug -a API returning 500 on POST
```

**What it does:**
1. **Analyze**: Build a tight red-capable command, minimize the repro, then test ranked hypotheses
2. **Instrumentation** (if needed): Add uniquely tagged probes and collect runtime evidence
3. **Find Solutions**: Research 2-3+ potential fixes with pros/cons
4. **Propose**: Present options → **you choose which solution**
5. **Fix**: Implement solution with strategic logging
6. **Verify**: Multi-layer verification (Static → Build → Runtime)

**Key principle**: Tests passing ≠ fix working. Always execute the actual code path.

**Log Technique**: When the error can't be reproduced, strategic debug logs are added. The user runs the app and shares the console output for analysis.
</quick_start>

<methodology>
<core_principles>
**Battle-Tested Principles:**

1. **Build the feedback loop first** - Name one fast command that can go red on the user's exact symptom
2. **Minimize before theorizing** - Remove every input and dependency that is not load-bearing
3. **Hypothesis-driven analysis** - Rank 3-5 falsifiable causes and test one variable at a time
4. **Multi-layer verification** - Re-run the original repro and actual runtime path; green tests alone are insufficient
</core_principles>

<verification_pyramid>
**Verification Pyramid:**

```
        ┌─────────────┐
        │   Manual    │  ← User confirms
        └──────┬──────┘
     ┌─────────┴─────────┐
     │ Runtime Execution │  ← CRITICAL: Real execution
     └─────────┬─────────┘
   ┌───────────┴───────────┐
   │   Automated Checks    │  ← Build, Types, Lint, Tests
   └───────────┬───────────┘
 ┌─────────────┴─────────────┐
 │     Static Analysis       │  ← Syntax, Imports
 └───────────────────────────┘
```

**Key Insight**: Tests passing ≠ fix working. ALWAYS execute the actual code path.
</verification_pyramid>
</methodology>

<parameters>
**Flags:**

| Flag | Name | Description |
|------|------|-------------|
| `-a`, `--auto` | Auto mode | Full automatic mode - don't ask the user, use recommended solutions |

**Arguments:**
- Everything after flags = `{error_context}` - Description of the error or context about what's failing
</parameters>

<state_variables>
**Persist throughout all steps:**

| Variable | Type | Description |
|----------|------|-------------|
| `{error_context}` | string | User's description of the error |
| `{auto_mode}` | boolean | Skip confirmations, use recommended options |
| `{error_analysis}` | object | Detailed analysis from step 1 |
| `{feedback_loop}` | object | Exact red-capable command, expected signal, timing, and determinism |
| `{debug_logs}` | list | Debug logs added for cleanup (file, line, prefix) |
| `{solutions}` | list | Potential solutions found in step 2 |
| `{selected_solution}` | object | User's chosen solution from step 3 |
| `{files_modified}` | list | Files changed during the fix |
| `{verification_result}` | object | Results from verification step |
</state_variables>

<entry_point>
Load `steps/step-00-init.md`
</entry_point>

<step_files>
| Step | File | Description |
|------|------|-------------|
| 0 | `step-00-init.md` | Parse flags, setup state |
| 1 | `step-01-analyze.md` | Reproduce error, form hypotheses, identify root cause |
| 1b | `step-01b-log-instrumentation.md` | *Optional*: Add debug logs, user runs & shares output |
| 2 | `step-02-find-solutions.md` | Research 2-3+ solutions with pros/cons |
| 3 | `step-03-propose.md` | Present solutions for user selection |
| 4 | `step-04-fix.md` | Implement with strategic logging |
| 5 | `step-05-verify.md` | Multi-layer verification (Static → Build → Runtime → User) |
</step_files>

<references>
| File | Description |
|------|-------------|
| `references/log-technique.md` | Log placement patterns, prefixes, security guidelines |
</references>

<success_criteria>
- Error successfully reproduced
- One fast, deterministic, agent-runnable command catches the user's exact symptom
- Reproduction minimized so every remaining element is load-bearing
- Root cause identified through hypothesis testing
- 2-3+ potential solutions researched with pros/cons
- Solution selected (by user or auto mode)
- Fix implemented with strategic logging
- Static analysis passes (syntax, imports)
- Build completes successfully
- Tests pass (if tests exist)
- **Runtime execution verified** (actual code path executed)
- User confirms fix resolves the original issue
- No regressions introduced
- Temporary instrumentation removed and the confirmed cause recorded
</success_criteria>
