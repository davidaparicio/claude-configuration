---
name: update-changelog
description: Auto-update the project changelog from git history. Analyzes commits, categorizes changes, and writes human-readable monthly changelog files.
argument-hint: "[month: YYYY-MM or 'current']"
---

Write `changelog/YYYY-MM.md` from git history. No arg or `current` → this month. `YYYY-MM` → that month. `all` → every month with commits (`git log --format="%ad" --date=format:"%Y-%m" | sort -u`).

For each month, read `git log --since=YYYY-MM-01 --until=next-month-01 --pretty=format:"%h|%ad|%s" --date=short --stat`. Group by date descending. Categorize Added / Changed / Removed / Renamed / Fixed. Skip noise. Fold related commits into one line. Bold the subject.

Only emit categories that have entries. Show the file. Do not commit.
