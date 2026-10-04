// Confirm the black right-edge stripe is gone on /portal (light) and that
// /validate still has a dark rail (dark), now driven by root <main>'s
// data-surface instead of the page's own wrapper.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-surface-full";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9238, path: p, timeout: 2000 }, (x) => {
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
function tok(p) {
  try { for (const l of fs.readFileSync(p, "utf8").split(/\r?\n/)) { const q = l.split("\t"); if (q.length >= 7 && q[5] === "next-auth.session-token") return q[6].trim(); } } catch (e) {}
  return null;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `(() => {
  const main = document.querySelector('main[data-app-scroll]');
  const wrap = main.firstElementChild;
  return JSON.stringify({
    surface: main.getAttribute('data-surface'),
    viewportW: window.innerWidth,
    mainRect: (r => ({ left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }))(main.getBoundingClientRect()),
    mainScrollbarGutter: getComputedStyle(main).scrollbarGutter,
    hasVScroll: main.scrollHeight > main.clientHeight,
    scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
    innerChildRight: wrap && wrap.getBoundingClientRect ? Math.round(wrap.getBoundingClientRect().right) : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9238", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
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
  await S("Network.setCookie", { name: "next-auth.session-token", value: tok("C:/Users/PC/AppData/Local/Temp/qa_member.txt"), domain: "localhost", path: "/", httpOnly: true });

  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // --- Light page: /portal ---
  await S("Page.navigate", { url: "http://localhost:3100/portal" });
  await sleep(14000);
  let r = await S("Runtime.evaluate", { expression: PROBE, returnByValue: true });
  console.log("PORTAL:", r.result.value);
  let shot = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 800, scale: 1 }, captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/surface_portal_full.png", Buffer.from(shot.data, "base64"));

  // --- Dark page: /validate ---
  await S("Page.navigate", { url: "http://localhost:3100/validate" });
  await sleep(9000);
  r = await S("Runtime.evaluate", { expression: PROBE, returnByValue: true });
  console.log("VALIDATE:", r.result.value);
  shot = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 800, scale: 1 }, captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/surface_validate_full.png", Buffer.from(shot.data, "base64"));

  console.log("saved surface_portal_full.png + surface_validate_full.png");
  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
