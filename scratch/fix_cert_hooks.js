const fs = require('fs');
const file = 'src/components/CertificateView.tsx';
let content = fs.readFileSync(file, 'utf8');

const hookStr = `  if (parsedDesign.canvasElements) {
    
  // Dynamic Typography Engine: extract used Google Fonts
  const usedFonts = useMemo(() => {
    const fonts = new Set<string>();
    if (parsedDesign?.canvasElements) {
      parsedDesign.canvasElements.forEach(el => {
        if (el.fontFamily && !el.fontFamily.startsWith('var(') && el.fontFamily !== 'Arial' && el.fontFamily !== 'sans-serif') {
          fonts.add(el.fontFamily);
        }
      });
    }
    return Array.from(fonts);
  }, [parsedDesign?.canvasElements]);

  const googleFontsUrl = usedFonts.length > 0 
    ? \`https://fonts.googleapis.com/css2?\${usedFonts.map(f => \`family=\${f.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700\`).join('&')}&display=swap\`
    : null;`;

const newHookStr = `  // Dynamic Typography Engine: extract used Google Fonts
  const usedFonts = useMemo(() => {
    const fonts = new Set<string>();
    if (parsedDesign?.canvasElements) {
      parsedDesign.canvasElements.forEach(el => {
        if (el.fontFamily && !el.fontFamily.startsWith('var(') && el.fontFamily !== 'Arial' && el.fontFamily !== 'sans-serif') {
          fonts.add(el.fontFamily);
        }
      });
    }
    return Array.from(fonts);
  }, [parsedDesign?.canvasElements]);

  const googleFontsUrl = usedFonts.length > 0 
    ? \`https://fonts.googleapis.com/css2?\${usedFonts.map(f => \`family=\${f.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700\`).join('&')}&display=swap\`
    : null;

  if (parsedDesign.canvasElements) {`;

content = content.replace(hookStr, newHookStr);

const fragStr = `            );
          })}
        </div>
      </div>
    );
  }`;

const newFragStr = `            );
          })}
        </div>
      </div>
      </>
    );
  }`;

content = content.replace(fragStr, newFragStr);

fs.writeFileSync(file, content);
console.log("Hooks and Fragments fixed via exact string replace!");
