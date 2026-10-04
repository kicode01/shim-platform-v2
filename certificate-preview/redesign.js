/*!
 * redesign.js — regenerate all 80 PRESET_CATEGORIES backgrounds with safe-zone discipline.
 *
 * Canvas: 1122 x 793 (landscape). Text zones (fractions of H):
 *   title ~0.13, name ~0.45, event ~0.62, role ~0.72, signatures ~0.82
 *   center band x: 0.06H..0.94H of width
 * Rule: ornament must live OUTSIDE the center band (x 6-94%, y 12-88%).
 * Where a dark or busy field would sit behind text, add a translucent veil.
 *
 * Output: redesigned-backgrounds.json   {categories:[{name,orientation,items:[{id,name,url}]}]}
 */

const fs = require("fs");
const path = require("path");

const W = 1122, H = 793;

// ---------------------------------------------------------------- painter api
function makeCanvas(bg) {
  const parts = [];
  // base fill always first
  if (bg) parts.push(`<rect width="100%" height="100%" fill="${bg}"/>`);
  return {
    raw: (s) => { parts.push(s); return api; },
    // full-bleed field
    fill: (c) => { parts.push(`<rect width="100%" height="100%" fill="${c}"/>`); return api; },
    rect: (x, y, w, h, opts = {}) => {
      const o = attr(opts);
      parts.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"${o}/>`);
      return api;
    },
    circle: (cx, cy, r, opts = {}) => {
      parts.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"${attr(opts)}/>`);
      return api;
    },
    ellipse: (cx, cy, rx, ry, opts = {}) => {
      parts.push(`<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}"${attr(opts)}/>`);
      return api;
    },
    poly: (pts, opts = {}) => {
      parts.push(`<polygon points="${pts.map(p => p.map(n).join(",")).join(" ")}"${attr(opts)}/>`);
      return api;
    },
    path: (d, opts = {}) => {
      parts.push(`<path d="${d}"${attr(opts)}/>`);
      return api;
    },
    line: (x1, y1, x2, y2, opts = {}) => {
      parts.push(`<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}"${attr(opts)}/>`);
      return api;
    },
    text: (x, y, str, opts = {}) => {
      const o = attr({ ...opts, size: opts.size });
      parts.push(`<text x="${n(x)}" y="${n(y)}"${o}>${str}</text>`);
      return api;
    },
    pattern: (id, w, h, defs, opts = {}) => {
      parts.push(
        `<defs><pattern id="${id}" width="${n(w)}" height="${n(h)}" patternUnits="userSpaceOnUse"${attr(opts)}>${defs}</pattern></defs>`
      );
      return api;
    },
    use: (id, x = 0, y = 0, w = W, h = H) => {
      parts.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="url(#${id})"/>`);
      return api;
    },
    // translucent veil over the text band so foreground text stays legible
    veil: (opts = {}) => {
      const o = {
        y: opts.y ?? 0.10 * H,
        h: opts.h ?? 0.80 * H,
        x: opts.x ?? 0.05 * W,
        w: opts.w ?? 0.90 * W,
        fill: opts.fill ?? "#ffffff",
        op: opts.op ?? 0.86,
        rx: opts.rx ?? 18,
      };
      parts.push(
        `<rect x="${n(o.x)}" y="${n(o.y)}" width="${n(o.w)}" height="${n(o.h)}" rx="${o.rx}" fill="${o.fill}" opacity="${o.op}"/>`
      );
      return api;
    },
    done: () => parts.join(""),
  };
}

let api;
function canvas(bg) { api = makeCanvas(bg); return api; }

function attr(o) {
  const m = {
    fill: "fill", stroke: "stroke", sw: "stroke-width", op: "opacity",
    rx: "rx", ry: "ry", dash: "stroke-dasharray", cap: "stroke-linecap",
    join: "stroke-linejoin", size: "font-size", family: "font-family",
    weight: "font-weight", anchor: "text-anchor", ls: "letter-spacing",
    transform: "transform", clip: "clip-path", fillop: "fill-opacity",
  };
  let s = "";
  for (const k of Object.keys(o)) {
    if (o[k] === undefined || o[k] === null) continue;
    const name = m[k] || k;
    s += ` ${name}="${o[k]}"`;
  }
  return s;
}
const n = (v) => (typeof v === "number" ? +v.toFixed(2) : v);

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${inner}</svg>`;
}
function toDataUri(s) {
  return "data:image/svg+xml;base64," + Buffer.from(s, "utf8").toString("base64");
}

// ------------------------------------------------------------- safe geometry
const T = {
  bandTop: 0.12 * H,      // 95
  bandBot: 0.88 * H,      // 698
  bandL: 0.06 * W,        // 67
  bandR: 0.94 * W,        // 1055
  titleY: 0.13 * H,       // 103
  nameY: 0.45 * H,        // 357
  eventY: 0.62 * H,       // 492
  roleY: 0.72 * H,        // 571
  sigY: 0.84 * H,         // 666
};
// margin strip heights: top 0..95, bottom 698..793, left 0..67, right 1055..1122
const M = { top: 95, bot: 95, left: 67, right: 67 };

// frame helper — draws a border ring entirely outside the band
function ring(c, x, y, w, h, opts) {
  c.rect(x, y, w, h, { fill: "none", ...opts });
}

// corner bracket motif (L-shaped), sized so it stays in the margin
function bracket(c, corner, len, thick, color, inset = 26) {
  const { left, right, top, bot } = {
    left: inset, right: W - inset, top: inset, bot: H - inset,
  }[corner] !== undefined ? {} : {};
}

const OUT = [];
function add(id, name, inner) { OUT.push({ id, name, url: toDataUri(svg(inner)) }); }

// ============================================================ CORPORATE
const corp = [];
function corpItem(id, name, fn) { corp.push({ id, name, inner: fn() }); }

// 01 Swiss International Style — diagonal blocks pushed to right margin only
corpItem("corp-01", "Swiss International Style", () => {
  const c = canvas("#ffffff");
  c.poly([[W - 130, 0], [W, 0], [W, H], [W - 250, H]], { fill: "#0A192F", op: 0.92 });
  c.poly([[W - 200, 0], [W - 150, 0], [W - 300, H], [W - 350, H]], { fill: "#CC7722" });
  c.rect(0, 0, 14, H, { fill: "#0A192F" });
  c.rect(0, H - 12, W, 12, { fill: "#0A192F" });
  return c.done();
});

// 02 Asymmetrical Corporate Edge — side wedges only
corpItem("corp-02", "Asymmetrical Corporate Edge", () => {
  const c = canvas("#ffffff");
  c.poly([[0, 0], [M.left, 0], [M.left, H], [0, H]], { fill: "#333333" });
  c.poly([[W - M.right, 0], [W, 0], [W, H], [W - M.right, H]], { fill: "#333333" });
  c.rect(M.left + 16, H / 2 - 40, 6, 80, { fill: "#CC7722" });
  c.rect(W - M.right - 22, H / 2 - 40, 6, 80, { fill: "#CC7722" });
  return c.done();
});

// 03 Minimalist Perimeter Frame — already clean, keep + refine
corpItem("corp-03", "Minimalist Perimeter Frame", () => {
  const c = canvas("#ffffff");
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#111111", sw: 2 });
  ring(c, 44, 44, W - 88, H - 88, { stroke: "#111111", sw: 0.75 });
  c.rect(30, 30, 90, 4, { fill: "#CC7722" });
  c.rect(W - 120, H - 34, 90, 4, { fill: "#CC7722" });
  return c.done();
});

// 04 Corporate Color Blocking — bands top & bottom margins only
corpItem("corp-04", "Corporate Color Blocking", () => {
  const c = canvas("#ffffff");
  c.rect(0, 0, W, M.top, { fill: "#64748B" });
  c.rect(0, 0, W, M.top, { fill: "#0F172A", op: 0.25 });
  c.rect(0, H - M.bot, W, M.bot, { fill: "#64748B" });
  c.rect(0, H - M.bot, W, M.bot, { fill: "#0F172A", op: 0.25 });
  c.rect(0, M.top, W, 5, { fill: "#0F172A" });
  c.rect(0, H - M.bot - 5, W, 5, { fill: "#0F172A" });
  return c.done();
});

// 05 Architectural Grid — grid faint, plus veil so text reads
corpItem("corp-05", "Architectural Grid", () => {
  const c = canvas("#ffffff");
  c.pattern("grid05", 44, 44,
    `<path d="M 44 0 L 0 0 0 44" fill="none" stroke="#CBD5E1" stroke-width="1"/>`);
  c.use("grid05");
  c.veil({ fill: "#ffffff", op: 0.72, x: 40, y: 80, w: W - 80, h: H - 160, rx: 8 });
  ring(c, 24, 24, W - 48, H - 48, { stroke: "#0F172A", sw: 2 });
  c.rect(24, 24, 120, 6, { fill: "#CC7722" });
  return c.done();
});

// 06 Subtle Monoline Pinstripe — thin double pinstripe frame
corpItem("corp-06", "Subtle Monoline Pinstripe", () => {
  const c = canvas("#ffffff");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#CC7722", sw: 1 });
  ring(c, 48, 48, W - 96, H - 96, { stroke: "#CC7722", sw: 0.5 });
  ring(c, 60, 60, W - 120, H - 120, { stroke: "#E2E8F0", sw: 0.5 });
  for (let x = 0; x < W; x += 8) c.line(x, 44, x, 52, { stroke: "#F1F5F9", sw: 0.5 });
  return c.done();
});

// 07 Tech-Corporate Crossover — diagonal only in top-right margin
corpItem("corp-07", "Tech-Corporate Crossover", () => {
  const c = canvas("#ffffff");
  c.poly([[W - 420, 0], [W, 0], [W, M.top]], { fill: "#000080", op: 0.9 });
  c.poly([[W - 300, 0], [W - 180, 0], [W, M.top - 20], [W, M.top]], { fill: "#0080FF", op: 0.55 });
  c.poly([[0, H - M.bot], [330, H - M.bot], [180, H], [0, H]], { fill: "#000080", op: 0.9 });
  c.rect(0, 0, W, 6, { fill: "#000080" });
  c.rect(0, H - 6, W, 6, { fill: "#000080" });
  return c.done();
});

// 08 Bauhaus Inspired Business — circles/bars in bottom margin band
corpItem("corp-08", "Bauhaus Inspired Business", () => {
  const c = canvas("#ffffff");
  c.rect(0, H - M.bot, W, M.bot, { fill: "#36454F" });
  c.circle(150, H - M.bot / 2, 34, { fill: "#F2C14E" });
  c.rect(210, H - M.bot / 2 - 20, 130, 40, { fill: "#CC7722" });
  c.circle(W - 150, H - M.bot / 2, 26, { fill: "#CC7722" });
  c.rect(0, 0, W, 10, { fill: "#36454F" });
  c.rect(60, 26, 160, 12, { fill: "#36454F" });
  c.circle(W - 80, 32, 14, { fill: "#CC7722" });
  return c.done();
});

// 09 Diagonal Split Bleed — bottom band + divider above band
corpItem("corp-09", "Diagonal Split Bleed", () => {
  const c = canvas("#ffffff");
  c.rect(0, H - M.bot, W, M.bot, { fill: "#4B0082" });
  c.rect(0, H - M.bot - 5, W, 5, { fill: "#D4AF37" });
  c.poly([[0, 0], [220, 0], [90, M.top], [0, M.top]], { fill: "#4B0082", op: 0.9 });
  return c.done();
});

// 10 The Executive Ribbon — left/right vertical ribbons in margins
corpItem("corp-10", "The Executive Ribbon", () => {
  const c = canvas("#ffffff");
  c.rect(0, 0, M.left, H, { fill: "#000080" });
  c.rect(0, 0, 6, H, { fill: "#CC7722" });
  c.rect(W - M.right, 0, M.right, H, { fill: "#000080" });
  c.rect(W - 6, 0, 6, H, { fill: "#CC7722" });
  c.rect(0, 0, W, 8, { fill: "#000080" });
  c.rect(0, H - 8, W, 8, { fill: "#000080" });
  return c.done();
});

// ============================================================ ACADEMIC
const acad = [];
function acadItem(id, name, fn) { acad.push({ id, name, inner: fn() }); }

acadItem("acad-01", "Victorian Filigree", () => {
  const c = canvas("#FFFFF0");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#2B2B2B", sw: 2 });
  ring(c, 52, 52, W - 104, H - 104, { stroke: "#2B2B2B", sw: 0.5 });
  // filigree corners tucked into the margin
  const fil = (x, y, sx, sy) => c.path(
    `M ${x} ${y} q ${30 * sx} 0 ${38 * sx} ${22 * sy} q ${8 * sx} ${22 * sy} ${38 * sx} ${22 * sy}`,
    { fill: "none", stroke: "#B08D57", sw: 1.5 });
  fil(78, 86, 1, 1); fil(W - 78, 86, -1, 1); fil(78, H - 86, 1, -1); fil(W - 78, H - 86, -1, -1);
  c.circle(W / 2, 62, 9, { fill: "none", stroke: "#B08D57", sw: 1 });
  c.circle(W / 2, H - 62, 9, { fill: "none", stroke: "#B08D57", sw: 1 });
  return c.done();
});

acadItem("acad-02", "Olive Branch Motif", () => {
  const c = canvas("#ffffff");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#355E3B", sw: 1 });
  const branch = (cx, cy, dir) => {
    let d = `M ${cx} ${cy} q ${40 * dir} -30 ${86 * dir} -10`;
    c.path(d, { fill: "none", stroke: "#6B8E23", sw: 2 });
    for (let i = 0; i < 6; i++) {
      const t = i / 5, px = cx + dir * (t * 86), py = cy - 30 * Math.sin(t * Math.PI) - (t * -10);
      c.ellipse(px, py - 8 * (i % 2 ? 1 : -1), 11, 5, {
        fill: "#6B8E23", op: 0.85,
        transform: `rotate(${dir * (i % 2 ? -28 : 28)} ${n(px)} ${n(py)})`,
      });
    }
  };
  branch(M.left + 30, H * 0.5, 1);
  branch(W - M.right - 30, H * 0.5, -1);
  c.circle(W / 2, 58, 12, { fill: "none", stroke: "#355E3B", sw: 1.5 });
  c.circle(W / 2, 58, 4, { fill: "#6B8E23" });
  return c.done();
});

acadItem("acad-03", "Gothic Arch Border", () => {
  const c = canvas("#ffffff");
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#000080", sw: 4 });
  ring(c, 42, 42, W - 84, H - 84, { stroke: "#000080", sw: 1 });
  // arch points along top & bottom in the margin
  for (let x = 120; x <= W - 120; x += 110) {
    c.path(`M ${x - 26} 30 q 26 -22 52 0`, { fill: "none", stroke: "#000080", sw: 2 });
    c.path(`M ${x - 26} ${H - 30} q 26 22 52 0`, { fill: "none", stroke: "#000080", sw: 2 });
  }
  return c.done();
});

acadItem("acad-04", "Simple Double Line", () => {
  const c = canvas("#FFFDD0");
  ring(c, 48, 48, W - 96, H - 96, { stroke: "#111111", sw: 4 });
  ring(c, 58, 58, W - 116, H - 116, { stroke: "#111111", sw: 1 });
  ring(c, 66, 66, W - 132, H - 132, { stroke: "#111111", sw: 0.5 });
  return c.done();
});

acadItem("acad-05", "Burgundy & Gold", () => {
  const c = canvas("#ffffff");
  ring(c, 0, 0, W, H, { stroke: "#800020", sw: 90 });
  ring(c, 70, 70, W - 140, H - 140, { stroke: "#D4AF37", sw: 2 });
  ring(c, 80, 80, W - 160, H - 160, { stroke: "#D4AF37", sw: 0.5 });
  c.circle(70, 70, 16, { fill: "#D4AF37" });
  c.circle(W - 70, 70, 16, { fill: "#D4AF37" });
  c.circle(70, H - 70, 16, { fill: "#D4AF37" });
  c.circle(W - 70, H - 70, 16, { fill: "#D4AF37" });
  return c.done();
});

acadItem("acad-06", "Ribbon Corner", () => {
  const c = canvas("#FFFFF0");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#111111", sw: 1 });
  // corner ribbons kept inside the 95px margin so they never touch the title row
  const corner = (x, y, sx, sy) => {
    c.poly([[x, y], [x + 84 * sx, y], [x, y + 84 * sy]], { fill: "#800020" });
    c.poly([[x, y + 20 * sy], [x + 56 * sx, y], [x, y + 68 * sy]], { fill: "#D4AF37", op: 0.9 });
  };
  corner(40, 40, 1, 1); corner(W - 40, 40, -1, 1);
  corner(40, H - 40, 1, -1); corner(W - 40, H - 40, -1, -1);
  return c.done();
});

acadItem("acad-07", "Greek Key Pattern", () => {
  const c = canvas("#ffffff");
  ring(c, 0, 0, W, H, { stroke: "#0B0B0B", sw: 60 });
  ring(c, 44, 44, W - 88, H - 88, { stroke: "#0B0B0B", sw: 1 });
  // meander key drawn inside the bottom margin strip
  const keyY = H - 38;
  for (let x = 40; x < W - 90; x += 56) {
    c.path(`M ${x} ${keyY} h 34 v -18 h -22 v 8`, { fill: "none", stroke: "#D4AF37", sw: 2 });
  }
  return c.done();
});

acadItem("acad-08", "Heavy Serif Frame", () => {
  const c = canvas("#ffffff");
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#000080", sw: 8 });
  ring(c, 46, 46, W - 92, H - 92, { stroke: "#000080", sw: 2 });
  ring(c, 56, 56, W - 112, H - 112, { stroke: "#000080", sw: 0.5 });
  // small diamonds on the frame midline
  for (const x of [W * 0.25, W * 0.75]) {
    c.poly([[x, 22], [x + 11, 34], [x, 46], [x - 11, 34]], { fill: "#000080" });
    c.poly([[x, H - 22], [x + 11, H - 34], [x, H - 46], [x - 11, H - 34]], { fill: "#000080" });
  }
  return c.done();
});

acadItem("acad-09", "Floral Damask", () => {
  const c = canvas("#FFFFF0");
  c.pattern("damask", 90, 90,
    `<path d="M45 12 q16 12 0 24 q-16 12 0 24 q16 12 0 24" fill="none" stroke="#E8D7B8" stroke-width="1.2"/>
     <circle cx="45" cy="45" r="3" fill="#E8D7B8"/>`);
  c.use("damask");
  c.veil({ fill: "#FFFFF0", op: 0.9, x: 60, y: 92, w: W - 120, h: H - 184, rx: 10 });
  ring(c, 58, 58, W - 116, H - 116, { stroke: "#C9A227", sw: 3 });
  ring(c, 68, 68, W - 136, H - 136, { stroke: "#C9A227", sw: 1 });
  return c.done();
});

acadItem("acad-10", "Classic Crest", () => {
  const c = canvas("#ffffff");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#708090", sw: 3 });
  ring(c, 50, 50, W - 100, H - 100, { stroke: "#708090", sw: 0.75 });
  // crest medallion placed in bottom margin, not on the name row
  const mx = W / 2, my = H - 52;
  c.path(`M ${mx} ${my - 26} l 24 10 v 22 q 0 20 -24 28 q -24 -8 -24 -28 v -22 z`,
    { fill: "#708090", op: 0.9 });
  c.circle(mx, my + 2, 7, { fill: "#ffffff" });
  c.poly([[W * 0.2, H - 52], [W * 0.2 + 8, H - 44], [W * 0.2, H - 36], [W * 0.2 - 8, H - 44]], { fill: "#708090" });
  c.poly([[W * 0.8, H - 52], [W * 0.8 + 8, H - 44], [W * 0.8, H - 36], [W * 0.8 - 8, H - 44]], { fill: "#708090" });
  return c.done();
});

// ============================================================ TECH
const tech = [];
function techItem(id, name, fn) { tech.push({ id, name, inner: fn() }); }

techItem("tech-01", "Cybernetic Node Network", () => {
  const c = canvas("#0B0B0B");
  // frame sits OUTSIDE the ornament so nothing overlaps the corner traces
  c.veil({ fill: "#0B0B0B", op: 0.94, x: 44, y: 78, w: W - 88, h: H - 156, rx: 14 });
  ring(c, 28, 28, W - 56, H - 56, { stroke: "#00FFFF", sw: 1.5, op: 0.85 });
  // circuit traces hugging the margins, clear of the ring
  const tr = (x, y, dir) => c.path(
    `M ${x} ${y} h ${dir * 54} v -20 h ${dir * 36}`, { fill: "none", stroke: "#00FFFF", sw: 1.5, op: 0.8 });
  tr(62, 64, 1); tr(W - 62, 64, -1); tr(62, H - 64, 1); tr(W - 62, H - 64, -1);
  c.circle(72, 66, 5, { fill: "#00FFFF" });
  c.circle(W - 72, 66, 5, { fill: "#00FFFF" });
  c.circle(72, H - 66, 5, { fill: "#00FFFF" });
  c.circle(W - 72, H - 66, 5, { fill: "#00FFFF" });
  return c.done();
});

techItem("tech-02", "Isometric Tech Grid", () => {
  const c = canvas("#ffffff");
  // isometric rhombus band bottom margin
  for (let x = 40; x < W; x += 60) {
    c.poly([[x, H - 20], [x + 30, H - 46], [x + 60, H - 20], [x + 30, H + 6]],
      { fill: "none", stroke: "#1E88E5", sw: 1.5 });
  }
  ring(c, 36, 30, W - 72, H - 60, { stroke: "#0F172A", sw: 1 });
  c.rect(36, 30, 140, 6, { fill: "#1E88E5" });
  return c.done();
});

techItem("tech-03", "Flat Tech-Brutalism", () => {
  const c = canvas("#ffffff");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#000000", sw: 4 });
  c.rect(0, 0, 150, 20, { fill: "#000000" });
  c.rect(W - 150, H - 20, 150, 20, { fill: "#000000" });
  c.rect(40, 40, 220, 8, { fill: "#00FFFF" });
  c.rect(W - 260, H - 48, 220, 8, { fill: "#00FFFF" });
  c.rect(70, H - 74, 8, 34, { fill: "#FF00FF" });
  return c.done();
});

techItem("tech-04", "Minimalist Digital Wireframe", () => {
  const c = canvas("#ffffff");
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#7DF9FF", sw: 0.75 });
  ring(c, 44, 44, W - 88, H - 88, { stroke: "#E2E8F0", sw: 0.5 });
  for (const x of [W * 0.18, W * 0.5, W * 0.82]) {
    c.line(x, 30, x, 54, { stroke: "#7DF9FF", sw: 1 });
    c.line(x, H - 30, x, H - 54, { stroke: "#7DF9FF", sw: 1 });
  }
  return c.done();
});

techItem("tech-05", "Binary Algorithm Blocks", () => {
  const c = canvas("#1A1A1A");
  // blocks only in top & bottom margins
  const blocks = (yBase, flip) => {
    for (let x = 40; x < W - 80; x += 130) {
      const h = 34 + ((x / 13) % 3) * 14;
      c.rect(x, flip ? H - yBase - h : yBase, 110, h, { fill: "#36454F" });
      c.rect(x, flip ? H - yBase - h : yBase, 110, 5, { fill: "#00E5FF" });
    }
  };
  blocks(24, false); blocks(24, true);
  ring(c, 26, 26, W - 52, H - 52, { stroke: "#00E5FF", sw: 1, op: 0.7 });
  c.veil({ fill: "#1A1A1A", op: 0.94, x: 46, y: 82, w: W - 92, h: H - 164, rx: 12 });
  return c.done();
});

techItem("tech-06", "Synthwave Vector", () => {
  const c = canvas("#2A0A4A");
  // sun lifted fully into the top margin, horizon line below it
  c.path(`M ${W / 2 - 78} ${M.top - 14} a 78 78 0 0 1 156 0 z`, { fill: "#FF69B4" });
  c.rect(0, M.top - 14, W, 3, { fill: "#FFD166" });
  // perspective floor in bottom margin
  for (let i = -8; i <= 8; i++) {
    c.line(W / 2 + i * 40, H - M.bot + 6, W / 2 + i * 170, H, { stroke: "#00FFFF", sw: 1, op: 0.5 });
  }
  for (let y = H - M.bot + 20; y < H; y += 20) c.line(0, y, W, y, { stroke: "#00FFFF", sw: 0.75, op: 0.35 });
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#00FFFF", sw: 1, op: 0.6 });
  c.veil({ fill: "#2A0A4A", op: 0.9, x: 56, y: 92, w: W - 112, h: H - 192, rx: 12 });
  return c.done();
});

techItem("tech-07", "Pixel Art Interface", () => {
  const c = canvas("#ffffff");
  ring(c, 50, 50, W - 100, H - 100, { stroke: "#000000", sw: 4 });
  // pixel stair motif confined to corners
  const stair = (x, y, sx, sy) => {
    for (let i = 0; i < 5; i++) {
      c.rect(x + sx * i * 16, y + sy * i * 16, 16, 16,
        { fill: i % 2 ? "#FF00FF" : "#00FFFF" });
    }
  };
  stair(58, 58, 1, 1); stair(W - 58 - 16, 58, -1, 1);
  stair(58, H - 58 - 16, 1, -1); stair(W - 58 - 16, H - 58 - 16, -1, -1);
  return c.done();
});

techItem("tech-08", "Sine Wave Dynamics", () => {
  const c = canvas("#0D1117");
  // waves confined to top & bottom margin bands
  const wave = (y, amp, color, op) => {
    let d = `M 0 ${y}`;
    for (let x = 0; x <= W; x += 140) d += ` Q ${x + 70} ${y - amp} ${x + 140} ${y}`;
    c.path(d, { fill: "none", stroke: color, sw: 2.5, op });
  };
  wave(30, 26, "#00FFFF", 0.9); wave(58, 16, "#7DF9FF", 0.55);
  wave(H - 30, 26, "#00FFFF", 0.9); wave(H - 58, 16, "#7DF9FF", 0.55);
  ring(c, 24, 24, W - 48, H - 48, { stroke: "#00FFFF", sw: 1, op: 0.5 });
  c.veil({ fill: "#0D1117", op: 0.9, x: 44, y: 84, w: W - 88, h: H - 168, rx: 12 });
  return c.done();
});

techItem("tech-09", "Hexagonal Data Architecture", () => {
  const c = canvas("#ffffff");
  const hex = (cx, cy, r, opts) => {
    const p = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 3 * i - Math.PI / 6;
      p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    c.poly(p, opts);
  };
  // hex cluster in right margin column
  for (let i = 0; i < 3; i++) hex(W - 40, 120 + i * 62, 26, { fill: "none", stroke: "#1E88E5", sw: 1.5 });
  for (let i = 0; i < 2; i++) hex(30, 150 + i * 62, 20, { fill: "none", stroke: "#1E88E5", sw: 1.5 });
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#0F172A", sw: 1 });
  c.rect(30, 30, 120, 5, { fill: "#1E88E5" });
  return c.done();
});

techItem("tech-10", "Vector Glitch Art", () => {
  const c = canvas("#ffffff");
  // glitch slices confined to the left/right margins
  const slices = (xBase, dir) => {
    for (let i = 0; i < 7; i++) {
      const y = 120 + i * 78, w = 30 + (i % 3) * 22;
      c.rect(dir > 0 ? xBase : xBase - w, y, w, 26,
        { fill: i % 3 === 0 ? "#00FFFF" : i % 3 === 1 ? "#FF00FF" : "#0F172A", op: 0.9 });
    }
  };
  slices(0, 1); slices(W, -1);
  ring(c, 34, 30, W - 68, H - 60, { stroke: "#0F172A", sw: 1.5 });
  return c.done();
});

// ============================================================ CREATIVE
const crea = [];
function creaItem(id, name, fn) { crea.push({ id, name, inner: fn() }); }

creaItem("crea-01", "De Stijl Geometric", () => {
  const c = canvas("#ffffff");
  // Mondrian bands only in margins
  c.rect(0, 0, W, M.top, { fill: "#FF0000" });
  c.rect(0, 0, W, M.top, { fill: "#FFFFFF", op: 0 });
  c.rect(0, 0, 190, M.top, { fill: "#0000CC" });
  c.rect(0, H - M.bot, W, M.bot, { fill: "#FFD400" });
  c.rect(W - 210, H - M.bot, 210, M.bot, { fill: "#000000" });
  c.rect(0, M.top, W, 7, { fill: "#000000" });
  c.rect(0, H - M.bot - 7, W, 7, { fill: "#000000" });
  c.rect(W - 210, M.top, 7, H - M.top - M.bot, { fill: "#000000" });
  return c.done();
});

creaItem("crea-02", "Fluid Abstract Expressionism", () => {
  const c = canvas("#FFF5EE");
  // organic shapes pushed to outer edges
  c.path(`M 0 ${H * 0.55} C ${W * 0.10} ${H * 0.4}, ${W * 0.10} ${H * 0.7}, 0 ${H * 0.75} Z`,
    { fill: "#FF7F50", op: 0.85 });
  c.path(`M ${W} ${H * 0.35} C ${W * 0.88} ${H * 0.25}, ${W * 0.88} ${H * 0.6}, ${W} ${H * 0.55} Z`,
    { fill: "#FFB347", op: 0.85 });
  c.path(`M 0 0 Q ${W * 0.12} ${H * 0.02} ${W * 0.2} 0 Z`, { fill: "#E2725B", op: 0.6 });
  c.path(`M ${W} ${H} Q ${W * 0.86} ${H * 0.96} ${W * 0.78} ${H} Z`, { fill: "#E2725B", op: 0.6 });
  ring(c, 44, 40, W - 88, H - 80, { stroke: "#7A3B2E", sw: 1, op: 0.35 });
  return c.done();
});

creaItem("crea-03", "Memphis Milano 80s", () => {
  const c = canvas("#FAFAFA");
  const dot = (cx, cy, r, col) => {
    c.circle(cx, cy, r, { fill: col });
    c.circle(cx - r * 0.3, cy - r * 0.3, r * 0.22, { fill: "#FAFAFA" });
  };
  dot(76, 62, 26, "#FF00FF"); dot(W - 76, 62, 22, "#00E5FF");
  dot(76, H - 62, 22, "#FFD400"); dot(W - 76, H - 62, 28, "#FF5C8A");
  c.rect(W / 2 - 46, 44, 92, 26, { fill: "#00E5FF" });
  for (let x = W * 0.3; x < W * 0.7; x += 22) c.line(x, H - 66, x, H - 40, { stroke: "#FF00FF", sw: 3 });
  ring(c, 34, 34, W - 68, H - 68, { stroke: "#111111", sw: 3 });
  return c.done();
});

creaItem("crea-04", "Boho Contemporary Abstract", () => {
  const c = canvas("#FAF9F6");
  // quarter-circle shapes in corners
  c.path(`M 0 0 L 150 0 A 150 150 0 0 1 0 150 Z`, { fill: "#E2725B", op: 0.9 });
  c.path(`M ${W} ${H} L ${W - 170} ${H} A 170 170 0 0 0 ${W} ${H - 170} Z`, { fill: "#C9A227", op: 0.85 });
  c.path(`M ${W} 0 L ${W - 120} 0 A 120 120 0 0 0 ${W} 120 Z`, { fill: "#7E9A7A", op: 0.8 });
  c.path(`M 0 ${H} L 130 ${H} A 130 130 0 0 1 0 ${H - 130} Z`, { fill: "#D98E73", op: 0.75 });
  return c.done();
});

creaItem("crea-05", "Editorial Color Blocking", () => {
  const c = canvas("#ffffff");
  // black block moved to top margin strip, not full-height
  c.rect(0, 0, W, M.top, { fill: "#000000" });
  c.rect(0, 0, 300, M.top, { fill: "#FF0055" });
  // bottom accent
  c.rect(0, H - M.bot, W, M.bot, { fill: "#F2F2F2" });
  c.rect(W - 340, H - M.bot, 340, M.bot, { fill: "#000000" });
  c.rect(W - 340, H - M.bot, 12, M.bot, { fill: "#FF0055" });
  return c.done();
});

creaItem("crea-06", "Vector Paint Stroke Illusion", () => {
  const c = canvas("#ffffff");
  // strokes rendered as ribbons across the top and bottom margins only
  const ribbon = (y, h, col, op) => c.path(
    `M 0 ${y} Q ${W * 0.25} ${y - 16} ${W * 0.5} ${y} T ${W} ${y} L ${W} ${y + h} Q ${W * 0.75} ${y + h + 16} ${W * 0.5} ${y + h} T 0 ${y + h} Z`,
    { fill: col, op });
  ribbon(6, 26, "#FF1493", 0.9);
  ribbon(38, 20, "#FFB347", 0.85);
  ribbon(64, 14, "#00B4D8", 0.8);
  ribbon(H - 100, 22, "#00B4D8", 0.8);
  ribbon(H - 74, 28, "#FFB347", 0.85);
  ribbon(H - 44, 30, "#FF1493", 0.9);
  return c.done();
});

creaItem("crea-07", "Continuous Monoline Art", () => {
  const c = canvas("#F5F5DC");
  // monoline snake running along the margins (top, right, bottom, left)
  c.path(
    `M 70 50 H ${W - 70} Q ${W - 34} 50 ${W - 34} 86 V ${H - 86} Q ${W - 34} ${H - 50} ${W - 70} ${H - 50} H 70 Q 34 ${H - 50} 34 ${H - 86} V 86 Q 34 50 70 50 Z`,
    { fill: "none", stroke: "#0F172A", sw: 3 });
  c.circle(70, 50, 7, { fill: "#FF6B35" });
  c.circle(W - 34, H / 2, 7, { fill: "#FF6B35" });
  c.circle(W / 2, H - 50, 7, { fill: "#FF6B35" });
  return c.done();
});

creaItem("crea-08", "Stained Glass Geometric", () => {
  const c = canvas("#ffffff");
  // glass shards fill only the margin ring
  const shard = (pts, col) => c.poly(pts, { fill: col, stroke: "#000000", sw: 3 });
  shard([[0, 0], [140, 0], [70, 95], [0, 95]], "#FF0055");
  shard([[140, 0], [300, 0], [230, 95], [70, 95]], "#FFD400");
  shard([[300, 0], [440, 0], [370, 95], [230, 95]], "#00B4D8");
  shard([[440, 0], [W, 0], [W, 95], [370, 95]], "#2E7D32");
  shard([[0, H], [110, H], [60, H - 95], [0, H - 95]], "#2E7D32");
  shard([[110, H], [280, H], [220, H - 95], [60, H - 95]], "#FFD400");
  shard([[280, H], [450, H], [390, H - 95], [220, H - 95]], "#FF0055");
  shard([[450, H], [W, H], [W, H - 95], [390, H - 95]], "#00B4D8");
  return c.done();
});

creaItem("crea-09", "Op-Art Optical Illusion", () => {
  const c = canvas("#ffffff");
  // concentric ripples centred in the middle but masked away from the band
  c.pattern("ripple", W, 200,
    Array.from({ length: 10 }, (_, i) =>
      `<path d="M 0 ${100 + i * 9} Q ${W / 2} ${60 + i * 9} ${W} ${100 + i * 9}" fill="none" stroke="#111" stroke-width="1.4"/>`
    ).join(""));
  c.rect(0, 0, W, 100, { fill: "url(#ripple)" });
  c.rect(0, H - 100, W, 100, { fill: "url(#ripple)" });
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#111111", sw: 2 });
  return c.done();
});

creaItem("crea-10", "Pop Art Halftone Vector", () => {
  const c = canvas("#ffffff");
  c.pattern("ht10", 16, 16, `<circle cx="8" cy="8" r="5" fill="#00E5FF"/>`);
  c.pattern("ht10b", 16, 16, `<circle cx="8" cy="8" r="5" fill="#FF00FF"/>`);
  // halftone only in top & bottom margins
  c.rect(0, 0, W * 0.42, M.top, { fill: "url(#ht10)" });
  c.rect(W * 0.58, 0, W * 0.42, M.top, { fill: "url(#ht10b)" });
  c.rect(0, H - M.bot, W * 0.42, M.bot, { fill: "url(#ht10b)" });
  c.rect(W * 0.58, H - M.bot, W * 0.42, M.bot, { fill: "url(#ht10)" });
  ring(c, 36, 30, W - 72, H - 60, { stroke: "#000000", sw: 3 });
  return c.done();
});

// ============================================================ LUXURY
const lux = [];
function luxItem(id, name, fn) { lux.push({ id, name, inner: fn() }); }

luxItem("lux-01", "Art Deco Opulence", () => {
  const c = canvas("#111111");
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#D4AF37", sw: 1.5 });
  ring(c, 44, 44, W - 88, H - 88, { stroke: "#D4AF37", sw: 0.5 });
  // deco fans in corners, reaching only ~90px inward
  const fan = (cx, cy, sx, sy) => {
    for (let i = 1; i <= 4; i++) {
      c.path(`M ${cx} ${cy} L ${cx + sx * 90} ${cy + sy * 22 * i} L ${cx + sx * 20 * i} ${cy + sy * 90}`,
        { fill: "none", stroke: "#D4AF37", sw: 0.75, op: 0.85 });
    }
  };
  fan(30, 30, 1, 1); fan(W - 30, 30, -1, 1); fan(30, H - 30, 1, -1); fan(W - 30, H - 30, -1, -1);
  c.line(W * 0.3, 40, W * 0.7, 40, { stroke: "#D4AF37", sw: 1 });
  c.line(W * 0.3, H - 40, W * 0.7, H - 40, { stroke: "#D4AF37", sw: 1 });
  return c.done();
});

luxItem("lux-02", "High-Fashion Minimalism", () => {
  const c = canvas("#ffffff");
  ring(c, 60, 60, W - 120, H - 120, { stroke: "#B76E79", sw: 1 });
  ring(c, 72, 72, W - 144, H - 144, { stroke: "#E8D5D8", sw: 0.5 });
  // elegant serif-like monogram marks in margins
  c.line(W * 0.42, 66, W * 0.58, 66, { stroke: "#B76E79", sw: 2 });
  c.line(W * 0.42, H - 66, W * 0.58, H - 66, { stroke: "#B76E79", sw: 2 });
  c.circle(W / 2, 44, 12, { fill: "none", stroke: "#B76E79", sw: 0.75 });
  return c.done();
});

luxItem("lux-03", "Monoline Diamond Geometry", () => {
  const c = canvas("#2C3539");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#D4AF37", sw: 2 });
  c.pattern("dia", 60, 60,
    `<path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#D4AF37" stroke-width="0.5" opacity="0.5"/>`);
  // diamond field only outside band
  c.rect(0, 0, W, 90, { fill: "url(#dia)" });
  c.rect(0, H - 90, W, 90, { fill: "url(#dia)" });
  c.poly([[W / 2, 52], [W / 2 + 16, 68], [W / 2, 84], [W / 2 - 16, 68]], { fill: "#D4AF37" });
  return c.done();
});

luxItem("lux-04", "Burgundy & Gold Regal", () => {
  const c = canvas("#600018");
  ring(c, 50, 50, W - 100, H - 100, { stroke: "#FFD700", sw: 3 });
  ring(c, 62, 62, W - 124, H - 124, { stroke: "#FFD700", sw: 1 });
  // corner discs sized 26 so they stay clear of name/title rows
  const disc = (cx, cy) => {
    c.circle(cx, cy, 26, { fill: "#600018", stroke: "#FFD700", sw: 2 });
    c.path(`M ${cx - 14} ${cy} a 14 14 0 0 1 28 0`, { fill: "none", stroke: "#FFD700", sw: 1 });
    c.circle(cx, cy, 5, { fill: "#FFD700" });
  };
  disc(50, 50); disc(W - 50, 50); disc(50, H - 50); disc(W - 50, H - 50);
  c.line(W * 0.34, 62, W * 0.66, 62, { stroke: "#FFD700", sw: 1 });
  c.line(W * 0.34, H - 62, W * 0.66, H - 62, { stroke: "#FFD700", sw: 1 });
  return c.done();
});

luxItem("lux-05", "Vector Marble Veining", () => {
  const c = canvas("#FAFAFA");
  // veining routed through the margins only
  const vein = (y, amp, op) => c.path(
    `M 0 ${y} Q ${W * 0.22} ${y - amp} ${W * 0.42} 0`, { fill: "none", stroke: "#D9D9D9", sw: 3, op });
  c.path(`M 0 70 Q ${W * 0.3} 20 ${W * 0.55} 0`, { fill: "none", stroke: "#E0E0E0", sw: 4 });
  c.path(`M ${W} ${H - 70} Q ${W * 0.7} ${H - 20} ${W * 0.45} ${H}`, { fill: "none", stroke: "#E0E0E0", sw: 4 });
  c.path(`M 0 ${H - 60} Q ${W * 0.2} ${H - 100} ${W * 0.32} ${H}`, { fill: "none", stroke: "#E8E8E8", sw: 2 });
  ring(c, 46, 46, W - 92, H - 92, { stroke: "#C0C0C0", sw: 1 });
  return c.done();
});

luxItem("lux-06", "Concentric Golden Frame", () => {
  const c = canvas("#0C1445");
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#D4AF37", sw: 4 });
  ring(c, 46, 46, W - 92, H - 92, { stroke: "#D4AF37", sw: 1.5 });
  ring(c, 58, 58, W - 116, H - 116, { stroke: "#D4AF37", sw: 0.5 });
  // gold corner accents sized to stay within 60px
  const acc = (x, y, sx, sy) => {
    c.poly([[x, y], [x + 60 * sx, y], [x, y + 60 * sy]], { fill: "#D4AF37" });
    c.poly([[x, y], [x + 32 * sx, y], [x, y + 32 * sy]], { fill: "#0C1445" });
  };
  acc(30, 30, 1, 1); acc(W - 30, 30, -1, 1); acc(30, H - 30, 1, -1); acc(W - 30, H - 30, -1, -1);
  return c.done();
});

luxItem("lux-07", "Scalloped Art Nouveau", () => {
  const c = canvas("#ffffff");
  // scallop arcs fully inside the top/bottom margin strips
  const scallop = (yTop, flip) => {
    let d = `M 0 ${yTop}`;
    for (let x = 0; x < W; x += 56) d += ` q 28 ${flip * -22} 56 0`;
    d += ` L ${W} ${flip ? 0 : H} L 0 ${flip ? 0 : H} Z`;
    c.path(d, { fill: "#7B9E64", op: 0.9 });
  };
  scallop(0, 1);
  scallop(H, -1);
  ring(c, 40, M.top + 10, W - 80, H - 2 * M.top - 20, { stroke: "#C9A227", sw: 1.5 });
  c.circle(W / 2, M.top - 24, 12, { fill: "none", stroke: "#C9A227", sw: 1.5 });
  c.circle(W / 2, H - M.top + 24, 12, { fill: "none", stroke: "#C9A227", sw: 1.5 });
  return c.done();
});

luxItem("lux-08", "Guilloche Excellence", () => {
  const c = canvas("#1A1A1A");
  // guilloche rings confined to corners
  const rosette = (cx, cy) => {
    for (let i = 0; i < 7; i++) {
      c.ellipse(cx, cy, 40, 14, {
        fill: "none", stroke: "#D4AF37", sw: 0.5, op: 0.9,
        transform: `rotate(${i * 25.7} ${cx} ${cy})`,
      });
    }
    c.circle(cx, cy, 6, { fill: "#D4AF37" });
  };
  rosette(64, 64); rosette(W - 64, 64); rosette(64, H - 64); rosette(W - 64, H - 64);
  ring(c, 34, 34, W - 68, H - 68, { stroke: "#D4AF37", sw: 1 });
  ring(c, 46, 46, W - 92, H - 92, { stroke: "#D4AF37", sw: 0.5 });
  return c.done();
});

luxItem("lux-09", "Foil Stamp Vector Illusion", () => {
  const c = canvas("#ffffff");
  ring(c, 50, 50, W - 100, H - 100, { stroke: "#DAA520", sw: 10 });
  ring(c, 66, 66, W - 132, H - 132, { stroke: "#B8860B", sw: 1 });
  ring(c, 76, 76, W - 152, H - 152, { stroke: "#F0D77B", sw: 0.5 });
  // foil corner ticks
  for (const [x, y] of [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]]) {
    c.circle(x, y, 13, { fill: "#DAA520" });
    c.circle(x, y, 6, { fill: "#ffffff" });
  }
  return c.done();
});

luxItem("lux-10", "The Obsidian Monolith", () => {
  const c = canvas("#050505");
  ring(c, 15, 15, W - 30, H - 30, { stroke: "#FFD700", sw: 1 });
  ring(c, 27, 27, W - 54, H - 54, { stroke: "#FFD700", sw: 0.5 });
  // vertical gold marker bars in the side margins only
  for (const x of [52, W - 52]) {
    c.rect(x - 3, H * 0.3, 6, H * 0.4, { fill: "#FFD700", op: 0.9 });
  }
  c.rect(W * 0.42, 38, W * 0.16, 4, { fill: "#FFD700" });
  c.rect(W * 0.42, H - 42, W * 0.16, 4, { fill: "#FFD700" });
  return c.done();
});

// ============================================================ SPORTS
const sport = [];
function sportItem(id, name, fn) { sport.push({ id, name, inner: fn() }); }

sportItem("sport-01", "Kinetic Chevron Vectors", () => {
  const c = canvas("#ffffff");
  // chevrons confined to the left & right margins
  const chev = (x, dir, col) => {
    c.poly([[x, 0], [x + dir * 40, 0], [x + dir * 4, H / 2], [x + dir * 40, H], [x, H], [x + dir * 36, H / 2]],
      { fill: col });
  };
  chev(0, 1, "#E32636");
  chev(W, -1, "#1C1C1C");
  // top/bottom speed band
  c.rect(0, 0, W, 16, { fill: "#1C1C1C" });
  c.rect(0, 0, W * 0.4, 16, { fill: "#E32636" });
  c.rect(0, H - 16, W, 16, { fill: "#1C1C1C" });
  c.rect(W * 0.6, H - 16, W * 0.4, 16, { fill: "#E32636" });
  return c.done();
});

sportItem("sport-02", "Velocity Speed Lines", () => {
  const c = canvas("#F5F5F5");
  // speed lines only in the top & bottom margins
  const lines = (y, dir) => {
    for (let i = 0; i < 5; i++) {
      const w = 340 - i * 50;
      c.rect(W / 2 - w / 2, y + i * 17, w, 7, { fill: "#FF4500", op: 1 - i * 0.14 });
    }
  };
  lines(16, 1); lines(H - 100, 1);
  c.rect(0, 0, 12, H, { fill: "#1C1C1C" });
  c.rect(W - 12, 0, 12, H, { fill: "#1C1C1C" });
  return c.done();
});

sportItem("sport-03", "Diagonal Power Blocks", () => {
  const c = canvas("#ffffff");
  // diagonal slabs in the left & right margins
  c.poly([[0, 0], [110, 0], [40, H], [0, H]], { fill: "#1C1C1C" });
  c.poly([[W, 0], [W - 150, 0], [W - 80, H], [W, H]], { fill: "#E32636" });
  c.poly([[W - 60, 0], [W - 20, 0], [W - 10, H / 2], [W - 20, H], [W - 60, H]], { fill: "#1C1C1C" });
  c.rect(0, 0, W, 14, { fill: "#1C1C1C" });
  c.rect(0, H - 14, W, 14, { fill: "#1C1C1C" });
  return c.done();
});

sportItem("sport-04", "Track & Field Curves", () => {
  const c = canvas("#ffffff");
  // track ovals hugging the margins
  for (let i = 0; i < 4; i++) {
    c.ellipse(W / 2, H / 2, W / 2 - 20 - i * 14, H / 2 - 16 - i * 14,
      { fill: "none", stroke: i % 2 ? "#E53935" : "#1C1C1C", sw: 1.5, op: 0.85 });
  }
  c.veil({ fill: "#ffffff", op: 0.9, x: 66, y: 100, w: W - 132, h: H - 200, rx: 40 });
  return c.done();
});

sportItem("sport-05", "Sports Tech Hex-Mesh", () => {
  const c = canvas("#ffffff");
  c.pattern("hexmesh", 30, 52,
    `<path d="M15 0 L30 13 L30 39 L15 52 L0 39 L0 13 Z" fill="none" stroke="#0F172A" stroke-width="1"/>`);
  // mesh only in margins
  c.rect(0, 0, W, 88, { fill: "url(#hexmesh)" });
  c.rect(0, H - 88, W, 88, { fill: "url(#hexmesh)" });
  c.rect(0, 0, W, 88, { fill: "#0F172A", op: 0.06 });
  c.rect(0, H - 88, W, 88, { fill: "#0F172A", op: 0.06 });
  ring(c, 30, 30, W - 60, H - 60, { stroke: "#0F172A", sw: 2 });
  return c.done();
});

sportItem("sport-06", "Sweeping Nike-esque Swoosh", () => {
  const c = canvas("#ffffff");
  // swoosh confined to the bottom margin band
  c.path(`M 0 ${H - M.bot} Q ${W * 0.4} ${H - M.bot - 30} ${W} ${H - M.bot + 10} L ${W} ${H} L 0 ${H} Z`,
    { fill: "#000080" });
  c.path(`M 0 ${H - M.bot + 24} Q ${W * 0.45} ${H - M.bot - 6} ${W} ${H - M.bot + 34} L ${W} ${H - M.bot + 52} Q ${W * 0.45} ${H - M.bot + 12} 0 ${H - M.bot + 42} Z`,
    { fill: "#FF4500", op: 0.9 });
  c.rect(0, 0, W, 12, { fill: "#000080" });
  c.rect(0, 12, W * 0.3, 6, { fill: "#FF4500" });
  return c.done();
});

sportItem("sport-07", "Geometric Star Integration", () => {
  const c = canvas("#ffffff");
  ring(c, 50, 50, W - 100, H - 100, { stroke: "#E53935", sw: 12 });
  ring(c, 72, 72, W - 144, H - 144, { stroke: "#1C1C1C", sw: 1 });
  // stars in corners only
  const star = (cx, cy, r, col) => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.42 : r;
      p.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    c.poly(p, { fill: col });
  };
  star(50, 50, 24, "#E53935"); star(W - 50, 50, 24, "#E53935");
  star(50, H - 50, 24, "#E53935"); star(W - 50, H - 50, 24, "#E53935");
  return c.done();
});

