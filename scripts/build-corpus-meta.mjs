/**
 * Generate the corpus metadata the site renders without querying anything.
 *
 * Totals, the collection list and the register's filter chips are properties of
 * a corpus version, not of a visitor's request. Answering them from SQL cost a
 * scan of 276,347 or 20,915 rows for a figure that is identical between builds,
 * and answering them from a literal in a page is how a site ends up claiming
 * 20,915 transmitters after the register grew. So they are computed once, here,
 * from the database the build was cut from, and written as data.
 *
 * The output is committed. That is deliberate: the 1.6 GB master database is
 * not in git and is not present in CI, and a deployment must not need it in
 * order to render a page that says how large the corpus is.
 *
 * Usage:
 *   node scripts/build-corpus-meta.mjs [--version <id>] [--db <path>]
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

import {
  ROOT,
  buildPaths,
  corpusVersion,
  heading,
  parseArgs,
  resolveMasterDb
} from './lib/corpus-dist.mjs';

const SITE_META = path.join(ROOT, 'src', 'data', 'corpus-meta.json');
const SITEMAP_IDS = path.join(ROOT, 'src', 'data', 'narrator-sitemap.json');

/**
 * Which narrators are worth submitting to a crawler.
 *
 * Kept identical to `narratorSitemapWhere` in src/lib/seo.ts, which is where it
 * is explained: roughly 1,991 entries are bare stubs with no criticism and no
 * attributed hadith, and submitting those invites a thin-content assessment
 * that would dampen crawling of the whole section. They stay reachable and
 * indexable by link; they are just not advertised.
 */
const SITEMAP_WHERE = 'unnamed = 0 AND (statement_count > 0 OR hadith_count > 0)';

/**
 * Grade chips shown on the register, capped at eight. The cap is the page's,
 * not the dataset's, so it is applied where the data is generated rather than
 * being re-derived by every consumer.
 */
const GRADE_CHIP_CAP = 8;

const scalar = (db, sql, args = []) => Number(Object.values(db.prepare(sql).get(...args) ?? {})[0] ?? 0);

function facets(db) {
  const rows = db.prepare('SELECT kind, value, n, ord FROM narrator_facet ORDER BY kind, ord').all();
  const of = (kind, cast = (v) => v) =>
    rows.filter((r) => r.kind === kind).map((r) => ({ value: cast(r.value), n: Number(r.n) }));

  return {
    generations: of('generation'),
    grades: of('grade'),
    // Stored as text because one table holds every facet kind; the century
    // chips are compared and linked as numbers.
    centuries: of('century', Number)
  };
}

function main() {
  const args = parseArgs();
  const version = typeof args.version === 'string' ? args.version : corpusVersion();
  const build = buildPaths(version);

  const dbPath = typeof args.db === 'string'
    ? path.resolve(ROOT, args.db)
    : existsSync(build.db)
      ? build.db
      : resolveMasterDb();

  heading(`BUILD CORPUS METADATA  ${version}`);
  console.log(`  Source: ${dbPath}`);

  const db = new DatabaseSync(dbPath, { readOnly: true });

  try {
    const stored = new Map(
      db.prepare('SELECT key, value FROM corpus_stat').all().map((r) => [r.key, Number(r.value)])
    );

    const collections = db
      .prepare(
        `SELECT id, slug, title_en, title_ar, hadith_count
           FROM hadith_book ORDER BY hadith_count DESC, id ASC`
      )
      .all()
      .map((r) => ({
        id: Number(r.id),
        slug: String(r.slug),
        title_en: String(r.title_en),
        title_ar: String(r.title_ar ?? ''),
        hadith_count: Number(r.hadith_count)
      }));

    const chips = facets(db);

    const meta = {
      corpusVersion: version,
      generatedAt: new Date().toISOString(),
      counts: {
        // `corpus_stat` holds the figure the corpus was seeded with; the live
        // COUNT is what the file actually contains. They should agree, and
        // verify-distribution fails the build when they do not.
        hadith: scalar(db, 'SELECT COUNT(*) AS n FROM hadith'),
        hadithFromStat: stored.get('hadith_narrations') ?? 0,
        collections: collections.length,
        narrators: scalar(db, 'SELECT COUNT(*) AS n FROM narrator WHERE unnamed = 0'),
        narratorsIncludingUnnamed: scalar(db, 'SELECT COUNT(*) AS n FROM narrator'),
        narratorsGraded: stored.get('narrator_graded') ?? 0,
        narratorsDated: stored.get('narrator_dated') ?? 0,
        chainLinks: scalar(db, 'SELECT COUNT(*) AS n FROM hadith_chain'),
        attributions: scalar(db, 'SELECT COUNT(*) AS n FROM hadith_narrator'),
        criticismStatements: scalar(db, 'SELECT COUNT(*) AS n FROM criticism_statement'),
        glosses: scalar(db, 'SELECT COUNT(*) AS n FROM hadith_gloss')
      },
      collections,
      facets: {
        generations: chips.generations,
        grades: chips.grades,
        gradesForChips: chips.grades.slice(0, GRADE_CHIP_CAP),
        centuries: chips.centuries
      }
    };

    const json = `${JSON.stringify(meta, null, 2)}\n`;

    /**
     * `--out` and `--no-site` are for the fixture builder, which wants this
     * metadata generated by the same code as the real corpus but written beside
     * the fixture rather than over the committed one the site builds from.
     */
    const explicitOut = typeof args.out === 'string' ? path.resolve(ROOT, args.out) : null;
    if (explicitOut) {
      mkdirSync(path.dirname(explicitOut), { recursive: true });
      writeFileSync(explicitOut, json, 'utf8');
      console.log(`  Wrote ${path.relative(ROOT, explicitOut)}`);
    }

    if (!args['no-site']) {
      mkdirSync(path.dirname(SITE_META), { recursive: true });
      writeFileSync(SITE_META, json, 'utf8');
      console.log(`  Wrote ${path.relative(ROOT, SITE_META)}`);
    }

    if (!explicitOut && existsSync(build.dir)) {
      writeFileSync(build.meta, json, 'utf8');
      console.log(`  Wrote ${path.relative(ROOT, build.meta)}`);
    }

    /**
     * The narrator sitemap, as data rather than a query.
     *
     * @astrojs/sitemap only emits prerendered routes, so the register was
     * invisible to crawlers and the gap was closed with two on-demand XML
     * routes that each ran a query. Those queries have nowhere to run now. The
     * id list is a property of a corpus version, so it is generated here and
     * the sitemap routes are prerendered from it.
     */
    if (!args['no-site']) {
      const sitemapIds = db
        .prepare(`SELECT id FROM narrator WHERE ${SITEMAP_WHERE} ORDER BY statement_count DESC, id ASC`)
        .all()
        .map((r) => Number(r.id));

      writeFileSync(
        SITEMAP_IDS,
        `${JSON.stringify({ corpusVersion: version, ids: sitemapIds })}\n`,
        'utf8'
      );
      console.log(
        `  Wrote ${path.relative(ROOT, SITEMAP_IDS)} (${sitemapIds.length.toLocaleString()} ids)`
      );
    }

    const { counts } = meta;
    console.log(
      `\n  ${counts.hadith.toLocaleString()} narrations · ` +
        `${counts.narrators.toLocaleString()} transmitters · ` +
        `${counts.collections} collections`
    );
  } finally {
    db.close();
  }
}

try {
  main();
} catch (error) {
  console.error(`\nbuild-corpus-meta failed: ${error.message}`);
  process.exitCode = 1;
}
