const fs = require('fs');

const svgToBase64 = (svg) => "data:image/svg+xml;base64," + Buffer.from(svg.trim()).toString('base64');

// Helper to wrap SVG
const makeSvg = (content, bg = "#ffffff") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793"><rect width="100%" height="100%" fill="${bg}"/>${content}</svg>`;

// --- COMPONENT GENERATORS ---

function artDecoBorders(color, bg) {
  // Complex nested borders for luxury
  return `
    <rect x="30" y="30" width="1062" height="733" fill="none" stroke="${color}" stroke-width="1"/>
    <rect x="40" y="40" width="1042" height="713" fill="none" stroke="${color}" stroke-width="3"/>
    <rect x="50" y="50" width="1022" height="693" fill="none" stroke="${color}" stroke-width="1"/>
    <!-- Corners -->
    <path d="M 40 100 L 100 40 M 40 120 L 120 40 M 1082 100 L 1022 40 M 1082 120 L 1002 40" fill="none" stroke="${color}" stroke-width="2"/>
    <path d="M 40 693 L 100 753 M 40 673 L 120 753 M 1082 693 L 1022 753 M 1082 673 L 1002 753" fill="none" stroke="${color}" stroke-width="2"/>
    <!-- Inner diamond accents -->
    <polygon points="70,70 85,55 100,70 85,85" fill="${color}"/>
    <polygon points="1052,70 1067,55 1037,55 1052,70" fill="none" stroke="${color}"/>
  `;
}

function fluidWaves(colors) {
  // Overlapping bezier curves
  return `
    <path d="M 0 400 C 300 300, 600 600, 1122 200 L 1122 793 L 0 793 Z" fill="${colors[0]}" opacity="0.8"/>
    <path d="M 0 500 C 400 300, 800 700, 1122 400 L 1122 793 L 0 793 Z" fill="${colors[1]}" opacity="0.8"/>
    <path d="M 0 600 C 500 400, 700 800, 1122 500 L 1122 793 L 0 793 Z" fill="${colors[2]}" opacity="0.8"/>
  `;
}

function techGrid(color1, color2) {
  return `
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${color1}" stroke-width="0.5" opacity="0.3"/>
    </pattern>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <path d="M 0 793 L 300 493 L 500 693 L 800 393 L 1122 715 L 1122 793 Z" fill="${color2}" opacity="0.1"/>
    <path d="M 0 793 L 300 493 L 500 693 L 800 393 L 1122 715" fill="none" stroke="${color2}" stroke-width="3"/>
    <!-- Nodes -->
    <circle cx="300" cy="493" r="6" fill="${color1}"/>
    <circle cx="500" cy="693" r="6" fill="${color1}"/>
    <circle cx="800" cy="393" r="6" fill="${color1}"/>
  `;
}

function geometricBlocks(colors) {
  return `
    <rect x="0" y="0" width="150" height="793" fill="${colors[0]}"/>
    <rect x="150" y="0" width="50" height="793" fill="${colors[1]}"/>
    <rect x="100" y="650" width="900" height="80" fill="${colors[2]}"/>
    <rect x="250" y="80" width="100" height="100" fill="${colors[1]}"/>
  `;
}

function sportChevrons(c1, c2) {
  return `
    <polygon points="0,0 250,0 450,396.5 250,793 0,793 200,396.5" fill="${c1}"/>
    <polygon points="280,0 480,0 680,396.5 480,793 280,793 480,396.5" fill="${c2}" opacity="0.8"/>
    <polygon points="510,0 610,0 810,396.5 610,793 510,793 710,396.5" fill="${c1}" opacity="0.5"/>
  `;
}

function scallopedBorder(color) {
  let path = 'M 40 40 ';
  for (let x = 40; x < 1082; x += 40) {
    path += `Q ${x + 20} 20 ${x + 40} 40 `;
  }
  for (let y = 40; y < 753; y += 40) {
    path += `Q 1102 ${y + 20} 1082 ${y + 40} `;
  }
  for (let x = 1082; x > 40; x -= 40) {
    path += `Q ${x - 20} 773 ${x - 40} 753 `;
  }
  for (let y = 753; y > 40; y -= 40) {
    path += `Q 20 ${y - 20} 40 ${y - 40} `;
  }
  return `<path d="${path}" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`;
}

function confettiAndBalloons() {
  let svg = '';
  const colors = ['#FF3B30', '#4CD964', '#007AFF', '#FFCC00', '#FF9500', '#5856D6'];
  for(let i=0; i<60; i++) {
    let cx = Math.random() * 1122;
    let cy = Math.random() * 793;
    let r = Math.random() * 8 + 4;
    let c = colors[Math.floor(Math.random() * colors.length)];
    if (i % 3 === 0) {
      svg += `<rect x="${cx}" y="${cy}" width="${r*2}" height="${r*2}" fill="${c}" transform="rotate(${Math.random()*90} ${cx} ${cy})"/>`;
    } else {
      svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
    }
  }
  return svg;
}

function medicalWaves(c1, c2) {
  return `
    <rect x="50" y="50" width="1022" height="693" rx="30" ry="30" fill="none" stroke="${c1}" stroke-width="4"/>
    <path d="M 50 650 Q 300 550 561 650 T 1072 650 L 1072 713 Q 561 750 50 713 Z" fill="${c2}" opacity="0.5"/>
    <path d="M 50 680 Q 300 600 561 680 T 1072 680 L 1072 743 L 50 743 Z" fill="${c1}" opacity="0.3"/>
  `;
}

