const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const t = `    };
    generateQR();
  }, [design.orientation]);`;

const r = `    };
    generateQR();
  }, []);`;

code = code.replace(t, r).replace(t.replace(/\n/g, '\r\n'), r.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed generateQR useEffect');
