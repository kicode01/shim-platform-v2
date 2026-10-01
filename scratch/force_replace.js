const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';
let lines = fs.readFileSync(editorPath, 'utf8').split('\\n');

const newCode = \`      onDragStart={() => {
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
      }}\`;

// Replace lines 1726 to 1743 (0-indexed) which corresponds to 1727 to 1744.
lines.splice(1726, 18, newCode);

fs.writeFileSync(editorPath, lines.join('\\n'));
console.log("Lines replaced!");
