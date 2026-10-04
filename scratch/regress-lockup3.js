// Regression check: the logo lockup restructure touched shared markup, so
// verify the mark/wordmark alignment on every navbar mode, not just landing.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-lockup-regress4";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9261, path: p, timeout: 2000 }, (x) => {
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

const MEASURE = `(() => {
  const header = document.querySelector('header');
  const img = header.querySelector('img');
  const spans = Array.from(header.querySelectorAll('span'));
  const wordmark = spans.find(s => /^shim/.test(s.textContent.trim()));
  const b = e => e ? (r => ({ t:+r.top.toFixed(1), b:+r.bottom.toFixed(1), h:+r.height.toFixed(1) }))(e.getBoundingClientRect()) : null;
  const mb=b(img), wb=b(wordmark);
  return JSON.stringify({
    markH: mb ? mb.h : null,
    wordmarkH: wb ? wb.h : null,
    centerDeltaY: (mb && wb) ? +(( mb.t+mb.b)/2 - (wb.t+wb.b)/2).toFixed(1) : null,
    wordmarkText: wordmark ? wordmark.textContent.trim().slice(0,20) : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9261", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=2", "about:blank"], { stdio: "ignore" });
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

  // anonymous: landing, validate, login
  for (const r of [{n:"landing",u:"http://localhost:3100/"},{n:"validate",u:"http://localhost:3100/validate"},{n:"login",u:"http://localhost:3100/login"}]) {
    await S("Page.navigate", { url: r.u }); await sleep(9000);
    const m = await S("Runtime.evaluate", { expression: MEASURE, returnByValue: true });
    console.log(r.n.toUpperCase() + ":", m.result.value);
    const shot = await S("Page.captureScreenshot", { format: "png", clip: { x:0,y:0,width:340,height:64,scale:2 }, captureBeyondViewport: false });
    fs.writeFileSync(`${OUT}/lockup4_${r.n}.png`, Buffer.from(shot.data, "base64"));
  }

  // member: portal
  await S("Network.setCookie", { name: "next-auth.session-token", value: tok("C:/Users/PC/AppData/Local/Temp/qa_member.txt"), domain: "localhost", path: "/", httpOnly: true });
  await S("Page.navigate", { url: "http://localhost:3100/portal" }); await sleep(12000);
  let m = await S("Runtime.evaluate", { expression: MEASURE, returnByValue: true });
  console.log("PORTAL:", m.result.value);
  let shot = await S("Page.captureScreenshot", { format: "png", clip: { x:0,y:0,width:340,height:64,scale:2 }, captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/lockup4_portal.png", Buffer.from(shot.data, "base64"));

  // admin: dashboard
  await S("Network.setCookie", { name: "next-auth.session-token", value: tok("C:/Users/PC/AppData/Local/Temp/qa_admin.txt"), domain: "localhost", path: "/", httpOnly: true });
  await S("Page.navigate", { url: "http://localhost:3100/dashboard" }); await sleep(12000);
  m = await S("Runtime.evaluate", { expression: MEASURE, returnByValue: true });
  console.log("DASHBOARD:", m.result.value);
  shot = await S("Page.captureScreenshot", { format: "png", clip: { x:0,y:0,width:340,height:64,scale:2 }, captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/lockup4_dashboard.png", Buffer.from(shot.data, "base64"));

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
