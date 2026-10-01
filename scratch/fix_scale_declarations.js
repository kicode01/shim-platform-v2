const fs = require('fs');

const file = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

const buggyText = `        const scaleW = availableW / 3508;
        const scaleH = availableH / 2480;
        const isPortrait = design.orientation === 'portrait';
        const canvasW = isPortrait ? 2480 : 3508;
        const canvasH = isPortrait ? 3508 : 2480;
        const scaleW = availableW / canvasW;
        const scaleH = availableH / canvasH;`;

const fixedText = `        const isPortrait = design.orientation === 'portrait';
        const canvasW = isPortrait ? 2480 : 3508;
        const canvasH = isPortrait ? 3508 : 2480;
        const scaleW = availableW / canvasW;
        const scaleH = availableH / canvasH;`;

code = code.replace(buggyText, fixedText);
code = code.replace(buggyText.replace(/\n/g, '\r\n'), fixedText.replace(/\n/g, '\r\n'));

fs.writeFileSync(file, code);
console.log('Fixed duplicate declarations in TemplateEditor.tsx!');
