#!/usr/bin/env node
/* Copy the current prerendered Tafsir page bodies into editable, per-verse HTML
   source files. Existing files are never overwritten by this importer. */
import fs from 'node:fs';
import path from 'node:path';
import { parse, serialize } from 'parse5';

const inputRoot = path.resolve('dist/client/projects/tafsir');
const outputRoot = path.resolve('src/data/tafsir-pages');
const overwrite = process.argv.includes('--overwrite');

if (!fs.existsSync(inputRoot)) {
  throw new Error(`Build output not found at ${inputRoot}. Run npm run build first.`);
}

function findReader(node) {
  if (node.tagName) {
    const classNames = node.attrs?.find((attr) => attr.name === 'class')?.value.split(/\s+/) ?? [];
    if (classNames.includes('hc-page') && classNames.includes('tfr')) return node;
  }
  for (const child of node.childNodes ?? []) {
    const result = findReader(child);
    if (result) return result;
  }
  return null;
}

let imported = 0;
let bytes = 0;
for (const workId of fs.readdirSync(inputRoot)) {
  if (workId !== 'tabari') continue;
  const workPath = path.join(inputRoot, workId);
  if (!fs.statSync(workPath).isDirectory()) continue;
  for (const surahName of fs.readdirSync(workPath)) {
    if (surahName !== '1') continue;
    const surahPath = path.join(workPath, surahName);
    if (!fs.statSync(surahPath).isDirectory()) continue;
    for (const verseName of fs.readdirSync(surahPath)) {
      const verseNumber = Number(verseName);
      if (!Number.isInteger(verseNumber) || verseNumber < 1 || verseNumber > 7) continue;
      const sourcePath = path.join(surahPath, verseName, 'index.html');
      if (!fs.existsSync(sourcePath)) continue;

      const document = parse(fs.readFileSync(sourcePath, 'utf8'));
      const reader = findReader(document);
      if (!reader) throw new Error(`No Tafsir reader found in ${sourcePath}`);
      if (!reader.attrs?.some((attr) => attr.name === 'data-reader')) {
        throw new Error(`Tafsir reader root is missing its controls marker in ${sourcePath}`);
      }

      const destination = path.join(outputRoot, workId, surahName.padStart(3, '0'), `${verseName.padStart(3, '0')}.html`);
      if (fs.existsSync(destination) && !overwrite) throw new Error(`Refusing to overwrite existing source HTML: ${destination}; pass --overwrite to replace it`);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      const html = `${serialize({ nodeName: '#document-fragment', childNodes: [reader] })}\n`;
      fs.writeFileSync(destination, html, 'utf8');
      imported++;
      bytes += Buffer.byteLength(html);
    }
  }
}

if (imported === 0) throw new Error(`No prerendered Tafsir pages found under ${inputRoot}`);
console.log(`Imported ${imported.toLocaleString('en-US')} editable Tafsir pages (${(bytes / 1024 / 1024).toFixed(1)} MiB).`);
