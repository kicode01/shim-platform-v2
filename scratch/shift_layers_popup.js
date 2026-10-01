const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Add showLayersPanel state
if (!code.includes('const [showLayersPanel, setShowLayersPanel] = useState(false);')) {
  code = code.replace('const [showPanTooltip, setShowPanTooltip] = useState(false);', 'const [showPanTooltip, setShowPanTooltip] = useState(false);\n  const [showLayersPanel, setShowLayersPanel] = useState(false);');
}

// 2. Remove the old layers list from builder tab
const regexOldLayers = /\{\/\*\s*Layers List\s*\*\/\}\s*<div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\s*:\s*activeTab/m;
if (regexOldLayers.test(code)) {
    console.log("Found old layers via regex, waiting to replace...");
}

// Actually, it's easier to just strip out the old Layers List by finding its boundaries
const oldLayersStart = `{/* Layers List */}`;
const indexOfOldLayers = code.indexOf(oldLayersStart);
if (indexOfOldLayers !== -1) {
    // Find the end of it. We know it ends before `) : activeTab === "presets" ? (`
    const endStr = `                ) : activeTab === "presets" ? (`;
    const endIdx = code.indexOf(endStr, indexOfOldLayers);
    if (endIdx !== -1) {
        // We need to keep the closing tags before `) : activeTab === "presets"`
        // Wait, the oldLayers section was injected right after the "Select an element" empty state.
        // Let's just find the exact block we injected and remove it.
        const injectedBlock = `                
                {/* Layers List */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-700 flex items-center gap-2 border-b border-zinc-200 pb-3">
                    <Layers size={16} className="text-zinc-500" /> Canvas Layers
                  </h4>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {!design.canvasElements || design.canvasElements.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4">No elements on canvas.</p>
                    ) : (
                      [...(design.canvasElements || [])].reverse().map((el, reversedIdx) => {
                        const idx = design.canvasElements!.length - 1 - reversedIdx;
                        const isSelected = selectedElementId === el.id;
                        let label = el.type;
                        if (label === 'staticText') label = el.text ? \`Text: "\${el.text.substring(0, 15)}..."\` : 'Text';
                        else if (label === 'dynamicText') label = \`Data: \${el.text}\`;
                        else if (label === 'badge') label = 'Seal/Badge';
                        else if (label === 'image') label = 'Image';
                        else if (label === 'qrCode') label = 'QR Code';
                        else if (label === 'signature') label = 'Signature';
                        
                        return (
                          <div 
                            key={el.id}
                            className={\`flex items-center justify-between p-2.5 rounded-lg border text-sm cursor-pointer transition-colors \${isSelected ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600'}\`}
                            onClick={() => setSelectedElementId(el.id)}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className={\`w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono \${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-zinc-100 text-zinc-500'}\`}>
                                {idx + 1}
                              </div>
                              <span className="truncate font-medium text-xs">{label}</span>
                            </div>
                            
                            {isSelected && (
                              <div className="flex items-center gap-1 shrink-0 bg-white/50 rounded-md shadow-sm border border-indigo-200/50 p-0.5">
                                <button onClick={(e) => { e.stopPropagation(); moveLayerUp(); }} disabled={idx === design.canvasElements!.length - 1} className="p-1 hover:bg-indigo-100 rounded text-indigo-600 disabled:opacity-30 transition-colors" title="Bring Forward">
                                  <ArrowUp size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); moveLayerDown(); }} disabled={idx === 0} className="p-1 hover:bg-indigo-100 rounded text-indigo-600 disabled:opacity-30 transition-colors" title="Send Backward">
                                  <ArrowDown size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>`;
        if (code.includes(injectedBlock)) {
            code = code.replace(injectedBlock, '');
        } else if (code.includes(injectedBlock.replace(/\n/g, '\r\n'))) {
            code = code.replace(injectedBlock.replace(/\n/g, '\r\n'), '');
        } else {
            console.log("Could not find exact injected block to remove, will try regex.");
            // Strip out via regex
            const regexClean = /\{\/\*\s*Layers List\s*\*\/\}\s*<div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">[\s\S]*?<\/div>\s*<\/div>/;
            code = code.replace(regexClean, '');
        }
    }
}

