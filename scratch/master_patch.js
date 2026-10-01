const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Imports
if (!code.includes("import dynamic from 'next/dynamic'")) {
  code = code.replace(
    'import { useState, useRef, useEffect } from "react";',
    'import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";\nimport dynamic from "next/dynamic";\nconst SignaturePad = dynamic(() => import("react-signature-canvas"), { ssr: false });'
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

// 3. Add Google Fonts injector block
const fontsBlock = `
  // Dynamic Typography Engine: extract used Google Fonts
  const usedFonts = useMemo(() => {
    const fonts = new Set<string>();
    if (design?.canvasElements) {
      design.canvasElements.forEach(el => {
        if (el.type === 'staticText' || el.type === 'dynamicText') {
          if (el.fontFamily && el.fontFamily.includes('var(--font-')) {
            const fontName = el.fontFamily.split(',')[0].replace('var(--font-', '').replace(')', '').replace(/-/g, ' ');
            fonts.add(fontName);
          } else if (el.fontFamily) {
            const cleanFont = el.fontFamily.split(',')[0].replace(/['"]/g, '');
            if (cleanFont !== 'sans-serif' && cleanFont !== 'serif' && cleanFont !== 'monospace') {
              fonts.add(cleanFont);
            }
          }
        }
      });
    }
    return Array.from(fonts);
  }, [design?.canvasElements]);

  const googleFontsUrl = useMemo(() => {
    if (usedFonts.length === 0) return null;
    const families = usedFonts.map(font => \`family=\${font.replace(/ /g, '+')}:wght@400;500;600;700\`).join('&');
    return \`https://fonts.googleapis.com/css2?\${families}&display=swap\`;
  }, [usedFonts]);
`;
if (!code.includes("usedFonts")) {
  code = code.replace(
    "const [showCategoryMenu, setShowCategoryMenu] = useState(false);",
    "const [showCategoryMenu, setShowCategoryMenu] = useState(false);\n" + fontsBlock
  );
  
  // Inject the link tag inside the return block
  code = code.replace(
    "<div className=\"flex flex-col h-screen bg-zinc-50 overflow-hidden\">",
    "<div className=\"flex flex-col h-screen bg-zinc-50 overflow-hidden\">\n      {googleFontsUrl && <link href={googleFontsUrl} rel=\"stylesheet\" />}"
  );
}

// 4. Update the Font Dropdown
const fontDropdown = `
  // 75 beautiful Google Fonts
  const GOOGLE_FONTS = {
    "Serif & Luxury": ["Playfair Display", "Cinzel", "Cormorant Garamond", "Lora", "Merriweather", "Noto Serif", "PT Serif", "Libre Baskerville", "EB Garamond", "Crimson Text", "Bodoni Moda", "Prata", "Abril Fatface", "Vidaloka", "Yeseva One"],
    "Sans-Serif & Modern": ["Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Nunito", "Raleway", "Rubik", "Work Sans", "Space Grotesk", "Outfit", "Manrope", "Plus Jakarta Sans", "Syne"],
    "Handwriting & Signatures": ["Great Vibes", "Dancing Script", "Pacifico", "Caveat", "Satisfy", "Sacramento", "Alex Brush", "Parisienne", "Allura", "Pinyon Script", "Tangerine", "Marck Script", "Yellowtail", "Mr De Haviland", "Monsieur La Doulaise"],
    "Display & Impact": ["Bebas Neue", "Lobster", "Righteous", "Alfa Slab One", "Oswald", "Anton", "Francois One", "Fjalla One", "Staatliches", "Bungee", "Russo One", "Carter One", "Passion One", "Titan One", "Changa One"],
    "Monospace & Tech": ["Fira Code", "Roboto Mono", "JetBrains Mono", "Space Mono", "Inconsolata", "Source Code Pro", "IBM Plex Mono", "Ubuntu Mono", "PT Mono", "Share Tech Mono", "VT323", "Courier Prime", "Cutive Mono", "Anonymous Pro", "Overpass Mono"]
  };
`;
if (!code.includes("GOOGLE_FONTS")) {
  code = code.replace(
    "const [showCategoryMenu, setShowCategoryMenu] = useState(false);",
    fontDropdown + "\n  const [showCategoryMenu, setShowCategoryMenu] = useState(false);"
  );
  
  code = code.replace(
    /<select\s+value=\{selectedElement\.fontFamily \|\| "sans-serif"\}\s+onChange=\{\(e\) => updateSelectedElement\(\{ fontFamily: e\.target\.value \}\)\}\s+className="flex-1 bg-zinc-50 border border-zinc-200 text-sm rounded-lg px-2 py-1\.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"\s*>\s*<option value="sans-serif">Sans Serif<\/option>\s*<option value="serif">Serif<\/option>\s*<option value="monospace">Monospace<\/option>\s*<\/select>/g,
    `<select
                      value={selectedElement.fontFamily || "sans-serif"}
                      onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                      className="flex-1 bg-zinc-50 border border-zinc-200 text-sm rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    >
                      <option value="sans-serif">Default Sans</option>
                      <option value="serif">Default Serif</option>
                      <option value="monospace">Default Mono</option>
                      {Object.entries(GOOGLE_FONTS).map(([category, fonts]) => (
                        <optgroup key={category} label={category}>
                          {fonts.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>`
  );
}

// 5. Add Signature Pad element generator button
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
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowSignatureModal(false)} 
                className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
                    const dataUrl = signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
                    const newEl = {
                      id: 'el-' + Date.now(),
                      type: 'image',
                      src: dataUrl,
                      x: (design.orientation === 'landscape' ? 1122 : 793) / 2 - 100,
                      y: (design.orientation === 'landscape' ? 793 : 1122) / 2 - 50,
                      width: 200,
                      height: 100,
                      zIndex: (design.canvasElements?.length || 0) + 1
                    };
                    setDesign({ ...design, canvasElements: [...(design.canvasElements || []), newEl] });
                    setSelectedElementId(newEl.id);
                    setShowSignatureModal(false);
                  }
                }} 
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
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

