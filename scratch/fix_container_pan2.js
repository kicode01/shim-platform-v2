const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const regexContainer = /<div\s+ref=\{containerRef\}\s+className="flex-1 min-h-0 relative flex items-center justify-center bg-gray-200 overflow-hidden"\s+onClick=\{\(e\) => \{ if \(e\.target === e\.currentTarget\) setSelectedElementId\(null\); \}\}\s+>/;

const replacementContainer = `<div 
              ref={containerRef}
              className={\`flex-1 min-h-0 relative flex items-center justify-center bg-zinc-200/50 overflow-hidden \${isPanMode && hasOverflow ? 'cursor-grab active:cursor-grabbing' : ''}\`} 
              onClick={(e) => { if (e.target === e.currentTarget && !isPanMode) setSelectedElementId(null); }}
              onDoubleClick={(e) => {
                if (hasOverflow) {
                  setIsPanMode(!isPanMode);
                }
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {isPanMode && hasOverflow && (
                <div className="absolute inset-0 z-[100] pointer-events-auto" />
              )}`;

const regexCanvas = /<div\s+className="w-\[3508px\] h-\[2480px\] shrink-0 relative bg-white shadow-md border border-zinc-200"\s+style=\{\{\s+transform: `scale\(\$\{scale \* userZoom\}\)`,\s+transformOrigin: 'center center',/;

const replacementCanvas = `<div 
                className="shrink-0 relative bg-white shadow-md border border-zinc-200"
                style={{
                  width: design.orientation === 'portrait' ? '2480px' : '3508px',
                  height: design.orientation === 'portrait' ? '3508px' : '2480px',
                  transform: \`translate(\${panOffset.x}px, \${panOffset.y}px) scale(\${scale * userZoom})\`,
                  transformOrigin: 'center center',`;


if (regexContainer.test(code)) {
    code = code.replace(regexContainer, replacementContainer);
    console.log("Replaced container");
} else {
    console.log("Failed to match container regex");
}

if (regexCanvas.test(code)) {
    code = code.replace(regexCanvas, replacementCanvas);
    console.log("Replaced canvas");
} else {
    console.log("Failed to match canvas regex");
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed container pan script 2');
