#!/usr/bin/env node
/**
 * build-report.mjs — turn a verification manifest into a single self-contained HTML proof report.
 *
 * Usage:
 *   node build-report.mjs <manifest.json> [options]
 *
 * Options:
 *   --out <file>      Output path (default: <manifest dir>/report.html)
 *   --open            Open the report with the OS default handler after writing
 *   --link-images     Reference screenshots by relative path instead of inlining them
 *                     (smaller file, but only viewable next to the artifacts)
 *
 * No dependencies. Node 18+. Works from Codex, Claude Code, or a plain shell.
 */

import { execFile } from "node:child_process";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
};

const STATUS = {
  pass: { label: "PASS", tone: "ok" },
  fail: { label: "FAIL", tone: "bad" },
  "not proven": { label: "NOT PROVEN", tone: "bad" },
  blocked: { label: "BLOCKED", tone: "warn" },
  warn: { label: "WARN", tone: "warn" },
  ok: { label: "OK", tone: "ok" },
  skipped: { label: "SKIPPED", tone: "mute" },
  info: { label: "INFO", tone: "mute" },
};

function fail(message) {
  process.stderr.write(`build-report: ${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { manifest: null, out: null, open: false, linkImages: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--open") args.open = true;
    else if (arg === "--link-images") args.linkImages = true;
    else if (arg === "--out") args.out = argv[++i];
    else if (arg.startsWith("--")) fail(`unknown option ${arg}`);
    else if (!args.manifest) args.manifest = arg;
    else fail(`unexpected argument ${arg}`);
  }
  if (!args.manifest) fail("missing <manifest.json>. See the header of this file for usage.");
  return args;
}

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Minimal inline markdown: `code`, **bold**, links. Everything else stays literal. */
function rich(value) {
  return esc(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
}

function statusOf(raw, fallback = "info") {
  const key = String(raw ?? fallback).trim().toLowerCase();
  return STATUS[key] ?? { label: String(raw ?? fallback).toUpperCase(), tone: "mute" };
}

function toList(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Step `ac` accepts an array or a comma-separated string ("AC1,AC3") — normalize to ids. */
function acsOf(step) {
  return toList(step.ac)
    .flatMap((v) => String(v).split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

function resolveFrom(baseDir, file) {
  return isAbsolute(file) ? file : resolve(baseDir, file);
}

/** Intrinsic pixel size, so the browser reserves the right box and the page never reflows. */
function readSize(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

function imageSrc(absPath, outDir, linkImages) {
  const ext = absPath.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME[ext];
  if (!mime) return { ok: false, error: `unsupported image type: .${ext}` };
  try {
    statSync(absPath);
  } catch {
    return { ok: false, error: `missing file: ${absPath}` };
  }
  const buf = readFileSync(absPath);
  const size = readSize(buf);
  if (linkImages) {
    const rel = relative(outDir, absPath) || basename(absPath);
    return { ok: true, src: rel.split("/").map(encodeURIComponent).join("/"), size, lazy: true };
  }
  return { ok: true, src: `data:${mime};base64,${buf.toString("base64")}`, size, lazy: false };
}

const CSS = `
/* Flow-first: the screenshots and the step sequence ARE the page. Everything else is an annex.
   Tailwind-inspired tokens: slate (light) / zinc (dark). */
:root {
  color-scheme: light dark;
  --bg: #f8fafc; --panel: #ffffff; --sunken: #f1f5f9;
  --text: #0f172a; --muted: #64748b; --line: #e2e8f0;
  --ok: #15803d; --ok-bg: #f0fdf4; --ok-line: #bbf7d0;
  --bad: #b91c1c; --bad-bg: #fef2f2; --bad-line: #fecaca;
  --warn: #b45309; --warn-bg: #fffbeb; --warn-line: #fde68a;
  --mute-bg: #f1f5f9; --accent: #0f172a;
  --shadow-sm: 0 1px 2px 0 rgb(15 23 42 / .05);
  --shadow-lg: 0 10px 15px -3px rgb(15 23 42 / .10), 0 4px 6px -4px rgb(15 23 42 / .10);
}
:root[data-theme="dark"], html.dark {
  --bg: #09090b; --panel: #121214; --sunken: #1b1b1f;
  --text: #f4f4f5; --muted: #9f9fa8; --line: #27272a;
  --ok: #4ade80; --ok-bg: #0f2418; --ok-line: #1c5133;
  --bad: #f87171; --bad-bg: #2a1214; --bad-line: #5a2225;
  --warn: #fbbf24; --warn-bg: #2a1f08; --warn-line: #5c451a;
  --mute-bg: #1f1f23; --accent: #f4f4f5;
  --shadow-sm: none; --shadow-lg: none;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #09090b; --panel: #121214; --sunken: #1b1b1f;
    --text: #f4f4f5; --muted: #9f9fa8; --line: #27272a;
    --ok: #4ade80; --ok-bg: #0f2418; --ok-line: #1c5133;
    --bad: #f87171; --bad-bg: #2a1214; --bad-line: #5a2225;
    --warn: #fbbf24; --warn-bg: #2a1f08; --warn-line: #5c451a;
    --mute-bg: #1f1f23; --accent: #f4f4f5;
    --shadow-sm: none; --shadow-lg: none;
  }
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--text);
  font: 15px/1.6 ui-sans-serif, -apple-system, "Segoe UI", Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
body.vd-ok { border-top: 3px solid var(--ok); }
body.vd-bad { border-top: 3px solid var(--bad); }
body.vd-warn { border-top: 3px solid var(--warn); }
body.vd-mute { border-top: 3px solid var(--line); }
code, pre, .mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; }
a { color: inherit; }
/* ONE centered column for everything; identical left/right edges on every block. */
.container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
.spacer { flex: 1; }
.eyebrow { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
kbd {
  font: 500 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace; border: 1px solid var(--line);
  border-radius: 4px; padding: 2px 5px; background: var(--panel); color: var(--muted);
}

/* ---- Topbar: verdict + tally, always visible, nothing else. ---- */
.topbar { position: sticky; top: 0; z-index: 40; background: var(--bg); border-bottom: 1px solid var(--line); }
.topbar-in { display: flex; align-items: center; gap: 14px; padding: 10px 0; }
.topbar .eyebrow { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.health { font-size: 13px; color: var(--muted); white-space: nowrap; }
.health b { color: var(--text); font-weight: 600; }
.health .sep { opacity: .45; margin: 0 8px; }
@media (max-width: 640px) { .topbar .health { display: none; } }
.iconbtn {
  border: 1px solid var(--line); background: var(--panel); color: var(--muted); border-radius: 10px;
  width: 30px; height: 30px; font-size: 13px; cursor: pointer; display: grid; place-items: center;
  padding: 0; flex: 0 0 auto;
}
.iconbtn:hover { color: var(--text); border-color: var(--muted); }

.lead { padding: 30px 0 0; }
.claim {
  font-size: clamp(19px, 12px + .9vw, 25px); line-height: 1.4; font-weight: 650;
  letter-spacing: -.015em; margin: 0; max-width: 1000px;
}

/* ---- The flow: one step after another — title, one-line result, big capture. ---- */
.flow { padding: 30px 0 8px; display: grid; gap: 38px; }
.fstep { display: grid; grid-template-columns: 20px minmax(0, 1fr); gap: 0 16px; scroll-margin-top: 70px; }
.fcol { min-width: 0; }
.frail { position: relative; }
.fdot { position: absolute; top: 7px; left: 50%; transform: translateX(-50%); width: 9px; height: 9px; border-radius: 50%; background: currentColor; }
.frail::before { content: ""; position: absolute; top: 26px; bottom: -38px; left: 50%; transform: translateX(-50%); width: 2px; background: var(--line); }
.fstep:last-child .frail::before { display: none; }
.d-ok { color: var(--ok); } .d-bad { color: var(--bad); } .d-warn { color: var(--warn); } .d-mute { color: var(--muted); }
.fhead { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.fid { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 700; font-size: 12px; letter-spacing: .06em; color: var(--muted); }
.ftitle { font-size: 16.5px; font-weight: 650; letter-spacing: -.01em; }
.fobs { margin: 5px 0 0; font-size: 14px; color: var(--muted); max-width: 90ch; }
.fobs strong { color: var(--text); }
.fshot {
  margin: 14px 0 0; border: 1px solid var(--line); border-radius: 14px; overflow: hidden;
  background: var(--sunken); box-shadow: var(--shadow-sm); cursor: zoom-in;
  transition: box-shadow .15s, border-color .15s;
}
.fshot:hover { box-shadow: var(--shadow-lg); border-color: var(--muted); }
.fshot img { display: block; width: 100%; height: auto; max-height: 760px; object-fit: cover; object-position: top center; }
/* Non-visual steps: the raw evidence IS the capture. */
.fshot.fpre pre {
  margin: 0; padding: 18px 20px; font-size: 12px; line-height: 1.65; color: var(--muted);
  white-space: pre-wrap; word-break: break-word; max-height: 340px; overflow: hidden;
}
.fstep.f-bad .fshot { border-color: var(--bad-line); }
.fstep.f-warn .fshot { border-color: var(--warn-line); }
.fmore { margin-top: 10px; }
.fmore-in { padding: 12px 14px; border-top: 1px solid var(--line); display: grid; gap: 10px; }

.pill { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: .04em; border: 1px solid; white-space: nowrap; }
.verdict {
  display: inline-flex; align-items: center; gap: 7px; padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 600; letter-spacing: .04em; border: 1px solid; flex: 0 0 auto;
}
.verdict::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.tone-ok { color: var(--ok); background: var(--ok-bg); border-color: var(--ok-line); }
.tone-bad { color: var(--bad); background: var(--bad-bg); border-color: var(--bad-line); }
.tone-warn { color: var(--warn); background: var(--warn-bg); border-color: var(--warn-line); }
.tone-mute { color: var(--muted); background: var(--mute-bg); border-color: var(--line); }

.kv { display: grid; grid-template-columns: 96px 1fr; gap: 14px; font-size: 14px; }
.kv > span:first-child { color: var(--muted); font-size: 12px; padding-top: 1px; }
@media (max-width: 620px) { .kv { grid-template-columns: 1fr; gap: 2px; } }
.missing { padding: 14px; font-size: 13px; color: var(--bad); background: var(--bad-bg); border: 1px solid var(--bad-line); border-radius: 10px; }
details { border: 1px solid var(--line); border-radius: 10px; background: var(--sunken); position: relative; }
summary { cursor: pointer; padding: 9px 13px; font-size: 12.5px; font-weight: 500; list-style: none; color: var(--muted); }
summary:hover { color: var(--text); }
summary::-webkit-details-marker { display: none; }
summary::before { content: "▸ "; color: var(--muted); }
details[open] summary::before { content: "▾ "; }
details pre { margin: 0; padding: 13px; border-top: 1px solid var(--line); overflow-x: auto; font-size: 12.5px; line-height: 1.55; white-space: pre; }
.copy {
  position: absolute; top: 6px; right: 7px; border: 1px solid var(--line); background: var(--panel); color: var(--muted);
  border-radius: 6px; font: inherit; font-size: 11px; padding: 2px 7px; cursor: pointer; opacity: 0; transition: opacity .12s;
}
details:hover > .copy, .copy:focus-visible { opacity: 1; }

/* ---- Annex: everything that is not the flow, collapsed. ---- */
.annex { padding: 30px 0 0; display: grid; gap: 10px; }
.annex > details { background: var(--panel); box-shadow: var(--shadow-sm); border-radius: 12px; }
.annex > details > summary { font-size: 13px; font-weight: 600; padding: 12px 16px; color: var(--text); }
.annex-in { padding: 14px 16px; border-top: 1px solid var(--line); display: grid; gap: 12px; }

.meta { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); overflow: hidden; margin: 0; }
.meta div { display: grid; grid-template-columns: 190px 1fr; gap: 16px; padding: 11px 16px; border-top: 1px solid var(--line); font-size: 14px; }
.meta div:first-child { border-top: 0; }
.meta dt { color: var(--muted); margin: 0; }
.meta dd { margin: 0; word-break: break-word; }
@media (max-width: 620px) { .meta div { grid-template-columns: 1fr; gap: 2px; } }
.scroll-x { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; background: var(--panel); }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 620px; }
th, td { text-align: left; padding: 11px 14px; border-bottom: 1px solid var(--line); vertical-align: top; }
tbody tr:last-child td { border-bottom: 0; }
th { font-size: 11px; letter-spacing: .07em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
tbody tr:hover { background: var(--sunken); }
td.id a { text-decoration: none; font-weight: 600; }
.checks { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); overflow: hidden; }
.check { display: flex; gap: 14px; align-items: baseline; padding: 12px 16px; border-top: 1px solid var(--line); font-size: 14px; }
.check:first-child { border-top: 0; }
.check-label { width: 190px; flex: 0 0 auto; color: var(--muted); font-size: 13px; }
@media (max-width: 620px) { .check { flex-direction: column; gap: 4px; } .check-label { width: auto; } }
ul.notes { margin: 0; padding-left: 20px; font-size: 14px; }
ul.notes li { margin-bottom: 7px; max-width: 88ch; }
.analysis { display: grid; gap: 12px; }
.acard { border: 1px solid var(--line); border-radius: 12px; background: var(--panel); padding: 16px 18px; }
.acard h3 { margin: 0; font-size: 14.5px; font-weight: 600; letter-spacing: -.01em; }
.acard p { margin: 9px 0 0; font-size: 14px; max-width: 88ch; }
.acard-refs { margin-top: 10px; font-size: 12px; color: var(--muted); }
.acard-refs a { text-decoration: none; font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.cmds { display: grid; gap: 10px; }
.cmds summary a { color: var(--muted); font-weight: 400; }
.gate-line { margin-top: 30px; padding: 18px 32px 64px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); }
.gate-line b { color: var(--text); }

/* ---- Inspector: the capture next to what it is supposed to prove. ---- */
#v { position: fixed; inset: 0; z-index: 60; display: none; grid-template-rows: auto 1fr; background: #0a0b0d; }
#v.on { display: grid; }
.v-top { display: flex; align-items: center; gap: 11px; padding: 9px 12px; color: #e8eaed; border-bottom: 1px solid rgba(255,255,255,.1); font-size: 13.5px; }
.v-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 700; letter-spacing: .05em; font-size: 12.5px; }
.v-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.v-ac { color: #8b93a0; font-size: 11.5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.v-spacer { flex: 1; }
.v-keys { color: #6f7783; font-size: 11.5px; white-space: nowrap; }
.v-keys kbd { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.14); color: #b9c0c9; }
.v-count { color: #8b93a0; font-size: 12px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.v-btn {
  border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.05); color: #e8eaed; border-radius: 7px;
  width: 28px; height: 28px; display: grid; place-items: center; cursor: pointer; font: inherit; font-size: 14px; padding: 0;
}
.v-btn:hover { background: rgba(255,255,255,.12); }
.v-btn:disabled { opacity: .3; cursor: default; }
.v-body { display: grid; grid-template-columns: 1fr 420px; min-height: 0; }
.v-body.solo { grid-template-columns: 1fr; }
.v-body.solo .v-panel { display: none; }
.v-stage { overflow: auto; display: grid; place-items: center; padding: 14px; }
.v-stage img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; cursor: zoom-in; }
.v-stage img.full { max-width: none; max-height: none; cursor: zoom-out; }
.v-none { color: #8b93a0; font-size: 13px; }
.v-pre { color: #dfe3e8; font-size: 12.5px; line-height: 1.65; white-space: pre-wrap; word-break: break-word; max-width: 880px; padding: 10px; }
.v-panel {
  border-left: 1px solid rgba(255,255,255,.1); overflow: auto; padding: 16px; color: #dfe3e8;
  background: rgba(255,255,255,.02); display: flex; flex-direction: column; gap: 12px;
}
.v-panel .fobs { color: #dfe3e8; margin: 0; }
.v-panel .kv { grid-template-columns: 82px 1fr; gap: 10px; font-size: 13px; }
.v-panel .kv > span:first-child { color: #858d99; }
.v-panel code { background: rgba(255,255,255,.08); border-radius: 4px; padding: 1px 4px; }
.v-panel details { background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.11); }
.v-panel summary { color: #cdd3da; }
.v-panel pre { color: #dfe3e8; border-color: rgba(255,255,255,.11); }
.v-panel a { color: #93c5fd; }
@media (max-width: 900px) {
  .v-body { grid-template-columns: 1fr; grid-template-rows: 1fr auto; }
  .v-panel { border-left: 0; border-top: 1px solid rgba(255,255,255,.1); max-height: 42%; }
  .v-keys { display: none; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
@media print {
  body { background: #fff; }
  #v, .copy, .iconbtn { display: none !important; }
  .topbar { position: static; }
  .fshot, .acard, .meta, .checks { break-inside: avoid; }
  details { border: 0; } details[open] pre { border-top: 1px solid var(--line); }
}
`;

const JS = `
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---- Theme. The stylesheet already honours data-theme; this just lets the reader override the OS. ---- */
  var themeBtn = $("#theme");
  function isDark() {
    var set = root.getAttribute("data-theme");
    return set ? set === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  try { var saved = localStorage.getItem("verify-theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("verify-theme", next); } catch (e) {}
  });

  /* ---- Inspector: the capture full size, next to the claim it backs. Walks the whole flow. ---- */
  var stepsEls = $$(".fstep");
  var v = $("#v"), vBody = $("#v-body"), vStage = $("#v-stage"), vPanel = $("#v-panel");
  var index = -1, zoomed = false;
  /* file:// rejects replaceState with a URL argument, hence the location.replace fallback. */
  function setHash(h) {
    if (location.hash === h) return;
    try { history.replaceState(null, "", h || location.pathname + location.search); }
    catch (e) { try { location.replace(h || "#"); } catch (e2) {} }
  }
  function open(i) {
    if (i < 0 || i >= stepsEls.length) return;
    index = i; zoomed = false;
    var el = stepsEls[i], id = el.id;
    $("#v-id").textContent = id;
    $("#v-title").textContent = el.getAttribute("data-title") || "";
    $("#v-ac").textContent = el.getAttribute("data-ac") || "";
    $("#v-count").textContent = (i + 1) + " / " + stepsEls.length;
    var pill = $("#v-status");
    pill.className = "pill tone-" + el.getAttribute("data-tone");
    pill.textContent = el.getAttribute("data-label");
    $("#v-prev").disabled = i === 0;
    $("#v-next").disabled = i === stepsEls.length - 1;

    vStage.innerHTML = "";
    var img = el.querySelector(".fshot img");
    var pre = el.querySelector(".fshot pre");
    if (img) {
      var big = document.createElement("img");
      big.alt = id;
      big.src = img.getAttribute("src");
      big.addEventListener("click", function (e) { toggleZoom(big, e); });
      vStage.appendChild(big);
    } else if (pre) {
      var block = pre.cloneNode(true);
      block.className = "v-pre";
      vStage.appendChild(block);
    } else {
      var none = document.createElement("div");
      none.className = "v-none";
      none.textContent = "No capture for this step — raw evidence only.";
      vStage.appendChild(none);
    }

    /* The panel clones the step's own text, so there is one copy of every fact in the page. */
    vPanel.innerHTML = "";
    var obs = el.querySelector(".fobs");
    if (obs) vPanel.appendChild(obs.cloneNode(true));
    var more = el.querySelector(".fmore-in");
    if (more) $$(":scope > *", more).forEach(function (node) {
      var clone = node.cloneNode(true);
      if (clone.tagName === "DETAILS") clone.open = true;
      vPanel.appendChild(clone);
    });
    wireCopy(vPanel);

    v.classList.add("on");
    v.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setHash("#v-" + id);
  }
  function close() {
    v.classList.remove("on");
    v.setAttribute("aria-hidden", "true");
    vStage.innerHTML = "";
    vPanel.innerHTML = "";
    document.body.style.overflow = "";
    index = -1;
    setHash("");
  }
  /* Click to jump between fit-to-screen and 1:1, keeping the clicked point under the cursor. */
  function toggleZoom(img, e) {
    var stage = vStage;
    if (!zoomed) {
      var r = img.getBoundingClientRect();
      var rx = (e.clientX - r.left) / r.width, ry = (e.clientY - r.top) / r.height;
      img.classList.add("full");
      img.style.width = img.naturalWidth + "px";
      zoomed = true;
      stage.scrollLeft = rx * img.offsetWidth - stage.clientWidth / 2;
      stage.scrollTop = ry * img.offsetHeight - stage.clientHeight / 2;
    } else {
      img.classList.remove("full");
      img.style.width = "";
      zoomed = false;
    }
  }
  stepsEls.forEach(function (el, i) {
    var trigger = el.querySelector(".fshot");
    if (trigger) trigger.addEventListener("click", function () { open(i); });
  });
  $("#v-close").addEventListener("click", close);
  $("#v-prev").addEventListener("click", function () { open(index - 1); });
  $("#v-next").addEventListener("click", function () { open(index + 1); });
  $("#v-info").addEventListener("click", function () { vBody.classList.toggle("solo"); });
  if (innerWidth < 900) vBody.classList.add("solo");

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (typing) return;
    if (index > -1) {
      if (e.key === "Escape") { close(); e.preventDefault(); }
      else if (e.key === "ArrowRight" || e.key === "j" || e.key === " ") { open(index + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "k") { open(index - 1); e.preventDefault(); }
      else if (e.key === "Home") { open(0); e.preventDefault(); }
      else if (e.key === "End") { open(stepsEls.length - 1); e.preventDefault(); }
      else if (e.key === "i") { vBody.classList.toggle("solo"); e.preventDefault(); }
    }
  });

  /* ---- Raw evidence is meant to be pasted into a terminal or a ticket. ---- */
  function wireCopy(scope) {
    $$("details", scope).forEach(function (d) {
      if (d.querySelector(".copy")) return;
      var pre = d.querySelector(":scope > pre");
      if (!pre) return;
      var b = document.createElement("button");
      b.className = "copy"; b.type = "button"; b.textContent = "copy";
      b.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        var done = function () { b.textContent = "copied"; setTimeout(function () { b.textContent = "copy"; }, 1200); };
        if (navigator.clipboard) navigator.clipboard.writeText(pre.textContent).then(done, fallback);
        else fallback();
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = pre.textContent; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); done(); } catch (err) {}
          ta.remove();
        }
      });
      d.appendChild(b);
    });
  }
  wireCopy(document);

  /* A report link can point at one step: #v-F04 opens it in the inspector. */
  if (location.hash.indexOf("#v-") === 0) {
    var want = location.hash.slice(3);
    var at = -1;
    stepsEls.forEach(function (el, i) { if (el.id === want) at = i; });
    if (at > -1) open(at);
  }
})();
`;

function renderEvidence(entries) {
  return toList(entries)
    .map((entry) => {
      const label = entry.label ?? "Raw evidence";
      const text = entry.text ?? entry.output ?? entry.content ?? "";
      const suffix = entry.exitCode === undefined ? "" : ` — exit ${entry.exitCode}`;
      return `<details${entry.open ? " open" : ""}><summary>${esc(label)}${esc(suffix)}</summary><pre>${esc(text)}</pre></details>`;
    })
    .join("\n");
}

/** `analysis`: [{ title, body, steps: ["F04"] }] — body is a string (blank line = paragraph) or an array of paragraphs. */
function renderAnalysis(entries) {
  const cards = toList(entries)
    .filter((a) => a && (a.body ?? a.text))
    .map((a) => {
      const paras = toList(a.body ?? a.text)
        .flatMap((block) => String(block).split(/\n{2,}/))
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${rich(p).replace(/\n/g, "<br>")}</p>`)
        .join("\n");
      const refs = toList(a.steps)
        .map((id) => `<a href="#${esc(id)}">${esc(id)}</a>`)
        .join(", ");
      return `<article class="acard">
  <h3>${esc(a.title ?? "Analysis")}</h3>
  ${paras}
  ${refs ? `<div class="acard-refs">Evidence: ${refs}</div>` : ""}
</article>`;
    });
  return cards.length ? `<div class="analysis">${cards.join("\n")}</div>` : "";
}

