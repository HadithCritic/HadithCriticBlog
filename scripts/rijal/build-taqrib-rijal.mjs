/* Builds the Taqrīb al-Tahdhīb rijal data from the bilingual Shamela export
   (book 8609, one record per printed page).

   Usage: node scripts/rijal/build-taqrib-rijal.mjs "<export.json>" [--out <dir>]

   Writes to src/data/rijal/taqrib/ by default:
     narrators.json  one record per biography (structured fields only)
     texts.json      Arabic text and English gloss of each biography, by id
     aliases.json    the unnumbered cross-references, with their targets
     vocab.json      source codes, generations, grades, sections
     report.json     coverage and the entries that need a human look

   and the list pages of /projects/rijal/ to src/data/rijal/pages/taqrib/
   (or --pages <dir>): one editable HTML file per page and pages.json, the
   order and titles of the pages. */
import fs from 'node:fs';
import path from 'node:path';
import { renderRegister } from './lib/html.mjs';
import { buildTaqrib } from './lib/taqrib.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');

const parseArgs = (argv) => {
  const args = {
    source: null,
    out: path.join(root, 'src/data/rijal/taqrib'),
    pages: path.join(root, 'src/data/rijal/pages/taqrib'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out') args.out = path.resolve(argv[++i] ?? '');
    else if (argv[i] === '--pages') args.pages = path.resolve(argv[++i] ?? '');
    else if (!args.source) args.source = path.resolve(argv[i]);
  }
  return args;
};

/* Replaces the generated pages, leaving anything else in the folder. */
const writePages = (dir, { manifest, files }) => {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith('.html')) fs.rmSync(path.join(dir, name));
  }
  for (const [slug, html] of Object.entries(files)) fs.writeFileSync(path.join(dir, `${slug}.html`), html);
  fs.writeFileSync(path.join(dir, 'pages.json'), `${JSON.stringify(manifest, null, 2)}\n`);
};

const readExport = (file) => {
  if (!file || !fs.existsSync(file)) throw new Error(`Export not found: ${file ?? '(none given)'}`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const records = data?.source_records;
  if (!Array.isArray(records) || records.length === 0) throw new Error('Export has no source_records array.');
  if (String(data.original_book_id ?? records[0].book_id) !== '8609') {
    throw new Error(`Expected Shamela book 8609 (Taqrīb al-Tahdhīb), got ${data.original_book_id ?? records[0].book_id}.`);
  }
  const bad = records.findIndex((r) => typeof r?.text !== 'string' || typeof r?.serial_number !== 'string');
  if (bad >= 0) throw new Error(`Record ${bad} lacks text or serial_number.`);
  return records;
};

/* One record per line keeps diffs readable. */
const writeLines = (file, list) => {
  fs.writeFileSync(file, `[\n${list.map((x) => JSON.stringify(x)).join(',\n')}\n]\n`);
};

const writeObject = (file, obj, pretty = false) => {
  fs.writeFileSync(file, `${JSON.stringify(obj, null, pretty ? 2 : 0)}\n`);
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  const records = readExport(args.source);
  const { narrators, aliases, texts, vocab, report } = buildTaqrib(records);
  fs.mkdirSync(args.out, { recursive: true });
  writeLines(path.join(args.out, 'narrators.json'), narrators);
  writeLines(path.join(args.out, 'aliases.json'), aliases);
  writeObject(path.join(args.out, 'texts.json'), texts);
  writeObject(path.join(args.out, 'vocab.json'), vocab, true);
  writeObject(path.join(args.out, 'report.json'), report, true);
  const register = renderRegister({ narrators, aliases, texts });
  writePages(args.pages, register);
  const { review, ...summary } = report;
  console.log(JSON.stringify(summary, null, 2));
  console.log(`Wrote ${narrators.length} narrators and ${aliases.length} aliases to ${path.relative(root, args.out)}`);
};

try {
  main();
} catch (err) {
  console.error(`build-taqrib-rijal: ${err.message}`);
  process.exit(1);
}
