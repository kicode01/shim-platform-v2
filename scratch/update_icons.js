const fs = require('fs');
const file = 'src/components/TemplateEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. In Components Grid (Add Design Elements)
// Signature
content = content.replace(
  /onClick=\{\(\) => addElement\("signature", "Signatory Name\|Title Here"\)\} className="flex([\s\S]*?)<Type size=\{24\} \/>/,
  'onClick={() => addElement("signature", "Signatory Name|Title Here")} className="flex$1<Stamp size={24} />'
);

// Badge
content = content.replace(
  /onClick=\{\(\) => addElement\("badge"\)\} className="flex([\s\S]*?)<Stamp size=\{24\} \/>/,
  'onClick={() => addElement("badge")} className="flex$1<ShieldCheck size={24} />'
);

// Divider (shape)
content = content.replace(
  /onClick=\{\(\) => addElement\("shape"\)\} className="flex([\s\S]*?)<Move size=\{24\} \/>/,
  'onClick={() => addElement("shape")} className="flex$1<Minus size={24} />'
);

// 2. In Settings Header
content = content.replace(
  /selectedElement\.type === "signature"\s*\?\s*<Stamp size=\{18\}\s*\/>\s*:\s*selectedElement\.type === "shape"/,
  'selectedElement.type === "signature" ? <Stamp size={18} /> : selectedElement.type === "badge" ? <ShieldCheck size={18} /> : selectedElement.type === "shape"'
);

fs.writeFileSync(file, content);
console.log('Icons updated successfully!');
