---
name: oneshot
description: Run the complete Melvyn workflow from analysis through runtime proof. Use when the user invokes $oneshot with a request.
disable-model-invocation: true
argument-hint: "[-a|auto] <request>"
---

Run these skills in order, passing each result to the next:

1. `$analyze`
2. `$plan`
3. `$implement`
4. `$code-review`
5. `$verify`
6. If `$plan` created a GitHub issue in this run, close it after verification passes

Do not skip, combine, or reorder stages. The implementation plan returned by `$plan` is the source of truth. A GitHub issue remains optional for focused work; `$plan` creates one when requested, required by repository rules, or when its size and coordination rules classify the plan as large.

If the invocation contains `-a` or `auto`, do not pause for confirmation. Resolve facts, make reasonable reversible decisions, and record assumptions in the current plan and, when an issue is in use and mutation is authorized, on that issue. Fix code-review or verification failures, then rerun every affected downstream stage.

When this run created an issue, close it only after `$verify` reports PASS for every acceptance criterion. Preserve `$verify`'s evidence in the final response: when verification captures screenshots, show every screenshot directly rather than replacing them with paths, links, or a summary. Comment with the outcome and the commit SHA when one exists, follow the repository's GitHub attribution rules, then close it and read the issue back as `CLOSED`. Leave it open when verification is `BLOCKED — NOT PROVEN`. Without an issue, perform no GitHub mutation and use the verification result as the completion gate.

Without autonomous mode, pause only for a material decision or authorization. In either mode, stop only after verification passes and any issue created in this run is closed, or progress requires unavailable access, credentials, external authorization, or an irreversible decision that cannot be inferred safely.
