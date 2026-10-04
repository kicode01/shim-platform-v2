import json
import re

transcript_path = r"c:\Users\PC\.gemini\antigravity-ide\brain\e78ce851-958c-4b56-bde6-087f966a876e\.system_generated\logs\transcript_full.jsonl"
target_path = r"c:\Users\PC\Desktop\SPPQ PROJECT - Copy\src\components\Navbar.tsx"

content = ""
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'TOOL_RESPONSE' and 'Total Lines: 452' in data.get('content', ''):
            content = data['content']

out_lines = []
for line in content.split('\n'):
    m = re.match(r'^\d+: (.*)', line)
    if m:
        out_lines.append(m.group(1))
    elif re.match(r'^\d+:', line):
        out_lines.append("")

with open(target_path, 'w', encoding='utf-8') as out_f:
    out_f.write('\n'.join(out_lines))
print("done")
