// Measure the landing logo lockup precisely, targeting the tagline's own text
// box (not its flex wrapper).
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-lockup-final2";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9255, path: p, timeout: 2000 }, (x) => {
      let d = ""; x.on("data", (c) => (d += c)); x.on("end", () => res(JSON.parse(d)));
    });
    r.on("error", rej); r.on("timeout", () => r.destroy());
  });
}
async function wait(t = 30000) {
  const s = Date.now();
  while (Date.now() - s < t) { try { return await get("/json/version"); } catch (e) { await new Promise((r) => setTimeout(r, 700)); } }
  throw new Error("noport");
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MEASURE = `(() => {
  const header = document.querySelector('header');
  const img = header.querySelector('img');
  const spans = Array.from(header.querySelectorAll('span'));
  const wordmark = spans.find(s => s.textContent.trim() === 'shim');
  const tagline = spans.find(s => /Digital Credential Platform/i.test(s.textContent) && s.children.length === 0);
  const b = e => e ? (r => ({ l:+r.left.toFixed(1), r:+r.right.toFixed(1), t:+r.top.toFixed(1), b:+r.bottom.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1) }))(e.getBoundingClientRect()) : null;
  const mb=b(img), wb=b(wordmark), tb=b(tagline);
  const pc = (a,b2) => ((a+b2)/2).toFixed(1);
  return JSON.stringify({
    mark: mb, wordmark: wb, tagline: tb,
    wordmarkCenterX: wb ? pc(wb.l, wb.r) : null,
    taglineCenterX: tb ? pc(tb.l, tb.r) : null,
    centerDeltaX: (wb && tb) ? +(( tb.l+tb.r)/2 - (wb.l+wb.r)/2).toFixed(1) : null,
    markCenterY: mb ? pc(mb.t, mb.b) : null,
    wordmarkCenterY: wb ? pc(wb.t, wb.b) : null,
    centerDeltaY: (mb && wb) ? +(( mb.t+mb.b)/2 - (wb.t+wb.b)/2).toFixed(1) : null,
    taglineWiderBy: (wb && tb) ? +(tb.w - wb.w).toFixed(1) : null,
    overhangLeft: (wb && tb) ? +(wb.l - tb.l).toFixed(1) : null,
    overhangRight: (wb && tb) ? +(tb.r - wb.r).toFixed(1) : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9255", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=3", "about:blank"], { stdio: "ignore" });
  process.on("exit", () => { try { ch.kill(); } catch (e) {} });
  const v = await wait();
  const ws = new WebSocket(v.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pend = new Map();
  const send = (m, p = {}, sid) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: sid })); });
  ws.on("message", (raw) => { const m = JSON.parse(raw); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
  await new Promise((r) => ws.on("open", r));
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable"); await S("Network.enable");
  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 3, mobile: false });

  await S("Page.navigate", { url: "http://localhost:3100/" });
  await sleep(11000);
  const r = await S("Runtime.evaluate", { expression: MEASURE, returnByValue: true });
  console.log("RESULT:", r.result.value);
  const shot = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 300, height: 64, scale: 3 }, captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/lockup_final3.png", Buffer.from(shot.data, "base64"));

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
