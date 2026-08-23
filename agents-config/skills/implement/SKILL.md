---
name: implement
description: Implement an agreed GitHub issue with a tight feedback loop. Use when the user invokes $implement or continues the Melvyn workflow.
disable-model-invocation: true
argument-hint: "<GitHub issue>"
---

Read the full GitHub issue and applicable repository rules. Treat the issue as the source of truth.

Implement only its scope using the smallest coherent change. Run focused checks throughout and the relevant broader checks at the end.

Do not silently change the contract. If implementation exposes a missing material decision, stop unless autonomous mode is active; in autonomous mode, choose the safest reversible option and record the assumption on the issue.

Finish with the diff, checks run, and remaining uncertainty. Do not claim runtime verification.
