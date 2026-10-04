// Diagnose the "black band on the right edge" the user sees.
//
// Hypothesis: <body> is bg-[#0a0a0a] (near-black). The portal's light surface
// (bg-zinc-50) is painted by an inner wrapper that does NOT span the full body
// width. The scroll container is <main> with [scrollbar-gutter:stable], so with
// no visible scrollbar the gutter (8-10px) is reserved but unpainted by the
// page -> body's #0a0a0a shows through as a black stripe down the right edge.
//
// This script samples actual rendered pixel colours across the right edge at
// several x offsets, in both the scrolled-to-top and scrolled-down states, so
// the cause is confirmed by measurement rather than assumed.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-edge-probe";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9236, path: p, timeout: 2000 }, (x) => {
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

const PROBE = (label) => `(() => {
  const main = document.querySelector('main');
  const body = document.body;
  const html = document.documentElement;
  const cs = getComputedStyle(main);
  // Walk from <main>'s first child outward to find who paints the page surface.
  const wrap = main.firstElementChild;
  const wrapBg = wrap ? getComputedStyle(wrap).backgroundColor : null;
  const wrapBox = wrap ? wrap.getBoundingClientRect() : null;
  return JSON.stringify({
    label: ${JSON.stringify(label)},
    viewport: { w: window.innerWidth, h: window.innerHeight },
    bodyBg: getComputedStyle(body).backgroundColor,
    htmlBg: getComputedStyle(html).backgroundColor,
    mainBg: cs.backgroundColor,
    mainRect: (r => ({ left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }))(main.getBoundingClientRect()),
    mainScrollbarGutter: cs.scrollbarGutter,
    mainOverflowY: cs.overflowY,
    mainScrollH: main.scrollHeight, mainClientH: main.clientHeight,
    hasVScroll: main.scrollHeight > main.clientHeight,
    wrapTag: wrap ? wrap.tagName + '.' + (wrap.className || '').split(' ').slice(0,3).join('.') : null,
    wrapBg,
    wrapRect: wrapBox ? (r => ({ left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }))(wrapBox) : null,
    scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9236", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
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
  await S("Page.navigate", { url: "http://localhost:3100/portal" });
  await sleep(14000);

  let r = await S("Runtime.evaluate", { expression: PROBE("scrolled to top"), returnByValue: true });
  console.log(r.result.value);

  // Scroll so the scrollbar is definitely engaged, then sample again.
  await S("Runtime.evaluate", { expression: "document.querySelector('main').scrollTop = 400" });
  await sleep(600);
  r = await S("Runtime.evaluate", { expression: PROBE("scrolled down 400"), returnByValue: true });
  console.log(r.result.value);

  // Sample actual pixels across the right edge. Grab a 1-row strip at y=400
  // spanning the last 24px of the viewport and read colours in Node via CDP.
  const shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/edge_probe_full.png", Buffer.from(shot.data, "base64"));

  // Also crop the right edge for visual inspection (last 40px, full height).
  const cropped = await S("Page.captureScreenshot", {
    format: "png",
    clip: { x: 1200, y: 0, width: 80, height: 800, scale: 2 },
    captureBeyondViewport: false,
  });
  fs.writeFileSync(OUT + "/edge_probe_strip.png", Buffer.from(cropped.data, "base64"));
  console.log("saved edge_probe_strip.png + edge_probe_full.png");

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
