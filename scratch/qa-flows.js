// Drive real interactive flows: fill login, submit, click every sidebar link,
// verify landing page, and report any broken navigation.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PROFILE = "C:\\temp\\qa-chrome-profile4";
const BASE = "http://localhost:3100";
const OUT = "C:/temp/qa";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PROFILE, { recursive: true });

function get(path) {
  return new Promise((res, rej) => {
    const req = http.get({ host: "127.0.0.1", port: 9223, path, timeout: 2000 }, (r) => {
      let d = ""; r.on("data", c => (d += c)); r.on("end", () => res(JSON.parse(d)));
    });
    req.on("error", rej); req.on("timeout", () => req.destroy(new Error("timeout")));
  });
}

async function waitForPort(timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { return await get("/json/version"); } catch (e) { await new Promise(r => setTimeout(r, 700)); }
  }
  throw new Error("no debug port");
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, [
    "--remote-debugging-port=9223", `--user-data-dir=${PROFILE}`,
    "--no-first-run", "--no-default-browser-check", "--headless=new", "--disable-gpu", "about:blank",
  ], { stdio: "ignore" });
  process.on("exit", () => { try { chrome.kill(); } catch (e) {} });

  const ver = await waitForPort();
  const ws = new WebSocket(ver.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0; const pend = new Map();
  const consoleErrors = []; let curr = "";
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const msgId = ++id; pend.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });
  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); return; }
    if (m.method === "Runtime.exceptionThrown") {
      const d = m.params.exceptionDetails || {};
      consoleErrors.push({ page: curr, text: (d.exception?.description || d.text || "").slice(0, 300) });
    }
  });
  await new Promise(r => ws.on("open", r));
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable"); await S("Runtime.enable"); await S("Network.enable");
  await S("Network.clearBrowserCookies");
  await S("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

  const evalJs = async (expr) => {
    const r = await S("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error("eval error at " + expr.slice(0, 140) + " || " + (d.exception?.description || d.text || ""));
    }
    return r.result.value;
  };

  const goto = async (url, wait = 4000) => { curr = url; await S("Page.navigate", { url: BASE + url }); await sleep(wait); };
  const loc = () => evalJs("location.pathname + location.search");

  const log = [];
  const T = (name, ok, detail) => { log.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); };

  // ---- 1. LOGIN as admin via the real form ----
  await goto("/login", 5000);
  await evalJs(`(() => {
    const set = (el, v) => { if (!el) throw new Error('element not found for value ' + v); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(el, v); el.dispatchEvent(new Event('input',{bubbles:true})); };
    set(document.querySelector('input[type=email]'), 'admin@shim.app');
    set(document.querySelector('input[type=password]'), 'admin123');
    return true; })()`);
  await sleep(500);
  await evalJs(`document.querySelector('form button[type=submit]').click()`);
  await sleep(6000);
  const afterLogin = await loc();
  T("Login form (admin) → dashboard", afterLogin.startsWith("/dashboard"), `landed ${afterLogin}`);

  // ---- 2. Sidebar navigation: click every item ----
  const routes = ["Overview", "Credentials", "Events", "Templates", "Generate", "Audit Trail"];
  for (const label of routes) {
    const clicked = await evalJs(`(() => {
      const a = Array.from(document.querySelectorAll('aside a')).find(x => x.getAttribute('title') === ${JSON.stringify(label)});
      if (!a) return false; a.click(); return true; })()`);
    await sleep(4500);
    const at = await loc();
    T(`Sidebar → ${label}`, clicked && at.startsWith("/dashboard"), `clicked=${clicked} landed ${at}`);
  }

  // ---- 3. Admin 404 page: Return Home link ----
  await goto("/this-page-is-missing-xyz", 4500);
  const badStatusTitle = await evalJs(`document.querySelector('h1')?.innerText || ''`);
  T("404 page renders", badStatusTitle.trim() === "404", `h1="${badStatusTitle.trim()}"`);
  // Click Return Home; an authed admin is bounced to /dashboard by design.
  await evalJs(`(() => { const a = document.querySelector('a[href="/"]'); if(a) a.click(); return !!a; })()`);
  await sleep(4500);
  const homeLanded = await loc();
  T("404 'Return Home' resolves (authed→/dashboard)", homeLanded === "/dashboard", `landed ${homeLanded}`);

  // ---- 4. Landing page CTAs (anonymous) ----
  await evalJs(`document.cookie.split(';').forEach(c => document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/')`);
  await S("Network.clearBrowserCookies");
  await goto("/", 5000);
  const landingTitle = await evalJs(`document.querySelector('h1')?.innerText || ''`);
  const ctaHrefs = JSON.parse(await evalJs(`JSON.stringify(Array.from(document.querySelectorAll('a[href]')).map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('/dashboard')))`));
  T("Landing renders for anon (not redirected)", !landingTitle.includes("Overview"), `h1="${landingTitle.slice(0,40)}"`);
  T("Landing anon CTAs point to public pages", ctaHrefs.every(h => ["/", "/validate", "/login", "/register"].includes(h)) && ctaHrefs.length > 0, JSON.stringify(ctaHrefs));

  // ---- 5. Validate: search a bogus id → not-found state ----
  await goto("/validate", 5000);
  await evalJs(`(() => { const el = document.querySelector('form input[type=text]'); if(!el) throw new Error('no search input'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(el,'doesnotexist'); el.dispatchEvent(new Event('input',{bubbles:true})); return true; })()`);
  await sleep(400);
  await evalJs(`document.querySelector('form').requestSubmit()`);
  await sleep(3500);
  const validateBody = await evalJs(`document.body.innerText.slice(0,4000)`);
  T("Validate bogus id shows not-found", /not found|invalid|no record|unable|could not/i.test(validateBody), "");

  // ---- 6. Logout flow (two-click confirm) as a fresh authed session ----
  await S("Network.clearBrowserCookies");
  await goto("/login", 5000);
  await evalJs(`(() => {
    const set = (el, v) => { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; s.call(el, v); el.dispatchEvent(new Event('input',{bubbles:true})); };
    set(document.querySelector('input[type=email]'), 'member@shim.app');
    set(document.querySelector('input[type=password]'), 'member123');
    return true; })()`);
  await sleep(400);
  await evalJs(`document.querySelector('form button[type=submit]').click()`);
  await sleep(6000);
  T("Login form (member) → portal", (await loc()).startsWith("/portal"), `landed ${await loc()}`);

  const logoutBtn = await evalJs(`(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.title === 'Sign Out'); return !!b; })()`);
  T("Sign Out button present when authed", logoutBtn === true, `found=${logoutBtn}`);
  if (logoutBtn) {
    await evalJs(`Array.from(document.querySelectorAll('button')).find(x => x.title === 'Sign Out').click()`);
    await sleep(600);
    const confirmShown = await evalJs(`!!Array.from(document.querySelectorAll('button')).find(x => /Confirm/i.test(x.innerText))`);
    T("Sign Out requires confirm click", confirmShown === true, `confirmVisible=${confirmShown}`);
    if (confirmShown) {
      await evalJs(`Array.from(document.querySelectorAll('button')).find(x => /Confirm/i.test(x.innerText)).click()`);
      await sleep(6000);
      const after = await loc();
      T("Sign Out lands on /logout or /login", after.startsWith("/logout") || after.startsWith("/login"), `landed ${after}`);
    }
  }

  console.log("\nuncaught exceptions:", consoleErrors.length);
  consoleErrors.forEach(e => console.log("  ", e.page, e.text.slice(0, 180)));
  fs.writeFileSync(`${OUT}/flow-report.json`, JSON.stringify({ log, consoleErrors }, null, 2));
  console.log("WROTE", `${OUT}/flow-report.json`);
  ws.close(); chrome.kill();
}
main().catch(e => { console.error("ERR", e.message); process.exit(1); });
