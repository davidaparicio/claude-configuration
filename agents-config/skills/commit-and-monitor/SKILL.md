---
name: commit-and-monitor
description: Commit, push, then monitor CI and the project's deploy until green. Auto-fixes failures and retries. Use when committing code that needs deployment verification, or when you want to ship and verify in one command.
argument-hint: "[commit message]"
allowed-tools: Bash(git :*), Bash(gh :*), Bash(npm :*), Bash(pnpm :*), Bash(bun :*), Bash(npx :*), Bash(sleep :*)
disable-model-invocation: true
user-invocable: true
---

Commit, push, then watch CI and the project's deploy until green. Generate one message and ship immediately. If nothing is staged, `git add .`. If nothing to commit, stop.

1. Commit with `$ARGUMENTS` or `type(scope): brief description` (under 72 chars, imperative). Push, setting upstream if needed.
2. Detect the repo's CI and deploy from project config, remotes, recent runs, and existing CLIs. Do not assume a vendor.
3. Watch CI until green (`gh run watch`, `gh pr checks`, or the repo's CI CLI). On failure, read the failed logs, fix locally, recommit. After 10 minutes, warn.
4. Watch the deploy until ready (GitHub deployment status or the project's deploy CLI). On error, read deploy logs, fix, recommit.
5. Confirm CI green, deploy ready, and PR checks if a PR exists. Report SHA, preview/deploy URL, CI, and PR URL.

Each fix is its own commit (`fix(ci): …`). After 5 failed fix cycles, stop and report. Fix only what is broken. Do not use `@ts-ignore`, `eslint-disable`, skipped tests, or `--no-verify`.
