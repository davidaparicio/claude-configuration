---
name: analyze
description: Analyze a requested change before planning or implementation. Use when the user invokes $analyze or starts the Melvyn workflow.
disable-model-invocation: true
argument-hint: "<request>"
---

Analyze the request without changing state.

Inspect the repository, current behavior, applicable rules, and nearby prior art. Resolve facts from the environment; ask the user only for material decisions.

Return the problem, desired behavior, evidence, constraints, risks, measurable acceptance criteria, and unresolved decisions.

Stop when the request is understood well enough to plan. Do not plan or implement.
