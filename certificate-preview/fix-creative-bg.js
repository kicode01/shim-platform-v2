// Rebuild the creative preset background so nothing decorative sits inside the
// text band. Original had:
//   - a 1052px "SHIIM" watermark centred at y=1550 (right across the event text)
//   - a 350x35 rose bar at x=263,y=1550 (also across the event text)
// Fix: keep the gradient + corner circles (they are in the margins), move the
// watermark behind the recipient block but OUTSIDE the event-name line, and move
// the accent bar up above the text band.
const fs = require("fs");

const svg =
  "<svg viewBox='0 0 3508 2480' xmlns='http://www.w3.org/2000/svg'>" +
  "<defs>" +
    "<linearGradient id='creativeGrad' x1='0%' y1='0%' x2='100%' y2='100%'>" +
      "<stop offset='0%' stop-color='#fff1f2' />" +
      "<stop offset='100%' stop-color='#ffe4e6' />" +
    "</linearGradient>" +
  "</defs>" +
  // full-bleed gradient
  "<rect width='3508' height='2480' fill='url(#creativeGrad)' />" +
  // corner motifs kept in the margins (top-left and bottom-right)
  "<circle cx='438' cy='442' r='657' fill='#f43f5e' opacity='0.1' />" +
  "<circle cx='3070' cy='1992' r='877' fill='#fb923c' opacity='0.1' />" +
  // watermark moved ABOVE the text band (y<=560): spans roughly y 260..560
  "<text x='1754' y='560' font-family='sans-serif' font-size='520' font-weight='900' fill='#fecdd3' opacity='0.35' text-anchor='middle'>SHIM</text>" +
  // accent bar moved above the text band, under the watermark
  "<rect x='263' y='600' width='350' height='26' fill='#f43f5e' />" +
  "</svg>";

const b64 = Buffer.from(svg, "utf8").toString("base64");
const out = "const creativeBg = `data:image/svg+xml;base64," + b64 + "`;";
fs.writeFileSync("C:/Users/PC/Desktop/SPPQ PROJECT - Copy/certificate-preview/creative-bg-new.txt", out, "utf8");
console.log("written. bytes b64 =", b64.length);
console.log(svg);
