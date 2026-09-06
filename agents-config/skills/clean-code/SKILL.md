---
name: clean-code
description: Clean Code rules for TypeScript, React, and Next.js. Apply when writing, refactoring, or reviewing code - naming, small functions, no any, early returns, typed errors, plus tech-specific rules for React 19, Next.js 15/16, Zustand v5, TanStack Query v5.
argument-hint: "[feature/file]"
---

Apply these rules inline on every edit. When a rule conflicts with the codebase, match the codebase and mention the tension. If a target is given, bring that code in line, then run the project's typecheck/build/tests.

- Names reveal intent. Booleans are predicates. Functions are verbs.
- One responsibility per function/component. Early returns. Soft ceiling: functions < 20 lines, components < 150.
- Abstract on the third repetition. Delete dead and commented-out code.
- Never `any`: `unknown` + narrowing, generics, or discriminated unions.
- Typed errors; fail fast at the boundary. No leftover `console.log`.
- Immutability by default. Handle error/empty/loading first.

Load when touching that stack: [general-clean-code.md](references/general-clean-code.md), [react-clean-code.md](references/react-clean-code.md), [nextjs-clean-code.md](references/nextjs-clean-code.md), [zustand-best-practices.md](references/zustand-best-practices.md), [tanstack-query-best-practices.md](references/tanstack-query-best-practices.md).

Fix on sight: `any`; `useEffect`/`useState` for server data; props drilling 3+ levels; unmeasured manual memo; `forwardRef`; deep nesting; magic numbers.

Never leave the codebase broken to satisfy a style rule.
