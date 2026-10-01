const fs = require('fs');
let code = fs.readFileSync('src/lib/presets.ts', 'utf8');

// The file has: const portraitAcademicBg = \`data:image...
// We want to replace \` with `
code = code.replace(/\\`/g, '`');

fs.writeFileSync('src/lib/presets.ts', code);
console.log('Fixed backticks');
