---
name: code-review
description: Review code against its agreed request, plan, specification, or optional GitHub issue plus repository standards. Use when the user invokes $code-review or Apex reaches its review stage.
disable-model-invocation: true
argument-hint: "<contract and fixed point>"
---

Review the implementation from a resolved fixed point on two separate axes:

1. **Spec** — it satisfies the agreed request, plan, specification, or supplied GitHub issue without missing behavior or scope creep.
2. **Standards** — it follows the repository rules and remains maintainable.

Resolve the contract from the explicit input and current task context. A GitHub issue is optional.

Report only actionable findings with file and line references. Separate defects from optional improvements.

When fixes are in scope, apply them and review the resulting diff again. End with `PASS` or `CHANGES REQUIRED` for each axis. Leave runtime proof to `$verify`.
