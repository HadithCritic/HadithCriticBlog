#!/usr/bin/env node
/*
 * Confirms that the Arabic shown on each 2nd century reader page is the source Arabic, unaltered.
 * For every shape B collection it compares the multiset of Arabic-script characters (letters and vowel
 * marks; digits, punctuation, whitespace and the printed-number prefix are ignored) between the source
 * page records that the edition includes and the Isnad and Matn paragraphs of the built chapter pages.
 *
 * Usage: node scripts/verify-arabic-multiset.mjs "<english-dir>"
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const specs = JSON.parse(fs.readFileSync('src/data/reader-editions.json', 'utf8'));
const arabic = text => [...String(text).replace(/&[a-z#0-9]+;/g, ' ')].filter(ch => /[ء-يً-ْٰٱ]/.test(ch));
const tally = chars => chars.reduce((map, ch) => map.set(ch, (map.get(ch) ?? 0) + 1), new Map());
let failures = 0;
for (const spec of specs) {
  const root = path.join('src/data/hadith-pages', spec.slug);
  const file = path.join(root, 'publication-source.json');
  if (!fs.existsSync(file)) continue;
  const source = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (source.schema_version !== 'hadithcritic.reader-source/1.0' || !source.groups?.[0]?.records?.[0]?.text_ar) continue;
  const raw = fs.readdirSync(dir).find(name => name.startsWith(`${source.compilation.shamela_book_id}_`));
  const pages = JSON.parse(fs.readFileSync(path.join(dir, raw), 'utf8')).pages;
  const used = new Set(source.groups.flatMap(group => group.records.map(record => record.source_id)));
  const expected = tally(arabic(pages.filter(page => used.has(String(page.serial_number))).map(page => page.text).join(' ')));
  let html = '';
  for (const name of fs.readdirSync(path.join(root, 'chapters'))) {
    const page = fs.readFileSync(path.join(root, 'chapters', name), 'utf8');
    for (const article of page.matchAll(/<article class="hadith"[\s\S]*?<\/article>/g)) {
      const column = article[0].match(/column-ar[\s\S]*?(?=class="details-grid")/)?.[0] ?? '';
      html += [...column.matchAll(/<p class="(?:isnad|matn)">([\s\S]*?)<\/p>/g)].map(match => match[1].replace(/<[^>]+>/g, '')).join(' ') + ' ';
    }
  }
  const got = tally(arabic(html));
  const diff = [...new Set([...expected.keys(), ...got.keys()])].filter(ch => (expected.get(ch) ?? 0) !== (got.get(ch) ?? 0));
  const ok = diff.length === 0;
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${spec.slug}: ${[...expected.values()].reduce((a, b) => a + b, 0)} Arabic characters${ok ? '' : `, ${diff.length} differing`}`);
}
process.exit(failures ? 1 : 0);
