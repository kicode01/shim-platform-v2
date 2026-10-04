// Capture the /portal loading skeleton. The spinner is gone now, so detect the
// state by the pulse animation instead of the spinner ring.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-loading-final";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9245, path: p, timeout: 2000 }, (x) => {
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `(() => {
  const main = document.querySelector('main[data-app-scroll]');
  const pulses = document.querySelectorAll('.animate-pulse');
  const card = pulses.length ? pulses[0].closest('.rounded-xl') : null;
  const lastCard = pulses.length ? pulses[pulses.length-1].closest('.rounded-xl') : null;
  const vh = window.innerHeight;
  return JSON.stringify({
    pulseCount: pulses.length,
    mainScrollH: main ? main.scrollHeight : null,
    mainClientH: main ? main.clientHeight : null,
    firstCardTop: card ? Math.round(card.getBoundingClientRect().top) : null,
    lastCardBottom: lastCard ? Math.round(lastCard.getBoundingClientRect().bottom) : null,
    contentBottom: lastCard ? Math.round(lastCard.getBoundingClientRect().bottom) : null,
    viewportH: vh,
    contentFillsViewport: lastCard ? lastCard.getBoundingClientRect().bottom > vh * 0.8 : null,
  });
})()`;

(async () => {
  const ch = spawn(CHROME, ["--remote-debugging-port=9245", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "--force-device-scale-factor=1", "about:blank"], { stdio: "ignore" });
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

  for (const vp of [{ name: "loading_desktop", w: 1280, h: 800 }, { name: "loading_laptop", w: 1440, h: 900 }]) {
    await S("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: false });
    await S("Network.emulateNetworkConditions", { offline: false, latency: 4000, downloadThroughput: 8000, uploadThroughput: 8000 });
    await S("Page.navigate", { url: "http://localhost:3100/portal" });
    let captured = false;
    for (let i = 0; i < 40; i++) {
      await sleep(300);
      const r = await S("Runtime.evaluate", { expression: PROBE, returnByValue: true });
      const p = JSON.parse(r.result.value);
      if (p.pulseCount > 0) {
        console.log(vp.name + ":", r.result.value);
        const shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        fs.writeFileSync(`${OUT}/${vp.name}.png`, Buffer.from(shot.data, "base64"));
        captured = true;
        break;
      }
    }
    if (!captured) console.log(vp.name + ": not captured");
    await S("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  }

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
