import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');
const files = [];
const walk = (directory) => readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const file = join(directory, entry.name);
  entry.isDirectory() ? walk(file) : /\.(astro|css|ts|tsx|js|mjs)$/.test(file) && files.push(file);
});
walk(sourceRoot);

const failures = [];
const warnings = [];
const report = (list, file, line, message) => list.push(`${relative(root, file)}:${line} ${message}`);
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const mainCount = (content.match(/<main\b/g) || []).length;
  if (mainCount > 1) report(failures, file, 1, 'nested or duplicate <main> landmarks');
  for (const tag of content.matchAll(/<a\b[\s\S]*?>/g)) {
    if (/target=["']_blank["']/.test(tag[0]) && !/rel=["'][^"']*noopener[^"']*noreferrer/.test(tag[0])) {
      const line = content.slice(0, tag.index).split(/\r?\n/).length;
      report(failures, file, line, 'target=_blank without noopener noreferrer');
    }
  }
  lines.forEach((line, index) => {
    const number = index + 1;
    if (/href=["']#["']/.test(line)) report(failures, file, number, 'placeholder href="#"');
    if (/<img\b[^>]*>/.test(line) && !/\balt=/.test(line)) report(failures, file, number, 'content image missing alt');
    if (/<(?:div|span)\b[^>]*(?:on:click|onclick)=/.test(line) && !/\b(role=|on:keydown|onkeydown=)/.test(line)) report(failures, file, number, 'non-semantic clickable element');
    if (/max-width:\s*100(?:d)?vw/.test(line) || /overflow-x:\s*hidden/.test(line)) report(failures, file, number, 'global overflow masking rule');
    if (/animation-iteration-count:\s*infinite|repeat:\s*-1|\b(?:elastic|bounce)\b/i.test(line)) report(warnings, file, number, 'discouraged motion pattern');
    if (/backdrop-filter/.test(line)) report(warnings, file, number, 'backdrop filter should remain exceptional');
    if (/border-radius:\s*(?:2[1-9]|[3-9]\d)px/.test(line)) report(warnings, file, number, 'large radius outside allowed components');
    if (/\b(unlock|supercharge|seamless|revolutionize)\b/i.test(line)) report(warnings, file, number, 'generic UI phrase');
  });
}
for (const warning of warnings) console.warn(`warning: ${warning}`);
for (const failure of failures) console.error(`error: ${failure}`);
if (failures.length) process.exit(1);
console.log(`Design audit passed (${files.length} source files checked).`);
