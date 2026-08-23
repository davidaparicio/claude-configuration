---
name: review
description: Review an implementation against its GitHub issue and repository standards. Use when the user invokes $review or continues the Melvyn workflow.
disable-model-invocation: true
argument-hint: "<GitHub issue and fixed point>"
---

Review the implementation from a resolved fixed point on two separate axes:

1. **Spec** — it satisfies the GitHub issue without missing behavior or scope creep.
2. **Standards** — it follows the repository rules and remains maintainable.

Report only actionable findings with file and line references. Separate defects from optional improvements.

When fixes are in scope, apply them and review the resulting diff again. End with `PASS` or `CHANGES REQUIRED` for each axis. Do not verify runtime behavior.
