const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Import X
if (!code.includes('X,') && !code.includes(', X }')) {
  code = code.replace('Hand } from "lucide-react";', 'Hand, X } from "lucide-react";');
}

// 2. Add showPanTooltip state
if (!code.includes('const [showPanTooltip, setShowPanTooltip]')) {
  code = code.replace('const [isPanMode, setIsPanMode] = useState(false);', 'const [isPanMode, setIsPanMode] = useState(false);\n  const [showPanTooltip, setShowPanTooltip] = useState(false);');
}

// 3. Add useEffect to trigger tooltip
if (!code.includes('if (isPanMode) setShowPanTooltip(true);')) {
  const panOffsetState = 'const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });';
  code = code.replace(panOffsetState, panOffsetState + '\n\n  useEffect(() => {\n    if (isPanMode) setShowPanTooltip(true);\n  }, [isPanMode]);');
}

// 4. Inject tooltip UI
const tooltipTarget = `{/* Right: Live Canvas Builder */}
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">`;
          
const tooltipReplacement = `{/* Right: Live Canvas Builder */}
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">
            
            {/* Pan Mode Notification */}
            <AnimatePresence>
              {isPanMode && showPanTooltip && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 z-[120] bg-indigo-600 text-white text-xs pl-4 pr-1 py-1 rounded-full shadow-lg flex items-center gap-3 font-medium pointer-events-auto"
                >
                  <div className="flex items-center gap-1.5 pointer-events-none">
                    <Hand size={14} className="opacity-70" />
                    Double-click anywhere to disable
                  </div>
                  <button 
                    onClick={() => setShowPanTooltip(false)} 
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>`;
            
if (code.includes(tooltipTarget) || code.includes(tooltipTarget.replace(/\n/g, '\r\n'))) {
  code = code.replace(tooltipTarget, tooltipReplacement);
  if (code.indexOf(tooltipReplacement) === -1) {
    code = code.replace(tooltipTarget.replace(/\n/g, '\r\n'), tooltipReplacement.replace(/\n/g, '\r\n'));
  }
} else {
  // Use regex
  const regex = /\{\/\*\s*Right: Live Canvas Builder\s*\*\/\}\s*<div className="flex-1 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">/;
  code = code.replace(regex, tooltipReplacement);
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully injected Pan tooltip');
