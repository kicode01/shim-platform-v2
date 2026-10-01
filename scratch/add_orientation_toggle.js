const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const target = `            {showResetConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-red-500 px-1">Reset?</span>
                <button onClick={() => { applyDesignUpdate(defaultDesign); setShowResetConfirm(false); }} className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700">Yes</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium hover:bg-zinc-200">No</button>
              </div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1.5 rounded-md hover:bg-zinc-50 mr-1">Reset</button>
            )}`;

const replace = `            {/* Orientation Toggle */}
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
            </div>

            {showResetConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-red-500 px-1">Reset?</span>
                <button onClick={() => { applyDesignUpdate(defaultDesign); setShowResetConfirm(false); }} className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700">Yes</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-medium hover:bg-zinc-200">No</button>
              </div>
            ) : (
              <button onClick={() => setShowResetConfirm(true)} className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 px-2 py-1.5 rounded-md hover:bg-zinc-50 mr-1">Reset</button>
            )}`;

code = code.replace(target, replace).replace(target.replace(/\n/g, '\r\n'), replace.replace(/\n/g, '\r\n'));
fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Added orientation toggle successfully');
