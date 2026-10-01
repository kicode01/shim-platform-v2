const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const startIdx = code.indexOf('{/* Layer List */}');
const endIdx = code.indexOf('</motion.div>\n          )}\n        </AnimatePresence>\n\n        {/* Top Floating Pill */}');

if (startIdx !== -1 && endIdx !== -1) {
  const newLayersList = `
              {/* Layer List */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar pb-2" style={{ maxHeight: 'calc(80vh - 50px)' }}>
                <Reorder.Group 
                  axis="y" 
                  values={[...(design.canvasElements || [])].reverse()} 
                  onReorder={(newOrder) => {
                    updateDesign({ canvasElements: [...newOrder].reverse() });
                  }}
                  className="flex flex-col w-full m-0 p-0"
                >
                  {[...(design.canvasElements || [])].reverse().map((el, idx) => {
                    const originalIndex = (design.canvasElements || []).length - 1 - idx;
                    const isSelected = selectedElementId === el.id;
                    
                    // Scale factor to fit element in a 40x40 box
                    const miniScale = 0.012;

                    return (
                      <Reorder.Item
                        key={el.id}
                        value={el}
                        as="div"
                        className="w-full flex-shrink-0 cursor-grab active:cursor-grabbing"
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedElementId(el.id);
                          }}
                          className={\`w-full h-14 flex items-center gap-3 px-3 transition-colors border-b border-zinc-50 \${isSelected ? 'bg-indigo-50/60' : 'bg-white hover:bg-zinc-50'}\`}
                        >
                          {/* Mini Thumbnail */}
                          <div className={\`w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center relative pointer-events-none \${isSelected ? 'bg-indigo-100/50 ring-1 ring-indigo-200' : 'bg-zinc-100 ring-1 ring-zinc-200/50'}\`}>
                            <div 
                              style={{ 
                                width: el.width, 
                                height: el.type === 'staticText' || el.type === 'dynamicText' ? 'auto' : (el.height || el.width), 
                                transform: \`scale(\${miniScale})\`, 
                                transformOrigin: 'center center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {el.type === 'staticText' || el.type === 'dynamicText' ? (
                                <div style={{
                                  fontFamily: el.fontFamily,
                                  fontSize: \`\${el.fontSize}px\`,
                                  fontWeight: el.fontWeight,
                                  color: el.color,
                                  textAlign: el.align as any,
                                  lineHeight: el.lineHeight || 1.2,
                                  letterSpacing: \`\${el.letterSpacing || 0}px\`,
                                  whiteSpace: 'nowrap'
                                }}>
                                  {el.text}
                                </div>
                              ) : el.type === 'qrCode' ? (
                                <QrCode size={el.width} color={el.color} />
                              ) : (
                                <ImageIcon size={el.width} color={el.color || '#ccc'} />
                              )}
                            </div>
                          </div>
                          
                          {/* Element Info */}
                          <div className="flex-1 flex flex-col items-start overflow-hidden pointer-events-none">
                            <span className={\`text-[13px] font-medium truncate w-full text-left \${isSelected ? 'text-indigo-900' : 'text-zinc-700'}\`}>
                              {el.type === 'staticText' ? 'Text' : el.type === 'dynamicText' ? 'Variable' : el.type === 'qrCode' ? 'QR Code' : 'Image'}
                            </span>
                            {el.type === 'staticText' || el.type === 'dynamicText' ? (
                              <span className="text-[11px] text-zinc-400 truncate w-full text-left">{el.text}</span>
                            ) : null}
                          </div>

                          {/* Drag Handle & Z-Index */}
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 flex-shrink-0 rounded bg-zinc-100 flex items-center justify-center text-[10px] font-medium text-zinc-400">
                              {originalIndex + 1}
                            </div>
                          </div>
                        </button>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>
            `;

  const newCode = code.substring(0, startIdx) + newLayersList + code.substring(endIdx);
  fs.writeFileSync('src/components/TemplateEditor.tsx', newCode);
} else {
  console.log("Could not find start or end idx");
}
