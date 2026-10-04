// Measure run-to-run noise on /dashboard/generate: take N fresh desktop screenshots
// and compute pairwise pixel diffs. If noise ~ original before/after diff, it's noise.
const http = require("http");
const fs = require("fs");
const sharp = require("sharp");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9330;
const BASE = "http://localhost:3100";
const N = parseInt(process.argv[2] || "3", 10);
const ROUTE = "/dashboard/generate";
const OUT = "scratch/dt-noise";

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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-noise", "about:blank",
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
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  // Login
  await send("Page.navigate", { url: BASE + "/login" });
  await sleep(2200);
  await send("Runtime.evaluate", {
    expression: `(()=>{const e=document.createElement('input');e.type='hidden';e.name='_x';e.value='1';document.querySelector('form')?.appendChild(e);})()`,
  });
  await send("Input.dispatchKeyEvent", { type: "char", text: "admin@shim.app" });
  await send("Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 9 });
  await sleep(150);
  await send("Input.dispatchKeyEvent", { type: "char", text: "admin123" });
  await sleep(150);
  await send("Input.dispatchKeyEvent", { type: "keyDown", windowsVirtualKeyCode: 13, key: "Enter" });
  await sleep(2500);

  await send("Page.navigate", { url: BASE + ROUTE });
  await sleep(3000);

  const shots = [];
  for (let i = 1; i <= N; i++) {
    const r = await send("Page.captureScreenshot", { format: "png" });
    const path = `${OUT}/gen${i}.png`;
    fs.writeFileSync(path, Buffer.from(r.result.data, "base64"));
    shots.push(path);
    console.log(`shot ${i}: ${path}`);
    if (i < N) {
      await send("Page.navigate", { url: BASE + ROUTE + "?_=" + i });
        await sleep(2500);
      }
    }
  }

async function diffImages(a, b) {
  const A = await sharp(a).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const B = await sharp(b).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  if (A.info.width !== B.info.width || A.info.height !== B.info.height) return { diffPx: -1, mean: -1, max: -1 };
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

(async () => {
  console.log(`Capturing ${N} desktop shots of ${ROUTE}...`);
  await main();
  console.log("\n=== NOISE FLOOR (pairwise diffs of fresh same-route runs) ===");
  for (let i = 1; i <= N; i++) {
    for (let j = i + 1; j <= N; j++) {
      const r = await diffImages(`${OUT}/gen${i}.png`, `${OUT}/gen${j}.png`);
      console.log(`  gen${i} vs gen${j}: diffPx=${String(r.diffPx).padStart(6)} (${r.pct}%)  mean=${r.mean}  max=${r.max}`);
    }
  }
})();