function ekgLine(color) {
  return `<polyline points="50,650 200,650 220,620 240,700 260,550 280,680 300,650 1072,650" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>`;
}

function opArt(c1, c2) {
  let svg = '';
  for(let i=0; i<15; i++) {
    let y = 100 + i*40;
    let wave = i % 2 === 0 ? 50 : -50;
    svg += `<path d="M 0 ${y} Q 280 ${y + wave} 561 ${y} T 1122 ${y}" fill="none" stroke="${c1}" stroke-width="${4 + i%3}"/>`;
  }
  return svg;
}

function luxuryGuilloche(color) {
  let svg = '<g stroke="' + color + '" stroke-width="0.5" fill="none">';
  for (let i = 0; i < 360; i += 15) {
    svg += `<ellipse cx="100" cy="100" rx="60" ry="20" transform="rotate(${i} 100 100)"/>`;
    svg += `<ellipse cx="1022" cy="100" rx="60" ry="20" transform="rotate(${i} 1022 100)"/>`;
    svg += `<ellipse cx="100" cy="693" rx="60" ry="20" transform="rotate(${i} 100 693)"/>`;
    svg += `<ellipse cx="1022" cy="693" rx="60" ry="20" transform="rotate(${i} 1022 693)"/>`;
  }
  svg += '</g>';
  svg += `<rect x="100" y="100" width="922" height="593" fill="none" stroke="${color}" stroke-width="2"/>`;
  svg += `<rect x="90" y="90" width="942" height="613" fill="none" stroke="${color}" stroke-width="0.5"/>`;
  return svg;
}

function synthwave() {
  let svg = `<rect width="100%" height="100%" fill="#1a0b2e"/>`;
  svg += `<path d="M 561 350 A 150 150 0 0 1 711 500 L 411 500 A 150 150 0 0 1 561 350 Z" fill="url(#sunGrad)"/>`; // using solid slices instead
  // solid slices
  svg += `<clipPath id="sunClip"><path d="M 561 250 A 200 200 0 0 1 761 450 L 361 450 A 200 200 0 0 1 561 250 Z"/></clipPath>`;
  svg += `<g clip-path="url(#sunClip)"><rect x="300" y="250" width="500" height="200" fill="#FF007F"/>`;
  for(let i=0; i<10; i++) {
    svg += `<rect x="300" y="${350 + i*15}" width="500" height="${5 + i*2}" fill="#1a0b2e"/>`;
  }
  svg += `</g>`;
  // Grid
  svg += `<path d="M 0 500 L 1122 500 M 0 550 L 1122 550 M 0 620 L 1122 620 M 0 710 L 1122 710 M 0 820 L 1122 820" fill="none" stroke="#00F0FF" stroke-width="2"/>`;
  for(let i=-5; i<6; i++) {
    svg += `<line x1="561" y1="500" x2="${561 + i*300}" y2="850" stroke="#00F0FF" stroke-width="2"/>`;
  }
  return svg;
}


