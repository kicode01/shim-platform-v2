const fs = require('fs');
let lines = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8').split('\n');

const newCode = `            {el.src ? (
              <img src={el.src} alt="Signature" style={{ maxWidth: "100%", maxHeight: "50%", objectFit: "contain", marginBottom: "8px" }} />
            ) : (
              <div style={{ whiteSpace: "nowrap", fontFamily: el.fontFamily || "var(--font-script, cursive)", fontSize: \`\${(el.fontSize || 120) * 1.5}px\`, color: el.color || "#000000", marginBottom: "0px", fontStyle: "italic", lineHeight: 1 }}>
                {el.text?.split('|')[0] || "Signature"}
              </div>
            )}
            {el.showDivider !== false && (
              <div style={{ width: "100%", height: "4px", backgroundColor: el.color || "#000000", marginBottom: "8px", marginTop: "8px" }} />
            )}
            <div style={{ whiteSpace: "nowrap", fontSize: \`\${el.nameFontSize || (el.fontSize ? el.fontSize * 0.4 : 24)}px\`, fontFamily: el.nameFontFamily || "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: el.nameFontWeight || "bold", letterSpacing: "1px" }}>
              {el.text?.split('|')[0] || "Signatory Name"}
            </div>
            <div style={{ whiteSpace: "nowrap", fontSize: \`\${el.titleFontSize || (el.fontSize ? el.fontSize * 0.3 : 18)}px\`, fontFamily: el.titleFontFamily || "var(--font-sans, sans-serif)", color: el.color || "#000000", fontWeight: el.titleFontWeight || "normal", textTransform: "uppercase", letterSpacing: "3px", opacity: 0.8, marginTop: "2px" }}>
              {el.text?.split('|')[1] || "Signatory Title"}
            </div>`;

// Line numbers 2167 to 2177 (11 lines) in TemplateEditor.tsx
lines.splice(2166, 12, newCode);
fs.writeFileSync('src/components/TemplateEditor.tsx', lines.join('\n'));
