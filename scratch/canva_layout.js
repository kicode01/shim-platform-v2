const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Replace the Floating Scale Indicator
const oldScale = `            {/* Floating Scale Indicator */}
            <div className="absolute bottom-4 right-4 z-50 pointer-events-none">
              <span className="text-xs font-medium text-zinc-600 border border-zinc-200 rounded-lg px-3 py-1.5 bg-white shadow-sm whitespace-nowrap block">
                3508 x 2480 px (Scale: {Math.round(scale * 100)}%)
              </span>
            </div>`;

const newZoom = `            {/* Interactive Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-50 flex items-center bg-white/90 backdrop-blur-md rounded-lg shadow-sm border border-zinc-200 p-1">
              <button onClick={() => setUserZoom(p => Math.max(0.1, p - 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom Out">
                <Minus size={14} />
              </button>
              <button onClick={() => setUserZoom(1)} className="px-2 py-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors text-xs font-medium w-[140px] text-center" title="Reset Zoom">
                {design.orientation === 'portrait' ? '2480 x 3508' : '3508 x 2480'} ({Math.round(scale * userZoom * 100)}%)
              </button>
              <button onClick={() => setUserZoom(p => Math.min(3, p + 0.1))} className="p-1 hover:bg-zinc-100 rounded text-zinc-600 transition-colors" title="Zoom In">
                <Plus size={14} />
              </button>
            </div>`;

code = code.replace(oldScale, newZoom);
code = code.replace(oldScale.replace(/\n/g, '\r\n'), newZoom.replace(/\n/g, '\r\n'));

// 2. Make it a true Canva Layout: Far-left docked sidebar for tools!
// Let's remove the toolbar from above the canvas
const oldToolbar = `          {/* Builder Toolbar */}
          <div className="p-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 bg-white shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => addElement("staticText", "New Heading")} className="btn-secondary text-xs px-3 py-1.5"><Type size={14} className="mr-1 text-zinc-500" /> Text</button>
              <button onClick={() => addElement("dynamicText", "recipientName")} className="btn-secondary text-xs px-3 py-1.5"><Database size={14} className="mr-1 text-zinc-500" /> Data Field</button>
              <button onClick={() => addElement("signature", "Signatory Name|Title Here")} className="btn-secondary text-xs px-3 py-1.5"><Type size={14} className="mr-1 text-zinc-500" /> Signature</button>
              <button onClick={() => addElement("badge")} className="btn-secondary text-xs px-3 py-1.5"><Stamp size={14} className="mr-1 text-zinc-500" /> Seal/Badge</button>
              <button onClick={() => addElement("image")} className="btn-secondary text-xs px-3 py-1.5"><ImageIcon size={14} className="mr-1 text-zinc-500" /> Image</button>
              <button onClick={() => addElement("shape")} className="btn-secondary text-xs px-3 py-1.5"><Move size={14} className="mr-1 text-zinc-500" /> Divider Line</button>
              <button onClick={() => addElement("qrCode")} className="btn-secondary text-xs px-3 py-1.5"><QrCode size={14} className="mr-1 text-zinc-500" /> QR</button>
            </div>
          </div>`;

code = code.replace(oldToolbar, '');
code = code.replace(oldToolbar.replace(/\n/g, '\r\n'), '');

// And insert it as a vertical sidebar on the left of the Administrative Controls
const leftPanelStart = `{/* Left: Administrative Controls */}`;
const verticalToolbar = `{/* Canva-Style Far Left Toolbar */}
        <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0 bg-zinc-900 rounded-xl overflow-hidden shadow-sm py-4 items-center">
          <button onClick={() => addElement("staticText", "New Heading")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Type size={20} />
            <span className="text-[10px] font-medium">Text</span>
          </button>
          <button onClick={() => addElement("dynamicText", "recipientName")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Database size={20} />
            <span className="text-[10px] font-medium">Data</span>
          </button>
          <button onClick={() => addElement("signature", "Signatory Name|Title Here")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Type size={20} />
            <span className="text-[10px] font-medium">Sign</span>
          </button>
          <button onClick={() => addElement("badge")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Stamp size={20} />
            <span className="text-[10px] font-medium">Badge</span>
          </button>
          <button onClick={() => addElement("image")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ImageIcon size={20} />
            <span className="text-[10px] font-medium">Image</span>
          </button>
          <button onClick={() => addElement("shape")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Move size={20} />
            <span className="text-[10px] font-medium">Divider</span>
          </button>
          <button onClick={() => addElement("qrCode")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <QrCode size={20} />
            <span className="text-[10px] font-medium">QR</span>
          </button>
        </div>
        
        {/* Left: Administrative Controls */}`;

code = code.replace(leftPanelStart, verticalToolbar);

// Change grid-cols-12 to flex so we can have fixed width sidebars and flex-1 canvas
const oldGrid = `<div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">`;
const newGrid = `<div className="flex-1 flex gap-6 min-h-0 overflow-hidden w-full max-w-none px-4 lg:px-0">`;
code = code.replace(oldGrid, newGrid);
code = code.replace(oldGrid.replace(/\n/g, '\r\n'), newGrid.replace(/\n/g, '\r\n'));

// Update Administrative Controls column to be fixed width
const oldAdminCol = `<div className="lg:col-span-4 xl:col-span-3 flex flex-col min-h-0 bg-white border border-zinc-200 rounded-xl shadow-sm relative overflow-hidden">`;
const newAdminCol = `<div className="w-[320px] shrink-0 flex flex-col min-h-0 bg-white border border-zinc-200 rounded-xl shadow-sm relative overflow-hidden">`;
code = code.replace(oldAdminCol, newAdminCol);
code = code.replace(oldAdminCol.replace(/\n/g, '\r\n'), newAdminCol.replace(/\n/g, '\r\n'));

// Update Canvas column to be flex-1
const oldCanvasCol = `<div className="lg:col-span-8 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">`;
const newCanvasCol = `<div className="flex-1 flex flex-col min-h-0 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden shadow-sm relative">`;
code = code.replace(oldCanvasCol, newCanvasCol);
code = code.replace(oldCanvasCol.replace(/\n/g, '\r\n'), newCanvasCol.replace(/\n/g, '\r\n'));

// Make the main wrapper full-width instead of max-w-7xl
const oldWrapper = `<div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 min-h-0 overflow-hidden">`;
const newWrapper = `<div className="flex-1 flex flex-col w-full px-4 sm:px-6 py-6 min-h-0 overflow-hidden">`;
code = code.replace(oldWrapper, newWrapper);
code = code.replace(oldWrapper.replace(/\n/g, '\r\n'), newWrapper.replace(/\n/g, '\r\n'));

// Need to make sure userZoom is applied in the transform
const oldTransform = `                transform: \`scale(\${scale})\`,`;
const newTransform = `                transform: \`scale(\${scale * userZoom})\`,`;
code = code.replace(oldTransform, newTransform);
code = code.replace(oldTransform.replace(/\n/g, '\r\n'), newTransform.replace(/\n/g, '\r\n'));

// Let's add Plus and Minus imports if they don't exist
if (!code.includes('Plus, Minus')) {
  code = code.replace('import { ', 'import { Plus, Minus, ');
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully injected Canva layout and Zoom Controls!');
