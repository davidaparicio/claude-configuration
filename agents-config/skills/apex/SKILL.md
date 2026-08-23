---
name: apex
description: Run the configurable Melvyn one-shot workflow. Use when the user invokes $apex or /apex to analyze, plan, implement, optionally review, and verify a change.
disable-model-invocation: true
argument-hint: "[-a] [-v] [-x] <request>"
---

# Apex

Run the Melvyn workflow by calling its skills in this order:

1. `$analyze`
2. `$plan`
3. `$implement`
4. `$review` only with `-x`
5. `$verify` by default; `-v` explicitly requests the default

Pass each result to the next skill. The GitHub issue created by `$plan` is the source of truth. Do not combine or reorder stages.

## Flags

- `-a`: autonomous mode. Do not pause after analysis or planning for validation. Resolve facts, make safe reversible decisions, and record assumptions on the issue. Stop only for missing authority, access, credentials, or an irreversible material decision.
- `-v`: run `$verify`. Verification is already on by default.
- `-x`: run `$review` after implementation and before verification.

Accept grouped forms such as `-axv`. No other workflow flags are supported.

If review or verification changes the implementation, rerun every affected downstream stage. Close the issue only after verification passes every acceptance criterion; otherwise leave it open and report the exact blocker.

Preserve `$verify`'s evidence in the final response. When verification captures screenshots, show every screenshot directly with Markdown image syntax and its absolute path; never replace the images with paths, links, a report, or a summary.
