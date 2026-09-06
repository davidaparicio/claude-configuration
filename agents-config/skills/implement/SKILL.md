---
name: implement
description: Implement an agreed request, plan, specification, or optional GitHub issue with a tight feedback loop. Use when the user invokes $implement or continues the APEX workflow.
disable-model-invocation: true
argument-hint: "<request, plan, spec, or optional GitHub issue>"
---

Resolve the contract from the explicit input first, then the latest agreed plan, specification, analysis, or user request. Read a supplied GitHub issue in full. An issue is optional when the contract is already clear.

Read applicable repository rules. Treat the contract as the source of truth. Implement only its scope with the smallest coherent change. Run focused checks throughout and the relevant broader checks at the end.

If a missing material decision appears, stop unless autonomous mode is active; then choose the safest reversible option and record the assumption in the handoff and, when authorized, on the issue.

Finish with the diff, checks run, and remaining uncertainty. Do not claim runtime verification.