sportItem("sport-08", "Extreme Sports Triangles", () => {
  const c = canvas("#ffffff");
  c.poly([[0, 0], [150, 0], [75, 84]], { fill: "#111111" });
  c.poly([[W, 0], [W - 150, 0], [W - 75, 84]], { fill: "#39FF14" });
  c.poly([[0, H], [150, H], [75, H - 84]], { fill: "#39FF14" });
  c.poly([[W, H], [W - 150, H], [W - 75, H - 84]], { fill: "#111111" });
  c.rect(0, 0, W, 12, { fill: "#111111" });
  c.rect(0, H - 12, W, 12, { fill: "#111111" });
  return c.done();
});

sportItem("sport-09", "Synthwave Cyber Athletics", () => {
  const c = canvas("#1a0b2e");
  // sun in top margin, horizon grid in bottom margin
  c.path(`M ${W / 2 - 62} ${M.top - 10} a 62 62 0 0 1 124 0 z`, { fill: "#FF2E93" });
  c.rect(0, M.top - 10, W, 3, { fill: "#00FFFF" });
  for (let i = -9; i <= 9; i++) {
    c.line(W / 2 + i * 34, H - M.bot, W / 2 + i * 160, H, { stroke: "#00FFFF", sw: 1, op: 0.55 });
  }
  for (let y = H - M.bot; y < H; y += 18) c.line(0, y, W, y, { stroke: "#FF2E93", sw: 0.75, op: 0.4 });
  ring(c, 26, 26, W - 52, H - 52, { stroke: "#00FFFF", sw: 1.5, op: 0.8 });
  c.veil({ fill: "#1a0b2e", op: 0.92, x: 52, y: 88, w: W - 104, h: H - 180, rx: 12 });
  return c.done();
});

