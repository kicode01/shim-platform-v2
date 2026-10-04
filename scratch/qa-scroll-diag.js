// Diagnose: which element ACTUALLY scrolls, does main reserve a dead gutter,
// and what is the hugely-translated div seen on /dashboard/templates + /dashboard/generate?
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9301;
const BASE = "http://localhost:3100";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1440,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-sd", "about:blank",
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
    if (r.result?.exceptionDetails) return { __ex: (r.result.exceptionDetails.text || "").slice(0, 300) };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  await send("Page.navigate", { url: BASE + "/login" });
  await sleep(2500);
  await evaluate(`(async () => {
    const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
      el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
    const inputs = [...document.querySelectorAll('input')];
    set(inputs.find(i=>i.type==='email')||inputs[0], 'admin@shim.app');
    set(inputs.find(i=>i.type==='password')||inputs[1], 'admin123');
    await new Promise(r=>setTimeout(r,200));
    const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
    if (b) b.click();
  })()`);
  await sleep(6000);

  const ROUTES = ["/", "/dashboard", "/dashboard/templates", "/dashboard/credentials", "/dashboard/audit", "/dashboard/events", "/dashboard/generate"];

  console.log("=== WHICH ELEMENT ACTUALLY SCROLLS ===");
  for (const path of ROUTES) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(4500);
    const res = await evaluate(`(async () => {
      const info = (el, label) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { label, tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,34),
          oy: cs.overflowY, gutter: cs.scrollbarGutter,
          sh: el.scrollHeight, ch: el.clientHeight, ow: el.offsetWidth, cw: el.clientWidth };
      };
      const main = document.querySelector('main[data-app-scroll]');
      const out = { main: info(main, 'main'), scrollers: [] };
      // every element that can actually take scrollTop
      for (const el of [...document.querySelectorAll('*')]) {
        const cs = getComputedStyle(el);
        if (!/auto|scroll|hidden/.test(cs.overflowY)) continue;
        if (el.scrollHeight > el.clientHeight + 1) {
          const before = el.scrollTop;
          el.scrollTop = 40;
          const moved = el.scrollTop > before;
          el.scrollTop = before;
          out.scrollers.push({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,34),
            oy: cs.overflowY, range: el.scrollHeight - el.clientHeight, moved });
        }
      }
      out.docScroll = { deScrollRange: document.documentElement.scrollHeight - document.documentElement.clientHeight,
                        bodyScrollRange: document.body.scrollHeight - document.body.clientHeight };
      out.viewport = { w: innerWidth, h: innerHeight };
      return out;
    })()`);
    if (!res || res.__ex) { console.log("  " + path + " ERR " + (res && res.__ex)); continue; }
    console.log("\n  " + path);
    if (res.main) console.log("     main: oy=" + res.main.oy + " gutter=" + res.main.gutter +
      " scrollH=" + res.main.sh + " clientH=" + res.main.ch + " rail=" + (res.main.ow - res.main.cw));
    console.log("     docRange=" + res.docScroll.deScrollRange + " bodyRange=" + res.docScroll.bodyScrollRange +
      " viewport=" + res.viewport.w + "x" + res.viewport.h);
    if (!res.scrollers.length) console.log("     (no element with overflow)");
    for (const s of res.scrollers) {
      console.log("     scroller: " + (s.tag + " ." + s.cls).padEnd(40) + " oy=" + s.oy + " range=" + s.range + " moved=" + s.moved);
    }
  }

  // ---- the hugely translated div
  console.log("\n=== WHAT IS THE dx=-1754 dy=-1240 DIV? ===");
  for (const path of ["/dashboard/templates", "/dashboard/generate"]) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(4500);
    const res = await evaluate(`(async () => {
      const out = [];
      for (const el of [...document.querySelectorAll('body *')]) {
        const cs = getComputedStyle(el);
        if (!cs.transform || cs.transform === 'none') continue;
        const m = cs.transform.match(/matrix\\(([^)]+)\\)/);
        if (!m) continue;
        const p = m[1].split(',').map(Number);
        if (Math.abs(p[4]) > 200 || Math.abs(p[5]) > 200) {
          const r = el.getBoundingClientRect();
          out.push({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,40),
            id: el.id || '', parent: (el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + (el.parentElement.className||'').toString().slice(0,30) : ''),
            transform: cs.transform.slice(0,40), w: Math.round(r.width), h: Math.round(r.height),
            top: Math.round(r.top), left: Math.round(r.left),
            childCount: el.children.length, text: (el.textContent||'').trim().slice(0,30) });
        }
      }
      return out.slice(0, 4);
    })()`);
    console.log("  " + path);
    if (!res || res.__ex) { console.log("    ERR " + (res && res.__ex)); continue; }
    if (!res.length) console.log("    (none)");
    for (const e of res) {
      console.log("    <" + e.tag + "> cls='" + e.cls + "' parent='" + e.parent + "'");
      console.log("       transform=" + e.transform + " size=" + e.w + "x" + e.h + " at(" + e.left + "," + e.top + ") children=" + e.childCount + " text='" + e.text + "'");
    }
  }

  // ---- screenshot the right edge so we can SEE the gutter situation
  console.log("\n=== RIGHT-EDGE SCREENSHOTS ===");
  await send("Page.navigate", { url: BASE + "/dashboard" });
  await sleep(5000);
  const shot = async (name) => {
    const r = await send("Page.captureScreenshot", { format: "png", clip: { x: 1440 - 60, y: 60, width: 60, height: 700, scale: 1 } });
    require("fs").writeFileSync("scratch/" + name, Buffer.from(r.result.data, "base64"));
    console.log("  wrote scratch/" + name);
  };
  await shot("edge-dashboard-top.png");
  await evaluate("document.querySelector('main[data-app-scroll]') && (document.querySelector('main[data-app-scroll]').scrollTop = 400)");
  await sleep(600);
  await shot("edge-dashboard-scrolled.png");

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
