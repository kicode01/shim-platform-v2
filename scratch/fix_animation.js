const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

code = code.replace(/initial=\{\{ opacity: 0, y: 8 \}\}\s+animate=\{\{ opacity: 1, y: 0 \}\}\s+exit=\{\{ opacity: 0, y: -8 \}\}\s+transition=\{\{ duration: 0\.35, ease: "easeInOut" \}\}/g, 'initial={{ opacity: 0, x: -10 }}\n                  animate={{ opacity: 1, x: 0 }}\n                  exit={{ opacity: 0, x: 10 }}\n                  transition={{ duration: 0.2 }}');

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed');
