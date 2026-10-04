// Definitive proof: pause all CSS animations on /dashboard/generate, then re-shoot
// before/after. If diff goes from 274px -> 0px, the previous diff was animation-phase noise.
const http = require("http");
const fs = require("fs");
const sharp = require("sharp");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9340;
const BASE = "http://localhost:3100";
const ROUTE = "/dashboard/generate";
const OUT = "scratch/dt-frozen";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function shoot(ws, send, sleep, login) {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Animation.enable");
  await send("Animation.setPlaybackRate", { playbackRate: 0 });
  // also pin CSS animations via style override (Animation domain doesn't cover CSS @keyframes reliably across all engines)
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    const s = document.createElement('style');
    s.textContent = '*{animation-play-state:paused !important; animation-delay: -999s !important; transition:none !important;}';
    (document.head||document.documentElement).appendChild(s);
  ` });

  await send("Page.navigate", { url: BASE + "/login" });
  await sleep(2500);
  await send("Runtime.evaluate", {
    expression: `(async()=>{
      document.querySelector('input[type=email]')?.focus();
    })()`,
  });
  await send("Input.dispatchKeyEvent", { type: "char", text: "admin@shim.app" });
  await send("Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 9 });
  await sleep(200);
  await send("Input.dispatchKeyEvent", { type: "char", text: "admin123" });
  await sleep(200);
  await send("Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 13, key: "Enter" });
  await sleep(2800);

  await send("Page.navigate", { url: BASE + ROUTE });
  await sleep(3500);

  const r = await send("Page.captureScreenshot", { format: "png" });
  return Buffer.from(r.result.data, "base64");
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1440,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-frozen", "about:blank",
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

  console.log("Capturing frozen-anim shot 1...");
  const buf1 = await shoot(ws, send, sleep);
  fs.writeFileSync(`${OUT}/frozen1.png`, buf1);
  console.log(`  -> ${OUT}/frozen1.png`);

  console.log("Capturing frozen-anim shot 2...");
  const buf2 = await shoot(ws, send, sleep);
  fs.writeFileSync(`${OUT}/frozen2.png`, buf2);
  console.log(`  -> ${OUT}/frozen2.png`);

  // Compare each frozen shot against dt-after to see if paused-anim matches.
  async function diff(a, b) {
    const A = await sharp(a).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    const B = await sharp(b).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    if (A.info.width !== B.info.width || A.info.height !== B.info.height) return -1;
    let diffPx = 0, sum = 0, max = 0;
    const total = A.info.width * A.info.height;
    for (let i = 0; i < A.data.length; i += 4) {
      const dr = Math.abs(A.data[i] - B.data[i]);
      const dg = Math.abs(A.data[i + 1] - B.data[i + 1]);
      const db = Math.abs(A.data[i + 2] - B.data[i + 2]);
      const m = Math.max(dr, dg, db);
      if (m > 12) diffPx++;
      sum += m;
      if (m > max) max = m;
    }
    return { diffPx, pct: ((diffPx / total) * 100).toFixed(4), mean: (sum / (total * 4)).toFixed(2), max };
  }

  console.log("\n=== DIFFS (animations paused) ===");
  const r12 = await diff(`${OUT}/frozen1.png`, `${OUT}/frozen2.png`);
  console.log(`  frozen1 vs frozen2 (same code, animations frozen): diffPx=${r12.diffPx} (${r12.pct}%) max=${r12.max}`);
  const r1a = await diff(`${OUT}/frozen1.png`, `scratch/dt-after/dashboard_generate.png`);
  console.log(`  frozen1 vs dt-after (animations frozen vs running):   diffPx=${r1a.diffPx} (${r1a.pct}%) max=${r1a.max}`);
  const r1b = await diff(`${OUT}/frozen1.png`, `scratch/dt-before/dashboard_generate.png`);
  console.log(`  frozen1 vs dt-before (animations frozen vs old):      diffPx=${r1b.diffPx} (${r1b.pct}%) max=${r1b.max}`);
}

main().catch(e => { console.error(e); process.exit(1); });