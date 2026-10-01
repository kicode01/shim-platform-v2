const fs = require('fs');

function updateFile(filePath, isEditor) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  let newLines = [];
  let inSigBlock = false;
  let skipCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (skipCount > 0) {
      skipCount--;
      continue;
    }
    
    if (line.includes('{el.src ? (')) {
      // Check if it's the signature block. Usually follows flex-col justify-end
      let prevLines = lines.slice(Math.max(0, i-2), i).join(' ');
      if (prevLines.includes('signature') || prevLines.includes('justify-end') || prevLines.includes('flex-end')) {
        inSigBlock = true;
      }
    }
    
    if (inSigBlock && line.includes('el.text?.split(\'|\')[0] || "Signature"')) {
      // Replace the cursive fallback logic
      newLines.pop(); // remove the previous line with `<div style={{ whiteSpace: "nowrap", ...`
      newLines.pop(); // remove the previous line with `) : (`
      
      newLines.push(`                  ) : el.signatureText ? (`.replace('                  ', line.substring(0, line.indexOf('{'))));
      
      let divLine = lines[i-1];
      newLines.push(divLine);
      newLines.push(line.replace('el.text?.split(\'|\')[0] || "Signature"', 'el.signatureText'));
      
      let nextLine = lines[i+1]; // should be `</div>`
      let nextNextLine = lines[i+2]; // should be `)}`
      newLines.push(nextLine);
      newLines.push(nextNextLine.replace(')}', ') : null}'));
      
      skipCount = 2; // skip the next 2 lines
      inSigBlock = false;
      continue;
    }
    
    if (line.includes('height: "4px"')) {
      newLines.push(line.replace('height: "4px", backgroundColor: el.color || "#000000"', 'borderTop: `1px solid ${el.color || "#000000"}`, flexShrink: 0'));
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'));
}

updateFile('src/components/CertificateView.tsx', false);
updateFile('src/components/TemplateEditor.tsx', true);

// Add signatureText to CanvasElement interface
let viewContent = fs.readFileSync('src/components/CertificateView.tsx', 'utf8');
if (!viewContent.includes('signatureText?: string;')) {
  viewContent = viewContent.replace('showDivider?: boolean;', 'showDivider?: boolean;\n  signatureText?: string;');
  fs.writeFileSync('src/components/CertificateView.tsx', viewContent);
}

