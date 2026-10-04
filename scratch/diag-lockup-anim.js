// Record the navbar lockup rects over time across a landing -> validate navigation
// to see what the transition actually does (jump? collapse? flash?).
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9269;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-anim-diag", "about:blank",
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

  // Instrument: sample the lockup rects every ~16ms for the next 2s.
  const sampler = `(() => {
    const samples = [];
    const snap = () => {
      const link = document.querySelector('header a[href="/"]') || document.querySelector('header a[href^="/validate"]') || document.querySelector('header a:not([href="/login"])');
      if (!link) { samples.push({ t: performance.now(), missing: true }); return; }
      const img = link.querySelector('img');
      const spans = [...link.querySelectorAll('span')];
      const word = spans.find(s => s.textContent.trim() === 'shim');
      const tag = spans.find(s => s.textContent.includes('Digital Credential'));
      const suf = spans.find(s => /^\\.(validate|attendee|organizer)$/.test(s.textContent.trim()));
      const g = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); return { w:+b.width.toFixed(1), h:+b.height.toFixed(1), x:+b.x.toFixed(1), y:+b.y.toFixed(1) }; };
      samples.push({
        t: +performance.now().toFixed(0),
        href: link.getAttribute('href'),
        mark: g(img), word: g(word), tag: g(tag), suf: g(suf),
        wordColor: word ? getComputedStyle(word).color : null,
        tagOpacity: tag ? getComputedStyle(tag).opacity : null,
        sufOpacity: suf ? getComputedStyle(suf).opacity : null,
      });
    };
    window.__samples = samples;
    window.__timer = setInterval(snap, 16);
    return 'sampling';
  })()`;
  await evaluate(sampler);

  // Trigger the navigation.
  await evaluate(`(() => { const a = document.querySelector('header a[href="/validate"]') || [...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='/validate'); if(a) { a.click(); return 'clicked'; } return 'notfound'; })()`);

  await new Promise((r) => setTimeout(r, 2500));
  const out = await evaluate(`(() => { clearInterval(window.__timer); return window.__samples; })()`);

  // Print a compact timeline: only rows where something changed.
  let prev = null;
  console.log("t\thref\tmark\tword\ttag\tsuf\twordColor\ttagOp\tsufOp");
  for (const s of out) {
    const key = JSON.stringify([s.href, s.mark, s.word, s.tag, s.suf, s.wordColor, s.tagOpacity, s.sufOpacity]);
    if (key === prev) continue;
    prev = key;
    const f = (o) => o ? `${o.w}x${o.h}@${o.x},${o.y}` : "-";
    console.log(`${s.t}\t${s.href}\t${f(s.mark)}\t${f(s.word)}\t${f(s.tag)}\t${f(s.suf)}\t${s.wordColor}\t${s.tagOpacity}\t${s.sufOpacity}`);
  }
  console.log("\nchanged rows:", out.filter((s,i)=>i===0||JSON.stringify(s)!==JSON.stringify(out[i-1])).length, "of", out.length);

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