sportItem("sport-10", "Varsity Letterman Stripes", () => {
  const c = canvas("#ffffff");
  // varsity stripes top & bottom margins
  const stripes = (y, dir) => {
    c.rect(0, y, W, 26, { fill: "#002366" });
    c.rect(0, y + (dir > 0 ? 26 : -10), W, 10, { fill: "#FFD700" });
    c.rect(0, y + (dir > 0 ? 36 : -22), W, 22, { fill: "#002366" });
  };
  stripes(0, 1); stripes(H - 58, -1);
  ring(c, 30, M.top + 8, W - 60, H - 2 * M.top - 16, { stroke: "#002366", sw: 3 });
  c.circle(W / 2, 62, 18, { fill: "#002366" });
  c.circle(W / 2, 62, 18, { fill: "none", stroke: "#FFD700", sw: 1.5 });
  return c.done();
});

// ============================================================ MEDICAL
const med = [];
function medItem(id, name, fn) { med.push({ id, name, inner: fn() }); }

medItem("med-01", "Clinical Swiss Minimalism", () => {
  const c = canvas("#FAFAFA");
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#E0E0E0", sw: 2 });
  // medical cross tucked into margins
  const cross = (cx, cy, s, col) => {
    c.rect(cx - s / 2, cy - s * 1.6, s, s * 3.2, { fill: col });
    c.rect(cx - s * 1.6, cy - s / 2, s * 3.2, s, { fill: col });
  };
  cross(30, 60, 9, "#0A7B83");
  cross(W - 30, H - 60, 9, "#0A7B83");
  c.rect(40, 40, 150, 4, { fill: "#0A7B83" });
  c.rect(W - 190, H - 44, 150, 4, { fill: "#0A7B83" });
  return c.done();
});

