// Screenshot the /validate navbar's Portal button (member account) to confirm it
// now matches the Sign In style: solid zinc-700 fill with light text.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-portal-btn2";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9247, path: p, timeout: 2000 }, (x) => {
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

const FIND = `(() => {
  const els = Array.from(document.querySelectorAll('a')).filter(a => /^Portal$/.test(a.innerText.trim()));
  if (!els.length) return JSON.stringify({ found: false });
  const el = els[0];
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return JSON.stringify({
    found: true,
    bg: cs.backgroundColor,
    color: cs.color,
    borderRadius: cs.borderRadius,
    border: cs.borderTopWidth + ' ' + cs.borderTopColor,
    padding: cs.paddingTop + ' ' + cs.paddingRight,
    fontSize: cs.fontSize, fontWeight: cs.fontWeight,
    box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  });
})()`;

const SIGNIN = `(() => {
  const els = Array.from(document.querySelectorAll('a')).filter(a => /Sign In/.test(a.innerText));
  if (!els.length) return JSON.stringify({ found: false });
  const el = els[0];
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return JSON.stringify({
    found: true,
    bg: cs.backgroundColor,
    color: cs.color,
    borderRadius: cs.borderRadius,
    box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9247", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=2", "about:blank"], { stdio: "ignore" });
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

  // Logged-in member on /validate -> Portal button
  await S("Network.setCookie", { name: "next-auth.session-token", value: tok("C:/Users/PC/AppData/Local/Temp/qa_member.txt"), domain: "localhost", path: "/", httpOnly: true });
  await S("Page.navigate", { url: "http://localhost:3100/validate" });
  await sleep(12000);
  let r = await S("Runtime.evaluate", { expression: FIND, returnByValue: true });
  console.log("PORTAL BTN (/validate, member):", r.result.value);
  let shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/portal_btn_noicon.png", Buffer.from(shot.data, "base64"));
  const p = JSON.parse(r.result.value);
  if (p.found) {
    const crop = await S("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, p.box.x - 12), y: Math.max(0, p.box.y - 8), width: p.box.w + 24, height: p.box.h + 16, scale: 3 }, captureBeyondViewport: false });
    fs.writeFileSync(OUT + "/portal_btn_noicon_crop.png", Buffer.from(crop.data, "base64"));
  }

  // Logged-OUT on /validate -> Sign In button, for the side-by-side reference
  await S("Network.clearBrowserCookies");
  await S("Page.navigate", { url: "http://localhost:3100/validate" });
  await sleep(9000);
  r = await S("Runtime.evaluate", { expression: SIGNIN, returnByValue: true });
  console.log("SIGN IN BTN (/validate, anon):", r.result.value);
  const si = JSON.parse(r.result.value);
  if (si.found) {
    const crop = await S("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, si.box.x - 12), y: Math.max(0, si.box.y - 8), width: si.box.w + 24, height: si.box.h + 16, scale: 3 }, captureBeyondViewport: false });
    fs.writeFileSync(OUT + "/signin_btn_crop.png", Buffer.from(crop.data, "base64"));
  }

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
