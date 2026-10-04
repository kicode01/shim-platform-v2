// Reproduce the elegant-gold eventName fit exactly using the real engine.
const ts = require("C:/Users/PC/Desktop/SPPQ PROJECT - Copy/node_modules/typescript");
const fs = require("fs");

let src = fs.readFileSync("C:/Users/PC/Desktop/SPPQ PROJECT - Copy/src/lib/fit-text.ts", "utf8");
src = src.replace('"use client";', "");
const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;

// Minimal DOM stub so the module can resolve fonts and measure.
global.document = {
  createElement: () => ({ getContext: () => ({ font: "", measureText: (t) => ({ width: t.length * 0.55 * curSize() }) }) }),
  body: { appendChild: () => {} },
};
let __size = 130;
function curSize() { return __size; }

const mod = { exports: {} };
new Function("module", "exports", "require", js)(mod, mod.exports, () => ({}));
const { fitFontSize } = mod.exports;

// measureText stub above approximates; instead just report the line-count logic
// for the real text at decreasing sizes using the SAME wrapping rule.
const TEXT = "Advanced Machine Learning Workshop 2026";
const BOX = 3100;

// Pure wrapper using the module's own measure via canvas stub is unreliable,
// so emulate: the engine's fits() only cares about line count > maxLines.
// With maxLines=1, ANY text whose first word fits must be shrunk until the
// whole string is ONE line. Print what the engine returns.
const out = fitFontSize(
  { text: TEXT, fontFamily: "var(--font-cinzel, serif)", fontWeight: "600", letterSpacing: 0, maxLines: 1, lineHeight: 1.2 },
  { width: BOX },
  130
);
console.log("elegant-gold eventName fitted size =", out, "(ceiling 130)");
console.log("=> single line?", out === 130 ? "NO shrink needed (already one line at 130)" : "shrunk to fit one line");
