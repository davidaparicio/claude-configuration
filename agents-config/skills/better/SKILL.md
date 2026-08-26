---
name: better
description: Route holistic interface reviews across accessibility, layout, writing, typography, colors, and UI polish. Use for quick or full reviews of a screen, flow, feature, or product interface.
---

# Review the interface as one system

A strong interface is not six independent audits stapled together. Review the whole experience, let each domain reference own its rules, then consolidate the evidence into one prioritized verdict.

`better` is the single interface-review skill. Its focused domain guides live as internal references under `references/`; they are not separate skills or commands.

This file owns orchestration only. Never duplicate or override the domain guides here.

## Modes and references

Select the smallest relevant domain below. Read its linked `guide.md` completely before acting, then load only the adjacent files that the guide explicitly requires. Resolve relative links from the guide's own directory.

| Route | Internal domain guide |
| --- | --- |
| Focus, keyboard, ARIA, forms, screen readers, hit areas, reduced motion, semantic HTML, WCAG | [Accessibility](references/accessibility/guide.md) |
| Grouping, alignment, spacing, hierarchy, progressive disclosure, breakpoints, RTL | [Layout](references/layout/guide.md) |
| Voice, labels, errors, empty states, onboarding, microcopy, capitalization | [Writing](references/writing/guide.md) |
| Font choice, type scale, wrapping, truncation, OpenType, line length, input zoom | [Typography](references/typography/guide.md) |
| OKLCH conversion, palettes, contrast, gamut, Tailwind tokens, semantic color usage | [Colors](references/colors/guide.md) |
| Surfaces, shadows, icons, optical alignment, micro-interactions, visual details | [UI polish](references/ui/guide.md) |

If no focused domain is narrower than this core guide, use this file as the router and load all six guides. If several apply, load them in the review order below.

## Core Principles

### 1. Resolve Scope and Mode First

Infer the screen, flow, feature, or repository scope from the request and current workspace. State the resolved scope in the output. Use `full` when no mode is supplied.

| Mode | Coverage | Finding cap |
| --- | --- | --- |
| `quick` | Primary user path and highest-traffic states; report only `HIGH` and `MEDIUM` issues | 5 |
| `full` | Entire requested scope across all six domain guides, including empty, loading, error, and narrow-width states when present | 15 |

If the requested scope is too large to inspect credibly, narrow it to the highest-traffic complete flow and state the boundary. Never imply uninspected surfaces were reviewed.

### 2. Recon Before Judgment

Identify the framework, styling system, component library, design tokens, supported viewports, and available preview or test commands. Follow the project's established Tailwind, plain CSS, CSS-in-JS, token, and component conventions.

### 3. Use Domain References as the Sources of Truth

Before reviewing, load the six owning guides below. In `quick` mode, inspect all six domains but spend depth only where the primary flow has evidence. In `full` mode, complete each available domain review before consolidation.

Review in this order so foundational failures are not hidden by polish:

1. [Accessibility](references/accessibility/guide.md)
2. [Layout](references/layout/guide.md)
3. [Writing](references/writing/guide.md)
4. [Typography](references/typography/guide.md)
5. [Colors](references/colors/guide.md)
6. [UI polish](references/ui/guide.md)

This skill owns the final response. When a domain guide is loaded through `better`, apply its principles and references but ignore its standalone **Review Output Format**. Use the consolidated format, shared severity, and finding cap in this file instead.

If a domain guide is missing, mark that domain `Not reviewed`, name the missing path, and continue with the remaining domains. Do not recreate its rules from memory, substitute a neighboring guide, or claim holistic coverage.

When two guides appear to cover the same issue, assign it to the guide that owns the underlying rule and mention secondary effects in the **Why** cell. Report it once.

### 4. Require Evidence

Every finding cites `path/to/file:line` and shows the current implementation. If the review artifact has no source files, cite the exact screen and component. Do not report a code-level finding from visual appearance alone or a visual finding from source code alone when runtime behavior determines the result.

### 5. Rank by User Impact

Use one shared severity scale:

- `HIGH`: blocks a task, misleads the user, hides content or controls, causes data-loss risk, or creates a repeated systemic failure.
- `MEDIUM`: meaningfully harms comprehension, efficiency, adaptability, or consistency.
- `LOW`: isolated polish with limited task impact. Include only in `full` mode.

Within a severity, rank by reach and leverage. A token or shared-component fix outranks the same symptom in one leaf component.

### 6. Consolidate Systemic Findings

One root cause is one finding. List every confirmed location in the same row rather than producing a row per occurrence. Do not pad the report to reach the finding cap; a short review or no findings is a valid result.

### 7. Make Restraint Visible

Record candidates considered but deliberately rejected. A candidate is rejected when the owning guide permits the current implementation, evidence is insufficient, the project convention is intentional, or the proposed change would add complexity without user benefit.

### 8. Verify What Can Be Verified

Run safe, relevant checks available in the project. Inspect the rendered interface when runtime behavior or visual judgment matters. Report the exact command or interaction and observed result. If a check cannot be run, label it **Not verified** and state what remains; never convert a verification gap into a finding.

### 9. Review Without Mutating by Default

Treat a review request as read-only. Do not edit source code unless the user also asks to implement the findings. When implementation is requested, preserve the consolidated report as the change scope and re-run the relevant verification afterward.

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Six disconnected domain reports | Consolidate into one ranked findings table |
| Same issue reported by multiple guides | Assign it to the guide that owns the underlying rule |
| Finding with no exact location | Cite `path/to/file:line` and the current implementation |
| Visual claim inferred only from source | Inspect the rendered state or mark it not verified |
| Unlimited low-impact polish | Respect the mode cap; omit `LOW` findings in `quick` |
| Silent gaps in coverage | Show which domains and states were actually inspected |
| Missing domain guide silently treated as covered | Mark the domain `Not reviewed` and name the unavailable path |
| No rejected candidates | Include the required considered-but-rejected table |
| Review silently edits code | Stay read-only unless implementation was requested |
| “Approve” with pending actionable findings | Use `Needs changes` or `Block` |

## Review Output Format

Always use the following sections.

### Scope and Coverage

State the mode, exact scope, stack and styling conventions, and any review boundary. Then show coverage:

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Files, components, states, or checks | Findings count or `Clear` |

Include all six domains. `Clear` means inspected with no actionable finding; `Not reviewed` must explain why.

### Findings

Use one table ordered by severity, then reach and leverage:

| # | Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | HIGH | Accessibility | `src/Dialog.tsx:42` | `<button><XIcon /></button>` | Add `aria-label="Close"` and hide the icon from the accessibility tree | The icon-only control has no accessible name |

Each row is one root cause. The **Domain** value is the owning guide without the `better-` prefix: Accessibility, Layout, Writing, Typography, Colors, or UI. Respect the mode's finding cap. If there are no findings, omit the table and state "No actionable interface findings."

### Considered but Rejected

Include 1–3 candidates in `quick` mode and 2–5 in `full` mode:

| Location | Candidate | Rejected because |
| --- | --- | --- |
| `src/Card.tsx:28` | Increase the shadow | Existing depth matches the shared surface token; changing one card would reduce consistency |

These are real candidates inspected during the review, not invented filler. If the scope genuinely contains fewer borderline candidates, include the ones that exist and say so.

### Verification

List each check or interaction, the exact command or steps, and the observed result. Separate checks that passed from checks marked **Not verified**.

### Verdict

End with exactly one:

- `Block` — one or more `HIGH` findings remain.
- `Needs changes` — only `MEDIUM` or `LOW` findings remain.
- `Approve` — no actionable findings remain and the claimed coverage was verified.
