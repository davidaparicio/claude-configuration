---
name: verify
description: Prove an implemented GitHub issue works through its real surface. Use when the user invokes $verify or reaches the Melvyn workflow proof gate.
disable-model-invocation: true
argument-hint: "<GitHub issue>"
---

Read the GitHub issue acceptance criteria and current diff. Treat verification as the completion gate.

## Persistent verification mode

Invoking `$verify` activates persistent verification mode for the rest of the current conversation. The user does not need to invoke `$verify` again.

For every subsequent user request that changes code, configuration, data, content, UI, or runtime behavior:

1. Treat the previous verification as stale immediately after the change.
2. Re-run the affected real user flow from a valid starting state.
3. Visually inspect every affected observable state.
4. Capture new screenshots for every affected visual step.
5. Show those new screenshots directly in that turn's final response.

Do this after every modification, including small follow-up edits and fixes requested after an earlier PASS. Never reuse screenshots or a PASS from a previous turn. Do not wait for the user to ask for verification again. Persistent verification mode ends only when the conversation ends or the user explicitly disables it.

For every criterion, exercise the real user-facing or authoritative runtime surface, capture current visible or mechanical evidence, inspect relevant errors and durable state, then mark it `PASS` or `NOT PROVEN`.

For every visual criterion and every observable visual step, capture a current screenshot and show it directly in the final response. Embed each local capture with Markdown image syntax and its absolute path, for example:

```markdown
![F01 — initial state](/absolute/path/F01-initial-state.png)
```

Do not output screenshot paths without rendering the images. Do not hide the screenshots behind a report, directory, link, or summary. A visual criterion is `NOT PROVEN` until its current screenshot is both captured and displayed to the user. If capture or rendering is unavailable, report `BLOCKED — NOT PROVEN` with the exact blocker.

Static checks alone are not runtime proof. A response to a subsequent implementation-changing request is incomplete until its fresh verification and screenshots have been delivered in the same turn.

Finish only when every criterion passes and every required screenshot appears directly in the final response, or report `BLOCKED — NOT PROVEN` with the exact blocker.
