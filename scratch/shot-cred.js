const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const OUT = "C:/temp/certshots";
const COOKIE = fs.readFileSync("C:/temp/admin-cookie.txt", "utf8").trim();

function get(path) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: 9222, path }, (r) => {
      let d = ""; r.on("data", c => d += c); r.on("end", () => res(JSON.parse(d)));
    }).on("error", rej);
  });
}

async function main() {
  const ver = await get("/json/version");
  const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pend = new Map();
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const msgId = ++id; pend.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  });
  await new Promise(r => ws.on("open", r));

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable"); await S("Network.enable");
  await S("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  // Set the auth cookie for localhost
  const [name, value] = COOKIE.split("=");
  await S("Network.setCookie", { name, value, domain: "localhost", path: "/" });

  await S("Page.navigate", { url: "http://localhost:3100/dashboard/credentials" });
  await new Promise(r => setTimeout(r, 8000));
  // Force all hover-only action groups visible and give them a visible tint.
  await S("Runtime.evaluate", { expression: `(() => {
    const style = document.createElement('style');
    style.textContent = '.group .opacity-0 { opacity: 1 !important; }';
    document.head.appendChild(style);
    return true;
  })()` });
  await new Promise(r => setTimeout(r, 1500));
  const { data } = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  fs.writeFileSync(`${OUT}/credentials-resend.png`, Buffer.from(data, "base64"));
  console.log("saved credentials-resend");
  ws.close();
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
