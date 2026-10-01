const fs = require('fs');

const bgArray = `const PRESET_BACKGROUNDS = [
  // LOCAL SHIM BACKGROUNDS
  { id: "local-corporate", url: "/presets/bg_corporate.jpg", name: "Corporate" },
  { id: "local-luxury", url: "/presets/bg_luxury.jpg", name: "Luxury" },
  { id: "local-navy", url: "/presets/bg_navy_gold.jpg", name: "Navy Gold" },
  { id: "local-university", url: "/presets/bg_university.jpg", name: "University" },
  { id: "local-award", url: "/presets/bg-award.svg", name: "Award" },
  { id: "local-creative", url: "/presets/bg-creative.svg", name: "Creative" },
  { id: "local-hackathon", url: "/presets/bg-hackathon.svg", name: "Hackathon" },
  { id: "local-kids", url: "/presets/bg-kids.svg", name: "Kids" },
  { id: "local-medical", url: "/presets/bg-medical.svg", name: "Medical" },
  { id: "local-seminar", url: "/presets/bg-seminar.svg", name: "Seminar" },
  { id: "local-sports", url: "/presets/bg-sports.svg", name: "Sports" },
  { id: "local-webinar", url: "/presets/bg-webinar.svg", name: "Webinar" },
  
  // ELEGANT GRADIENTS (SVG Data URIs)
  { id: "grad-1", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%231e3c72'/%3E%3Cstop offset='100%25' stop-color='%232a5298'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g1)'/%3E%3C/svg%3E", name: "Deep Blue" },
  { id: "grad-2", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23141E30'/%3E%3Cstop offset='100%25' stop-color='%23243B55'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g2)'/%3E%3C/svg%3E", name: "Midnight" },
  { id: "grad-3", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%238e9eab'/%3E%3Cstop offset='100%25' stop-color='%23eef2f3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g3)'/%3E%3C/svg%3E", name: "Silver" },
  { id: "grad-4", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23D3CCE3'/%3E%3Cstop offset='100%25' stop-color='%23E9E4F0'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g4)'/%3E%3C/svg%3E", name: "Pearl" },
  { id: "grad-5", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%232c3e50'/%3E%3Cstop offset='100%25' stop-color='%233498db'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g5)'/%3E%3C/svg%3E", name: "Professional" },
  { id: "grad-6", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g6' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230f2027'/%3E%3Cstop offset='50%25' stop-color='%23203a43'/%3E%3Cstop offset='100%25' stop-color='%232c5364'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g6)'/%3E%3C/svg%3E", name: "Slate" },
  { id: "grad-7", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g7' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23C04848'/%3E%3Cstop offset='100%25' stop-color='%23480048'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g7)'/%3E%3C/svg%3E", name: "Crimson" },
  { id: "grad-8", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g8' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%235f2c82'/%3E%3Cstop offset='100%25' stop-color='%2349a09d'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g8)'/%3E%3C/svg%3E", name: "Amethyst" },

  // ABSTRACT TEXTURES (Stable Unsplash IDs)
  { id: "texture-1", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop", name: "Mesh 1" },
  { id: "texture-2", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop", name: "Gradient Flow" },
  { id: "texture-3", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop", name: "Dark Fluid" },
  { id: "texture-4", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=800&auto=format&fit=crop", name: "Gold Fluid" }
];`;

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// Replace the old PRESET_BACKGROUNDS array
const regex = /const PRESET_BACKGROUNDS = \[\s*\{[\s\S]*?\];/;
code = code.replace(regex, bgArray);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log("Updated background presets to include Shim local backgrounds, gradients, and stable textures.");
