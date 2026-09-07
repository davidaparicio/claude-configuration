---
name: use-delegate
description: "Delegation mode: the host agent (Claude or Codex) plans and reviews while heavy work runs on cheap executors: OpenCode Kimi K3, Codex GPT-5.6 terra/sol. Use when the user invokes /use-delegate, says 'use delegate', 'delegate mode', 'orchestrator mode', or wants to save tokens/rate limits."
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
  opencode/slash: "true"
user-invocable: true
---

The host plans and judges. Everything token-hungry runs on an executor and reports back. Direct host edits are limited to a trivial one-liner cheaper than a prompt.

| Executor | Command | Use for |
|---|---|---|
| OpenCode · Kimi K3 | `opencode run "<prompt>" -m kimi-for-coding/k3` | Default implementation, refactors, tests, bulk edits |
| Codex · GPT-5.6 terra | `codex exec -m gpt-5.6-terra "<prompt>"` | Mechanical edits, scripts, log triage |
| Codex · GPT-5.6 sol | `codex exec "<prompt>"` | Hard bugs, migrations, computer use / UI verification |
| Host-native subagents | Claude `Agent` / Codex collab | Exploration summaries; taste-sensitive work |

Read-only: `codex exec -s read-only`, `opencode run --agent plan`. Rankings and pricing: [models.md](references/models.md); refresh if `Last verified` is older than 14 days.

Always end CLIs with `< /dev/null` and run in background. Codex: `--output-last-message <scratchpad>/codex-<task>.md`. OpenCode: log to `<scratchpad>/oc-<task>.log`. Parallelize independent tasks.

1. Think from summaries, not a full-tree read.
2. Write a self-contained spec: files, goal, constraints, done criteria, report shape.
3. Delegate in parallel. Verify by delegating too. Judge the report and the diff.
4. Misses the bar → refine the spec and re-delegate. Escalate terra → Kimi K3 → sol → host only when the cheaper tier keeps failing.

If no delegation path works, say so and ask before falling back to direct execution.
