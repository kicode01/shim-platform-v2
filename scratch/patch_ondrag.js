const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

const tLines = [
  "      onDragStart={() => {",
  "        if (!isSelected) setSelectedElementId(el.id);",
  "      }}",
  "      onDragStop={(e, data) => {"
];
const target = tLines.join('\\n');

const rLines = [
  "      onDragStart={() => {",
  "        if (!isSelected) setSelectedElementId(el.id);",
  "      }}",
  "      onDrag={(e, data) => {",
  "        const currentOrientation = design.orientation || 'landscape';",
  "        const canvasWidth = currentOrientation === 'landscape' ? 1122 : 793;",
  "        const canvasHeight = currentOrientation === 'landscape' ? 793 : 1122;",
  "        const elW = data.node.offsetWidth;",
  "        const elH = data.node.offsetHeight;",
  "        const centerX = data.x + elW / 2;",
  "        const centerY = data.y + elH / 2;",
  "        let snapV = null;",
  "        let snapH = null;",
  "        if (Math.abs(centerX - canvasWidth/2) < 15) snapV = canvasWidth/2;",
  "        if (Math.abs(centerY - canvasHeight/2) < 15) snapH = canvasHeight/2;",
  "        setActiveGuides({ vertical: snapV, horizontal: snapH });",
  "      }}",
  "      onDragStop={(e, data) => {"
];
const replacement = rLines.join('\\n');

code = code.replace("onDragStop={(e, data) => {", rLines.slice(3).join('\\n'));
fs.writeFileSync(editorPath, code);
console.log("Success");
