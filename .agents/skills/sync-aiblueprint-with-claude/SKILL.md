---
name: sync-aiblueprint-with-claude
description: Copy only NEW files from this repo's claude-code-config into ~/.claude. Use when asked to push new config files to Claude without overwriting existing ones.
allowed-tools: Bash(cp :*), Bash(diff :*), Bash(ls :*), Bash(cat :*), Bash(mkdir :*), Bash(find :*), Bash(date :*), Read, Write, Edit
---

Copy only files that exist in `$CWD/claude-code-config` and not in `~/.claude`. Copy each file individually. Never rsync, never overwrite, never delete target-only files.

Check `commands/`, `skills/`, `agents/`, `scripts/statusline/`, and `scripts/command-validator/`.

1. `diff -rq` each pair. Keep `Only in …claude-code-config`. Ignore target-only files and `Files … differ`.
2. `mkdir -p` then `cp` each new file. For scripts, copy `.ts` `.js` `.json` `.md`; skip `node_modules/`, `data/`, `*.db`, `*.log`.
3. Prepend those paths to `$CWD/claude-code-config/CHANGELOG.md`.

Report the copied paths. Do not commit.
