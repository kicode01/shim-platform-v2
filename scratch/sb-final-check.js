// Final sanity sweep: capture the right-edge band on every route and the
// /validate page (which had a nested dropdown list scroller with custom-scrollbar).
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9287;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-final-sb", "about:blank",
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

  // Test the special case: a SELECT dropdown using Select.tsx with custom-scrollbar.
  await send("Page.navigate", { url: "http://localhost:3100/validate" });
  await new Promise((r) => setTimeout(r, 3000));

  const innerSbStats = await evaluate(`(() => {
    // Find every scroll container including ones with 0 scroll (they could still
    // be scrollers, just empty), then for each report its scrollbar properties.
    return [...document.querySelectorAll('*')].filter(el => {
      const cs = getComputedStyle(el);
      const canY = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
      return canY;
    }).map(el => {
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        cls: String(el.className).slice(0, 60),
        sbW: cs.scrollbarWidth,
        thY: el.offsetWidth - el.clientWidth,
        canScroll: el.scrollHeight > el.clientHeight + 1,
      };
    });
  })()`);
  console.log("validate page scroll containers:");
  for (const c of innerSbStats) console.log(" ", JSON.stringify(c));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });