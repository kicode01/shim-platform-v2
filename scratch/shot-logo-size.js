// Confirm the logo/wordmark render at the right size on first paint across
// surfaces, including landing (36px) vs in-app (24px).
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-logo";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9232, path: p, timeout: 2000 }, (x) => {
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
  const ch = spawn(CHROME, ["--remote-debugging-port=9232", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
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

  const probe = "(function(){var img=document.querySelector('header img');var sp=Array.from(document.querySelectorAll('header span')).find(function(s){return s.textContent.trim()==='shim';});if(!img)return JSON.stringify({err:'no logo'});var r=img.getBoundingClientRect();var cs=sp?getComputedStyle(sp):null;return JSON.stringify({logoW:Math.round(r.width),logoH:Math.round(r.height),logoTop:Math.round(r.top),wordmarkFont:cs?cs.fontSize:null,wordmarkColor:cs?cs.color:null,headerH:document.querySelector('header').getBoundingClientRect().height});})()";

  const tests = [
    { name: "landing", url: "/", jar: null, w: 1280 },
    { name: "portal", url: "/portal", jar: "C:/Users/PC/AppData/Local/Temp/qa_member.txt", w: 1280 },
    { name: "validate", url: "/validate", jar: null, w: 1280 },
  ];

  for (const t of tests) {
    await S("Network.clearBrowserCookies");
    if (t.jar) {
      const tk = tok(t.jar);
      if (tk) await S("Network.setCookie", { name: "next-auth.session-token", value: tk, domain: "localhost", path: "/", httpOnly: true });
    }
    await S("Emulation.setDeviceMetricsOverride", { width: t.w, height: 800, deviceScaleFactor: 2, mobile: false });
    await S("Page.navigate", { url: "http://localhost:3100" + t.url });
    await sleep(1500);
    const early = await S("Runtime.evaluate", { expression: probe, returnByValue: true });
    console.log(t.name.padEnd(10), "EARLY(fast-ns)".padEnd(14), early.result.value);
    await sleep(13000);
    const late = await S("Runtime.evaluate", { expression: probe, returnByValue: true });
    console.log(t.name.padEnd(10), "SETTLED".padEnd(14), late.result.value);
    const r = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 420, height: 64, scale: 2 } });
    fs.writeFileSync(`${OUT}/logo_${t.name}.png`, Buffer.from(r.data, "base64"));
  }
  console.log("saved logos");

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
