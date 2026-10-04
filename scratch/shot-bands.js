// Full-viewport screenshots at high DPI, cropped to the right-hand 120px band,
// so every rail (root + nested) appears together in context.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9285;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,760",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-band", "about:blank",
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
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  async function login(email, password) {
    await send("Page.navigate", { url: "http://localhost:3100/login" });
    await new Promise((r) => setTimeout(r, 2500));
    await evaluate(`(async () => {
      const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
        el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
      const inputs = [...document.querySelectorAll('input')];
      set(inputs.find(i=>i.type==='email')||inputs[0], '${email}');
      set(inputs.find(i=>i.type==='password')||inputs[1], '${password}');
      await new Promise(r=>setTimeout(r,150));
      const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
      if (b) b.click();
    })()`);
    await new Promise((r) => setTimeout(r, 4500));
  }

  const shots = [
    ["landing", "http://localhost:3100/", null],
    ["validate", "http://localhost:3100/validate", null],
    ["dashboard", "http://localhost:3100/dashboard", ["admin@shim.app", "admin123"]],
    ["credentials", "http://localhost:3100/dashboard/credentials", ["admin@shim.app", "admin123"]],
    ["events", "http://localhost:3100/dashboard/events", ["admin@shim.app", "admin123"]],
    ["audit", "http://localhost:3100/dashboard/audit", ["admin@shim.app", "admin123"]],
    ["generate", "http://localhost:3100/dashboard/generate", ["admin@shim.app", "admin123"]],
    ["templates", "http://localhost:3100/dashboard/templates", ["admin@shim.app", "admin123"]],
    ["portal", "http://localhost:3100/portal", ["member@shim.app", "member123"]],
  ];

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 760, deviceScaleFactor: 3, mobile: false });

  for (const [name, url, creds] of shots) {
    if (creds) await login(creds[0], creds[1]);
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 3200));
    // Nudge the root scroller so its thumb is clearly mid-track.
    await evaluate(`(() => { const m = document.querySelector('main[data-app-scroll]'); if (m) m.scrollTop = Math.floor(m.scrollHeight * 0.35); })()`);
    await new Promise((r) => setTimeout(r, 500));
    const shot = await send("Page.captureScreenshot", {
      format: "png", clip: { x: 1140, y: 0, width: 140, height: 760, scale: 3 } });
    fs.writeFileSync(`scratch/band-${name}.png`, Buffer.from(shot.result.data, "base64"));
    console.log(`wrote scratch/band-${name}.png`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
