const fs = require('fs');
const file = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetArrayRegex = /const PRESET_CATEGORIES = \[\s*\{[\s\S]*?\s+\]\s*\};\s*const/g;
// Wait, the array declaration might not end exactly like that. Let's find the closing brace.
// Let's use string manipulation instead.

const startString = 'const PRESET_CATEGORIES = [';
const endString = '  // State'; // We can search for the next major declaration to find the end

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf('\nconst defaultDesign', startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find PRESET_CATEGORIES block");
    process.exit(1);
}

const newPresets = `const PRESET_CATEGORIES = [
  {
    name: "Vector Premium (Landscape)",
    orientation: "landscape",
    items: [
      { id: "vec-corp-navy", url: "/corporate_navy.jpg", name: "Corporate Navy" },
      { id: "vec-acad-vic", url: "/academic_victorian.jpg", name: "Victorian Academic" },
      { id: "vec-tech-cyber", url: "/tech_cyberpunk.jpg", name: "Cyberpunk Tech" },
      { id: "vec-crea-bauhaus", url: "/creative_bauhaus.jpg", name: "Bauhaus Creative" },
      { id: "vec-lux-deco", url: "/luxury_deco.jpg", name: "Luxury Art Deco" },
      { id: "vec-sport-chev", url: "/sports_chevron.jpg", name: "Sports Chevron" },
      { id: "vec-med-cross", url: "/medical_cross.jpg", name: "Medical Cross" },
      { id: "vec-kid-rain", url: "/kids_rainbow.jpg", name: "Kids Rainbow" },
    ]
  },
  {
    name: "Vector Basic (Landscape)",
    orientation: "landscape",
    items: [
      { 
        id: "vec-blue-geometric", 
        name: "Blue Geometric", 
        url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMCwwIDQwMCwwIDAsNDAwIiBmaWxsPSIjMWEyOTViIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDAgMTUwLDAgMCwxNTAiIGZpbGw9IiM2Njk5Y2MiLz4KICA8cG9seWdvbiBwb2ludHM9IjExMjIsNzkzIDcyMiw3OTMgMTEyMiwzOTMiIGZpbGw9IiMxYTI5NWIiLz4KICA8cG9seWdvbiBwb2ludHM9IjExMjIsNzkzIDk3Miw3OTMgMTEyMiw2NDMiIGZpbGw9IiM2Njk5Y2MiLz4KPC9zdmc+" 
      },
      { 
        id: "vec-elegant-gold", 
        name: "Elegant Gold", 
        url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjExMjIiIGhlaWdodD0iNzkzIiBmaWxsPSIjZmFmOWY2Ii8+CiAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTA0MiIgaGVpZ2h0PSI3MTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgPHJlY3QgeD0iNTAiIHk9IjUwIiB3aWR0aD0iMTAyMiIgaGVpZ2h0PSI2OTMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgPHBhdGggZD0iTTQwIDE0MCBMIDE0MCA0MCBNOTgyIDQwIEwgMTA4MiAxNDAgTTQwIDY1MyBMIDE0MCA3NTMgTTk4MiA3NTMgTCAxMDgyIDY1MyIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjQiLz4KPC9zdmc+" 
      },
      { 
        id: "vec-dark-gold", 
        name: "Dark Luxury", 
        url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjExMjIiIGhlaWdodD0iNzkzIiBmaWxsPSIjMWExYTFhIi8+CiAgPHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMTA2MiIgaGVpZ2h0PSI3MzMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPHBhdGggZD0iTTAgMjAwIFEgMTUwIDE1MCAyMDAgMCBMIDAgMCBaIiBmaWxsPSIjZDRhZjM3Ii8+CiAgPHBhdGggZD0iTTExMjIgNTkzIFEgOTcyIDY0MyA5MjIgNzkzIEwgMTEyMiA3OTMgWiIgZmlsbD0iI2Q0YWYzNyIvPgo8L3N2Zz4=" 
      },
      { 
        id: "vec-green-accent", 
        name: "Green Accent", 
        url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTIyIDc5MyI+CiAgPHJlY3Qgd2lkdGg9IjExMjIiIGhlaWdodD0iNzkzIiBmaWxsPSIjZmZmZmZmIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIwLDAgMzAwLDAgMTUwLDc5MyAwLDc5MyIgZmlsbD0iIzE1NTAzMSIvPgogIDxwb2x5Z29uIHBvaW50cz0iMzAwLDAgMzIwLDAgMTcwLDc5MyAxNTAsNzkzIiBmaWxsPSIjZDRhZjM3Ii8+CiAgPGNpcmNsZSBjeD0iMTUwIiBjeT0iMzk2IiByPSI1MCIgZmlsbD0iI2Q0YWYzNyIvPgo8L3N2Zz4=" 
      }
    ]
  }
];`;

code = code.substring(0, startIndex) + newPresets + code.substring(endIndex);

fs.writeFileSync(file, code);
console.log("Replaced backgrounds successfully");
