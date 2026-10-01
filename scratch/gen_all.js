const fs = require('fs');

const svgToBase64 = (svg) => "data:image/svg+xml;base64," + Buffer.from(svg.trim()).toString('base64');

const creativeArts = [
  {
    id: "crea-01", name: "De Stijl Geometric",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="50" y="50" width="300" height="400" fill="#FF0000"/>
  <rect x="800" y="50" width="250" height="200" fill="#FFFF00"/>
  <rect x="800" y="500" width="200" height="200" fill="#0000FF"/>
  <rect x="50" y="50" width="1000" height="15" fill="#000000"/>
  <rect x="350" y="50" width="15" height="700" fill="#000000"/>
  <rect x="50" y="450" width="1000" height="15" fill="#000000"/>
  <rect x="800" y="50" width="15" height="700" fill="#000000"/>
</svg>`)
  },
  {
    id: "crea-02", name: "Fluid Abstract Expressionism",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 0 L 300 0 Q 300 200 150 250 T 0 400 Z" fill="#FF7F50"/>
  <path d="M 1122 793 L 800 793 Q 750 600 900 500 T 1122 400 Z" fill="#FFDAB9"/>
  <path d="M 0 793 L 200 793 Q 300 650 150 550 T 0 500 Z" fill="#FFD700"/>
</svg>`)
  },
  {
    id: "crea-03", name: "Memphis Milano 80s",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Polka dots -->
  <circle cx="100" cy="100" r="10" fill="#FF00FF"/>
  <circle cx="150" cy="120" r="15" fill="#00FFFF"/>
  <circle cx="900" cy="700" r="20" fill="#FFFF00"/>
  <!-- ZigZags -->
  <polyline points="50,600 100,550 150,600 200,550 250,600" fill="none" stroke="#000000" stroke-width="8"/>
  <polyline points="850,150 900,100 950,150 1000,100 1050,150" fill="none" stroke="#FF00FF" stroke-width="8"/>
  <!-- Squiggles -->
  <path d="M 800 600 Q 850 550 900 600 T 1000 600" fill="none" stroke="#00FFFF" stroke-width="8"/>
  <!-- Shapes -->
  <rect x="500" y="50" width="80" height="80" fill="#FFFF00" transform="rotate(45 540 90)"/>
</svg>`)
  },
  {
    id: "crea-04", name: "Boho Contemporary Abstract",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#FAF9F6"/>
  <path d="M 0 0 L 300 0 A 300 300 0 0 1 0 300 Z" fill="#E2725B"/>
  <path d="M 1122 0 L 822 0 A 300 300 0 0 0 1122 300 Z" fill="#FFDB58"/>
  <path d="M 0 793 L 0 493 A 300 300 0 0 0 300 793 Z" fill="#9DC183"/>
  <path d="M 1122 793 L 1122 493 A 300 300 0 0 1 822 793 Z" fill="#E2725B"/>
</svg>`)
  },
  {
    id: "crea-05", name: "Editorial Color Blocking",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="100" height="793" fill="#000000"/>
  <rect x="1022" y="0" width="100" height="793" fill="#000000"/>
  <rect x="100" y="693" width="922" height="100" fill="#FF3366"/>
  <rect x="150" y="50" width="200" height="50" fill="#000000"/>
</svg>`)
  },
  {
    id: "crea-06", name: "Vector Paint Stroke Illusion",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 50 100 Q 300 50 600 120 T 1050 80 L 1050 150 Q 600 190 300 120 T 50 150 Z" fill="#FF00FF"/>
  <path d="M 50 700 Q 350 750 650 680 T 1050 720 L 1050 650 Q 650 610 350 680 T 50 650 Z" fill="#00FFFF"/>
  <path d="M 50 300 Q 80 450 60 600 L 20 600 Q 40 450 20 300 Z" fill="#FFFF00"/>
  <path d="M 1050 300 Q 1020 450 1040 600 L 1080 600 Q 1060 450 1080 300 Z" fill="#0000FF"/>
</svg>`)
  },
  {
    id: "crea-07", name: "Continuous Monoline Art",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#F5F5DC"/>
  <path d="M 100 793 Q 150 600 100 500 T 200 400 T 100 300 T 250 200 T 100 0" fill="none" stroke="#000000" stroke-width="3"/>
  <path d="M 1022 793 Q 950 600 1000 500 T 900 400 T 1000 300 T 850 200 T 1022 0" fill="none" stroke="#000000" stroke-width="3"/>
</svg>`)
  },
  {
    id: "crea-08", name: "Stained Glass Geometric",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Top Left -->
  <polygon points="0,0 200,0 150,150 0,200" fill="#FF0000" stroke="#000000" stroke-width="4"/>
  <polygon points="200,0 400,0 300,100 150,150" fill="#0000FF" stroke="#000000" stroke-width="4"/>
  <polygon points="0,200 150,150 100,300 0,400" fill="#FFFF00" stroke="#000000" stroke-width="4"/>
  <!-- Bottom Right -->
  <polygon points="1122,793 922,793 972,643 1122,593" fill="#00FF00" stroke="#000000" stroke-width="4"/>
  <polygon points="922,793 722,793 822,693 972,643" fill="#FF00FF" stroke="#000000" stroke-width="4"/>
  <polygon points="1122,593 972,643 1022,493 1122,393" fill="#00FFFF" stroke="#000000" stroke-width="4"/>
</svg>`)
  },
  {
    id: "crea-09", name: "Op-Art Optical Illusion",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g stroke="#000000" stroke-width="10" fill="none">
    <path d="M 0 100 Q 280 200 561 100 T 1122 100"/>
    <path d="M 0 150 Q 280 250 561 150 T 1122 150"/>
    <path d="M 0 200 Q 280 300 561 200 T 1122 200"/>
    
    <path d="M 0 600 Q 280 700 561 600 T 1122 600"/>
    <path d="M 0 650 Q 280 750 561 650 T 1122 650"/>
    <path d="M 0 700 Q 280 800 561 700 T 1122 700"/>
  </g>
</svg>`)
  },
  {
    id: "crea-10", name: "Pop Art Halftone Vector",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="1122" height="150" fill="#FFFF00"/>
  <rect x="0" y="643" width="1122" height="150" fill="#FF00FF"/>
  <!-- Halftone approximation -->
  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="4" fill="#000000"/>
  </pattern>
  <rect x="0" y="0" width="1122" height="150" fill="url(#dots)"/>
  <rect x="0" y="643" width="1122" height="150" fill="url(#dots)"/>
</svg>`)
  }
];

