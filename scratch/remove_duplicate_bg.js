const fs = require('fs');
let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const targetGlobalBg = `                {/* Global Background */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-2 mb-3 flex items-center justify-between">
                    Canvas Background
                  </h4>
                  <label className="btn-secondary w-full justify-center cursor-pointer text-sm py-2">
                    <ImageIcon size={16} className="mr-2 text-zinc-500" /> Upload Background
                    <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {design.backgroundImageUrl && (
                    <button onClick={() => updateDesignField("backgroundImageUrl", null)} className="text-sm font-medium text-red-600 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Background</button>
                  )}
                  

                </div>`;

code = code.replace(targetGlobalBg, '');
if (code.indexOf(targetGlobalBg) === -1) {
    code = code.replace(targetGlobalBg.replace(/\n/g, '\r\n'), '');
}

const targetBgTabEnd = `                      </label>
                    </div>


                  </div>
                </motion.div>`;

const replaceBgTabEnd = `                      </label>
                    </div>

                    {design.backgroundImageUrl && (
                      <button onClick={() => updateDesignField("backgroundImageUrl", null)} className="text-sm font-medium text-red-600 w-full text-center hover:text-red-700 transition-colors mt-2">Remove Background</button>
                    )}

                  </div>
                </motion.div>`;

code = code.replace(targetBgTabEnd, replaceBgTabEnd);
if (code.indexOf(targetBgTabEnd) === -1) {
    code = code.replace(targetBgTabEnd.replace(/\n/g, '\r\n'), replaceBgTabEnd.replace(/\n/g, '\r\n'));
}

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Fixed background redundancy part 2');