const creativeArts = [
  { id: "crea-01", name: "De Stijl Geometric", url: svgToBase64(makeSvg(geometricBlocks(["#FF0000", "#000000", "#0000FF", "#FFFF00"]), "#ffffff")) },
  { id: "crea-02", name: "Fluid Abstract Expressionism", url: svgToBase64(makeSvg(fluidWaves(["#FF7F50", "#FFDAB9", "#FFD700"]), "#FFF5EE")) },
  { id: "crea-03", name: "Memphis Milano 80s", url: svgToBase64(makeSvg(`
    <circle cx="150" cy="150" r="80" fill="#FF00FF"/>
    <rect x="850" y="100" width="120" height="120" fill="#00FFFF" transform="rotate(30 910 160)"/>
    <path d="M 50 650 Q 150 550 250 650 T 450 650" fill="none" stroke="#000000" stroke-width="15"/>
    <polygon points="900,600 1000,500 1050,700" fill="#FFFF00"/>
    <pattern id="memdots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="4" fill="#000000"/></pattern>
    <rect x="50" y="50" width="200" height="200" fill="url(#memdots)" opacity="0.2"/>
  `, "#FAFAFA")) },
  { id: "crea-04", name: "Boho Contemporary Abstract", url: svgToBase64(makeSvg(`
    <path d="M 0 0 L 400 0 A 400 400 0 0 1 0 400 Z" fill="#E2725B"/>
    <path d="M 1122 793 L 622 793 A 500 500 0 0 1 1122 293 Z" fill="#9DC183"/>
    <circle cx="800" cy="200" r="150" fill="#FFDB58"/>
    <path d="M 0 793 L 300 793 A 300 300 0 0 0 0 493 Z" fill="#F4A460"/>
  `, "#FAF9F6")) },
  { id: "crea-05", name: "Editorial Color Blocking", url: svgToBase64(makeSvg(`
    <rect x="0" y="0" width="300" height="793" fill="#000000"/>
    <rect x="300" y="0" width="822" height="150" fill="#000000"/>
    <rect x="250" y="100" width="200" height="600" fill="#FF3366"/>
    <rect x="500" y="700" width="622" height="93" fill="#000000"/>
  `, "#ffffff")) },
  { id: "crea-06", name: "Vector Paint Stroke Illusion", url: svgToBase64(makeSvg(`
    <path d="M 0 100 Q 400 50 600 200 T 1122 150 L 1122 50 L 0 50 Z" fill="#FF1493"/>
    <path d="M 0 130 Q 300 100 500 250 T 1122 180 L 1122 150 Q 500 220 300 70 Z" fill="#00BFFF"/>
    <path d="M 0 793 L 0 650 Q 500 750 800 600 T 1122 700 L 1122 793 Z" fill="#FFD700"/>
  `, "#ffffff")) },
  { id: "crea-07", name: "Continuous Monoline Art", url: svgToBase64(makeSvg(`
    <path d="M 50 50 Q 150 50 150 150 T 250 150 T 250 250 T 350 250 T 350 350 T 450 350" fill="none" stroke="#000000" stroke-width="2"/>
    <path d="M 1072 743 Q 972 743 972 643 T 872 643 T 872 543 T 772 543 T 772 443" fill="none" stroke="#000000" stroke-width="2"/>
    <circle cx="561" cy="396.5" r="300" fill="none" stroke="#000000" stroke-width="1"/>
  `, "#F5F5DC")) },
  { id: "crea-08", name: "Stained Glass Geometric", url: svgToBase64(makeSvg(`
    <polygon points="0,0 200,0 150,150 0,250" fill="#FF0055" stroke="#000" stroke-width="5"/>
    <polygon points="200,0 400,0 250,200 150,150" fill="#0055FF" stroke="#000" stroke-width="5"/>
    <polygon points="400,0 600,0 450,150 250,200" fill="#FFDD00" stroke="#000" stroke-width="5"/>
    <polygon points="0,250 150,150 250,200 100,400 0,500" fill="#00DD55" stroke="#000" stroke-width="5"/>
    
    <polygon points="1122,793 922,793 972,643 1122,543" fill="#FF0055" stroke="#000" stroke-width="5"/>
    <polygon points="922,793 722,793 872,593 972,643" fill="#0055FF" stroke="#000" stroke-width="5"/>
  `, "#ffffff")) },
  { id: "crea-09", name: "Op-Art Optical Illusion", url: svgToBase64(makeSvg(opArt("#000000", "#ffffff"), "#ffffff")) },
  { id: "crea-10", name: "Pop Art Halftone Vector", url: svgToBase64(makeSvg(`
    <pattern id="ht" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="5" fill="#000"/></pattern>
    <rect width="100%" height="100%" fill="url(#ht)" opacity="0.1"/>
    <rect x="0" y="0" width="1122" height="120" fill="#FFFF00" stroke="#000" stroke-width="8"/>
    <rect x="0" y="673" width="1122" height="120" fill="#FF00FF" stroke="#000" stroke-width="8"/>
    <polygon points="50,100 200,100 250,150 100,150" fill="#00FFFF" stroke="#000" stroke-width="6"/>
  `, "#ffffff")) },
];

