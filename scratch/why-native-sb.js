// Why is the light nested scroller still native? Report the exact computed
// scrollbar props on that specific element and its ancestors, plus which
// stylesheet rules match it.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9282;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-sbwhy", "about:blank",
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

  const info = await evaluate(`(() => {
    const el = document.querySelector('div.overflow-y-auto.bg-zinc-50\\\\/50')
      || [...document.querySelectorAll('div')].find(d => d.className.includes && String(d.className).includes('overflow-y-auto') && String(d.className).includes('bg-zinc-50'));
    if (!el) return { err: 'not found' };
    const chain = [];
    let n = el;
    while (n && n !== document.documentElement) {
      const cs = getComputedStyle(n);
      chain.push({
        tag: n.tagName.toLowerCase() + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\\s+/).slice(0,3).join('.') : ''),
        sbWidth: cs.scrollbarWidth,
        sbColor: cs.scrollbarColor,
        override: n.style.cssText ? n.style.cssText.slice(0,80) : '',
      });
      n = n.parentElement;
    }
    const cs = getComputedStyle(el);
    return {
      target: {
        className: String(el.className),
        clientWidth: el.clientWidth, offsetWidth: el.offsetWidth,
        thickness: el.offsetWidth - el.clientWidth,
        sbWidth: cs.scrollbarWidth, sbColor: cs.scrollbarColor,
      },
      chain,
      rootScrollbarWidth: getComputedStyle(document.documentElement).scrollbarWidth,
      bodyScrollbarWidth: getComputedStyle(document.body).scrollbarWidth,
    };
  })()`);
  console.log(JSON.stringify(info, null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
