const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const startIdx = code.indexOf('{/* Layers Toggle Button */}');
const endIdx = code.indexOf('{/* Top Floating Pill */}');

if (startIdx !== -1 && endIdx !== -1) {
  const newLayersUI = `
        {/* Layers Toggle Button */}
        <AnimatePresence>
          {!isLayersOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-6 top-[20%] z-40"
            >
              <button 
                onClick={() => setIsLayersOpen(true)}
                className="w-12 h-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-600 hover:text-indigo-600 shadow-md hover:shadow-lg transition-all"
              >
                <Layers size={20} strokeWidth={2} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layers Panel */}
        <AnimatePresence>
          {isLayersOpen && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-6 top-[10%] z-50 flex flex-col bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden"
              style={{ width: '280px', maxHeight: '80vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-2 text-zinc-800 font-medium text-sm">
                  <Layers size={16} className="text-zinc-500" />
                  Layers
                </div>
                <button 
                  onClick={() => setIsLayersOpen(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Layer List */}
              <div className="flex flex-col overflow-y-auto custom-scrollbar pb-2" style={{ maxHeight: 'calc(80vh - 50px)' }}>
                {/* Reversing so top layer (highest index) is at the top of the list */}
                {[...(design.canvasElements || [])].reverse().map((el, idx) => {
                  const originalIndex = (design.canvasElements || []).length - 1 - idx;
                  const isSelected = selectedElementId === el.id;
                  
                  // Scale factor to fit element in a 40x40 box
                  const miniScale = 0.012;

                  return (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={\`w-full h-14 flex-shrink-0 flex items-center gap-3 px-3 transition-colors border-b border-zinc-50 \${isSelected ? 'bg-indigo-50/60' : 'bg-white hover:bg-zinc-50'}\`}
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
                      <div className="flex-1 flex flex-col items-start overflow-hidden">
                        <span className={\`text-[13px] font-medium truncate w-full text-left \${isSelected ? 'text-indigo-900' : 'text-zinc-700'}\`}>
                          {el.type === 'staticText' ? 'Text' : el.type === 'dynamicText' ? 'Variable' : el.type === 'qrCode' ? 'QR Code' : 'Image'}
                        </span>
                        {el.type === 'staticText' || el.type === 'dynamicText' ? (
                          <span className="text-[11px] text-zinc-400 truncate w-full text-left">{el.text}</span>
                        ) : null}
                      </div>

                      {/* Z-Index indicator (subtle) */}
                      <div className="w-5 h-5 flex-shrink-0 rounded bg-zinc-100 flex items-center justify-center text-[10px] font-medium text-zinc-400">
                        {originalIndex + 1}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        `;

  const newCode = code.substring(0, startIdx) + newLayersUI + code.substring(endIdx);
  fs.writeFileSync('src/components/TemplateEditor.tsx', newCode);
}
