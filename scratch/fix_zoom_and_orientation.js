const fs = require('fs');

const file = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. userZoom state
if (!code.includes('const [userZoom')) {
  code = code.replace(
    'const [scale, setScale] = useState(1);',
    'const [scale, setScale] = useState(1);\n  const [userZoom, setUserZoom] = useState(1);'
  );
}

// 2. handleOrientationChange
if (!code.includes('handleOrientationChange')) {
  code = code.replace(
    '  const handleUndo = () => {',
    `  const handleOrientationChange = (newOrientation: "landscape" | "portrait") => {
    const currentOrientation = design.orientation || "landscape";
    if (currentOrientation === newOrientation) return;

    const oldIsPortrait = currentOrientation === 'portrait';
    const newIsPortrait = newOrientation === 'portrait';
    const oldW = oldIsPortrait ? 2480 : 3508;
    const oldH = oldIsPortrait ? 3508 : 2480;
    const newW = newIsPortrait ? 2480 : 3508;
    const newH = newIsPortrait ? 3508 : 2480;

    const scaleX = newW / oldW;
    const scaleY = newH / oldH;
    const scaleF = Math.min(scaleX, scaleY);

    const newElements = (design.canvasElements || []).map(el => ({
      ...el,
      x: el.x * scaleX,
      y: el.y * scaleY,
      width: el.width * scaleX,
      ...(el.height ? { height: el.height * scaleF } : {}),
      ...(el.fontSize ? { fontSize: el.fontSize * scaleX } : {})
    }));

    applyDesignUpdate({ ...design, orientation: newOrientation, canvasElements: newElements });
  };

  const handleUndo = () => {`
  );
}

// 3. UI toggle buttons
if (!code.includes('Landscape</button>')) {
  code = code.replace(
    '{showResetConfirm ? (',
    `{/* Orientation Toggle */}
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
            </div>

            {showResetConfirm ? (`
  );
}

// 4. Default design orientation
if (!code.includes('orientation: "landscape"')) {
  code = code.replace(
    '  const defaultDesign: CertificateDesignConfig = {\n    canvasElements: []\n  };',
    '  const defaultDesign: CertificateDesignConfig = {\n    canvasElements: [],\n    orientation: "landscape"\n  };'
  );
}

// 5. Canvas wrapper and scale
if (!code.includes('scale * userZoom')) {
  code = code.replace(
    'setScale(Math.min(scaleW, scaleH));',
    `const isPortrait = design.orientation === 'portrait';
        const canvasW = isPortrait ? 2480 : 3508;
        const canvasH = isPortrait ? 3508 : 2480;
        const scaleW = availableW / canvasW;
        const scaleH = availableH / canvasH;
        setScale(Math.min(scaleW, scaleH));`
  );

  code = code.replace(
    '}, []);',
    '}, [design.orientation]);'
  );

  code = code.replace(
    /<div \n\s*ref=\{containerRef\}\n\s*className="flex-1 w-full overflow-hidden flex items-start justify-center pt-\[60px\] pb-\[60px\]"\n\s*>/g,
    `<div 
          ref={containerRef}
          className="absolute left-0 top-0 bottom-0 z-10 flex items-start justify-center pt-24 pb-12 overflow-auto transition-all duration-300" style={{ right: (isLayersOpen && userZoom === 1) ? "300px" : "0px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}
        >`
  );

  code = code.replace(
    /<div \n\s*className="relative bg-white shadow-2xl transition-transform duration-200"\n\s*style=\{\{\n\s*width: 3508,\n\s*height: 2480,\n\s*transform: \`scale\(\$\{scale\}\)\`,\n\s*transformOrigin: "top center",/g,
    `<div 
            className="shrink-0 relative transition-all duration-300"
            style={{ 
              width: (design.orientation === 'portrait' ? 2480 : 3508) * (scale * userZoom), 
              height: (design.orientation === 'portrait' ? 3508 : 2480) * (scale * userZoom) 
            }}
          >
            <div 
              className={\`absolute left-0 top-0 origin-top-left bg-white shadow-xl transition-shadow \${design.orientation === 'portrait' ? 'w-[2480px] h-[3508px]' : 'w-[3508px] h-[2480px]'}\`}
              style={{
                transform: \`scale(\${scale * userZoom})\`,`
  );
}

// 6. Fix zoom controls (replace existing zoom controls if present, or add them)
if (!code.includes('Minus size={14}')) {
  const zoomControls = `
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">
            <button onClick={() => setUserZoom(p => Math.max(0.1, p - 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">
              <Minus size={14} />
            </button>
            <button onClick={() => setUserZoom(1)} className="px-2 py-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors text-xs font-medium w-14 text-center" title="Reset Zoom">
              {Math.round(scale * userZoom * 100)}%
            </button>
            <button onClick={() => setUserZoom(p => Math.min(3, p + 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom In">
              <Plus size={14} />
            </button>
          </div>`;

  code = code.replace(
    /<span className="text-\[11px\] font-bold text-zinc-500 bg-white\/90 backdrop-blur-md px-3 py-1\.5 rounded-full shadow-sm border border-zinc-200\/50">\n\s*\{Math\.round\(scale \* 100\)\}% zoom\n\s*<\/span>/,
    zoomControls
  );
}

// 7. Fix Rnd key remounting
if (!code.includes('key={`${el.id}-${design.orientation}`')) {
  code = code.replace(
    /<Rnd\n\s*key=\{el\.id\}/g,
    `<Rnd
                        key={\`\${el.id}-\${design.orientation}\`}`
  );
}

// 8. Add isLayersOpen state if missing
if (!code.includes('const [isLayersOpen')) {
  code = code.replace(
    'const [activeTab, setActiveTab] = useState<"visual" | "builder" | "json">("builder");',
    'const [activeTab, setActiveTab] = useState<"visual" | "builder" | "json">("builder");\n  const [isLayersOpen, setIsLayersOpen] = useState(true);'
  );
}

// Also add Minus import if missing
if (!code.includes('Minus')) {
  code = code.replace(
    'Plus, Trash2, AlignLeft',
    'Minus, Plus, Trash2, AlignLeft'
  );
}

fs.writeFileSync(file, code);
console.log('Restored phases 1-3.');
