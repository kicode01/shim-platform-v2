// Role-guard test: log in as MEMBER, then from the page context call the
// organizer-only write APIs. If they return 2xx, a member can create
// certificates/events/templates — a real authorization bug.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9298;
const BASE = "http://localhost:3100";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-role", "about:blank",
  ]);
  process.on("exit", () => { try { chrome.kill(); } catch {} });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const list = JSON.parse(await get(`http://127.0.0.1:${PORT}/json/list`));
      target = list.find((t) => t.type === "page");
    } catch {}
  }
  if (!target) { console.error("no target"); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r) => ws.on("open", r));
  let id = 0;
  const pending = new Map();
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { __ex: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  // Log in as MEMBER
  await send("Page.navigate", { url: BASE + "/login" });
  await new Promise((r) => setTimeout(r, 2500));
  await evaluate(`(async () => {
    const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
      el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
    const inputs = [...document.querySelectorAll('input')];
    set(inputs.find(i=>i.type==='email')||inputs[0], 'member@shim.app');
    set(inputs.find(i=>i.type==='password')||inputs[1], 'member123');
    await new Promise(r=>setTimeout(r,200));
    const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
    if (b) b.click();
  })()`);
  await new Promise((r) => setTimeout(r, 5000));

  // Confirm who we are
  const who = await evaluate(`(async () => {
    const r = await fetch('/api/auth/session');
    const j = await r.json();
    return { role: j?.user?.role, email: j?.user?.email, name: j?.user?.name };
  })()`);
  console.log("session:", JSON.stringify(who));

  // Try organizer-only writes as a member
  const tests = await evaluate(`(async () => {
    const out = [];
    async function t(label, url, opts) {
      try {
        const r = await fetch(url, opts);
        let body = '';
        try { body = (await r.text()).slice(0, 110); } catch(e) { body = '(no body)'; }
        out.push({ label, status: r.status, body });
      } catch (e) { out.push({ label, status: 'ERR', body: String(e).slice(0,80) }); }
    }
    await t('POST /api/events', '/api/events', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name: 'QA-ROLE-TEST-EVENT', date: new Date().toISOString() })
    });
    await t('GET /api/events', '/api/events', { method: 'GET' });
    await t('POST /api/certificates', '/api/certificates', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ recipientName: 'QA Role Test', recipientEmail: 'qa@example.com', role: 'Participant' })
    });
    await t('GET /api/stats', '/api/stats', { method: 'GET' });
    return out;
  })()`);
  console.log("\n=== MEMBER attempting organizer-only operations ===");
  for (const t of tests) {
    const flag = (typeof t.status === 'number' && t.status >= 200 && t.status < 300) ? "  <== ALLOWED (BUG)" : "";
    console.log(`  ${t.label.padEnd(24)} -> ${t.status}  ${t.body.replace(/\n/g,' ')}${flag}`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
