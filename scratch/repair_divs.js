const fs = require('fs');
const file = 'src/components/TemplateEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// Match the end of ColorPicker
const colorPickerRegex = /(<span className="text-xs text-zinc-500 font-mono uppercase">\{value\}<\/span>\s*<\/div>)\s*\);\s*\}/;

if (colorPickerRegex.test(content)) {
  content = content.replace(colorPickerRegex, '$1\n    </div>\n  );\n}');
  console.log('Successfully added missing </div> to ColorPicker');
} else {
  console.log('Error: Could not find ColorPicker end');
}

// Check if there is an extra div at the end of TemplateEditor
// It should be:
//     </div>
//   );
// }
//
// function CanvasDraggableElement
const endRegex = /(<\/div>\s*)<\/div>\s*\);\s*\}\s*function CanvasDraggableElement/;

if (endRegex.test(content)) {
  content = content.replace(endRegex, '$1  );\n}\n\nfunction CanvasDraggableElement');
  console.log('Successfully removed extra </div> from the end of TemplateEditor');
} else {
  console.log('No extra div at the end found, or already fixed.');
}

fs.writeFileSync(file, content);
console.log('File repaired successfully.');