const luxuryPrestige = [
  { id: "lux-01", name: "Art Deco Opulence", url: svgToBase64(makeSvg(artDecoBorders("#D4AF37", "#111111"), "#111111")) },
  { id: "lux-02", name: "High-Fashion Minimalism", url: svgToBase64(makeSvg(`
    <rect x="60" y="60" width="1002" height="673" fill="none" stroke="#B76E79" stroke-width="1"/>
    <rect x="80" y="80" width="962" height="633" fill="none" stroke="#B76E79" stroke-width="0.5"/>
    <line x1="561" y1="80" x2="561" y2="120" stroke="#B76E79" stroke-width="1"/>
    <line x1="561" y1="673" x2="561" y2="713" stroke="#B76E79" stroke-width="1"/>
  `, "#ffffff")) },
  { id: "lux-03", name: "Monoline Diamond Geometry", url: svgToBase64(makeSvg(`
    <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#D4AF37" stroke-width="2"/>
    <pattern id="diamond" width="40" height="40" patternUnits="userSpaceOnUse">
      <polygon points="20,0 40,20 20,40 0,20" fill="none" stroke="#4A4A4A" stroke-width="1"/>
    </pattern>
    <rect x="50" y="50" width="1022" height="693" fill="url(#diamond)"/>
    <rect x="80" y="80" width="962" height="633" fill="#2C3539" stroke="#D4AF37" stroke-width="3"/>
  `, "#2C3539")) },
  { id: "lux-04", name: "Burgundy & Gold Regal", url: svgToBase64(makeSvg(`
    <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#FFD700" stroke-width="3"/>
    <rect x="60" y="60" width="1002" height="673" fill="none" stroke="#FFD700" stroke-width="1"/>
    <path d="M 50 150 Q 150 150 150 50 M 50 160 Q 160 160 160 50" fill="none" stroke="#FFD700" stroke-width="2"/>
    <path d="M 1072 150 Q 972 150 972 50 M 1072 160 Q 962 160 962 50" fill="none" stroke="#FFD700" stroke-width="2"/>
    <path d="M 50 643 Q 150 643 150 743 M 50 633 Q 160 633 160 743" fill="none" stroke="#FFD700" stroke-width="2"/>
    <path d="M 1072 643 Q 972 643 972 743 M 1072 633 Q 962 633 962 743" fill="none" stroke="#FFD700" stroke-width="2"/>
  `, "#600018")) },
  { id: "lux-05", name: "Vector Marble Veining", url: svgToBase64(makeSvg(`
    <path d="M 0 200 Q 300 250 400 100 T 800 300 T 1122 250" fill="none" stroke="#E8E8E8" stroke-width="4"/>
    <path d="M 0 500 Q 200 400 400 600 T 900 500 T 1122 700" fill="none" stroke="#E8E8E8" stroke-width="3"/>
    <path d="M 300 0 Q 350 300 200 500 T 400 793" fill="none" stroke="#F0F0F0" stroke-width="5"/>
    <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#111111" stroke-width="3"/>
  `, "#FAFAFA")) },
  { id: "lux-06", name: "Concentric Golden Frame", url: svgToBase64(makeSvg(`
    <rect x="30" y="30" width="1062" height="733" fill="none" stroke="#D4AF37" stroke-width="4"/>
    <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#D4AF37" stroke-width="2"/>
    <rect x="55" y="55" width="1012" height="683" fill="none" stroke="#D4AF37" stroke-width="1"/>
    <rect x="75" y="75" width="972" height="643" fill="none" stroke="#D4AF37" stroke-width="0.5"/>
    <rect x="100" y="100" width="922" height="593" fill="none" stroke="#D4AF37" stroke-width="0.25"/>
  `, "#0C1445")) },
  { id: "lux-07", name: "Scalloped Art Nouveau", url: svgToBase64(makeSvg(scallopedBorder("#E5D08F"), "#ffffff")) },
  { id: "lux-08", name: "Guilloche Excellence", url: svgToBase64(makeSvg(luxuryGuilloche("#D4AF37"), "#1A1A1A")) },
  { id: "lux-09", name: "Foil Stamp Vector Illusion", url: svgToBase64(makeSvg(`
    <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#DAA520" stroke-width="10"/>
    <rect x="62" y="62" width="998" height="669" fill="none" stroke="#B8860B" stroke-width="4"/>
    <rect x="70" y="70" width="982" height="653" fill="none" stroke="#FFF8DC" stroke-width="2"/>
    <circle cx="50" cy="50" r="25" fill="#DAA520"/>
    <circle cx="50" cy="50" r="15" fill="#B8860B"/>
    <circle cx="1072" cy="50" r="25" fill="#DAA520"/>
    <circle cx="1072" cy="50" r="15" fill="#B8860B"/>
    <circle cx="50" cy="743" r="25" fill="#DAA520"/>
    <circle cx="50" cy="743" r="15" fill="#B8860B"/>
    <circle cx="1072" cy="743" r="25" fill="#DAA520"/>
    <circle cx="1072" cy="743" r="15" fill="#B8860B"/>
  `, "#ffffff")) },
  { id: "lux-10", name: "The Obsidian Monolith", url: svgToBase64(makeSvg(`
    <rect x="15" y="15" width="1092" height="763" fill="none" stroke="#FFD700" stroke-width="1"/>
    <rect x="25" y="25" width="1072" height="743" fill="none" stroke="#FFD700" stroke-width="0.5" opacity="0.5"/>
    <circle cx="561" cy="743" r="40" fill="#050505" stroke="#FFD700" stroke-width="1"/>
    <circle cx="561" cy="743" r="30" fill="none" stroke="#FFD700" stroke-width="0.5"/>
  `, "#050505")) },
];

