# The corpus database

The hadith corpus runs on **Turso**. It was on Cloudflare D1 and outgrew it.
This note records the measurements and the migration so neither has to be
rediscovered.

## Where it lives

| | |
| --- | --- |
| Provider | Turso Cloud, org `hadithcritic`, group `default` |
| Region | `aws-us-east-1` (Virginia) — D1 had been serving from US East |
| Database | `silsilah` |
| Reached by | `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`, both secrets |
| Client | `@tursodatabase/serverless`, wrapped in `src/lib/db.ts` |

Secrets are set with `wrangler secret put` in production and read from
`.dev.vars` locally. Neither file is committed. There is no database binding in
`wrangler.jsonc` any more.

## Why D1 stopped working

**Storage.** The database is 1.74 GB. D1's free plan allows 500 MB per
database, and writes were refused outright:

```
CREATE TABLE _probe (x INTEGER)
  -> Exceeded maximum DB size [code: 7500]
```

Enforcement is applied at write time, so reads kept working and the site kept
serving. It was a read-only database on a plan it had already passed.

There is no subset that both fits in 500 MB and remains the thing the project
is for. The payload alone, before any index, is about 832 MB — `text_ar`
166 MB, `hadith_subject` 169 MB, `text_en` 138 MB, `hadith_chain.name` 108 MB,
`matn_ar` 75 MB, `matn_en` 72 MB, `hadith_narrator.surface` 53 MB, chapter
headings 33 MB — plus a 205 MB FTS index and roughly 700 MB of B-tree overhead
for the 5.2M rows in the join tables. Dropping the whole search index frees
205 MB and leaves 1.5 GB, still three times the limit. `matn_ar` and `matn_en`
are what matn comparison reads, and the chain tables are what makes isnad
analysis possible.

**Reads.** D1 bills every row a query touches. The free plan allows 5 million a
day, which the corpus could exhaust in sixteen page views — see the serving-cost
section below, which was a defect rather than a plan limit and is fixed.

## Why Turso

Turso's free plan allows **5 GB** of storage and **500M row reads a month**,
against D1's 500 MB and ~150M. 1.74 GB fits with room for the sirah corpus
later, and writes work, which unblocked the search index rebuild that had been
stuck.

What the move costs: Turso's embedded replicas need a filesystem and a
long-lived process, so they are unavailable on Workers. Every query is an
HTTPS round trip to `aws-us-east-1` instead of a call inside Cloudflare's
network. That is why `src/lib/db.ts` batches aggressively, why
`src/lib/corpus-count.ts` refuses to count what it can read, and why
`src/lib/edge-cache.ts` exists — on Turso those three save latency as well as
quota.

Free-plan writes are capped at 10M rows a month, and the corpus is 6M rows.
That is the one number to watch: a full reimport by INSERT would consume most
of a month's allowance, which is why the import uploads a file instead.

## Serving cost, which was a separate bug

Import cost is one-off. What kept the corpus down day after day was the cost of
*serving* it, and that was ours, not the plan's.

`/hadith` ran `SELECT COUNT(*) FROM hadith` on every view to fill in the
"Narrations" figure in the hero. That is 276,347 rows read to produce one
integer. With the narrator count beside it a single page view cost about
297,000 reads, so **sixteen views exhausted the 5 million daily allowance for
the whole account** — after which every other query was refused, including the
26-row read behind a collection page. That is why collection pages showed "This
collection is temporarily unavailable" while costing almost nothing themselves:
they were not what spent the budget.

Rows read per view, before any of this and after:

| page | originally | now |
| ---- | -----: | ----: |
| `/narrators` | ~105,000 | ~90 |
| `/api/narrator-facets` | ~84,000 | ~37 |
| `/hadith` | ~297,000 | ~36 |
| `/hadith` search | ~297,000 | ~10,060 |
| `/hadith?book=N` total | whole collection | 0 |
| unfiltered `/api/hadith` total | 276,347 | 10,001 |
| collection page 1 | ~60 | ~60 |
| one narration | ~16 | ~16 |

Three rules produce that, in order of how much they saved:

1. **Nothing that is already stored gets recounted.** Narrations and
   collections are summed off the 33 rows of `hadith_book`, whose
   `hadith_count` the collection pager already paginated by — verified exact,
   the 33 counts sum to 276,347, and `scripts/verify-corpus.mjs` asserts it
   because nothing in the schema enforces it.
