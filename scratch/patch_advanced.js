const fs = require('fs');

const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Imports
if (!code.includes("import dynamic from 'next/dynamic'")) {
  code = code.replace(
    'import React, { useState, useEffect, useCallback } from "react";',
    'import React, { useState, useEffect, useCallback, useRef } from "react";\nimport dynamic from "next/dynamic";\nconst SignaturePad = dynamic(() => import("react-signature-canvas"), { ssr: false });'
  );
}

// 2. Add states for Smart Alignment and Signature Pad
const newStates = `
  const [activeGuides, setActiveGuides] = useState<{ vertical: number | null; horizontal: number | null }>({ vertical: null, horizontal: null });
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const signaturePadRef = useRef<any>(null);
`;
if (!code.includes("activeGuides")) {
  code = code.replace(
    "const [saving, setSaving] = useState(false);",
    "const [saving, setSaving] = useState(false);\n" + newStates
  );
}

// 3. Add Signature Pad element generator button
const addSignatureBtn = `
                <button onClick={() => setShowSignatureModal(true)} className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 flex flex-col items-center gap-1.5 transition-colors">
                  <span className="text-zinc-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
                  <span className="text-xs font-medium text-zinc-700">Signature</span>
                </button>
`;
if (!code.includes('setShowSignatureModal(true)')) {
  code = code.replace(
    /<button onClick=\{handleAddQrCode\}/,
    addSignatureBtn + "\n                <button onClick={handleAddQrCode}"
  );
}

// 4. Update the <Rnd> callbacks for smart alignment
// Find onDrag and onDragStop
code = code.replace(
  /onDrag=\{\(e, d\) => \{[\s\S]*?\}\}/,
  `onDrag={(e, data) => {
                                  const canvasWidth = currentOrientation === 'landscape' ? 1122 : 793;
                                  const canvasHeight = currentOrientation === 'landscape' ? 793 : 1122;
                                  const elW = data.node.offsetWidth;
                                  const elH = data.node.offsetHeight;
                                  const centerX = data.x + elW / 2;
                                  const centerY = data.y + elH / 2;
                                  let snapV = null;
                                  let snapH = null;
                                  if (Math.abs(centerX - canvasWidth/2) < 15) snapV = canvasWidth/2;
                                  if (Math.abs(centerY - canvasHeight/2) < 15) snapH = canvasHeight/2;
                                  setActiveGuides({ vertical: snapV, horizontal: snapH });
                                }}`
);

code = code.replace(
  /onDragStop=\{\(e, d\) => \{[\s\S]*?\}\}/,
  `onDragStop={(e, data) => {
                                  const canvasWidth = currentOrientation === 'landscape' ? 1122 : 793;
                                  const canvasHeight = currentOrientation === 'landscape' ? 793 : 1122;
                                  const elW = data.node.offsetWidth;
                                  const elH = data.node.offsetHeight;
                                  let finalX = data.x;
                                  let finalY = data.y;
                                  const centerX = data.x + elW / 2;
                                  const centerY = data.y + elH / 2;
                                  if (Math.abs(centerX - canvasWidth/2) < 15) finalX = canvasWidth/2 - elW/2;
                                  if (Math.abs(centerY - canvasHeight/2) < 15) finalY = canvasHeight/2 - elH/2;
                                  setActiveGuides({ vertical: null, horizontal: null });
                                  updateElement(el.id, { x: finalX, y: finalY });
                                }}`
);

// 5. Render active guides on the canvas
const guidesRender = `
              {activeGuides.vertical !== null && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: activeGuides.vertical, width: 1, borderLeft: '1px dashed #FF3366', zIndex: 100 }} />
              )}
              {activeGuides.horizontal !== null && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: activeGuides.horizontal, height: 1, borderTop: '1px dashed #FF3366', zIndex: 100 }} />
              )}
`;
if (!code.includes('activeGuides.vertical !== null')) {
  // Insert before the closing </AnimatePresence> or inside the canvas bounds
  code = code.replace(
    /<\/div>\s*\{\/\* Main Canvas Area \*\/\}/,
    guidesRender + "\n            </div>\n\n            {/* Main Canvas Area */}"
  );
}

// 6. Signature Pad Modal JSX
const signatureModalJSX = `
      {/* Signature Pad Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-zinc-800 mb-4">Draw Signature</h3>
            <div className="border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 overflow-hidden mb-4">
              <SignaturePad 
                ref={signaturePadRef} 
                canvasProps={{ className: 'w-full h-48 signature-canvas' }} 
                penColor="black"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => signaturePadRef.current?.clear()} 
                className="btn-secondary"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowSignatureModal(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                    const dataUrl = signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
                    const newEl: CanvasElement = {
                      id: 'el-' + Date.now(),
                      type: 'image',
                      src: dataUrl,
                      x: currentOrientation === 'landscape' ? 561 - 100 : 396.5 - 100,
                      y: currentOrientation === 'landscape' ? 396.5 - 50 : 561 - 50,
                      width: 200,
                      height: 100,
                      zIndex: (design.canvasElements?.length || 0) + 1
                    };
                    setDesign({ ...design, canvasElements: [...(design.canvasElements || []), newEl] });
                    setSelectedElementId(newEl.id);
                    setShowSignatureModal(false);
                  }
                }} 
                className="btn-primary"
              >
                Insert Signature
              </button>
            </div>
          </div>
        </div>
      )}
`;
if (!code.includes("showSignatureModal && (")) {
  code = code.replace(
    /<\/div>\s*<\/>\s*\);\s*\}\s*export default TemplateEditor;/,
    signatureModalJSX + "\n      </div>\n    </>\n  );\n}\n\nexport default TemplateEditor;"
  );
}

fs.writeFileSync(editorPath, code);
console.log("Patched advanced features successfully!");
