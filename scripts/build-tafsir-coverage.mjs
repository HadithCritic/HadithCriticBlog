/* Writes src/data/tafsir-coverage.json: for each commentary on the Tafsir
   front page, how much of the Arabic there is and how much of it the site has
   in English. The front page draws its progress bars from this file.

     node scripts/build-tafsir-coverage.mjs [path/to/Tafsir al-Tabari]

   Where the numbers come from:

   - al-Ṭabarī: translation_progress_audit.json in the al-Ṭabarī folder of the
     tafsir library (default: ~/Desktop/Tafsir/Tafsir al-Tabari). It counts the
     Arabic edition's commentary passages and editor's notes and how many of
     each have English.
   - Mujāhid, al-Thawrī: the reports in the page bodies under
     src/data/tafsir-pages/<id>/, each of which holds its Arabic and its English.
   - al-Zamakhsharī: src/data/tafsir-pages/zamakhshari/index.json, where
     scripts/build-tafsir-zamakhshari.mjs records the printed pages of the
     Arabic export and of the translation. */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const tabariDir = resolve(process.argv[2] ?? join(homedir(), 'Desktop', 'Tafsir', 'Tafsir al-Tabari'));
const pagesRoot = resolve('src/data/tafsir-pages');
const json = (file) => JSON.parse(readFileSync(file, 'utf8'));

function reportsOf(id) {
  let arabic = 0;
  let english = 0;
  for (const file of readdirSync(join(pagesRoot, id)).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(join(pagesRoot, id, file), 'utf8');
    for (const [report] of html.matchAll(/<article class="report"[\s\S]*?<\/article>/g)) {
      arabic++;
      const text = report.match(/report__column--en[\s\S]*?<div class="report__text">([\s\S]*?)<\/div>/)?.[1] ?? '';
      if (text.replace(/<[^>]+>/g, '').trim().length > 1) english++;
    }
  }
  return { unit: 'report', arabic, english };
}

const audit = json(join(tabariDir, 'translation_progress_audit.json')).summary;
const tabariIndex = json(resolve('src/data/tafsir/tabari/index.json'));
const kashshaf = json(join(pagesRoot, 'zamakhshari', 'index.json'));

const coverage = {
  tabari: {
    unit: 'passage',
    arabic: audit.commentary_total_units,
    english: audit.commentary_coverage_units,
    surahs: { arabic: audit.surahs, english: tabariIndex.surahs.length },
    notes: { arabic: audit.surah_source_footnotes_total, english: audit.editor_footnotes_translated },
  },
  mujahid: reportsOf('mujahid'),
  thawri: reportsOf('thawri'),
  zamakhshari: {
    unit: 'printed page',
    arabic: kashshaf.sourceTotals.pages,
    english: kashshaf.translated.pages,
    surahs: { arabic: kashshaf.sourceTotals.surahs, english: kashshaf.translated.surahs },
  },
};

writeFileSync(resolve('src/data/tafsir-coverage.json'), `${JSON.stringify(coverage, null, 1)}\n`);
for (const [id, c] of Object.entries(coverage)) {
  process.stdout.write(`${id}: ${c.english} of ${c.arabic} ${c.unit}s (${Math.floor((c.english / c.arabic) * 100)}%)\n`);
}