medItem("med-02", "Biophilic Healing Curves", () => {
  const c = canvas("#ffffff");
  // leaf/curve motifs in top & bottom margins
  c.path(`M 0 0 Q ${W * 0.25} ${M.top * 1.4} ${W * 0.5} 0 Z`, { fill: "#B2DFDB" });
  c.path(`M ${W} 0 Q ${W * 0.75} ${M.top * 1.6} ${W * 0.5} 0 Z`, { fill: "#80CBC4", op: 0.8 });
  c.path(`M 0 ${H} Q ${W * 0.28} ${H - M.bot * 1.5} ${W * 0.55} ${H} Z`, { fill: "#B2DFDB" });
  c.path(`M ${W} ${H} Q ${W * 0.72} ${H - M.bot * 1.7} ${W * 0.45} ${H} Z`, { fill: "#80CBC4", op: 0.8 });
  ring(c, 44, 40, W - 88, H - 80, { stroke: "#4DB6AC", sw: 1, op: 0.6 });
  return c.done();
});

medItem("med-03", "Vector EKG Rhythm Line", () => {
  const c = canvas("#ffffff");
  c.rect(0, H - M.bot, W, M.bot, { fill: "#F5F5F5" });
  // EKG trace in the bottom margin band
  const y0 = H - M.bot / 2;
  let d = `M 40 ${y0} h 120 l 22 -34 l 26 60 l 24 -26 h 90`;
  d += ` l 22 -34 l 26 60 l 24 -26 h 120 l 22 -34 l 26 60 l 24 -26 h 120`;
  d += ` l 22 -34 l 26 60 l 24 -26 h 120`;
  c.path(d, { fill: "none", stroke: "#E53935", sw: 3, join: "round", cap: "round" });
  c.rect(0, 0, W, 10, { fill: "#E53935" });
  c.rect(0, 0, W * 0.35, 10, { fill: "#1C1C1C" });
  return c.done();
});

