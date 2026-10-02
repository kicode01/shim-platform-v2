const fs = require('fs');
const file = 'c:/Users/PC/Desktop/SPPQ PROJECT - Copy/src/components/TemplateEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change indigo to zinc for tabs navigation
const tabsNavRegex = /\{\/\* Global Tabs Navigation \*\/\}(.|\n|\r)*?(?=<\/div>\s*<\/div>\s*<div className=\"flex-1 overflow-y-auto custom-scrollbar\">)/;
let tabsNavMatch = content.match(tabsNavRegex);

if (tabsNavMatch) {
  let tabsNav = tabsNavMatch[0];
  
  // Replace colors
  tabsNav = tabsNav.replace(/text-indigo-600/g, 'text-zinc-900');
  tabsNav = tabsNav.replace(/bg-indigo-600/g, 'bg-zinc-900');
  
  // Conditionally hide content tab for qrCode and shape
  tabsNav = tabsNav.replace(
    /<button onClick=\{\(\) => setActivePropTab\('content'\)\}/g,
    `{selectedElement.type !== 'qrCode' && selectedElement.type !== 'shape' && (
                            <button onClick={() => setActivePropTab('content')}`
  );
  tabsNav = tabsNav.replace(
    /\{activePropTab === 'content' && <motion\.div className=\"absolute -bottom-\[1px\] left-0 right-0 h-\[2px\] bg-zinc-900 z-10\" \/>\}\r\n                          <\/button>/,
    `{activePropTab === 'content' && <motion.div className=\"absolute -bottom-[1px] left-0 right-0 h-[2px] bg-zinc-900 z-10\" />}
                          </button>
                          )}`
  );

  content = content.replace(tabsNavRegex, tabsNav);
}

// 2. Add useEffect to force activePropTab when invalid tab is selected
const effectCode = `  const selectedElement = design.canvasElements?.find(el => el.id === selectedElementId);

  useEffect(() => {
    if (selectedElement) {
      if (activePropTab === 'content' && (selectedElement.type === 'qrCode' || selectedElement.type === 'shape')) {
        setActivePropTab('style');
      } else if ((activePropTab === 'signature' || activePropTab === 'divider') && selectedElement.type !== 'signature') {
        setActivePropTab('style');
      } else if (activePropTab === 'style' && selectedElement.type === 'signature') {
        setActivePropTab('signature');
      }
    }
  }, [selectedElement?.type, activePropTab]);`;
content = content.replace('  const selectedElement = design.canvasElements?.find(el => el.id === selectedElementId);', effectCode);

fs.writeFileSync(file, content);
console.log('done');
