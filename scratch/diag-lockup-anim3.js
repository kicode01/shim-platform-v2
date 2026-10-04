// Compare two transitions: landing -> validate, and validate -> landing.
// Focus on whether the tagline drifts/slides during its exit, and whether the
// wordmark jumps horizontally (items-start <-> items-center asymmetry).
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9271;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-anim-diag3", "about:blank",
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
    window.__samples = [];
    window.__last = null;
    window.__snap = () => {
      const header = document.querySelector('header');
      const img = header ? header.querySelector('img') : null;
      if (!img) return;
      const spans = [...header.querySelectorAll('span')];
      const word = spans.find(s => s.textContent.trim() === 'shim');
      const tag = spans.find(s => s.textContent.includes('Digital Credential'));
      const suf = spans.find(s => /^\\.(validate|attendee|organizer)$/.test(s.textContent.trim()));
      const g = (el) => { if(!el) return null; const b = el.getBoundingClientRect();
        return [ +b.width.toFixed(1), +b.x.toFixed(1) ]; };
      // transform from framer-motion on the tagline tells us if it is mid-exit
      const tagT = tag ? getComputedStyle(tag).transform : null;
      const sufT = suf ? getComputedStyle(suf).transform : null;
      window.__samples.push({ t: +performance.now().toFixed(0), path: location.pathname,
        mark: g(img), word: g(word), tag: g(tag), suf: g(suf),
        tagT, sufT, tagOp: tag ? getComputedStyle(tag).opacity : null,
        wordColor: word ? getComputedStyle(word).color : null });
    };
    window.__timer = setInterval(window.__snap, 16);
    return 'ok';
  })()`;

  async function runDirection(label, startUrl, clickHref) {
    await send("Page.navigate", { url: startUrl });
    await new Promise((r) => setTimeout(r, 3000));
    await evaluate(install);
    await evaluate(`(() => { const a = [...document.querySelectorAll('a')].find(x => x.getAttribute('href') === ${JSON.stringify(clickHref)}); if (a) a.click(); return !!a; })()`);
    await new Promise((r) => setTimeout(r, 2200));
    const out = await evaluate(`(() => { clearInterval(window.__timer); return window.__samples; })()`);
    console.log(`\n===== ${label} =====`);
    console.log("t\tpath\tword(w,x)\ttag(w,x)\tsuf(w,x)\twordColor\ttagOpacity\ttagTransform");
    let prev = null;
    for (const s of out) {
      const key = JSON.stringify([s.path, s.word, s.tag, s.suf, s.wordColor, s.tagOp, s.tagT]);
      if (key === prev) continue;
      prev = key;
      console.log(`${s.t}\t${s.path}\t${JSON.stringify(s.word)}\t${JSON.stringify(s.tag)}\t${JSON.stringify(s.suf)}\t${s.wordColor}\t${s.tagOp}\t${(s.tagT||'').slice(0,40)}`);
    }
  }

  await runDirection("landing -> validate", "http://localhost:3100/", "/validate");
  await runDirection("validate -> landing", "http://localhost:3100/validate", "/");

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
