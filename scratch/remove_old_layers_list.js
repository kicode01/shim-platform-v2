const fs = require('fs');

let code = fs.readFileSync('src/components/TemplateEditor.tsx', 'utf8');

// Use regex to remove the block
// It starts with {/* Layers List */} and ends after the two closing divs of that block.
// Let's just find the index of {/* Layers List */} and remove everything up to and including the closing </div></div>.
const startStr = '{/* Layers List */}';
const startIdx = code.indexOf(startStr);

if (startIdx !== -1) {
    // Find the next activeTab definition which is: ) : ( \n <motion.div \n key="json"
    const endStr = '</motion.div>\n            ) : (\n              <motion.div\n                key="json"';
    let endIdx = code.indexOf(endStr, startIdx);
    
    if (endIdx === -1) {
        // Fallback for different line endings
        const endStr2 = '</motion.div>\r\n            ) : (\r\n              <motion.div\r\n                key="json"';
        endIdx = code.indexOf(endStr2, startIdx);
    }
    
    if (endIdx !== -1) {
        // We want to remove from `startIdx` to the end of the `</div>` before `</motion.div>`.
        // Let's just remove from `startIdx` up to `</motion.div>` but keep `</motion.div>`.
        code = code.substring(0, startIdx - 17) + '\n' + code.substring(endIdx);
        
        fs.writeFileSync('src/components/TemplateEditor.tsx', code);
        console.log('Successfully removed old Layers List from sidebar.');
    } else {
        console.log('Could not find the end of the block.');
    }
} else {
    console.log('Could not find start marker.');
}
