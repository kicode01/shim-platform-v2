const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const layerFunctions = `
  const moveLayerUp = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx < 0 || idx === (design.canvasElements || []).length - 1) return;
    const newElements = [...(design.canvasElements || [])];
    const temp = newElements[idx];
    newElements[idx] = newElements[idx + 1];
    newElements[idx + 1] = temp;
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

  const moveLayerDown = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx <= 0) return;
    const newElements = [...(design.canvasElements || [])];
    const temp = newElements[idx];
    newElements[idx] = newElements[idx - 1];
    newElements[idx - 1] = temp;
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

  const moveLayerToFront = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx < 0 || idx === (design.canvasElements || []).length - 1) return;
    const newElements = [...(design.canvasElements || [])];
    const el = newElements.splice(idx, 1)[0];
    newElements.push(el);
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };

  const moveLayerToBack = () => {
    if (!selectedElementId) return;
    const idx = (design.canvasElements || []).findIndex(e => e.id === selectedElementId);
    if (idx <= 0) return;
    const newElements = [...(design.canvasElements || [])];
    const el = newElements.splice(idx, 1)[0];
    newElements.unshift(el);
    applyDesignUpdate({ ...design, canvasElements: newElements });
  };
`;

if (!code.includes('moveLayerUp')) {
  code = code.replace('  const applyDesignUpdate', layerFunctions + '\n  const applyDesignUpdate');
}

const layerButtons = `
                  <div className="space-y-3">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Layer Controls</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={moveLayerUp} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Move size={16} />
                        <span className="text-xs font-medium">Bring Forward</span>
                      </button>
                      <button onClick={moveLayerDown} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Move size={16} className="rotate-180" />
                        <span className="text-xs font-medium">Send Backward</span>
                      </button>
                      <button onClick={moveLayerToFront} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white col-span-1">
                        <Layers size={16} />
                        <span className="text-xs font-medium text-center leading-tight">Bring to Front</span>
                      </button>
                      <button onClick={moveLayerToBack} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white col-span-1">
                        <Layers size={16} className="opacity-50" />
                        <span className="text-xs font-medium text-center leading-tight">Send to Back</span>
                      </button>
                    </div>
                  </div>
`;

if (!code.includes('moveLayerToFront')) {
  // Find where the delete button is and insert layerButtons before it
  // Wait, let's just insert it after the "Actions" section or "Trash" button.
  code = code.replace(
    '<button onClick={deleteSelected} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 transition-all font-medium text-sm">',
    layerButtons + '\n\n                  <button onClick={deleteSelected} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 transition-all font-medium text-sm">'
  );
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully injected Layer logic and buttons!');
