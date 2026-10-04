/*
 * apply-redesign.js — swap the `url` values inside PRESET_CATEGORIES (TemplateEditor.tsx)
 * with the redesigned data-URIs, preserving file structure/formatting.
 *
 * Strategy: locate the PRESET_CATEGORIES array by bracket matching, parse it with eval
 * (it is valid JS), merge in the redesign keyed by item id, then re-serialize the whole
 * array as pretty JSON (matching the existing 2-space, double-quoted style) and splice
 * it back. Ids/names/orientation/order are asserted unchanged.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TSX = path.join(ROOT, "src", "components", "TemplateEditor.tsx");
const NEW = JSON.parse(fs.readFileSync(path.join(__dirname, "redesigned-backgrounds.json"), "utf8"));

const src = fs.readFileSync(TSX, "utf8");

// ---- locate `const PRESET_CATEGORIES = [` and its matching `]`
const startMarker = "const PRESET_CATEGORIES = [";
const start = src.indexOf(startMarker);
if (start < 0) throw new Error("PRESET_CATEGORIES not found");
const arrStart = start + startMarker.length - 1; // index of '['

let depth = 0, i = arrStart, inStr = null, end = -1;
for (; i < src.length; i++) {
  const ch = src[i], prev = src[i - 1];
  if (inStr) {
    if (ch === inStr && prev !== "\\") inStr = null;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
  if (ch === "[") depth++;
  else if (ch === "]") { depth--; if (depth === 0) { end = i; break; } }
}
if (end < 0) throw new Error("could not find end of PRESET_CATEGORIES");

const literal = src.slice(arrStart, end + 1);

// preserve the file's existing line ending style
const EOL = src.includes("\r\n") ? "\r\n" : "\n";

// ---- parse existing literal (valid JS array of object literals)
// eslint-disable-next-line no-eval
const existing = eval("(" + literal + ")");

// ---- build id -> redesign map
const byId = new Map();
for (const cat of NEW.categories) for (const it of cat.items) byId.set(it.id, it);

// ---- merge + assert
let swapped = 0, added = 0;
const merged = existing.map((cat) => {
  const ncat = NEW.categories.find((c) => c.name === cat.name);
  if (!ncat) throw new Error("category missing in redesign: " + cat.name);
  if (cat.orientation !== ncat.orientation) throw new Error("orientation drift: " + cat.name);
  if (cat.items.length !== ncat.items.length) throw new Error("count drift: " + cat.name);
  return {
    name: cat.name,
    orientation: cat.orientation,
    items: cat.items.map((item, k) => {
      const r = ncat.items[k];
      if (!r) throw new Error("item missing: " + cat.name + "#" + k);
      if (r.id !== item.id) throw new Error(`order drift: ${item.id} -> ${r.id}`);
      if (r.name !== item.name) throw new Error(`name drift: ${item.id}: "${item.name}" -> "${r.name}"`);
      swapped++;
      const out = { id: item.id, name: item.name, url: r.url };
      // only emit textScheme when it differs from the historical default (dark text)
      if (r.textScheme === "light") { out.textScheme = "light"; added++; }
      return out;
    }),
  };
});

// ---- serialize in the file's existing style: 2-space indent, double quotes, one object per item
function serialize(categories) {
  const lines = ["["];
  categories.forEach((cat, ci) => {
    lines.push("  {");
    lines.push(`    "name": ${JSON.stringify(cat.name)},`);
    lines.push(`    "orientation": ${JSON.stringify(cat.orientation)},`);
    lines.push(`    "items": [`);
    cat.items.forEach((it, ii) => {
      lines.push("      {");
      lines.push(`        "id": ${JSON.stringify(it.id)},`);
      lines.push(`        "name": ${JSON.stringify(it.name)},`);
      if (it.textScheme) lines.push(`        "textScheme": ${JSON.stringify(it.textScheme)},`);
      lines.push(`        "url": ${JSON.stringify(it.url)}`);
      lines.push("      }" + (ii < cat.items.length - 1 ? "," : ""));
    });
    lines.push(`    ]`);
    lines.push("  }" + (ci < categories.length - 1 ? "," : ""));
  });
  lines.push("]");
  return lines.join(EOL);
}

const replacement = serialize(merged);
const outSrc = src.slice(0, arrStart) + replacement + src.slice(end + 1);

fs.writeFileSync(TSX, outSrc, "utf8");

console.log("swapped urls:", swapped);
console.log("items marked textScheme=light:", added);
console.log("categories:", merged.length);
console.log("wrote", path.relative(ROOT, TSX));
