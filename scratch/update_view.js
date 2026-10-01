const fs = require('fs');
let content = fs.readFileSync('src/components/CertificateView.tsx', 'utf8');

const oldSigBlock = `                  <div style={{ width: "100%", height: "4px", backgroundColor: el.color || "#000000", marginBottom: "10px", marginTop: "10px" }} />
                  <div style={{ whiteSpace: "nowrap", fontSize: \`\${(el.fontSize || 60) * 0.4}px\`, fontFamily: "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "4px" }}>
                    {el.text?.split('|')[1] || "Title"}
                  </div>`;

const newSigBlock = `                  {el.showDivider !== false && (
                    <div style={{ width: "100%", height: "4px", backgroundColor: el.color || "#000000", marginBottom: "8px", marginTop: "8px" }} />
                  )}
                  <div style={{ whiteSpace: "nowrap", fontSize: \`\${el.nameFontSize || (el.fontSize ? el.fontSize * 0.4 : 24)}px\`, fontFamily: el.nameFontFamily || "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: el.nameFontWeight || "bold", letterSpacing: "1px" }}>
                    {el.text?.split('|')[0] || "Signatory Name"}
                  </div>
                  <div style={{ whiteSpace: "nowrap", fontSize: \`\${el.titleFontSize || (el.fontSize ? el.fontSize * 0.3 : 18)}px\`, fontFamily: el.titleFontFamily || "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: el.titleFontWeight || "normal", textTransform: "uppercase", letterSpacing: "3px", opacity: 0.8, marginTop: "2px" }}>
                    {el.text?.split('|')[1] || "Signatory Title"}
                  </div>`;

const replaced = content.replace(oldSigBlock.replace(/\r\n/g, '\n'), newSigBlock).replace(oldSigBlock, newSigBlock);
fs.writeFileSync('src/components/CertificateView.tsx', replaced);
console.log('Replaced?', content !== replaced);
