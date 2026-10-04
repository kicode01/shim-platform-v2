// Capture logged-OUT mobile view of / (landing page navbar with Verify + Get Started).
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9350;
const BASE = "http://localhost:3100";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

(async () => {
  fs.mkdirSync("scratch/mob-landing", { recursive: true });
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=390,844",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-mob-landing", "about:blank",
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
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  await send("Page.navigate", { url: BASE + "/" });
  await sleep(3500);

  // Probe critical geometry
  const probe = await send("Runtime.evaluate", {
    expression: `(()=>{
      const out = {};
      const header = document.querySelector('header');
      out.viewportW = window.innerWidth;
      out.headerH = header?.offsetHeight;
      out.headerW = header?.offsetWidth;
      out.bodyScrollW = document.body.scrollWidth;
      out.bodyClientW = document.body.clientWidth;
      out.overflowing = out.bodyScrollW > out.bodyClientW;
      const logo = header?.querySelector('img');
      out.logoW = logo?.offsetWidth;
      out.logoH = logo?.offsetHeight;
      const shim = header?.querySelector('.mob-wordmark');
      out.shimFont = getComputedStyle(shim).fontSize;
      const tagline = header?.querySelector('.mob-tagline');
      out.taglineFont = tagline ? getComputedStyle(tagline).fontSize : 'none';
      out.taglineDisplay = tagline ? getComputedStyle(tagline).display : 'none';
      const right = header?.querySelector('.mob-nav-right');
      out.rightW = right?.offsetWidth;
      out.rightChildren = right ? right.children.length : 0;
      // All buttons inside header
      const btns = [...(header?.querySelectorAll('a, button') || [])];
      out.buttons = btns.map(b => ({
        text: b.textContent.trim().slice(0, 24),
        w: b.offsetWidth,
        h: b.offsetHeight,
        vis: getComputedStyle(b).display !== 'none',
      }));
      return out;
    })()`,
    returnByValue: true,
  });
  console.log("PROBE:", JSON.stringify(probe.result?.result?.value, null, 2));

  // Screenshot just the navbar (top 100px)
  const ss = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 390, height: 100, scale: 1 } });
  fs.writeFileSync("scratch/mob-landing/navbar.png", Buffer.from(ss.result.data, "base64"));
  console.log("navbar screenshot -> scratch/mob-landing/navbar.png");

  // Full-page screenshot
  const full = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync("scratch/mob-landing/full.png", Buffer.from(full.result.data, "base64"));
  console.log("full screenshot -> scratch/mob-landing/full.png");
})();