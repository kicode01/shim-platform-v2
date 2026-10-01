const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const targetLogic = `    const scaleF = Math.min(scaleX, scaleY);

    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: el.x * scaleX,
      y: el.y * scaleY,
      width: el.width * scaleF,
      ...(el.height ? { height: el.height * scaleF } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleF } : {})
    }));`;

const replaceLogic = `    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: el.x * scaleX,
      y: el.y * scaleY,
      width: el.width * scaleX,
      ...(el.height ? { height: el.height * scaleX } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleX } : {})
    }));`;

code = code.replace(targetLogic, replaceLogic);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed continuous shrink bug!');
