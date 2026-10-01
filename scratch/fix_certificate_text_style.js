const fs = require('fs');
const file = 'src/components/CertificateView.tsx';
let content = fs.readFileSync(file, 'utf8');

const brokenTarget = `{el.showDivider !== false && (
                    <div style={{ width: "100%", borderTop: \`1px solid \${el.color || "#000000"}\`, flexShrink: 0, marginBottom: "8px", marginTop: "8px" }} />
                  )}
                  {el.showName !== false && (
                  <div style={{ whiteSpace: "nowrap", fontSize: \`\${el.nameFontSize || (el.fontSize ? el.fontSize * 0.4 : 24)}px\`, fontFamily: el.nameFontFamily || "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: el.nameFontWeight || "bold", letterSpacing: "1px" }}>
                    {el.text?.split('|')[0] || "Signatory Name"}
                  </div>
                  )}
                  {el.showTitle !== false && (
                  <div style={{ whiteSpace: "nowrap", fontSize: \`\${el.titleFontSize || (el.fontSize ? el.fontSize * 0.3 : 18)}px\`, fontFamily: el.titleFontFamily || "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: el.titleFontWeight || "normal", textTransform: "uppercase", letterSpacing: "3px", opacity: 0.8, marginTop: "2px" }}>
                    {el.text?.split('|')[1] || "Signatory Title"}
                  </div>
                  )}`;

const replaceWith = `width: el.width,
                  height: el.height,
                  fontSize: \`\${el.fontSize || 16}px\`,
                  fontFamily: el.fontFamily || "var(--font-sans, sans-serif)",
                  color: el.color || "#000000",`;

content = content.replace(brokenTarget, replaceWith);

fs.writeFileSync(file, content);
console.log("CertificateView.tsx text element fixed!");
