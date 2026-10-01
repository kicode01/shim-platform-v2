const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// The target we want to replace
const targetStart = `<div 
              ref={containerRef}
              className="flex-1 min-h-0 relative flex items-center justify-center bg-gray-200 overflow-hidden" 
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
            >`;

const targetReplacementStart = `<div 
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
                <div className="absolute inset-0 z-50 pointer-events-auto" />
              )}`;

const targetCanvasDiv = `<div 
                className="w-[3508px] h-[2480px] shrink-0 relative bg-white shadow-md border border-zinc-200"
                style={{
                  transform: \`scale(\${scale * userZoom})\`,
                  transformOrigin: 'center center',`;

const targetCanvasReplacement = `<div 
                className="shrink-0 relative bg-white shadow-md border border-zinc-200"
                style={{
                  width: design.orientation === 'portrait' ? '2480px' : '3508px',
                  height: design.orientation === 'portrait' ? '3508px' : '2480px',
                  transform: \`translate(\${panOffset.x}px, \${panOffset.y}px) scale(\${scale * userZoom})\`,
                  transformOrigin: 'center center',`;

code = code.replace(targetStart, targetReplacementStart);
if (!code.includes(targetReplacementStart)) {
  console.log("Failed to replace container div");
}

code = code.replace(targetCanvasDiv, targetCanvasReplacement);
if (!code.includes(targetCanvasReplacement)) {
  console.log("Failed to replace canvas div");
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed container replacement');
