// Capture navbar at multiple widths to find which one matches the user's screenshot.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9360;
const BASE = "http://localhost:3100";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

(async () => {
  const WIDTHS = [320, 360, 375, 414, 768, 1024];
  fs.mkdirSync("scratch/navbar-sweep", { recursive: true });

  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=400,200",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-navbar-sweep", "about:blank",
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
  const send = (m, p = {}) =>
    new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  await send("Page.enable");
  await send("Runtime.enable");

  for (const w of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 200, deviceScaleFactor: 1, mobile: w < 768 });
    await send("Page.navigate", { url: BASE + "/" });
    await sleep(2500);
    const ss = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: w, height: 80, scale: 1 } });
    fs.writeFileSync(`scratch/navbar-sweep/nav-${w}.png`, Buffer.from(ss.result.data, "base64"));
    console.log(`captured ${w}px -> scratch/navbar-sweep/nav-${w}.png`);
  }
})();