medItem("med-04", "Sterile Geometric Capsule", () => {
  const c = canvas("#ffffff");
  c.rect(40, 40, W - 80, H - 80, { rx: 150, ry: 150, fill: "none", stroke: "#009688", sw: 3 });
  c.rect(56, 56, W - 112, H - 112, { rx: 138, ry: 138, fill: "none", stroke: "#B2DFDB", sw: 1 });
  // capsule pills in bottom margin
  c.rect(W / 2 - 70, H - M.bot / 2 - 15, 140, 30, { rx: 15, ry: 15, fill: "#009688", op: 0.9 });
  c.rect(W / 2 - 70, H - M.bot / 2 - 15, 70, 30, { rx: 15, ry: 15, fill: "#B2DFDB" });
  return c.done();
});

medItem("med-05", "Stylized DNA Helix", () => {
  const c = canvas("#ffffff");
  // helix strands in the side margins only
  const helix = (x, dir) => {
    c.path(`M ${x} 60 C ${x + dir * 40} 200, ${x - dir * 40} 340, ${x} 480 C ${x + dir * 40} 620, ${x - dir * 40} 740, ${x} 740`,
      { fill: "none", stroke: "#1976D2", sw: 3 });
    c.path(`M ${x} 60 C ${x - dir * 40} 200, ${x + dir * 40} 340, ${x} 480 C ${x - dir * 40} 620, ${x + dir * 40} 740, ${x} 740`,
      { fill: "none", stroke: "#64B5F6", sw: 3 });
    for (let y = 110; y < 740; y += 90) {
      c.line(x - 16, y, x + 16, y, { stroke: "#90CAF9", sw: 2 });
    }
  };
  helix(34, 1); helix(W - 34, -1);
  ring(c, 60, 40, W - 120, H - 80, { stroke: "#1976D2", sw: 1, op: 0.5 });
  return c.done();
});