// 7. Active Guides render
const guidesRender = `
              {activeGuides.vertical !== null && (
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: activeGuides.vertical, width: 1, borderLeft: '1px dashed #FF3366', zIndex: 100 }} />
              )}
              {activeGuides.horizontal !== null && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: activeGuides.horizontal, height: 1, borderTop: '1px dashed #FF3366', zIndex: 100 }} />
              )}
`;
if (!code.includes('activeGuides.vertical !== null')) {
  code = code.replace(
    /<\/div>\s*\{\/\* Floating Scale Indicator \*\/\}/,
    guidesRender + "\n            </div>\n\n            {/* Floating Scale Indicator */}"
  );
}

// 8. Fix CanvasDraggableElement
code = code.replace(
  /dummyQrCode=\{dummyQrCode\}\s*\/>/g,
  "dummyQrCode={dummyQrCode}\n                    setActiveGuides={setActiveGuides}\n                    currentOrientation={design.orientation || 'landscape'}\n                  />"
);

code = code.replace(
  /function CanvasDraggableElement\(\{ el, isSelected, displayText, setSelectedElementId, updateSelectedElement, scale, dummyQrCode, isPanMode \}: any\) \{/,
  "function CanvasDraggableElement({ el, isSelected, displayText, setSelectedElementId, updateSelectedElement, scale, dummyQrCode, isPanMode, setActiveGuides, currentOrientation }: any) {"
);

const newDragCode = `onDragStart={() => {
        if (!isSelected) setSelectedElementId(el.id);
      }}
      onDrag={(e, data) => {
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
        if (setActiveGuides) setActiveGuides({ vertical: snapV, horizontal: snapH });
      }}
      onDragStop={(e, data) => {
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
        if (setActiveGuides) setActiveGuides({ vertical: null, horizontal: null });
        updateSelectedElement({ x: finalX, y: finalY });
      }}`;

code = code.replace(
  /onDragStart=\{\(\) => \{\s*if \(\!isSelected\) setSelectedElementId\(el\.id\);\s*\}\}\s*onDragStop=\{\(e, d\) => \{\s*updateSelectedElement\(\{ x: d\.x, y: d\.y \}\);\s*\}\}/,
  newDragCode
);


fs.writeFileSync(editorPath, code);
console.log("Master patch completed successfully!");