// Rename Settings Tooltip back
code = code.replace('<span className="text-[10px] font-medium">Layers</span>', '<span className="text-[10px] font-medium">Settings</span>');

// 3. Update Zoom Controls to include Layers toggle and the Popup
const zoomControlsTarget = `{/* Interactive Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-[110] flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">`;
              
const zoomControlsReplacement = `{/* Interactive Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-[110] flex flex-col items-end">
                
                {/* Layers Popup */}
                <AnimatePresence>
                  {showLayersPanel && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="mb-2 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-xl w-[260px] overflow-hidden pointer-events-auto"
                    >
                      <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <h4 className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                          <Layers size={14} className="text-zinc-500" /> Canvas Layers
                        </h4>
                        <button onClick={() => setShowLayersPanel(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
                        {!design.canvasElements || design.canvasElements.length === 0 ? (
                          <p className="text-[11px] text-zinc-400 text-center py-4">No elements yet</p>
                        ) : (
                          [...(design.canvasElements || [])].reverse().map((el, reversedIdx) => {
                            const idx = design.canvasElements!.length - 1 - reversedIdx;
                            const isSelected = selectedElementId === el.id;
                            let label = el.type;
                            if (label === 'staticText') label = el.text ? \`"\${el.text.substring(0, 15)}..."\` : 'Text';
                            else if (label === 'dynamicText') label = \`Data: \${el.text}\`;
                            else if (label === 'badge') label = 'Badge';
                            else if (label === 'image') label = 'Image';
                            else if (label === 'qrCode') label = 'QR Code';
                            else if (label === 'signature') label = 'Signature';
                            
                            return (
                              <div 
                                key={el.id}
                                className={\`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors \${isSelected ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' : 'bg-transparent hover:bg-zinc-100 text-zinc-600 border border-transparent'}\`}
                                onClick={() => setSelectedElementId(el.id)}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div className={\`w-4 h-4 flex items-center justify-center rounded text-[9px] font-mono \${isSelected ? 'bg-indigo-200/50 text-indigo-600' : 'bg-zinc-200/50 text-zinc-400'}\`}>
                                    {idx + 1}
                                  </div>
                                  <span className="truncate font-medium">{label}</span>
                                </div>
                                
                                {isSelected && (
                                  <div className="flex items-center shrink-0">
                                    <button onClick={(e) => { e.stopPropagation(); moveLayerUp(); }} disabled={idx === design.canvasElements!.length - 1} className="p-1 hover:bg-indigo-200/50 rounded text-indigo-600 disabled:opacity-30 transition-colors" title="Bring Forward">
                                      <ArrowUp size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); moveLayerDown(); }} disabled={idx === 0} className="p-1 hover:bg-indigo-200/50 rounded text-indigo-600 disabled:opacity-30 transition-colors" title="Send Backward">
                                      <ArrowDown size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1 pointer-events-auto">
                  <button 
                    onClick={() => setShowLayersPanel(!showLayersPanel)}
                    className={\`p-1 mr-1 rounded transition-colors flex items-center justify-center \${showLayersPanel ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-zinc-100 text-zinc-600'}\`}
                    title="Layers Panel"
                  >
                    <Layers size={14} />
                  </button>
                  <div className="w-[1px] h-4 bg-zinc-200 mx-1"></div>`;

if (code.includes(zoomControlsTarget)) {
  code = code.replace(zoomControlsTarget, zoomControlsReplacement);
} else {
  code = code.replace(zoomControlsTarget.replace(/\n/g, '\r\n'), zoomControlsReplacement.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully shifted Layers to minimalist popup inside zoom controls');
