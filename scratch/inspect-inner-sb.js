// The dashboard's inner "Recent Events" scroller still shows native arrows.
// Get its exact selector chain + computed props and check which rules apply.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9286;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-inner", "about:blank",
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
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { ex: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  await send("CSS.enable");

  async function login(email, password) {
    await send("Page.navigate", { url: "http://localhost:3100/login" });
    await new Promise((r) => setTimeout(r, 2500));
    await evaluate(`(async () => {
      const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
        el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
      const inputs = [...document.querySelectorAll('input')];
      set(inputs.find(i=>i.type==='email')||inputs[0], '${email}');
      set(inputs.find(i=>i.type==='password')||inputs[1], '${password}');
      await new Promise(r=>setTimeout(r,150));
      const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
      if (b) b.click();
    })()`);
    await new Promise((r) => setTimeout(r, 4500));
  }

  await login("admin@shim.app", "admin123");
  await send("Page.navigate", { url: "http://localhost:3100/dashboard" });
  await new Promise((r) => setTimeout(r, 3500));

  // Find the inner scroller (not the root main) and dump everything about it.
  const res = await evaluate(`(() => {
    const inner = [...document.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      const canY = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
      return canY && el.offsetWidth - el.clientWidth > 5 && el !== document.querySelector('main[data-app-scroll]');
    })[0];
    if (!inner) return { err: 'no inner scroller' };
    const cs = getComputedStyle(inner);
    const par = inner.parentElement;
    const pcs = getComputedStyle(par);
    return {
      tag: inner.tagName.toLowerCase(),
      cls: String(inner.className),
      clientW: inner.clientWidth, offsetW: inner.offsetWidth,
      thickness: inner.offsetWidth - inner.clientWidth,
      sbWidth: cs.scrollbarWidth,
      sbColor: cs.scrollbarColor,
      hasCustomScrollbarClass: inner.classList.contains('custom-scrollbar'),
      hasNoScrollbarClass: inner.classList.contains('no-scrollbar') || inner.classList.contains('invisible-scrollbar'),
      inlineStyle: inner.getAttribute('style'),
      parent: { tag: par.tagName.toLowerCase(), cls: String(par.className).slice(0,80), sbWidth: pcs.scrollbarWidth },
      rootMainSbWidth: getComputedStyle(document.querySelector('main[data-app-scroll]')).scrollbarWidth,
      rootMainSurface: document.querySelector('main[data-app-scroll]').dataset.surface,
      // Is the element inside a [data-surface="light"] subtree?
      closestSurface: (() => { let n = inner; while (n) { if (n.dataset && n.dataset.surface) return n.dataset.surface; n = n.parentElement; } return 'none'; })(),
    };
  })()`);
  console.log(JSON.stringify(res, null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
