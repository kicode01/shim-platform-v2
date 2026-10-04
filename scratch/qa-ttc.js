// Measure "time to content" (skeleton -> real content) for every route.
// Also record horizontal overflow and element count at 3 breakpoints.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9296;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-ttc", "about:blank",
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
    await new Promise((r) => setTimeout(r, 2300));
    await evaluate(`(async () => {
      const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
        el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
      const inputs = [...document.querySelectorAll('input')];
      if (inputs.length < 2) return;
      set(inputs.find(i=>i.type==='email')||inputs[0], ${JSON.stringify(email)});
      set(inputs.find(i=>i.type==='password')||inputs[1], ${JSON.stringify(password)});
      await new Promise(r=>setTimeout(r,200));
      const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
      if (b) b.click();
    })()`);
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Poll until main has substantial text (content arrived), up to 12s.
  const ttcScript = (maxMs) => `(async () => {
    const t0 = performance.now();
    const step = 100;
    let elapsed = 0;
    while (elapsed < ${maxMs}) {
      const main = document.querySelector('main[data-app-scroll]');
      const txt = main ? (main.innerText||'').trim().length : 0;
      const pulse = document.querySelectorAll('[class*="animate-pulse"]').length;
      if (txt > 80 && pulse === 0) return { ms: Math.round(performance.now() - t0), txt, ready: true };
      await new Promise(r => setTimeout(r, step));
      elapsed = performance.now() - t0;
    }
    const main = document.querySelector('main[data-app-scroll]');
    return { ms: Math.round(elapsed), txt: main ? (main.innerText||'').trim().length : 0,
             pulse: document.querySelectorAll('[class*="animate-pulse"]').length, ready: false };
  })()`;

  async function measureRoute(route, label) {
    await send("Page.navigate", { url: BASE + route });
    const r = await evaluate(ttcScript(12000));
    console.log(`  ${label.padEnd(28)} ttc=${String(r.ms).padStart(5)}ms text=${String(r.txt).padStart(4)} ready=${r.ready}`);
    return r;
  }

  // Public routes
  console.log("=== PUBLIC (no auth) ===");
  for (const r of ["/", "/login", "/register", "/validate"]) await measureRoute(r, r);

  // Member
  console.log("\n=== MEMBER ===");
  await login("member@shim.app", "member123");
  await measureRoute("/portal", "/portal (member)");

  // Admin
  console.log("\n=== ADMIN ===");
  await send("Page.navigate", { url: BASE + "/logout" });
  await new Promise((r) => setTimeout(r, 2500));
  await login("admin@shim.app", "admin123");
  for (const r of ["/dashboard", "/dashboard/credentials", "/dashboard/events", "/dashboard/audit", "/dashboard/generate", "/dashboard/templates", "/dashboard/templates/new"]) {
    await measureRoute(r, r);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
