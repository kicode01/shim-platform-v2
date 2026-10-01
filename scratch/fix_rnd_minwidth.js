const fs = require('fs');
let content = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// Revert the size hack
content = content.replace(
  "size={{ width: el.type === 'signature' || el.type === 'staticText' ? 'auto' : el.width, height: el.height || 'auto' }}",
  "size={{ width: el.width, height: el.height || 'auto' }}"
);

// Add minWidth to Rnd
content = content.replace(
  "position={{ x: el.x, y: el.y }}",
  "position={{ x: el.x, y: el.y }}\n      minWidth=\"min-content\"\n      minHeight=\"min-content\""
);

fs.writeFileSync('src/components/TemplateEditor.tsx', content);
