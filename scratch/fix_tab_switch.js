const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const insertion = `  const [activeTab, setActiveTab] = useState<"components" | "builder" | "json" | "background" | "presets">("components");
  const [previousTab, setPreviousTab] = useState<"components" | "builder" | "json" | "background" | "presets">("components");
  
  // Auto-switch to builder (Settings) tab when an element is selected
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

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<.*?\>\("components"\);/g,
  insertion
);

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Added auto-switch logic for builder tab');
