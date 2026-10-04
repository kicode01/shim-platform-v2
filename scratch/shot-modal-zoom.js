// Tight, zoomed crop of the check-in pass modal so proportions can be judged.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-wallet3";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9226, path: p, timeout: 2000 }, (x) => {
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
  const ch = spawn(CHROME, ["--remote-debugging-port=9226", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
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
  await S("Emulation.setDeviceMetricsOverride", { width: 520, height: 640, deviceScaleFactor: 2, mobile: false });
  await S("Page.navigate", { url: "http://localhost:3100/portal" });
  await sleep(15000);
  await S("Runtime.evaluate", { expression: "Array.from(document.querySelectorAll('button')).find(b=>/check-in pass/i.test(b.innerText)) && Array.from(document.querySelectorAll('button')).find(b=>/check-in pass/i.test(b.innerText)).click()" });
  await sleep(2500);

  const box = await S("Runtime.evaluate", {
    expression: "(function(){var p=document.querySelector('div.fixed.z-\\\\[100\\\\]');var c=p&&p.firstElementChild;if(!c)return null;var r=c.getBoundingClientRect();return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height});})()",
    returnByValue: true,
  });
  console.log("box", box.result.value);
  const b = JSON.parse(box.result.value);
  const r = await S("Page.captureScreenshot", { format: "png", clip: { x: b.x - 10, y: b.y - 10, width: b.w + 20, height: b.h + 20, scale: 2 }, captureBeyondViewport: true });
  fs.writeFileSync(OUT + "/wallet-modal-zoom.png", Buffer.from(r.data, "base64"));
  console.log("saved zoom");
  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
