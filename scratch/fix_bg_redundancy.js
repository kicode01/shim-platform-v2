const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const target1 = `                                      <div className="pt-4 border-t border-zinc-100">
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Upload Background</label>`;
                    
code = code.replace(target1, '');
if (code.indexOf(target1) === -1) {
    code = code.replace(target1.replace(/\n/g, '\r\n'), '');
}

const target2 = `                      </label>
                    </div>
                  </div>`;
                  
const replace2 = `                      </label>
                    </div>`;
                    
code = code.replace(target2, replace2);
if (code.indexOf(target2) === -1) {
    code = code.replace(target2.replace(/\n/g, '\r\n'), replace2.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed background redundancy');
