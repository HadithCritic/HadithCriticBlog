import { fromEnvFile } from './lib/env-file.mjs';

/**
 * Measure what each page costs in rows read.
 *
 * Turso bills reads per row, so "will users hit a limit" is a question with an
 * exact answer, and this asks the database for it rather than estimating.
 * Hrana's pipeline reports `rows_read` per statement; the SDK does not surface
 * it, so this talks to `/v3/pipeline` directly.
 *
 * The query sets below mirror the ones the pages run. They can drift — nothing
 * enforces the match — so when a page's queries change, change them here too.
 * The numbers are worth more than the risk: without them, the read budget gets
 * managed by guesswork, and guesswork is what once put the whole corpus behind
 * "this collection is temporarily unavailable".
 *
 * Usage:
 *   node scripts/measure-reads.mjs
 */

const TURSO_FILES = ['.dev.vars', '../.env.local', '.env.local'];
const url = fromEnvFile('TURSO_DATABASE_URL', TURSO_FILES);
const token = fromEnvFile('TURSO_AUTH_TOKEN', TURSO_FILES);
if (!url || !token) throw new Error('TURSO_DATABASE_URL / TURSO_AUTH_TOKEN not found');
const host = url.replace(/^libsql:\/\//, '');

/** Free-plan allowance, for turning rows into page views. */
const MONTHLY_ROWS = 500_000_000;

const BM25 = 'bm25(hadith_fts, 1.0, 2.0, 1.0, 2.0, 0.5)';
const PLAIN_FROM = 'FROM hadith h JOIN hadith_book b ON b.id = h.book_id';

// A folded Arabic term, the way src/lib/arabic-normalize.ts would emit it.
const AISHA = 'عايشه';

const ROUTES = [
  [
    '/hadith (landing)',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book ORDER BY hadith_count DESC'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('hadith_narrations','hadith_collections','narrator_named')`
      ]
    ]
  ],
  [
    '/hadith?q=… (search)',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book ORDER BY hadith_count DESC'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('hadith_narrations','hadith_collections','narrator_named')`
      ],
      [
        `WITH ranked AS (
           SELECT rowid AS hadith_id, ${BM25} AS score FROM hadith_fts
            WHERE hadith_fts MATCH ? ORDER BY score ASC LIMIT ? OFFSET ?
         )
         SELECT h.id, h.hadith_num, h.chapter_en, h.matn_en, h.text_en,
                h.parallel_count, h.narrator_count, h.text_ar, h.matn_ar,
                b.id AS book_id, b.title_en AS book_en, b.slug AS book_slug
           FROM ranked JOIN hadith h ON h.id = ranked.hadith_id
           JOIN hadith_book b ON b.id = h.book_id ORDER BY ranked.score ASC`,
        [`ar_text : "${AISHA}"`, 25, 0]
      ],
      [
        `SELECT COUNT(*) AS n FROM (SELECT rowid FROM hadith_fts WHERE hadith_fts MATCH ? LIMIT 10001)`,
        [`ar_text : "${AISHA}"`]
      ]
    ]
  ],
  [
    '/hadith?book=N (browse one collection)',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book ORDER BY hadith_count DESC'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('hadith_narrations','hadith_collections','narrator_named')`
      ],
      [
        `SELECT h.id, h.hadith_num, h.chapter_en, h.matn_en, h.text_en,
                h.parallel_count, h.narrator_count, h.text_ar, h.matn_ar,
                b.id AS book_id, b.title_en AS book_en, b.slug AS book_slug
           ${PLAIN_FROM} WHERE h.book_id = ? ORDER BY h.id ASC LIMIT 25 OFFSET 0`,
        [1]
      ]
    ]
  ],
  [
    '/hadith?narrator=N (all hadith by a narrator)',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book ORDER BY hadith_count DESC'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('hadith_narrations','hadith_collections','narrator_named')`
      ],
      ['SELECT id, name_en FROM narrator WHERE id = ?', [3026]],
      [
        `SELECT h.id, h.hadith_num, h.chapter_en, h.matn_en, h.text_en,
                h.parallel_count, h.narrator_count, h.text_ar, h.matn_ar,
                b.id AS book_id, b.title_en AS book_en, b.slug AS book_slug
           ${PLAIN_FROM}
          WHERE EXISTS (SELECT 1 FROM hadith_narrator hn
                         WHERE hn.hadith_id = h.id AND hn.narrator_id = ?)
          ORDER BY h.id ASC LIMIT 25 OFFSET 0`,
        [3026]
      ],
      [
        `SELECT COUNT(*) AS n FROM (SELECT DISTINCT hadith_id FROM hadith_narrator
           WHERE narrator_id = ? LIMIT 10001)`,
        [3026]
      ]
    ]
  ],
  [
    '/hadith/collection/<slug> page 1',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book WHERE slug = ?', ['musannaf-ibn-abi-shaybah']],
      [
        `SELECT id, hadith_num, chapter_en, chapter_ar, matn_en, text_en,
                matn_ar, text_ar, narrator_count, parallel_count
           FROM hadith WHERE book_id = ? ORDER BY id LIMIT 25 OFFSET 0`,
        [1]
      ]
    ]
  ],
  [
    '/hadith/collection/<slug> page 1564 (cursor)',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book WHERE slug = ?', ['musannaf-ibn-abi-shaybah']],
      [
        `SELECT id, hadith_num, chapter_en, chapter_ar, matn_en, text_en,
                matn_ar, text_ar, narrator_count, parallel_count
           FROM hadith WHERE book_id = ? AND id > ? ORDER BY id LIMIT 25`,
        [1, 281690]
      ]
    ]
  ],
  [
    '/hadith/collection/<slug> page 1564 (offset fallback)',
    [
      ['SELECT id, slug, title_en, title_ar, hadith_count FROM hadith_book WHERE slug = ?', ['musannaf-ibn-abi-shaybah']],
      [
        `SELECT id, hadith_num, chapter_en, chapter_ar, matn_en, text_en,
                matn_ar, text_ar, narrator_count, parallel_count
           FROM hadith WHERE book_id = ? ORDER BY id LIMIT 25 OFFSET 39075`,
        [1]
      ]
    ]
  ],
  [
    '/hadith/<id> (one narration)',
    [
      [
        `SELECT h.*, b.title_ar AS book_ar, b.title_en AS book_en, b.id AS book_id, b.slug AS book_slug
           FROM hadith h JOIN hadith_book b ON b.id = h.book_id WHERE h.id = ?`,
        [285046]
      ],
      [
        `SELECT c.path_idx, c.pos, c.narrator_id, c.name, n.name_en, n.death_hijri
           FROM hadith_chain c LEFT JOIN narrator n ON n.id = c.narrator_id
          WHERE c.hadith_id = ? ORDER BY c.path_idx, c.pos`,
        [285046]
      ],
      ['SELECT label_ar, label_en FROM hadith_subject WHERE hadith_id = ?', [285046]],
      ['SELECT word_ar, word_en FROM hadith_gloss WHERE hadith_id = ?', [285046]]
    ]
  ],
  [
    '/narrators (register, unfiltered)',
    [
      [
        `SELECT id,name_en,name_ar,generation,grade,death_hijri,death_place,places_en,
                hadith_count,teacher_count,student_count,statement_count
           FROM narrator WHERE unnamed = 0 ORDER BY id ASC LIMIT 50 OFFSET 0`
      ],
      ['SELECT kind, value, n FROM narrator_facet ORDER BY kind, ord'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('narrator_named','narrator_graded','narrator_dated')`
      ]
    ]
  ],
  [
    '/narrators?q=… (register FTS)',
    [
      [
        `SELECT id,name_en,name_ar,generation,grade,death_hijri,death_place,places_en,
                hadith_count,teacher_count,student_count,statement_count
           FROM narrator WHERE unnamed = 0
            AND id IN (SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ?)
          ORDER BY id ASC LIMIT 50 OFFSET 0`,
        ['"malik"*']
      ],
      [
        `SELECT COUNT(*) AS n FROM narrator WHERE unnamed = 0
          AND id IN (SELECT rowid FROM narrator_fts WHERE narrator_fts MATCH ?)`,
        ['"malik"*']
      ],
      ['SELECT kind, value, n FROM narrator_facet ORDER BY kind, ord'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('narrator_named','narrator_graded','narrator_dated')`
      ]
    ]
  ],
  [
    '/narrators/<id> (rijal dossier)',
    [
      ['SELECT payload FROM narrator_detail WHERE id = ?', [3026]],
      [
        `SELECT critic, text, citation, page_id, verdict, phenomenon_key, phenomenon_label
           FROM criticism_statement WHERE narrator_id = ? ORDER BY ord`,
        [3026]
      ],
      [
        `SELECT h.id, h.hadith_num, h.matn_en, h.narrator_count, h.parallel_count,
                (SELECT MIN(hn.pos) FROM hadith_narrator hn
                  WHERE hn.narrator_id = t.narrator_id AND hn.hadith_id = h.id) AS pos,
                b.title_en AS book_en
           FROM narrator_top_hadith t
           JOIN hadith h ON h.id = t.hadith_id
           JOIN hadith_book b ON b.id = h.book_id
          WHERE t.narrator_id = ? ORDER BY t.ord`,
        [3026]
      ],
      ['SELECT COUNT(DISTINCT hadith_id) AS n FROM hadith_narrator WHERE narrator_id = ?', [3026]],
      [
        `SELECT surface, n_mentions, is_display FROM narrator_alias
          WHERE narrator_id = ? ORDER BY n_mentions DESC LIMIT 8`,
        [3026]
      ]
    ]
  ],
  [
    '/api/narrator-facets',
    [
      ['SELECT kind, value, n FROM narrator_facet ORDER BY kind, ord'],
      [
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('narrator_named','narrator_graded','narrator_dated')`
      ]
    ]
  ]
];

const pipeline = async (statements) => {
  const response = await fetch(`https://${host}/v3/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        ...statements.map(([sql, args = []]) => ({
          type: 'execute',
          stmt: {
            sql,
            args: args.map((v) =>
              typeof v === 'number'
                ? { type: 'integer', value: String(v) }
                : { type: 'text', value: String(v) }
            )
          }
        })),
        { type: 'close' }
      ]
    })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`pipeline ${response.status}: ${JSON.stringify(body).slice(0, 300)}`);
  let rows = 0;
  let ms = 0;
  for (const entry of body.results) {
    if (entry.type === 'error') throw new Error(JSON.stringify(entry.error).slice(0, 300));
    const result = entry.response?.result;
    if (!result) continue;
    rows += Number(result.rows_read ?? 0);
    ms += Number(result.query_duration_ms ?? 0);
  }
  return { rows, ms };
};

