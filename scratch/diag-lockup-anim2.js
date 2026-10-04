// Record the navbar lockup rects across a landing -> validate navigation.
// Uses a stable selector (the logo img itself) so it survives the route change.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9270;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-anim-diag2", "about:blank",
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

  const sampler = `(() => {
    const samples = [];
    const snap = () => {
      const header = document.querySelector('header');
      const img = header ? header.querySelector('img') : null;
      if (!img) { samples.push({ t: +performance.now().toFixed(0), noImg: true }); return; }
      const spans = [...header.querySelectorAll('span')];
      const word = spans.find(s => s.textContent.trim() === 'shim');
      const tag = spans.find(s => s.textContent.includes('Digital Credential'));
      const suf = spans.find(s => /^\\.(validate|attendee|organizer)$/.test(s.textContent.trim()));
      const g = (el) => { if(!el) return null; const b = el.getBoundingClientRect();
        return { w:+b.width.toFixed(1), h:+b.height.toFixed(1), x:+b.x.toFixed(1), right:+b.right.toFixed(1), y:+b.y.toFixed(1) }; };
      samples.push({
        t: +performance.now().toFixed(0),
        path: location.pathname,
        markSrc: img.getAttribute('src'),
        mark: g(img), word: g(word), tag: g(tag), suf: g(suf),
        wordColor: word ? getComputedStyle(word).color : null,
        wordFS: word ? getComputedStyle(word).fontSize : null,
        tagOp: tag ? getComputedStyle(tag).opacity : null,
        sufOp: suf ? getComputedStyle(suf).opacity : null,
      });
    };
    window.__samples = samples;
    window.__timer = setInterval(snap, 16);
    return 'sampling';
  })()`;
  await evaluate(sampler);

  const clickRes = await evaluate(`(() => {
    const a = [...document.querySelectorAll('a')].find(x => x.getAttribute('href') === '/validate');
    if (a) { a.click(); return 'clicked'; }
    return 'notfound';
  })()`);
  console.log("click:", clickRes);

  await new Promise((r) => setTimeout(r, 2500));
  const out = await evaluate(`(() => { clearInterval(window.__timer); return window.__samples; })()`);

  let prev = null;
  const f = (o) => o ? `${o.w}x${o.h}@${o.x},${o.y}` : "-";
  console.log("t\tpath\tmarkSrc\tmark\tword\ttag\tsuf\twordColor\twordFS\ttagOp\tsufOp");
  for (const s of out) {
    if (s.noImg) { console.log(`${s.t}\tNO-IMG`); continue; }
    const key = JSON.stringify([s.path, s.markSrc, s.mark, s.word, s.tag, s.suf, s.wordColor, s.wordFS, s.tagOp, s.sufOp]);
    if (key === prev) continue;
    prev = key;
    console.log(`${s.t}\t${s.path}\t${(s.markSrc||'').slice(0,14)}\t${f(s.mark)}\t${f(s.word)}\t${f(s.tag)}\t${f(s.suf)}\t${s.wordColor}\t${s.wordFS}\t${s.tagOp}\t${s.sufOp}`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
