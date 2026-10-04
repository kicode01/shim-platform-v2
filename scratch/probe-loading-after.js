// Why is the loading spinner not centred?
//
// Suspect: /portal/loading.tsx nests <ShimLoader> AFTER three skeleton cards.
// ShimLoader has `min-h-[60vh]` + `justify-center`, so it centres the spinner
// inside its own 60vh box -- which STARTS below the skeleton. So the spinner
// lands at (skeletonHeight + 30vh), not at the viewport centre.
//
// This script measures: scroll container height, skeleton block height, the
// loader box's top/height/centre, and where the spinner actually renders vs the
// true viewport centre. Uses CDP with network throttling to hold the loading
// state open long enough to measure (route is fast locally).
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-loading-after";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9241, path: p, timeout: 2000 }, (x) => {
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

const PROBE = `(() => {
  const main = document.querySelector('main[data-app-scroll]');
  // ShimLoader root is the div containing the spinning circle
  const spinners = Array.from(document.querySelectorAll('div')).filter(d => {
    const cs = getComputedStyle(d);
    return cs.borderTopColor !== cs.borderRightColor && /solid/.test(cs.borderTopStyle) && Math.round(d.getBoundingClientRect().width) <= 40;
  });
  const spinner = spinners[0] || null;
  const loaderRoot = spinner ? spinner.closest('div[class*="min-h-"]') : null;
  const skel = main ? main.querySelector(':scope > div > div > div') : null;
  const vh = window.innerHeight;
  return JSON.stringify({
    viewportH: vh,
    mainClientH: main ? main.clientHeight : null,
    mainScrollH: main ? main.scrollHeight : null,
    mainScrollTop: main ? main.scrollTop : null,
    loaderRoot: loaderRoot ? (r => ({ top: Math.round(r.top), h: Math.round(r.height), centerY: Math.round(r.top + r.height/2) }))(loaderRoot.getBoundingClientRect()) : null,
    spinner: spinner ? (r => ({ top: Math.round(r.top), h: Math.round(r.height), centerY: Math.round(r.top + r.height/2) }))(spinner.getBoundingClientRect()) : null,
    viewportCenterY: Math.round(vh / 2),
    spinnerOffsetFromViewportCenter: spinner ? Math.round(spinner.getBoundingClientRect().top + spinner.getBoundingClientRect().height/2 - vh/2) : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9241", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
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

  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // Throttle so the loading.tsx suspense fallback stays mounted long enough.
  await S("Network.emulateNetworkConditions", {
    offline: false, latency: 3000, downloadThroughput: 20000, uploadThroughput: 20000,
  });

  await S("Page.navigate", { url: "http://localhost:3100/portal" });
  // Poll for the loading state rather than a fixed sleep.
  let found = false;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    const r = await S("Runtime.evaluate", { expression: PROBE, returnByValue: true });
    const parsed = JSON.parse(r.result.value);
    if (parsed.spinner) { console.log("LOADING STATE:", r.result.value); found = true;
      const shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      fs.writeFileSync(OUT + "/loading_after.png", Buffer.from(shot.data, "base64"));
      break; }
  }
  if (!found) console.log("loading state not captured (route resolved too fast)");

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
