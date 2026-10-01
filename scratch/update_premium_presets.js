const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const startIdx = code.indexOf('const PRESET_CATEGORIES = [');
const endIdx = code.indexOf('];', code.indexOf('const PRESET_CATEGORIES = [')) + 2;

if (startIdx !== -1 && endIdx !== -1) {
    const combinedPresets = `
const PRESET_CATEGORIES = [
  {
    name: "AI Premium (Landscape)",
    orientation: "landscape",
    items: [
      { id: "ai-corporate-l", url: "/presets/bg_corporate_landscape.jpg", name: "Corporate Gold" },
      { id: "ai-tech-l", url: "/presets/bg_tech_landscape.jpg", name: "Tech Hackathon" },
      { id: "ai-creative-l", url: "/presets/bg_creative_landscape.jpg", name: "Creative Workshop" },
      { id: "ai-academic-l", url: "/presets/bg_academic_landscape.jpg", name: "Classic Academic" },
    ]
  },
  {
    name: "AI Premium (Portrait)",
    orientation: "portrait",
    items: [
      { id: "ai-corporate-p", url: "/presets/bg_corporate_portrait.jpg", name: "Corporate Gold" },
      { id: "ai-tech-p", url: "/presets/bg_tech_portrait.jpg", name: "Tech Hackathon" },
      { id: "ai-creative-p", url: "/presets/bg_creative_portrait.jpg", name: "Creative Workshop" },
      { id: "ai-academic-p", url: "/presets/bg_academic_portrait.jpg", name: "Classic Academic" },
    ]
  },
  {
    name: "Shim Signature (Landscape)",
    orientation: "landscape",
    items: [
      { id: "local-corporate", url: "/presets/bg_corporate.jpg", name: "Corporate" },
      { id: "local-luxury", url: "/presets/bg_luxury.jpg", name: "Luxury" },
      { id: "local-navy", url: "/presets/bg_navy_gold.jpg", name: "Navy Gold" },
      { id: "local-university", url: "/presets/bg_university.jpg", name: "University" },
      { id: "shim-sig-1", name: "Gold", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGExOTJmIi8+CiAgICAgIDxyZWN0IHg9IjIlIiB5PSIzJSIgd2lkdGg9Ijk2JSIgaGVpZ2h0PSI5NCUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgIDxyZWN0IHg9IjMlIiB5PSI1JSIgd2lkdGg9Ijk0JSIgaGVpZ2h0PSI5MCUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIxMCA1Ii8+CiAgICAgIDxwYXRoIGQ9Ik0wIDAgTDEwMCAwIEwwIDEwMCBaIiBmaWxsPSIjMTEyMjQwIiBvcGFjaXR5PSIwLjUiLz4KICAgIDwvc3ZnPg==" },
      { id: "shim-sig-3", name: "Tech Grid", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGYxNzJhIi8+CiAgICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgIDxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMSIvPgogICAgICA8L3BhdHRlcm4+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KICAgICAgPHJlY3QgeD0iNCUiIHk9IjYlIiB3aWR0aD0iOTIlIiBoZWlnaHQ9Ijg4JSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzhiZGY4IiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDwvc3ZnPg==" },
      { id: "shim-sig-4", name: "Classic Navy", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8ZGVmcz4KICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUzYThhIi8+CiAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz4KICAgICAgICA8L3JhZGlhbEdyYWRpZW50PgogICAgICA8L2RlZnM+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz4KICAgICAgPHJlY3QgeD0iMyUiIHk9IjQlIiB3aWR0aD0iOTQlIiBoZWlnaHQ9IjkyJSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmJiZjI0IiBzdHJva2Utd2lkdGg9IjMiLz4KICAgIDwvc3ZnPg==" }
    ]
  },
  {
    name: "Classic Backgrounds (Landscape)",
    orientation: "landscape",
    items: [
      { id: "local-award", url: "/presets/bg-award.svg", name: "Award" },
      { id: "local-creative", url: "/presets/bg-creative.svg", name: "Creative" },
      { id: "local-hackathon", url: "/presets/bg-hackathon.svg", name: "Hackathon" },
      { id: "local-kids", url: "/presets/bg-kids.svg", name: "Kids" },
      { id: "local-medical", url: "/presets/bg-medical.svg", name: "Medical" },
      { id: "local-seminar", url: "/presets/bg-seminar.svg", name: "Seminar" }
    ]
  }
];
`;
    code = code.substring(0, startIdx) + combinedPresets + code.substring(endIdx);
    fs.writeFileSync('src/components/TemplateEditor.tsx', code);
    console.log("Updated PRESET_CATEGORIES with AI backgrounds");
} else {
    console.log("Could not find PRESET_CATEGORIES");
}
