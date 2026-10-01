const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Add Google Fonts injector block
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
            if (cleanFont !== 'sans-serif' && cleanFont !== 'serif' && cleanFont !== 'monospace' && cleanFont !== 'inherit') {
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
    const families = usedFonts.map(font => \`family=\${font.replace(/ /g, '+')}:wght@400;500;600;700;800;900\`).join('&');
    return \`https://fonts.googleapis.com/css2?\${families}&display=swap\`;
  }, [usedFonts]);

  // 75 beautiful Google Fonts
  const GOOGLE_FONTS = {
    "Serif & Luxury": ["Playfair Display", "Cinzel", "Cormorant Garamond", "Lora", "Merriweather", "Noto Serif", "PT Serif", "Libre Baskerville", "EB Garamond", "Crimson Text", "Bodoni Moda", "Prata", "Abril Fatface", "Vidaloka", "Yeseva One"],
    "Sans-Serif & Modern": ["Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Nunito", "Raleway", "Rubik", "Work Sans", "Space Grotesk", "Outfit", "Manrope", "Plus Jakarta Sans", "Syne"],
    "Handwriting & Signatures": ["Great Vibes", "Dancing Script", "Pacifico", "Caveat", "Satisfy", "Sacramento", "Alex Brush", "Parisienne", "Allura", "Pinyon Script", "Tangerine", "Marck Script", "Yellowtail", "Mr De Haviland", "Monsieur La Doulaise"],
    "Display & Impact": ["Bebas Neue", "Lobster", "Righteous", "Alfa Slab One", "Oswald", "Anton", "Francois One", "Fjalla One", "Staatliches", "Bungee", "Russo One", "Carter One", "Passion One", "Titan One", "Changa One"],
    "Monospace & Tech": ["Fira Code", "Roboto Mono", "JetBrains Mono", "Space Mono", "Inconsolata", "Source Code Pro", "IBM Plex Mono", "Ubuntu Mono", "PT Mono", "Share Tech Mono", "VT323", "Courier Prime", "Cutive Mono", "Anonymous Pro", "Overpass Mono"]
  };
`;

if (!code.includes("usedFonts")) {
  // Inject useMemo dependency
  if (!code.includes('useMemo')) {
    code = code.replace(
      'import { useState, useRef, useEffect } from "react";',
      'import React, { useState, useRef, useEffect, useMemo } from "react";'
    );
  }

  code = code.replace(
    "const [saving, setSaving] = useState(false);",
    "const [saving, setSaving] = useState(false);\n" + fontsBlock
  );
  
  // Inject the link tag inside the return block
  code = code.replace(
    /<div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 min-h-0 overflow-hidden">/,
    `<div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 min-h-0 overflow-hidden">\n      {googleFontsUrl && <link href={googleFontsUrl} rel="stylesheet" />}`
  );
}

// 2. Update the Font Dropdown
if (code.includes('<option value="var(--font-mono, monospace)">System Monospace</option>')) {
  code = code.replace(
    /<option value="var\(--font-mono, monospace\)">System Monospace<\/option>\s*<\/select>/,
    `<option value="var(--font-mono, monospace)">System Monospace</option>
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

fs.writeFileSync(editorPath, code);
console.log("Fonts ONLY injected successfully");
