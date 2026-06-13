import fs from 'fs';
import path from 'path';

const articlesDir = path.join(process.cwd(), 'src/content/articles');
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.mdx'));

for (const file of files) {
    const filePath = path.join(articlesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // We want to fix empty lines inside <VerdictBox> ... </VerdictBox> and <ContextNote> ... </ContextNote> and <ClaimBox> ... </ClaimBox>
    // However, maybe it's easier to just fix the specific blocks.
    // Let's use a regex that matches these blocks
    const tagsToFix = ['VerdictBox', 'ContextNote', 'ClaimBox'];
    let changed = false;

    for (const tag of tagsToFix) {
        const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
        content = content.replace(regex, (match, inner) => {
            // Replace \n\n with '  \n' inside the block
            // But wait, what if there's a HadithBlock inside?
            // If there's an empty line between <HadithBlock> and the text, we might want to keep it or just use '  \n'.
            // Actually, MDX just needs the blank lines removed if they are causing paragraph splits that break the JSX tags.
            // A safer approach: for lines inside, if a line is just whitespace, remove it and add two spaces to the previous line.
            
            let lines = inner.split('\n');
            let newLines = [];
            for(let i=0; i<lines.length; i++) {
                if(lines[i].trim() === '') {
                    if (newLines.length > 0 && !newLines[newLines.length-1].trim().endsWith('>')) {
                        newLines[newLines.length-1] += '  ';
                    }
                    // skip adding the empty line, but maybe we should keep <br/> instead?
                    // Let's add an empty line back? NO, the empty line breaks MDX.
                    // Wait, if we just remove the empty line, it will concatenate paragraphs.
                } else {
                    newLines.push(lines[i]);
                }
            }
            return `<${tag}>\n${newLines.join('\n')}\n</${tag}>`;
        });
    }

    if (content !== fs.readFileSync(filePath, 'utf-8')) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed ${file}`);
    }
}
