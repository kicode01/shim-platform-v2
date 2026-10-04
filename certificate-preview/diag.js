/* diag.js — what is actually in the headless DOM after load? */
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

const CHROME = "C:/Users/PC/.agent-browser/browsers/chrome-154.0.8037.92/chrome.exe";
const PORT = 9336;
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
      else if (m.method === "Runtime.consoleAPICalled") c.console.push(m.params.type + ": " + m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 200));
      else if (m.method === "Runtime.exceptionThrown") c.console.push("EXCEPTION: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").slice(0, 400));
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
    `--remote-debugging-port=${PORT}`, "--user-data-dir=" + path.join(os.tmpdir(), "diag-" + Date.now()),
    "--window-size=1600,1000", "about:blank"], { stdio: "ignore" });
  await sleep(3500);
  const page = (await getJSON("/json/list")).find(t => t.type === "page");
  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Network.enable");
  await cdp.send("Network.setCookie", { name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), domain: "127.0.0.1", path: "/", httpOnly: true });

  await cdp.send("Page.navigate", { url: `${BASE}/dashboard/templates/${tpl}` });
  await sleep(12000);

  const diag = await cdp.eval(`(() => ({
    readyState: document.readyState,
    bodyChildren: document.body.children.length,
    innerTextLen: document.body.innerText.length,
    innerText: document.body.innerText.replace(/\\s+/g,' ').slice(0, 400),
    scriptCount: document.scripts.length,
    nextData: !!document.getElementById('__NEXT_DATA__'),
    reactRoot: !!document.querySelector('#__next, [data-reactroot], body > div'),
    canvasEl: !!document.querySelector('[style*="3508px"]'),
    allButtons: [...document.querySelectorAll('button')].length,
    bgImgCount: [...document.querySelectorAll('img')].filter(i=>(i.src||'').startsWith('data:')).length,
    visibleDivs: [...document.querySelectorAll('div')].filter(d=>d.offsetParent!==null).length,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }))()`);

  const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync("C:/temp/certshots/diag.png", Buffer.from(shot.result.data, "base64"));

  console.log("=== DIAG ===");
  console.log(JSON.stringify(diag, null, 2));
  console.log("=== CONSOLE (" + cdp.console.length + ") ===");
  console.log(cdp.console.slice(-25).join("\n"));
  proc.kill(); process.exit(0);
})().catch(e => { console.error("ERR", e.stack); process.exit(1); });
