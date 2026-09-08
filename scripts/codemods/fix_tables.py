
import sys

with open(sys.argv[1], 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.strip() == '**Criticizer**':
        out.append('| Criticizer | Statement / Accusation | Citation |\n')
        out.append('|---|---|---|\n')
        
        i += 1
        while i < len(lines) and not lines[i].strip(): i += 1
        i += 1
        while i < len(lines) and not lines[i].strip(): i += 1
        i += 1
        
        while i < len(lines):
            while i < len(lines) and not lines[i].strip(): i += 1
            if i >= len(lines): break
            
            val1 = lines[i].strip()
            if val1.startswith('##') or val1.startswith('Wow,') or val1.startswith('This list') or val1.startswith('http') or val1.startswith('The Response') or val1.startswith('['):
                break
                
            i += 1
            while i < len(lines) and not lines[i].strip(): i += 1
            val2 = lines[i].strip() if i < len(lines) else ''
            
            i += 1
            while i < len(lines) and not lines[i].strip(): i += 1
            val3 = lines[i].strip() if i < len(lines) else ''
            
            val1 = val1.replace('|', '\\|')
            val2 = val2.replace('|', '\\|')
            val3 = val3.replace('|', '\\|')
            
            out.append(f'| {val1} | {val2} | {val3} |\n')
            i += 1
        continue
    else:
        out.append(line)
        i += 1

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.writelines(out)