const luxuryPrestige = [
  {
    id: "lux-01", name: "Art Deco Opulence",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#111111"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#D4AF37" stroke-width="4"/>
  <rect x="60" y="60" width="1002" height="673" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <polygon points="60,60 160,60 160,160" fill="#D4AF37"/>
  <polygon points="1062,60 962,60 962,160" fill="#D4AF37"/>
  <polygon points="60,733 160,733 160,633" fill="#D4AF37"/>
  <polygon points="1062,733 962,733 962,633" fill="#D4AF37"/>
</svg>`)
  },
  {
    id: "lux-02", name: "High-Fashion Minimalism",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="80" y="80" width="962" height="633" fill="none" stroke="#B76E79" stroke-width="1"/>
</svg>`)
  },
  {
    id: "lux-03", name: "Monoline Diamond Geometry",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#36454F"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <!-- Diamonds -->
  <polygon points="561,10 590,40 561,70 532,40" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <polygon points="561,723 590,753 561,783 532,753" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <polygon points="10,396.5 40,366.5 70,396.5 40,426.5" fill="none" stroke="#D4AF37" stroke-width="2"/>
  <polygon points="1112,396.5 1082,366.5 1052,396.5 1082,426.5" fill="none" stroke="#D4AF37" stroke-width="2"/>
</svg>`)
  },
  {
    id: "lux-04", name: "Burgundy & Gold Regal",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#800020"/>
  <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#FFD700" stroke-width="2"/>
  <!-- Corner Flourishes -->
  <path d="M 50 150 Q 150 150 150 50" fill="none" stroke="#FFD700" stroke-width="4"/>
  <path d="M 1072 150 Q 972 150 972 50" fill="none" stroke="#FFD700" stroke-width="4"/>
  <path d="M 50 643 Q 150 643 150 743" fill="none" stroke="#FFD700" stroke-width="4"/>
  <path d="M 1072 643 Q 972 643 972 743" fill="none" stroke="#FFD700" stroke-width="4"/>
</svg>`)
  },
  {
    id: "lux-05", name: "Vector Marble Veining",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 100 Q 150 120 200 50 T 400 200 T 700 150 T 1122 300" fill="none" stroke="#E0E0E0" stroke-width="3"/>
  <path d="M 0 500 Q 200 450 300 600 T 800 500 T 1122 700" fill="none" stroke="#E0E0E0" stroke-width="2"/>
  <path d="M 200 0 Q 250 200 150 400 T 300 793" fill="none" stroke="#F5F5F5" stroke-width="4"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#000000" stroke-width="2"/>
</svg>`)
  },
  {
    id: "lux-06", name: "Concentric Golden Frame",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#191970"/>
  <rect x="30" y="30" width="1062" height="733" fill="none" stroke="#D4AF37" stroke-width="3"/>
  <rect x="45" y="45" width="1032" height="703" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
  <rect x="60" y="60" width="1002" height="673" fill="none" stroke="#D4AF37" stroke-width="0.5"/>
</svg>`)
  },
  {
    id: "lux-07", name: "Scalloped Art Nouveau",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 50 50 L 1072 50 Q 1022 100 1072 150 Q 1022 200 1072 250 L 1072 743 L 50 743 Q 100 693 50 643 Q 100 593 50 543 Z" fill="none" stroke="#F7E7CE" stroke-width="6"/>
  <rect x="80" y="80" width="962" height="633" fill="none" stroke="#F7E7CE" stroke-width="1"/>
</svg>`)
  },
  {
    id: "lux-08", name: "Minimalist Shield Emblem",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#000000" stroke-width="6"/>
  <!-- Shield placeholder -->
  <path d="M 511 60 L 611 60 L 611 120 Q 561 180 511 120 Z" fill="#C0C0C0"/>
</svg>`)
  },
  {
    id: "lux-09", name: "Foil Stamp Vector Illusion",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#DAA520" stroke-width="8"/>
  <rect x="65" y="65" width="992" height="663" fill="none" stroke="#B8860B" stroke-width="2"/>
  <!-- Stamp corners -->
  <circle cx="50" cy="50" r="15" fill="#DAA520"/>
  <circle cx="1072" cy="50" r="15" fill="#DAA520"/>
  <circle cx="50" cy="743" r="15" fill="#DAA520"/>
  <circle cx="1072" cy="743" r="15" fill="#DAA520"/>
</svg>`)
  },
  {
    id: "lux-10", name: "The Obsidian Monolith",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <rect x="10" y="10" width="1102" height="773" fill="none" stroke="#FFD700" stroke-width="1"/>
</svg>`)
  }
];

