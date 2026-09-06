---
name: sync-with-claude
description: Sync files from ~/.claude into this repo's claude-code-config. Use when asked to sync Claude config, pull ~/.claude, or refresh the repository copy.
allowed-tools: Bash(cp :*), Bash(diff :*), Bash(ls :*), Bash(cat :*), Bash(mkdir :*), Bash(git status*), Bash(find :*), Bash(date :*), Bash(rsync :*), Bash(rm :*), Bash(bash :*), Bash(chmod :*), Bash(sed :*), Read, Write, Edit
---

Sync `~/.claude` → `$CWD/claude-code-config` for `commands/`, `skills/`, `agents/`, `scripts/`, and `settings.json`.

Read [do-not-copy.md](references/do-not-copy.md) and [do-not-change.md](references/do-not-change.md) first. Always exclude `node_modules/`, `data/`, `*.db`, `*.log`, `bun.lockb`, `.DS_Store`, and `melvyn/`.

1. Dry-run with `rsync -avn --delete` and the excludes in those refs. Diff `settings.json`.
2. Summarize added / updated / deleted. Wait for explicit approval.
3. Run the same rsync without `-n`. Copy `settings.json`. Then `bash $CWD/.claude/skills/sync-with-claude/scripts/after-sync.sh $CWD/claude-code-config/settings.json` to replace hardcoded `~/.claude` paths with `{CLAUDE_PATH}/`.
4. Show `git status`. Do not commit.

Preserve `commands/prompts/setup-tmux.md` and `scripts/.claude/`.
