// Collect every internal href from all key pages, then check each unique target
// with Node's http module and report non-2xx / non-redirect responses.
const fs = require("fs");
const http = require("http");

const PAGES = [
  { url: "/", token: null },
  { url: "/login", token: null },
  { url: "/register", token: null },
  { url: "/validate", token: null },
  { url: "/dashboard", token: "admin" },
  { url: "/dashboard/events", token: "admin" },
  { url: "/dashboard/credentials", token: "admin" },
  { url: "/dashboard/templates", token: "admin" },
  { url: "/dashboard/generate", token: "admin" },
  { url: "/dashboard/audit", token: "admin" },
  { url: "/portal", token: "member" },
];

function readToken(jarPath) {
  try {
    for (const line of fs.readFileSync(jarPath, "utf8").split(/\r?\n/)) {
      const p = line.split("\t");
      if (p.length >= 7 && p[5] === "next-auth.session-token") return p[6].trim();
    }
  } catch (e) {}
  return null;
}

const TOKENS = {
  admin: readToken("C:/Users/PC/AppData/Local/Temp/qa_admin.txt"),
  member: readToken("C:/Users/PC/AppData/Local/Temp/qa_member.txt"),
};

function request(path, token) {
  return new Promise((resolve) => {
    const headers = {};
    if (token && TOKENS[token]) headers["Cookie"] = `next-auth.session-token=${TOKENS[token]}`;
    const req = http.get({ host: "127.0.0.1", port: 3100, path, headers, timeout: 25000 }, (res) => {
      let body = "";
      res.on("data", (c) => { if (body.length < 900000) body += c; });
      res.on("end", () => resolve({ status: res.statusCode, location: res.headers.location || null, body }));
    });
    req.on("error", (e) => resolve({ status: 0, error: e.message }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "timeout" }); });
  });
}

(async () => {
  const targets = new Map();
  for (const p of PAGES) {
    const r = await request(p.url, p.token);
    if (!r.body) { console.log("no body for", p.url, r.status, r.error || ""); continue; }
    const re = /href="([^"#]+)"/g;
    let m;
    while ((m = re.exec(r.body))) {
      let href = m[1];
      if (href.startsWith("mailto:")) continue;
      if (href.startsWith("/_next")) continue;
      if (/^https?:\/\//.test(href)) {
        if (!href.includes("localhost")) continue;
        href = href.replace(/^https?:\/\/localhost:\d+/, "");
      }
      if (!href.startsWith("/")) continue;
      if (!targets.has(href)) targets.set(href, new Set());
      targets.get(href).add(p.url);
    }
  }

  console.log(`unique internal link targets: ${targets.size}\n`);
  const broken = [];
  for (const [href, pages] of targets) {
    if (/\.(svg|png|jpg|jpeg|ico|css|js|json|webp|woff2?|txt)$/i.test(href)) continue;
    const r = await request(href, "admin");
    const ok = String(r.status).startsWith("2") || String(r.status).startsWith("3");
    if (!ok) broken.push({ href, status: r.status, error: r.error, pages: [...pages] });
    console.log(`${ok ? "ok    " : "BROKEN"} ${r.status}  ${href}   (from: ${[...pages].join(", ")})`);
  }
  console.log(`\nbroken: ${broken.length}`);
  fs.writeFileSync("C:/temp/qa/deadlinks.json", JSON.stringify({ all: [...targets.keys()], broken }, null, 2));
})();
