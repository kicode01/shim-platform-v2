const fs = require('fs');

function revertWhitespace(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('whiteSpace: "normal", wordBreak: "break-word"')) {
      lines[i] = line.replace('whiteSpace: "normal", wordBreak: "break-word"', 'whiteSpace: "nowrap"');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

revertWhitespace('src/components/TemplateEditor.tsx');
revertWhitespace('src/components/CertificateView.tsx');
