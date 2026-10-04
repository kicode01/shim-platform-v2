// Final QA pass:
//  A) unauth redirect behaviour (does the browser actually land on /login?)
//  B) stuck-invisible element detection (animations that never complete)
//  C) scroll jank / frame timing
//  D) rendered scrollbar thickness across routes (confirm custom rails, no native 15px)
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9300;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-final", "about:blank",
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
    if (r.result?.exceptionDetails) return { __ex: (r.result.exceptionDetails.text || "").slice(0, 200) };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------------------------------------------------------------- A) REDIRECT
  console.log("=== A) UNAUTHENTICATED REDIRECT (browser, no session) ===");
  for (const path of ["/portal", "/dashboard", "/dashboard/credentials", "/dashboard/audit"]) {
    await send("Page.navigate", { url: BASE + path });
    const samples = [];
    for (let i = 0; i < 45; i++) {           // ~9s
      await sleep(200);
      const u = await evaluate("location.pathname");
      if (typeof u === "string") samples.push(u);
    }
    const last = samples[samples.length - 1] || "?";
    const settledAt = samples.findIndex((s) => s !== path);
    const ok = last !== path;
    console.log(
      "  " + path.padEnd(24) +
      " start=" + path +
      " final=" + last +
      " changedAfter=" + (settledAt >= 0 ? (settledAt * 200) + "ms" : "never") +
      (ok ? "" : "   <== STILL ON PROTECTED PAGE (BUG)")
    );
  }

  // ---------------------------------------------------------------- LOGIN (admin)
  console.log("\n=== logging in as admin ===");
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
  const who = await evaluate(`(async () => {
    const r = await fetch('/api/auth/session'); const j = await r.json();
    return { role: j?.user?.role, email: j?.user?.email };
  })()`);
  console.log("  session:", JSON.stringify(who));

  const ROUTES = ["/", "/dashboard", "/dashboard/events", "/dashboard/templates", "/dashboard/credentials", "/dashboard/audit", "/dashboard/generate"];

  // ---------------------------------------------------------------- B) STUCK INVISIBLE
  console.log("\n=== B) STUCK-INVISIBLE / UNFINISHED ANIMATION SCAN ===");
  for (const path of ROUTES) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(5000);
    const res = await evaluate(`(async () => {
      await new Promise(r => setTimeout(r, 800));
      const out = { op0: [], off: [], zero: [] };
      const els = [...document.querySelectorAll('body *')];
      for (const el of els) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (r.width === 0 && r.height === 0) continue;
        const txt = (el.textContent || '').trim().slice(0, 40);
        // opacity 0 but has content and a transition/animation => likely stuck
        if (parseFloat(cs.opacity) === 0) {
          if (txt || el.children.length === 0) out.op0.push((el.tagName + '.' + (el.className||'').toString().slice(0,30) + ' | ' + txt).slice(0,80));
          continue;
        }
        // translated far off its slot (stuck framer-motion exit)
        if (cs.transform && cs.transform !== 'none') {
          const m = cs.transform.match(/matrix\\(([^)]+)\\)/);
          if (m) {
            const p = m[1].split(',').map(Number);
            if (Math.abs(p[4]) > 60 || Math.abs(p[5]) > 60) {
              out.off.push((el.tagName + '.' + (el.className||'').toString().slice(0,30) + ' | dx=' + Math.round(p[4]) + ' dy=' + Math.round(p[5])).slice(0,80));
            }
          }
        }
      }
      return { op0: out.op0.slice(0,6), op0n: out.op0.length, off: out.off.slice(0,6), offn: out.off.length };
    })()`);
    if (!res || res.__ex) { console.log("  " + path.padEnd(24) + " ERR " + (res && res.__ex)); continue; }
    const flag = (res.op0n || res.offn) ? "  <== CHECK" : "";
    console.log("  " + path.padEnd(24) + " opacity0=" + res.op0n + " farTranslated=" + res.offn + flag);
    for (const s of res.op0) console.log("       op0: " + s);
    for (const s of res.off) console.log("       off: " + s);
  }

  // ---------------------------------------------------------------- C) SCROLL JANK
  console.log("\n=== C) SCROLL SMOOTHNESS (frame times on the app scroller) ===");
  for (const path of ["/", "/dashboard", "/dashboard/events", "/dashboard/templates"]) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(4000);
    const res = await evaluate(`(async () => {
      const sc = document.querySelector('main[data-app-scroll]') || document.scrollingElement;
      const frames = [];
      let last = performance.now();
      let stop = false;
      function tick(t) { frames.push(t - last); last = t; if (!stop) requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
      const max = sc.scrollHeight - sc.clientHeight;
      const steps = 40;
      for (let i = 0; i < steps; i++) {
        sc.scrollTop = Math.min(max, (max * (i + 1)) / steps);
        await new Promise(r => requestAnimationFrame(r));
      }
      stop = true;
      await new Promise(r => setTimeout(r, 100));
      const f = frames.slice(2).sort((a,b)=>a-b);
      const pct = (p) => f.length ? f[Math.min(f.length-1, Math.floor(f.length*p))] : 0;
      return {
        scrollable: max, n: f.length,
        median: +pct(0.5).toFixed(1), p95: +pct(0.95).toFixed(1), worst: +(f[f.length-1]||0).toFixed(1),
        over50: f.filter(x=>x>50).length
      };
    })()`);
    if (!res || res.__ex) { console.log("  " + path.padEnd(24) + " ERR " + (res && res.__ex)); continue; }
    console.log("  " + path.padEnd(24) + " scrollH=" + res.scrollable + " frames=" + res.n +
      " median=" + res.median + "ms p95=" + res.p95 + "ms worst=" + res.worst + "ms >50ms=" + res.over50 +
      (res.p95 > 60 ? "   <== JANK" : ""));
  }

  // ---------------------------------------------------------------- D) SCROLLBARS
  console.log("\n=== D) RENDERED SCROLLBAR WIDTH (native = 15px, custom = 10px) ===");
  for (const path of ROUTES) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(4000);
    const res = await evaluate(`(async () => {
      const out = [];
      const all = [...document.querySelectorAll('*')];
      for (const el of all) {
        const cs = getComputedStyle(el);
        const oy = cs.overflowY, ox = cs.overflowX;
        if (!/auto|scroll/.test(oy) && !/auto|scroll/.test(ox)) continue;
        const dw = el.offsetWidth - el.clientWidth;
        const dh = el.offsetHeight - el.clientHeight;
        const overflowsY = el.scrollHeight > el.clientHeight + 1;
        const overflowsX = el.scrollWidth > el.clientWidth + 1;
        if (dw > 0 || dh > 0 || overflowsY || overflowsX) {
          out.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString().slice(0, 28),
            rail: dw, railH: dh, oy: oy, ox: ox,
            ovY: overflowsY, ovX: overflowsX
          });
        }
      }
      return out;
    })()`);
    if (!res || res.__ex) { console.log("  " + path.padEnd(24) + " ERR " + (res && res.__ex)); continue; }
    if (!res.length) { console.log("  " + path.padEnd(24) + " no scroll containers"); continue; }
    console.log("  " + path.padEnd(24) + " containers=" + res.length);
    for (const c of res) {
      const native = (c.rail >= 14 && c.rail <= 17) || (c.railH >= 14 && c.railH <= 17);
      console.log("     " + (c.tag + " ." + c.cls).padEnd(34) +
        " railY=" + c.rail + " railX=" + c.railH + " ovY=" + c.ovY + " ovX=" + c.ovX +
        (native ? "   <== NATIVE SCROLLBAR" : ""));
    }
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
