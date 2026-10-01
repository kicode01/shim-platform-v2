const fs = require('fs');

function svgToBase64(svgStr) {
  // Extract the raw SVG from the data URI
  const rawSvg = decodeURIComponent(svgStr.replace('data:image/svg+xml,', ''));
  const b64 = Buffer.from(rawSvg).toString('base64');
  return "data:image/svg+xml;base64," + b64;
}

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// The original array in the file:
const startIdx = code.indexOf('const PRESET_BACKGROUNDS = [');
const endIdx = code.indexOf('];', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let arrayCode = code.substring(startIdx, endIdx + 2);
  
  // Find all data URIs
  const dataUriRegex = /"data:image\/svg\+xml,[^"]+"/g;
  
  arrayCode = arrayCode.replace(dataUriRegex, (match) => {
    // match is like "data:image/svg+xml,%3Csvg..."
    const str = match.substring(1, match.length - 1); // remove quotes
    const b64Str = svgToBase64(str);
    return '"' + b64Str + '"';
  });
  
  code = code.substring(0, startIdx) + arrayCode + code.substring(endIdx + 2);
  fs.writeFileSync('src/components/TemplateEditor.tsx', code);
  console.log("Successfully converted SVG gradients to Base64 to prevent CSS url() parsing errors.");
} else {
  console.log("Could not find PRESET_BACKGROUNDS array.");
}
