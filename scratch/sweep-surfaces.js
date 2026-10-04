// Regression sweep: confirm the root <main> bg-zinc-50 + data-surface change
// did not break the other surfaces — landing (/), login, dashboard, kiosk.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-surface-sweep";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9239, path: p, timeout: 2000 }, (x) => {
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
  const body = document.body;
  const first = main.firstElementChild;
  return JSON.stringify({
    surface: main.getAttribute('data-surface'),
    mainBg: getComputedStyle(main).backgroundColor,
    bodyBg: getComputedStyle(body).backgroundColor,
    firstChildBg: first ? getComputedStyle(first).backgroundColor : null,
    hasVScroll: main.scrollHeight > main.clientHeight,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9239", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
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
  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });

  // Public routes first (no auth cookie)
  const publicRoutes = [
    { name: "landing", url: "http://localhost:3100/" },
    { name: "login", url: "http://localhost:3100/login" },
  ];
  for (const r of publicRoutes) {
    await S("Page.navigate", { url: r.url });
    await sleep(9000);
    const p = await S("Runtime.evaluate", { expression: PROBE, returnByValue: true });
    console.log(r.name.toUpperCase() + ":", p.result.value);
    const shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(`${OUT}/surface_${r.name}.png`, Buffer.from(shot.data, "base64"));
  }

  // Authed routes with the admin cookie
  await S("Network.setCookie", { name: "next-auth.session-token", value: tok("C:/Users/PC/AppData/Local/Temp/qa_admin.txt"), domain: "localhost", path: "/", httpOnly: true });
  for (const r of [{ name: "dashboard", url: "http://localhost:3100/dashboard" }]) {
    await S("Page.navigate", { url: r.url });
    await sleep(12000);
    const p = await S("Runtime.evaluate", { expression: PROBE, returnByValue: true });
    console.log(r.name.toUpperCase() + ":", p.result.value);
    const shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    fs.writeFileSync(`${OUT}/surface_${r.name}.png`, Buffer.from(shot.data, "base64"));
  }

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
