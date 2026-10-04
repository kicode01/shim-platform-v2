// Capture filmstrip frames mid-transition to visually confirm no smear.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9277;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-film", "about:blank",
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
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  // Landing: capture a set of mid-transition frames.
  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 3000));
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false });

  const strip = [];

  // Start a click, then grab frames as fast as we can.
  evaluate(`[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='/validate').click()`);
  const t0 = Date.now();
  for (let i = 0; i < 14; i++) {
    const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 300, height: 64, scale: 2 } });
    const f = `scratch/film-${String(i).padStart(2, "0")}.png`;
    fs.writeFileSync(f, Buffer.from(shot.result.data, "base64"));
    strip.push({ i, ms: Date.now() - t0, f });
    await new Promise((r) => setTimeout(r, 30));
  }
  console.log(JSON.stringify(strip, null, 1));

  // Also capture the two resting states for reference.
  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 2500));
  let shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 300, height: 64, scale: 3 } });
  fs.writeFileSync("scratch/rest-landing.png", Buffer.from(shot.result.data, "base64"));

  await send("Page.navigate", { url: "http://localhost:3100/validate" });
  await new Promise((r) => setTimeout(r, 2500));
  shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 300, height: 64, scale: 3 } });
  fs.writeFileSync("scratch/rest-validate.png", Buffer.from(shot.result.data, "base64"));

  console.log("done");
  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
