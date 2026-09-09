/**
 * Populate `hadith_fts` from `hadith`, one id range at a time.
 *
 * Run after applying migrations/0004_hadith_search_index.sql, which drops and
 * recreates the empty index. That migration explains why the index is built
 * this way; the short version is that the narration text never appears in the
 * statement text, so D1's 100 KB statement ceiling stops applying and nothing
 * has to be truncated or staged in a second copy of the corpus.
 *
 * Each statement is a few hundred bytes regardless of how long the narrations
 * in its range are. The range size is therefore chosen against D1's 30-second
 * query limit, not against statement length.
 *
 * Safe to re-run from a given range: pass --from to resume after a failure.
 *
 * Usage:
 *   node scripts/fill-hadith-fts.mjs --local
 *   node scripts/fill-hadith-fts.mjs --remote
 *   node scripts/fill-hadith-fts.mjs --remote --from 120000
 */

import { execFileSync } from 'node:child_process';
import { arabicFoldSql } from '../src/lib/arabic-fold-sql.ts';

const argv = process.argv.slice(2);
const REMOTE = argv.includes('--remote');
const TARGET = REMOTE ? '--remote' : '--local';
const DB = 'silsilah';
const RANGE = Number(argv[argv.indexOf('--range') + 1]) || 1000;
const FROM = Number(argv[argv.indexOf('--from') + 1]) || 0;

// wrangler's entry point rather than the `npx wrangler` shim: node will not
// spawn a .cmd without a shell, and a shell would split the SQL on its spaces.
const WRANGLER = 'node_modules/wrangler/bin/wrangler.js';

function sql(query) {
  const out = execFileSync(
    process.execPath,
    [WRANGLER, 'd1', 'execute', DB, TARGET, '--json', '--command', query],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }
  );
  const start = out.indexOf('[');
  if (start === -1) throw new Error(`no JSON in wrangler output: ${out.slice(0, 200)}`);
  const parsed = JSON.parse(out.slice(start));
  for (let i = parsed.length - 1; i >= 0; i -= 1) {
    if (parsed[i]?.results?.length) return parsed[i].results;
  }
  return parsed[0]?.results ?? [];
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

const bounds = sql('SELECT MIN(id) AS lo, MAX(id) AS hi, COUNT(*) AS n FROM hadith')[0];
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
  `filling hadith_fts (${TARGET}) — ids ${startAt.toLocaleString()}..${hi.toLocaleString()}, ` +
    `${totalRanges.toLocaleString()} ranges of ${RANGE.toLocaleString()}`
);

const began = Date.now();
let done = 0;
for (let from = startAt; from <= hi; from += RANGE) {
  const to = from + RANGE - 1;
  const statement = INSERT.replace('?', String(from)).replace('?', String(to));
  try {
    sql(statement);
  } catch (error) {
    // The range is named so a resume needs no arithmetic.
    console.error(`\nFAILED at ids ${from}..${to}`);
    console.error(String(error.stdout || error.message).slice(0, 600));
    console.error(`resume with: node scripts/fill-hadith-fts.mjs ${TARGET} --from ${from}`);
    process.exit(1);
  }
  done += 1;
  if (done % 10 === 0 || from + RANGE > hi) {
    const secs = Math.round((Date.now() - began) / 1000);
    process.stdout.write(`\r  ${done}/${totalRanges} ranges, ${secs}s`);
  }
}

const indexed = Number(sql('SELECT COUNT(*) AS n FROM hadith_fts')[0]?.n ?? 0);
console.log(`\n  indexed ${indexed.toLocaleString()} of ${expected.toLocaleString()} narrations`);
if (indexed !== expected && !FROM) {
  console.error('  MISMATCH: index does not cover the corpus');
  process.exit(1);
}
console.log('  done');
