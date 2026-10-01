const fs = require('fs');
const file = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

// The original lines were:
//         const scaleW = availableW / 3508;
//         const scaleH = availableH / 2480;

code = code.replace(/        const scaleW = availableW \/ 3508;\r?\n        const scaleH = availableH \/ 2480;\r?\n/g, '');

fs.writeFileSync(file, code);
console.log('Removed duplicate scale declarations.');
