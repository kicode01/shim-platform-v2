import json
import re

transcript_path = r"c:\Users\PC\.gemini\antigravity-ide\brain\e78ce851-958c-4b56-bde6-087f966a876e\.system_generated\logs\transcript_full.jsonl"

content = ""
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
        if data.get('type') == 'TOOL_RESPONSE' and 'Total Lines: 452' in data.get('content', ''):
            content = data['content']
            break

if not content:
    print("Could not find the 452-line content in transcript!")
    exit(1)

match = re.search(r'The following code has been modified.*?<original_line>.*?\n(.*?)The above content shows the entire', content, re.DOTALL)
if match:
    raw = match.group(1)
    out_lines = []
    for line in raw.split('\n'):
        # Remove the leading line number like '123: '
        clean_line = re.sub(r'^\d+: ', '', line)
        out_lines.append(clean_line)
    
    final_text = '\n'.join(out_lines)
    # Remove the last empty lines
    final_text = final_text.strip() + '\n'
    
    with open(r"c:\Users\PC\Desktop\SPPQ PROJECT - Copy\src\components\Navbar.tsx", 'w', encoding='utf-8') as out_f:
        out_f.write(final_text)
    print("Recovered Navbar.tsx! Length:", len(final_text))
else:
    print("Regex failed to match!")
