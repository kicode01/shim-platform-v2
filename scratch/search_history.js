const fs = require('fs');
const path = require('path');
const histDir = path.join(process.env.APPDATA, 'Code', 'User', 'History');
let foundFile = null;
let maxMtime = 0;

function searchDir(dir) {
  const entries = fs.readdirSync(dir);
  for (const e of entries) {
    const p = path.join(dir, e);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      searchDir(p);
    } else if (stat.isFile() && e !== 'entries.json') {
      try {
        const content = fs.readFileSync(p, 'utf8');
        if (content.includes('handleOrientationChange("landscape")')) {
          if (stat.mtimeMs > maxMtime) {
            maxMtime = stat.mtimeMs;
            foundFile = p;
          }
        }
      } catch (err) {}
    }
  }
}

try {
  searchDir(histDir);
  if (foundFile) {
    console.log('FOUND:', foundFile);
    fs.writeFileSync('src/components/TemplateEditor.tsx', fs.readFileSync(foundFile, 'utf8'));
    console.log('Successfully restored TemplateEditor.tsx!');
  } else {
    console.log('No backup found.');
  }
} catch(err) {
  console.error(err);
}
