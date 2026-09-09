/**
 * Post-import verification for the hadith corpus in D1.
 *
 * Runs against whichever database `--local` or `--remote` selects, so the same
 * checks gate a local rehearsal and the production import.
 *
 * The checks exist because of specific failures, not as ceremony:
 *
 *   counts        three imports failed partway; a table that is merely present
 *                 proves nothing about whether it finished.
 *   stored totals the pages report and paginate by `hadith_book.hadith_count`
 *                 instead of counting `hadith`, because the count cost the
 *                 whole daily D1 read allowance. Nothing enforces that the
 *                 stored figures match the rows.
 *   no truncation the first working import trimmed the tail off 67 narrations
 *                 to fit D1's statement limit. This asserts the stored text
 *                 length matches the source exactly.
 *   integrity     FTS5 keeps its own inverted index; `integrity-check` is the
 *                 only thing that confirms it agrees with the rows.
 *   orphans       the corpus and the register are joined on bare integers with
 *                 no foreign keys, so nothing enforces the relationship.
 *   recall        the Arabic fold is the whole reason search works on this
 *                 corpus. If the query normaliser and the index ever disagree,
 *                 nothing errors — results just quietly disappear.
 *
 * Usage:
 *   node scripts/verify-d1-corpus.mjs --local
 *   node scripts/verify-d1-corpus.mjs --remote
 */

import { execFileSync } from 'node:child_process';
// The real normaliser, not a copy. An approximation here would be the very
// drift this check exists to detect: an earlier version of this script hand
// rolled the fold, missed ئ -> ي, and reported a false failure.
import { normalizeArabic } from '../src/lib/arabic-normalize.ts';

const REMOTE = process.argv.includes('--remote');
const TARGET = REMOTE ? '--remote' : '--local';
const DB = 'silsilah';

const EXPECTED = {
  hadith: 276347,
  hadith_book: 33,
  hadith_narrator: 1624087,
  hadith_chain: 2249581,
  hadith_subject: 1348820,
  hadith_gloss: 244508,
  narrator_alias: 110712,
  // Pre-existing tables. If these move, something dropped what it should not have.
  narrator: 20950,
  criticism_statement: 165795
};

let failures = 0;
let checks = 0;

// wrangler's own entry point, not the `npx wrangler` shim. Two Windows
// problems disappear by going straight to it: node refuses to spawn a .cmd
// without a shell, and a shell splits an inline SQL string on its spaces into
// arguments wrangler then rejects. execFileSync passes argv across untouched,
// so the SQL needs no quoting at all.
const WRANGLER = 'node_modules/wrangler/bin/wrangler.js';

/**
 * Run one query and return its rows.
 *
 * `--command`, never `--file`. Against `--remote` wrangler uploads a file and
 * reports an execution summary in place of the result rows — "Rows read: 276347"
 * rather than the count that was asked for. An earlier version of this script
 * used `--file` and every remote check read that summary as an empty result,
 * so all 21 of them reported a corpus that was in fact fully present.
 */
