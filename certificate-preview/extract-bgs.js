const fs = require("fs");
const root = "C:/Users/PC/Desktop/SPPQ PROJECT - Copy/";
let src = fs.readFileSync(root + "src/components/TemplateEditor.tsx", "utf8");

// Extract the PRESET_CATEGORIES array literal.
const start = src.indexOf("const PRESET_CATEGORIES = [");
// find matching bracket
let i = src.indexOf("[", start);
let depth = 0, end = -1;
for (let j = i; j < src.length; j++) {
  if (src[j] === "[") depth++;
  else if (src[j] === "]") { depth--; if (depth === 0) { end = j + 1; break; } }
}
const arrText = src.slice(i, end);

// The array is JSON-ish (double-quoted keys) -> eval safely in a sandbox.
let categories;
try {
  categories = eval("(" + arrText + ")");
} catch (e) {
  console.error("parse failed:", e.message);
  process.exit(1);
}

const out = { categories: categories.map(c => ({
  name: c.name,
  orientation: c.orientation,
  items: c.items.map(it => ({ id: it.id, name: it.name, url: it.url }))
})) };

fs.writeFileSync(root + "certificate-preview/backgrounds.json", JSON.stringify(out, null, 1));
console.log("categories:", out.categories.length);
out.categories.forEach(c => console.log(`  ${c.name} (${c.orientation}) — ${c.items.length} items`));
console.log("total:", out.categories.reduce((n, c) => n + c.items.length, 0));
