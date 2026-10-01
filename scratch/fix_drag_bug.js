const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';

if (fs.existsSync(editorPath)) {
  let content = fs.readFileSync(editorPath, 'utf8');
  
  // Fix the drag bug: replace minWidth="max-content" with style
  if (content.includes('minWidth="max-content"')) {
    content = content.replace(/minWidth="max-content"/g, 'style={{ minWidth: (el.type === "signature" || el.type === "staticText") ? "max-content" : undefined }}');
    fs.writeFileSync(editorPath, content);
    console.log("Fixed dragging bug!");
  } else {
    console.log("minWidth='max-content' not found");
  }
}
