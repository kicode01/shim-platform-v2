const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Update State
code = code.replace(
  `const [activeTab, setActiveTab] = useState<"visual" | "builder" | "json">("builder");`,
  `const [activeTab, setActiveTab] = useState<"components" | "builder" | "json" | "background">("components");`
);

// 2. Replace the old Far Left Toolbar with the new Tab Switcher
const oldFarLeftToolbar = `{/* Canva-Style Far Left Toolbar */}
        <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0 bg-zinc-900 rounded-xl overflow-hidden shadow-sm py-4 items-center">
          <button onClick={() => addElement("staticText", "New Heading")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Type size={20} />
            <span className="text-[10px] font-medium">Text</span>
          </button>
          <button onClick={() => addElement("dynamicText", "recipientName")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Database size={20} />
            <span className="text-[10px] font-medium">Data</span>
          </button>
          <button onClick={() => addElement("signature", "Signatory Name|Title Here")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Type size={20} />
            <span className="text-[10px] font-medium">Sign</span>
          </button>
          <button onClick={() => addElement("badge")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Stamp size={20} />
            <span className="text-[10px] font-medium">Badge</span>
          </button>
          <button onClick={() => addElement("image")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <ImageIcon size={20} />
            <span className="text-[10px] font-medium">Image</span>
          </button>
          <button onClick={() => addElement("shape")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <Move size={20} />
            <span className="text-[10px] font-medium">Divider</span>
          </button>
          <button onClick={() => addElement("qrCode")} className="flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
            <QrCode size={20} />
            <span className="text-[10px] font-medium">QR</span>
          </button>
        </div>`;

const newFarLeftToolbar = `{/* Canva-Style Far Left Toolbar (Tab Switcher) */}
        <div className="hidden lg:flex flex-col gap-2 w-20 shrink-0 bg-zinc-900 rounded-xl overflow-hidden shadow-sm py-4 items-center">
          
          <button onClick={() => setActiveTab("components")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'components' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <LayoutTemplate size={20} />
            <span className="text-[10px] font-medium">Elements</span>
          </button>
          
          <button onClick={() => setActiveTab("background")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'background' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <Image size={20} />
            <span className="text-[10px] font-medium">BG</span>
          </button>
          
          <button onClick={() => setActiveTab("builder")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'builder' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <Layers size={20} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
          
          <button onClick={() => setActiveTab("json")} className={\`flex flex-col items-center justify-center gap-1.5 w-16 h-16 rounded-xl transition-colors \${activeTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}\`}>
            <Code2 size={20} />
            <span className="text-[10px] font-medium">JSON</span>
          </button>
          
        </div>`;

code = code.replace(oldFarLeftToolbar, newFarLeftToolbar);
if (code.indexOf(newFarLeftToolbar) === -1) {
  code = code.replace(oldFarLeftToolbar.replace(/\n/g, '\r\n'), newFarLeftToolbar.replace(/\n/g, '\r\n'));
}

// 3. Remove the old "Builder / JSON" local tabs header
const oldLocalTabs = `<div className="flex border-b border-zinc-200 shrink-0 p-2 bg-zinc-50/50 gap-2">
            <button className={\`flex-1 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all \${activeTab === "builder" ? "bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-700"}\`} onClick={() => setActiveTab("builder")}>
              <Move size={16} /> Builder
            </button>
            <button className={\`flex-1 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all \${activeTab === "json" ? "bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-700"}\`} onClick={() => setActiveTab("json")}>
              <Code2 size={16} /> JSON
            </button>
          </div>`;

code = code.replace(oldLocalTabs, '');
code = code.replace(oldLocalTabs.replace(/\n/g, '\r\n'), '');

// 4. Update the AnimatePresence Content block
// We'll replace the existing {activeTab === "builder" ? ...} logic
// with a new switch-like rendering block for components, background, builder, json.

// First, find the Background section inside builder:
const backgroundSection = `                  <div className="pt-4 border-t border-zinc-100">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Upload Background</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Image size={24} className="mb-2 text-zinc-400" />
                          <p className="text-xs text-zinc-500"><span className="font-semibold text-zinc-600">Click to upload</span> or drag and drop</p>
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
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
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

const newBuilderTabStart = `{/* TAB: Components */}
              {activeTab === "components" ? (
                <motion.div 
                  key="components"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800 px-1">Add Design Elements</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => addElement("staticText", "New Heading")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Type size={24} />
                        <span className="text-xs font-medium">Text</span>
                      </button>
                      <button onClick={() => addElement("dynamicText", "recipientName")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Database size={24} />
                        <span className="text-xs font-medium">Data Field</span>
                      </button>
                      <button onClick={() => addElement("signature", "Signatory Name|Title Here")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Type size={24} />
                        <span className="text-xs font-medium">Signature</span>
                      </button>
                      <button onClick={() => addElement("badge")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Stamp size={24} />
                        <span className="text-xs font-medium">Badge</span>
                      </button>
                      <button onClick={() => addElement("image")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <ImageIcon size={24} />
                        <span className="text-xs font-medium">Image</span>
                      </button>
                      <button onClick={() => addElement("shape")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white">
                        <Move size={24} />
                        <span className="text-xs font-medium">Divider</span>
                      </button>
                      <button onClick={() => addElement("qrCode")} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50 text-zinc-600 hover:text-indigo-600 transition-colors bg-white col-span-2">
                        <QrCode size={24} />
                        <span className="text-xs font-medium">QR Code</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === "background" ? (
                <motion.div 
                  key="background"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-800 px-1">Canvas Background</h3>
                    ${backgroundSection}
                  </div>
                </motion.div>
              ) : activeTab === "builder" ? (`;

// Strip backgroundSection from its original place in the code to prevent duplicates
code = code.replace(backgroundSection, '');
code = code.replace(backgroundSection.replace(/\n/g, '\r\n'), '');

// Finally replace the start of the builder tab
const oldBuilderTabStart = `{/* TAB: Builder (Properties) */}
              {activeTab === "builder" ? (`;

code = code.replace(oldBuilderTabStart, newBuilderTabStart);
code = code.replace(oldBuilderTabStart.replace(/\n/g, '\r\n'), newBuilderTabStart.replace(/\n/g, '\r\n'));

// Replace padding for the flyout container
const oldP6 = `<div className={\`flex-1 overflow-y-auto overflow-x-hidden \${activeTab === 'builder' ? 'p-6' : ''}\`}>`;
const newP6 = `<div className={\`flex-1 overflow-y-auto overflow-x-hidden \${activeTab !== 'json' ? 'p-6' : ''}\`}>`;
code = code.replace(oldP6, newP6);
code = code.replace(oldP6.replace(/\n/g, '\r\n'), newP6.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully refactored Canva layout tabs!');
