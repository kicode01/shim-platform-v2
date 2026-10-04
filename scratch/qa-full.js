// Full-site QA pass: visit every route (with auth where needed), collect
// console errors, failed network requests, and scroll-container stats.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9290;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-qa", "about:blank",
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
  const events = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
    if (msg.method === "Runtime.consoleAPICalled") {
      const a = msg.params;
      if (a.type === "error" || a.type === "warning") {
        events.push({ kind: "console", type: a.type, text: (a.args || []).map(x => x.value ?? x.description ?? "").join(" ").slice(0, 200) });
      }
    }
    if (msg.method === "Runtime.exceptionThrown") {
      events.push({ kind: "exception", text: (msg.params.exceptionDetails?.text || "") + " " + (msg.params.exceptionDetails?.exception?.description || "").slice(0, 200) });
    }
    if (msg.method === "Network.responseReceived") {
      const r = msg.params.response;
      if (r.status >= 400) events.push({ kind: "http", status: r.status, url: r.url.slice(0, 140) });
    }
    if (msg.method === "Network.loadingFailed") {
      events.push({ kind: "netfail", text: msg.params.errorText, url: (msg.params.requestId || "").slice(0, 40) });
    }
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
  await send("Network.enable");
  await send("Log.enable");

  async function login(email, password) {
    await send("Page.navigate", { url: BASE + "/login" });
    await new Promise((r) => setTimeout(r, 2200));
    const ok = await evaluate(`(async () => {
      const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
        el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
      const inputs = [...document.querySelectorAll('input')];
      const em = inputs.find(i=>i.type==='email')||inputs[0];
      const pw = inputs.find(i=>i.type==='password')||inputs[1];
      if (!em || !pw) return 'no inputs';
      set(em, ${JSON.stringify(email)});
      set(pw, ${JSON.stringify(password)});
      await new Promise(r=>setTimeout(r,200));
      const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
      if (!b) return 'no button';
      b.click();
      return 'ok';
    })()`);
    await new Promise((r) => setTimeout(r, 4000));
    return ok;
  }

  // Scroll container + layout probe
  const probe = `(() => {
    const scrollers = [...document.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      return cs.overflowY === 'auto' || cs.overflowY === 'scroll' || cs.overflowX === 'auto' || cs.overflowX === 'scroll';
    }).map(el => {
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        cls: String(el.className).slice(0,55),
        thY: el.offsetWidth - el.clientWidth,
        thX: el.offsetHeight - el.clientHeight,
        sbW: cs.scrollbarWidth,
        scrolls: el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
      };
    });
    const doc = document.documentElement;
    // Horizontal overflow of the page itself
    const hOverflow = doc.scrollWidth > doc.clientWidth + 1;
    const bodyH = document.body ? document.body.scrollWidth > document.body.clientWidth + 1 : false;
    // Any element wider than viewport
    const wide = [...document.querySelectorAll('*')].filter(el => {
      const b = el.getBoundingClientRect();
      return b.width > window.innerWidth + 2 && b.height > 0 && getComputedStyle(el).position !== 'fixed';
    }).length;
    return {
      title: document.title,
      heading: (document.querySelector('h1')||{}).textContent || '(none)',
      scrollers, hOverflow, bodyH, wideElCount: wide,
      navPresent: !!document.querySelector('header'),
      mainPresent: !!document.querySelector('main[data-app-scroll]'),
      emptyBody: (document.body.innerText||'').trim().length < 20,
    };
  })()`;

  const routes = [
    ["GET", "/", null],
    ["GET", "/login", null],
    ["GET", "/register", null],
    ["GET", "/validate", null],
    ["GET", "/portal", ["member@shim.app","member123"]],
    ["GET", "/dashboard", ["admin@shim.app","admin123"]],
    ["GET", "/dashboard/credentials", ["admin@shim.app","admin123"]],
    ["GET", "/dashboard/events", ["admin@shim.app","admin123"]],
    ["GET", "/dashboard/audit", ["admin@shim.app","admin123"]],
    ["GET", "/dashboard/generate", ["admin@shim.app","admin123"]],
    ["GET", "/dashboard/templates", ["admin@shim.app","admin123"]],
    ["GET", "/dashboard/templates/new", ["admin@shim.app","admin123"]],
  ];

  const results = [];
  for (const [m, route, creds] of routes) {
    events.length = 0;
    if (creds) await login(creds[0], creds[1]);
    await send("Page.navigate", { url: BASE + route });
    await new Promise((r) => setTimeout(r, 3200));
    const p = await evaluate(probe);
    results.push({ route, probe: p, events: [...events] });
  }

  const out = { results };
  fs.writeFileSync("scratch/qa-report.json", JSON.stringify(out, null, 2));

  // Print summary
  for (const r of results) {
    const p = r.probe;
    console.log(`\n=== ${r.route} ===`);
    if (p.__ex) { console.log("  PROBE EXCEPTION:", p.__ex); continue; }
    console.log(`  title="${p.title}" h1="${(p.heading||'').slice(0,50)}"`);
    console.log(`  nav=${p.navPresent} main=${p.mainPresent} empty=${p.emptyBody}`);
    console.log(`  hOverflow=${p.hOverflow} bodyHOv=${p.bodyH} wideEls=${p.wideElCount}`);
    const thick = p.scrollers.filter(s => s.thY > 10);
    console.log(`  scrollers=${p.scrollers.length} thick(>10)=${thick.length}`);
    for (const s of p.scrollers) console.log(`     thY=${s.thY} thX=${s.thX} sbW=${s.sbW} scrolls=${s.scrolls} ${s.cls}`);
    const errs = r.events.filter(e => e.kind === 'console' && e.type === 'error');
    const excs = r.events.filter(e => e.kind === 'exception');
    const http4 = r.events.filter(e => e.kind === 'http');
    const fails = r.events.filter(e => e.kind === 'netfail');
    console.log(`  consoleErrors=${errs.length} exceptions=${excs.length} http>=400=${http4.length} netfail=${fails.length}`);
    for (const e of errs.slice(0,4)) console.log(`     [err] ${e.text}`);
    for (const e of excs.slice(0,3)) console.log(`     [exc] ${e.text.slice(0,160)}`);
    for (const e of http4.slice(0,6)) console.log(`     [http ${e.status}] ${e.url}`);
    for (const e of fails.slice(0,3)) console.log(`     [netfail] ${e.text}`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
