const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Pass props
code = code.replace(
  /dummyQrCode=\{dummyQrCode\}\s*\/>/g,
  "dummyQrCode={dummyQrCode}\n                    setActiveGuides={setActiveGuides}\n                    currentOrientation={design.orientation || 'landscape'}\n                  />"
);

// 2. Update CanvasDraggableElement signature
code = code.replace(
  /function CanvasDraggableElement\(\{ el, isSelected, displayText, setSelectedElementId, updateSelectedElement, scale, dummyQrCode, isPanMode \}: any\) \{/,
  "function CanvasDraggableElement({ el, isSelected, displayText, setSelectedElementId, updateSelectedElement, scale, dummyQrCode, isPanMode, setActiveGuides, currentOrientation }: any) {"
);

// 3. Fix the onDrag and onDragStop string
const badDragStart = code.indexOf("onDragStart={() => {\n        if (!isSelected) setSelectedElementId(el.id);\n      }}");
const resizeStart = code.indexOf("onResizeStart={() => {");

if (badDragStart !== -1 && resizeStart !== -1) {
  const newDragCode = `onDragStart={() => {
        if (!isSelected) setSelectedElementId(el.id);
      }}
      onDrag={(e, data) => {
        const canvasWidth = currentOrientation === 'landscape' ? 1122 : 793;
        const canvasHeight = currentOrientation === 'landscape' ? 793 : 1122;
        const elW = data.node.offsetWidth;
        const elH = data.node.offsetHeight;
        const centerX = data.x + elW / 2;
        const centerY = data.y + elH / 2;
        let snapV = null;
        let snapH = null;
        if (Math.abs(centerX - canvasWidth/2) < 15) snapV = canvasWidth/2;
        if (Math.abs(centerY - canvasHeight/2) < 15) snapH = canvasHeight/2;
        if (setActiveGuides) setActiveGuides({ vertical: snapV, horizontal: snapH });
      }}
      onDragStop={(e, data) => {
        const canvasWidth = currentOrientation === 'landscape' ? 1122 : 793;
        const canvasHeight = currentOrientation === 'landscape' ? 793 : 1122;
        const elW = data.node.offsetWidth;
        const elH = data.node.offsetHeight;
        let finalX = data.x;
        let finalY = data.y;
        const centerX = data.x + elW / 2;
        const centerY = data.y + elH / 2;
        if (Math.abs(centerX - canvasWidth/2) < 15) finalX = canvasWidth/2 - elW/2;
        if (Math.abs(centerY - canvasHeight/2) < 15) finalY = canvasHeight/2 - elH/2;
        if (setActiveGuides) setActiveGuides({ vertical: null, horizontal: null });
        updateSelectedElement({ x: finalX, y: finalY });
      }}
      `;
  
  code = code.substring(0, badDragStart) + newDragCode + code.substring(resizeStart);
}

fs.writeFileSync(editorPath, code);
console.log("Fixed CanvasDraggableElement successfully");
