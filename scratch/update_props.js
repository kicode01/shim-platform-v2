const fs = require('fs');
let content = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const targetStr = `                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setShowSignatureModal(true)}`;

const insertStr = `                          <div className="flex items-center gap-2 mt-2 mb-1">
                            <input 
                              type="checkbox" 
                              id="showDivider" 
                              checked={selectedElement.showDivider !== false} 
                              onChange={(e) => updateSelectedElement({ showDivider: e.target.checked })} 
                              className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                            />
                            <label htmlFor="showDivider" className="text-xs font-medium text-zinc-600 cursor-pointer">Show Divider Line</label>
                          </div>

                          {!selectedElement.src && (
                            <div className="mt-2">
                              <label className="block text-xs font-medium text-zinc-600 mb-1">Cursive Signature Font</label>
                              <Select
                                value={selectedElement.fontFamily || ""}
                                onChange={(value) => updateSelectedElement({ fontFamily: value })}
                                options={[
                                  { value: "", label: "Default Cursive" },
                                  ...(GOOGLE_FONTS.find(g => g.group === "Handwriting & Signatures")?.fonts.map(font => ({ value: font, label: font })) || [])
                                ]}
                              />
                            </div>
                          )}

                          <div className="mt-4 pt-4 mb-4 border-t border-zinc-200 space-y-3">
                            <label className="block text-xs font-semibold text-zinc-800">Printed Typography</label>
                            
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Name Font</label>
                                <Select
                                  value={selectedElement.nameFontFamily || "var(--font-sans, sans-serif)"}
                                  onChange={(value) => {
                                    const updates = { nameFontFamily: value };
                                    const validWeights = FONT_WEIGHTS[value];
                                    if (validWeights) {
                                      const currentWeightStr = String(selectedElement.nameFontWeight || "bold");
                                      const isCurrentValid = currentWeightStr === "normal" 
                                        ? validWeights.includes("400") 
                                        : (currentWeightStr === "bold" ? validWeights.includes("700") : validWeights.includes(currentWeightStr));
                                      if (!isCurrentValid) {
                                        updates.nameFontWeight = validWeights.includes("400") ? "normal" : validWeights[0];
                                      }
                                    }
                                    updateSelectedElement(updates);
                                  }}
                                  options={[
                                    { value: "var(--font-sans, sans-serif)", label: "System Sans" },
                                    ...GOOGLE_FONTS.flatMap(group => [
                                      { value: \`group-\${group.group}\`, label: group.group, isGroupLabel: true },
                                      ...group.fonts.map(font => ({ value: font, label: font }))
                                    ])
                                  ]}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Weight</label>
                                <Select
                                  value={String(selectedElement.nameFontWeight || "bold")}
                                  onChange={(value) => updateSelectedElement({ nameFontWeight: value })}
                                  options={getWeightOptions(selectedElement.nameFontFamily || "var(--font-sans, sans-serif)")}
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Title Font</label>
                                <Select
                                  value={selectedElement.titleFontFamily || "var(--font-sans, sans-serif)"}
                                  onChange={(value) => {
                                    const updates = { titleFontFamily: value };
                                    const validWeights = FONT_WEIGHTS[value];
                                    if (validWeights) {
                                      const currentWeightStr = String(selectedElement.titleFontWeight || "normal");
                                      const isCurrentValid = currentWeightStr === "normal" 
                                        ? validWeights.includes("400") 
                                        : (currentWeightStr === "bold" ? validWeights.includes("700") : validWeights.includes(currentWeightStr));
                                      if (!isCurrentValid) {
                                        updates.titleFontWeight = validWeights.includes("400") ? "normal" : validWeights[0];
                                      }
                                    }
                                    updateSelectedElement(updates);
                                  }}
                                  options={[
                                    { value: "var(--font-sans, sans-serif)", label: "System Sans" },
                                    ...GOOGLE_FONTS.flatMap(group => [
                                      { value: \`group-\${group.group}\`, label: group.group, isGroupLabel: true },
                                      ...group.fonts.map(font => ({ value: font, label: font }))
                                    ])
                                  ]}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-1">Weight</label>
                                <Select
                                  value={String(selectedElement.titleFontWeight || "normal")}
                                  onChange={(value) => updateSelectedElement({ titleFontWeight: value })}
                                  options={getWeightOptions(selectedElement.titleFontFamily || "var(--font-sans, sans-serif)")}
                                />
                              </div>
                            </div>
                          </div>

` + targetStr;

const replaced = content.replace(targetStr.replace(/\r\n/g, '\n'), insertStr).replace(targetStr, insertStr);
fs.writeFileSync('src/components/TemplateEditor.tsx', replaced);
console.log('Replaced?', content !== replaced);
