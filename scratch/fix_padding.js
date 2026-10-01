const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

code = code.replace(/transition=\{\{ duration: 0\.2 \}\}\s+className="space-y-6"/g, 'transition={{ duration: 0.2 }}\n                  className="space-y-6 p-6"');
code = code.replace(/transition=\{\{ duration: 0\.2 \}\}\s+className="space-y-6 p-6"/g, 'transition={{ duration: 0.2 }}\n                  className="space-y-6 p-6"');

// Fix builder tab
code = code.replace(/initial=\{\{ opacity: 0, y: 8 \}\}\s+animate=\{\{ opacity: 1, y: 0 \}\}\s+exit=\{\{ opacity: 0, y: -8 \}\}\s+transition=\{\{ duration: 0\.2 \}\}\s+className="space-y-6"/g, 'initial={{ opacity: 0, y: 8 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  exit={{ opacity: 0, y: -8 }}\n                  transition={{ duration: 0.2 }}\n                  className="space-y-6 p-6"');


fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed');
