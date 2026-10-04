// Focus: /portal as MEMBER (does it render the attendee wallet?), and the
// spinner reported on /dashboard/credentials. Also confirm the navbar suffix
// matches the role on each page.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9292;
const BASE = "http://localhost:3100";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-portal", "about:blank",
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
    if (r.result?.exceptionDetails) return { __ex: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  async function login(email, password) {
    await send("Page.navigate", { url: BASE + "/login" });
    await new Promise((r) => setTimeout(r, 2200));
    await evaluate(`(async () => {
      const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
        el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
      const inputs = [...document.querySelectorAll('input')];
      set(inputs.find(i=>i.type==='email')||inputs[0], ${JSON.stringify(email)});
      set(inputs.find(i=>i.type==='password')||inputs[1], ${JSON.stringify(password)});
      await new Promise(r=>setTimeout(r,200));
      const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
      if (b) b.click();
    })()`);
    await new Promise((r) => setTimeout(r, 4500));
  }

  const info = `(() => {
    const header = document.querySelector('header');
    const spans = header ? [...header.querySelectorAll('span')].map(s=>s.textContent.trim()) : [];
    const suffix = spans.find(t => /^\\.(organizer|attendee|validate)$/.test(t)) || '(none)';
    return {
      path: location.pathname,
      suffix,
      h1: (document.querySelector('h1')||{}).textContent || '(none)',
      bodyLen: (document.body.innerText||'').trim().length,
      preview: (document.body.innerText||'').trim().slice(0,220).replace(/\\n+/g,' | '),
      loaderEls: [...document.querySelectorAll('*')].filter(e=>/loader|animate-spin/i.test(String(e.className))).map(e=>e.tagName+'.'+String(e.className).slice(0,50)),
    };
  })()`;

  console.log("########## MEMBER ##########");
  await login("member@shim.app", "member123");
  for (const route of ["/portal", "/dashboard"]) {
    await send("Page.navigate", { url: BASE + route });
    await new Promise((r) => setTimeout(r, 4200));
    console.log(`\n--- member -> ${route} ---`);
    console.log(JSON.stringify(await evaluate(info), null, 1));
  }

  console.log("\n########## ADMIN ##########");
  await login("admin@shim.app", "admin123");
  for (const route of ["/dashboard/credentials", "/portal"]) {
    await send("Page.navigate", { url: BASE + route });
    await new Promise((r) => setTimeout(r, 4200));
    console.log(`\n--- admin -> ${route} ---`);
    console.log(JSON.stringify(await evaluate(info), null, 1));
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
