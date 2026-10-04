// Unit-test the REAL applyBackgroundTextScheme helper extracted from production
// src/components/TemplateEditor.tsx — no hand-copied logic.
const fs = require("fs");
const ts = require("typescript");

const SRC = "C:/Users/PC/Desktop/SPPQ PROJECT - Copy/src/components/TemplateEditor.tsx";
const src = fs.readFileSync(SRC, "utf8");

// The helper lives inside the component. Find it and take the whole arrow
// function by brace-matching so we test the exact shipped code.
const startMarker = "const applyBackgroundTextScheme = ";
const start = src.indexOf(startMarker);
if (start < 0) throw new Error("helper not found");
const bodyStart = src.indexOf("{", src.indexOf("=>", start));
let depth = 0, end = bodyStart;
for (let i = bodyStart; i < src.length; i++) {
  const ch = src[i];
  if (ch === "{") depth++;
  else if (ch === "}") { depth--; if (depth === 0) { end = i + 1; break; } }
}
const helperSrc = src.slice(start, end);

const js = ts.transpileModule(
  helperSrc.replace("const applyBackgroundTextScheme = ", "globalThis.__apply = "),
  { compilerOptions: { target: ts.ScriptTarget.ES2020 } }
).outputText;

new Function(js)();
const apply = globalThis.__apply;

const el = (color, extra = {}) => ({ id: "x", type: "staticText", color, ...extra });
const flips = (color, scheme) => apply([el(color)], scheme)[0].color !== color;

const darkFlip = ["#0f172a", "#1e293b", "#111111", "#000000", "#333333", "#2C2C2A",
  "#475569", "#5F5E5A", "#444441", "#1C1C1C", "#0D1117", "#050505"];
const lightFlip = ["#ffffff", "#f8fafc", "#f5f5f5", "#d3d1c7", "#e2e8f0"];
const keepBrand = ["#800000", "#d4af37", "#cc7722", "#e32636", "#06d6a0", "#FFD700",
  "#4B0082", "#600018", "#0A7B83", "#1A237E", "#2A0A4A", "#0C1445", "#000080", "#355E3B"];

let pass = 0, fail = 0;
const failures = [];
for (const c of darkFlip) if (flips(c, "light")) pass++; else { fail++; failures.push(`MISSED dark flip (light bg): ${c}`); }
for (const c of lightFlip) if (flips(c, "dark")) pass++; else { fail++; failures.push(`MISSED light flip (dark bg): ${c}`); }
for (const c of keepBrand) if (!flips(c, "light") && !flips(c, "dark")) pass++; else { fail++; failures.push(`WRONGLY FLIPPED (brand): ${c}`); }

console.log(`${pass}/${pass + fail} passed`);
failures.forEach(f => console.log("  " + f));

// diagnostics for the borderline case
for (const c of ["#355E3B", "#0f172a", "#475569", "#1e293b"]) {
  const h = c.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const chroma = max - min, sat = max === 0 ? 0 : chroma / max;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  console.log(`  ${c}: chroma=${chroma} sat=${sat.toFixed(3)} lum=${lum.toFixed(3)}`);
}
