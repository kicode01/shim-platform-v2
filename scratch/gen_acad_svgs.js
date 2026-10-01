const fs = require('fs');

const svgToBase64 = (svg) => {
  return "data:image/svg+xml;base64," + Buffer.from(svg.trim()).toString('base64');
};

const items = [
  {
    id: "acad-01",
    name: "Victorian Filigree",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#FFFFF0"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#2B2B2B" stroke-width="2"/>
  <path d="M 40 40 Q 100 100 40 160 Q 100 100 160 40 Z" fill="#2B2B2B"/>
  <path d="M 1082 40 Q 1022 100 1082 160 Q 1022 100 962 40 Z" fill="#2B2B2B"/>
  <path d="M 40 753 Q 100 693 40 633 Q 100 693 160 753 Z" fill="#2B2B2B"/>
  <path d="M 1082 753 Q 1022 693 1082 633 Q 1022 693 962 753 Z" fill="#2B2B2B"/>
  <circle cx="561" cy="700" r="50" fill="#D4AF37"/>
  <circle cx="561" cy="700" r="40" fill="none" stroke="#FFFFF0" stroke-width="2" stroke-dasharray="4 4"/>
</svg>`)
  },
  {
    id: "acad-02",
    name: "Olive Branch Motif",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#355E3B" stroke-width="1"/>
  <!-- Left laurel -->
  <path d="M 80 400 Q 120 300 80 200" fill="none" stroke="#355E3B" stroke-width="2"/>
  <path d="M 80 400 Q 120 500 80 600" fill="none" stroke="#355E3B" stroke-width="2"/>
  <ellipse cx="100" cy="350" rx="20" ry="8" transform="rotate(-30 100 350)" fill="#D4AF37"/>
  <ellipse cx="100" cy="450" rx="20" ry="8" transform="rotate(30 100 450)" fill="#D4AF37"/>
  <!-- Right laurel -->
  <path d="M 1042 400 Q 1002 300 1042 200" fill="none" stroke="#355E3B" stroke-width="2"/>
  <path d="M 1042 400 Q 1002 500 1042 600" fill="none" stroke="#355E3B" stroke-width="2"/>
  <ellipse cx="1022" cy="350" rx="20" ry="8" transform="rotate(30 1022 350)" fill="#D4AF37"/>
  <ellipse cx="1022" cy="450" rx="20" ry="8" transform="rotate(-30 1022 450)" fill="#D4AF37"/>
</svg>`)
  },
  {
    id: "acad-03",
    name: "Gothic Arch Border",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="30" y="30" width="1062" height="733" fill="none" stroke="#000080" stroke-width="4"/>
  <rect x="30" y="30" width="1062" height="60" fill="#000080"/>
  <!-- Gothic arches along top -->
  <path d="M 130 90 L 130 120 Q 155 100 180 120 L 180 90 Z" fill="#D4AF37"/>
  <path d="M 330 90 L 330 120 Q 355 100 380 120 L 380 90 Z" fill="#D4AF37"/>
  <path d="M 530 90 L 530 120 Q 555 100 580 120 L 580 90 Z" fill="#D4AF37"/>
  <path d="M 730 90 L 730 120 Q 755 100 780 120 L 780 90 Z" fill="#D4AF37"/>
  <path d="M 930 90 L 930 120 Q 955 100 980 120 L 980 90 Z" fill="#D4AF37"/>
</svg>`)
  },
  {
    id: "acad-04",
    name: "Simple Double Line",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#FFFDD0"/>
  <rect x="48" y="48" width="1026" height="697" fill="none" stroke="#111111" stroke-width="4"/>
  <rect x="56" y="56" width="1010" height="681" fill="none" stroke="#111111" stroke-width="0.5"/>
  <path d="M 48 100 Q 100 100 100 48" fill="none" stroke="#111111" stroke-width="2"/>
  <path d="M 1074 100 Q 1022 100 1022 48" fill="none" stroke="#111111" stroke-width="2"/>
  <path d="M 48 693 Q 100 693 100 745" fill="none" stroke="#111111" stroke-width="2"/>
  <path d="M 1074 693 Q 1022 693 1022 745" fill="none" stroke="#111111" stroke-width="2"/>
</svg>`)
  },
  {
    id: "acad-05",
    name: "Burgundy & Gold",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="1122" height="793" fill="none" stroke="#800020" stroke-width="90"/>
  <rect x="55" y="55" width="1012" height="683" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <rect x="25" y="25" width="40" height="40" fill="#800020" stroke="#D4AF37" stroke-width="2"/>
  <rect x="1057" y="25" width="40" height="40" fill="#800020" stroke="#D4AF37" stroke-width="2"/>
  <rect x="25" y="728" width="40" height="40" fill="#800020" stroke="#D4AF37" stroke-width="2"/>
  <rect x="1057" y="728" width="40" height="40" fill="#800020" stroke="#D4AF37" stroke-width="2"/>
  <circle cx="45" cy="45" r="10" fill="#D4AF37"/>
  <circle cx="1077" cy="45" r="10" fill="#D4AF37"/>
  <circle cx="45" cy="748" r="10" fill="#D4AF37"/>
  <circle cx="1077" cy="748" r="10" fill="#D4AF37"/>
</svg>`)
  },
  {
    id: "acad-06",
    name: "Ribbon Corner",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#FFFFF0"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#111111" stroke-width="1"/>
  <polygon points="0,0 200,0 0,200" fill="#DC143C"/>
  <polygon points="0,200 60,140 0,160" fill="#8B0000"/>
  <polygon points="200,0 140,60 160,0" fill="#8B0000"/>
</svg>`)
  },
  {
    id: "acad-07",
    name: "Greek Key Pattern",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="1122" height="793" fill="none" stroke="#0B0B0B" stroke-width="60"/>
  <pattern id="greek" width="80" height="60" patternUnits="userSpaceOnUse">
    <path d="M 0 15 L 60 15 L 60 45 L 30 45 L 30 30 L 45 30 L 45 15" fill="none" stroke="#D4AF37" stroke-width="4"/>
  </pattern>
  <rect x="0" y="0" width="1122" height="30" fill="url(#greek)"/>
  <rect x="0" y="763" width="1122" height="30" fill="url(#greek)"/>
  <rect x="25" y="30" width="1072" height="733" fill="none" stroke="#D4AF37" stroke-width="2"/>
</svg>`)
  },
  {
    id: "acad-08",
    name: "Heavy Serif Frame",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="30" y="30" width="1062" height="733" fill="none" stroke="#000080" stroke-width="8"/>
  <rect x="42" y="42" width="1038" height="709" fill="none" stroke="#000080" stroke-width="0.5"/>
  <rect x="48" y="48" width="1026" height="697" fill="none" stroke="#000080" stroke-width="0.5"/>
  <rect x="15" y="15" width="30" height="30" fill="#000080"/>
  <rect x="1077" y="15" width="30" height="30" fill="#000080"/>
  <rect x="15" y="748" width="30" height="30" fill="#000080"/>
  <rect x="1077" y="748" width="30" height="30" fill="#000080"/>
</svg>`)
  },
  {
    id: "acad-09",
    name: "Floral Damask",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#FFFFF0"/>
  <rect x="0" y="0" width="1122" height="793" fill="none" stroke="#F7E7CE" stroke-width="180"/>
  <pattern id="damask" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 30 0 Q 60 30 30 60 Q 0 30 30 0 Z" fill="#EAD4B4"/>
    <circle cx="30" cy="30" r="10" fill="#FFFFF0"/>
  </pattern>
  <rect x="0" y="0" width="1122" height="90" fill="url(#damask)"/>
  <rect x="0" y="703" width="1122" height="90" fill="url(#damask)"/>
  <rect x="0" y="0" width="90" height="793" fill="url(#damask)"/>
  <rect x="1032" y="0" width="90" height="793" fill="url(#damask)"/>
  <rect x="90" y="90" width="942" height="613" fill="none" stroke="#EAD4B4" stroke-width="2"/>
</svg>`)
  },
  {
    id: "acad-10",
    name: "Classic Crest",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#708090" stroke-width="3"/>
  <path d="M 40 40 Q 80 80 40 120 Z" fill="#D4AF37"/>
  <path d="M 1082 40 Q 1042 80 1082 120 Z" fill="#D4AF37"/>
  <path d="M 40 753 Q 80 713 40 673 Z" fill="#D4AF37"/>
  <path d="M 1082 753 Q 1042 713 1082 673 Z" fill="#D4AF37"/>
  <path d="M 521 40 L 561 100 L 601 40 Z" fill="#708090"/>
  <!-- Crest placeholder -->
  <path d="M 521 60 L 601 60 L 601 100 Q 561 140 521 100 Z" fill="#D4AF37"/>
</svg>`)
  }
];

const jsonOut = JSON.stringify(items, null, 6);
fs.writeFileSync('scratch/new_acad_items.txt', jsonOut);
