// Fails the build if any .mdx article has an escaped footnote marker
// (\[^n\]), which renders as literal text instead of a footnote link.
// This happens when content is pasted from editors that auto-escape brackets.
import { glob, readFile } from 'node:fs/promises';

const files = await Array.fromAsync(glob('src/content/articles/**/*.mdx'));
const escapedFootnote = /\\\[\^[^\]]*\\\]/g;
let errorCount = 0;

for (const file of files) {
  const content = await readFile(file, 'utf-8');
  const matches = content.match(escapedFootnote);
  if (matches) {
    console.error(`${file}: ${matches.length} escaped footnote(s) found:`);
    for (const match of matches) console.error(`  ${match}`);
    errorCount++;
  }
}

if (errorCount > 0) {
  console.error(`\n${errorCount} file(s) with escaped footnotes. Fix before building.`);
  process.exit(1);
}

console.log('All footnotes properly formatted.');
