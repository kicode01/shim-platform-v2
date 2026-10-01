const fs = require('fs');
const file = 'src/components/CertificateView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The string to find
const badString = `            if (el.type === "qrCode") {
              return (
                <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height }}>
                  minWidth: "max-content",
                  {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width: "100%", height: "100%" }} />}
                </div>
    </>
  );
}
            if (el.type === "image" || el.type === "badge") {
              return (
                <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height }}>
                  minWidth: "max-content",`;

const goodString = `            if (el.type === "qrCode") {
              return (
                <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height }}>
                  {qrDataUrl && <img src={qrDataUrl} alt="QR" style={{ width: "100%", height: "100%" }} />}
                </div>
              );
            }
            if (el.type === "image" || el.type === "badge") {
              return (
                <div key={el.id} style={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height }}>`;

content = content.replace(badString, goodString);
fs.writeFileSync(file, content);
console.log("CertificateView.tsx fixed!");