medItem("med-06", "Pharmaceutical Color Blocks", () => {
  const c = canvas("#ffffff");
  // pills in top & bottom margin rows
  const pill = (x, y, w, h, col) => {
    c.rect(x, y, w, h, { rx: h / 2, ry: h / 2, fill: col });
    c.rect(x, y, w / 2, h, { rx: h / 2, ry: h / 2, fill: "#ffffff", op: 0.65 });
  };
  const cols = ["#B3E5FC", "#81D4FA", "#4FC3F7", "#29B6F6", "#039BE5"];
  for (let i = 0; i < 5; i++) pill(60 + i * 100, 40, 78, 34, cols[i]);
  for (let i = 0; i < 5; i++) pill(60 + i * 100, H - 74, 78, 34, cols[4 - i]);
  ring(c, 42, 92, W - 84, H - 184, { stroke: "#0288D1", sw: 1, op: 0.5 });
  return c.done();
});

medItem("med-07", "Minimalist Caduceus Emblem", () => {
  const c = canvas("#FAFAFA");
  ring(c, 50, 50, W - 100, H - 100, { stroke: "#37474F", sw: 3 });
  ring(c, 62, 62, W - 124, H - 124, { stroke: "#B0BEC5", sw: 0.75 });
  // caduceus medallion in the bottom margin
  const cx = W / 2, cy = H - 54;
  c.circle(cx, cy, 26, { fill: "#FAFAFA", stroke: "#37474F", sw: 2 });
  c.line(cx, cy - 16, cx, cy + 16, { stroke: "#37474F", sw: 3 });
  c.path(`M ${cx - 11} ${cy - 10} q 22 8 0 16`, { fill: "none", stroke: "#37474F", sw: 2 });
  c.path(`M ${cx + 11} ${cy - 10} q -22 8 0 16`, { fill: "none", stroke: "#37474F", sw: 2 });
  return c.done();
});

