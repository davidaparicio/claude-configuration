---
name: dev-browser
description: Browser automation with persistent page state using the dev-browser CLI. Use when the user mentions browse, open website, click, fill form, screenshot, scrape, automate browser, test website, log into, navigate, web page, or any browser interaction.
allowed-tools:
  - Bash(dev-browser *)
  - Bash(/Applications/Helium.app/Contents/MacOS/Helium *)
---

Drive every browser task with the `dev-browser` CLI. Never use Cursor IDE Browser MCP (`cursor-ide-browser`, `browser_navigate`, `browser_snapshot`, `browser_lock`, `browser_click`, `browser_cdp`, or any `browser_*` tool).

If `dev-browser` is missing: obey the repo's package-manager rules (no `npm install -g` when npm is forbidden). In Codex, prefer the bundled Node/Playwright/Chromium runtime for page-load, screenshot, console, and interaction checks. Install the CLI only when npm is allowed and the task needs persistence or CDP the bundled runtime cannot provide: `npm install -g dev-browser && dev-browser install`. When falling back to Playwright, keep the same proof (URL, title, errors, screenshots, exact steps) and state that the CLI was unavailable.

Write one-thing scripts. Reuse named pages (`browser.getPage("main")`) across runs. End each script by logging JSON state. Commands, flags, Page methods, locators, screenshots, forms, and CDP connect: [api-reference.md](references/api-reference.md). Open that file before inventing a Page method.

File I/O is only `~/.dev-browser/tmp/`. Never pass absolute paths to `saveScreenshot` or `writeFile`; copy out from the returned tmp path.

Helium is not auto-discovered. Launch it with `--remote-debugging-port` and connect with `dev-browser --browser helium --connect http://127.0.0.1:<port>`. An already-running Helium without CDP cannot be attached; if it must not restart, use AppleScript or Computer Use.

On script failure, the page stays put. Reconnect, screenshot, log URL/title, then continue.
