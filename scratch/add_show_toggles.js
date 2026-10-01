const fs = require('fs');

function addShowToggles(filePath) {
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
    
    // Add properties to CanvasElement interface
    if (line.includes('signatureText?: string;')) {
      newLines.push(line);
      if (!content.includes('showName?: boolean;')) {
        newLines.push('  showName?: boolean;');
        newLines.push('  showTitle?: boolean;');
      }
      continue;
    }
    
    // In CertificateView.tsx and TemplateEditor.tsx rendering block
    if (line.includes('el.text?.split(\'|\')[0] || "Signatory Name"')) {
      // Find the wrapping div for name
      let divLine = newLines.pop(); // this is the <div style={{ ... nameFont ... }}>
      newLines.push(`                  {el.showName !== false && (`.replace('                  ', divLine.substring(0, divLine.indexOf('<'))));
      newLines.push(divLine);
      newLines.push(line);
      let closeDiv = lines[i+1];
      newLines.push(closeDiv);
      newLines.push(`                  )}`.replace('                  ', divLine.substring(0, divLine.indexOf('<'))));
      skipCount = 1;
      continue;
    }
    
    if (line.includes('el.text?.split(\'|\')[1] || "Signatory Title"')) {
      let divLine = newLines.pop();
      newLines.push(`                  {el.showTitle !== false && (`.replace('                  ', divLine.substring(0, divLine.indexOf('<'))));
      newLines.push(divLine);
      newLines.push(line);
      let closeDiv = lines[i+1];
      newLines.push(closeDiv);
      newLines.push(`                  )}`.replace('                  ', divLine.substring(0, divLine.indexOf('<'))));
      skipCount = 1;
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync(filePath, newLines.join('\n'));
}

addShowToggles('src/components/CertificateView.tsx');
addShowToggles('src/components/TemplateEditor.tsx');

// Now update TemplateEditor.tsx properties panel
let editorContent = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// Insert checkboxes above Name Font and Title Font
const nameFontLabel = '<label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Name Font</label>';
const nameCheckbox = `
                                <div className="flex items-center gap-2 mb-2">
                                  <input type="checkbox" checked={selectedElement.showName !== false} onChange={(e) => updateSelectedElement({ showName: e.target.checked })} className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" />
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Show Name</span>
                                </div>
`;

const titleFontLabel = '<label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Title Font</label>';
const titleCheckbox = `
                                <div className="flex items-center gap-2 mb-2">
                                  <input type="checkbox" checked={selectedElement.showTitle !== false} onChange={(e) => updateSelectedElement({ showTitle: e.target.checked })} className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" />
                                  <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Show Title</span>
                                </div>
`;

if (!editorContent.includes('Show Name</span>')) {
  editorContent = editorContent.replace(nameFontLabel, nameCheckbox + '                                ' + nameFontLabel);
  editorContent = editorContent.replace(titleFontLabel, titleCheckbox + '                                ' + titleFontLabel);
  fs.writeFileSync('src/components/TemplateEditor.tsx', editorContent);
}

console.log("Done");
