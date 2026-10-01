const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const presetArray = `const PRESET_BACKGROUNDS = [
  { id: "cert-classic", url: "https://images.unsplash.com/photo-1607317760773-ce6a6a9be2fa?q=80&w=2574&auto=format&fit=crop", name: "Parchment" },
  { id: "gold-luxury", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", name: "Gold Foil" },
  { id: "blue-geo", url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop", name: "Blue Mesh" },
  { id: "white-marble", url: "https://images.unsplash.com/photo-1600164318680-a249ce937611?q=80&w=2600&auto=format&fit=crop", name: "White Marble" },
  { id: "dark-elegant", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", name: "Dark Elegant" },
  { id: "purple-fluid", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2670&auto=format&fit=crop", name: "Purple Fluid" },
  { id: "paper-texture", url: "https://images.unsplash.com/photo-1601662528567-526cd06f3598?q=80&w=2574&auto=format&fit=crop", name: "White Paper" },
  { id: "gold-abstract", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2574&auto=format&fit=crop", name: "Gold Abstract" },
  { id: "clean-waves", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2629&auto=format&fit=crop", name: "Clean Waves" }
];
`;

if (!code.includes('PRESET_BACKGROUNDS')) {
  // Insert at the top of the file, after imports
  code = code.replace(/export default function TemplateEditor/, presetArray + '\nexport default function TemplateEditor');
}

const backgroundTabRegex = /\)\s*:\s*activeTab === "background"\s*\?\s*\(\s*<motion\.div\s*key="background"[\s\S]*?\{design\.backgroundImageUrl && \(\s*<button onClick=\{\(\) => updateDesignField\("backgroundImageUrl", null\)\} className="text-sm font-medium text-red-600 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Background<\/button>\s*\)\}\s*<\/div>\s*<\/motion\.div>/;

const newBackgroundTab = `) : activeTab === "background" ? (
                  <motion.div 
                    key="background"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="space-y-5">
                      <h3 className="text-sm font-semibold text-zinc-800 px-1">Canvas Background</h3>

                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon size={24} className="mb-2 text-zinc-400" />
                            <p className="text-xs text-zinc-500"><span className="font-semibold text-zinc-600">Click to upload</span> or drag</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => applyDesignUpdate({ ...design, backgroundImageUrl: reader.result as string });
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-zinc-600 px-1">Or paste image URL</label>
                        <input 
                          type="text" 
                          placeholder="https://example.com/bg.jpg" 
                          className="input-field py-2 text-sm w-full"
                          value={design.backgroundImageUrl && design.backgroundImageUrl.startsWith('http') ? design.backgroundImageUrl : ''}
                          onChange={(e) => applyDesignUpdate({ ...design, backgroundImageUrl: e.target.value })}
                        />
                      </div>
                      
                      {design.backgroundImageUrl && (
                        <button onClick={() => updateDesignField("backgroundImageUrl", null)} className="text-sm font-medium text-red-600 w-full text-center hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">
                          Remove Background
                        </button>
                      )}

                      <div className="pt-2 border-t border-zinc-200">
                        <h4 className="text-xs font-medium text-zinc-500 mb-3 px-1 uppercase tracking-wider">Premium Presets</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {PRESET_BACKGROUNDS.map((bg) => (
                            <button
                              key={bg.id}
                              onClick={() => applyDesignUpdate({ ...design, backgroundImageUrl: bg.url })}
                              className={\`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all \${design.backgroundImageUrl === bg.url ? 'border-indigo-500 shadow-md scale-[1.02]' : 'border-transparent hover:border-zinc-300 hover:scale-[1.02]'}\`}
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
                    </div>
                  </motion.div>`;

if (backgroundTabRegex.test(code)) {
    code = code.replace(backgroundTabRegex, newBackgroundTab);
    fs.writeFileSync('src/components/TemplateEditor.tsx', code);
    console.log("Successfully added premium backgrounds grid and URL input.");
} else {
    console.log("Regex failed to find the background tab block.");
}
