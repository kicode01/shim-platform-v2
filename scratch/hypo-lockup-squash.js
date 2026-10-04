// Test hypothesis: is the wordmark squash caused by animating `fontSize`
// (which re-lays-out the text every frame) combined with the parent column
// changing `items-start` <-> `items-center` mid-transition?
//
// Method: temporarily patch the live DOM via CDP to (a) disable the font-size
// animation and (b) freeze the column alignment, then re-measure the wordmark
// width trajectory during the same transition. If the squash disappears, the
// hypothesis holds.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9272;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-hypo", "about:blank",
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

  // Sample the wordmark's own rect + its font-size + its parent's computed
  // alignItems, so we can see which variable moves in lockstep with the squash.
  const install = `(() => {
    window.__s = [];
    window.__t = null;
    window.__snap = () => {
      const h = document.querySelector('header'); if (!h) return;
      const word = [...h.querySelectorAll('span')].find(s => s.textContent.trim() === 'shim');
      if (!word) return;
      const b = word.getBoundingClientRect();
      const cs = getComputedStyle(word);
      const col = word.closest('div.relative');
      window.__s.push({
        t: +performance.now().toFixed(0),
        w: +b.width.toFixed(1), h: +b.height.toFixed(1), x: +b.x.toFixed(1),
        fs: cs.fontSize, ls: cs.letterSpacing,
        align: col ? getComputedStyle(col).alignItems : null,
        flex: col ? getComputedStyle(col).display + '/' + getComputedStyle(col).flexDirection : null,
      });
    };
    window.__t = setInterval(window.__snap, 16);
    return 'ok';
  })()`;

  const report = (out, label) => {
    console.log(`\n===== ${label} =====`);
    console.log("t\tw\th\tx\tfontSize\tletterSpacing\tcolAlign");
    let prev = null;
    for (const s of out) {
      const key = JSON.stringify([s.w, s.h, s.fs, s.ls, s.align]);
      if (key === prev) continue;
      prev = key;
      console.log(`${s.t}\t${s.w}\t${s.h}\t${s.x}\t${s.fs}\t${s.ls}\t${s.align}`);
    }
    const widths = out.map(s => s.w);
    console.log(`width range: ${Math.min(...widths).toFixed(1)} .. ${Math.max(...widths).toFixed(1)}`);
  };

  // --- Run A: as-is ---
  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 3000));
  await evaluate(install);
  await evaluate(`[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='/validate').click()`);
  await new Promise((r) => setTimeout(r, 2200));
  report(await evaluate(`(()=>{clearInterval(window.__t);return window.__s})()`), "A: as-is (landing -> validate)");

  // --- Run B: freeze the column alignment by pinning `items-start` from mount ---
  await send("Page.navigate", { url: "http://localhost:3100/" });
  await new Promise((r) => setTimeout(r, 500));
  await evaluate(`(() => {
    // Force the logo column to always use items-start, regardless of route.
    const st = document.createElement('style');
    st.id = 'freeze-align';
    st.textContent = 'header a[href="/"] div.relative{ align-items: flex-start !important; }';
    document.head.appendChild(st);
    return 'injected';
  })()`);
  await new Promise((r) => setTimeout(r, 2500));
  await evaluate(install);
  await evaluate(`[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='/validate').click()`);
  await new Promise((r) => setTimeout(r, 2200));
  report(await evaluate(`(()=>{clearInterval(window.__t);return window.__s})()`), "B: column alignment frozen (items-start always)");

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