console.log(`Rows read per page view, measured on ${host}`);
console.log(`Free-plan allowance: ${MONTHLY_ROWS.toLocaleString()} rows/month\n`);
console.log(`${'route'.padEnd(48)} ${'rows'.padStart(9)} ${'ms'.padStart(7)}  ${'views/month'.padStart(13)}`);
console.log('-'.repeat(82));

const measured = [];
for (const [name, statements] of ROUTES) {
  try {
    const { rows, ms } = await pipeline(statements);
    measured.push([name, rows]);
    const views = rows > 0 ? Math.floor(MONTHLY_ROWS / rows) : Infinity;
    console.log(
      `${name.padEnd(48)} ${rows.toLocaleString().padStart(9)} ${ms.toFixed(0).padStart(7)}  ` +
        `${(views === Infinity ? 'unlimited' : views.toLocaleString()).padStart(13)}`
    );
  } catch (error) {
    console.log(`${name.padEnd(48)} ${'ERROR'.padStart(9)}  ${String(error.message).slice(0, 60)}`);
  }
}

const worst = measured.slice().sort((a, b) => b[1] - a[1])[0];
console.log('-'.repeat(82));
if (worst) {
  console.log(
    `Most expensive: ${worst[0]} at ${worst[1].toLocaleString()} rows ` +
      `(${Math.floor(MONTHLY_ROWS / worst[1]).toLocaleString()} views/month).`
  );
}
console.log('Repeat views of one URL are served from the edge cache and cost nothing.');
