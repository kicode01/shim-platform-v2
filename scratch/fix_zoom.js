const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const regex = /\{\/\* Interactive Zoom Controls \*\/\}[\s\S]*?<div className="absolute bottom-4 right-4 z-50 flex items-center bg-white\/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">[\s\S]*?<button onClick=\{\(\) => setUserZoom\(p => Math\.max\(0\.1, p - 0\.1\)\)\} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">[\s\S]*?<Minus size=\{14\} \/>[\s\S]*?<\/button>[\s\S]*?<button onClick=\{\(\) => setUserZoom\(1\)\} className="px-2 py-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors text-xs font-medium w-\[140px\] text-center" title="Reset Zoom">[\s\S]*?\{design\.orientation === 'portrait' \? '2480 x 3508' : '3508 x 2480'\} \(\{Math\.round\(scale \* userZoom \* 100\)\}\%\)[\s\S]*?<\/button>[\s\S]*?<button onClick=\{\(\) => setUserZoom\(p => Math\.min\(3, p \+ 0\.1\)\)\} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom In">[\s\S]*?<Plus size=\{14\} \/>[\s\S]*?<\/button>[\s\S]*?<\/div>/m;

const replacement = `{/* Interactive Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">
              {hasOverflow && (
                <button 
                  onClick={() => setIsPanMode(!isPanMode)} 
                  className={\`p-1 mr-1 rounded transition-colors \${isPanMode ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-zinc-100 text-zinc-600'}\`} 
                  title="Toggle Pan Mode (Double-click canvas to quickly toggle)"
                >
                  <Hand size={14} />
                </button>
              )}
              <button onClick={() => setUserZoom(p => Math.max(0.1, p - (0.1 / scale)))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">
                <Minus size={14} />
              </button>
              <button onClick={() => setUserZoom(1)} className="px-2 py-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors text-xs font-medium w-[140px] text-center" title="Reset Zoom">
                {design.orientation === 'portrait' ? '2480 x 3508' : '3508 x 2480'} ({Math.round(scale * userZoom * 100)}%)
              </button>
              <button onClick={() => setUserZoom(p => Math.min(20, p + (0.1 / scale)))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom In">
                <Plus size={14} />
              </button>
            </div>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/TemplateEditor.tsx', code);
    console.log('Successfully updated Zoom controls via script');
} else {
    console.error('Regex did not match!');
}
