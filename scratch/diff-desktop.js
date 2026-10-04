// Pixel-diff desktop before vs after to PROVE mobile changes didn't touch
// the >=1024px rendering. Uses sharp (already in node_modules).
const fs = require("fs");
const sharp = require("sharp");

const BEFORE = "scratch/dt-before";
const AFTER = "scratch/dt-after";
const OUT = "scratch/dt-diff";

const ROUTES = ["home", "login", "register", "validate", "dashboard", "dashboard_events", "dashboard_templates", "dashboard_credentials", "dashboard_audit", "dashboard_generate"];

async function rawOf(file) {
  const img = sharp(file).ensureAlpha().raw();
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  return { data, info };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let anyDiff = false;
  console.log("=== DESKTOP PIXEL DIFF (before -> after) ===");
  for (const r of ROUTES) {
    const a = BEFORE + "/" + r + ".png";
    const b = AFTER + "/" + r + ".png";
    if (!fs.existsSync(a) || !fs.existsSync(b)) { console.log("  " + r.padEnd(22) + " missing file"); continue; }
    const A = await rawOf(a);
    const B = await rawOf(b);
    if (A.info.width !== B.info.width || A.info.height !== B.info.height) {
      console.log("  " + r.padEnd(22) + " SIZE MISMATCH " + A.info.width + "x" + A.info.height + " vs " + B.info.width + "x" + B.info.height);
      continue;
    }
    const n = A.data.length;
    let diffPx = 0, sum = 0, max = 0;
    const diffBuf = Buffer.alloc(n);
    for (let i = 0; i < n; i += 4) {
      const dr = Math.abs(A.data[i] - B.data[i]);
      const dg = Math.abs(A.data[i + 1] - B.data[i + 1]);
      const db = Math.abs(A.data[i + 2] - B.data[i + 2]);
      const da = Math.abs(A.data[i + 3] - B.data[i + 3]);
      const d = (dr + dg + db + da);
      if (dr + dg + db > 12) { diffPx++; }
      sum += d;
      if (d > max) max = d;
      const dv = Math.min(255, d);
      diffBuf[i] = dv; diffBuf[i + 1] = dv; diffBuf[i + 2] = dv; diffBuf[i + 3] = 255;
    }
    const totalPx = n / 4;
    const pct = (100 * diffPx / totalPx).toFixed(3);
    const mean = (sum / totalPx).toFixed(2);
    const flag = diffPx > 0 ? "  <== DIFF" : "";
    console.log("  " + r.padEnd(22) + " diffPx=" + String(diffPx).padStart(7) + " (" + pct + "%)  mean=" + mean + " max=" + max + flag);
    if (diffPx > 0) {
      anyDiff = true;
      await sharp(diffBuf, { raw: { width: A.info.width, height: A.info.height, channels: 4 } })
        .png().toFile(OUT + "/" + r + "_diff.png");
    }
  }
  console.log("\n  " + (anyDiff ? "DESKTOP DIFFERS — review scratch/dt-diff/" : "DESKTOP IDENTICAL — mobile layer did not affect >=1024px"));
})().catch((e) => { console.error(e); process.exit(1); });
