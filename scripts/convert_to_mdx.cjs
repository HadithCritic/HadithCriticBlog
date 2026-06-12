const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'docs', 'source-material', 'abbasid-black-banner-mahdi-chapter.md');
const outputPath = path.join(__dirname, '..', 'src/components/article/AbbasidContent.mdx');

const content = fs.readFileSync(inputPath, 'utf8');

// The pattern for Hadith Blocks:
// 1. Line starts with ** (Source + Chain)
// 2. Blank line
// 3. Arabic text (has Arabic characters)
// 4. Blank line
// 5. English text

const lines = content.split('\n');
const newLines = [];

// Prepend imports
newLines.push(`import HadithBlock from './HadithBlock.astro';`);
newLines.push(`import ClaimBox from './ClaimBox.astro';`);
newLines.push(`import ContextNote from './ContextNote.astro';`);
newLines.push(`import VerdictBox from './VerdictBox.astro';`);
newLines.push(`\n`);

let i = 0;
while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if this looks like the start of a Hadith block
    // It starts with ** and might contain "Chain:"
    if (line.startsWith('**') && (line.includes('Chain:') || lines[i+1] === '' && i+2 < lines.length && /[\u0600-\u06FF]/.test(lines[i+2]))) {
        
        let sourceLine = line;
        
        // Sometimes the chain is multiple lines, but let's assume it's one line for now
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        
        if (j < lines.length && /[\u0600-\u06FF]/.test(lines[j])) {
            let arabicLines = [];
            while (j < lines.length && lines[j].trim() !== '') {
                arabicLines.push(lines[j].trim());
                j++;
            }
            
            while (j < lines.length && lines[j].trim() === '') j++;
            
            let englishLines = [];
            while (j < lines.length && lines[j].trim() !== '') {
                englishLines.push(lines[j].trim());
                j++;
            }
            
            // Output HadithBlock
            newLines.push(`<HadithBlock`);
            // Escape quotes in the strings
            const escapeStr = str => str.replace(/"/g, '&quot;').replace(/{/g, '&#123;').replace(/}/g, '&#125;');
            newLines.push(`  arabic="${escapeStr(arabicLines.join(' '))}"`);
            newLines.push(`  translation="${escapeStr(englishLines.join(' '))}"`);
            newLines.push(`  source="${escapeStr(sourceLine)}"`);
            newLines.push(`/>`);
            newLines.push(``);
            
            i = j;
            continue;
        }
    }
    
    // Escape unescaped curly braces in standard markdown so MDX doesn't crash
    // Only if it's not a block we are generating
    let safeLine = lines[i];
    
    // Replace { and } with HTML entities if not inside a component
    safeLine = safeLine.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
    
    // Also, if a paragraph starts with "The core claim:" or similar, we can wrap it in ClaimBox
    if (safeLine.includes('The central analytical task') || safeLine.includes('The methodological question is')) {
        newLines.push(`<ClaimBox title="Analytical Framework">`);
        newLines.push(`<p>${safeLine}</p>`);
        newLines.push(`</ClaimBox>`);
    } else {
        newLines.push(safeLine);
    }
    i++;
}

fs.writeFileSync(outputPath, newLines.join('\n'), 'utf8');
console.log('Successfully generated AbbasidContent.mdx');
