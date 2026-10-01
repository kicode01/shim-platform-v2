const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Fix CanvasDraggableElement key
const mapStart = `<CanvasDraggableElement \n                  key={el.id} `;
const mapTargetRegex = /<CanvasDraggableElement\s+key=\{el\.id\}/;
code = code.replace(mapTargetRegex, `<CanvasDraggableElement \n                  key={el.id + '-' + (design.orientation || 'landscape')}`);

// 2. Fix loadPreset to include orientation
const loadPresetTarget = `    const updated = { 
      ...design, 
      canvasElements: freshElements, 
      backgroundImageUrl: preset.design.backgroundImageUrl 
    };`;
const loadPresetReplace = `    const updated = { 
      ...design, 
      canvasElements: freshElements, 
      backgroundImageUrl: preset.design.backgroundImageUrl,
      orientation: preset.design.orientation || "landscape"
    };`;
code = code.replace(loadPresetTarget, loadPresetReplace);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed react-rnd remounting and loadPreset orientation');
