const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

code = code.replace(/transition=\{\{ duration: 0\.35, ease: "easeInOut" \}\}\s+className="space-y-6"/g, 'transition={{ duration: 0.35, ease: "easeInOut" }}\n                  className="space-y-6 p-6"');

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed');
