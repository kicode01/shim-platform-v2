const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const target = `<div className="absolute bottom-6 right-6 z-50 pointer-events-none flex items-center gap-2">\r
          <span className="text-[11px] font-bold text-zinc-500 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-zinc-200/50">\r
            {Math.round(scale * userZoom * 100)}% zoom\r
          </span>\r
        </div>`;
const target_unix = target.replace(/\r/g, '');

const replace = `<div className="absolute bottom-6 right-6 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-md px-1 py-1 rounded-full shadow-sm border border-zinc-200/50 pointer-events-auto">
          <button 
            onClick={() => setUserZoom(prev => Math.max(0.25, prev - 0.25))}
            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
            title="Zoom Out"
          >
            <Minus size={14} />
          </button>
          <span className="text-[11px] font-bold text-zinc-600 px-2 min-w-[50px] text-center select-none">
            {Math.round(scale * userZoom * 100)}%
          </span>
          <button 
            onClick={() => setUserZoom(prev => Math.min(3, prev + 0.25))}
            className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
            title="Zoom In"
          >
            <Plus size={14} />
          </button>
        </div>`;

code = code.replace(target, replace).replace(target_unix, replace);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Replaced zoom controls');
