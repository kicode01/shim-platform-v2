const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// We'll insert handleOrientationChange right before handleUndo
const insertTarget = `  const handleUndo = () => {`;
const insertLogic = `  const handleOrientationChange = (newOrientation: "landscape" | "portrait") => {
    const currentOrientation = design.orientation || "landscape";
    if (currentOrientation === newOrientation) return;

    const oldIsPortrait = currentOrientation === 'portrait';
    const newIsPortrait = newOrientation === 'portrait';
    const oldW = oldIsPortrait ? 2480 : 3508;
    const oldH = oldIsPortrait ? 3508 : 2480;
    const newW = newIsPortrait ? 2480 : 3508;
    const newH = newIsPortrait ? 3508 : 2480;

    const scaleF = Math.min(newW / oldW, newH / oldH);
    const offsetX = (newW - (oldW * scaleF)) / 2;
    const offsetY = (newH - (oldH * scaleF)) / 2;

    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: (el.x * scaleF) + offsetX,
      y: (el.y * scaleF) + offsetY,
      width: el.width * scaleF,
      ...(el.height ? { height: el.height * scaleF } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleF } : {})
    }));

    applyDesignUpdate({ ...design, orientation: newOrientation, canvasElements: newElements });
  };

  const handleUndo = () => {`;

code = code.replace(insertTarget, insertLogic);

const toggleTarget = `            {/* Orientation Toggle */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg mr-4">
              <button 
                onClick={() => applyDesignUpdate({ ...design, orientation: "landscape" })}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all \${design.orientation !== 'portrait' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}\`}
              >
                <div className="w-3 h-2 border-2 border-current rounded-[2px]" />
                Landscape
              </button>
              <button 
                onClick={() => applyDesignUpdate({ ...design, orientation: "portrait" })}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all \${design.orientation === 'portrait' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}\`}
              >
                <div className="w-2 h-3 border-2 border-current rounded-[2px]" />
                Portrait
              </button>
            </div>`;

const toggleReplace = `            {/* Orientation Toggle */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg mr-4">
              <button 
                onClick={() => handleOrientationChange("landscape")}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all \${design.orientation !== 'portrait' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}\`}
              >
                <div className="w-3 h-2 border-2 border-current rounded-[2px]" />
                Landscape
              </button>
              <button 
                onClick={() => handleOrientationChange("portrait")}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all \${design.orientation === 'portrait' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}\`}
              >
                <div className="w-2 h-3 border-2 border-current rounded-[2px]" />
                Portrait
              </button>
            </div>`;

code = code.replace(toggleTarget, toggleReplace).replace(toggleTarget.replace(/\n/g, '\r\n'), toggleReplace.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed orientation toggle mapping');
