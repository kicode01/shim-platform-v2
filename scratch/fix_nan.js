const fs = require('fs');

function fixNaN(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/Math\.round\(selectedElement\.x\)/g, "Math.round(selectedElement.x || 0)");
  content = content.replace(/Math\.round\(selectedElement\.y\)/g, "Math.round(selectedElement.y || 0)");
  content = content.replace(/Math\.round\(selectedElement\.width\)/g, "Math.round(selectedElement.width || 0)");
  
  // Also check if selectedElement.height is used (it might be `selectedElement.height || 0` already)
  content = content.replace(/Math\.round\(selectedElement\.height\)/g, "Math.round(selectedElement.height || 0)");
  
  fs.writeFileSync(filePath, content);
}

fixNaN('src/components/TemplateEditor.tsx');
