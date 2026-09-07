---
name: better
description: Route a holistic interface review across accessibility, layout, writing, typography, colors, and UI polish. Use when reviewing a screen, flow, feature, or product interface, or for a11y, copy, type, color, or polish findings.
---

Review one resolved screen, flow, feature, or product interface. Orchestrate only; never duplicate or override the domain guides.

A request naming a branch, PR, commit range, or uncommitted changes is a change review. Stop and tell the user to run `interface-review`. When that skill hands a review back, keep its scope and status labels; rank and verdict here cover `Introduced` and `Regression` only.

State the scope. If it is too large to inspect, narrow to one complete flow and name what was excluded. Cover empty, loading, error, and narrow-width states where they exist. Cap the report at 15 findings.

Identify the stack, tokens, viewports, and preview command. Read project interface docs (`CONTRIBUTING.md`, `AGENTS.md`, design-system, Storybook). A documented convention does not retire a finding; report a shared-token cause once against that source.

Load and finish every available guide in this order before consolidating:

1. `references/accessibility/guide.md`
2. `references/layout/guide.md`
3. `references/writing/guide.md`
4. `references/typography/guide.md`
5. `references/colors/guide.md`
6. `references/ui/guide.md`

Take principles, references, and verification checks from each guide. This file owns severity, ranking, cap, and format. A missing guide is `Not reviewed` with its path; do not recreate its rules. Assign an overlapping issue to the owner of the underlying rule and report it once.

Cite `path/to/file:line` and show the current implementation. Do not report a code finding from appearance alone or a visual finding from source alone when runtime decides the result. Run the project's safe checks; a check you cannot run is `Not verified`.

`HIGH` blocks a task, misleads, hides content, risks data loss, or is a confirmed trigger: unnamed control, missing focus, pointer-only path, ignored `prefers-reduced-motion`, clip at 320px or 200% zoom, failing contrast, color-only meaning, unconfirmed destructive action, unreachable truncated content, undisclosed overflow, error with no recovery, semantic color used against its meaning, motion-only state. `MEDIUM` harms comprehension, efficiency, adaptability, or consistency. `LOW` is isolated polish. Rank triggers first, then reach. Prefer delete → platform → existing token → correct value → add. One root cause is one row. Never pad to reach the cap.

Stay read-only unless asked to implement. Then keep this report as the change scope and re-verify. Report through `references/review-format.md` and stop.
