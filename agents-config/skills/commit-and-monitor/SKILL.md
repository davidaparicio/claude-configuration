---
name: commit-and-monitor
description: Commit, push, then monitor Vercel deployment and GitHub Actions until green. Auto-fixes failures and retries. Use when committing code that needs deployment verification, or when you want to ship and verify in one command.
argument-hint: "[commit message]"
allowed-tools: Bash(git :*), Bash(gh :*), Bash(vercel :*), Bash(npm :*), Bash(pnpm :*), Bash(bun :*), Bash(npx :*), Bash(sleep :*)
disable-model-invocation: true
user-invocable: true
---

Commit, push, then watch Vercel and GitHub Actions until green. Generate one message and ship immediately. If nothing is staged, `git add .`. If nothing to commit, stop.

1. Commit with `$ARGUMENTS` or `type(scope): brief description` (under 72 chars, imperative). Push, setting upstream if needed.
2. `vercel inspect <url> --wait --timeout 10m`. On error, read `--logs`, fix locally, recommit. After 10 minutes, warn.
3. `gh run watch <run-id> --exit-status`. On failure, `gh run view --log-failed`, fix, recommit.
4. Confirm Vercel Ready, Actions green, and PR checks if a PR exists. Report SHA, preview URL, Actions, and PR URL.

Each fix is its own commit (`fix(ci): …`). After 5 failed fix cycles, stop and report. Fix only what is broken. Do not use `@ts-ignore`, `eslint-disable`, skipped tests, or `--no-verify`.