const sportsAthletics = [
  {
    id: "sport-01", name: "Kinetic Chevron Vectors",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="0,0 200,0 350,396.5 200,793 0,793 150,396.5" fill="#000080"/>
  <polygon points="250,0 450,0 600,396.5 450,793 250,793 400,396.5" fill="#FF0000"/>
</svg>`)
  },
  {
    id: "sport-02", name: "Velocity Speed Lines",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="100" width="400" height="15" fill="#FF4500"/>
  <rect x="0" y="150" width="600" height="20" fill="#000000"/>
  <rect x="0" y="200" width="300" height="10" fill="#FF4500"/>
  <rect x="0" y="600" width="800" height="20" fill="#000000"/>
  <rect x="0" y="650" width="500" height="15" fill="#FF4500"/>
</svg>`)
  },
  {
    id: "sport-03", name: "Diagonal Power Blocks",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="0,793 400,793 700,0 300,0" fill="#2C3539"/>
  <polygon points="450,793 550,793 850,0 750,0" fill="#39FF14"/>
</svg>`)
  },
  {
    id: "sport-04", name: "Track & Field Curves",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 200 100 A 300 300 0 0 0 200 693 L 900 693 A 300 300 0 0 0 900 100 Z" fill="none" stroke="#FF0000" stroke-width="20"/>
  <path d="M 200 130 A 270 270 0 0 0 200 663 L 900 663 A 270 270 0 0 0 900 130 Z" fill="none" stroke="#FF0000" stroke-width="5"/>
</svg>`)
  },
  {
    id: "sport-05", name: "Sports Tech Hex-Mesh",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Corner Hexes -->
  <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="#191970"/>
  <polygon points="100,75 150,100 150,150 100,175 50,150 50,100" fill="#FFFF00"/>
  <polygon points="1072,793 1122,768 1122,718 1072,693 1022,718 1022,768" fill="#191970"/>
</svg>`)
  },
  {
    id: "sport-06", name: "Sweeping Nike-esque Swoosh",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 793 L 0 600 Q 400 750 1122 500 L 1122 793 Z" fill="#000080"/>
  <path d="M 0 600 Q 400 750 1122 500 L 1122 450 Q 400 700 0 550 Z" fill="#FFD700"/>
</svg>`)
  },
  {
    id: "sport-07", name: "Geometric Star Integration",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#FF0000" stroke-width="10"/>
  <!-- Stars -->
  <polygon points="50,20 60,40 80,45 65,60 70,80 50,70 30,80 35,60 20,45 40,40" fill="#0000FF"/>
  <polygon points="1072,20 1082,40 1102,45 1087,60 1092,80 1072,70 1052,80 1057,60 1042,45 1062,40" fill="#0000FF"/>
</svg>`)
  },
  {
    id: "sport-08", name: "Extreme Sports Triangles",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="0,0 300,0 150,150" fill="#000000"/>
  <polygon points="300,0 500,0 400,200" fill="#39FF14"/>
  <polygon points="1122,793 822,793 972,643" fill="#000000"/>
  <polygon points="822,793 622,793 722,593" fill="#39FF14"/>
</svg>`)
  },
  {
    id: "sport-09", name: "Trophy Silhouette Pattern",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#D3D3D3" stroke-width="40"/>
  <pattern id="trophies" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 20 10 L 40 10 L 35 30 L 30 40 L 30 50 L 40 50 L 40 60 L 20 60 L 20 50 L 30 50 L 30 40 L 25 30 Z" fill="#A9A9A9"/>
  </pattern>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="url(#trophies)" stroke-width="40"/>
</svg>`)
  },
  {
    id: "sport-10", name: "Varsity Letterman Stripes",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="1122" height="40" fill="#4169E1"/>
  <rect x="0" y="40" width="1122" height="15" fill="#FFD700"/>
  <rect x="0" y="55" width="1122" height="10" fill="#4169E1"/>
  
  <rect x="0" y="723" width="1122" height="10" fill="#4169E1"/>
  <rect x="0" y="738" width="1122" height="15" fill="#FFD700"/>
  <rect x="0" y="753" width="1122" height="40" fill="#4169E1"/>
</svg>`)
  }
];

