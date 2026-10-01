const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Add drag state and handlers
const stateInsertPoint = 'const moveLayerUp = () => {';
const newHandlers = `
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  const handleLayerDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLayerId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleLayerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleLayerDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLayerId || draggedLayerId === targetId) return;

    const elements = [...(design.canvasElements || [])];
    const draggedIdx = elements.findIndex(el => el.id === draggedLayerId);
    const targetIdx = elements.findIndex(el => el.id === targetId);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const [draggedEl] = elements.splice(draggedIdx, 1);
    elements.splice(targetIdx, 0, draggedEl);

    applyDesignUpdate({ ...design, canvasElements: elements });
    setDraggedLayerId(null);
  };

  const moveLayerUp = () => {`;

if (!code.includes('handleLayerDragStart')) {
  code = code.replace(stateInsertPoint, newHandlers);
}

// 2. Add draggable attributes to the layer item div
const oldDiv = `<div 
                                key={el.id}
                                className={\`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors \${isSelected ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'bg-transparent hover:bg-zinc-100 text-zinc-600 border border-transparent'}\`}
                                onClick={() => setSelectedElementId(el.id)}
                              >`;

const newDiv = `<div 
                                key={el.id}
                                draggable
                                onDragStart={(e) => handleLayerDragStart(e, el.id)}
                                onDragOver={handleLayerDragOver}
                                onDrop={(e) => handleLayerDrop(e, el.id)}
                                onDragEnd={() => setDraggedLayerId(null)}
                                className={\`flex items-center justify-between p-2 rounded-lg text-xs cursor-grab active:cursor-grabbing transition-colors \${isSelected ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'bg-transparent hover:bg-zinc-100 text-zinc-600 border border-transparent'} \${draggedLayerId === el.id ? 'opacity-40 border-dashed border-zinc-400' : ''}\`}
                                onClick={() => setSelectedElementId(el.id)}
                              >`;

if (code.includes(oldDiv)) {
  code = code.replace(oldDiv, newDiv);
} else {
  code = code.replace(oldDiv.replace(/\n/g, '\r\n'), newDiv.replace(/\n/g, '\r\n'));
}

// Ensure regex fallback just in case formatting is slightly off
if (!code.includes('onDragStart')) {
  const regexDiv = /<div \s*key=\{el\.id\}\s*className=\{\`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors \$\{isSelected \? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100\/50' : 'bg-transparent hover:bg-zinc-100 text-zinc-600 border border-transparent'\}\`\}\s*onClick=\{\(\) => setSelectedElementId\(el\.id\)\}\s*>/;
  code = code.replace(regexDiv, newDiv);
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Added drag-and-drop support to layers panel');
