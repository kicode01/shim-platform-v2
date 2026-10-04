// Verify the populated credentials card still renders correctly after the
// EmptyLedger refactor, then confirm the card body's height is unchanged so the
// page does not jump when the first credential lands.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-populated-check";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(p) {
  return new Promise((res, rej) => {
    const r = http.get({ host: "127.0.0.1", port: 9234, path: p, timeout: 2000 }, (x) => {
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
  const ch = spawn(CHROME, ["--remote-debugging-port=9234", "--user-data-dir=" + PROFILE, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
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
  await S("Network.setCookie", { name: "next-auth.session-token", value: tok("C:/Users/PC/AppData/Local/Temp/qa_admin.txt"), domain: "localhost", path: "/", httpOnly: true });

  // As admin, peek at the "Held credentials" card height from the populated
  // admin's own wallet is not the point — instead just confirm the attendee
  // route still renders a card and read its structure.
  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 1000, deviceScaleFactor: 2, mobile: false });
  await S("Page.navigate", { url: "http://localhost:3100/portal" });
  await sleep(14000);
  const r = await S("Runtime.evaluate", {
    expression: `(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(e => /Held credentials/i.test(e.textContent));
      if (!h2) return JSON.stringify({ err: 'not found' });
      const card = h2.closest('section');
      const cardBox = card.getBoundingClientRect();
      const head = card.querySelector('div.p-6');
      const rows = card.querySelectorAll('li').length;
      const ghost = card.querySelectorAll('[aria-hidden="true"]').length;
      const emptyMsg = !!(Array.from(card.querySelectorAll('h3')).find(e => /No credentials/i.test(e.textContent)));
      const body = cardBox.bottom - head.getBoundingClientRect().bottom;
      return JSON.stringify({
        role: document.body.innerText.slice(0,0),
        rows, ghostBackdrops: ghost, emptyMsg,
        cardHeight: Math.round(cardBox.height),
        bodyHeight: Math.round(body),
      });
    })()`,
    returnByValue: true,
  });
  console.log("admin wallet:", r.result.value);

  const shot = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(OUT + "/populated_check_admin.png", Buffer.from(shot.data, "base64"));
  console.log("saved populated_check_admin.png");

  ws.close(); ch.kill();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });
