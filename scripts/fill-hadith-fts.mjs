import { arabicFoldSql } from '../src/lib/arabic-fold-sql.ts';
import { tursoConnect, tursoTarget } from './lib/turso.mjs';

/**
 * Build the FTS5 search index over the corpus, in id ranges.
 *
 * Range at a time rather than one statement, because a single INSERT covering
 * 276,347 narrations exceeds what one request will carry. Each range is an
 * `INSERT ... SELECT` that runs inside the database, so the text never crosses
 * the network in either direction — the whole fill is one small request per
 * range.
 *
 * This is the job that could not run on D1 at all. Rebuilding needs writes,
 * and the database was over the free plan's 500 MB limit, so writes were
 * refused; production kept an index that truncated 67 narrations. On Turso the
 * corpus fits and writes work, so the index now covers the corpus in full.
 *
 * Usage:
 *   node scripts/fill-hadith-fts.mjs
 *   node scripts/fill-hadith-fts.mjs --from 120000    # resume after a failure
 */

const argv = process.argv.slice(2);
const RANGE = Number(argv[argv.indexOf('--range') + 1]) || 1000;
const FROM = Number(argv[argv.indexOf('--from') + 1]) || 0;

const conn = tursoConnect();
const TARGET = tursoTarget();

/** Run one statement and return its rows. */
async function sql(query) {
  return conn.all(query);
}

// Only the Arabic columns are folded. English is indexed as written: the
// tokeniser already discards the markdown emphasis and chunk markers the
// translator left behind, neither of which is alphanumeric.
const INSERT = `
INSERT INTO hadith_fts (rowid, ar_text, ar_matn, en_text, en_matn, chapter_en)
SELECT id,
       ${arabicFoldSql('COALESCE(text_ar,\'\')')},
       ${arabicFoldSql('COALESCE(matn_ar,\'\')')},
       COALESCE(text_en,''),
       COALESCE(matn_en,''),
       COALESCE(chapter_en,'')
  FROM hadith WHERE id BETWEEN ? AND ?`;

const bounds = (await sql('SELECT MIN(id) AS lo, MAX(id) AS hi, COUNT(*) AS n FROM hadith'))[0];
const lo = Number(bounds?.lo ?? 0);
const hi = Number(bounds?.hi ?? 0);
const expected = Number(bounds?.n ?? 0);
if (!hi) {
  console.error('hadith table is empty; nothing to index');
  process.exit(1);
}

const startAt = FROM || lo;
const totalRanges = Math.ceil((hi - startAt + 1) / RANGE);
console.log(
  `filling hadith_fts on ${TARGET} — ids ${startAt.toLocaleString()}..${hi.toLocaleString()}, ` +
    `${totalRanges.toLocaleString()} ranges of ${RANGE.toLocaleString()}`
);

const began = Date.now();
let done = 0;
for (let from = startAt; from <= hi; from += RANGE) {
  const to = from + RANGE - 1;
  const statement = INSERT.replace('?', String(from)).replace('?', String(to));
  try {
    await sql(statement);
  } catch (error) {
    // The range is named so a resume needs no arithmetic.
    console.error(`\nFAILED at ids ${from}..${to}`);
    console.error(String(error.stdout || error.message).slice(0, 600));
    console.error(`resume with: node scripts/fill-hadith-fts.mjs --from ${from}`);
    process.exit(1);
  }
  done += 1;
  if (done % 10 === 0 || from + RANGE > hi) {
    const secs = Math.round((Date.now() - began) / 1000);
    process.stdout.write(`\r  ${done}/${totalRanges} ranges, ${secs}s`);
  }
}

const indexed = Number((await sql('SELECT COUNT(*) AS n FROM hadith_fts'))[0]?.n ?? 0);
console.log(`\n  indexed ${indexed.toLocaleString()} of ${expected.toLocaleString()} narrations`);
if (indexed !== expected && !FROM) {
  console.error('  MISMATCH: index does not cover the corpus');
  process.exit(1);
}
console.log('  done');
