const fs = require('fs');

const viewerPath = 'src/components/CertificateView.tsx';
let code = fs.readFileSync(viewerPath, 'utf8');

const dynamicFontsBlock = `
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
    : null;
`;

if (!code.includes("const usedFonts = useMemo(")) {
  code = code.replace(
    /const renderUrl = process\.env\.NEXT_PUBLIC_APP_URL[\s\S]*?\n/,
    match => dynamicFontsBlock + "\n" + match
  );
  // If the above replace didn't work, let's put it right before `return (`
  if (!code.includes("const usedFonts = useMemo(")) {
    code = code.replace(
      /return \(\s*<div/m,
      dynamicFontsBlock + "\n  return (\n    <div"
    );
  }
}

// Ensure the return block includes the font tag.
if (!code.includes("googleFontsUrl && <link")) {
  code = code.replace(
    /return \(\s*<div/,
    `return (
    <>
      {googleFontsUrl && <link href={googleFontsUrl} rel="stylesheet" />}
      <div`
  );
  code = code.replace(
    /<\/div>\s*\);\s*}\s*$/m,
    `</div>\n    </>\n  );\n}`
  );
}

fs.writeFileSync(viewerPath, code);
console.log("Patched CertificateView with fonts successfully!");