2. **Aggregates that never vary are computed once, not per view.** The
   register was the worst offender and nobody had measured it: six queries,
   four of them full-table aggregates over 20,915 narrators, to render a
   50-row listing. The filter chips carry no user filter at all, so every
   visitor paid for an identical answer, and paid again on the facets API.
   `corpus_stat` and `narrator_facet` (migration 0005) hold them, refreshed by
   `scripts/refresh-stats.mjs`. This is the change D1 could not take: it was
   over its size limit and refused to create a table.
3. **A total that must be counted is counted to a ceiling** — 10,000 rows,
   reported as "10,000+". That is the residual cost of search.

The corpus and register routes also opt into Cloudflare's cache for ten
minutes, which is what stops a crawler walking 33 collections paying for any of
them twice. Only a page that read its data successfully opts in, so an outage
is never what gets cached.

### Refresh the derived tables after any import

```bash
npm run stats:refresh    # recompute corpus_stat and narrator_facet
npm run stats:check      # report drift without writing
```

Nothing reads these tables for correctness, so a stale one does not error — it
shows the reader a wrong count. Treat the refresh as part of an import, not an
optional extra. `npm run fts:rebuild` and `scripts/verify-corpus.mjs` both
include it.

### Still costly, and why

Search still pays the 10,000-row bounded count, which is the honest floor for
"how many results are there" over a corpus this size. The register's text
filter is `search_text LIKE '%q%'`, which no index can serve, so a query there
scans all 20,915 named narrators. An FTS index over the register would fix it
and is now possible — writes work and there is room — but it is a separate
piece of work with its own recall questions, not a tuning change.

Deep pagination is the other soft spot. `ORDER BY id LIMIT 25 OFFSET n` walks
and discards everything it skips, so page 1 of a collection costs ~60 rows and
page 1,564 of Musannaf Ibn Abi Shaybah costs ~39,000. Search is capped at
`MAX_PAGES` for this reason; collection pages are not, because reading a
collection through is the point of the page. Keyset pagination (`WHERE id > ?`)
would remove the cost entirely.

## How the data moved

The obvious route was closed. Reading 6M rows out of D1 with SELECTs costs more
than the free plan's 5M daily reads, and that day's allowance was already gone.

D1's **export** is the way through: it dumps server-side to R2 and is not
billed as row reads at all. Verified before relying on it — a table exported
cleanly while every ordinary query was still being refused for quota.

```bash
npm run db:import     # export from D1, build a local SQLite file, upload it
```

That is `scripts/d1-to-turso.mjs` then `scripts/upload-turso.mjs`:

1. Export one table at a time from D1, load it into a local SQLite file, delete
   the dump. Table at a time because the machine had 8 GB free and the finished
   file is 1.5 GB; a whole-database dump plus the file it builds would not have
   fit.
2. `PRAGMA journal_mode=wal` and `wal_checkpoint(truncate)`, which Turso's
   importer requires.
3. Recreate the Turso database with `seed: { type: "database_upload" }` — a
   database only accepts an upload if it was created that way — and `POST` the
   file to `https://<db>-<org>.turso.io/v1/upload`. That endpoint authenticates
   with a **database** token, not the Platform API token, and it is not in
   Turso's OpenAPI spec.

Uploading a file rather than replaying 6M INSERTs is what keeps the import
inside the free plan's write allowance.

The search index is deliberately not exported. D1's copy is the truncated one,
missing the tails of 67 narrations, because migration 0004 never ran in
production. It is rebuilt on Turso afterwards, where writes work:

```bash
npm run fts:rebuild   # migration 0004, fill the index, then verify
```

## Schema and verification

```bash
npm run db:migrate            # apply migrations/ in order
npm run verify:corpus         # 29 checks against whatever TURSO_DATABASE_URL points at
```

`scripts/migrate-turso.mjs` splits each `.sql` file into statements and sends
them as one batch, because the SDK rejects multi-statement SQL and there is no
`executeMultiple`. The splitter respects string literals and comments: migration
0003 declares an FTS5 virtual table whose options are quoted strings, and a
naive `split(';')` would cut it in half.

Migrations 0003 and 0004 open with `DROP TABLE IF EXISTS`, so re-running either
discards the corpus or the index. Both scripts require `--force`.

## Leftovers

`scripts/seed-narrators-d1.mjs` keeps its name. It writes SQL batches to
`scripts/d1seed/` and connects to nothing, so it needed no porting — applying
the batches was always a separate step. That step is now:

```bash
node scripts/migrate-turso.mjs --dir scripts/d1seed
```

Its batch sizes were tuned to what `wrangler d1 execute --file` would accept.
They are well inside what Turso takes, so they were left alone.

The D1 database still exists and has not been deleted. Keep it until the Turso
copy has been verified in production for long enough to trust.
