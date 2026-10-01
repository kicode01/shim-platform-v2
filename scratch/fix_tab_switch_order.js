const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// The block to move
const effectBlock = `  // Auto-switch to builder (Settings) tab when an element is selected
  useEffect(() => {
    if (selectedElementId) {
      if (activeTab !== "builder") {
        setPreviousTab(activeTab);
        setActiveTab("builder");
      }
    } else {
      if (activeTab === "builder") {
        setActiveTab(previousTab);
      }
    }
  }, [selectedElementId]);`;

// Remove the block from its current location
code = code.replace(effectBlock, '');

// Insert it right after the declaration of selectedElementId
const targetDeclaration = `const [selectedElementId, setSelectedElementId] = useState<string | null>(null);`;
code = code.replace(
  targetDeclaration,
  targetDeclaration + '\n\n' + effectBlock
);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Moved useEffect successfully');
