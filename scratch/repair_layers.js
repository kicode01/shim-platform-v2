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
              className="absolute right-8 top-[10%] z-40"
            >
              <button 
                onClick={() => setIsLayersOpen(true)}
                className="w-14 h-16 bg-zinc-100 border-2 border-zinc-200 border-b-[6px] border-b-zinc-300 rounded-[20px] flex items-center justify-center text-zinc-800 hover:brightness-95 active:border-b-2 active:translate-y-1 transition-all"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Layers size={18} strokeWidth={2.5} />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Layers Panel */}
        <AnimatePresence>
          {isLayersOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-8 top-[10%] z-50 flex flex-col items-center gap-4"
              style={{ maxHeight: '85vh' }}
            >
              <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar px-2 py-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                {[...design.canvasElements].reverse().map((el, idx) => {
                  const originalIndex = design.canvasElements.length - 1 - idx;
                  const isSelected = selectedElementId === el.id;
                  
                  // Compute a scale factor to fit 3508x2480 into a ~60x60 box
                  const miniScale = 0.017;

                  return (
                    <motion.button
                      key={el.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedElementId(el.id)}
                      className={\`w-[76px] h-[92px] rounded-[18px] border-2 bg-zinc-50 flex items-center justify-center relative transition-all \${isSelected ? 'border-indigo-500 border-b-[6px] border-b-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'border-zinc-200 border-b-[6px] border-b-zinc-300 hover:brightness-95'}\`}
                    >
                      {/* Mini Thumbnail Renderer */}
                      <div className="absolute inset-0 rounded-[14px] overflow-hidden flex items-center justify-center pointer-events-none bg-white m-1">
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
                      
                      {/* Number bubble */}
                      <div className="absolute -bottom-2 -right-2 w-[34px] h-[34px] rounded-full bg-[#4a4a4f] text-white flex items-center justify-center font-bold text-[16px] shadow-sm z-10 border-2 border-zinc-100">
                        {originalIndex + 1}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setIsLayersOpen(false)}
                className="w-14 h-14 mt-2 bg-zinc-100 border-2 border-zinc-200 border-b-[4px] border-b-zinc-300 rounded-full flex items-center justify-center text-zinc-600 hover:brightness-95 active:border-b-0 active:translate-y-1 transition-all shrink-0"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        `;

  const newCode = code.substring(0, startIdx) + newLayersUI + code.substring(endIdx);
  fs.writeFileSync('src/components/TemplateEditor.tsx', newCode);
}