const medicalHealthcare = [
  {
    id: "med-01", name: "Clinical Swiss Minimalism",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polygon points="50,20 70,20 70,50 100,50 100,70 70,70 70,100 50,100 50,70 20,70 20,50 50,50" fill="#ADD8E6"/>
  <polygon points="1072,693 1092,693 1092,723 1122,723 1122,743 1092,743 1092,773 1072,773 1072,743 1042,743 1042,723 1072,723" fill="#008080"/>
</svg>`)
  },
  {
    id: "med-02", name: "Biophilic Healing Curves",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 793 L 0 600 Q 300 500 600 700 T 1122 650 L 1122 793 Z" fill="#98FF98"/>
  <path d="M 0 793 L 0 650 Q 250 550 500 750 T 1122 700 L 1122 793 Z" fill="#F5FFFA"/>
</svg>`)
  },
  {
    id: "med-03", name: "Vector EKG Rhythm Line",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polyline points="0,600 200,600 220,580 240,650 270,500 300,600 1122,600" fill="none" stroke="#FF0000" stroke-width="4"/>
</svg>`)
  },
  {
    id: "med-04", name: "Sterile Geometric Capsule",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="50" y="50" width="1022" height="693" rx="100" ry="100" fill="none" stroke="#008080" stroke-width="10"/>
  <rect x="65" y="65" width="992" height="663" rx="85" ry="85" fill="none" stroke="#D3D3D3" stroke-width="5"/>
</svg>`)
  },
  {
    id: "med-05", name: "Stylized DNA Helix",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Simplified DNA wave -->
  <path d="M 50 0 Q 150 100 50 200 T 50 400 T 50 600 T 50 793" fill="none" stroke="#4682B4" stroke-width="8"/>
  <path d="M 150 0 Q 50 100 150 200 T 150 400 T 150 600 T 150 793" fill="none" stroke="#87CEEB" stroke-width="8"/>
  <line x1="50" y1="100" x2="150" y2="100" stroke="#B0C4DE" stroke-width="4"/>
  <line x1="50" y1="300" x2="150" y2="300" stroke="#B0C4DE" stroke-width="4"/>
  <line x1="50" y1="500" x2="150" y2="500" stroke="#B0C4DE" stroke-width="4"/>
  <line x1="50" y1="700" x2="150" y2="700" stroke="#B0C4DE" stroke-width="4"/>
</svg>`)
  },
  {
    id: "med-06", name: "Pharmaceutical Color Blocks",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="100" y="700" width="150" height="60" rx="30" ry="30" fill="#B0E0E6"/>
  <rect x="280" y="700" width="200" height="60" rx="30" ry="30" fill="#87CEFA"/>
  <rect x="510" y="700" width="100" height="60" rx="30" ry="30" fill="#4682B4"/>
  <rect x="640" y="700" width="250" height="60" rx="30" ry="30" fill="#B0C4DE"/>
</svg>`)
  },
  {
    id: "med-07", name: "Minimalist Caduceus Emblem",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#2F4F4F" stroke-width="2"/>
  <circle cx="561" cy="150" r="50" fill="none" stroke="#2F4F4F" stroke-width="4"/>
  <!-- Staff placeholder -->
  <line x1="561" y1="120" x2="561" y2="180" stroke="#2F4F4F" stroke-width="4"/>
</svg>`)
  },
  {
    id: "med-08", name: "Mental Health Soft Vectors",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <circle cx="200" cy="200" r="150" fill="#E6E6FA"/>
  <circle cx="900" cy="600" r="250" fill="#F0F8FF"/>
</svg>`)
  },
  {
    id: "med-09", name: "Emergency Response Contrast",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="0" y="0" width="1122" height="50" fill="#FF0000"/>
  <rect x="0" y="743" width="1122" height="50" fill="#FF0000"/>
  <rect x="0" y="50" width="50" height="693" fill="#FF0000"/>
  <rect x="1072" y="50" width="50" height="693" fill="#FF0000"/>
</svg>`)
  },
  {
    id: "med-10", name: "Modern Medical Architecture",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="50" y="50" width="200" height="693" fill="#F5F5F5"/>
  <rect x="250" y="50" width="10" height="693" fill="#89CFF0"/>
  <rect x="50" y="50" width="1022" height="150" fill="#F5F5F5"/>
  <rect x="50" y="200" width="1022" height="10" fill="#89CFF0"/>
</svg>`)
  }
];

