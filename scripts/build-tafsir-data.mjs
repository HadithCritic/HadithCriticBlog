/* Build al-Tabari's commentary for the Tafsir project from the English
   collection.

   Each commentary in the project has its own folder, src/data/tafsir/<work>/,
   and its own entry in src/data/tafsir.ts. This script fills the "tabari"
   folder from one large JSON file (tabari_surahs_*_en_full.json, ~48 MB) that
   stays out of git:

     surahs/NNN.json   one per surah: its passages already read into blocks
     index.json        what has been imported, with counts
   and writes a coverage report to docs/research/tafsir/.

   For every passage the classifier (scripts/lib/tafsir) decides where blocks
   begin and what kind each is. Before anything is written the blocks are
   flattened back to text and compared with the source; a passage that does
   not reproduce its source word for word is published as plain paragraphs
   instead and listed for review. The only edits to the English are the ʿ for
   the backtick some editions use and collapsed spacing.

   Usage:
     node scripts/build-tafsir-data.mjs <source.json>            every surah in the file
     node scripts/build-tafsir-data.mjs <source.json> 1 83 112   only these
*/
import fs from 'node:fs';
import path from 'node:path';
import { normalize } from './lib/tafsir/normalize.mjs';
import { blockPlain, classify, reproduces, versePhrases } from './lib/tafsir/classify.mjs';
import { inline, surahResolver, unsentinel, wordCount } from './lib/tafsir/text.mjs';

const [sourcePath, ...surahArgs] = process.argv.slice(2);
if (!sourcePath) {
  console.error('Usage: node scripts/build-tafsir-data.mjs <source.json> [surah ...]');
  process.exit(1);
}

const WORK = 'tabari';
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'src', 'data', 'tafsir', WORK);
const surahDir = path.join(outDir, 'surahs');
const reportDir = path.join(root, 'docs', 'research', 'tafsir');
fs.mkdirSync(surahDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const quran = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'quran-verses.json'), 'utf8'));
const names = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'quran-sura-names.json'), 'utf8'));
const verseCount = new Map(names.map((s) => [s.n, s.verses]));
const verses = (s) => verseCount.get(s) ?? 0;
const surahByName = surahResolver(names);
const wanted = surahArgs.length ? new Set(surahArgs.map(Number)) : null;

const itemSource = (item) =>
  item.kind === 'report' ? `${item.isnad} ${item.matn}` : item.kind === 'poem' ? item.lines.join(' ') : item.text;

const FLAG_MEANING = {
  'report-chain-unread': 'A report whose chain the parser could not separate from its text; shown whole.',
  'report-long': 'A report over 1,800 characters: the end of the report may run into the commentator\'s own discussion.',
  'objection-without-answer': '"If someone says" with no answer formula within six sentences; left as prose.',
  'poem-without-gloss': 'Verse identified from its introduction alone, with no "He means" gloss after it.',
  'integrity-fallback': 'The classified blocks did not reproduce the source exactly, so the passage is shown as plain paragraphs.',
};

const coverage = [];
const review = [];
const indexPath = path.join(outDir, 'index.json');
const previous = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, 'utf8')) : { surahs: [] };
const imported = new Map((wanted ? previous.surahs : []).map((s) => [s.n, s]));