/** `commands`: [{ label, command, url? }] — how the reader launches the app and reopens this report. */
function renderCommands(entries) {
  const blocks = toList(entries)
    .filter((c) => c && c.command)
    .map((c) => {
      const url = c.url ? ` · <a href="${esc(c.url)}" rel="noreferrer">${esc(c.url)}</a>` : "";
      return `<details open><summary>${esc(c.label ?? "Command")}${url}</summary><pre>${esc(c.command)}</pre></details>`;
    });
  return blocks.length ? `<div class="cmds">${blocks.join("\n")}</div>` : "";
}

function renderFlowStep(step, shot) {
  const st = statusOf(step.status);
  const acs = acsOf(step).join(", ");
  const kvRows = [
    ["Action", step.action],
    ["Expected", step.expected],
    ["Where", step.route ?? step.url ?? step.command],
    ["When", step.timestamp],
    ["Criteria", acs],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `<div class="kv"><span>${esc(key)}</span><span>${rich(value)}</span></div>`)
    .join("\n");

  let visual = "";
  if (step.screenshot) {
    if (shot.ok) {
      const dims = shot.size ? ` width="${shot.size.w}" height="${shot.size.h}"` : "";
      const lazy = shot.lazy ? ' loading="lazy"' : "";
      visual = `<figure class="fshot" title="Click to inspect"><img src="${shot.src}"${dims}${lazy} alt="${esc(step.id)} — ${esc(step.title ?? "")}"></figure>`;
    } else {
      visual = `<p class="missing">Screenshot unavailable — ${esc(shot.error)}</p>`;
    }
  } else {
    /* No capture: the raw evidence (or observed result) is the visual. */
    const ev = toList(step.evidence)[0];
    const preview = String(ev?.text ?? ev?.output ?? ev?.content ?? step.observed ?? "").slice(0, 1400);
    if (preview) visual = `<figure class="fshot fpre" title="Click to inspect"><pre>${esc(preview)}</pre></figure>`;
  }

  const evidence = renderEvidence(step.evidence);
  /* PASS is the expected state and stays quiet (green dot); anything else is flagged loudly. */
  const flag = st.tone === "ok" ? "" : `<span class="pill tone-${st.tone}">${esc(st.label)}</span>`;
  const more =
    kvRows || evidence
      ? `<details class="fmore"><summary>Details — action, expected, raw evidence</summary><div class="fmore-in">${kvRows}\n${evidence}</div></details>`
      : "";

  return `<article class="fstep${st.tone === "ok" ? "" : " f-" + st.tone}" id="${esc(step.id)}" data-title="${esc(step.title ?? "")}" data-ac="${esc(acs)}" data-tone="${st.tone}" data-label="${esc(st.label)}">
  <div class="frail"><i class="fdot d-${st.tone}"></i></div>
  <div class="fcol">
    <div class="fhead"><span class="fid">${esc(step.id)}</span><span class="ftitle">${esc(step.title ?? "")}</span>${flag}</div>
    ${step.observed ? `<p class="fobs">${rich(step.observed)}</p>` : ""}
    ${visual}
    ${more}
  </div>
</article>`;
}

