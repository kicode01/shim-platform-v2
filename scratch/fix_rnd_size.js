const fs = require('fs');
let content = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');
content = content.replace(
  "size={{ width: el.width, height: el.height || 'auto' }}",
  "size={{ width: el.type === 'signature' || el.type === 'staticText' ? 'auto' : el.width, height: el.height || 'auto' }}"
);
fs.writeFileSync('src/components/TemplateEditor.tsx', content);
