---
name: verify
description: Verify any change, fix, behavior, artifact, workflow, or external state through current evidence from its authoritative surface. Use when the user invokes $verify or asks to verify, prove, check, or demonstrate something.
argument-hint: "<thing to verify or expected outcome>"
---

Prove that the explicit `$verify` claim—or, when absent, the latest user request—works through current evidence from its real surface; do not settle for “it probably works.” A GitHub issue and a code diff are optional.

1. Define observable pass criteria.
2. Exercise the real user-facing or authoritative surface. Static checks support runtime proof; they do not replace it.
3. Capture current evidence:
   - Visual step: capture a current screenshot and display it inline with Markdown and an absolute path.
   - Non-visual step: preserve the command or request, output, errors, status, and authoritative read-back.
4. Mark each criterion `PASS` or `NOT PROVEN`.

Keep local or static checks, provider read-back, deployed or public artifacts, and authenticated live behavior as distinct proof layers.

After any later change, rerun the affected criteria and replace affected visual evidence with fresh screenshots shown inline in the same response.

Finish with `PASS` only when every criterion has current evidence. Otherwise report `BLOCKED — NOT PROVEN` with the exact blocker.
