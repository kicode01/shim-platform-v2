// Confirm the mark squash: sample ONLY the mark, every frame, showing
// width / height / aspect ratio + the computed style w/h framer-motion wrote.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9274;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-mark", "about:blank",
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
    if (r.result?.exceptionDetails) return { exception: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 3000));

  const install = `(() => {
    window.__s = [];
    window.__t = setInterval(() => {
      const h = document.querySelector('header'); if (!h) return;
      const img = h.querySelector('img'); if (!img) return;
      const b = img.getBoundingClientRect();
      const cs = getComputedStyle(img);
      window.__s.push({
        t: +performance.now().toFixed(0),
        w: +b.width.toFixed(2), h: +b.height.toFixed(2),
        styleW: cs.width, styleH: cs.height,
        attrW: img.getAttribute('width'), attrH: img.getAttribute('height'),
        ratio: +(b.width / b.height).toFixed(3),
      });
    }, 16);
    return 'ok';
  })()`;
  await evaluate(install);
  await evaluate(`[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='/validate').click()`);
  await new Promise((r) => setTimeout(r, 2000));
  const out = await evaluate(`(()=>{clearInterval(window.__t);return window.__s})()`);

  console.log("t\trect w x h\tratio\tcomputed w/h\tattr w/h");
  let prev = null;
  for (const s of out) {
    const key = JSON.stringify([s.w, s.h, s.styleW, s.styleH]);
    if (key === prev) continue;
    prev = key;
    console.log(`${s.t}\t${s.w} x ${s.h}\t${s.ratio}\t${s.styleW} / ${s.styleH}\t${s.attrW} / ${s.attrH}`);
  }
  const ratios = out.map(s => s.ratio);
  console.log(`\naspect ratio range: ${Math.min(...ratios)} .. ${Math.max(...ratios)}  (should be constant 1.0 for a square mark)`);

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
