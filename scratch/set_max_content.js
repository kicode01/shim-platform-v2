const fs = require('fs');

function setMaxContent(filePath, isEditor) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (isEditor && line.includes('minWidth="min-content"')) {
      lines[i] = line.replace('minWidth="min-content"', 'minWidth="max-content"');
    }
    if (isEditor && line.includes('minHeight="min-content"')) {
      lines[i] = line.replace('minHeight="min-content"', 'minHeight="max-content"');
    }
    
    // In CertificateView, add minWidth to the style object of the outer div
    if (!isEditor && line.includes('width: el.width,')) {
      lines.splice(i+1, 0, '                  minWidth: "max-content",');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

setMaxContent('src/components/TemplateEditor.tsx', true);
setMaxContent('src/components/CertificateView.tsx', false);
