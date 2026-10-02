const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const targetStr = `<div className="flex flex-col gap-1.5 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600 shrink-0">
                <LayoutTemplate size={24} />
              </div>
              <input
                type="text"
                className={\`text-2xl font-bold text-zinc-800 bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 w-full \${error ? 'border-red-500 placeholder-red-300 text-red-600' : ''}\`}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                  if (!design.certificateTitle || design.certificateTitle === "Certificate of Completion")
                    updateDesignField("certificateTitle", e.target.value);
                }}
                placeholder="Name your template..."
                required
              />
            </div>
            <input
              type="text"
              className="text-zinc-500 text-sm font-medium bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 w-full ml-12"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add an optional description..."
            />
          </div>`;

const replaceStr = `<div className="flex items-start gap-3 w-full max-w-2xl">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600 shrink-0 mt-1.5">
              <LayoutTemplate size={24} />
            </div>
            <div className="flex flex-col w-full flex-1 gap-1">
              <textarea
                className={\`text-2xl font-bold text-zinc-800 bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 w-full resize-none overflow-hidden leading-tight \${error ? 'border-red-500 placeholder-red-300 text-red-600' : ''}\`}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (error) setError('');
                  if (!design.certificateTitle || design.certificateTitle === "Certificate of Completion")
                    updateDesignField("certificateTitle", e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = \`\${e.target.scrollHeight}px\`;
                }}
                rows={1}
                placeholder="Name your template..."
                required
              />
              <textarea
                className="text-zinc-500 text-sm font-medium bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-zinc-900 focus:outline-none transition-colors px-1 py-0.5 w-full resize-none overflow-hidden leading-relaxed"
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = \`\${e.target.scrollHeight}px\`;
                }}
                rows={1}
                placeholder="Add an optional description..."
              />
            </div>
          </div>`;

if (code.includes(targetStr)) {
  fs.writeFileSync('src/components/TemplateEditor.tsx', code.replace(targetStr, replaceStr));
  console.log("Success exact");
} else {
  // If exact match fails due to \r\n vs \n, try split/join
  const lines = code.split(/\\r?\\n/);
  // Find start and end indices
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('className="flex flex-col gap-1.5 w-full max-w-lg"')) {
      start = i;
    }
    if (start !== -1 && lines[i].includes('placeholder="Add an optional description..."')) {
      end = i + 2; // the div closing tag
      break;
    }
  }
  if (start !== -1 && end !== -1) {
    lines.splice(start, end - start + 1, replaceStr);
    fs.writeFileSync('src/components/TemplateEditor.tsx', lines.join('\\n'));
    console.log("Success lines splice");
  } else {
    console.log("Failed to find target");
  }
}
