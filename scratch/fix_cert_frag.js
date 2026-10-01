const fs = require('fs');
const file = 'src/components/CertificateView.tsx';
let content = fs.readFileSync(file, 'utf8');

// just search for the exact block using regex with optional \r
content = content.replace(/      <\/div>\r?\n    \);\r?\n  }/g, '      </div>\r\n      </>\r\n    );\r\n  }');
fs.writeFileSync(file, content);
console.log("Did it work?");
