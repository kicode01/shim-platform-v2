import json

transcript_path = r"c:\Users\PC\.gemini\antigravity-ide\brain\e78ce851-958c-4b56-bde6-087f966a876e\.system_generated\logs\transcript_full.jsonl"
target_path = r"c:\Users\PC\Desktop\SPPQ PROJECT - Copy\src\components\Navbar.tsx"

content = ""
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'Total Lines: 452' in line and 'The following code has been modified' in line:
            data = json.loads(line)
            content = data.get('content', '')
            break

if not content:
    print("Could not find content")
    exit(1)

start_str = "The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.\n"
end_str = "\nThe above content shows the entire, complete file contents of the requested file."

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find start/end markers")
    exit(1)

raw = content[start_idx + len(start_str):end_idx]

out_lines = []
for line in raw.split('\n'):
    idx = line.find(': ')
    if idx != -1 and line[:idx].isdigit():
        out_lines.append(line[idx+2:])
    else:
        out_lines.append(line)

final_text = '\n'.join(out_lines) + '\n'

with open(target_path, 'w', encoding='utf-8') as out_f:
    out_f.write(final_text)

print(f"Successfully recovered Navbar.tsx! Lines: {len(out_lines)}")
