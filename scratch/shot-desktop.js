// Capture desktop screenshots at 1440x900 for every route into a given dir.
// Usage: node scratch/shot-desktop.js <outdir>
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9320;
const BASE = "http://localhost:3100";
const OUT = process.argv[2] || "scratch/dt-before";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1440,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-dt", "about:blank",
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

  const ROUTES = ["/", "/login", "/register", "/validate", "/dashboard", "/dashboard/events", "/dashboard/templates", "/dashboard/credentials", "/dashboard/audit", "/dashboard/generate"];
  for (const path of ROUTES) {
    await send("Page.navigate", { url: BASE + path });
    await sleep(4500);
    // settle animations
    await evaluate("new Promise(r => setTimeout(r, 700))");
    const shot = await send("Page.captureScreenshot", { format: "png" });
    const fname = path === "/" ? "home" : path.replace(/\//g, "_").replace(/^_/, "");
    fs.writeFileSync(OUT + "/" + fname + ".png", Buffer.from(shot.result.data, "base64"));
    console.log("  " + OUT + "/" + fname + ".png");
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
