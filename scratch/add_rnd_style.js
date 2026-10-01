const fs = require('fs');

function addMaxContentStyle(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Find Rnd style prop
    if (line.includes('style={{')) {
      if (lines[i-1] && lines[i-1].includes('onResizeStart')) {
        continue;
      }
      if (lines[i-2] && lines[i-2].includes('<Rnd')) {
         // this is Rnd style
         // Wait, Rnd doesn't currently have a style prop in TemplateEditor!
      }
    }
    
    if (line.includes('size={{ width: el.width || 200, height: el.height || \'auto\' }}')) {
      lines.splice(i+1, 0, '      style={{ minWidth: (el.type === "signature" || el.type === "staticText") ? "max-content" : undefined }}');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

addMaxContentStyle('src/components/TemplateEditor.tsx');