for (const record of source.surahs) {
  const number = (record.surah ?? record).number;
  if (wanted && !wanted.has(number)) continue;
  const surah = normalize(record);
  const english = (a, b) => Array.from({ length: (b ?? a) - a + 1 }, (_, i) => quran[`${number}:${a + i}`]?.en ?? '').join(' ');

  const stat = {
    n: number, shape: surah.shape, ayahs: surah.ayahCount, units: surah.units.length, words: 0, notes: surah.notes.length,
    blocks: {}, reports: { typed: 0, chain: 0, whole: 0 }, readings: { none: 0, discussed: 0, preference: 0 },
    integrity: { exact: 0, fallback: 0 }, flags: {}, markers: surah.stats, translator: surah.translation.credit ? 'named' : 'not named',
    versesWithCommentary: 0, translatorNotes: 0,
  };

  const units = {};
  for (const unit of surah.units) {
    const text = unit.items.map(itemSource).join(' ');
    const ctx = {
      verses,
      surah: surahByName,
      phrases: (surah.shape === 'A' || surah.shape === 'B') && unit.start ? versePhrases(unsentinel(text), english(unit.start, unit.end)) : [],
    };
    let result = classify(unit.items, ctx);
    if (!reproduces(result.blocks, text)) {
      // Never publish a reading that loses or alters the source: fall back to paragraphs.
      const blocks = unit.items.flatMap((item) => itemSource(item).split(/\n+/).filter((p) => p.trim()).map((p) => ({ t: 'p', x: inline(p.trim(), { verses, surah: surahByName }) })));
      result = { blocks, sections: [{ k: 'explain', b: blocks.map((_, i) => i) }], readings: { status: 'none', names: [], regions: [], evidence: [] }, flags: ['integrity-fallback'] };
      stat.integrity.fallback++;
      if (!reproduces(blocks, text)) throw new Error(`Surah ${number} unit ${unit.id}: even the plain fallback does not reproduce the source.`);
    } else stat.integrity.exact++;

    const words = result.blocks.reduce((sum, b) => sum + wordCount(blockPlain(b)), 0);
    stat.words += words;
    for (const b of result.blocks) {
      stat.blocks[b.t] = (stat.blocks[b.t] ?? 0) + 1;
      if (b.t === 'report') b.typed ? stat.reports.typed++ : b.c ? stat.reports.chain++ : stat.reports.whole++;
    }
    for (const f of result.flags) {
      stat.flags[f] = (stat.flags[f] ?? 0) + 1;
      review.push({ ref: unit.start ? `${number}:${unit.start}${unit.end > unit.start ? `–${unit.end}` : ''}` : `${number} (introduction)`, unit: unit.id, flag: f });
    }
    stat.translatorNotes += unit.translatorNotes?.length ?? 0;
    units[unit.id] = {
      k: unit.kind, s: unit.start, e: unit.end, ed: unit.edition, w: words,
      b: result.blocks, sec: result.sections, rd: result.readings,
      ...(unit.translatorNotes?.length ? { tn: unit.translatorNotes } : {}),
      ...(result.flags.length ? { fl: [...new Set(result.flags)] } : {}),
    };
  }

  // Which passages and notes belong on each verse page.
  const introIds = surah.units.filter((u) => u.kind === 'intro').map((u) => u.id);
  const ayahs = [];
  for (let v = 1; v <= surah.ayahCount; v++) {
    const ids = surah.ayahIndex
      ? (surah.ayahIndex[v] ?? []).filter((id) => units[id] && units[id].k !== 'intro')
      : surah.units.filter((u) => u.kind !== 'intro' && u.start <= v && v <= u.end).map((u) => u.id);
    const shown = new Set([...ids, ...(v === 1 ? introIds : [])]);
    const noteIdx = surah.notes.flatMap((note, i) => {
      if (surah.shape === 'A' || surah.shape === 'B') {
        return (note.start == null ? v === 1 : note.start <= v && v <= note.end) ? [i] : [];
      }
      return shown.has(note.unit) || (note.unit === 0 && v === 1 && !introIds.length) ? [i] : [];
    });
    const readings = ids.map((id) => units[id].rd.status);
    const status = readings.includes('preference') ? 'preference' : readings.includes('discussed') ? 'discussed' : 'none';
    stat.readings[status]++;
    if (ids.length) stat.versesWithCommentary++;
    ayahs.push({ n: v, u: ids, nt: noteIdx, ...(surah.withoutUnit.includes(v) ? { wu: 1 } : {}) });
  }

  const out = {
    n: number, shape: surah.shape, ayahCount: surah.ayahCount, translation: surah.translation,
    intro: introIds, units, ayahs, notes: surah.notes.map(({ volume, page, n, en, ar }) => ({ v: volume, p: page, n, en, ar })),
  };
  const file = path.join(surahDir, `${String(number).padStart(3, '0')}.json`);
  fs.writeFileSync(file, `${JSON.stringify(out)}\n`);
  imported.set(number, { n: number, ayahs: surah.ayahCount, words: stat.words, notes: surah.notes.length, shape: surah.shape });
  coverage.push(stat);
  console.log(`surah ${String(number).padStart(3)} ${surah.shape}: ${surah.units.length} units, ${stat.words.toLocaleString('en-US')} words, ` +
    `${stat.integrity.exact} exact / ${stat.integrity.fallback} fallback, ${(fs.statSync(file).size / 1024).toFixed(0)} KB`);
}

fs.writeFileSync(indexPath, `${JSON.stringify({
  work: 'Tafsir al-Tabari (Jāmiʿ al-bayān ʿan taʾwīl āy al-Qurʾān)',
  available: source.coverage?.surah_numbers ?? [],
  license: source.license,
  surahs: [...imported.values()].sort((a, b) => a.n - b.n),
}, null, 2)}\n`);

/* ── Coverage report ───────────────────────────────────────────── */

