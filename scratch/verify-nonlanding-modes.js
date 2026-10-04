// Verify non-landing navbar modes are unaffected: no tagline, wordmark 24px,
// mark 24px, and the mode column still centres its content.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9264;
const COOKIE_ADMIN = "C:/Users/PC/AppData/Local/Temp/qa_admin.txt";
const COOKIE_MEMBER = "C:/Users/PC/AppData/Local/Temp/qa_member.txt";

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-lockup-modes", "about:blank",
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

  await send("Page.enable");
  await send("Network.enable");
  await send("Runtime.enable");

  const probe = `(() => {
    const header = document.querySelector('header');
    if (!header) return { error: 'no header' };
    const imgs = [...header.querySelectorAll('img')];
    const spans = [...header.querySelectorAll('span')].filter(s => s.textContent.trim());
    const word = spans.find(s => s.textContent.trim().replace(/^\./,'') === 'shim' || s.textContent.trim() === 'shim');
    const tag = spans.find(s => s.textContent.includes('Digital Credential'));
    const suffixes = spans.map(s=>s.textContent.trim()).filter(t => t.startsWith('.'));
    const r = (el) => { if(!el) return null; const b = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return { w:+b.width.toFixed(1), h:+b.height.toFixed(1), fontSize: cs.fontSize }; };
    return { mark: r(imgs[0]), word: r(word), tag: r(tag), suffixes, headerText: header.innerText.replace(/\\n/g,' | ') };
  })()`;

  const cases = [
    ["validate", "http://localhost:3100/validate", null],
    ["portal", "http://localhost:3100/portal", COOKIE_MEMBER],
    ["dashboard", "http://localhost:3100/dashboard", COOKIE_ADMIN],
  ];

  for (const [name, url, jar] of cases) {
    if (jar) {
      const raw = require("fs").readFileSync(jar, "utf8").trim();
      // Netscape cookie jar -> set via CDP
      const cookies = raw.split("\n").filter(l => l && !l.startsWith("#")).map(l => {
        const p = l.split("\t");
        return { name: p[5], value: p[6], domain: p[0], path: p[2], secure: p[3] === "TRUE" };
      });
      await send("Network.setCookies", { cookies });
    }
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 3000));
    const out = await send("Runtime.evaluate", { expression: probe, returnByValue: true });
    console.log(`\n=== ${name} (${url}) ===`);
    console.log(JSON.stringify(out.result?.result?.value, null, 2));
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
