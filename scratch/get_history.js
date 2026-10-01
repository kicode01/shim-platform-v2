const fs = require('fs');

function getScriptHistory() {
  const logFile = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\8a3f54da-1825-4566-9676-c58494e35e8e\\.system_generated\\logs\\transcript.jsonl';
  const lines = fs.readFileSync(logFile, 'utf8').split('\n');
  
  const commands = [];
  
  for (const line of lines) {
    if (!line) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.tool_calls) {
        for (const call of obj.tool_calls) {
          if (call.name === 'run_command' && call.args && call.args.CommandLine) {
            const cmd = call.args.CommandLine;
            if (cmd.includes('node scratch/') || cmd.includes('node scratch\\')) {
              commands.push(cmd);
            }
          }
        }
      }
    } catch (e) {}
  }
  
  fs.writeFileSync('scratch/history.txt', commands.join('\n'));
}

getScriptHistory();