function build(manifest, ctx) {
  const steps = toList(manifest.steps);
  const shots = steps.map((step) =>
    step.screenshot
      ? imageSrc(resolveFrom(ctx.baseDir, step.screenshot), ctx.outDir, ctx.linkImages)
      : { ok: false, error: "no screenshot" },
  );

  const verdict = statusOf(manifest.verdict, "not proven");
  const counts = steps.reduce((acc, step) => {
    const key = statusOf(step.status).label;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const passCount = counts.PASS ?? 0;
  const allCriteria = toList(manifest.acceptanceCriteria);
  const coveredCount = allCriteria.filter((ac) => {
    const id = typeof ac === "string" ? "" : ac.id;
    return steps.some((step) => acsOf(step).includes(id));
  }).length;
  const tally = [
    `<b>${passCount}/${steps.length}</b> steps PASS`,
    allCriteria.length ? `<b>${coveredCount}/${allCriteria.length}</b> criteria` : "",
  ]
    .filter(Boolean)
    .join('<span class="sep">·</span>');

  const flow = steps.map((step, i) => renderFlowStep(step, shots[i])).join("\n");

  const metaRows = Object.entries(manifest.environment ?? {})
    .map(([key, value]) => `<div><dt>${esc(key)}</dt><dd>${rich(value)}</dd></div>`)
    .join("\n");

  const coverage = allCriteria.length
    ? `<div class="scroll-x"><table>
<thead><tr><th style="width:70px">ID</th><th>Criterion</th><th style="width:220px">Proven by</th></tr></thead>
<tbody>${allCriteria
        .map((ac) => {
          const id = typeof ac === "string" ? "" : ac.id;
          const text = typeof ac === "string" ? ac : ac.text;
          const covering = steps.filter((step) => acsOf(step).includes(id)).map((step) => step.id);
          const tone = covering.length ? "" : ' class="pill tone-bad"';
          return `<tr><td class="mono">${esc(id)}</td><td>${rich(text)}</td><td class="mono" style="font-size:12px"><span${tone}>${esc(covering.join(", ") || "UNCOVERED")}</span></td></tr>`;
        })
        .join("\n")}</tbody></table></div>`
    : "";

  const matrix = steps.length
    ? `<div class="scroll-x"><table>
<thead><tr><th style="width:60px">Step</th><th style="width:80px">AC</th><th>Action</th><th>Observed result</th><th style="width:170px">Evidence</th><th style="width:110px">Status</th></tr></thead>
<tbody>${steps
        .map((step) => {
          const st = statusOf(step.status);
          return `<tr>
  <td class="id"><a href="#${esc(step.id)}">${esc(step.id)}</a></td>
  <td>${esc(acsOf(step).join(", "))}</td>
  <td>${rich(step.action ?? step.title ?? "")}</td>
  <td>${rich(step.observed ?? "")}</td>
  <td class="mono" style="font-size:12px">${esc(step.screenshot ? basename(step.screenshot) : "—")}</td>
  <td><span class="pill tone-${st.tone}">${esc(st.label)}</span></td>
</tr>`;
        })
        .join("\n")}</tbody></table></div>`
    : "";

  const checks = toList(manifest.runtimeChecks);
  const checksHtml = checks.length
    ? `<div class="checks">${checks
        .map((check) => {
          const st = statusOf(check.status, "info");
          return `<div class="check"><span class="check-label">${esc(check.label)}</span><span class="pill tone-${st.tone}">${esc(st.label)}</span><span>${rich(check.detail ?? "")}</span></div>`;
        })
        .join("\n")}</div>`
    : "";

  const notes = toList(manifest.notes);
  const notesHtml = notes.length ? `<ul class="notes">${notes.map((n) => `<li>${rich(n)}</li>`).join("")}</ul>` : "";

  const commandsHtml = renderCommands(manifest.commands);
  const analysisHtml = renderAnalysis(manifest.analysis);
  const badChecks = checks.filter((c) => statusOf(c.status, "info").tone !== "ok").length;

  /* The flow is the page; everything else is an annex, collapsed by default. */
  const annex = [
    ["Run it yourself", commandsHtml, true],
    ["Analysis — why it works, what was found", analysisHtml, false],
    ["Environment", metaRows ? `<dl class="meta">${metaRows}</dl>` : "", false],
    [allCriteria.length ? `Acceptance criteria — ${coveredCount}/${allCriteria.length} covered` : "", coverage, false],
    ["Proof matrix", matrix, false],
    [checks.length ? `Runtime checks — ${badChecks ? `${badChecks} flagged` : "all ok"}` : "", checksHtml, false],
    ["Notes", notesHtml, false],
  ]
    .filter(([label, html]) => label && html)
    .map(([label, html, isOpen]) => `<details${isOpen ? " open" : ""}><summary>${esc(label)}</summary><div class="annex-in">${html}</div></details>`)
    .join("\n");

  const title = manifest.title ?? "Proof of Functionality";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — ${esc(verdict.label)}</title>
<style>${CSS}</style>
</head>
<body class="vd-${verdict.tone}">
<header class="topbar">
  <div class="container topbar-in">
    <span class="verdict tone-${verdict.tone}">${esc(verdict.label)}</span>
    <span class="eyebrow">${esc(title)}</span>
    <span class="spacer"></span>
    <span class="health">${tally}</span>
    <button type="button" class="iconbtn" id="theme" title="Light / dark" aria-label="Toggle light or dark theme"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.8a6.2 6.2 0 000 12.4z" fill="currentColor"/></svg></button>
  </div>
</header>

<div class="container lead">
  <h1 class="claim">${esc(manifest.claim ?? "")}</h1>
</div>

<main class="container flow">
${flow}
</main>

<div class="container annex">
${annex}
</div>

<div class="gate-line container">
  Proof gate: every criterion covered AND every step PASS AND every artifact current AND no invalidating error — <b>${esc(verdict.label)}</b>
  · Generated ${esc(ctx.generatedAt)}${manifest.artifactsDir ? ` · artifacts: <span class="mono">${esc(manifest.artifactsDir)}</span>` : ""}
</div>

<div id="v" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Step inspector">
  <div class="v-top">
    <button type="button" class="v-btn" id="v-close" title="Close (Esc)" aria-label="Close inspector">×</button>
    <span class="v-id" id="v-id"></span>
    <span class="v-title" id="v-title"></span>
    <span class="v-ac" id="v-ac"></span>
    <span class="pill" id="v-status"></span>
    <span class="v-spacer"></span>
    <span class="v-keys"><kbd>←</kbd><kbd>→</kbd> steps · <kbd>click</kbd> 1:1 · <kbd>i</kbd> details · <kbd>esc</kbd> close</span>
    <span class="v-count" id="v-count"></span>
    <button type="button" class="v-btn" id="v-prev" title="Previous step (←)" aria-label="Previous step">‹</button>
    <button type="button" class="v-btn" id="v-next" title="Next step (→)" aria-label="Next step">›</button>
    <button type="button" class="v-btn" id="v-info" title="Toggle details (i)" aria-label="Toggle details panel">☰</button>
  </div>
  <div class="v-body" id="v-body">
    <div class="v-stage" id="v-stage"></div>
    <aside class="v-panel" id="v-panel"></aside>
  </div>
</div>
<script>${JS}</script>
</body>
</html>
`;
}

function openFile(file) {
  const [cmd, args] =
    process.platform === "darwin"
      ? ["open", [file]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", file]]
        : ["xdg-open", [file]];
  execFile(cmd, args, (error) => {
    if (error) process.stderr.write(`build-report: could not open automatically (${error.message})\n`);
  });
}

const args = parseArgs(process.argv.slice(2));
const manifestPath = resolve(args.manifest);
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail(`cannot read manifest ${manifestPath} — ${error.message}`);
}

const baseDir = manifest.artifactsDir
  ? resolveFrom(dirname(manifestPath), manifest.artifactsDir)
  : dirname(manifestPath);
const outPath = resolve(args.out ?? resolve(dirname(manifestPath), "report.html"));

const html = build(manifest, {
  baseDir,
  outDir: dirname(outPath),
  linkImages: args.linkImages,
  generatedAt: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
});

writeFileSync(outPath, html, "utf8");

const missing = toList(manifest.steps)
  .filter((step) => step.screenshot)
  .map((step) => resolveFrom(baseDir, step.screenshot))
  .filter((file) => {
    try {
      statSync(file);
      return false;
    } catch {
      return true;
    }
  });

const sizeMb = (statSync(outPath).size / 1024 / 1024).toFixed(2);
process.stdout.write(`report: ${outPath}\nsize: ${sizeMb} MB\nsteps: ${toList(manifest.steps).length}\nverdict: ${manifest.verdict ?? "NOT PROVEN"}\n`);
if (!toList(manifest.analysis).length) {
  process.stdout.write(`note: manifest has no "analysis" — the reflection section is missing (see reference/report-manifest.md)\n`);
}
if (!toList(manifest.commands).length) {
  process.stdout.write(`note: manifest has no "commands" — the report cannot tell the reader how to launch the app or reopen it\n`);
}
if (missing.length) {
  process.stdout.write(`MISSING ARTIFACTS (${missing.length}):\n${missing.map((f) => `  ${f}`).join("\n")}\n`);
}
if (args.open) openFile(outPath);
process.exit(missing.length ? 2 : 0);
