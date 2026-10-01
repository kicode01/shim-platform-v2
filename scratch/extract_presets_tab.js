const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Update State Type
code = code.replace(
  `const [activeTab, setActiveTab] = useState<"components" | "builder" | "json" | "background">("components");`,
  `const [activeTab, setActiveTab] = useState<"components" | "builder" | "json" | "background" | "presets">("components");`
);

// 2. Add Presets Tab to the Left Toolbar
const oldSidebarEnd = `          <button onClick={() => setActiveTab("json")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <Code2 size={20} />
            <span className="text-[10px] font-medium">JSON</span>
          </button>
          
        </div>`;

const newSidebarEnd = `          <button onClick={() => setActiveTab("presets")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'presets' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <LayoutTemplate size={20} />
            <span className="text-[10px] font-medium">Templates</span>
          </button>
          
          <button onClick={() => setActiveTab("json")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <Code2 size={20} />
            <span className="text-[10px] font-medium">JSON</span>
          </button>
          
        </div>`;

code = code.replace(oldSidebarEnd, newSidebarEnd);
if (code.indexOf(newSidebarEnd) === -1) {
    code = code.replace(oldSidebarEnd.replace(/\n/g, '\r\n'), newSidebarEnd.replace(/\n/g, '\r\n'));
}


// 3. Remove the new (incorrect) preset block from the Background tab
const newPresetBlock = `                  <div className="pt-4 border-t border-zinc-100">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Or load a preset:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((preset, idx) => (
                        <button key={idx} onClick={() => loadPreset(preset)} className="relative overflow-hidden rounded-lg border border-zinc-200 text-left transition-all hover:ring-2 hover:ring-indigo-500 hover:border-transparent group bg-white">
                          <div className="h-12 w-full flex items-center justify-center bg-zinc-50 border-b border-zinc-100 overflow-hidden relative">
                             <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: \`url(\${preset.design.backgroundImageUrl})\`}} />
                             <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={12}/></div>
                             </div>
                          </div>
                          <div className="p-2">
                            <span className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider">{preset.name.split(' ')[0]}</span>
                            <span className="block text-[10px] text-zinc-500 truncate">{preset.name.split(' ').slice(1).join(' ') || preset.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>`;

code = code.replace(newPresetBlock, '');
code = code.replace(newPresetBlock.replace(/\n/g, '\r\n'), '');


// 4. Move the old pill-shaped preset block out of "Builder" and into its own tab
const oldPillPresetBlock = `                  <div className="pt-3 border-t border-zinc-200 mt-4">
                    <p className="text-xs font-medium text-zinc-500 mb-3">Or load a preset:</p>
                    <div className="grid grid-cols-2 gap-3">
                      {PRESETS.map((preset) => (
                        <button 
                          key={preset.id}
                          onClick={() => loadPreset(preset.id)} 
                          className="w-full p-3 rounded-lg border bg-white hover:bg-zinc-50 transition-colors text-xs font-semibold text-left relative overflow-hidden flex items-center shadow-sm hover:shadow"
                          style={{ borderColor: preset.color, color: preset.color }}
                        >
                          <div className="absolute top-0 right-0 w-8 h-8 opacity-10" style={{ backgroundColor: preset.color, borderBottomLeftRadius: '100%' }}></div>
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>`;

// Delete it from where it is
code = code.replace(oldPillPresetBlock, '');
code = code.replace(oldPillPresetBlock.replace(/\n/g, '\r\n'), '');


// Create the new Presets tab content
const newPresetsTabContent = `              ) : activeTab === "presets" ? (
                <motion.div 
                  key="presets"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800 px-1">Starting Templates</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {PRESETS.map((preset) => (
                        <button 
                          key={preset.id}
                          onClick={() => loadPreset(preset.id)} 
                          className="w-full p-3 rounded-lg border bg-white hover:bg-zinc-50 transition-colors text-xs font-semibold text-left relative overflow-hidden flex items-center shadow-sm hover:shadow"
                          style={{ borderColor: preset.color, color: preset.color }}
                        >
                          <div className="absolute top-0 right-0 w-8 h-8 opacity-10" style={{ backgroundColor: preset.color, borderBottomLeftRadius: '100%' }}></div>
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "builder" ? (`;

// Insert it right before the "builder" tab
const beforeBuilder = `              ) : activeTab === "builder" ? (`;
code = code.replace(beforeBuilder, newPresetsTabContent);
if (code.indexOf(newPresetsTabContent) === -1) {
    code = code.replace(beforeBuilder.replace(/\n/g, '\r\n'), newPresetsTabContent.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully extracted Presets to its own tab!');
