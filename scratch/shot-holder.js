// Tight 2x crop of the wallet holder card so its proportions can be judged
// at the same scale the user sees in a clipboard screenshot.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-holder";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9228, path: p, timeout: 2000 }, (x) => {
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
  const ch = spawn(CHROME, ["--remote-debugging-port=9228", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
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

  for (const vp of [{ name: "holder_desktop", w: 1280 }, { name: "holder_mobile", w: 390 }]) {
    await S("Emulation.setDeviceMetricsOverride", { width: vp.w, height: 900, deviceScaleFactor: 2, mobile: vp.w < 600 });
    await S("Page.navigate", { url: "http://localhost:3100/portal" });
    await sleep(15000);
    const box = await S("Runtime.evaluate", {
      expression: "(function(){var c=document.querySelectorAll('section')[0];if(!c)return null;var r=c.getBoundingClientRect();return JSON.stringify({x:r.x,y:r.y,w:r.width,h:r.height});})()",
      returnByValue: true,
    });
    const b = JSON.parse(box.result.value);
    console.log(vp.name, "box", JSON.stringify(b));
    const r = await S("Page.captureScreenshot", { format: "png", clip: { x: b.x - 4, y: b.y - 4, width: b.w + 8, height: b.h + 8, scale: 2 }, captureBeyondViewport: true });
    fs.writeFileSync(`${OUT}/${vp.name}.png`, Buffer.from(r.data, "base64"));
    console.log("saved", vp.name);
  }

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
