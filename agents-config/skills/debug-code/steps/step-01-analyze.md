---
name: step-01-analyze
description: Build a tight feedback loop, minimize the reproduction, and identify the root cause
prev_step: steps/step-00-init.md
next_step: steps/step-02-find-solutions.md
---

# Step 1: Diagnose the Error

Build the feedback loop before building a theory. Do not modify production behavior or propose fixes in this step.

## 1. Read the system context

Read the complete error and stack trace. Inspect `CONTEXT.md`, relevant ADRs, scoped repository instructions, recent commits, and the files named by the failure. Preserve exact error codes, paths, inputs, timings, and environment details.

## 2. Build a red-capable feedback loop

Spend disproportionate effort here. Choose the narrowest mechanism that drives the real bug path:

1. Failing unit, integration, or end-to-end test at the correct seam
2. `curl` or HTTP script against the running service
3. CLI invocation with fixture input and an asserted output
4. Headless browser script asserting DOM, console, or network state
5. Captured request, payload, event, or trace replay
6. Throwaway harness around the smallest relevant subsystem
7. Seeded property or fuzz loop for intermittent wrong output
8. Automated bisection or old-versus-new differential loop
9. Human-in-the-loop script based on `scripts/hitl-loop.template.sh`

Tighten the loop until it is:

- **Red-capable:** it asserts the user's exact symptom, not merely "did not crash"
- **Deterministic:** repeated runs return the same verdict; for flaky bugs, raise and pin the reproduction rate
- **Fast:** seconds where practical
- **Agent-runnable:** unattended except for a structured HITL script

Record `{feedback_loop}` with the exact command, expected red signal, observed output, duration, and reproduction rate. Phase completion requires one command already run at least once. No red-capable command means no hypotheses.

### When no loop can be built

List every mechanism attempted and stop. Ask for access to the reproducing environment, a captured artifact such as a HAR/log/core dump/recording, or permission for temporary instrumentation. Do not compensate for a missing signal with speculation. Auto mode does not waive this gate.

## 3. Reproduce and minimize

Run the loop until it shows the failure the user described. Then remove inputs, callers, configuration, data, and steps one at a time, re-running after each removal. The reproduction is minimal when removing any remaining element makes it go green.

Capture the exact failing output or timing. A nearby failure is not evidence for the reported bug.

## 4. Rank falsifiable hypotheses

Generate 3-5 causes before testing any one. Use this format:

> If `<cause>` is responsible, changing or observing `<probe>` will produce `<prediction>`.

Discard hypotheses without a concrete prediction. Present the ranked list briefly to the user, but continue with the best ranking when they are unavailable.

## 5. Probe one variable at a time

Prefer debugger or REPL inspection, then targeted logs at boundaries that distinguish hypotheses. Tag temporary logs with one run-specific prefix such as `[DEBUG-a4f2]` so cleanup is exhaustive. For performance regressions, establish a timing/profile/query-plan baseline and bisect; broad logging usually distorts the signal.

Test each prediction against the feedback loop. Record confirmed and rejected hypotheses with their evidence.

## 6. Complete the diagnosis

Populate `{error_analysis}`:

| Field | Required evidence |
|---|---|
| Exact symptom | User-visible error, wrong output, or timing |
| Feedback command | The command from `{feedback_loop}` |
| Minimal reproduction | Every remaining element is load-bearing |
| Root cause | Confirmed hypothesis and probe evidence |
| Affected files | Concrete paths |
| Correct test seam | Existing seam, proposed seam, or explicitly unavailable |
| Verification method | Original un-minimized runtime path |

Proceed to `step-02-find-solutions.md` only when the loop is red-capable and the root cause is supported by evidence.
