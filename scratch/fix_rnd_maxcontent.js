const fs = require('fs');

function fixRndMaxContent(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Remove the invalid props
    if (line.includes('minWidth="max-content"')) {
      lines[i] = '';
    }
    if (line.includes('minHeight="max-content"')) {
      lines[i] = '';
    }
    
    // Add to style instead
    if (line.includes('style={{')) {
      lines[i] = line.replace('style={{', 'style={{ minWidth: "max-content", ');
    }
  }
  
  fs.writeFileSync(filePath, lines.filter(Boolean).join('\n'));
}

fixRndMaxContent('src/components/TemplateEditor.tsx');
