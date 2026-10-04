// Separate REAL drift from expected mark-width-driven movement.
// Key insight: the mark grows 24 -> 52 (+28px), so the wordmark's x MUST move
// +28 to stay gap-2.5 clear of it. Real drift = word.x - (mark.x + mark.w + gap).
// Also measure word.x - mark.right to see if the gap itself wobbles.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9276;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-drift", "about:blank",
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

  const install = `(() => {
    window.__s = [];
    window.__t = setInterval(() => {
      const h = document.querySelector('header'); if (!h) return;
      const img = h.querySelector('img');
      const spans = [...h.querySelectorAll('span')];
      const word = spans.find(s => s.textContent.trim() === 'shim');
      if (!img || !word) return;
      const mb = img.getBoundingClientRect();
      const wb = word.getBoundingClientRect();
      window.__s.push({
        t:+performance.now().toFixed(0), path: location.pathname,
        gap: +(wb.x - mb.right).toFixed(2),          // should stay 10 (gap-2.5)
        markW: +mb.width.toFixed(2),
        markH: +mb.height.toFixed(2),
        markTop: +mb.y.toFixed(2),
        wordTop: +wb.y.toFixed(2),
        wordW: +wb.width.toFixed(2),
        // word vertical offset relative to mark top — should be constant
        wRelm: +(wb.y - mb.y).toFixed(2),
      });
    }, 16);
    return 'ok';
  })()`;

  async function run(label, start, href) {
    await send("Page.navigate", { url: start });
    await new Promise((r) => setTimeout(r, 3000));
    await evaluate(install);
    await evaluate(`[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')===${JSON.stringify(href)}).click()`);
    await new Promise((r) => setTimeout(r, 2200));
    const out = await evaluate(`(()=>{clearInterval(window.__t);return window.__s})()`);
    const gaps = out.map(s => s.gap);
    const rel = out.map(s => s.wRelm);
    const mt = out.map(s => s.markTop);
    const mh = out.map(s => s.markH);
    console.log(`\n===== ${label} =====`);
    console.log(`frames: ${out.length}`);
    console.log(`gap (word.x - mark.right):   ${Math.min(...gaps)} .. ${Math.max(...gaps)}  (should be flat 10)`);
    console.log(`word.y - mark.y:            ${Math.min(...rel)} .. ${Math.max(...rel)}  (should be flat)`);
    console.log(`mark top:                   ${Math.min(...mt)} .. ${Math.max(...mt)}  (should be flat 5.5)`);
    console.log(`mark height:                ${Math.min(...mh)} .. ${Math.max(...mh)}`);
  }

  await run("landing -> validate", "http://localhost:3100/", "/validate");
  await run("validate -> landing", "http://localhost:3100/validate", "/");
  await run("landing -> login", "http://localhost:3100/", "/login");

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
