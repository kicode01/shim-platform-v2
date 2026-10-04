// Self-contained QA runner: boots a headless Chrome child process, waits for
// the debug port, runs the crawl, then kills Chrome. Avoids the problem of
// Chrome being tied to the lifetime of an interactive shell.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-profile3";
const BASE = "http://localhost:3100";
const OUT = "C:/temp/qa";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

const PAGES = JSON.parse(process.argv[2] || "[]");

// Optional auth: pass a curl cookie-jar path as argv[3] to load the session
// token into the browser before crawling protected pages.
function readSessionToken(jarPath) {
  try {
    const txt = fs.readFileSync(jarPath, "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const parts = line.split("\t");
      if (parts.length >= 7 && parts[5] === "next-auth.session-token") return parts[6].trim();
    }
  } catch (e) {}
  return null;
}

function get(path) {
  return new Promise((res, rej) => {
    const req = http.get({ host: "127.0.0.1", port: 9222, path, timeout: 2000 }, (r) => {
      let d = ""; r.on("data", c => (d += c)); r.on("end", () => res(JSON.parse(d)));
    });
    req.on("error", rej);
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
  });
}

async function waitForPort(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { return await get("/json/version"); } catch (e) { await new Promise(r => setTimeout(r, 700)); }
  }
  throw new Error("Chrome debug port never came up");
}

async function main() {
  const chrome = spawn(CHROME, [
    "--remote-debugging-port=9222",
    `--user-data-dir=${PROFILE}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--headless=new",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "about:blank",
  ], { stdio: "ignore", detached: false });

  process.on("exit", () => { try { chrome.kill(); } catch (e) {} });

  const ver = await waitForPort();
  console.log("chrome:", ver.Browser);

  const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const pend = new Map();
  let consoleErrors = [];
  let netFailures = [];
  let curr = "";

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pend.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
    });

  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pend.has(m.id)) {
      const p = pend.get(m.id);
      pend.delete(m.id);
      m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
      return;
    }
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      const text = (m.params.args || []).map(a => a.value ?? a.description ?? a.type).join(" ");
      consoleErrors.push({ page: curr, type: m.params.type, text: text.slice(0, 300) });
    }
    if (m.method === "Runtime.exceptionThrown") {
      const d = m.params.exceptionDetails || {};
      consoleErrors.push({ page: curr, type: "exception", text: (d.exception?.description || d.text || "").slice(0, 400) });
    }
    if (m.method === "Network.loadingFailed" && !/favicon/.test(m.params.errorText)) {
      netFailures.push({ page: curr, err: m.params.errorText, type: m.params.type });
    }
  });

  await new Promise(r => ws.on("open", r));
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable");
  await S("Runtime.enable");
  await S("Network.enable");
  await S("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  const jar = process.argv[3];
  if (jar) {
    const token = readSessionToken(jar);
    if (token) {
      await S("Network.setCookie", { name: "next-auth.session-token", value: token, domain: "localhost", path: "/", httpOnly: true });
      console.log("auth: session token loaded from", jar);
    } else {
      console.log("auth: NO TOKEN FOUND in", jar);
    }
  }

  const report = [];
  for (const p of PAGES) {
    curr = p.url;
    consoleErrors = [];
    netFailures = [];
    await S("Page.navigate", { url: BASE + p.url });
    await new Promise(r => setTimeout(r, p.wait || 5000));

    const probe = await S("Runtime.evaluate", {
      expression: `(() => {
        const q = (s) => Array.from(document.querySelectorAll(s));
        const links = q('a[href]').map(a => ({ text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0,60), href: a.getAttribute('href') })).filter(l => l.text || l.href);
        const buttons = q('button').map(b => ({ text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().slice(0,60), type: b.type, disabled: b.disabled }));
        const forms = q('form').map(f => ({ action: f.getAttribute('action') || '(js)', method: f.method, inputs: q('form input, form select, form textarea').length }));
        return JSON.stringify({ title: document.title, h1: (document.querySelector('h1')?.innerText || '').trim().slice(0,80), bodyLen: document.body ? document.body.innerText.length : 0, links, buttons, forms, url: location.href });
      })()`,
      returnByValue: true,
    });

    let data = null;
    try { data = JSON.parse(probe.result.value); } catch (e) { data = { error: String(e) }; }
    report.push({ page: p.name, requested: p.url, landed: data.url, title: data.title, h1: data.h1, bodyLen: data.bodyLen, links: data.links, buttons: data.buttons, forms: data.forms, consoleErrors, netFailures });
    console.log(`--- ${p.name} (${p.url})`);
    console.log(`    landed=${data.url} title="${data.title}" h1="${data.h1}"`);
    console.log(`    links=${(data.links||[]).length} buttons=${(data.buttons||[]).length} forms=${(data.forms||[]).length} consoleErr=${consoleErrors.length} netFail=${netFailures.length}`);
    consoleErrors.slice(0, 6).forEach(e => console.log(`      [${e.type}] ${e.text.slice(0,200)}`));
    netFailures.slice(0, 6).forEach(e => console.log(`      [net] ${e.type} ${e.err}`));
  }

  fs.writeFileSync(`${OUT}/crawl-report.json`, JSON.stringify(report, null, 2));
  console.log("\nWROTE", `${OUT}/crawl-report.json`);
  ws.close();
  chrome.kill();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
