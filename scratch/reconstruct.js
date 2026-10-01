const fs = require('fs');
const cp = require('child_process');

function reconstruct() {
  const history = fs.readFileSync('scratch/history.txt', 'utf8').split('\n');
  
  // Create a clean checkout
  cp.execSync('git checkout src/components/TemplateEditor.tsx', { stdio: 'inherit' });
  cp.execSync('git checkout src/components/CertificateView.tsx', { stdio: 'inherit' });
  
  // We only run up to line 138 (fix_rnd_nan.js) because fix_rnd_maxcontent.js broke the file size
  for (let i = 0; i < 138; i++) {
    const cmd = history[i].trim().replace(/^"|"$/g, '');
    if (!cmd) continue;
    
    // Some lines have && or ;
    console.log(`Running [${i+1}/138]: ${cmd}`);
    try {
      cp.execSync(cmd, { stdio: 'inherit', shell: true });
    } catch (e) {
      console.log(`Error running ${cmd}`);
    }
  }
}

reconstruct();