if (!wanted) {
  const sum = (f) => coverage.reduce((n, s) => n + f(s), 0);
  const merge = (f) => coverage.reduce((acc, s) => {
    for (const [k, v] of Object.entries(f(s))) acc[k] = (acc[k] ?? 0) + v;
    return acc;
  }, {});
  const totals = {
    surahs: coverage.length, verses: sum((s) => s.ayahs), versesWithCommentary: sum((s) => s.versesWithCommentary),
    units: sum((s) => s.units), words: sum((s) => s.words), notes: sum((s) => s.notes), translatorNotes: sum((s) => s.translatorNotes),
    integrity: merge((s) => s.integrity), blocks: merge((s) => s.blocks), reports: merge((s) => s.reports),
    readings: merge((s) => s.readings), flags: merge((s) => s.flags), markers: merge((s) => s.markers),
    shapes: merge((s) => ({ [s.shape]: 1 })), translatorNotNamed: coverage.filter((s) => s.translator === 'not named').map((s) => s.n),
  };
  fs.writeFileSync(path.join(reportDir, 'tabari-coverage.json'), `${JSON.stringify({ generated: new Date().toISOString().slice(0, 10), totals, surahs: coverage, review }, null, 1)}\n`);
  const pct = (a, b) => `${((100 * a) / Math.max(1, b)).toFixed(1)}%`;
  const reportsAll = totals.reports.typed + totals.reports.chain + totals.reports.whole;
  const md = [
    '# Tafsir al-Ṭabarī: import coverage',
    '',
    `Generated by \`scripts/build-tafsir-data.mjs\` on ${new Date().toISOString().slice(0, 10)}. Full numbers per surah and the review list are in \`tabari-coverage.json\`.`,
    '',
    '## Totals',
    '',
    `| Measure | Count |`,
    `|---|---|`,
    `| Surahs imported | ${totals.surahs} (shapes: ${Object.entries(totals.shapes).map(([k, v]) => `${k} ${v}`).join(', ')}) |`,
    `| Verses | ${totals.verses.toLocaleString('en-US')}, of which ${totals.versesWithCommentary.toLocaleString('en-US')} have a passage of their own |`,
    `| Passages (units) | ${totals.units.toLocaleString('en-US')} |`,
    `| Words of commentary | ${totals.words.toLocaleString('en-US')} |`,
    `| Editor's notes | ${totals.notes.toLocaleString('en-US')}; ${totals.markers.markersLinked ?? 0} in-text markers linked to their note, ${totals.markers.markersUnmatched ?? 0} markers whose note could not be matched (left as plain text), ${totals.markers.markersAbsent ?? 0} notes on C/D pages whose marker the English does not carry |`,
    `| Translator's notes | ${totals.translatorNotes} |`,
    `| Passages reproduced word for word by their blocks | ${totals.integrity.exact ?? 0} (${pct(totals.integrity.exact ?? 0, totals.units)}) |`,
    `| Passages published as plain paragraphs (integrity fallback) | ${totals.integrity.fallback ?? 0} |`,
    '',
    '## Structure found',
    '',
    `| Block | Count |`,
    `|---|---|`,
    ...Object.entries(totals.blocks).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v.toLocaleString('en-US')} |`),
    '',
    `Reports: ${reportsAll.toLocaleString('en-US')} in all; ${totals.reports.typed} structured in the source, ${totals.reports.chain} with the chain read by the parser (${pct(totals.reports.chain, totals.reports.chain + totals.reports.whole)} of untyped reports), ${totals.reports.whole} kept whole because the chain could not be read.`,
    '',
    '## Readings (qirāʾāt)',
    '',
    `Per verse page: ${totals.readings.none} not specified, ${totals.readings.discussed} with readings discussed, ${totals.readings.preference} where the commentary states a preference. Evidence is quoted verbatim on each page; no reading is attributed that the text does not state.`,
    '',
    '## Flagged for review',
    '',
    `| Flag | Count | Meaning |`,
    `|---|---|---|`,
    ...Object.entries(totals.flags).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} | ${FLAG_MEANING[k] ?? ''} |`),
    '',
    totals.translatorNotNamed.length
      ? `The source records for surahs ${totals.translatorNotNamed.join(', ')} do not name a translator. The pages say so; supply the attribution and re-run the import to show it.`
      : '',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(reportDir, 'tabari-coverage.md'), md);
  console.log(`\n${totals.surahs} surahs, ${totals.words.toLocaleString('en-US')} words, ${totals.integrity.exact} exact / ${totals.integrity.fallback} fallback passages. Report: docs/research/tafsir/tabari-coverage.md`);
}
