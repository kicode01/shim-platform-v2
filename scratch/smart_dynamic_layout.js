const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const targetLogic = `    const scaleF = Math.min(newW / oldW, newH / oldH);
    const offsetX = (newW - (oldW * scaleF)) / 2;
    const offsetY = (newH - (oldH * scaleF)) / 2;

    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: (el.x * scaleF) + offsetX,
      y: (el.y * scaleF) + offsetY,
      width: el.width * scaleF,
      ...(el.height ? { height: el.height * scaleF } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleF } : {})
    }));`;

const replaceLogic = `    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    const scaleF = Math.min(scaleX, scaleY);

    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: el.x * scaleX,
      y: el.y * scaleY,
      width: el.width * scaleF,
      ...(el.height ? { height: el.height * scaleF } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleF } : {})
    }));`;

code = code.replace(targetLogic, replaceLogic);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Applied smart dynamic layout reflowing!');
