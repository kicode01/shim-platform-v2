// Why are /portal, /dashboard, /dashboard/credentials, /dashboard/events
// rendering empty? Dump body text, visible elements, and auth state.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9291;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-blank", "about:blank",
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
  await send("Network.enable");

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
    const st = await evaluate(`(() => ({ path: location.pathname, txt: (document.body.innerText||'').slice(0,120) }))()`);
    console.log(`  after login(${email}): path=${st.path} txt="${st.txt.replace(/\n/g,' ')}"`);
  }

  await login("admin@shim.app", "admin123");

  for (const route of ["/dashboard", "/dashboard/credentials", "/dashboard/events", "/portal"]) {
    await send("Page.navigate", { url: BASE + route });
    await new Promise((r) => setTimeout(r, 4000));
    const info = await evaluate(`(() => {
      const main = document.querySelector('main[data-app-scroll]');
      const bodyTxt = (document.body.innerText||'').trim();
      // Count visible elements with text
      const vis = [...document.querySelectorAll('*')].filter(el => {
        const b = el.getBoundingClientRect();
        return b.width>0 && b.height>0 && el.children.length===0 && (el.textContent||'').trim().length>0;
      }).length;
      return {
        path: location.pathname,
        bodyLen: bodyTxt.length,
        bodyPreview: bodyTxt.slice(0, 200).replace(/\\n+/g, ' | '),
        visibleTextEls: vis,
        mainChildren: main ? main.children.length : -1,
        mainInner: main ? (main.innerText||'').trim().slice(0,150).replace(/\\n+/g,' | ') : '',
        hasSpinner: !!document.querySelector('[class*="animate-spin"], [class*="loader"]'),
        spinnerClasses: [...document.querySelectorAll('*')].filter(e=>String(e.className).includes('animate-spin')).map(e=>String(e.className).slice(0,40)).slice(0,3),
      };
    })()`);
    console.log(`\n=== ${route} ===`);
    console.log(JSON.stringify(info, null, 1));
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
