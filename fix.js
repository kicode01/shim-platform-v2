const fs = require('fs');
const file = 'c:/Users/PC/Desktop/SPPQ PROJECT - Copy/src/components/TemplateEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("</div></div>\\r\\n                      </div>", "</div>\\r\\n                      </div>");

fs.writeFileSync(file, content);
console.log('done');
