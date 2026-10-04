// Confirm the loading skeleton's geometry matches the real /portal page, so the
// swap on arrival is a fill-in with no layout jump.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-layout-match2";
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9244, path: p, timeout: 2000 }, (x) => {
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

// Geometry of whatever page is mounted: the three card bottoms + total height.
const GEOM = `(() => {
  const cards = Array.from(document.querySelectorAll('.rounded-xl')).filter(c => {
    const p = c.parentElement;
    return p && p.className && /max-w-5xl/.test(p.className);
  });
  const main = document.querySelector('main[data-app-scroll]');
  return JSON.stringify({
    cardCount: cards.length,
    cardBottoms: cards.map(c => Math.round(c.getBoundingClientRect().bottom)),
    scrollH: main ? main.scrollHeight : null,
    // body height of the 3rd card (the credentials card)
    thirdCardH: cards[2] ? Math.round(cards[2].getBoundingClientRect().height) : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9244", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
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

  // 1. Real page (already loaded, fast).
  await S("Page.navigate", { url: "http://localhost:3100/portal" });
  await sleep(15000);
  let r = await S("Runtime.evaluate", { expression: GEOM, returnByValue: true });
  console.log("REAL PAGE:   ", r.result.value);

  // 2. Loading skeleton, held open with heavy throttling.
  await S("Network.emulateNetworkConditions", { offline: false, latency: 4000, downloadThroughput: 8000, uploadThroughput: 8000 });
  await S("Page.reload", { ignoreCache: true });
  let captured = null;
  for (let i = 0; i < 40; i++) {
    await sleep(300);
    const rr = await S("Runtime.evaluate", { expression: GEOM, returnByValue: true });
    const p = JSON.parse(rr.result.value);
    if (p.cardCount >= 3 && p.thirdCardH) { captured = rr.result.value; break; }
  }
  console.log("SKELETON:    ", captured || "not captured");

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
