// Verify the fixed transition: both directions, checking that
// (a) the wordmark x stays pinned, (b) the tagline does not slide, (c) final
// geometry still matches the approved landing layout.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9275;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-fixed", "about:blank",
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
      const tag = spans.find(s => s.textContent.includes('Digital Credential'));
      const suf = spans.find(s => /^\\.(validate|attendee|organizer)$/.test(s.textContent.trim()));
      const g = (el) => { if(!el) return null; const b = el.getBoundingClientRect();
        return { x:+b.x.toFixed(2), y:+b.y.toFixed(2), w:+b.width.toFixed(2), h:+b.height.toFixed(2) }; };
      window.__s.push({ t:+performance.now().toFixed(0), path: location.pathname,
        mark: g(img), word: g(word), tag: g(tag), suf: g(suf),
        tagOp: tag ? getComputedStyle(tag).opacity : null,
        tagT: tag ? getComputedStyle(tag).transform : null });
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
    console.log(`\n===== ${label} =====`);
    console.log("t\tpath\tword(x,w)\ttag(x,w,op)\tmark(x,w)");
    let prev = null;
    for (const s of out) {
      const key = JSON.stringify([s.path, s.word, s.tag, s.mark]);
      if (key === prev) continue;
      prev = key;
      const w = s.word ? `${s.word.x},${s.word.w}` : "-";
      const t = s.tag ? `${s.tag.x},${s.tag.w},${(s.tagOp||'').slice(0,5)}` : "-";
      const m = s.mark ? `${s.mark.x},${s.mark.w}` : "-";
      console.log(`${s.t}\t${s.path}\t${w}\t${t}\t${m}`);
    }
    // Metrics
    const wx = out.filter(s => s.word).map(s => s.word.x);
    const tx = out.filter(s => s.tag).map(s => s.tag.x);
    const mw = out.filter(s => s.mark).map(s => s.mark.w);
    console.log(`word.x range: ${Math.min(...wx)} .. ${Math.max(...wx)}  (drift ${(Math.max(...wx)-Math.min(...wx)).toFixed(2)})`);
    if (tx.length) console.log(`tag.x range: ${Math.min(...tx)} .. ${Math.max(...tx)}  (drift ${(Math.max(...tx)-Math.min(...tx)).toFixed(2)})`);
    console.log(`mark.w range: ${Math.min(...mw)} .. ${Math.max(...mw)}`);
  }

  await run("FIXED: landing -> validate", "http://localhost:3100/", "/validate");
  await run("FIXED: validate -> landing", "http://localhost:3100/validate", "/");

  // Final resting geometry on landing.
  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 3000));
  const final = await evaluate(`(() => {
    const h = document.querySelector('header');
    const img = h.querySelector('img');
    const spans = [...h.querySelectorAll('span')];
    const word = spans.find(s => s.textContent.trim() === 'shim');
    const tag = spans.find(s => s.textContent.includes('Digital Credential'));
    const g = (el) => { const b = el.getBoundingClientRect(); return { x:+b.x.toFixed(2), y:+b.y.toFixed(2), w:+b.width.toFixed(2), h:+b.height.toFixed(2), right:+b.right.toFixed(2), bottom:+b.bottom.toFixed(2) }; };
    return { mark: g(img), word: g(word), tag: g(tag) };
  })()`);
  console.log("\n===== final landing geometry =====");
  console.log(JSON.stringify(final, null, 2));
  console.log("left-edge delta (word.x - tag.x):", +(final.word.x - final.tag.x).toFixed(2));
  console.log("vertical gap (tag.y - word.bottom):", +(final.tag.y - final.word.bottom).toFixed(2));
  console.log("mark bt:", final.mark.y, final.mark.bottom, "| band:", final.word.y, Math.max(final.word.bottom, final.tag.bottom));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
