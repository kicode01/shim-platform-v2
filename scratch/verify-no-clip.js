// Guard: with the tagline absolutely positioned at top-full, confirm it is not
// clipped by the header (h-16 = 64px) and still inside the viewport box.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9278;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-clip", "about:blank",
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

  for (const [label, url] of [["landing", "http://localhost:3100/"], ["login", "http://localhost:3100/login"]]) {
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 2800));
    const out = await evaluate(`(() => {
      const header = document.querySelector('header');
      const hb = header.getBoundingClientRect();
      const hcs = getComputedStyle(header);
      const img = header.querySelector('img');
      const spans = [...header.querySelectorAll('span')];
      const word = spans.find(s => s.textContent.trim() === 'shim');
      const tag = spans.find(s => s.textContent.includes('Digital Credential'));
      const g = (el) => { const b = el.getBoundingClientRect(); return { y:+b.y.toFixed(2), bottom:+b.bottom.toFixed(2), h:+b.height.toFixed(2), x:+b.x.toFixed(2), w:+b.width.toFixed(2), right:+b.right.toFixed(2) }; };
      return {
        header: { y:+hb.y.toFixed(2), bottom:+hb.bottom.toFixed(2), h:+hb.height.toFixed(2), overflow:hcs.overflow },
        mark: g(img), word: g(word), tag: g(tag),
        tagInsideHeader: tag.getBoundingClientRect().bottom <= hb.bottom,
        tagClipped: hcs.overflow !== 'visible',
      };
    })()`);
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(out, null, 2));
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
