const fs = require('fs');

const path = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add userZoom state
code = code.replace(
  /const \[scale, setScale\] = useState\(1\);/,
  "const [scale, setScale] = useState(1);\n  const [userZoom, setUserZoom] = useState(1);"
);

// 2. Change flyout sidebar to push canvas
code = code.replace(
  /className="w-\[340px\] h-full bg-white border-r border-zinc-200 z-30 flex flex-col absolute left-\[80px\] shadow-xl overflow-y-auto"/,
  'className="h-full bg-white border-r border-zinc-200 z-30 shadow-xl overflow-hidden shrink-0 flex flex-col relative"'
);

code = code.replace(
  /animate=\{\{ x: 0, opacity: 1 \}\}\s*exit=\{\{ x: -340, opacity: 0 \}\}/,
  'animate={{ width: 340, opacity: 1 }}\n            exit={{ width: 0, opacity: 0 }}'
);
code = code.replace(
  /initial=\{\{ x: -340, opacity: 0 \}\}/,
  'initial={{ width: 0, opacity: 0 }}'
);

code = code.replace(
  /<div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">/,
  '<div className="w-[340px] h-full flex flex-col">\n              <div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">'
);

// find where secondary sidebar ends to close the inner wrapper
// The sidebar has <AnimatePresence> ... </motion.div> ... </AnimatePresence>
// Need to add closing </div> before </motion.div>
code = code.replace(
  /(\s*)<\/motion\.div>\n\s*<\/AnimatePresence>/,
  '$1</div>\n$1</motion.div>\n        </AnimatePresence>'
);

// 3. Change canvasWrapperRef logic
// Replace canvasWrapperRef div and its children
// We need to find the <div ref={canvasWrapperRef} ...
const canvasStart = '<div ref={canvasWrapperRef} className="flex-1 w-full overflow-hidden flex items-start justify-center pt-[60px] pb-[60px]">';
const newCanvasStart = '<div ref={canvasWrapperRef} className="flex-1 w-full overflow-auto flex items-start justify-center pt-[60px] pb-[60px] custom-scrollbar">';

code = code.replace(canvasStart, newCanvasStart);

code = code.replace(
  /transform: `scale\(\$\{scale\}\)`,\n\s*transformOrigin: "top center",/g,
  'transform: `scale(${scale * userZoom})`,\n              transformOrigin: "top left",'
);

// We need to wrap the canvas in a sizing container
code = code.replace(
  /<div \n\s*className="relative bg-white shadow-2xl transition-transform duration-200"/,
  `<div style={{ width: CERT_WIDTH * (scale * userZoom), height: CERT_HEIGHT * (scale * userZoom), position: 'relative', flexShrink: 0, margin: '0 auto' }}>\n            <div \n            className="relative bg-white shadow-2xl transition-transform duration-200"`
);

// find where the canvas div ends
code = code.replace(
  /(\s*)<\/div>\n\s*<\/div>\n\s*<div className="absolute bottom-6 right-6 z-50 pointer-events-none flex items-center gap-2">/,
  '$1  </div>\n$1</div>\n$1</div>\n\n        <div className="absolute bottom-6 right-6 z-50 flex items-center gap-2 pointer-events-auto">'
);

// Zoom controls UI
const zoomControls = `
          <div className="flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">
            <button onClick={() => setUserZoom(p => Math.max(0.1, p - 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">
              <Minus size={14} />
            </button>
            <button onClick={() => setUserZoom(1)} className="px-2 py-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors text-xs font-medium w-14 text-center" title="Reset Zoom">
              {Math.round(scale * userZoom * 100)}%
            </button>
            <button onClick={() => setUserZoom(p => Math.min(3, p + 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom In">
              <Plus size={14} />
            </button>
          </div>`;

code = code.replace(
  /<span className="text-\[11px\] font-bold text-zinc-500 bg-white\/90 backdrop-blur-md px-3 py-1\.5 rounded-full shadow-sm border border-zinc-200\/50">\n\s*\{Math\.round\(scale \* 100\)\}% zoom\n\s*<\/span>/,
  zoomControls
);

fs.writeFileSync(path, code);
