const ts = require("C:/Users/PC/Desktop/SPPQ PROJECT - Copy/node_modules/typescript");
const fs = require("fs");
const root = "C:/Users/PC/Desktop/SPPQ PROJECT - Copy/";

let src = fs.readFileSync(root + "src/lib/presets.ts", "utf8");
src = src.replace(
  'import { v4 as uuidv4 } from "uuid";',
  'globalThis.__uid=globalThis.__uid||0;const uuidv4=()=>"el_"+(++globalThis.__uid);'
);
src = src.replace(
  'import { CertificateDesignConfig, CanvasElement } from "@/components/CertificateView";',
  ""
);
src = src.replace("export const PRESETS", "const PRESETS");

let out = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020 },
}).outputText;

// Strip CommonJS shim lines that would throw in the browser.
out = out
  .split("\n")
  .filter((l) => {
    if (l.includes("Object.defineProperty(exports")) return false;
    if (l.trim() === '"use strict";') return false;
    if (l.startsWith("exports.")) return false;
    return true;
  })
  .join("\n");

out += '\nif(typeof window!=="undefined") window.REAL_PRESETS=PRESETS;\n';
out += 'if(typeof module!=="undefined") module.exports={PRESETS};\n';

fs.writeFileSync(root + "certificate-preview/presets-real.js", out);
console.log("regenerated OK");

// --- fit-text.ts -> fit-text.js (browser-safe, no CommonJS shim) ---
let fit = fs.readFileSync(root + "src/lib/fit-text.ts", "utf8");
fit = fit.replace('"use client";', "");
let fitOut = ts.transpileModule(fit, {
  compilerOptions: { module: ts.ModuleKind.None, target: ts.ScriptTarget.ES2020 },
}).outputText;
fitOut = fitOut
  .split("\n")
  .filter((l) => {
    if (l.includes("Object.defineProperty(exports")) return false;
    if (l.trim() === '"use strict";') return false;
    if (l.startsWith("exports.")) return false;
    return true;
  })
  .join("\n");
fitOut +=
  '\nif(typeof window!=="undefined"){window.fitFontSize=fitFontSize;window.resolveFontFamily=resolveFontFamily;}\n';
fs.writeFileSync(root + "certificate-preview/fit-text.js", fitOut);
console.log("fit-text exported OK");
