const fs = require('fs');

let content = fs.readFileSync('21-hadith-the-prophet-was-bewitched-by-a-jew.mdx', 'utf-8');
const lines = content.split('\n');
const out = [];

let i = 0;
while (i < lines.length) {
    let line = lines[i];

    // Table 1
    if (line.trim() === '**Narration**') {
        out.push('| Narration | Arabic Matn | English Translation | Differences/Omissions/Additions | Context/Location |');
        out.push('|---|---|---|---|---|');
        
        i += 2; // skip Arabic Matn
        i += 2; // skip English Trans
        i += 2; // skip Differences
        i += 2; // skip Context/Location
        
        while (i < lines.length) {
            while (i < lines.length && !lines[i].trim()) i++;
            if (i >= lines.length) break;
            
            let val1 = lines[i].trim();
            if (val1.startsWith('The hadith about the Prophet being affected by magic appears to have originated')) {
                break;
            }
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val2 = i < lines.length ? lines[i].trim() : '';
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val3 = i < lines.length ? lines[i].trim() : '';
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val4 = i < lines.length ? lines[i].trim() : '';
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val5 = i < lines.length ? lines[i].trim() : '';
            
            val1 = val1.replace(/\|/g, '\\|');
            val2 = val2.replace(/\|/g, '\\|');
            val3 = val3.replace(/\|/g, '\\|');
            val4 = val4.replace(/\|/g, '\\|');
            val5 = val5.replace(/\|/g, '\\|');
            
            out.push(`| ${val1} | ${val2} | ${val3} | ${val4} | ${val5} |`);
            i++;
        }
        continue;
    }
    
    // Table 2
    if (line.trim() === '**Critic**') {
        out.push('| Critic | Criticism | Source |');
        out.push('|---|---|---|');
        
        i += 2; // skip Criticism
        i += 2; // skip Source
        
        while (i < lines.length) {
            while (i < lines.length && !lines[i].trim()) i++;
            if (i >= lines.length) break;
            
            let val1 = lines[i].trim();
            if (val1.startsWith('Given the absence of corroboration') || val1.startsWith('_Tahdhib') || val1.startsWith('Given')) {
                // Check if it's actually the end text
                if (!val1.startsWith('Malik ibn Anas') && !val1.startsWith('Ya\'qub') && !val1.startsWith('Ibn Kharrash') && !val1.startsWith('Malik')) {
                    break;
                }
            }
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val2 = i < lines.length ? lines[i].trim() : '';
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val3 = i < lines.length ? lines[i].trim() : '';
            
            val1 = val1.replace(/\|/g, '\\|');
            val2 = val2.replace(/\|/g, '\\|');
            val3 = val3.replace(/\|/g, '\\|');
            
            out.push(`| ${val1} | ${val2} | ${val3} |`);
            i++;
        }
        continue;
    }

    // Table 3
    if (line.trim() === '**Hadith Source**') {
        out.push('| Hadith Source | Text | Omissions/Changes/Notes |');
        out.push('|---|---|---|');
        
        i += 2; // skip Text
        i += 2; // skip Omissions
        
        while (i < lines.length) {
            while (i < lines.length && !lines[i].trim()) i++;
            if (i >= lines.length) break;
            
            let val1 = lines[i].trim();
            if (val1.startsWith('The content of these narrations is simpler')) {
                break;
            }
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val2 = i < lines.length ? lines[i].trim() : '';
            
            i++; while (i < lines.length && !lines[i].trim()) i++;
            let val3 = i < lines.length ? lines[i].trim() : '';
            
            val1 = val1.replace(/\|/g, '\\|');
            val2 = val2.replace(/\|/g, '\\|');
            val3 = val3.replace(/\|/g, '\\|');
            
            out.push(`| ${val1} | ${val2} | ${val3} |`);
            i++;
        }
        continue;
    }

    out.push(line);
    i++;
}

fs.writeFileSync('21-hadith-the-prophet-was-bewitched-by-a-jew.mdx', out.join('\n'), 'utf-8');
console.log('Fixed tables in article 21');
