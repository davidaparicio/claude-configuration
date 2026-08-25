---
name: implement
description: Implement an agreed request, plan, specification, or optional GitHub issue with a tight feedback loop. Use when the user invokes $implement or continues the Melvyn workflow.
disable-model-invocation: true
argument-hint: "<request, plan, spec, or optional GitHub issue>"
---

Resolve the implementation contract from the explicit input first, then the latest agreed plan, specification, analysis, or user request. If a GitHub issue is supplied, read it in full. An issue is optional and must not be required when the contract is already clear.

Read applicable repository rules and treat the resolved contract as the source of truth.

Implement only its scope using the smallest coherent change. Run focused checks throughout and the relevant broader checks at the end.

Do not silently change the contract. If implementation exposes a missing material decision, stop unless autonomous mode is active; in autonomous mode, choose the safest reversible option and record the assumption in the handoff and, when an issue is in use and mutation is authorized, on that issue.

Finish with the diff, checks run, and remaining uncertainty. Do not claim runtime verification.
