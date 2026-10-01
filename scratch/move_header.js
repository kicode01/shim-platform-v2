const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

const targetHeader = `<h1 className="text-3xl font-bold text-zinc-700 flex items-center gap-3 mb-1">
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600 shrink-0">
              <LayoutTemplate size={24} />
            </div>
            {isEdit ? "Edit Template" : "Template Studio"}
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Build and edit dynamic certificate layouts.
          </p>`;

const newHeader = `<div className="flex flex-col gap-1.5 w-full max-w-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-600 shrink-0">
                <LayoutTemplate size={24} />
              </div>
              <input 
                type="text" 
                className={\`text-2xl font-bold text-zinc-800 bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors px-1 py-0.5 w-full \${error ? 'border-red-500 placeholder-red-300 text-red-600' : ''}\`}
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
              className="text-zinc-500 text-sm font-medium bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors px-1 py-0.5 w-full ml-12"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add an optional description..."
            />
          </div>`;

code = code.replace(targetHeader, newHeader);
if (code.indexOf(newHeader) === -1) {
    code = code.replace(targetHeader.replace(/\n/g, '\r\n'), newHeader.replace(/\n/g, '\r\n'));
}

const targetForm = `<div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Template Name *</label>
                    <input type="text" className={\`input-field \${error ? 'border-red-500 ring-red-500' : ''}\`} value={name} onChange={e => { 
                      setName(e.target.value); 
                      if (error) setError('');
                      if (!design.certificateTitle || design.certificateTitle === "Certificate of Completion") 
                        updateDesignField("certificateTitle", e.target.value); 
                    }} placeholder="e.g. VIP Attendee" required />
                    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">Description (Optional)</label>
                    <input type="text" className="input-field" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Custom certificate template layout." />
                  </div>
                </div>

                <div className="h-px bg-zinc-200 my-6"></div>`;

code = code.replace(targetForm, '');
code = code.replace(targetForm.replace(/\n/g, '\r\n'), '');

fs.writeFileSync('src/components/TemplateEditor.tsx', code);
console.log('Successfully moved name and description to header');
