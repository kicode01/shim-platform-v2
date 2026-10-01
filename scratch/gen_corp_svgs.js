const fs = require('fs');

const svgToBase64 = (svg) => {
  return "data:image/svg+xml;base64," + Buffer.from(svg.trim()).toString('base64');
};

const items = [
  {
    id: "corp-01",
    name: "Swiss International Style",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="841,793 1122,793 1122,200" fill="#0A192F"/>
  <polygon points="900,793 1122,793 1122,400" fill="#D4AF37"/>
  <polygon points="950,793 1122,793 1122,500" fill="#0A192F"/>
</svg>`)
  },
  {
    id: "corp-02",
    name: "Asymmetrical Corporate Edge",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="0,0 200,0 350,793 0,793" fill="#333333"/>
  <polygon points="0,0 100,0 250,793 0,793" fill="#065F46"/>
</svg>`)
  },
  {
    id: "corp-03",
    name: "Minimalist Perimeter Frame",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="30" y="30" width="1062" height="733" fill="none" stroke="#111111" stroke-width="2"/>
  <rect x="30" y="264" width="12" height="264" fill="#D4AF37"/>
</svg>`)
  },
  {
    id: "corp-04",
    name: "Corporate Color Blocking",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="0,793 0,400 1122,700 1122,793" fill="#64748B"/>
  <polygon points="0,793 0,550 1122,793" fill="#991B1B"/>
</svg>`)
  },
  {
    id: "corp-05",
    name: "Architectural Grid",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E4E2" stroke-width="0.5"/>
  </pattern>
  <rect width="100%" height="100%" fill="url(#archGrid)"/>
  <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#B0C4DE" stroke-width="1"/>
  <circle cx="50" cy="50" r="3" fill="#B0C4DE"/>
  <circle cx="1072" cy="50" r="3" fill="#B0C4DE"/>
  <circle cx="50" cy="743" r="3" fill="#B0C4DE"/>
  <circle cx="1072" cy="743" r="3" fill="#B0C4DE"/>
</svg>`)
  },
  {
    id: "corp-06",
    name: "Subtle Monoline Pinstripe",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#CC7722" stroke-width="1"/>
  <rect x="45" y="45" width="1032" height="703" fill="none" stroke="#CC7722" stroke-width="0.25"/>
</svg>`)
  },
  {
    id: "corp-07",
    name: "Tech-Corporate Crossover",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="500,0 1122,0 1122,500" fill="#000080"/>
  <polygon points="700,0 1122,0 1122,300" fill="#007FFF"/>
  <polygon points="900,0 1122,0 1122,150" fill="#00FFFF"/>
</svg>`)
  },
  {
    id: "corp-08",
    name: "Bauhaus Inspired Business",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="700" width="1122" height="93" fill="#36454F"/>
  <rect x="200" y="500" width="150" height="293" fill="#191970"/>
  <circle cx="450" cy="700" r="120" fill="#FFDB58"/>
</svg>`)
  },
  {
    id: "corp-09",
    name: "Diagonal Split Bleed",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="0,634 1122,634 1122,793 0,793" fill="#4B0082"/>
  <line x1="0" y1="626" x2="1122" y2="626" stroke="#C0C0C0" stroke-width="4"/>
</svg>`)
  },
  {
    id: "corp-10",
    name: "The Executive Ribbon",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="50,0 150,0 150,793 50,793" fill="#000080"/>
  <polygon points="50,150 150,200 150,250 50,200" fill="#007BA7"/>
  <polygon points="50,600 150,550 150,500 50,550" fill="#007BA7"/>
</svg>`)
  }
];

const templateFile = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(templateFile, 'utf8');

// The file has a Corporate & Professional block.
// Let's replace the whole PRESET_CATEGORIES block but keeping the other categories.
// I will just construct the JSON and write it to scratch/new_corp_presets.txt so the agent can use replace_file_content.
// Actually, let's write out the new items JSON string.

const jsonOut = JSON.stringify(items, null, 6);
fs.writeFileSync('scratch/new_corp_items.txt', jsonOut);

