const fs = require('fs');
const file = 'c:/Users/PC/Desktop/SPPQ PROJECT - Copy/src/components/TemplateEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add useEffect
const effectCode = `  const selectedElement = design.canvasElements?.find(el => el.id === selectedElementId);

  useEffect(() => {
    if (selectedElement) {
      if (activePropTab === 'content' && (selectedElement.type === 'qrCode' || selectedElement.type === 'shape')) {
        setActivePropTab('style');
      } else if (activePropTab === 'signature' || activePropTab === 'divider') {
        setActivePropTab('style');
      }
    }
  }, [selectedElement?.type, activePropTab]);`;
content = content.replace('  const selectedElement = design.canvasElements?.find(el => el.id === selectedElementId);', effectCode);

// 2. Fix tabs navigation
const tabsNavRegex = /\{\/\* Global Tabs Navigation \*\/\}(.|\n|\r)*?(?=<\/div>\s*<\/div>\s*<div className="flex-1 overflow-y-auto custom-scrollbar">)/;
const newTabs = `{/* Global Tabs Navigation */}
                        <div className="flex gap-4 relative overflow-x-auto no-scrollbar">
                          {selectedElement.type !== 'qrCode' && selectedElement.type !== 'shape' && (
                            <button onClick={() => setActivePropTab('content')} className={\`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative \${activePropTab === 'content' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}\`}>
                              Content
                              {activePropTab === 'content' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                            </button>
                          )}
                          
                          <button onClick={() => setActivePropTab('style')} className={\`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative \${activePropTab === 'style' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}\`}>
                            Style
                            {activePropTab === 'style' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                          </button>
                          
                          <button onClick={() => setActivePropTab('layout')} className={\`pb-3 text-xs font-semibold whitespace-nowrap transition-colors relative \${activePropTab === 'layout' ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}\`}>
                            Layout
                            {activePropTab === 'layout' && <motion.div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10" />}
                          </button>
                        </div>
                      </div>`;
content = content.replace(tabsNavRegex, newTabs);

// 3. Remove signature/divider tabs
const signatureTabsRegex = /\{\/\* ----------------- SIGNATURE TAB ----------------- \*\/\}(.|\n|\r)*?(?=\{\/\* ----------------- STYLE TAB ----------------- \*\/\})/;
content = content.replace(signatureTabsRegex, '');

// 4. Update style tab condition
content = content.replace(/\{activePropTab === 'style' && selectedElement\.type !== 'signature' && \(/g, "{activePropTab === 'style' && (");

fs.writeFileSync(file, content);
console.log('done');
