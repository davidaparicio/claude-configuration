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
4. `$review`
5. `$verify`
6. Close the GitHub issue `$plan` created

Do not skip, combine, or reorder stages. The GitHub issue created by `$plan` is the source of truth.

If the invocation contains `-a` or `auto`, do not pause for confirmation. Resolve facts, make reasonable reversible decisions, and record assumptions on the issue. Fix review or verification failures, then rerun every affected downstream stage.

Close the issue only after `$verify` reports PASS for every acceptance criterion. Preserve `$verify`'s evidence in the final response: when verification captures screenshots, show every screenshot directly rather than replacing them with paths, links, or a summary. Comment with the outcome and the commit SHA when one exists, follow the repository's GitHub attribution rules, then close it and read the issue back as `CLOSED`. Leave it open when verification is `BLOCKED — NOT PROVEN` or the issue was not created in this run.

Without autonomous mode, pause only for a material decision or authorization. In either mode, stop only after verification passes and the issue is closed, or progress requires unavailable access, credentials, external authorization, or an irreversible decision that cannot be inferred safely.