const sportsAthletics = [
  { id: "sport-01", name: "Kinetic Chevron Vectors", url: svgToBase64(makeSvg(sportChevrons("#E32636", "#000080"), "#ffffff")) },
  { id: "sport-02", name: "Velocity Speed Lines", url: svgToBase64(makeSvg(`
    <g fill="#FF4500">
      <rect x="0" y="100" width="600" height="20" transform="skewX(-45)"/>
      <rect x="0" y="140" width="450" height="15" transform="skewX(-45)"/>
      <rect x="0" y="175" width="800" height="25" transform="skewX(-45)"/>
      <rect x="0" y="600" width="700" height="25" transform="skewX(-45)"/>
      <rect x="0" y="645" width="400" height="15" transform="skewX(-45)"/>
    </g>
    <g fill="#111111">
      <rect x="0" y="115" width="500" height="10" transform="skewX(-45)"/>
      <rect x="0" y="160" width="750" height="10" transform="skewX(-45)"/>
      <rect x="0" y="615" width="850" height="10" transform="skewX(-45)"/>
    </g>
  `, "#F5F5F5")) },
  { id: "sport-03", name: "Diagonal Power Blocks", url: svgToBase64(makeSvg(`
    <polygon points="0,793 500,793 800,0 300,0" fill="#1C1C1C"/>
    <polygon points="550,793 650,793 950,0 850,0" fill="#39FF14"/>
    <polygon points="700,793 750,793 1050,0 1000,0" fill="#1C1C1C"/>
  `, "#ffffff")) },
  { id: "sport-04", name: "Track & Field Curves", url: svgToBase64(makeSvg(`
    <path d="M 300 150 A 246.5 246.5 0 0 0 300 643 L 822 643 A 246.5 246.5 0 0 0 822 150 Z" fill="none" stroke="#D32F2F" stroke-width="40"/>
    <path d="M 300 150 A 246.5 246.5 0 0 0 300 643 L 822 643 A 246.5 246.5 0 0 0 822 150 Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="20 20"/>
    <path d="M 300 110 A 286.5 286.5 0 0 0 300 683 L 822 683 A 286.5 286.5 0 0 0 822 110 Z" fill="none" stroke="#D32F2F" stroke-width="10"/>
  `, "#ffffff")) },
  { id: "sport-05", name: "Sports Tech Hex-Mesh", url: svgToBase64(makeSvg(`
    <pattern id="hex" width="30" height="51.96" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
      <path d="M 15 0 L 30 8.66 L 30 25.98 L 15 34.64 L 0 25.98 L 0 8.66 Z" fill="none" stroke="#FFFF00" stroke-width="1"/>
    </pattern>
    <polygon points="0,0 400,0 0,400" fill="#001F3F"/>
    <polygon points="1122,793 722,793 1122,393" fill="#001F3F"/>
    <polygon points="0,0 400,0 0,400" fill="url(#hex)"/>
    <polygon points="1122,793 722,793 1122,393" fill="url(#hex)"/>
  `, "#ffffff")) },
  { id: "sport-06", name: "Sweeping Nike-esque Swoosh", url: svgToBase64(makeSvg(`
    <path d="M -100 700 Q 300 900 1200 400 L 1200 793 L -100 793 Z" fill="#000080"/>
    <path d="M -100 650 Q 400 950 1200 350 L 1200 400 Q 300 900 -100 700 Z" fill="#FFD700"/>
  `, "#ffffff")) },
  { id: "sport-07", name: "Geometric Star Integration", url: svgToBase64(makeSvg(`
    <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#E53935" stroke-width="12"/>
    <g transform="translate(50, 50) scale(1.5)">
      <polygon points="0,-20 5.88,-6.18 19.02,-6.18 8.57,2.35 12.36,16.18 0,8.53 -12.36,16.18 -8.57,2.35 -19.02,-6.18 -5.88,-6.18" fill="#1E88E5"/>
    </g>
    <g transform="translate(1072, 50) scale(1.5)">
      <polygon points="0,-20 5.88,-6.18 19.02,-6.18 8.57,2.35 12.36,16.18 0,8.53 -12.36,16.18 -8.57,2.35 -19.02,-6.18 -5.88,-6.18" fill="#1E88E5"/>
    </g>
    <g transform="translate(561, 743) scale(2)">
      <polygon points="0,-20 5.88,-6.18 19.02,-6.18 8.57,2.35 12.36,16.18 0,8.53 -12.36,16.18 -8.57,2.35 -19.02,-6.18 -5.88,-6.18" fill="#FFB300"/>
    </g>
  `, "#ffffff")) },
  { id: "sport-08", name: "Extreme Sports Triangles", url: svgToBase64(makeSvg(`
    <polygon points="0,0 400,0 200,200" fill="#111"/>
    <polygon points="400,0 700,0 550,300" fill="#39FF14"/>
    <polygon points="700,0 1122,0 900,250" fill="#111"/>
    <polygon points="0,793 300,793 150,550" fill="#39FF14"/>
    <polygon points="300,793 800,793 550,450" fill="#111"/>
    <polygon points="800,793 1122,793 1000,600" fill="#39FF14"/>
  `, "#ffffff")) },
  { id: "sport-09", name: "Synthwave Cyber Athletics", url: svgToBase64(makeSvg(synthwave(), "#1a0b2e")) },
  { id: "sport-10", name: "Varsity Letterman Stripes", url: svgToBase64(makeSvg(`
    <rect x="0" y="0" width="1122" height="60" fill="#002366"/>
    <rect x="0" y="60" width="1122" height="20" fill="#FFC000"/>
    <rect x="0" y="80" width="1122" height="10" fill="#002366"/>
    
    <rect x="0" y="733" width="1122" height="60" fill="#002366"/>
    <rect x="0" y="713" width="1122" height="20" fill="#FFC000"/>
    <rect x="0" y="703" width="1122" height="10" fill="#002366"/>
    
    <rect x="0" y="0" width="60" height="793" fill="#002366"/>
    <rect x="60" y="0" width="20" height="793" fill="#FFC000"/>
    <rect x="80" y="0" width="10" height="793" fill="#002366"/>
    
    <rect x="1062" y="0" width="60" height="793" fill="#002366"/>
    <rect x="1042" y="0" width="20" height="793" fill="#FFC000"/>
    <rect x="1032" y="0" width="10" height="793" fill="#002366"/>
  `, "#ffffff")) }
];

