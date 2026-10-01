const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Remove the orientation toggle
const toggleRegex = /\{\/\* Orientation Toggle \*\/\}[\s\S]*?<\/button>\s*<\/div>/;
if (toggleRegex.test(code)) {
    code = code.replace(toggleRegex, '');
} else {
    console.log("Could not find orientation toggle.");
}

// 2. We need to restructure the presets array logic.
// We'll replace the existing LANDSCAPE_PRESETS and PORTRAIT_PRESETS with a new combined structure.

// Wait, doing this via regex might be very error prone since those arrays are huge.
// Let's just find the start of LANDSCAPE_PRESETS and the end of PORTRAIT_PRESETS and replace it all.
const startIdx = code.indexOf('const LANDSCAPE_PRESETS = [');
const endIdx = code.indexOf('];', code.indexOf('const PORTRAIT_PRESETS = [')) + 2;

if (startIdx !== -1 && endIdx !== -1) {
    const combinedPresets = `
const PRESET_CATEGORIES = [
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
    name: "Shim Signature (Portrait)",
    orientation: "portrait",
    items: [
      { id: "shim-sig-p1", name: "Gold", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGExOTJmIi8+CiAgICAgIDxyZWN0IHg9IjMlIiB5PSIyJSIgd2lkdGg9Ijk0JSIgaGVpZ2h0PSI5NiUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgIDxyZWN0IHg9IjUlIiB5PSIzJSIgd2lkdGg9IjkwJSIgaGVpZ2h0PSI5NCUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIxMCA1Ii8+CiAgICAgIDxwYXRoIGQ9Ik0wIDAgTDEwMCAwIEwwIDEwMCBaIiBmaWxsPSIjMTEyMjQwIiBvcGFjaXR5PSIwLjUiLz4KICAgIDwvc3ZnPg==" },
      { id: "shim-sig-p3", name: "Tech Grid", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGYxNzJhIi8+CiAgICAgIDxwYXR0ZXJuIGlkPSJncmlkcCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgICA8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWUyOTNiIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgICAgPC9wYXR0ZXJuPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWRwKSIvPgogICAgICA8cmVjdCB4PSI2JSIgeT0iNCUiIHdpZHRoPSI4OCUiIGhlaWdodD0iOTIlIiBmaWxsPSJub25lIiBzdHJva2U9IiMzOGJkZjgiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgPC9zdmc+" },
      { id: "shim-sig-p4", name: "Classic Navy", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8ZGVmcz4KICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWRwIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFlM2E4YSIvPgogICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGYxNzJhIi8+CiAgICAgICAgPC9yYWRpYWxHcmFkaWVudD4KICAgICAgPC9kZWZzPgogICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRwKSIvPgogICAgICA8cmVjdCB4PSI0JSIgeT0iMyUiIHdpZHRoPSI5MiUiIGhlaWdodD0iOTQlIiBmaWxsPSJub25lIiBzdHJva2U9IiNmYmJmMjQiIHN0cm9rZS13aWR0aD0iMyIvPgogICAgPC9zdmc+" }
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
      { id: "local-seminar", url: "/presets/bg-seminar.svg", name: "Seminar" },
      { id: "grad-1", name: "Deep Blue", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZzEnIHgxPScwJScgeTE9JzAlJyB4Mj0nMCUnIHkyPScxMDAlJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjMWUzYzcyJy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjMmE1Mjk4Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNnMSknLz48L3N2Zz4=" },
      { id: "grad-2", name: "Midnight", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZzInIHgxPScwJScgeTE9JzAlJyB4Mj0nMCUnIHkyPScxMDAlJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjMTQxRTMwJy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjMjQzQjU1Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNnMiknLz48L3N2Zz4=" },
    ]
  },
  {
    name: "Classic Backgrounds (Portrait)",
    orientation: "portrait",
    items: [
      { id: "p-border-1", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Purple Wave" },
      { id: "p-border-2", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Blue Mesh" },
      { id: "p-border-3", url: "https://images.unsplash.com/photo-1600164318680-a249ce937611?q=80&w=1200&h=1600&auto=format&fit=crop", name: "White Marble" },
      { id: "p-border-4", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Gold Foil" },
      { id: "p-border-5", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Dark Elegant" },
    ]
  }
];
`;
    code = code.substring(0, startIdx) + combinedPresets + code.substring(endIdx);
} else {
    console.log("Could not find preset arrays.");
}

// 3. Update the UI in Background tab
const gridRegex = /<div className="pt-2 border-t border-zinc-200">[\s\S]*?<\/div>\s*<\/div>\s*<\/motion\.div>/;
if (gridRegex.test(code)) {
    const newUI = `
                      <div className="pt-2 border-t border-zinc-200 space-y-6 pb-20">
                        {PRESET_CATEGORIES.map((category, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                              {category.orientation === 'portrait' ? <span className="w-1.5 h-2.5 border border-current rounded-[1px] opacity-70"></span> : <span className="w-2.5 h-1.5 border border-current rounded-[1px] opacity-70"></span>}
                              {category.name}
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {category.items.map((bg) => (
                                <button
                                  key={bg.id}
                                  onClick={() => {
                                    if (design.orientation !== category.orientation) {
                                      // First trigger orientation change which will flip coords
                                      handleOrientationChange(category.orientation);
                                    }
                                    // Then apply background
                                    setTimeout(() => applyDesignUpdate({ ...design, orientation: category.orientation, backgroundImageUrl: bg.url }), 50);
                                  }}
                                  className={\`relative \${category.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'} rounded-lg overflow-hidden border-2 transition-all \${design.backgroundImageUrl === bg.url ? 'border-indigo-500 shadow-md scale-[1.02]' : 'border-transparent hover:border-zinc-300 hover:scale-[1.02]'}\`}
                                  title={bg.name}
                                >
                                  <img src={bg.url} alt={bg.name} className="absolute inset-0 w-full h-full object-cover" />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                                    <p className="text-[9px] font-medium text-white truncate text-center drop-shadow-sm">{bg.name}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>`;
    code = code.replace(gridRegex, newUI);
} else {
    console.log("Could not find grid UI block.");
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log("Success! Updated template editor to categorised backgrounds and dynamic orientation.");
