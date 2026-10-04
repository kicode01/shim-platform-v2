const http = require("http");
const fs = require("fs");
const WebSocket = require("ws");

const OUT = "C:/temp/certshots";
fs.mkdirSync(OUT, { recursive: true });

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
  let id = 0; const pend = new Map(); const events = [];
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const msgId = ++id; pend.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
    else events.push(m);
  });
  await new Promise(r => ws.on("open", r));

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable");
  await S("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  async function shot(url, name, afterLoad) {
    await S("Page.navigate", { url });
    await new Promise(r => setTimeout(r, 4500));
    if (afterLoad) { await afterLoad(S); await new Promise(r => setTimeout(r, 2500)); }
    const { data } = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, "base64"));
    console.log("saved", name);
  }

  // 1. Attend form, then fill + submit to reach the success screen.
  await shot("http://localhost:3100/attend/cmuc9f5i8000313hwp7we4c5m", "flow-1-attend-form");
  await shot("http://localhost:3100/attend/cmuc9f5i8000313hwp7we4c5m", "flow-2-attend-result", async (S) => {
    const setVal = (sel, val) => `(() => { const el = document.querySelector(${JSON.stringify(sel)});
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, ${JSON.stringify(val)}); el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`;
    await S("Runtime.evaluate", { expression: setVal("#name", "Marcus Delgado") });
    await S("Runtime.evaluate", { expression: setVal("#email", "marcus.delgado@example.com") });
    await new Promise(r => setTimeout(r, 600));
    await S("Runtime.evaluate", { expression: `document.querySelector('form button[type=submit]').click()` });
    await new Promise(r => setTimeout(r, 9000));
  });

  // 2. Register page landed from an emailed claim link.
  await shot("http://localhost:3100/register?email=marcus.newattendee%40example.com&claim=cmusz0ffe0003u59p55180k19", "flow-3-register-claim");

  console.log("DONE");
  ws.close();
}
main().catch(e => { console.error("ERR", e); process.exit(1); });
