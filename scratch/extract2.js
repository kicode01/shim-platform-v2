const fs = require('fs');

function extractLastTemplateEditor() {
  const logFile = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\8a3f54da-1825-4566-9676-c58494e35e8e\\.system_generated\\logs\\transcript_full.jsonl';
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  
  let bestChunks = null;
  
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    
    if (line.includes('multi_replace_file_content')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const call of obj.tool_calls) {
            if (call.name === 'multi_replace_file_content') {
              if (call.args.TargetFile && call.args.TargetFile.includes('TemplateEditor.tsx')) {
                console.log('Found multi_replace_file_content!');
                bestChunks = call.args;
              }
            }
          }
        }
      } catch (e) {}
    }
  }
}

extractLastTemplateEditor();
