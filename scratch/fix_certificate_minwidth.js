const fs = require('fs');
const file = 'src/components/CertificateView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The regex matches \n followed by spaces, then minWidth: "max-content",
content = content.replace(/\n\s*minWidth:\s*"max-content",/g, '');

fs.writeFileSync(file, content);
console.log("CertificateView.tsx cleaned!");
