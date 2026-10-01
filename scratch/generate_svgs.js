const fs = require('fs');

const svgToBase64 = (svg) => {
  return "data:image/svg+xml;base64," + Buffer.from(svg).toString('base64');
};

const presets = [
  {
    name: "Corporate & Professional",
    orientation: "landscape",
    items: [
      {
        id: "corp-navy",
        name: "Classic Navy Geometric",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><polygon points="0,0 200,0 0,200" fill="#0f172a"/><polygon points="0,0 150,0 0,150" fill="#d4af37"/><polygon points="1122,793 922,793 1122,593" fill="#0f172a"/><polygon points="1122,793 972,793 1122,643" fill="#d4af37"/></svg>')
      },
      {
        id: "corp-silver",
        name: "Minimalist Silver & Grey",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#f8fafc"/><rect x="20" y="20" width="1082" height="753" fill="none" stroke="#94a3b8" stroke-width="4"/><rect x="30" y="30" width="1062" height="733" fill="none" stroke="#cbd5e1" stroke-width="2"/></svg>')
      },
      {
        id: "corp-emerald",
        name: "Emerald Corporate",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><rect x="40" y="40" width="1042" height="713" fill="none" stroke="#065f46" stroke-width="8"/><rect x="50" y="50" width="1022" height="693" fill="none" stroke="#d4af37" stroke-width="2"/><path d="M0 0 L150 0 L0 150 Z" fill="#065f46"/><path d="M1122 793 L972 793 L1122 643 Z" fill="#065f46"/></svg>')
      },
      {
        id: "corp-crimson",
        name: "Crimson & Slate",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><rect x="0" y="0" width="1122" height="15" fill="#991b1b"/><rect x="0" y="778" width="1122" height="15" fill="#991b1b"/><rect x="0" y="15" width="1122" height="5" fill="#475569"/><rect x="0" y="773" width="1122" height="5" fill="#475569"/></svg>')
      },
      {
        id: "corp-purple",
        name: "Royal Purple & Gold",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><rect x="30" y="30" width="1062" height="733" fill="none" stroke="#5b21b6" stroke-width="6"/><rect x="42" y="42" width="1038" height="709" fill="none" stroke="#d4af37" stroke-width="3"/></svg>')
      },
      {
        id: "corp-charcoal",
        name: "Modern Charcoal Sideband",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#f1f5f9"/><rect x="0" y="0" width="200" height="793" fill="#1e293b"/><path d="M200 0 L250 0 L250 793 L200 793 Z" fill="#334155"/></svg>')
      }
    ]
  },
  {
    name: "Academic & Education",
    orientation: "landscape",
    items: [
      {
        id: "acad-vic",
        name: "Victorian Filigree",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#fef9c3"/><rect x="40" y="40" width="1042" height="713" fill="none" stroke="#b45309" stroke-width="2" stroke-dasharray="10 5"/><rect x="50" y="50" width="1022" height="693" fill="none" stroke="#b45309" stroke-width="4"/><circle cx="950" cy="650" r="60" fill="#f59e0b"/><circle cx="950" cy="650" r="50" fill="none" stroke="#78350f" stroke-width="2" stroke-dasharray="4 4"/></svg>')
      },
      {
        id: "acad-oxford",
        name: "Oxford Blue Classic",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><rect x="30" y="30" width="1062" height="733" fill="none" stroke="#1e3a8a" stroke-width="12"/><rect x="45" y="45" width="1032" height="703" fill="none" stroke="#1e3a8a" stroke-width="2"/></svg>')
      },
      {
        id: "acad-ivy",
        name: "Ivy League Green",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><rect x="30" y="30" width="1062" height="733" fill="none" stroke="#14532d" stroke-width="12"/><rect x="45" y="45" width="1032" height="703" fill="none" stroke="#d4af37" stroke-width="2"/></svg>')
      },
      {
        id: "acad-burgundy",
        name: "Burgundy & Gold Traditional",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><rect x="30" y="30" width="1062" height="733" fill="none" stroke="#7f1d1d" stroke-width="12"/><rect x="45" y="45" width="1032" height="703" fill="none" stroke="#d4af37" stroke-width="2"/></svg>')
      }
    ]
  },
  {
    name: "Tech & IT",
    orientation: "landscape",
    items: [
      {
        id: "tech-cyber",
        name: "Cyberpunk Grid",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#020617"/><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0ea5e9" stroke-width="0.5"/></pattern><rect width="100%" height="100%" fill="url(#grid)"/><rect x="40" y="40" width="1042" height="713" fill="none" stroke="#d946ef" stroke-width="4"/></svg>')
      },
      {
        id: "tech-code",
        name: "Code Editor Dark",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#1e1e1e"/><rect x="0" y="0" width="1122" height="40" fill="#2d2d2d"/><circle cx="20" cy="20" r="6" fill="#ff5f56"/><circle cx="40" cy="20" r="6" fill="#ffbd2e"/><circle cx="60" cy="20" r="6" fill="#27c93f"/></svg>')
      },
      {
        id: "tech-circuit",
        name: "Circuit Board",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><path d="M0 100 L100 100 L150 150 L300 150" fill="none" stroke="#22c55e" stroke-width="3"/><circle cx="300" cy="150" r="5" fill="#22c55e"/><path d="M1122 693 L1022 693 L972 643 L822 643" fill="none" stroke="#22c55e" stroke-width="3"/><circle cx="822" cy="643" r="5" fill="#22c55e"/></svg>')
      }
    ]
  },
  {
    name: "Creative & Arts",
    orientation: "landscape",
    items: [
      {
        id: "crea-bauhaus",
        name: "Bauhaus Geometric",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="150" cy="150" r="100" fill="#ef4444"/><rect x="850" y="100" width="150" height="150" fill="#eab308"/><polygon points="100,600 200,750 50,750" fill="#3b82f6"/></svg>')
      },
      {
        id: "crea-wave",
        name: "Abstract Wave",
        url: svgToBase64('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="#ffffff"/><path d="M0 200 Q 280 400 561 200 T 1122 200 L 1122 0 L 0 0 Z" fill="#8b5cf6"/><path d="M0 220 Q 280 420 561 220 T 1122 220 L 1122 0 L 0 0 Z" fill="#a78bfa" opacity="0.5"/></svg>')
      }
    ]
  }
];

const file = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

const startString = 'const PRESET_CATEGORIES = [';
const endIndex = code.indexOf('\\nconst defaultDesign');
const startIndex = code.indexOf(startString);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find PRESET_CATEGORIES block");
    process.exit(1);
}

const newPresetsCode = "const PRESET_CATEGORIES = " + JSON.stringify(presets, null, 2) + ";";

code = code.substring(0, startIndex) + newPresetsCode + code.substring(endIndex);
fs.writeFileSync(file, code);
console.log("Replaced successfully with actual SVGs.");
