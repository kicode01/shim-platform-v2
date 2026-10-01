const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// The replacement for Zoom Controls
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

const regexZoomControls = /\{\/\*\s*Interactive Zoom Controls\s*\*\/\}\s*<div className="absolute bottom-4 right-4 z-\[110\] flex items-center bg-white\/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">/;

if (regexZoomControls.test(code)) {
    code = code.replace(regexZoomControls, zoomControlsReplacement);
    fs.writeFileSync('src/components/TemplateEditor.tsx', code);
    console.log("Successfully replaced zoom controls with Layers button via regex.");
} else {
    console.log("Regex replacement failed.");
}
