const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const replacement = `<div className="relative flex items-center h-[38px] w-auto">
              <AnimatePresence mode="wait">
                {showResetConfirm ? (
                  <motion.div 
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.95, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                    exit={{ opacity: 0, scale: 0.95, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center border border-red-200 rounded-lg overflow-hidden bg-white shrink-0 shadow-sm h-[38px] origin-right"
                  >
                    <span className="text-sm font-medium text-red-600 bg-red-50/50 px-3 flex items-center h-full border-r border-red-100">
                      Reset All?
                    </span>
                    <button
                      onClick={() => {
                        applyDesignUpdate(defaultDesign);
                        setShowResetConfirm(false);
                      }}
                      className="px-4 hover:bg-red-50 text-red-600 transition-colors h-full flex items-center justify-center text-sm font-semibold border-r border-red-100"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 hover:bg-zinc-50 text-zinc-600 transition-colors h-full flex items-center justify-center text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </motion.div>
                ) : (
                  <motion.button 
                    key="reset"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setShowResetConfirm(true)} 
                    className="btn-secondary font-medium h-[38px]"
                  >
                    <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>`;

code = code.replace(
  /\{\s*showResetConfirm\s*\?\s*\([\s\S]*?Reset\<\/span\>\s*\<\/button\>\s*\)\s*\}/, 
  replacement
);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Replaced successfully');