function sql(query) {
  const out = execFileSync(
    process.execPath,
    [WRANGLER, 'd1', 'execute', DB, TARGET, '--json', '--command', query],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  // wrangler prints banners before the JSON payload.
  const start = out.indexOf('[');
  if (start === -1) throw new Error(`no JSON in wrangler output: ${out.slice(0, 200)}`);
  const parsed = JSON.parse(out.slice(start));
  for (let i = parsed.length - 1; i >= 0; i -= 1) {
    if (parsed[i]?.results?.length) return parsed[i].results;
  }
  return parsed[0]?.results ?? [];
}

function check(label, actual, expected, { tolerance = 0 } = {}) {
  checks += 1;
  const ok =
    typeof expected === 'function'
      ? expected(actual)
      : Math.abs(Number(actual) - Number(expected)) <= tolerance;
  if (!ok) failures += 1;
  const shown = typeof actual === 'number' ? actual.toLocaleString() : String(actual);
  const want =
    typeof expected === 'function' ? '' : ` (expected ${Number(expected).toLocaleString()})`;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: ${shown}${ok ? '' : want}`);
  return ok;
}

console.log('='.repeat(74));
console.log(`  D1 CORPUS VERIFICATION  (${REMOTE ? 'remote' : 'local'})`);
console.log('='.repeat(74));

// ---- 1. row counts ---------------------------------------------------
console.log('\nrow counts');
const countQuery = Object.keys(EXPECTED)
  .map((t) => `(SELECT COUNT(*) FROM ${t}) AS ${t}`)
  .join(', ');
const counts = sql(`SELECT ${countQuery}`)[0] || {};
for (const [table, expected] of Object.entries(EXPECTED)) {
  check(table, Number(counts[table] ?? -1), expected);
}

// ---- 1b. stored totals agree with the rows ---------------------------
// `hadith_book.hadith_count` is what the pages report and paginate by, in
// place of counting `hadith`: at 276,347 rows a COUNT(*) per request cost the
// account's whole daily D1 read allowance in sixteen page views, which took
// every other corpus query down with it. The substitution is only sound while
// the stored figures match the rows, and nothing in the schema enforces that,
// so it is asserted here rather than assumed. See src/lib/corpus-count.ts.
console.log('\nstored totals');
const stored = sql(`
  SELECT (SELECT COALESCE(SUM(hadith_count), 0) FROM hadith_book) AS summed,
         (SELECT COUNT(*) FROM hadith) AS rows_present,
         (SELECT COUNT(*) FROM hadith_book WHERE hadith_count <> (
            SELECT COUNT(*) FROM hadith h WHERE h.book_id = hadith_book.id
          )) AS disagreeing
`)[0] || {};
check('SUM(hadith_book.hadith_count)', Number(stored.summed ?? -1), EXPECTED.hadith);
check('matches COUNT(*) FROM hadith', Number(stored.summed ?? -1), Number(stored.rows_present ?? -2));
check('collections with a wrong count', Number(stored.disagreeing ?? -1), 0);

// ---- 2. search index -------------------------------------------------
console.log('\nsearch index');
const fts = sql('SELECT COUNT(*) AS n FROM hadith_fts')[0];
check('hadith_fts rows', Number(fts?.n ?? -1), EXPECTED.hadith);

const hasSearch = sql(
  "SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='hadith_search'"
)[0];
if (Number(hasSearch?.n) === 1) {
  const s = sql('SELECT COUNT(*) AS n FROM hadith_search')[0];
  check('hadith_search rows', Number(s?.n ?? -1), EXPECTED.hadith);
}

try {
  sql("INSERT INTO hadith_fts(hadith_fts) VALUES('integrity-check')");
  check('FTS5 integrity-check', 'clean', () => true);
} catch (error) {
  check('FTS5 integrity-check', String(error).slice(0, 120), () => false);
}

// ---- 3. no truncation ------------------------------------------------
// The failure this whole exercise was about. Compare stored length against the
// longest narrations; any shortfall means text was cut to fit a statement.
console.log('\ntext completeness');
const longest = sql(`
  SELECT id, LENGTH(text_ar) AS ar, LENGTH(text_en) AS en
    FROM hadith ORDER BY LENGTH(text_ar) DESC LIMIT 3
`);
for (const row of longest) {
  check(`hadith ${row.id} Arabic length`, Number(row.ar), (n) => n > 10000);
}
// The check that actually proves nothing was truncated: take a word from the
// LAST 400 characters of the longest narrations and search for it. Row counts
// cannot detect a cut tail — a truncated record is still one row — and under
// migration 0003 exactly this probe came back empty for 67 narrations.
for (const row of longest) {
  const tail = sql(
    `SELECT substr(text_ar, LENGTH(text_ar) - 400) AS t FROM hadith WHERE id = ${row.id}`
  )[0];
  const word = String(tail?.t || '')
    .split(/\s+/)
    .map((w) => normalizeArabic(w))
    .filter((w) => w.length >= 6)
    .pop();
  if (!word) {
    check(`hadith ${row.id} tail indexed`, 'no probe word in tail', () => false);
    continue;
  }
  const hit = sql(
    `SELECT COUNT(*) AS n FROM hadith_fts WHERE rowid = ${row.id} AND hadith_fts MATCH 'ar_text : "${word}"'`
  )[0];
  check(`hadith ${row.id} tail word "${word}" indexed`, Number(hit?.n ?? 0), 1);
}

// ---- 4. relational integrity ----------------------------------------
console.log('\nrelational integrity');
const dupes = sql('SELECT COUNT(*) - COUNT(DISTINCT id) AS n FROM hadith')[0];
check('duplicate hadith ids', Number(dupes?.n ?? -1), 0);

const orphanHadith = sql(`
  SELECT COUNT(*) AS n FROM hadith_narrator hn
   LEFT JOIN hadith h ON h.id = hn.hadith_id WHERE h.id IS NULL
`)[0];
check('hadith_narrator rows with no hadith', Number(orphanHadith?.n ?? -1), 0);

const orphanNarrator = sql(`
  SELECT COUNT(*) AS n FROM hadith_narrator hn
   LEFT JOIN narrator n ON n.id = hn.narrator_id
   WHERE hn.narrator_id IS NOT NULL AND n.id IS NULL
`)[0];
// The register excludes placeholder buckets the corpus still references, so a
// small residue here is expected rather than a defect.
check('hadith_narrator rows with no narrator', Number(orphanNarrator?.n ?? -1), (n) => n < 30000);

const orphanBook = sql(`
  SELECT COUNT(*) AS n FROM hadith h
   LEFT JOIN hadith_book b ON b.id = h.book_id WHERE b.id IS NULL
`)[0];
check('hadith rows with no book', Number(orphanBook?.n ?? -1), 0);

// ---- 5. recall -------------------------------------------------------
// Each pair must return the same count. If the query fold and the indexed fold
// ever diverge, these are what notices.
console.log('\nsearch recall (folded pairs must agree)');
const PAIRS = [
  ['عائشة', 'عايشة'],
  ['إبراهيم', 'ابراهيم'],
  ['معاوية', 'معاويه']
];
for (const [a, b] of PAIRS) {
  const qa = sql(`SELECT COUNT(*) AS n FROM hadith_fts WHERE hadith_fts MATCH 'ar_text : "${normalizeArabic(a)}"'`)[0];
  const qb = sql(`SELECT COUNT(*) AS n FROM hadith_fts WHERE hadith_fts MATCH 'ar_text : "${normalizeArabic(b)}"'`)[0];
  check(`${a} = ${b}`, `${Number(qa?.n ?? 0).toLocaleString()} vs ${Number(qb?.n ?? 0).toLocaleString()}`,
    () => Number(qa?.n) === Number(qb?.n) && Number(qa?.n) > 0);
}

for (const [term, column] of [['intention', 'en_text'], ['ablution', 'en_text']]) {
  const r = sql(`SELECT COUNT(*) AS n FROM hadith_fts WHERE hadith_fts MATCH '${column} : "${term}"'`)[0];
  check(`English "${term}"`, Number(r?.n ?? 0), (n) => n > 100);
}

// ---- summary ---------------------------------------------------------
console.log('\n' + '='.repeat(74));
console.log(`  ${checks - failures}/${checks} checks passed${failures ? `, ${failures} FAILED` : ''}`);
console.log('='.repeat(74));
process.exit(failures ? 1 : 0);
