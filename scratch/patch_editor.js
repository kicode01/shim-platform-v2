const fs = require('fs');

const editorPath = 'src/components/TemplateEditor.tsx';
let code = fs.readFileSync(editorPath, 'utf8');

const others = JSON.parse(fs.readFileSync('scratch/all_others.json', 'utf8'));

// We need to parse the existing PRESET_CATEGORIES.
// It starts at `const PRESET_CATEGORIES = [` and ends at `];\n\nconst ALIGNMENT_GUIDE_PROXIMITY` (or similar).
const startMarker = 'const PRESET_CATEGORIES = [';
const startIndex = code.indexOf(startMarker);

// Let's find the matching closing bracket
let bracketCount = 0;
let endIndex = -1;
for (let i = startIndex + 'const PRESET_CATEGORIES = '.length; i < code.length; i++) {
  if (code[i] === '[') bracketCount++;
  if (code[i] === ']') bracketCount--;
  if (bracketCount === 0) {
    endIndex = i + 1;
    break;
  }
}

if (endIndex === -1) {
  console.error("Could not parse PRESET_CATEGORIES");
  process.exit(1);
}

const existingArrayStr = code.substring(startIndex + 'const PRESET_CATEGORIES = '.length, endIndex);
let existingArray;
try {
  existingArray = eval(existingArrayStr);
} catch (e) {
  console.error("Failed to eval:", e);
  process.exit(1);
}

// Retain the first 3 categories
const newArray = existingArray.slice(0, 3);

// Append the new ones
newArray.push({
  name: "Creative & Arts",
  orientation: "landscape",
  items: others.creativeArts
});
newArray.push({
  name: "Luxury & Prestige",
  orientation: "landscape",
  items: others.luxuryPrestige
});
newArray.push({
  name: "Sports & Athletics",
  orientation: "landscape",
  items: others.sportsAthletics
});
newArray.push({
  name: "Medical & Healthcare",
  orientation: "landscape",
  items: others.medicalHealthcare
});
newArray.push({
  name: "Kids & Early Learning",
  orientation: "landscape",
  items: others.kidsEarlyLearning
});

const newArrayStr = JSON.stringify(newArray, null, 2);

const newCode = code.substring(0, startIndex) + 'const PRESET_CATEGORIES = ' + newArrayStr + code.substring(endIndex);

fs.writeFileSync(editorPath, newCode);
console.log("Updated PRESET_CATEGORIES successfully!");