medItem("med-08", "Mental Health Soft Vectors", () => {
  const c = canvas("#ffffff");
  // soft blobs pushed to the four corners
  c.circle(30, 30, 130, { fill: "#E8EAF6", op: 0.9 });
  c.circle(W - 20, 40, 150, { fill: "#E1F5FE", op: 0.9 });
  c.circle(40, H - 20, 140, { fill: "#F3E5F5", op: 0.85 });
  c.circle(W - 30, H - 30, 120, { fill: "#E8F5E9", op: 0.85 });
  ring(c, 70, 78, W - 140, H - 156, { stroke: "#B39DDB", sw: 1, op: 0.6 });
  return c.done();
});

medItem("med-09", "Emergency Response Contrast", () => {
  const c = canvas("#ffffff");
  c.rect(0, 0, W, 80, { fill: "#D32F2F" });
  c.rect(0, H - 80, W, 80, { fill: "#D32F2F" });
  // white cross inside the red bands
  const cross = (cx, cy, s) => {
    c.rect(cx - s / 2, cy - s * 1.5, s, s * 3, { fill: "#ffffff" });
    c.rect(cx - s * 1.5, cy - s / 2, s * 3, s, { fill: "#ffffff" });
  };
  cross(80, 40, 10); cross(W - 80, 40, 10);
  cross(80, H - 40, 10); cross(W - 80, H - 40, 10);
  c.rect(0, 80, W, 6, { fill: "#B71C1C" });
  c.rect(0, H - 86, W, 6, { fill: "#B71C1C" });
  return c.done();
});

medItem("med-10", "Modern Medical Architecture", () => {
  const c = canvas("#ffffff");
  // architectural sidebar in left margin
  c.rect(0, 0, 58, H, { fill: "#F0F4F8" });
  c.rect(58, 0, 10, H, { fill: "#00838F" });
  c.rect(78, 0, 3, H, { fill: "#B0BEC5" });
  // blocks top & bottom
  c.rect(88, 30, 200, 26, { fill: "#F0F4F8" });
  c.rect(88, 30, 6, 26, { fill: "#00838F" });
  c.rect(W - 300, H - 56, 212, 26, { fill: "#F0F4F8" });
  c.rect(W - 94, H - 56, 6, 26, { fill: "#00838F" });
  for (let y = 120; y < H - 120; y += 90) c.rect(88, y, 26, 26, { fill: "#ECEFF1" });
  return c.done();
});

// ============================================================ KIDS
const kid = [];
function kidItem(id, name, fn) { kid.push({ id, name, inner: fn() }); }

kidItem("kid-01", "Playful Scalloped Edge", () => {
  const c = canvas("#06D6A0");
  c.rect(30, 30, W - 60, H - 60, { rx: 30, ry: 30, fill: "#ffffff" });
  c.rect(30, 30, W - 60, H - 60, { rx: 30, ry: 30, fill: "none", stroke: "#FFD166", sw: 8 });
  c.rect(52, 52, W - 104, H - 104, { rx: 22, ry: 22, fill: "none", stroke: "#EF476F", sw: 3 });
  // confetti dots in the green margin ring only
  const cols = ["#FFD166", "#EF476F", "#118AB2", "#FF9F1C"];
  for (let x = 46; x < W - 40; x += 60) {
    c.circle(x, 16, 7, { fill: cols[(x / 60) % 4 | 0] });
    c.circle(x, H - 16, 7, { fill: cols[(x / 60 + 2) % 4 | 0] });
  }
  return c.done();
});

kidItem("kid-02", "Naive Art Sky Vector", () => {
  const c = canvas("#87CEEB");
  // sky band at top margin
  const cloud = (cx, cy, s) => {
    c.circle(cx, cy, 22 * s, { fill: "#ffffff" });
    c.circle(cx + 24 * s, cy + 6 * s, 17 * s, { fill: "#ffffff" });
    c.circle(cx - 24 * s, cy + 8 * s, 15 * s, { fill: "#ffffff" });
  };
  cloud(150, 50, 1); cloud(W - 200, 44, 0.85);
  c.poly([[W / 2, 14], [W / 2 + 13, 42], [W / 2 - 13, 42]], { fill: "#FFD166" });
  // grass band at bottom margin
  c.path(`M 0 ${H - M.bot} Q 140 ${H - M.bot - 26} 280 ${H - M.bot} T 560 ${H - M.bot} T 840 ${H - M.bot} T ${W} ${H - M.bot} L ${W} ${H} L 0 ${H} Z`,
    { fill: "#8BC34A" });
  return c.done();
});

kidItem("kid-03", "Crayon Zig-Zag Vector", () => {
  const c = canvas("#ffffff");
  // zigzag ribbons along top and bottom margins
  const zig = (y, col, phase) => {
    let d = `M 0 ${y}`;
    for (let x = 0; x < W; x += 80) d += ` l 40 ${phase} l 40 ${-phase}`;
    c.path(d, { fill: "none", stroke: col, sw: 10, join: "round", cap: "round" });
  };
  zig(24, "#EF476F", 24); zig(46, "#FFD166", 18); zig(64, "#118AB2", 14);
  zig(H - 24, "#118AB2", -24); zig(H - 46, "#FFD166", -18); zig(H - 64, "#EF476F", -14);
  return c.done();
});

