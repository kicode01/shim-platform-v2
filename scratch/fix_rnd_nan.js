const fs = require('fs');

function fixRndPosition(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('position={{ x: el.x, y: el.y }}')) {
      lines[i] = line.replace('position={{ x: el.x, y: el.y }}', 'position={{ x: el.x || 0, y: el.y || 0 }}');
    }
    if (line.includes('size={{ width: el.width, height: el.height || \'auto\' }}')) {
      lines[i] = line.replace('size={{ width: el.width, height: el.height || \'auto\' }}', 'size={{ width: el.width || 200, height: el.height || \'auto\' }}');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
}

fixRndPosition('src/components/TemplateEditor.tsx');
