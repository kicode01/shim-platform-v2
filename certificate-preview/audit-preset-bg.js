const fs = require("fs");
const src = fs.readFileSync("C:/Users/PC/Desktop/SPPQ PROJECT - Copy/src/lib/presets.ts", "utf8");

const names = ["brutalist", "academic", "minimalist", "corporate", "creative", "elegantGold", "cyber", "eco"];
const bandTop = 600, bandBot = 2000; // text band in the 3508x2480 canvas

for (const n of names) {
  const m = src.match(new RegExp("const " + n + "Bg = `data:image/svg\\+xml;base64,([A-Za-z0-9+/=]+)`"));
  if (!m) { console.log("===", n, "NOT FOUND"); continue; }
  const svg = Buffer.from(m[1], "base64").toString("utf8");

  const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((x) => x[1]);
  const textAttrs = [...svg.matchAll(/<text[^>]*>/g)].map((x) => x[0]);

  const ints = [...svg.matchAll(/<rect[^>]*\/>/g)]
    .map((r) => {
      const s = r[0];
      const g = (k) => { const mm = s.match(new RegExp(k + "='([\\d.]+)'")); return mm ? +mm[1] : null; };
      return { x: g("x"), y: g("y"), w: g("width"), h: g("height") };
    })
    .filter((r) => r.x !== null && r.y !== null && r.w !== null && r.h !== null)
    .filter((r) => r.y + r.h > bandTop && r.y < bandBot && r.w < 3400 && r.x > 0);

  console.log("===", n);
  console.log("   texts:", JSON.stringify(texts));
  textAttrs.forEach((t) => {
    const g = (k) => { const mm = t.match(new RegExp(k + "='([^']*)'")); return mm ? mm[1] : null; };
    const y = g("y") ? +g("y") : null;
    if (y !== null && y > bandTop && y < bandBot) {
      console.log("   >> TEXT IN BAND:", g("font-size") + "px", JSON.stringify(g("fill")), "y=" + y, "op=" + g("opacity"));
    }
  });
  ints.forEach((r) => console.log("   >> rect in band: x=" + r.x, "y=" + r.y, "w=" + r.w, "h=" + r.h));
}
