// Full QA crawl: loads every key page in a real browser, collects console
// errors, failed network requests, status codes, and scrapes all interactive
// controls (links, buttons, forms) for reporting.
const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const BASE = "http://localhost:3100";
const OUT = "C:/temp/qa";
fs.mkdirSync(OUT, { recursive: true });

function get(path) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: 9222, path }, (r) => {
      let d = ""; r.on("data", c => (d += c)); r.on("end", () => res(JSON.parse(d)));
    }).on("error", rej);
  });
}

const PAGES = process.argv[2] ? JSON.parse(process.argv[2]) : [];

async function main() {
  const ver = await get("/json/version");
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
    if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning")) {
      const text = (m.params.args || []).map(a => a.value ?? a.description ?? a.type).join(" ");
      consoleErrors.push({ page: curr, type: m.params.type, text: text.slice(0, 300) });
    }
    if (m.method === "Runtime.exceptionThrown") {
      const d = m.params.exceptionDetails || {};
      consoleErrors.push({ page: curr, type: "exception", text: (d.exception?.description || d.text || "").slice(0, 400) });
    }
    if (m.method === "Network.loadingFailed") {
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
        const links = q('a[href]').map(a => ({ text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0,60), href: a.getAttribute('href') }))
          .filter(l => l.text || l.href);
        const buttons = q('button').map(b => ({ text: (b.innerText || b.getAttribute('aria-label') || b.title || '').trim().slice(0,60), type: b.type, disabled: b.disabled, hasHandler: true }));
        const forms = q('form').map(f => ({ action: f.getAttribute('action') || '(js)', method: f.method, inputs: q('form input, form select, form textarea').length }));
        const title = document.title;
        const h1 = (document.querySelector('h1')?.innerText || '').trim().slice(0,80);
        const bodyLen = document.body ? document.body.innerText.length : 0;
        return JSON.stringify({ title, h1, bodyLen, links, buttons, forms, url: location.href });
      })()`,
      returnByValue: true,
    });

    let data = null;
    try { data = JSON.parse(probe.result.value); } catch (e) { data = { error: String(e) }; }
    report.push({ page: p.name, requested: p.url, landed: data.url, status: null, title: data.title, h1: data.h1, bodyLen: data.bodyLen, links: data.links, buttons: data.buttons, forms: data.forms, consoleErrors, netFailures });
    console.log(`--- ${p.name} (${p.url}) -> ${data.url}`);
    console.log(`    title="${data.title}" h1="${data.h1}"`);
    console.log(`    links=${(data.links||[]).length} buttons=${(data.buttons||[]).length} forms=${(data.forms||[]).length} consoleErr=${consoleErrors.length} netFail=${netFailures.length}`);
    consoleErrors.filter(e => e.type !== "warning").slice(0, 5).forEach(e => console.log(`      [${e.type}] ${e.text.slice(0,160)}`));
    netFailures.slice(0, 5).forEach(e => console.log(`      [net] ${e.type} ${e.err}`));
  }

  fs.writeFileSync(`${OUT}/crawl-report.json`, JSON.stringify(report, null, 2));
  console.log("\nWROTE", `${OUT}/crawl-report.json`);
  ws.close();
}

main().catch(e => { console.error("ERR", e.message); process.exit(1); });
