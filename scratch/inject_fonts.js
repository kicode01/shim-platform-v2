const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Inject the link tag inside the return block
if (!code.includes('{googleFontsUrl && <link href={googleFontsUrl} rel="stylesheet" />}')) {
  code = code.replace(
    /<div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 min-h-0 overflow-hidden">/,
    `<div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 min-h-0 overflow-hidden">\n      {googleFontsUrl && <link href={googleFontsUrl} rel="stylesheet" />}`
  );
}

// 2. Add GOOGLE_FONTS to the font selector
if (!code.includes('Object.entries(GOOGLE_FONTS).map')) {
  code = code.replace(
    /<option value="var\(--font-mono, monospace\)">System Monospace<\/option>\s*<\/select>/,
    `<option value="var(--font-mono, monospace)">System Monospace</option>
                              {Object.entries(GOOGLE_FONTS).map(([category, fonts]) => (
                                <optgroup key={category} label={category}>
                                  {fonts.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>`
  );
}

fs.writeFileSync(editorPath, code);
console.log("Fonts injected successfully");
