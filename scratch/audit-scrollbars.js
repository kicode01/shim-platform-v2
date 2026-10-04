// Audit scrollbars across the site: for every scroll container, report the
// scrollbar width, whether the webkit rules apply, and whether the standard
// properties are set. Detect the "native Windows scrollbar with arrows" case.
const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9279;

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let d = ""; res.on("data", (c) => (d += c)); res.on("end", () => resolve(d)); }).on("error", reject);
  });
}

async function main() {
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--window-size=1280,900",
    "--user-data-dir=C:/Users/PC/AppData/Local/Temp/cdp-sb-audit", "about:blank",
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
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    if (r.result?.exceptionDetails) return { exception: r.result.exceptionDetails.text };
    return r.result?.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  const audit = `(() => {
    const out = [];
    const all = [...document.querySelectorAll('*')];
    for (const el of all) {
      const cs = getComputedStyle(el);
      const oy = cs.overflowY, ox = cs.overflowX;
      const scrollsY = (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1;
      const scrollsX = (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 1;
      const canScrollY = oy === 'auto' || oy === 'scroll';
      const canScrollX = ox === 'auto' || ox === 'scroll';
      if (!canScrollY && !canScrollX) continue;
      const desc = el.tagName.toLowerCase()
        + (el.id ? '#'+el.id : '')
        + (el.dataset.appScroll !== undefined ? '[data-app-scroll]' : '')
        + (el.dataset.surface ? '[surface='+el.dataset.surface+']' : '')
        + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,4).join('.') : '');
      out.push({
        el: desc.slice(0, 90),
        scrollbarWidth: cs.scrollbarWidth,
        scrollbarColor: cs.scrollbarColor,
        scrollbarGutter: cs.scrollbarGutter,
        actualY: el.offsetWidth - el.clientWidth,   // real scrollbar thickness
        actualX: el.offsetHeight - el.clientHeight,
        scrollsY, scrollsX, canScrollY, canScrollX,
      });
    }
    // Also report the root scroll container and body.
    const main = document.querySelector('main[data-app-scroll]');
    return {
      containers: out,
      main: main ? {
        className: main.className,
        scrollbarWidth: getComputedStyle(main).scrollbarWidth,
        scrollbarColor: getComputedStyle(main).scrollbarColor,
        gutter: getComputedStyle(main).scrollbarGutter,
        thickness: main.offsetWidth - main.clientWidth,
        surface: main.dataset.surface,
      } : null,
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
    };
  })()`;

  const pages = [
    ["landing", "http://localhost:3100/"],
    ["validate", "http://localhost:3100/validate"],
    ["login", "http://localhost:3100/login"],
  ];

  for (const [name, url] of pages) {
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 2600));
    const res = await evaluate(audit);
    console.log(`\n########## ${name} (${url}) ##########`);
    console.log("main:", JSON.stringify(res.main));
    console.log("html overflow:", res.htmlOverflow, "| body overflow:", res.bodyOverflow);
    console.log("containers:", res.containers.length);
    for (const c of res.containers) {
      console.log(`  ${c.el}`);
      console.log(`     sbWidth=${c.scrollbarWidth} sbColor=${c.scrollbarColor} gutter=${c.scrollbarGutter} thickness=${c.actualY}/${c.actualX} scrolls=${c.scrollsY?'Y':''}${c.scrollsX?'X':''}`);
    }
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
