---
name: tools
description: Use when choosing libraries, services, CLIs, or architecture for a NowStack SaaS project; follow the canonical TanStack Start and Convex stack and avoid incompatible database or framework additions.
---

# NowStack Tools & Libraries

Use the tools already shipped by NowStack. Read the project's `package.json`
before choosing versions or adding dependencies; it is the version source of
truth.

## Canonical Stack

| Area | Tool | Use |
| --- | --- | --- |
| Application framework | [TanStack Start](https://tanstack.com/start) + [Vite](https://vite.dev/) | Full-stack React application and build tooling |
| UI | [React](https://react.dev/) | Components and rendering |
| Routing | [TanStack Router](https://tanstack.com/router) | Routes, loaders, guards, and typed search parameters |
| Backend and database | [Convex](https://www.convex.dev/) | Only application backend, database, realtime subscriptions, actions, and scheduled work |
| Authentication | [Better Auth](https://www.better-auth.com/) + [`@convex-dev/better-auth`](https://www.npmjs.com/package/@convex-dev/better-auth) | Authentication, OAuth, API keys, users, and organizations backed by Convex |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 | Styling and design tokens |
| Components | [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) | Accessible application components |
| Forms | [TanStack Form](https://tanstack.com/form) + [Zod](https://zod.dev/) v4 | Form state and validation |
| Server data | Convex React hooks | Realtime queries, mutations, actions, and optimistic updates |
| Client async state | [TanStack Query](https://tanstack.com/query) | Non-Convex asynchronous operations and imperative lifecycle state |
| Global UI state | [Zustand](https://zustand.docs.pmnd.rs/) | Shared client-only UI state |
| URL state | TanStack Router search parameters; [`nuqs`](https://nuqs.47ng.com/) where already integrated | Shareable, navigable state |
| Tables and charts | [TanStack Table](https://tanstack.com/table) + [Recharts](https://recharts.org/) | Data-heavy interfaces and charts |
| Animation | [Motion](https://motion.dev/) | Product motion and transitions |

## Product Services

| Need | Canonical tool | Notes |
| --- | --- | --- |
| Payments | [Stripe](https://stripe.com/) | Checkout, subscriptions, portal, and webhooks run through Convex actions and HTTP routes |
| Transactional email | [Resend](https://resend.com/) + [React Email](https://react.email/) | Templates and delivery through the Convex Resend component |
| File storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) + AWS S3 SDK | S3-compatible uploads; do not introduce a second file backend |
| Product analytics | [PostHog](https://posthog.com/) | Optional; enable only when the product requires analytics |
| Deployment | [Vercel](https://vercel.com/) + Convex | Deploy the TanStack app and its Convex backend explicitly |

## Quality Tooling

| Area | Tool |
| --- | --- |
| Unit and integration tests | Vitest, Testing Library, `happy-dom`, `convex-test` |
| End-to-end tests | Playwright |
| Type checking | TypeScript |
| Linting | ESLint |
| Formatting | Prettier + Tailwind CSS plugin |
| Unused-code checks | Knip |
| Browser verification | `dev-browser` |

Run repository scripts instead of inventing alternatives: `pnpm ts`,
`pnpm lint:ci`, `pnpm test:ci`, `pnpm test:e2e:ci`, `pnpm build`, and
`pnpm skills:metadata:check` when skill metadata changes.

## Local Toolchain

- Node and the exact pnpm version declared in `package.json`;
- Git and GitHub CLI for repository workflows;
- Convex through the project-local `pnpm exec convex` binary;
- Vercel CLI and Stripe CLI when those integrations are enabled;
- Cloudflare/Wrangler tooling only for R2 or Cloudflare operations;
- `dev-browser` with a connectable Chrome for browser proof.

Use `$ns-setup-tools` to diagnose machine prerequisites and
`$ns-setup-accounts` for service authentication. Specialized configuration
belongs to the matching `$ns-setup-*` skill.

## Architecture Rules

- NowStack is **TanStack Start + Convex**, not Next.js.
- Convex is the only application backend and database. Do not add Prisma,
  Drizzle, PostgreSQL, Neon, Supabase, Redis, or database mirroring.
- Use Convex React hooks for Convex data. Do not wrap subscriptions in TanStack
  Query or call Convex through raw `fetch` from React components.
- Use TanStack Router for routing and typed search parameters.
- Use TanStack Form with Zod v4 for new forms.
- Keep backend secrets in Convex environment variables. Keep only browser and
  application configuration in local or Vercel environment files.
- Fresh development setup uses local Convex by default. Preserve an existing
  cloud development deployment unless the user explicitly changes it.
- Add a dependency only when the existing stack cannot meet the requirement;
  explain the gap before introducing another framework or service.

## Decision Guide

| Decision | Choose |
| --- | --- |
| Persistent or realtime data | Convex query, mutation, or action |
| Background or scheduled work | Convex actions and scheduler |
| Authentication or organizations | Better Auth through Convex |
| Form state | TanStack Form |
| Validation | Zod v4 |
| Shared client-only state | Zustand |
| URL-visible state | TanStack Router search parameters |
| Non-Convex async lifecycle | TanStack Query |
| Payments | Stripe through Convex |
| Email | Resend + React Email through Convex |
| Uploads | Cloudflare R2 through the AWS S3-compatible SDK |
| Unit tests | Vitest + Testing Library |
| Browser journeys | Playwright and `dev-browser` |
