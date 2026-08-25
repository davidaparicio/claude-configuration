---
name: plan
description: Turn an analyzed request into an implementation-ready plan, optionally backed by a GitHub issue. Use when the user invokes $plan or continues the Melvyn workflow.
disable-model-invocation: true
argument-hint: "<analysis or request>"
---

Turn the current analysis into one implementation-ready plan.

Include the problem, desired behavior, scope, out of scope, implementation decisions, measurable acceptance criteria, and verification requirements. Prefer behavioral requirements over file paths or code snippets.

Return a focused plan directly. Create a durable GitHub issue when the user requests it, repository rules require it, or the plan is large enough to need tracking.

A plan needs an issue when any of these apply:

- it has at least three independent implementation units;
- it spans multiple subsystems or owners;
- it includes a migration, deployment, or external coordination;
- it is unlikely to finish in one focused implementation session.

When an issue is needed, follow the repository's GitHub attribution rules, create or update it within the authorized scope, read it back, and return its URL with the plan. GitHub availability must not block a focused plan that does not need an issue.

Do not implement the plan.
