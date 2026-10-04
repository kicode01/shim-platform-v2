// Measure real navigation timing for /portal with an active session, and
// confirm where the 3.2s blank window comes from (server TTFB vs client work).
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9294;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-perf", "about:blank",
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

  // Hard-navigate to /portal and read resource timing.
  await send("Page.navigate", { url: BASE + "/portal" });
  await new Promise((r) => setTimeout(r, 6000));

  const perf = await evaluate(`(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const res = performance.getEntriesByType('resource').filter(r => r.name.includes('/portal'));
    return {
      // timings relative to navigation start
      domInteractive: Math.round(nav.domInteractive),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      domComplete: Math.round(nav.domComplete),
      loadEnd: Math.round(nav.loadEventEnd),
      responseEnd: Math.round(nav.responseEnd),
      // server think time
      ttfb: Math.round(nav.responseStart - nav.requestStart),
      transfer: Math.round(nav.responseEnd - nav.responseStart),
      portalResource: res.map(r => ({ name: r.name.slice(0,60), dur: Math.round(r.duration), ttfb: Math.round(r.responseStart - r.startTime) })),
    };
  })()`);
  console.log("=== /portal navigation timing (member session) ===");
  console.log(JSON.stringify(perf, null, 2));

  // Second visit (warm) for comparison.
  await send("Page.navigate", { url: BASE + "/portal" });
  await new Promise((r) => setTimeout(r, 4000));
  const perf2 = await evaluate(`(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return { ttfb: Math.round(nav.responseStart - nav.requestStart), domComplete: Math.round(nav.domComplete) };
  })()`);
  console.log("\n=== /portal second visit ===");
  console.log(JSON.stringify(perf2, null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
