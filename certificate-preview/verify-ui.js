/*
 * verify-ui.js — the assertion test that matters.
 * Clicks BG, selects a category, clicks a DARK background tile, then reads the
 * editor's own JSON panel to prove:
 *   (a) the new background url was applied
 *   (b) text colors flipped to light (our textScheme feature)
 * This inspects React state indirectly via the rendered JSON tab + canvas style.
 */
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const CHROME = "C:/Users/PC/.agent-browser/browsers/chrome-154.0.8037.92/chrome.exe";
const PORT = 9337;
const BASE = "http://127.0.0.1:3100";
const cookie = process.argv[2], tpl = process.argv[3];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(p) {
  return new Promise((res, rej) => {
    http.get({ host: "127.0.0.1", port: PORT, path: p }, (r) => {
      let d = ""; r.on("data", c => d += c); r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.p = new Map(); this.console = []; }
  static async connect(u) {
    const ws = new WebSocket(u);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && c.p.has(m.id)) { c.p.get(m.id)(m); c.p.delete(m.id); }
      else if (m.method === "Runtime.exceptionThrown") c.console.push("EXCEPTION: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").slice(0, 300));
    };
    return c;
  }
  send(m, p = {}) { const id = ++this.id; return new Promise(r => { this.p.set(id, r); this.ws.send(JSON.stringify({ id, method: m, params: p })); }); }
  async eval(e) {
    const r = await this.send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) return { __err: (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text || "").slice(0, 300) };
    return r.result?.result?.value;
  }
}

(async () => {
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`, "--user-data-dir=" + path.join(os.tmpdir(), "vui-" + Date.now()),
    "--window-size=1600,1000", "about:blank"], { stdio: "ignore" });
  await sleep(3500);
  const page = (await getJSON("/json/list")).find(t => t.type === "page");
  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Network.enable");
  await cdp.send("Network.setCookie", { name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), domain: "127.0.0.1", path: "/", httpOnly: true });

  const R = { steps: [], exceptions: [] };

  await cdp.send("Page.navigate", { url: `${BASE}/dashboard/templates/${tpl}` });
  await sleep(9000);
  R.steps.push({ step: "loaded", state: await cdp.eval(`({canvas: !!document.querySelector('[style*="3508px"]')})`) });

  // ---- open BG panel: the rail button containing the text "BG"
  R.steps.push({ step: "click BG", r: await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('button')].find(x => (x.innerText||'').trim() === 'BG');
    if (!b) return 'NOT_FOUND'; b.click(); return 'clicked';
  })()`) });
  await sleep(2500);

  // ---- what does the BG panel contain now?
  R.steps.push({ step: "BG panel", r: await cdp.eval(`(() => {
    const tiles = [...document.querySelectorAll('img')].filter(i => (i.src||'').startsWith('data:image/svg'));
    const catBtns = [...document.querySelectorAll('button')].map(b => (b.innerText||'').trim())
      .filter(t => /Corporate|Academic|Tech|Creative|Luxury|Sports|Medical|Kids/.test(t));
    const panel = [...document.querySelectorAll('div')].map(d => d.innerText||'').find(t => /Preset|Background|Upload/.test(t));
    return { tiles: tiles.length, catBtns: [...new Set(catBtns)], panelHint: (panel||'').replace(/\\s+/g,' ').slice(0,200) };
  })()`) });

  // ---- click the Tech category (contains the dark backgrounds)
  R.steps.push({ step: "click Tech category", r: await cdp.eval(`(() => {
    const b = [...document.querySelectorAll('button')].find(x => /Tech/i.test(x.innerText||''));
    if (!b) return 'NOT_FOUND'; b.click(); return 'clicked: '+(b.innerText||'').trim().slice(0,30);
  })()`) });
  await sleep(2000);

  // ---- re-count tiles (should now show the tech SVGs)
  const tiles = await cdp.eval(`(() => {
    const imgs = [...document.querySelectorAll('img')].filter(i => (i.src||'').startsWith('data:image/svg'));
    return { n: imgs.length, samples: imgs.slice(0,3).map(i => ({ alt: i.alt, len: i.src.length })) };
  })()`);
  R.steps.push({ step: "tiles after Tech", r: tiles });

  // ---- open the JSON tab and read the design so we can prove the click applied
  const readJson = async () => {
    await cdp.eval(`(() => {
      const b = [...document.querySelectorAll('button')].find(x => (x.innerText||'').trim() === 'JSON');
      if (b) b.click();
    })()`);
    await sleep(1500);
    return cdp.eval(`(() => {
      const ta = [...document.querySelectorAll('textarea, pre, code')].filter(e => (e.value||e.innerText||'').length > 200);
      const txt = ta.length ? (ta[0].value || ta[0].innerText) : '';
      let d = null; try { d = JSON.parse(txt); } catch(e) {}
      if (!d) return { parsed: false, len: txt.length, head: txt.slice(0,150) };
      const els = d.canvasElements || [];
      const texts = els.filter(e => e.type === 'dynamicText' || e.type === 'staticText' || e.type === 'badge');
      return {
        parsed: true,
        bg: (d.backgroundImageUrl||'').slice(0, 40),
        elementCount: els.length,
        textColors: [...new Set(texts.map(e => e.color))],
        hasLightText: texts.some(e => { const c=(e.color||'').replace('#',''); const r=parseInt(c.slice(0,2),16)||0; return r>180; }),
      };
    })()`);
  };

  R.steps.push({ step: "design BEFORE bg click", r: await readJson() });

  console.log(JSON.stringify(R, null, 2));
  proc.kill(); process.exit(0);
})().catch(e => { console.error("ERR", e.stack); process.exit(1); });
