// Clip exactly on each scrollbar: the rail occupies [clientWidth, offsetWidth]
// from the container's left edge, so compute the absolute x of that strip.
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9284;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-rail2", "about:blank",
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

  for (const [label, url] of [["dashboard", "http://localhost:3100/dashboard"], ["portal", "http://localhost:3100/portal"]]) {
    if (label === "portal") await login("member@shim.app", "member123");
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 3200));
    await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 620, deviceScaleFactor: 4, mobile: false });
    await new Promise((r) => setTimeout(r, 900));

    // Get each scroller's absolute left edge + clientWidth, so the rail strip is
    // [left + clientWidth, left + offsetWidth].
    const strips = await evaluate(`(() => {
      return [...document.querySelectorAll('*')].filter(el => {
        const cs = getComputedStyle(el);
        const canY = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
        return canY && el.offsetWidth - el.clientWidth > 5;
      }).map(el => {
        const b = el.getBoundingClientRect();
        return { x: Math.round(b.left + el.clientWidth), h: Math.round(el.clientHeight), th: el.offsetWidth - el.clientWidth };
      });
    })()`);
    console.log(`\n=== ${label} ===`, JSON.stringify(strips));

    let n = 0;
    for (const s of strips) {
      const shot = await send("Page.captureScreenshot", {
        format: "png", clip: { x: s.x, y: 0, width: 14, height: Math.min(620, s.h + 4), scale: 4 } });
      const fn = `scratch/rail2-${label}-${n++}.png`;
      fs.writeFileSync(fn, Buffer.from(shot.result.data, "base64"));
      console.log(`  wrote ${fn}`);
    }
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
