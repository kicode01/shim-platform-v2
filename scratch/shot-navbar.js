// Screenshot the navbar right-hand area on /portal and /dashboard after the
// user-chip simplification, cropping tightly to the header bar.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-nav";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9227, path: p, timeout: 2000 }, (x) => {
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
  const ch = spawn(CHROME, ["--remote-debugging-port=9227", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
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

  const jar = "C:/Users/PC/AppData/Local/Temp/qa_member.txt";
  const pages = [
    { name: "nav_portal", url: "/portal", jar },
    { name: "nav_portal_mobile", url: "/portal", jar, w: 390 },
  ];

  for (const pg of pages) {
    await S("Network.clearBrowserCookies");
    const t = tok(pg.jar);
    if (t) await S("Network.setCookie", { name: "next-auth.session-token", value: t, domain: "localhost", path: "/", httpOnly: true });
    await S("Emulation.setDeviceMetricsOverride", { width: pg.w || 1280, height: 800, deviceScaleFactor: 2, mobile: !!pg.w });
    await S("Page.navigate", { url: "http://localhost:3100" + pg.url });
    await sleep(14000);
    // Crop the header bar: full width, top 64px.
    const r = await S("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: pg.w || 1280, height: 64, scale: 2 } });
    fs.writeFileSync(`${OUT}/${pg.name}.png`, Buffer.from(r.data, "base64"));
    console.log("saved", pg.name);
  }

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
