// Measure the landing navbar logo lockup after the right-align + scale change.
// Checks: mark box, wordmark box, tagline box, right edges, vertical gap.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9262;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(d));
    }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-lockup-align",
    "about:blank",
  ]);
  const cleanup = () => { try { chrome.kill(); } catch {} };
  process.on("exit", cleanup);

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

  await send("Page.enable");
  await send("Runtime.enable");

  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  const probe = `(() => {
    const link = document.querySelector('header a[href="/"]') || document.querySelector('a[href="/"]');
    if (!link) return { error: 'no link' };
    const img = link.querySelector('img');
    const spans = [...link.querySelectorAll('span')];
    const word = spans.find(s => s.textContent.trim() === 'shim');
    const tag = spans.find(s => s.textContent.includes('Digital Credential'));
    const r = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { x:+b.x.toFixed(1), y:+b.y.toFixed(1), w:+b.width.toFixed(1), h:+b.height.toFixed(1),
               right:+b.right.toFixed(1), bottom:+b.bottom.toFixed(1), centerY:+(b.y+b.height/2).toFixed(1),
               fontSize: cs.fontSize, mt: cs.marginTop }; };
    return { mark: r(img), word: r(word), tag: r(tag) };
  })()`;

  const results = {};
  const pages = [
    ["landing", "http://localhost:3100/"],
    ["login", "http://localhost:3100/login"],
    ["validate", "http://localhost:3100/validate"],
  ];
  for (const [name, url] of pages) {
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 2500));
    results[name] = await evaluate(probe);
  }

  console.log(JSON.stringify(results, null, 2));

  const L = results.landing;
  if (L && L.mark && L.word && L.tag) {
    console.log("\n--- landing checks ---");
    console.log("right-edge delta (word.right - tag.right):", +(L.word.right - L.tag.right).toFixed(2));
    console.log("word height:", L.word.h, "fontSize:", L.word.fontSize);
    console.log("vertical gap (tag.top - word.bottom):", +(L.tag.y - L.word.bottom).toFixed(2));
    console.log("mark top:", L.mark.y, "band top:", Math.min(L.word.y, L.tag.y).toFixed(1));
    console.log("mark bottom:", L.mark.bottom, "band bottom:", Math.max(L.word.bottom, L.tag.bottom).toFixed(1));
    console.log("tag width:", L.tag.w, "word width:", L.word.w);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
