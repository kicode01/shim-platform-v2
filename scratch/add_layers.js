const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Rename tooltip from 'Settings' to 'Layers'
code = code.replace('<span className="text-[10px] font-medium">Settings</span>', '<span className="text-[10px] font-medium">Layers</span>');

// 2. Import ArrowUp, ArrowDown
if (!code.includes('ArrowUp')) {
  code = code.replace('Hand, X } from "lucide-react";', 'Hand, X, ArrowUp, ArrowDown } from "lucide-react";');
}

// 3. Inject Layers UI below Element Properties
const targetEndProps = `                  <div className="text-center p-10 border border-dashed border-zinc-300 rounded-xl bg-zinc-50 text-zinc-400">
                    <MousePointer2 size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">Select an element on the canvas to edit its properties.</p>
                  </div>
                )}`;

const layersUI = `                  <div className="text-center p-10 border border-dashed border-zinc-300 rounded-xl bg-zinc-50 text-zinc-400">
                    <MousePointer2 size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">Select an element on the canvas to edit its properties.</p>
                  </div>
                )}
                
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

if (code.includes(targetEndProps)) {
  code = code.replace(targetEndProps, layersUI);
} else {
  code = code.replace(targetEndProps.replace(/\n/g, '\r\n'), layersUI.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully injected Layers list');
