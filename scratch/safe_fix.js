const fs = require('fs');
const editorPath = 'src/components/TemplateEditor.tsx';

if (fs.existsSync(editorPath)) {
  let content = fs.readFileSync(editorPath, 'utf8');
  
  // Find the exact duplicate AnimatePresence block causing the mismatched tags error
  const target = `            <div className="relative flex items-center h-[38px] w-auto">
              <AnimatePresence mode="wait">
                <div className="relative flex items-center h-[38px] w-auto">
              <AnimatePresence mode="wait">`;
              
  const replacement = `            <div className="relative flex items-center h-[38px] w-auto">
              <AnimatePresence mode="wait">`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    
    // Also let's ensure Rnd uses style instead of minWidth directly
    content = content.replace(/minWidth="max-content"/g, 'style={{ minWidth: (el.type === "signature" || el.type === "staticText") ? "max-content" : undefined }}');
    
    fs.writeFileSync(editorPath, content);
    console.log("Successfully fixed syntax error and drag controls!");
  } else {
    console.log("Target block not found. Ensure you are on the 152KB version of the file.");
  }
}
