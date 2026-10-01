const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// 1. Wrap canvas
const target1 = `          <div \r\n            className="w-[3508px] h-[2480px] shrink-0 relative bg-white shadow-xl transition-shadow"\r\n            style={{\r\n              transform: \`scale(\${scale})\`,\r\n              transformOrigin: 'top center',\r\n              backgroundImage: design.backgroundImageUrl ? \`url(\${design.backgroundImageUrl})\` : 'none',\r\n              backgroundSize: 'cover',\r\n              backgroundPosition: 'center'\r\n            }}\r\n            onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}\r\n          >`;

const target1_unix = target1.replace(/\r\n/g, '\n');

const replace1 = `          <div \r\n            className="shrink-0 relative transition-all duration-300"\r\n            style={{ width: 3508 * (scale * userZoom), height: 2480 * (scale * userZoom) }}\r\n          >\r\n            <div \r\n              className="w-[3508px] h-[2480px] absolute left-0 top-0 origin-top-left bg-white shadow-xl transition-shadow"\r\n              style={{\r\n                transform: \`scale(\${scale * userZoom})\`,\r\n                backgroundImage: design.backgroundImageUrl ? \`url(\${design.backgroundImageUrl})\` : 'none',\r\n                backgroundSize: 'cover',\r\n                backgroundPosition: 'center'\r\n              }}\r\n              onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null); }}\r\n            >`;

code = code.replace(target1, replace1).replace(target1_unix, replace1);

// 2. Add closing div
const target2 = `            })}\r\n          </div>\r\n        </div>`;
const target2_unix = target2.replace(/\r\n/g, '\n');

const replace2 = `            })}\r\n            </div>\r\n          </div>\r\n        </div>`;
code = code.replace(target2, replace2).replace(target2_unix, replace2);

// 3. Fix zoom label
code = code.replace(/{Math\.round\(scale \* 100\)}% zoom/g, '{Math.round(scale * userZoom * 100)}% zoom');

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Replaced successfully');