const medicalHealthcare = [
  { id: "med-01", name: "Clinical Swiss Minimalism", url: svgToBase64(makeSvg(`
    <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#E0E0E0" stroke-width="2"/>
    <path d="M 60 80 L 100 80 M 80 60 L 80 100" fill="none" stroke="#4DB6AC" stroke-width="8" stroke-linecap="square"/>
    <path d="M 1022 713 L 1062 713 M 1042 693 L 1042 733" fill="none" stroke="#4DB6AC" stroke-width="8" stroke-linecap="square"/>
  `, "#FAFAFA")) },
  { id: "med-02", name: "Biophilic Healing Curves", url: svgToBase64(makeSvg(`
    <path d="M 0 793 L 0 600 C 300 500, 600 750, 1122 650 L 1122 793 Z" fill="#B2DFDB"/>
    <path d="M 0 793 L 0 650 C 400 550, 800 800, 1122 700 L 1122 793 Z" fill="#E0F2F1"/>
    <path d="M 0 793 L 0 700 C 500 650, 900 850, 1122 750 L 1122 793 Z" fill="#80CBC4"/>
  `, "#ffffff")) },
  { id: "med-03", name: "Vector EKG Rhythm Line", url: svgToBase64(makeSvg(`
    <rect x="0" y="650" width="1122" height="143" fill="#F5F5F5"/>
    ${ekgLine("#E53935")}
    <polyline points="0,650 50,650" fill="none" stroke="#E53935" stroke-width="4"/>
  `, "#ffffff")) },
  { id: "med-04", name: "Sterile Geometric Capsule", url: svgToBase64(makeSvg(`
    <rect x="40" y="40" width="1042" height="713" rx="150" ry="150" fill="none" stroke="#009688" stroke-width="12"/>
    <rect x="60" y="60" width="1002" height="673" rx="130" ry="130" fill="none" stroke="#E0E0E0" stroke-width="4"/>
  `, "#ffffff")) },
  { id: "med-05", name: "Stylized DNA Helix", url: svgToBase64(makeSvg(`
    <path d="M 100 0 C 200 150, 0 250, 100 400 C 200 550, 0 650, 100 793" fill="none" stroke="#1976D2" stroke-width="10"/>
    <path d="M 100 0 C 0 150, 200 250, 100 400 C 0 550, 200 650, 100 793" fill="none" stroke="#64B5F6" stroke-width="10"/>
    <line x1="60" y1="100" x2="140" y2="100" stroke="#BBDEFB" stroke-width="6"/>
    <line x1="55" y1="300" x2="145" y2="300" stroke="#BBDEFB" stroke-width="6"/>
    <line x1="60" y1="500" x2="140" y2="500" stroke="#BBDEFB" stroke-width="6"/>
    <line x1="55" y1="700" x2="145" y2="700" stroke="#BBDEFB" stroke-width="6"/>
  `, "#ffffff")) },
  { id: "med-06", name: "Pharmaceutical Color Blocks", url: svgToBase64(makeSvg(`
    <rect x="80" y="700" width="160" height="60" rx="30" ry="30" fill="#B3E5FC"/>
    <rect x="260" y="700" width="220" height="60" rx="30" ry="30" fill="#81D4FA"/>
    <rect x="500" y="700" width="140" height="60" rx="30" ry="30" fill="#4FC3F7"/>
    <rect x="660" y="700" width="280" height="60" rx="30" ry="30" fill="#29B6F6"/>
    <rect x="960" y="700" width="100" height="60" rx="30" ry="30" fill="#03A9F4"/>
  `, "#ffffff")) },
  { id: "med-07", name: "Minimalist Caduceus Emblem", url: svgToBase64(makeSvg(`
    <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#37474F" stroke-width="3"/>
    <circle cx="561" cy="150" r="60" fill="none" stroke="#37474F" stroke-width="5"/>
    <path d="M 561 110 L 561 190 M 540 140 C 580 120, 580 160, 540 180 M 580 140 C 540 120, 540 160, 580 180" fill="none" stroke="#37474F" stroke-width="4"/>
  `, "#FAFAFA")) },
  { id: "med-08", name: "Mental Health Soft Vectors", url: svgToBase64(makeSvg(`
    <circle cx="150" cy="150" r="250" fill="#E8EAF6" opacity="0.8"/>
    <circle cx="1000" cy="650" r="300" fill="#E3F2FD" opacity="0.8"/>
    <path d="M -50 400 C 200 200, 300 600, 600 400 C 900 200, 1000 700, 1200 500 L 1200 900 L -50 900 Z" fill="#F3E5F5" opacity="0.6"/>
  `, "#ffffff")) },
  { id: "med-09", name: "Emergency Response Contrast", url: svgToBase64(makeSvg(`
    <rect x="0" y="0" width="1122" height="80" fill="#D32F2F"/>
    <rect x="0" y="713" width="1122" height="80" fill="#D32F2F"/>
    <rect x="0" y="80" width="80" height="633" fill="#D32F2F"/>
    <rect x="1042" y="80" width="80" height="633" fill="#D32F2F"/>
    <!-- Medical Crosses -->
    <path d="M 40 20 L 40 60 M 20 40 L 60 40" fill="none" stroke="#ffffff" stroke-width="10"/>
    <path d="M 1082 20 L 1082 60 M 1062 40 L 1102 40" fill="none" stroke="#ffffff" stroke-width="10"/>
    <path d="M 40 733 L 40 773 M 20 753 L 60 753" fill="none" stroke="#ffffff" stroke-width="10"/>
    <path d="M 1082 733 L 1082 773 M 1062 753 L 1102 753" fill="none" stroke="#ffffff" stroke-width="10"/>
  `, "#ffffff")) },
  { id: "med-10", name: "Modern Medical Architecture", url: svgToBase64(makeSvg(`
    <rect x="60" y="60" width="220" height="673" fill="#F5F5F5"/>
    <rect x="280" y="60" width="15" height="673" fill="#4DD0E1"/>
    <rect x="60" y="60" width="1002" height="160" fill="#F5F5F5"/>
    <rect x="60" y="220" width="1002" height="15" fill="#4DD0E1"/>
    <rect x="60" y="60" width="1002" height="673" fill="none" stroke="#EEEEEE" stroke-width="2"/>
  `, "#ffffff")) }
];

