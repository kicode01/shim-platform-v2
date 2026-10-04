// Audit scrollbars on authenticated pages (dashboard, portal, and sub-routes).
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9280;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-sb-auth", "about:blank",
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
    if (r.result?.exceptionDetails) return { exception: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  const audit = `(() => {
    const out = [];
    for (const el of [...document.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      const oy = cs.overflowY, ox = cs.overflowX;
      const canY = oy === 'auto' || oy === 'scroll';
      const canX = ox === 'auto' || ox === 'scroll';
      if (!canY && !canX) continue;
      const thY = el.offsetWidth - el.clientWidth;
      const thX = el.offsetHeight - el.clientHeight;
      const desc = el.tagName.toLowerCase()
        + (el.dataset.appScroll !== undefined ? '[data-app-scroll]' : '')
        + (el.dataset.surface ? '[surface='+el.dataset.surface+']' : '')
        + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).slice(0,5).join('.') : '');
      out.push({
        el: desc.slice(0, 100),
        sbW: cs.scrollbarWidth, sbC: cs.scrollbarColor, gutter: cs.scrollbarGutter,
        thY, thX,
        scrollsY: el.scrollHeight > el.clientHeight + 1,
      });
    }
    return out;
  })()`;

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

  const routes = [
    ["/dashboard", "admin@shim.app", "admin123"],
    ["/dashboard/credentials", "admin@shim.app", "admin123"],
    ["/dashboard/events", "admin@shim.app", "admin123"],
    ["/dashboard/audit", "admin@shim.app", "admin123"],
    ["/dashboard/generate", "admin@shim.app", "admin123"],
    ["/dashboard/templates", "admin@shim.app", "admin123"],
    ["/portal", "member@shim.app", "member123"],
  ];

  for (const [route, email, pw] of routes) {
    await login(email, pw);
    await send("Page.navigate", { url: "http://localhost:3100" + route });
    await new Promise((r) => setTimeout(r, 3200));
    const res = await evaluate(audit);
    console.log(`\n########## ${route} ##########`);
    if (!Array.isArray(res)) { console.log("  error:", JSON.stringify(res)); continue; }
    for (const c of res) {
      const flag = c.thY > 10 ? "  <== NATIVE/THICK" : "";
      console.log(`  thY=${String(c.thY).padStart(2)} sbW=${(c.sbW||'').padEnd(5)} gutter=${(c.gutter||'').padEnd(6)} scrolls=${c.scrollsY?'Y':'-'} ${c.el}${flag}`);
    }
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
