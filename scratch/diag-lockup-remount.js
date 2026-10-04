// The geometry ratio is constant, so the squash theory is dead. New suspicion:
// the transition is not actually being *animated* by framer-motion in a
// continuous way — the first ~2 frames are instant re-layouts (a "pop"), and
// only then does the tween run. Also check whether React is remounting the
// header on navigation (which would restart the animation from `initial`).
//
// Method: mark the live DOM node with a probe attribute, navigate, and see if
// the SAME node survives. If the node is replaced, the animation restarts.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9273;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-remount", "about:blank",
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

  // Tag the current header, wordmark, tagline and the <main> wrapper.
  const tagged = await evaluate(`(() => {
    const h = document.querySelector('header');
    const word = [...h.querySelectorAll('span')].find(s => s.textContent.trim() === 'shim');
    const tag = [...h.querySelectorAll('span')].find(s => s.textContent.includes('Digital Credential'));
    const img = h.querySelector('img');
    if (h) h.setAttribute('data-probe','A');
    if (word) word.setAttribute('data-probe','A');
    if (tag) tag.setAttribute('data-probe','A');
    if (img) img.setAttribute('data-probe','A');
    window.__mark = { header: h, word, tag, img, path: location.pathname };
    return { header: !!h, word: !!word, tag: !!tag, img: !!img };
  })()`);
  console.log("tagged:", JSON.stringify(tagged));

  // Sample per-frame: does the probe attribute survive? what is the mark's src?
  const install = `(() => {
    window.__s = [];
    window.__t = setInterval(() => {
      const h = document.querySelector('header');
      const word = h ? [...h.querySelectorAll('span')].find(s => s.textContent.trim() === 'shim') : null;
      const tag = h ? [...h.querySelectorAll('span')].find(s => s.textContent.includes('Digital Credential')) : null;
      const img = h ? h.querySelector('img') : null;
      const g = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [+b.width.toFixed(1), +b.x.toFixed(1)]; };
      window.__s.push({
        t: +performance.now().toFixed(0),
        path: location.pathname,
        headerProbe: h ? h.getAttribute('data-probe') : null,
        wordProbe: word ? word.getAttribute('data-probe') : null,
        tagProbe: tag ? tag.getAttribute('data-probe') : null,
        imgProbe: img ? img.getAttribute('data-probe') : null,
        word: g(word), tag: g(tag), mark: g(img),
        markSrc: img ? img.getAttribute('src') : null,
      });
    }, 16);
    return 'ok';
  })()`;
  await evaluate(install);

  await evaluate(`[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='/validate').click()`);
  await new Promise((r) => setTimeout(r, 2000));
  const out = await evaluate(`(()=>{clearInterval(window.__t);return window.__s})()`);

  console.log("\nt\tpath\thdrProbe\twordProbe\ttagProbe\timgProbe\tmarkSrc\tmark\tword\ttag");
  let prev = null;
  for (const s of out) {
    const key = JSON.stringify([s.path, s.headerProbe, s.wordProbe, s.tagProbe, s.imgProbe, s.markSrc, s.word, s.tag, s.mark]);
    if (key === prev) continue;
    prev = key;
    console.log(`${s.t}\t${s.path}\t${s.headerProbe}\t${s.wordProbe}\t${s.tagProbe}\t${s.imgProbe}\t${(s.markSrc||'').slice(0,12)}\t${JSON.stringify(s.mark)}\t${JSON.stringify(s.word)}\t${JSON.stringify(s.tag)}`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
