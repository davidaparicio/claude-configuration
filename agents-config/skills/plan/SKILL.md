---
name: plan
description: Turn an analyzed request into an implementation-ready GitHub issue. Use when the user invokes $plan or continues the Melvyn workflow.
disable-model-invocation: true
argument-hint: "<analysis or request>"
---

Turn the current analysis into one implementation-ready GitHub issue.

Include the problem, desired behavior, scope, out of scope, implementation decisions, measurable acceptance criteria, and verification requirements. Prefer behavioral requirements over file paths or code snippets.

Follow the repository's GitHub attribution rules. Create the issue, read it back, and return its URL.

Do not finish until the issue exists and its content is confirmed by provider read-back. Do not implement it.
