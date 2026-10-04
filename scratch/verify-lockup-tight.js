// Verify the tightened landing lockup: smaller gap between wordmark and tagline,
// left edges still flush, mark still spans the band.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9268;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-lockup-tight", "about:blank",
  ]);
  process.on("exit", () => { try { chrome.kill(); } catch {} });

  let target = null;
  for (let i = 0; i < 40 && !target; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const list = JSON.parse(await get(`http://127.0.0.1:${PORT}/json/list`));
      target = list.find((t) => t.type === "page");
    } catch {}
  }
  if (!target) { console.error("no target"); process.exit(1); }

  const ws = new WebSocket(target.webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r) => ws.on("open", r));
  let id = 0;
  const pending = new Map();
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  const probe = `(() => {
    const link = document.querySelector('header a[href="/"]');
    if (!link) return { error: 'no link' };
    const img = link.querySelector('img');
    const spans = [...link.querySelectorAll('span')];
    const word = spans.find(s => s.textContent.trim() === 'shim');
    const tag = spans.find(s => s.textContent.includes('Digital Credential'));
    const r = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { x:+b.x.toFixed(2), y:+b.y.toFixed(2), w:+b.width.toFixed(2), h:+b.height.toFixed(2),
               right:+b.right.toFixed(2), bottom:+b.bottom.toFixed(2), fontSize: cs.fontSize, mt: cs.marginTop }; };
    return { mark: r(img), word: r(word), tag: r(tag) };
  })()`;

  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 3000));
  const L = await evaluate(probe);
  console.log(JSON.stringify(L, null, 2));

  if (L && L.word && L.tag && L.mark) {
    console.log("\n--- tightened checks ---");
    console.log("left-edge delta (word.x - tag.x):", +(L.word.x - L.tag.x).toFixed(2));
    console.log("vertical gap (tag.top - word.bottom):", +(L.tag.y - L.word.bottom).toFixed(2));
    console.log("mark top/bottom:", L.mark.y, L.mark.bottom, "| band top/bottom:", Math.min(L.word.y, L.tag.y).toFixed(2), Math.max(L.word.bottom, L.tag.bottom).toFixed(2));
  }

  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 3, mobile: false });
  await new Promise((r) => setTimeout(r, 600));
  const crop = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 340, height: 68, scale: 3 } });
  fs.writeFileSync("scratch/lockup-tight.png", Buffer.from(crop.result.data, "base64"));
  console.log("\nwrote scratch/lockup-tight.png");

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
