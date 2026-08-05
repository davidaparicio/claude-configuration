---
name: review-code
description: Run deep multi-agent code or PR review. Use when the user asks to review code, audit a PR, check security or quality, or find high-impact issues beyond nitpicks.
model: opus
argument-hint: "[PR number or file paths]"
---

<objective>
Multi-agent code review orchestrator. Review every change on two independent axes - repository standards and originating spec - then add domain specialists for security, frontend, backend, database, and tests as the diff requires.
</objective>

<workflow>
## Phase 1: SCOPE - Analyze changes and determine review domains

1. **Get the diff.** Determine what to review:
   - If user provided a PR number: `gh pr diff {number}`
   - If user provided file paths: `git diff` on those files
   - If nothing specified: `git diff` (unstaged) + `git diff --cached` (staged)
   - If no local changes: ask user what to review

   When the user supplies a commit, branch, or tag, verify it with `git rev-parse` and use `git diff <fixed-point>...HEAD` so the review is anchored at the merge-base. Record `git log <fixed-point>..HEAD --oneline`. Fail before dispatch when the ref is invalid or the diff is empty.

2. **Find the originating spec.** Search in this order:
   - Issue or PR references in commit messages
   - A spec path or tracker item supplied by the user
   - Matching documents under `docs/`, `specs/`, or `.scratch/`
   - The current conversation when it contains the accepted requirements

   If no spec exists, keep reviewing and report the Spec axis as unavailable. Never infer requirements from the implementation itself.

