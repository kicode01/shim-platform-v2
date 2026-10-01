const fs = require('fs');

function disableVerticalResizing(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (line.includes('enableResizing={isSelected && !isEditing}')) {
      lines[i] = `      enableResizing={isSelected && !isEditing ? {
        bottomRight: true,
        bottomLeft: true,
        topRight: true,
        topLeft: true,
        left: true,
        right: true,
        top: el.type !== 'text' && el.type !== 'signature',
        bottom: el.type !== 'text' && el.type !== 'signature'
      } : false}`;
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

disableVerticalResizing('src/components/TemplateEditor.tsx');
