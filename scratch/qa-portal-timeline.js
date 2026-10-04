// Two issues to pin down:
// A) /portal first render: does it render only the navbar (bodyLen 16) then
//    fill in later? Sample the DOM over time after a fresh login.
// B) User switching: does /login redirect when already signed in, making a
//    second login a no-op? Sign out first, then log in as the other user.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9293;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-portal2", "about:blank",
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

  // ---- A: fresh login as member, then watch /portal render ----
  await send("Page.navigate", { url: BASE + "/login" });
  await new Promise((r) => setTimeout(r, 2500));
  await evaluate(`(async () => {
    const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el),'value'); d.set.call(el,v);
      el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
    const inputs = [...document.querySelectorAll('input')];
    set(inputs.find(i=>i.type==='email')||inputs[0], 'member@shim.app');
    set(inputs.find(i=>i.type==='password')||inputs[1], 'member123');
    await new Promise(r=>setTimeout(r,200));
    const b = [...document.querySelectorAll('button')].find(x=>/sign in|log in|continue/i.test(x.textContent));
    if (b) b.click();
  })()`);
  await new Promise((r) => setTimeout(r, 5000));
  console.log("after member login, path =", (await evaluate(`location.pathname`)));

  await send("Page.navigate", { url: BASE + "/portal" });
  // Sample body text length every 200ms for 6s
  const samples = await evaluate(`(async () => {
    const out = [];
    for (let i = 0; i < 30; i++) {
      out.push({ ms: i*200, path: location.pathname, len: (document.body.innerText||'').trim().length,
        preview: (document.body.innerText||'').trim().slice(0,60).replace(/\\n+/g,'|') });
      await new Promise(r => setTimeout(r, 200));
    }
    return out;
  })()`);
  console.log("\n--- /portal render timeline (fresh member) ---");
  let prev = null;
  for (const s of samples) {
    const k = s.len + '|' + s.path;
    if (k === prev) continue;
    prev = k;
    console.log(`  ${s.ms}ms path=${s.path} len=${s.len} "${s.preview}"`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
