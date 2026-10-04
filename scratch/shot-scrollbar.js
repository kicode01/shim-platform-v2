// Verify the validate page's scrollbar: it must be visible against the dark
// surface and must not shift the layout when content height changes.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-scroll";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9230, path: p, timeout: 2000 }, (x) => {
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

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9230", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
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
  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 2, mobile: false });

  // Probe 1: idle search state — content is shorter than the viewport, so the
  // scrollbar would normally be absent. Measure the main element's client width.
  await S("Page.navigate", { url: "http://localhost:3100/validate" });
  await sleep(14000);
  const idle = await S("Runtime.evaluate", {
    expression: "(function(){var m=document.querySelector('main[class*=scrollbar-gutter]')||document.querySelector('body>main');var cs=getComputedStyle(document.querySelector('.dark-scrollbar'));return JSON.stringify({mainClientW:m?m.clientWidth:null,mainOffsetW:m?m.offsetWidth:null,gutter:cs.scrollbarGutter,scrollbarColor:cs.scrollbarColor,docH:document.documentElement.scrollHeight,vpH:window.innerHeight});})()",
    returnByValue: true,
  });
  console.log("IDLE  ", idle.result.value);

  let r = await S("Page.captureScreenshot", { format: "png", clip: { x: 1280 - 40, y: 0, width: 40, height: 720, scale: 2 } });
  fs.writeFileSync(OUT + "/scroll_idle_edge.png", Buffer.from(r.data, "base64"));

  // Probe 2: force tall content by injecting a spacer, so a scrollbar is
  // definitely required. The main element's clientWidth must not change.
  await S("Runtime.evaluate", { expression: "(function(){var d=document.createElement('div');d.style.height='3000px';d.id='__probe';document.querySelector('.dark-scrollbar').appendChild(d);})()" });
  await sleep(1200);
  const tall = await S("Runtime.evaluate", {
    expression: "(function(){var m=document.querySelector('main[class*=scrollbar-gutter]')||document.querySelector('body>main');return JSON.stringify({mainClientW:m?m.clientWidth:null,mainOffsetW:m?m.offsetWidth:null});})()",
    returnByValue: true,
  });
  console.log("TALL  ", tall.result.value);

  r = await S("Page.captureScreenshot", { format: "png", clip: { x: 1280 - 40, y: 0, width: 40, height: 720, scale: 2 } });
  fs.writeFileSync(OUT + "/scroll_tall_edge.png", Buffer.from(r.data, "base64"));

  // Full-page shot of the dark validate surface for a visual check.
  r = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 720, scale: 1 } });
  fs.writeFileSync(OUT + "/scroll_validate_full.png", Buffer.from(r.data, "base64"));
  console.log("saved probes");

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
