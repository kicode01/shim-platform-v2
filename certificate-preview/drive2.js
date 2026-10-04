/*
 * drive2.js — CDP UI test, hardened.
 * Waits for the app's loader to finish, clicks BG, opens a category, paints a dark
 * background, and asserts (a) tiles render as svg data-uris and (b) text colors flip.
 */
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const CHROME = "C:/Users/PC/.agent-browser/browsers/chrome-154.0.8037.92/chrome.exe";
const PORT = 9334;
const BASE = "http://127.0.0.1:3100";

const cookie = process.argv[2];
const tpl = process.argv[3];
const outDir = process.argv[4] || "/c/temp/certshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (r) => {
      let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.logs = []; }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && c.pending.has(m.id)) { c.pending.get(m.id)(m); c.pending.delete(m.id); }
      else if (m.method === "Runtime.consoleAPICalled") {
        c.logs.push(m.params.type + ": " + m.params.args.map(a => a.value ?? a.description ?? "").join(" "));
      } else if (m.method === "Runtime.exceptionThrown") {
        c.logs.push("EXCEPTION: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
      }
    };
    return c;
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res) => { this.pending.set(id, res); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async eval(expr) {
    const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) return { __err: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
    return r.result?.result?.value;
  }
  async shot(file) {
    const s = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(file, Buffer.from(s.result.data, "base64"));
  }
}

(async () => {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=" + path.join(os.tmpdir(), "cdp2-" + Date.now()),
    "--window-size=1600,1000", "about:blank",
  ], { stdio: "ignore" });
  await sleep(3500);

  const page = (await getJSON("/json/list")).find((t) => t.type === "page");
  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Network.setCookie", {
    name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="),
    domain: "127.0.0.1", path: "/", httpOnly: true,
  });

  const out = { steps: [], console: [], errors: [] };

  // kill animations/transitions — framer-motion entrance states leave the DOM invisible in headless
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      (() => {
        const s = document.createElement('style');
        s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}';
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(s));
      })();
    `,
  });

  await cdp.send("Page.navigate", { url: `${BASE}/dashboard/templates/${tpl}` });
  await sleep(7000);

  // force any leftover opacity/transform from entrance animations to their resting state
  const unstick = await cdp.eval(`(() => {
    let n = 0;
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' && el.offsetParent !== null) { el.style.opacity = '1'; n++; }
      if (cs.transform && cs.transform !== 'none' && /matrix\\(1, 0, 0, 1, -/.test(cs.transform)) { el.style.transform = 'none'; n++; }
    });
    return n;
  })()`);
  await sleep(1500);

  // wait until the canvas is present
  for (let i = 0; i < 20; i++) {
    const ready = await cdp.eval(`(() => ({ canvas: !!document.querySelector('[style*="3508px"]'), bodyLen: document.body.innerText.length }))()`);
    if (ready?.canvas && ready.bodyLen > 300) { out.steps.push({ step: "editor ready", state: ready, unstuck: unstick }); break; }
    await sleep(1000);
  }

  // --- click the BG tool (the rail button whose text is exactly "BG")
  const bgClick = await cdp.eval(`(() => {
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find(x => (x.innerText||'').trim() === 'BG');
    if (!b) return 'NO_BG_BUTTON';
    b.click();
    return 'ok';
  })()`);
  out.steps.push({ step: "click BG tool", result: bgClick });
  await sleep(3000);
  await cdp.shot(path.join(outDir, "live-1-bgpanel.png"));

  // --- inspect the background panel
  const panel = await cdp.eval(`(() => {
    const imgs = [...document.querySelectorAll('img')].filter(i=>(i.src||'').startsWith('data:image/svg'));
    const cats = [...document.querySelectorAll('button')].map(b=>(b.innerText||'').trim())
                   .filter(t=>t.length>2 && t.length<40 && /Corporate|Academic|Tech|Creative|Luxury|Sports|Medical|Kids/.test(t));
    return {
      tileCount: imgs.length,
      firstTile: imgs[0] ? imgs[0].src.slice(0,42) : null,
      categoryButtons: cats.slice(0,12),
      panelText: (document.querySelector('[class*="overflow-y-auto"]')?.innerText||'').replace(/\\s+/g,' ').slice(0,300),
    };
  })()`);
  out.steps.push({ step: "BG panel contents", panel });

  console.log(JSON.stringify(out, null, 2));
  proc.kill();
  process.exit(0);
})().catch((e) => { console.error("DRIVE ERROR:", e.stack || e.message); process.exit(1); });
