// Screenshot the attendee wallet in its empty and populated states.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-wallet";
const OUT = "C:/temp/walletshots";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(path) {
  return new Promise((res, rej) => {
    const req = http.get({ host: "127.0.0.1", port: 9224, path, timeout: 2000 }, (r) => {
      let d = ""; r.on("data", c => (d += c)); r.on("end", () => res(JSON.parse(d)));
    });
    req.on("error", rej); req.on("timeout", () => req.destroy(new Error("t")));
  });
}
async function waitForPort(t = 30000) {
  const s = Date.now();
  while (Date.now() - s < t) { try { return await get("/json/version"); } catch (e) { await new Promise(r => setTimeout(r, 700)); } }
  throw new Error("no port");
}
function readToken(p) {
  try { for (const l of fs.readFileSync(p, "utf8").split(/\r?\n/)) { const q = l.split("\t"); if (q.length >= 7 && q[5] === "next-auth.session-token") return q[6].trim(); } } catch (e) {}
  return null;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, ["--remote-debugging-port=9224", `--user-data-dir=${PROFILE}`, "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank"], { stdio: "ignore" });
  process.on("exit", () => { try { chrome.kill(); } catch (e) {} });
  const ver = await waitForPort();
  const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pend = new Map();
  const send = (m, p = {}, sid) => new Promise((res, rej) => { const i = ++id; pend.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: sid })); });
  ws.on("message", (raw) => { const m = JSON.parse(raw); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); } });
  await new Promise(r => ws.on("open", r));
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable"); await S("Network.enable");

  const shots = JSON.parse(process.argv[2] || "[]");
  for (const s of shots) {
    if (s.jar === "none") await S("Network.clearBrowserCookies");
    else { await S("Network.clearBrowserCookies"); const t = readToken(s.jar); if (t) await S("Network.setCookie", { name: "next-auth.session-token", value: t, domain: "localhost", path: "/", httpOnly: true }); }
    await S("Emulation.setDeviceMetricsOverride", { width: s.w || 1200, height: s.h || 900, deviceScaleFactor: 2, mobile: false });
    await S("Page.navigate", { url: "http://localhost:3100" + s.url });
    await sleep(s.wait || 7000);
    const { data } = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    fs.writeFileSync(`${OUT}/${s.name}.png`, Buffer.from(data, "base64"));
    console.log("saved", s.name);
  }
  ws.close(); chrome.kill();
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
