const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

code = code.replace(
  /className=\{\`relative aspect-\[3\/4\] rounded-lg overflow-hidden border-2 transition-all/,
  "className={`relative ${design.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} rounded-lg overflow-hidden border-2 transition-all"
);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log("Fixed aspect ratio rendering!");
