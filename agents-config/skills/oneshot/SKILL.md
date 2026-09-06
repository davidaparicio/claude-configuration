---
name: oneshot
description: Run the complete APEX workflow from analysis through runtime proof. Use when the user invokes $oneshot with a request.
disable-model-invocation: true
argument-hint: "[-a|auto] <request>"
---

Run these skills in order, passing each result to the next:

1. `$analyze`
2. `$plan`
3. `$implement`
4. `$code-review`
5. `$verify`

The `$plan` result is the source of truth. Do not skip, combine, or reorder stages.

With `-a` or `auto`, do not pause for confirmation. Resolve facts, make safe reversible decisions, and record assumptions in the plan and, when authorized, on the issue. Fix review or verification failures, then rerun every affected downstream stage.

Close a GitHub issue created in this run only after `$verify` reports PASS for every acceptance criterion. Preserve `$verify`'s evidence: show every screenshot inline. Comment with the outcome and commit SHA when one exists, follow the repository's GitHub attribution rules, then close the issue and read it back as `CLOSED`. Leave it open when verification is `BLOCKED — NOT PROVEN`.

Without autonomous mode, pause only for a material decision or authorization. Stop only after verification passes and any issue created in this run is closed, or progress requires unavailable access, credentials, external authorization, or an irreversible decision.
