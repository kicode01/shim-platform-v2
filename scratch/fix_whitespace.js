const fs = require('fs');

function fixWhitespace(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Replace nowrap with normal and add break-word for signature elements
    if (line.includes('whiteSpace: "nowrap"')) {
      lines[i] = line.replace('whiteSpace: "nowrap"', 'whiteSpace: "normal", wordBreak: "break-word"');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

fixWhitespace('src/components/TemplateEditor.tsx');
fixWhitespace('src/components/CertificateView.tsx');
