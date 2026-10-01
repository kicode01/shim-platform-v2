const fs = require('fs');

const svgToBase64 = (svg) => {
  return "data:image/svg+xml;base64," + Buffer.from(svg.trim()).toString('base64');
};

const items = [
  {
    id: "tech-01",
    name: "Cybernetic Node Network",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#0B0B0B"/>
  <!-- Top Left -->
  <polyline points="50,200 50,50 200,50 250,100 350,100" fill="none" stroke="#00FFFF" stroke-width="4"/>
  <circle cx="50" cy="200" r="8" fill="#00FFFF"/>
  <circle cx="200" cy="50" r="5" fill="#FF00FF"/>
  <circle cx="350" cy="100" r="8" fill="#00FFFF"/>
  <polyline points="100,250 100,100 150,50 300,50" fill="none" stroke="#FF00FF" stroke-width="2"/>
  <!-- Bottom Right -->
  <polyline points="1072,593 1072,743 922,743 872,693 772,693" fill="none" stroke="#00FFFF" stroke-width="4"/>
  <circle cx="1072" cy="593" r="8" fill="#00FFFF"/>
  <circle cx="922" cy="743" r="5" fill="#FF00FF"/>
  <circle cx="772" cy="693" r="8" fill="#00FFFF"/>
  <polyline points="1022,543 1022,693 972,743 822,743" fill="none" stroke="#FF00FF" stroke-width="2"/>
</svg>`)
  },
  {
    id: "tech-02",
    name: "Isometric Tech Grid",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g transform="translate(0, 600)">
    <!-- Isometric Rhombuses -->
    <polygon points="50,50 100,25 150,50 100,75" fill="#39FF14"/>
    <polygon points="100,75 150,50 150,100 100,125" fill="#2F4F4F"/>
    <polygon points="50,50 100,75 100,125 50,100" fill="#203030"/>

    <polygon points="150,100 200,75 250,100 200,125" fill="#39FF14"/>
    <polygon points="200,125 250,100 250,150 200,175" fill="#2F4F4F"/>
    <polygon points="150,100 200,125 200,175 150,150" fill="#203030"/>
    
    <polygon points="900,50 950,25 1000,50 950,75" fill="#39FF14"/>
    <polygon points="950,75 1000,50 1000,100 950,125" fill="#2F4F4F"/>
    <polygon points="900,50 950,75 950,125 900,100" fill="#203030"/>
  </g>
</svg>`)
  },
  {
    id: "tech-03",
    name: "Flat Tech-Brutalism",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#000000" stroke-width="4"/>
  <rect x="0" y="80" width="300" height="80" fill="#000000"/>
  <rect x="20" y="100" width="150" height="40" fill="#FFFF00"/>
  <rect x="0" y="600" width="400" height="120" fill="#000000"/>
  <rect x="150" y="550" width="100" height="200" fill="#FFFF00" stroke="#000000" stroke-width="4"/>
</svg>`)
  },
  {
    id: "tech-04",
    name: "Minimalist Digital Wireframe",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="30" y="30" width="1062" height="733" fill="none" stroke="#7DF9FF" stroke-width="0.5"/>
  <rect x="40" y="40" width="1042" height="713" fill="none" stroke="#7DF9FF" stroke-width="0.25"/>
  <!-- Crosshairs -->
  <path d="M 20 40 L 60 40 M 40 20 L 40 60" fill="none" stroke="#7DF9FF" stroke-width="0.5"/>
  <path d="M 1062 40 L 1102 40 M 1082 20 L 1082 60" fill="none" stroke="#7DF9FF" stroke-width="0.5"/>
  <path d="M 20 753 L 60 753 M 40 733 L 40 773" fill="none" stroke="#7DF9FF" stroke-width="0.5"/>
  <path d="M 1062 753 L 1102 753 M 1082 733 L 1082 773" fill="none" stroke="#7DF9FF" stroke-width="0.5"/>
</svg>`)
  },
  {
    id: "tech-05",
    name: "Binary Algorithm Blocks",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#1A1A1A"/>
  <!-- Top blocks -->
  <rect x="50" y="0" width="180" height="80" fill="#36454F"/>
  <rect x="150" y="40" width="220" height="60" fill="#708090"/>
  <rect x="150" y="40" width="80" height="40" fill="#FF5733"/>
  <rect x="450" y="0" width="300" height="40" fill="#36454F"/>
  <rect x="600" y="0" width="100" height="120" fill="#FF5733"/>
  <!-- Bottom blocks -->
  <rect x="800" y="700" width="250" height="93" fill="#708090"/>
  <rect x="900" y="650" width="100" height="143" fill="#36454F"/>
  <rect x="900" y="700" width="100" height="93" fill="#FF5733"/>
</svg>`)
  },
  {
    id: "tech-06",
    name: "Synthwave Vector",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#4B0082"/>
  <!-- Sun -->
  <path d="M 561 300 A 200 200 0 0 1 761 500 L 361 500 A 200 200 0 0 1 561 300 Z" fill="#FF69B4"/>
  <rect x="300" y="400" width="500" height="10" fill="#4B0082"/>
  <rect x="300" y="430" width="500" height="15" fill="#4B0082"/>
  <rect x="300" y="460" width="500" height="25" fill="#4B0082"/>
  <!-- Perspective Grid -->
  <path d="M 0 600 L 1122 600 M 0 650 L 1122 650 M 0 720 L 1122 720 M 0 793 L 1122 793" fill="none" stroke="#00FFFF" stroke-width="2"/>
  <path d="M 561 500 L 561 793 M 561 500 L 200 793 M 561 500 L -100 793 M 561 500 L 922 793 M 561 500 L 1222 793" fill="none" stroke="#00FFFF" stroke-width="2"/>
</svg>`)
  },
  {
    id: "tech-07",
    name: "Pixel Art Interface",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <rect x="50" y="50" width="1022" height="693" fill="none" stroke="#000000" stroke-width="4"/>
  <rect x="52" y="52" width="1018" height="40" fill="#D3D3D3"/>
  <rect x="52" y="92" width="1018" height="4" fill="#000000"/>
  <!-- Window controls -->
  <rect x="990" y="62" width="20" height="20" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <rect x="1030" y="62" width="20" height="20" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <path d="M 1035 67 L 1045 77 M 1045 67 L 1035 77" fill="none" stroke="#000000" stroke-width="2"/>
  <!-- Decor -->
  <rect x="70" y="66" width="100" height="12" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <rect x="80" y="150" width="40" height="40" fill="#FF0000" stroke="#000000" stroke-width="4"/>
  <rect x="140" y="150" width="40" height="40" fill="#00FF00" stroke="#000000" stroke-width="4"/>
  <rect x="200" y="150" width="40" height="40" fill="#0000FF" stroke="#000000" stroke-width="4"/>
</svg>`)
  },
  {
    id: "tech-08",
    name: "Sine Wave Dynamics",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#0D1117"/>
  <path d="M 0 600 Q 200 500 400 600 T 800 600 T 1122 600" fill="none" stroke="#00FFFF" stroke-width="3"/>
  <path d="M 0 650 Q 300 450 600 650 T 1122 650" fill="none" stroke="#0000FF" stroke-width="3"/>
  <path d="M 0 700 Q 150 750 300 700 T 600 700 T 900 700 T 1122 700" fill="none" stroke="#00FFFF" stroke-width="3" stroke-dasharray="10 5"/>
</svg>`)
  },
  {
    id: "tech-09",
    name: "Hexagonal Data Architecture",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <g transform="translate(800, 100)">
    <!-- Hexagons top right -->
    <polygon points="60,0 120,35 120,105 60,140 0,105 0,35" fill="#000080" transform="scale(0.8) translate(0, 0)"/>
    <polygon points="60,0 120,35 120,105 60,140 0,105 0,35" fill="#4169E1" transform="scale(0.8) translate(130, 75)"/>
    <polygon points="60,0 120,35 120,105 60,140 0,105 0,35" fill="none" stroke="#000080" stroke-width="4" transform="scale(0.8) translate(-130, 75)"/>
  </g>
  <g transform="translate(100, 500)">
    <!-- Hexagons bottom left -->
    <polygon points="60,0 120,35 120,105 60,140 0,105 0,35" fill="#4169E1" transform="scale(0.8) translate(0, 0)"/>
    <polygon points="60,0 120,35 120,105 60,140 0,105 0,35" fill="none" stroke="#4169E1" stroke-width="4" transform="scale(0.8) translate(130, -75)"/>
    <polygon points="60,0 120,35 120,105 60,140 0,105 0,35" fill="#000080" transform="scale(0.8) translate(130, 75)"/>
  </g>
</svg>`)
  },
  {
    id: "tech-10",
    name: "Vector Glitch Art",
    url: svgToBase64(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1122 793">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <!-- Glitch slices on the left -->
  <polygon points="50,100 150,100 150,200 50,200" fill="#00FFFF"/>
  <polygon points="80,120 180,120 180,220 80,220" fill="#FF00FF"/>
  <polygon points="60,150 200,150 200,180 60,180" fill="#FF0000"/>
  
  <polygon points="20,400 120,400 120,600 20,600" fill="#FF00FF"/>
  <polygon points="0,450 180,450 180,480 0,480" fill="#00FFFF"/>
  <polygon points="40,550 140,550 140,580 40,580" fill="#FF0000"/>
</svg>`)
  }
];

const jsonOut = JSON.stringify(items, null, 6);
fs.writeFileSync('scratch/new_tech_items.txt', jsonOut);
