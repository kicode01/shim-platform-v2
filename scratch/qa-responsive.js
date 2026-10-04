// QA: responsive overflow at 3 breakpoints + bad/invalid URL handling.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9297;
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
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-resp", "about:blank",
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
  const httpStatuses = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return; }
    if (msg.method === "Network.responseReceived") {
      const r = msg.params.response;
      if (r.url.startsWith(BASE) && !r.url.includes("/_next/")) {
        httpStatuses.push({ status: r.status, url: r.url.replace(BASE, "") });
      }
    }
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

  const overflowProbe = `(() => {
    const de = document.documentElement;
    const hOv = de.scrollWidth - de.clientWidth;
    // find elements sticking out horizontally (ignoring fixed/absolute decor)
    const bad = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      if (b.right > window.innerWidth + 2 || b.left < -2) {
        bad.push(el.tagName.toLowerCase() + '.' + String(el.className).slice(0,45)
          + ' [' + Math.round(b.left) + '..' + Math.round(b.right) + ']');
      }
    }
    // touch target check: interactive elements smaller than 24px
    const small = [...document.querySelectorAll('button, a[href], input, select')].filter(el => {
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && (b.height < 24);
    }).length;
    return { hOv, badCount: bad.length, bad: bad.slice(0,5), smallTargets: small,
             vw: window.innerWidth, docW: de.scrollWidth };
  })()`;

  const routes = [
    ["/", null], ["/login", null], ["/validate", null],
    ["/portal", ["member@shim.app","member123"]],
    ["/dashboard", ["admin@shim.app","admin123"]],
    ["/dashboard/events", ["admin@shim.app","admin123"]],
    ["/dashboard/templates", ["admin@shim.app","admin123"]],
  ];
  const sizes = [[390, 844, "mobile"], [768, 1024, "tablet"], [1440, 900, "desktop"]];

  console.log("### RESPONSIVE ###");
  for (const [route, creds] of routes) {
    if (creds) await login(creds[0], creds[1]);
    const line = [];
    for (const [w, h, label] of sizes) {
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
      await send("Page.navigate", { url: BASE + route });
      await new Promise((r) => setTimeout(r, 3500));
      const p = await evaluate(overflowProbe);
      line.push(`${label}: hOv=${p.hOv} bad=${p.badCount} small=${p.smallTargets}`);
      if (p.badCount > 0 && label !== "mobile") {
        // report desktop/tablet offenders
        for (const b of p.bad.slice(0,3)) console.log(`      ! ${label} ${route} ${b}`);
      }
    }
    console.log(`  ${route.padEnd(26)} ${line.join(" | ")}`);
  }

  await send("Emulation.clearDeviceMetricsOverride");

  console.log("\n### BAD / INVALID URLS ###");
  const badUrls = [
    "/validate/does-not-exist-xyz",
    "/dashboard/events/000000000000000000000000",
    "/nonexistent-page",
    "/api/certificates/nope",
  ];
  for (const u of badUrls) {
    httpStatuses.length = 0;
    await send("Page.navigate", { url: BASE + u });
    await new Promise((r) => setTimeout(r, 2500));
    const body = await evaluate(`(() => ({ txt: (document.body.innerText||'').trim().slice(0,150).replace(/\\n+/g,' | ') }))()`);
    const st = httpStatuses.find(s => s.url.startsWith(u.split("?")[0])) || httpStatuses[0];
    console.log(`  ${u}`);
    console.log(`     status=${st ? st.status : '?'}  body="${body.txt}"`);
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
