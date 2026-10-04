// Mobile audit at 390x844 (iPhone 14 class). Screenshots + concrete measurements
// of the things that actually matter on a phone: tap-target size, content wider
// than the viewport, nav overflow, and horizontal scrollability.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9310;
const BASE = "http://localhost:3100";
const OUT = "scratch/mob";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=390,844",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-mob", "about:blank",
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
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // login
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

  const ROUTES = ["/", "/dashboard", "/dashboard/events", "/dashboard/templates", "/dashboard/credentials", "/dashboard/audit", "/dashboard/generate"];

  console.log("=== MOBILE 390x844 ===");
  for (const path of ROUTES) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(4500);
    const res = await evaluate(`(async () => {
      const vw = innerWidth;
      const out = { vw, wide: [], tiny: 0, tinyList: [], navOverflow: null, hScroll: false, clipped: [] };
      // elements sticking out horizontally
      for (const el of [...document.querySelectorAll('body *')]) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.right > vw + 1 || r.left < -1) {
          out.wide.push({ tag: el.tagName.toLowerCase(), cls: (el.className||'').toString().slice(0,26),
            left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) });
        }
      }
      // tap targets that are too small (<32px in either axis)
      const interactive = [...document.querySelectorAll('button, a, input, select, textarea, [role=button]')];
      for (const el of interactive) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.height < 32 || r.width < 32) {
          out.tiny++;
          if (out.tinyList.length < 5) out.tinyList.push({ tag: el.tagName.toLowerCase(),
            text: (el.textContent||'').trim().slice(0,20), w: Math.round(r.width), h: Math.round(r.height) });
        }
      }
      const nav = document.querySelector('header');
      if (nav) {
        const nr = nav.getBoundingClientRect();
        out.navOverflow = { h: Math.round(nr.height), scrollW: nav.scrollWidth, clientW: nav.clientWidth,
          overflowing: nav.scrollWidth > nav.clientWidth + 1 };
      }
      const main = document.querySelector('main[data-app-scroll]');
      if (main) out.hScroll = main.scrollWidth > main.clientWidth + 1;
      return out;
    })()`);

    const shot = await send("Page.captureScreenshot", { format: "png" });
    const fname = path === "/" ? "home" : path.replace(/\//g, "_").replace(/^_/, "");
    fs.writeFileSync(OUT + "/m" + fname + ".png", Buffer.from(shot.result.data, "base64"));

    if (!res || res.__ex) { console.log("  " + path.padEnd(24) + " ERR " + (res && res.__ex)); continue; }
    console.log("\n  " + path + "   (shot: scratch/mob/m" + fname + ".png)");
    console.log("     widerThanViewport=" + res.wide.length + "  tinyTapTargets=" + res.tiny +
      "  navOverflowing=" + (res.navOverflow && res.navOverflow.overflowing) + "  mainHScroll=" + res.hScroll);
    for (const w of res.wide.slice(0, 4)) console.log("       wide: " + w.tag + " ." + w.cls + "  x=" + w.left + ".." + w.right + " (w=" + w.w + ")");
    for (const t of res.tinyList) console.log("       tiny: <" + t.tag + "> '" + t.text + "' " + t.w + "x" + t.h);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