const kidsEarlyLearning = [
  { id: "kid-01", name: "Playful Scalloped Edge", url: svgToBase64(makeSvg(`
    <rect x="30" y="30" width="1062" height="733" rx="30" ry="30" fill="#ffffff" stroke="#FFD166" stroke-width="15"/>
    <rect x="50" y="50" width="1022" height="693" rx="20" ry="20" fill="none" stroke="#EF476F" stroke-width="10"/>
    <rect x="70" y="70" width="982" height="653" rx="10" ry="10" fill="none" stroke="#118AB2" stroke-width="5"/>
  `, "#06D6A0")) },
  { id: "kid-02", name: "Naive Art Sky Vector", url: svgToBase64(makeSvg(`
    <path d="M 100 150 C 100 100, 150 100, 150 150 C 200 100, 250 150, 250 180 C 250 220, 100 220, 100 180 Z" fill="#ffffff"/>
    <path d="M 850 200 C 850 150, 900 150, 900 200 C 950 150, 1000 200, 1000 230 C 1000 270, 850 270, 850 230 Z" fill="#ffffff"/>
    <path d="M 400 100 L 415 130 L 450 135 L 425 160 L 430 190 L 400 175 L 370 190 L 375 160 L 350 135 L 385 130 Z" fill="#FFD700"/>
    <path d="M 700 80 L 710 100 L 730 105 L 715 120 L 720 140 L 700 130 L 680 140 L 685 120 L 670 105 L 690 100 Z" fill="#FFD700"/>
  `, "#87CEEB")) },
  { id: "kid-03", name: "Crayon Zig-Zag Vector", url: svgToBase64(makeSvg(`
    <polyline points="20,40 100,80 180,40 260,80 340,40 420,80 500,40 580,80 660,40 740,80 820,40 900,80 980,40 1060,80 1102,40" fill="none" stroke="#FF3B30" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="20,753 100,713 180,753 260,713 340,753 420,713 500,753 580,713 660,753 740,713 820,753 900,713 980,753 1060,713 1102,753" fill="none" stroke="#007AFF" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="40,100 80,180 40,260 80,340 40,420 80,500 40,580 80,660 40,700" fill="none" stroke="#4CD964" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="1082,100 1042,180 1082,260 1042,340 1082,420 1042,500 1082,580 1042,660 1082,700" fill="none" stroke="#FFCC00" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  `, "#ffffff")) },
  { id: "kid-04", name: "Flat Confetti Explosion", url: svgToBase64(makeSvg(confettiAndBalloons(), "#ffffff")) },
  { id: "kid-05", name: "Geometric Jungle Safari", url: svgToBase64(makeSvg(`
    <path d="M 0 0 C 150 0, 150 150, 0 150 Z" fill="#4CAF50"/>
    <path d="M 0 100 C 200 100, 200 250, 0 250 Z" fill="#388E3C"/>
    <path d="M 1122 793 C 972 793, 972 643, 1122 643 Z" fill="#4CAF50"/>
    <path d="M 1122 693 C 922 693, 922 543, 1122 543 Z" fill="#388E3C"/>
    <circle cx="80" cy="80" r="40" fill="#FFEB3B"/>
    <circle cx="1042" cy="713" r="40" fill="#FFEB3B"/>
  `, "#F1F8E9")) },
  { id: "kid-06", name: "Flat Vector Cosmos", url: svgToBase64(makeSvg(`
    <circle cx="200" cy="200" r="80" fill="#FF9800"/>
    <ellipse cx="200" cy="200" rx="120" ry="30" fill="none" stroke="#FFC107" stroke-width="10" transform="rotate(20 200 200)"/>
    <circle cx="900" cy="600" r="50" fill="#4CAF50"/>
    <path d="M 850 150 L 880 100 L 910 150 L 950 180 L 910 210 L 880 260 L 850 210 L 810 180 Z" fill="#FFEB3B"/>
    <path d="M 300 650 L 320 600 L 340 650 L 380 670 L 340 690 L 320 740 L 300 690 L 260 670 Z" fill="#FFEB3B"/>
    <circle cx="100" cy="500" r="8" fill="#ffffff"/>
    <circle cx="700" cy="100" r="10" fill="#ffffff"/>
    <circle cx="500" cy="700" r="6" fill="#ffffff"/>
  `, "#1A237E")) },
  { id: "kid-07", name: "Toy Building Blocks", url: svgToBase64(makeSvg(`
    <g fill="#F44336"><rect x="0" y="0" width="200" height="80"/><circle cx="50" cy="40" r="25"/><circle cx="150" cy="40" r="25"/></g>
    <g fill="#2196F3"><rect x="200" y="0" width="100" height="80"/><circle cx="250" cy="40" r="25"/></g>
    <g fill="#FFEB3B"><rect x="300" y="0" width="300" height="80"/><circle cx="350" cy="40" r="25"/><circle cx="450" cy="40" r="25"/><circle cx="550" cy="40" r="25"/></g>
    <g fill="#4CAF50"><rect x="600" y="0" width="200" height="80"/><circle cx="650" cy="40" r="25"/><circle cx="750" cy="40" r="25"/></g>
    <g fill="#9C27B0"><rect x="800" y="0" width="100" height="80"/><circle cx="850" cy="40" r="25"/></g>
    <g fill="#FF9800"><rect x="900" y="0" width="222" height="80"/><circle cx="950" cy="40" r="25"/><circle cx="1050" cy="40" r="25"/></g>
    
    <g fill="#4CAF50" transform="translate(0, 713)"><rect x="0" y="0" width="200" height="80"/><circle cx="50" cy="40" r="25"/><circle cx="150" cy="40" r="25"/></g>
    <g fill="#FFEB3B" transform="translate(200, 713)"><rect x="0" y="0" width="100" height="80"/><circle cx="50" cy="40" r="25"/></g>
    <g fill="#F44336" transform="translate(300, 713)"><rect x="0" y="0" width="300" height="80"/><circle cx="50" cy="40" r="25"/><circle cx="150" cy="40" r="25"/><circle cx="250" cy="40" r="25"/></g>
    <g fill="#2196F3" transform="translate(600, 713)"><rect x="0" y="0" width="200" height="80"/><circle cx="50" cy="40" r="25"/><circle cx="150" cy="40" r="25"/></g>
    <g fill="#FF9800" transform="translate(800, 713)"><rect x="0" y="0" width="100" height="80"/><circle cx="50" cy="40" r="25"/></g>
    <g fill="#9C27B0" transform="translate(900, 713)"><rect x="0" y="0" width="222" height="80"/><circle cx="50" cy="40" r="25"/><circle cx="150" cy="40" r="25"/></g>
  `, "#ffffff")) },
  { id: "kid-08", name: "Vector Bunting Flags", url: svgToBase64(makeSvg(`
    <path d="M 0 50 Q 280 150 561 50 T 1122 50" fill="none" stroke="#424242" stroke-width="3"/>
    <polygon points="80,75 140,75 110,160" fill="#E91E63"/>
    <polygon points="180,95 240,95 210,180" fill="#00BCD4"/>
    <polygon points="280,110 340,110 310,195" fill="#FFC107"/>
    <polygon points="380,115 440,115 410,200" fill="#8BC34A"/>
    <polygon points="480,115 540,115 510,200" fill="#9C27B0"/>
    <polygon points="580,115 640,115 610,200" fill="#FF5722"/>
    <polygon points="680,115 740,115 710,200" fill="#03A9F4"/>
    <polygon points="780,110 840,110 810,195" fill="#FFEB3B"/>
    <polygon points="880,95 940,95 910,180" fill="#4CAF50"/>
    <polygon points="980,75 1040,75 1010,160" fill="#E91E63"/>
  `, "#FAFAFA")) },
  { id: "kid-09", name: "Stylized Flat Ocean", url: svgToBase64(makeSvg(`
    <path d="M 0 650 Q 150 550 300 650 T 600 650 T 900 650 T 1200 650 L 1200 793 L 0 793 Z" fill="#4DD0E1"/>
    <path d="M -150 700 Q 0 600 150 700 T 450 700 T 750 700 T 1050 700 T 1350 700 L 1350 793 L -150 793 Z" fill="#00BCD4"/>
    <path d="M 0 750 Q 150 650 300 750 T 600 750 T 900 750 T 1200 750 L 1200 793 L 0 793 Z" fill="#0097A7"/>
  `, "#E0F7FA")) },
  { id: "kid-10", name: "Vector Animal Tracks", url: svgToBase64(makeSvg(`
    <rect x="40" y="40" width="1042" height="713" rx="20" ry="20" fill="none" stroke="#8D6E63" stroke-width="8" stroke-dasharray="20 20"/>
    <!-- Tracks -->
    <g transform="translate(100, 100) rotate(45) scale(1.5)" fill="#5D4037">
      <circle cx="15" cy="15" r="10"/><circle cx="0" cy="-5" r="4"/><circle cx="15" cy="-10" r="4"/><circle cx="30" cy="-5" r="4"/>
    </g>
    <g transform="translate(250, 80) rotate(70) scale(1.5)" fill="#5D4037">
      <circle cx="15" cy="15" r="10"/><circle cx="0" cy="-5" r="4"/><circle cx="15" cy="-10" r="4"/><circle cx="30" cy="-5" r="4"/>
    </g>
    <g transform="translate(850, 80) rotate(-70) scale(1.5)" fill="#5D4037">
      <circle cx="15" cy="15" r="10"/><circle cx="0" cy="-5" r="4"/><circle cx="15" cy="-10" r="4"/><circle cx="30" cy="-5" r="4"/>
    </g>
    <g transform="translate(1000, 100) rotate(-45) scale(1.5)" fill="#5D4037">
      <circle cx="15" cy="15" r="10"/><circle cx="0" cy="-5" r="4"/><circle cx="15" cy="-10" r="4"/><circle cx="30" cy="-5" r="4"/>
    </g>
  `, "#FFF8E1")) }
];

const allData = {
  creativeArts, luxuryPrestige, sportsAthletics, medicalHealthcare, kidsEarlyLearning
};

fs.writeFileSync('scratch/all_others.json', JSON.stringify(allData, null, 2));
