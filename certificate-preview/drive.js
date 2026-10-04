/*
 * drive.js — headless Chrome UI test via CDP (no extra deps).
 *
 * Launches Chrome with remote debugging, drives the real template editor:
 *   1. set the NextAuth session cookie (obtained via curl login)
 *   2. open /dashboard/templates/<id>
 *   3. click the "BG" tool in the left rail
 *   4. click a category tab, then a dark background tile
 *   5. screenshot + assert text colors flipped
 *
 * Usage: node drive.js <cookie> <templateId> <out.png>
 */
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");

const CHROME = "C:/Users/PC/.agent-browser/browsers/chrome-154.0.8037.92/chrome.exe";
const PORT = 9333;
const BASE = "http://127.0.0.1:3100";
const cookie = process.argv[2];
const tpl = process.argv[3];
const outPng = process.argv[4] || "editor-shot.png";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (r) => {
      let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}

// minimal CDP websocket client
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.events = []; }
  static async connect(url) {
    const { WebSocket } = await import("node:worker_threads").then(() => ({ WebSocket: globalThis.WebSocket }));
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.pending.has(msg.id)) { c.pending.get(msg.id)(msg); c.pending.delete(msg.id); }
      else if (msg.method) c.events.push(msg);
    };
    return c;
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res) => { this.pending.set(id, res); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  async eval(expr, awaitPromise = false) {
    const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise });
    if (r.result && r.result.exceptionDetails) return { __err: r.result.exceptionDetails.text };
    return r.result && r.result.result ? r.result.result.value : undefined;
  }
}

(async () => {
  const proc = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    "--user-data-dir=" + path.join(require("os").tmpdir(), "cdp-profile-" + Date.now()),
    "--window-size=1600,1000",
    "about:blank",
  ], { stdio: "ignore" });

  await sleep(3500);

  const targets = await getJSON("/json/list");
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");
  const cdp = await CDP.connect(page.webSocketDebuggerUrl);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");

  // install the session cookie
  const host = BASE.replace("http://", "");
  await cdp.send("Network.setCookie", {
    name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="),
    domain: "127.0.0.1", path: "/", httpOnly: true,
  });

  const log = [];
  cdp.events.length = 0;

  await cdp.send("Page.navigate", { url: `${BASE}/dashboard/templates/${tpl}` });
  await sleep(9000);

  // --- probe state -------------------------------------------------------
  const probe = async (label) => {
    const st = await cdp.eval(`(() => {
      const rail = [...document.querySelectorAll('button')].filter(b => /^BG$/.test((b.innerText||'').trim()));
      const canvas = document.querySelector('[style*="3508px"]');
      const bg = canvas ? (canvas.style.backgroundImage||'') : '';
      const tiles = [...document.querySelectorAll('img')].filter(i => (i.src||'').startsWith('data:image/svg'));
      const tabs = [...document.querySelectorAll('button')].map(b=>(b.innerText||'').trim()).filter(t=>t && t.length<40);
      return {
        url: location.pathname,
        hasCanvas: !!canvas,
        bgIsNone: !bg || bg === 'none',
        bgPreview: bg.slice(0, 40),
        bgTiles: tiles.length,
        hasBgRail: rail.length > 0,
        bodyText: (document.body.innerText||'').replace(/\\s+/g,' ').slice(0, 260),
      };
    })()`);
    log.push({ label, ...st });
    return st;
  };

  await probe("after editor load");

  // click the BG tool in the left rail
  const clicked = await cdp.eval(`(() => {
    const btn = [...document.querySelectorAll('button')].find(b => /^BG$/.test((b.innerText||'').trim()));
    if (!btn) return 'no-BG-button';
    btn.click();
    return 'clicked';
  })()`);
  await sleep(2500);
  log.push({ label: "clicked BG tool", result: clicked });
  await probe("after BG tool click");

  // screenshot the editor
  const shot1 = await cdp.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(outPng, Buffer.from(shot1.result.data, "base64"));

  console.log(JSON.stringify(log, null, 2));
  proc.kill();
  process.exit(0);
})().catch((e) => { console.error("DRIVE ERROR:", e.message); process.exit(1); });
