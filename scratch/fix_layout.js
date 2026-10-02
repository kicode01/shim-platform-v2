const fs = require('fs');
const file = 'src/components/TemplateEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Find Right: Live Canvas Builder and insert a </div> before it.
const searchStr = '        {/* Right: Live Canvas Builder */}';
if (content.includes(searchStr)) {
  content = content.replace(searchStr, '        </div>\n\n' + searchStr);
  console.log('Successfully inserted </div> before Right: Live Canvas Builder.');
} else {
  console.log('Error: Could not find Right: Live Canvas Builder');
  process.exit(1);
}

// 2. Remove one </div> from the very end of the file.
const endStr = '    </div>\n      </div>\n  );\n}';
if (content.includes(endStr)) {
  content = content.replace(endStr, '    </div>\n  );\n}');
  console.log('Successfully removed one </div> from the end of the return statement.');
} else {
  // Try regex in case of slight whitespace differences
  const endRegex = /<\/div>\s*<\/div>\s*\);\s*\}/;
  if (endRegex.test(content)) {
    content = content.replace(endRegex, '</div>\n  );\n}');
    console.log('Successfully removed one </div> from the end using regex.');
  } else {
    console.log('Error: Could not find the closing tags at the end of the return statement.');
    process.exit(1);
  }
}

fs.writeFileSync(file, content);
console.log('File updated successfully.');
