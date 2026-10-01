const fs = require('fs');

function fixTextarea(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (line.includes('<textarea') && lines[i+2].includes('className="w-full h-full')) {
      lines[i+2] = lines[i+2].replace('h-full', '');
      // Add rows prop
      lines.splice(i+2, 0, '            rows={Math.max(1, (el.text || "").split("\\n").length)}');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

fixTextarea('src/components/TemplateEditor.tsx');
