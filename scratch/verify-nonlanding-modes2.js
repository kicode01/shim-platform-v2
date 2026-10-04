// Sign in via the UI, then measure the portal + dashboard navbar modes.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9265;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-lockup-modes2", "about:blank",
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
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  const probe = `(() => {
    const header = document.querySelector('header');
    if (!header) return { error: 'no header' };
    const imgs = [...header.querySelectorAll('img')];
    const spans = [...header.querySelectorAll('span')].filter(s => s.textContent.trim());
    const word = spans.find(s => s.textContent.trim() === 'shim');
    const tag = spans.find(s => s.textContent.includes('Digital Credential'));
    const suffixes = spans.map(s=>s.textContent.trim()).filter(t => t.startsWith('.'));
    const r = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { w:+b.width.toFixed(1), h:+b.height.toFixed(1), x:+b.x.toFixed(1), right:+b.right.toFixed(1), fontSize: cs.fontSize }; };
    const col = word ? word.closest('div.relative') : null;
    return { mark: r(imgs[0]), word: r(word), tag: r(tag), suffixes,
             colAlign: col ? getComputedStyle(col).alignItems : null,
             headerText: header.innerText.replace(/\\n/g,' | ') };
  })()`;

  async function login(email, password) {
    await send("Page.navigate", { url: "http://localhost:3100/login" });
    await new Promise((r) => setTimeout(r, 2500));
    await evaluate(`(async () => {
      const set = (el, v) => {
        const proto = Object.getPrototypeOf(el);
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        desc.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const inputs = [...document.querySelectorAll('input')];
      const email = inputs.find(i => i.type === 'email') || inputs[0];
      const pass = inputs.find(i => i.type === 'password') || inputs[1];
      set(email, ${JSON.stringify(email === "undefined" ? "" : "")} || '${email}');
      set(pass, '${password}');
      await new Promise(r => setTimeout(r, 150));
      const btn = [...document.querySelectorAll('button')].find(b => /sign in|log in|continue/i.test(b.textContent));
      if (btn) btn.click();
      return 'submitted';
    })()`);
    await new Promise((r) => setTimeout(r, 4500));
  }

  await login("member@shim.app", "member123");
  await send("Page.navigate", { url: "http://localhost:3100/portal" });
  await new Promise((r) => setTimeout(r, 3500));
  console.log("=== portal ===");
  console.log(JSON.stringify(await evaluate(probe), null, 2));

  await login("admin@shim.app", "admin123");
  await send("Page.navigate", { url: "http://localhost:3100/dashboard" });
  await new Promise((r) => setTimeout(r, 3500));
  console.log("\n=== dashboard ===");
  console.log(JSON.stringify(await evaluate(probe), null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
