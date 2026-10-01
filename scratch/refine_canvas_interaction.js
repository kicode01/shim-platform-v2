const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Update handleCanvasMouseDown
const oldMouseDown = `  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (isPanMode && hasOverflow) {
      isDraggingCanvas.current = true;`;

const newMouseDown = `  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.react-draggable')) {
      return; // allow elements to be dragged even in pan mode
    }
    
    if (isPanMode && hasOverflow) {
      isDraggingCanvas.current = true;`;

code = code.replace(oldMouseDown, newMouseDown);

// 2. Remove the z-[100] overlay
const oldOverlay = `{isPanMode && hasOverflow && (
                  <div className="absolute inset-0 z-[100] pointer-events-auto" />
                )}`;
if (code.includes(oldOverlay)) {
    code = code.replace(oldOverlay, '');
} else {
    code = code.replace(oldOverlay.replace(/\n/g, '\r\n'), '');
}

// 3. Remove shadow from Layers popup
code = code.replace('className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl', 'className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl');
code = code.replace('className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl \nw-[260px]', 'className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl \nw-[260px]');
code = code.replace('className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl \r\nw-[260px]', 'className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl \r\nw-[260px]');

// Actually, I can use a generic regex for the shadow-xl removal
code = code.replace(/className="mb-2 bg-white\/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl/g, 'className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl');

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed shadow and element dragging in pan mode');
