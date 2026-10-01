const fs = require('fs');

const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

// 1. Add the massive list of fonts outside the component
const FONTS_LIST = `
const GOOGLE_FONTS = [
  { group: "Serif & Luxury", fonts: ["Playfair Display", "Cinzel", "Cormorant Garamond", "Merriweather", "Lora", "PT Serif", "Noto Serif", "Libre Baskerville", "EB Garamond", "Bodoni Moda", "Prata", "Castoro", "DM Serif Display", "Fraunces", "Cardo"] },
  { group: "Sans-Serif & Modern", fonts: ["Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Oswald", "Raleway", "Outfit", "Space Grotesk", "Work Sans", "Rubik", "Manrope", "DM Sans", "Syne"] },
  { group: "Display & Impact", fonts: ["Bebas Neue", "Anton", "Lobster", "Abril Fatface", "Righteous", "Alfa Slab One", "Unica One", "Fjalla One", "Titan One", "Syncopate", "Bowlby One", "Oleo Script", "Russo One", "Yeseva One", "Rampart One"] },
  { group: "Handwriting & Signatures", fonts: ["Great Vibes", "Dancing Script", "Pacifico", "Caveat", "Satisfy", "Sacramento", "Alex Brush", "Parisienne", "Monsieur La Doulaise", "Herr Von Muellerhoff", "Pinyon Script", "Tangerine", "Clicker Script", "Allura", "Rochester"] },
  { group: "Monospace & Tech", fonts: ["Fira Code", "Space Mono", "JetBrains Mono", "Inconsolata", "Source Code Pro", "IBM Plex Mono", "Ubuntu Mono", "PT Mono", "Anonymous Pro", "Share Tech Mono", "VT323", "Courier Prime", "Cutive Mono", "Overpass Mono", "Oxygen Mono"] }
];
`;

if (!code.includes("const GOOGLE_FONTS")) {
  code = code.replace("const PRESET_CATEGORIES", FONTS_LIST + "\nconst PRESET_CATEGORIES");
}

// 2. We need a function to extract fonts inside the component and generate the URL
const dynamicFontsBlock = `
  // Dynamic Typography Engine: extract used Google Fonts
  const usedFonts = React.useMemo(() => {
    const fonts = new Set<string>();
    if (design?.canvasElements) {
      design.canvasElements.forEach(el => {
        if (el.fontFamily && !el.fontFamily.startsWith('var(') && el.fontFamily !== 'Arial' && el.fontFamily !== 'sans-serif') {
          fonts.add(el.fontFamily);
        }
      });
    }
    return Array.from(fonts);
  }, [design?.canvasElements]);

  const googleFontsUrl = usedFonts.length > 0 
    ? \`https://fonts.googleapis.com/css2?\${usedFonts.map(f => \`family=\${f.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700\`).join('&')}&display=swap\`
    : null;
`;

// Insert the dynamic block right after `const [saving, setSaving] = useState(false);`
if (!code.includes("const usedFonts = React.useMemo")) {
  code = code.replace("const [saving, setSaving] = useState(false);", "const [saving, setSaving] = useState(false);\n" + dynamicFontsBlock);
}

// 3. Inject the `<link>` tag into the return statement of the component.
// It returns `<div className="fixed inset-0...`
if (!code.includes('googleFontsUrl && <link')) {
  code = code.replace(
    /return \(\s*<div className="fixed inset-0/,
    `return (
    <>
      {googleFontsUrl && <link href={googleFontsUrl} rel="stylesheet" />}
      <div className="fixed inset-0`
  );
  code = code.replace(
    /<\/div>\s*\);\s*}\s*export default TemplateEditor;/,
    `</div>\n    </>\n  );\n}\n\nexport default TemplateEditor;`
  );
}

// 4. Replace the old `<select>` with the new one
const oldSelect = /<select className="input-field py-2 text-sm" value=\{selectedElement\.fontFamily \|\| "var\(--font-inter, sans-serif\)"\} onChange=\{\(e\) => updateSelectedElement\(\{ fontFamily: e\.target\.value \}\)\}>[\s\S]*?<\/select>/;

const newSelect = `<select className="input-field py-2 text-sm" value={selectedElement.fontFamily || "Inter"} onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}>
                              <optgroup label="System Basics">
                                <option value="Arial">Arial (System)</option>
                                <option value="var(--font-inter, sans-serif)">Inter (Built-in)</option>
                              </optgroup>
                              {GOOGLE_FONTS.map(group => (
                                <optgroup key={group.group} label={group.group}>
                                  {group.fonts.map(font => (
                                    <option key={font} value={font}>{font}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync(editorPath, code);
console.log("Patched Typography Engine successfully!");
