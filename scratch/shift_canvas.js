const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Move toggle button to top
code = code.replace(
  /className="absolute right-6 top-\[20%\] z-40"/g,
  'className="absolute right-6 top-6 z-40"'
);

// 2. Move panel to top
code = code.replace(
  /className="absolute right-6 top-\[10%\] z-50 flex flex-col bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden"/g,
  'className="absolute right-6 top-6 z-50 flex flex-col bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden"'
);

// 3. Update containerRef to respond to isLayersOpen
code = code.replace(
  /className="absolute inset-0 z-10 flex items-start justify-center pt-24 pb-12 overflow-auto"/g,
  'className="absolute left-0 top-0 bottom-0 z-10 flex items-start justify-center pt-24 pb-12 overflow-auto transition-all duration-300" style={{ right: isLayersOpen ? "300px" : "0px" }}'
);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log("Successfully updated layout");
