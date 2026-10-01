const fs = require('fs');

function fixLiteralNewlines(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace literal '\n' with actual newline
  content = content.replace(/\\n/g, '\n');
  
  fs.writeFileSync(filePath, content);
}

fixLiteralNewlines('src/components/TemplateEditor.tsx');