kidItem("kid-04", "Flat Confetti Explosion", () => {
  const c = canvas("#ffffff");
  // deterministic confetti, margin ring only
  let seed = 7;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const cols = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#FF9F1C"];
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (x > 58 && x < W - 58 && y > 84 && y < H - 84) continue;
    const s = 6 + rnd() * 8;
    c.rect(x, y, s, s, {
      fill: cols[(rnd() * cols.length) | 0],
      transform: `rotate(${(rnd() * 90) | 0} ${n(x + s / 2)} ${n(y + s / 2)})`,
    });
  }
  ring(c, 40, 40, W - 80, H - 80, { stroke: "#E0E0E0", sw: 2 });
  return c.done();
});

kidItem("kid-05", "Geometric Jungle Safari", () => {
  const c = canvas("#F1F8E9");
  // foliage pushed into corners
  const leaf = (x, y, sx, sy, col) => c.path(
    `M ${x} ${y} C ${x + sx * 120} ${y + sy * 10}, ${x + sx * 120} ${y + sy * 100}, ${x} ${y + sy * 130} Z`,
    { fill: col });
  leaf(0, 0, 1, 1, "#4CAF50"); leaf(W, 0, -1, 1, "#66BB6A");
  leaf(0, H, 1, -1, "#66BB6A"); leaf(W, H, -1, -1, "#4CAF50");
  c.circle(W / 2, 46, 20, { fill: "#FFB300" });
  ring(c, 68, 74, W - 136, H - 148, { stroke: "#8D6E63", sw: 2 });
  return c.done();
});

kidItem("kid-06", "Flat Vector Cosmos", () => {
  const c = canvas("#1A237E");
  // planet & stars in margins
  const planet = (cx, cy, r, col) => {
    c.circle(cx, cy, r, { fill: col });
    c.ellipse(cx, cy, r * 1.7, r * 0.45, { fill: "none", stroke: "#B0BEC5", sw: 2 });
  };
  planet(80, 52, 22, "#FF9800");
  planet(W - 90, H - 52, 18, "#42A5F5");
  for (let i = 0; i < 40; i++) {
    const t = i * 137.5 * Math.PI / 180;
    const x = (i / 40) * W;
    const y = 20 + ((i * 53) % 55);
    c.circle(x, y, 2.5, { fill: "#ffffff", op: 0.85 });
    c.circle(x, H - 20 - ((i * 37) % 55), 2.5, { fill: "#ffffff", op: 0.85 });
  }
  ring(c, 40, 78, W - 80, H - 156, { stroke: "#FFD166", sw: 2, op: 0.7 });
  return c.done();
});

kidItem("kid-07", "Toy Building Blocks", () => {
  const c = canvas("#ffffff");
  // block rows top & bottom only
  const cols = ["#F44336", "#FFD166", "#06D6A0", "#2196F3", "#9C27B0"];
  const row = (y) => {
    let x = 0;
    for (let i = 0; i < 7; i++) {
      const w = 130 + (i % 2) * 30;
      c.rect(x, y, w - 6, 72, { fill: cols[i % 5] });
      c.circle(x + (w - 6) / 2, y + 14, 11, { fill: "#ffffff", op: 0.5 });
      x += w;
      if (x > W) break;
    }
  };
  row(12); row(H - 84);
  ring(c, 40, 100, W - 80, H - 200, { stroke: "#BDBDBD", sw: 3, dash: "10 8" });
  return c.done();
});

kidItem("kid-08", "Vector Bunting Flags", () => {
  const c = canvas("#FAFAFA");
  // bunting rope across the top margin
  c.path(`M 0 24 Q ${W / 2} 74 ${W} 24`, { fill: "none", stroke: "#424242", sw: 3 });
  const cols = ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#FF9F1C"];
  for (let i = 0; i < 13; i++) {
    const t = i / 12;
    const x = t * W;
    const y = 24 + (74 - 24) * (1 - Math.pow(2 * t - 1, 2)) - 24 + 24;
    const yy = 24 + Math.sin(t * Math.PI) * 50 - 24 + 24;
    c.poly([[x - 22, yy], [x + 22, yy], [x, yy + 44]], { fill: cols[i % 5] });
  }
  // bottom wavy trim
  let d = `M 0 ${H - 40}`;
  for (let x = 0; x < W; x += 80) d += ` q 20 -22 40 0 q 20 22 40 0`;
  c.path(d + ` L ${W} ${H} L 0 ${H} Z`, { fill: "#06D6A0", op: 0.85 });
  return c.done();
});

kidItem("kid-09", "Stylized Flat Ocean", () => {
  const c = canvas("#E0F7FA");
  // waves in bottom margin
  const wave = (y, col, op) => {
    let d = `M 0 ${y}`;
    for (let x = 0; x < W; x += 120) d += ` q 30 -20 60 0 q 30 20 60 0`;
    c.path(d + ` L ${W} ${H} L 0 ${H} Z`, { fill: col, op });
  };
  wave(H - M.bot - 30, "#4DD0E1", 0.75);
  wave(H - M.bot, "#26C6DA", 0.9);
  wave(H - 46, "#00ACC1", 1);
  // sun in top margin
  c.circle(90, 48, 30, { fill: "#FFD166" });
  c.path(`M ${W * 0.36} 62 q 40 -30 80 0 q 20 14 40 0`, { fill: "none", stroke: "#4FC3F7", sw: 3, op: 0.8 });
  ring(c, 40, 96, W - 80, H - 200, { stroke: "#4DD0E1", sw: 2 });
  return c.done();
});

kidItem("kid-10", "Vector Animal Tracks", () => {
  const c = canvas("#FFF8E1");
  c.rect(40, 40, W - 80, H - 80, { rx: 20, ry: 20, fill: "none", stroke: "#8D6E63", sw: 8 });
  c.rect(60, 60, W - 120, H - 120, { rx: 14, ry: 14, fill: "none", stroke: "#D7CCC8", sw: 2, dash: "12 8" });
  // paw prints in the margin ring
  const paw = (cx, cy, s, rot) => {
    const g = [[0, 0, 11], [-11, -12, 6], [0, -16, 6], [11, -12, 6]];
    for (const [dx, dy, r] of g) c.circle(cx + dx * s, cy + dy * s, r * s, { fill: "#8D6E63", op: 0.75 });
  };
  paw(120, 22, 1); paw(W - 160, 22, 1); paw(200, H - 22, 1); paw(W - 240, H - 22, 1);
  paw(22, H * 0.4, 1); paw(W - 22, H * 0.6, 1);
  return c.done();
});

// ============================================================ assemble
// Backgrounds whose overall field is dark: certificate text must be light on these.
// Verified against the measured band luminance audit (black-text contrast < 4.5).
const DARK_BG = new Set([
  "tech-01", "tech-05", "tech-06", "tech-08",
  "lux-01", "lux-03", "lux-04", "lux-06", "lux-08", "lux-10",
  "sport-09", "kid-06",
]);

const categories = [
  { name: "Corporate & Professional", orientation: "landscape", items: corp },
  { name: "Academic & Education", orientation: "landscape", items: acad },
  { name: "Tech & Hackathons", orientation: "landscape", items: tech },
  { name: "Creative & Arts", orientation: "landscape", items: creative = crea },
  { name: "Luxury & Prestige", orientation: "landscape", items: lux },
  { name: "Sports & Athletics", orientation: "landscape", items: sport },
  { name: "Medical & Healthcare", orientation: "landscape", items: med },
  { name: "Kids & Early Learning", orientation: "landscape", items: kid },
];

// sanity: verify counts + ids match the originals
const orig = JSON.parse(fs.readFileSync(path.join(__dirname, "backgrounds.json"), "utf8"));
let mismatches = 0;
for (const ocat of orig.categories) {
  const ncat = categories.find(x => x.name === ocat.name);
  if (!ncat) { console.error("MISSING CATEGORY", ocat.name); mismatches++; continue; }
  if (ncat.items.length !== ocat.items.length) {
    console.error("COUNT MISMATCH", ocat.name, ncat.items.length, "vs", ocat.items.length);
    mismatches++;
  }
  for (let i = 0; i < ocat.items.length; i++) {
    const o = ocat.items[i], nn = ncat.items[i];
    if (!nn || nn.id !== o.id) { console.error("ID MISMATCH", ocat.name, i, o.id, "→", nn && nn.id); mismatches++; }
    if (nn && nn.name !== o.name) console.error("  name drift", o.id, JSON.stringify(o.name), "→", JSON.stringify(nn.name));
  }
}
if (mismatches) { console.error("\nABORT: " + mismatches + " structural mismatches"); process.exit(1); }

const out = {
  categories: categories.map(c => ({
    name: c.name,
    orientation: c.orientation,
    items: c.items.map(it => ({
      id: it.id,
      name: it.name,
      textScheme: DARK_BG.has(it.id) ? "light" : "dark",
      url: toDataUri(svg(it.inner)),
    })),
  })),
};

fs.writeFileSync(path.join(__dirname, "redesigned-backgrounds.json"), JSON.stringify(out, null, 2));
const total = out.categories.reduce((a, c) => a + c.items.length, 0);
console.log("OK — wrote redesigned-backgrounds.json");
for (const c of out.categories) {
  const avg = Math.round(c.items.reduce((a, i) => a + i.url.length, 0) / c.items.length);
  const light = c.items.filter(i => i.textScheme === "light").length;
  console.log(
    `  ${c.name.padEnd(26)} ${String(c.items.length).padStart(2)} items   avg uri ${String(avg).padStart(4)}ch   light-text ${light}`
  );
}
console.log("  total:", total, "  (ids/names verified identical to originals)");