const kidsEarlyLearning = [
  {
    id: "kid-01", name: "Playful Scalloped Edge",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 50 A 50 50 0 0 1 100 50 A 50 50 0 0 1 200 50 A 50 50 0 0 1 300 50 A 50 50 0 0 1 400 50 A 50 50 0 0 1 500 50 A 50 50 0 0 1 600 50 A 50 50 0 0 1 700 50 A 50 50 0 0 1 800 50 A 50 50 0 0 1 900 50 A 50 50 0 0 1 1000 50 A 50 50 0 0 1 1100 50 L 1122 50 L 1122 0 L 0 0 Z" fill="#00FFFF"/>
  <path d="M 0 743 A 50 50 0 0 0 100 743 A 50 50 0 0 0 200 743 A 50 50 0 0 0 300 743 A 50 50 0 0 0 400 743 A 50 50 0 0 0 500 743 A 50 50 0 0 0 600 743 A 50 50 0 0 0 700 743 A 50 50 0 0 0 800 743 A 50 50 0 0 0 900 743 A 50 50 0 0 0 1000 743 A 50 50 0 0 0 1100 743 L 1122 743 L 1122 793 L 0 793 Z" fill="#FF00FF"/>
</svg>`)
  },
  {
    id: "kid-02", name: "Naive Art Sky Vector",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ADD8E6"/>
  <path d="M 100 100 Q 150 50 200 100 Q 250 50 300 100 Q 300 150 250 200 Q 150 200 100 150 Q 50 150 100 100 Z" fill="#ffffff"/>
  <path d="M 800 150 Q 850 100 900 150 Q 950 100 1000 150 Q 1000 200 950 250 Q 850 250 800 200 Q 750 200 800 150 Z" fill="#ffffff"/>
  <polygon points="500,50 520,100 580,100 530,130 550,180 500,150 450,180 470,130 420,100 480,100" fill="#FFFF00"/>
</svg>`)
  },
  {
    id: "kid-03", name: "Crayon Zig-Zag Vector",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <polyline points="0,50 100,100 200,50 300,100 400,50 500,100 600,50 700,100 800,50 900,100 1000,50 1122,100" fill="none" stroke="#FF0000" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <polyline points="0,743 100,693 200,743 300,693 400,743 500,693 600,743 700,693 800,743 900,693 1000,743 1122,693" fill="none" stroke="#0000FF" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
  },
  {
    id: "kid-04", name: "Flat Confetti Explosion",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <circle cx="50" cy="50" r="10" fill="#FF0000"/>
  <rect x="80" y="30" width="15" height="15" fill="#00FF00" transform="rotate(45 87 37)"/>
  <circle cx="120" cy="80" r="8" fill="#0000FF"/>
  <rect x="40" y="100" width="20" height="8" fill="#FFFF00" transform="rotate(30 50 104)"/>
  
  <circle cx="1072" cy="743" r="10" fill="#FF00FF"/>
  <rect x="1020" y="700" width="15" height="15" fill="#00FFFF" transform="rotate(15 1027 707)"/>
  <circle cx="980" cy="760" r="12" fill="#FFA500"/>
</svg>`)
  },
  {
    id: "kid-05", name: "Geometric Jungle Safari",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 0 Q 100 100 0 200 Z" fill="#32CD32"/>
  <path d="M 200 0 Q 100 100 300 100 Z" fill="#228B22"/>
  <path d="M 1122 793 Q 1022 693 1122 593 Z" fill="#32CD32"/>
  <path d="M 922 793 Q 1022 693 822 693 Z" fill="#228B22"/>
</svg>`)
  },
  {
    id: "kid-06", name: "Flat Vector Cosmos",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#000080"/>
  <circle cx="150" cy="150" r="50" fill="#FFA500"/>
  <ellipse cx="150" cy="150" rx="80" ry="20" fill="none" stroke="#FFD700" stroke-width="5" transform="rotate(30 150 150)"/>
  
  <!-- Rocket -->
  <path d="M 900 600 L 930 650 L 870 650 Z" fill="#FF0000"/>
  <path d="M 900 500 Q 930 550 900 600 Q 870 550 900 500 Z" fill="#FFFFFF"/>
</svg>`)
  },
  {
    id: "kid-07", name: "Toy Building Blocks",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Simplified top down blocks -->
  <rect x="0" y="0" width="100" height="50" fill="#FF0000"/>
  <circle cx="25" cy="25" r="15" fill="#CC0000"/>
  <circle cx="75" cy="25" r="15" fill="#CC0000"/>
  
  <rect x="100" y="0" width="50" height="50" fill="#0000FF"/>
  <circle cx="125" cy="25" r="15" fill="#0000CC"/>
  
  <rect x="150" y="0" width="100" height="50" fill="#FFFF00"/>
  <circle cx="175" cy="25" r="15" fill="#CCCC00"/>
  <circle cx="225" cy="25" r="15" fill="#CCCC00"/>
</svg>`)
  },
  {
    id: "kid-08", name: "Vector Bunting Flags",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 50 Q 280 150 561 50 T 1122 50" fill="none" stroke="#000000" stroke-width="2"/>
  <polygon points="100,80 150,80 125,150" fill="#FF0000"/>
  <polygon points="200,95 250,95 225,165" fill="#00FF00"/>
  <polygon points="300,105 350,105 325,175" fill="#0000FF"/>
  <polygon points="400,100 450,100 425,170" fill="#FFFF00"/>
</svg>`)
  },
  {
    id: "kid-09", name: "Stylized Flat Ocean",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path d="M 0 700 Q 150 650 300 700 T 600 700 T 900 700 T 1122 700 L 1122 793 L 0 793 Z" fill="#87CEEB"/>
  <path d="M 0 750 Q 200 700 400 750 T 800 750 T 1122 750 L 1122 793 L 0 793 Z" fill="#00BFFF"/>
</svg>`)
  },
  {
    id: "kid-10", name: "Vector Animal Tracks",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Paw print 1 -->
  <g transform="translate(100, 100) rotate(45)">
    <circle cx="30" cy="30" r="20" fill="#8B4513"/>
    <circle cx="10" cy="5" r="8" fill="#8B4513"/>
    <circle cx="30" cy="-5" r="8" fill="#8B4513"/>
    <circle cx="50" cy="5" r="8" fill="#8B4513"/>
  </g>
  <!-- Paw print 2 -->
  <g transform="translate(200, 50) rotate(70)">
    <circle cx="30" cy="30" r="20" fill="#8B4513"/>
    <circle cx="10" cy="5" r="8" fill="#8B4513"/>
    <circle cx="30" cy="-5" r="8" fill="#8B4513"/>
    <circle cx="50" cy="5" r="8" fill="#8B4513"/>
  </g>
</svg>`)
  }
];

const allData = {
  creativeArts, luxuryPrestige, sportsAthletics, medicalHealthcare, kidsEarlyLearning
};

fs.writeFileSync('scratch/all_others.json', JSON.stringify(allData, null, 2));