3. **Find repository standards.** Read `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, coding-standard documents, and scoped instructions governing the changed files. Repository rules override generic advice. The Standards agent must also load `references/fowler-smell-baseline.md`; those smells are judgement calls, not hard violations.

4. **Categorize changed files** into domains by scanning extensions and paths:

| Domain | Signals |
|--------|---------|
| **frontend** | `.tsx`, `.jsx`, `.css`, `.scss`, `components/`, `pages/`, `app/`, `ui/` |
| **backend** | `.ts`/`.js` in `api/`, `server/`, `routes/`, `middleware/`, `lib/`, `services/`, `prisma/`, `drizzle/` |
| **security-sensitive** | Auth files, middleware, API routes, env handling, crypto, payments |
| **database** | Migration files, schema files, ORM models, raw SQL |
| **tests** | `.test.`, `.spec.`, `__tests__/`, `vitest`, `jest` |
| **config** | `.config.`, `package.json`, `tsconfig`, CI/CD files |

5. **Determine review agents to launch** based on axes and domains detected:

| Condition | Agent | Focus | Reference to load |
|-----------|-------|-------|-------------------|
| Always (if >0 non-test files) | **Standards** | Repository rules, maintainability, Fowler smells | Standards files + `references/clean-code-principles.md` + `references/code-quality-metrics.md` + `references/fowler-smell-baseline.md` |
| Spec is available | **Spec** | Missing requirements, incorrect behavior, scope creep | Originating spec or conversation requirements |
| Backend or security-sensitive files | **Security** | OWASP, auth, injection, secrets | `references/security-checklist.md` |
| Frontend files (.tsx/.jsx/.css) | **UX/UI** | Accessibility, responsive, UX patterns | `references/ux-ui-checklist.md` |
| Backend files (API, DB, services) | **Backend** | API design, DB patterns, error handling | `references/backend-patterns.md` |
| Test files changed | **Tests** | Coverage gaps, test quality | (inline guidance) |

6. **Determine review scale:**
   - Reserve one agent for Standards and, when a spec exists, one separate agent for Spec.
   - Use the remaining slots for domain review. Combine adjacent lenses (for example backend + security) when separate agents would exceed the cap.
   - Small (1-5 files): the Standards agent may also carry the relevant domain checklist; add the separate Spec agent when available.
   - Medium (6-15 files): base axes plus 1-2 combined domain agents.
   - Large (16+ files): base axes plus up to 3 domain agents.
   - Maximum: 5 agents total. Never merge Standards and Spec into one agent.

## Phase 2: DISPATCH - Launch parallel specialized review agents

Launch all determined agents **in parallel** using the available sub-agent tool with a code-review task and the strongest available review model. Standards and Spec must remain separate agents so one axis cannot mask the other.

Each agent gets a structured prompt following this template:

```xml
<review_request>
  <focus_area>{domain}</focus_area>
  <reference_files>
    <file>{SKILL_PATH}/references/{reference-file}.md</file>
  </reference_files>
  <changed_files>
    <file path="src/example.ts" />
  </changed_files>
  <diff_context>
{paste relevant portions of the diff for this domain's files}
  </diff_context>
  <pr_context>
    <title>{PR title if available}</title>
    <description>{PR description if available}</description>
  </pr_context>
  <review_axis>{standards | spec | domain}</review_axis>
</review_request>

INSTRUCTIONS:
1. Read EACH reference file listed in <reference_files> - these contain your domain-specific checklists
2. Read EACH file listed in <changed_files> completely
3. Apply the checklist from the reference against the actual code
4. For EACH issue found, provide: Severity | Issue | Location (file:line) | Why It Matters | Concrete Fix
5. Only report actionable issues with confidence >= 80. No nitpicks or tooling-enforced style comments.
6. For Standards findings, cite the governing rule; label Fowler smells as judgement calls.
7. For Spec findings, quote or cite the requirement each finding violates.
8. Use severity labels: BLOCKING (must fix) | CRITICAL (strongly recommended) | SUGGESTION (optional improvement)
```

**Agent naming convention:** `review-{domain}` (e.g., `review-security`, `review-ux-ui`, `review-clean-code`, `review-backend`)

**If a best-practice skill exists** for the detected tech stack (e.g., `vercel-react-best-practices` for Next.js/React), include it in the prompt: tell the agent to also load that skill via the Skill tool for additional framework-specific checks.

## Phase 3: CONSOLIDATE - Merge and present findings

After all agents complete:

1. **Collect all findings** from each agent
2. **Deduplicate within each axis**: If multiple agents flagged the same issue, keep the most detailed one
3. **Keep Standards and Spec separate**: A change can follow every standard while implementing the wrong behavior, or satisfy the spec while violating repository rules. Do not merge or rerank these axes against each other.
4. **Sort within each section by severity**: BLOCKING first, then CRITICAL, then SUGGESTION
5. **Present the unified report:**

```markdown
# Code Review Report

**Scope**: {X files across Y domains}
**Agents dispatched**: {list of agents launched}

## Standards
{documented-standard violations and Fowler judgement calls}

## Spec
{missing, incorrect, partial, and unrequested behavior; or "No spec available"}

## Domain Findings
{security, frontend, backend, database, and test findings}

## Summary
{2-3 sentence overview of code health}
{Verdict: APPROVE / APPROVE WITH COMMENTS / REQUEST CHANGES}
```

6. **Verdict logic:**
   - Any BLOCKING issue → REQUEST CHANGES
   - Only CRITICAL + SUGGESTION → APPROVE WITH COMMENTS
   - No issues or only minor SUGGESTIONS → APPROVE
</workflow>

<execution_rules>
- ALWAYS launch at minimum 1 agent, maximum 5
- Prefer the strongest available review model for sub-agents
- ALWAYS pass the relevant reference file paths so agents can Read them
- ALWAYS include the actual diff context in the agent prompt (not just file paths)
- NEVER skip the scoping phase - it determines which agents are needed
- If the change is tiny (1-2 files, <50 lines) and no spec exists, the Standards agent MAY also cover the relevant domain. When a spec exists, Standards and Spec still require two separate agents.
- Each agent should complete independently - they don't need to communicate with each other
</execution_rules>

<reference_files>
Domain-specific checklists loaded by sub-agents:

| Reference | Domain | Content |
|-----------|--------|---------|
| `references/security-checklist.md` | Security | OWASP Top 10, auth, injection, input validation, secrets |
| `references/clean-code-principles.md` | Clean Code | SOLID, code smells, function design, naming |
| `references/code-quality-metrics.md` | Clean Code | Complexity metrics, maintainability index, thresholds |
| `references/fowler-smell-baseline.md` | Standards | High-signal Fowler smells and safe reporting rules |
| `references/ux-ui-checklist.md` | UX/UI | Accessibility (WCAG), responsive design, UX patterns, loading states |
| `references/backend-patterns.md` | Backend | API design, database, error handling, concurrency, observability |
| `references/feedback-patterns.md` | All | How to structure feedback (What + Why + Fix), priority labels |
</reference_files>
