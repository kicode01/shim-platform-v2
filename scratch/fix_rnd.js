const fs = require('fs');

function fixRndBox(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  let newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Fix inner div h-full
    if (line.includes('<div onDoubleClick={handleDoubleClick} className="w-full h-full flex flex-col justify-center pointer-events-auto">')) {
      newLines.push(line.replace('h-full ', ''));
      continue;
    }
    
    if (line.includes('<div className="w-full h-full pointer-events-none flex flex-col items-center justify-end">')) {
      newLines.push(line.replace('h-full ', ''));
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'));
}

fixRndBox('src/components/TemplateEditor.tsx');
