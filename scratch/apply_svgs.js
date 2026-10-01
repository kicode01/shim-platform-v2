const fs = require('fs');

const file = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(file, 'utf8');
const newPresets = fs.readFileSync('scratch/new_presets.txt', 'utf8');

const startString = 'const PRESET_CATEGORIES = [';
const endIndex = code.indexOf('\nconst defaultDesign');
const startIndex = code.indexOf(startString);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find PRESET_CATEGORIES block");
    process.exit(1);
}

code = code.substring(0, startIndex) + newPresets + "\n" + code.substring(endIndex);
fs.writeFileSync(file, code);
console.log("Replaced successfully with actual SVGs.");
