// Measure the header's left/right inset on the landing page vs /validate, then
// screenshot both headers, to confirm the landing bar now runs edge-to-edge.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-header-edge2";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9249, path: p, timeout: 2000 }, (x) => {
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

// Measure: viewport width, header rect, logo rect (left inset), last right item
// (right inset).
const MEASURE = `(() => {
  const header = document.querySelector('header');
  const inner = header.firstElementChild;
  const img = header.querySelector('img');
  const logoLink = img ? img.closest('a') : null;
  // right-most actionable element in the header
  const rights = Array.from(header.querySelectorAll('a, button'));
  let rightmost = null;
  for (const el of rights) {
    const r = el.getBoundingClientRect();
    if (!rightmost || r.right > rightmost.r.right) rightmost = { el, r };
  }
  const hb = header.getBoundingClientRect();
  return JSON.stringify({
    viewportW: window.innerWidth,
    headerRect: (r => ({ left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }))(hb),
    innerRect: (r => ({ left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) }))(inner.getBoundingClientRect()),
    logoLeft: logoLink ? Math.round(logoLink.getBoundingClientRect().left) : null,
    rightmostRight: rightmost ? Math.round(rightmost.r.right) : null,
    rightmostLabel: rightmost ? rightmost.el.innerText.trim().slice(0, 14) : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9249", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=2", "about:blank"], { stdio: "ignore" });
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
  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 2, mobile: false });

  for (const route of [
    { name: "landing", url: "http://localhost:3100/" },
    { name: "login", url: "http://localhost:3100/login" },
  ]) {
    await S("Page.navigate", { url: route.url });
    await sleep(10000);
    const r = await S("Runtime.evaluate", { expression: MEASURE, returnByValue: true });
    console.log(route.name.toUpperCase() + ":", r.result.value);
    // Crop just the header band.
    const shot = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 64, scale: 2 }, captureBeyondViewport: false });
    fs.writeFileSync(`${OUT}/header_${route.name}.png`, Buffer.from(shot.data, "base64"));
  }

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
