const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// We need to rename PRESET_BACKGROUNDS to LANDSCAPE_PRESETS
code = code.replace(/const PRESET_BACKGROUNDS = \[/, 'const LANDSCAPE_PRESETS = [');

const portraitArray = `
const PORTRAIT_PRESETS = [
  // PORTRAIT TEXTURES & BORDERS
  { id: "p-border-1", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Purple Wave" },
  { id: "p-border-2", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Blue Mesh" },
  { id: "p-border-3", url: "https://images.unsplash.com/photo-1600164318680-a249ce937611?q=80&w=1200&h=1600&auto=format&fit=crop", name: "White Marble" },
  { id: "p-border-4", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Gold Foil" },
  { id: "p-border-5", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Dark Elegant" },
  { id: "p-border-6", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Gold Abstract" },
  { id: "p-border-7", url: "https://images.unsplash.com/photo-1601662528567-526cd06f3598?q=80&w=1200&h=1600&auto=format&fit=crop", name: "White Paper" },
  { id: "p-border-8", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Clean Waves" },
  { id: "p-border-9", url: "https://images.unsplash.com/photo-1607317760773-ce6a6a9be2fa?q=80&w=1200&h=1600&auto=format&fit=crop", name: "Parchment" },
  
  // VERTICAL GRADIENTS
  { id: "p-grad-1", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZzEnIHgxPScwJScgeTE9JzAlJyB4Mj0nMCUnIHkyPScxMDAlJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjMWUzYzcyJy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjMmE1Mjk4Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNnMSknLz48L3N2Zz4=", name: "Deep Blue" },
  { id: "p-grad-2", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZzInIHgxPScwJScgeTE9JzAlJyB4Mj0nMCUnIHkyPScxMDAlJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjMTQxRTMwJy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjMjQzQjU1Jy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNnMiknLz48L3N2Zz4=", name: "Midnight" },
  { id: "p-grad-3", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0nZzMnIHgxPScwJScgeTE9JzAlJyB4Mj0nMCUnIHkyPScxMDAlJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjOGU5ZWFiJy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjZWVmMmYzJy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNnMyknLz48L3N2Zz4=", name: "Silver" },
  
  // MINIMAL VERTICAL BORDERS (SVG)
  { id: "p-border-svg-1", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9JyNmZmYnLz48cmVjdCB4PSc0JScgeT0nMyUnIHdpZHRoPSc5MiUnIGhlaWdodD0nOTQlJyBmaWxsPSdub25lJyBzdHJva2U9JyMyYzNlNScgc3Ryb2tlLXdpZHRoPSc1Jy8+PHJlY3QgeD0nNS41JScgeT0nNCUnIHdpZHRoPSc4OSUnIGhlaWdodD0nOTIlJyBmaWxsPSdub25lJyBzdHJva2U9JyNkM2QzZDMnIHN0cm9rZS13aWR0aD0nMSIvPjwvc3ZnPg==", name: "Classic Border" },
  { id: "p-border-svg-2", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9JyNmYWZhZmEnLz48cmVjdCB4PSc4JScgeT0nNiUnIHdpZHRoPSc4NCUnIGhlaWdodD0nODglJyBmaWxsPSdub25lJyBzdHJva2U9JyNkNGFmMzcnIHN0cm9rZS13aWR0aD0nMzAnIHN0cm9rZS1hbGlnbj0naW5zaWRlJyBzdHJva2UtZGFzaGFycmF5PScxMCwgMTAnLz48L3N2Zz4=", name: "Gold Dashed" },
  { id: "p-border-svg-3", url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9JyNmZmYnLz48cGF0aCBkPSdNMCAwIEw1MCAwIEwwIDUwIFonIGZpbGw9JyMxZTNjNzInLz48cGF0aCBkPSdNMTAwIDEwMCBMNTAgMTAwIEwxMDAgNTAgWicgZmlsbD0nIzFlM2M3MicvPjwvc3ZnPg==", name: "Corner Triangles" }
];
`;

code = code.replace(/(const LANDSCAPE_PRESETS = \[[\s\S]*?\];)/, '$1\n' + portraitArray);

// Update the UI rendering to use the correct array
const mapRegex = /\{PRESET_BACKGROUNDS\.map\(\(bg\)/g;
code = code.replace(mapRegex, `{(design.orientation === 'portrait' ? PORTRAIT_PRESETS : LANDSCAPE_PRESETS).map((bg)`);

// Ensure any other references are updated
// Wait, I replaced PRESET_BACKGROUNDS completely, so I must find where it's mapped.
if (!code.includes('PORTRAIT_PRESETS')) {
  console.log("Failed to insert PORTRAIT_PRESETS");
} else {
  fs.writeFileSync('src/components/TemplateEditor.tsx', code);
  console.log("Successfully added PORTRAIT_PRESETS and dynamically switched based on orientation.");
}
