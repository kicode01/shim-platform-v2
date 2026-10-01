const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const regex = /<motion\.div\s*initial=\{\{\s*opacity:\s*0,\s*y:\s*-20\s*\}\}\s*animate=\{\{\s*opacity:\s*1,\s*y:\s*0\s*\}\}\s*exit=\{\{\s*opacity:\s*0,\s*y:\s*-20\s*\}\}\s*className="absolute top-6 left-1\/2 -translate-x-1\/2 z-\[120\] bg-indigo-600 text-white text-xs pl-4\s*pr-1 py-1 rounded-full shadow-lg flex items-center gap-3 font-medium pointer-events-auto"\s*>\s*<div className="flex items-center gap-1\.5 pointer-events-none">\s*<Hand size=\{14\} className="opacity-70" \/>\s*Double-click anywhere to disable\s*<\/div>\s*<button\s*onClick=\{\(\) => setShowPanTooltip\(false\)\}\s*className="p-1 hover:bg-white\/20 rounded-full transition-colors"\s*>\s*<X size=\{12\} \/>\s*<\/button>\s*<\/motion\.div>/m;

const replacement = `<motion.div 
                    initial={{ opacity: 0, y: -10, x: 10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: -10, x: 10 }}
                    className="absolute top-4 right-4 z-[120] bg-white/70 backdrop-blur-sm border border-zinc-200 text-zinc-500 text-xs pl-3 pr-1 py-1 rounded-md flex items-center gap-3 font-medium pointer-events-auto"
                  >
                    <div className="flex items-center gap-1.5 pointer-events-none">
                      <Hand size={14} className="opacity-70" />
                      Double-click to disable
                    </div>
                    <button 
                      onClick={() => setShowPanTooltip(false)} 
                      className="p-1 hover:bg-zinc-200/50 rounded-md transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/TemplateEditor.tsx', code);
    console.log("Replaced successfully via regex.");
} else {
    console.log("Regex did not match.");
    // Let's do a fallback replace for just className and text
    code = code.replace('className="absolute top-6 left-1/2 -translate-x-1/2 z-[120] bg-indigo-600 text-white text-xs pl-4 \r\npr-1 py-1 rounded-full shadow-lg flex items-center gap-3 font-medium pointer-events-auto"', 'className="absolute top-4 right-4 z-[120] bg-white/70 backdrop-blur-sm border border-zinc-200 text-zinc-500 text-xs pl-3 pr-1 py-1 rounded-md flex items-center gap-3 font-medium pointer-events-auto"');
    code = code.replace('className="absolute top-6 left-1/2 -translate-x-1/2 z-[120] bg-indigo-600 text-white text-xs pl-4 \npr-1 py-1 rounded-full shadow-lg flex items-center gap-3 font-medium pointer-events-auto"', 'className="absolute top-4 right-4 z-[120] bg-white/70 backdrop-blur-sm border border-zinc-200 text-zinc-500 text-xs pl-3 pr-1 py-1 rounded-md flex items-center gap-3 font-medium pointer-events-auto"');
    code = code.replace('Double-click anywhere to disable', 'Double-click to disable');
    fs.writeFileSync('src/components/TemplateEditor.tsx', code);
}
