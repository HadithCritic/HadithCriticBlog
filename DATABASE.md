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

### Measure it, don't estimate it

```bash
node scripts/measure-reads.mjs
```

Turso's Hrana pipeline reports `rows_read` per statement, so what a page costs
is a question with an exact answer. The SDK does not surface it, so that script
asks `/v3/pipeline` directly and prints rows, milliseconds and views-per-month
for every route. Every number below came from it.

Rows read per view, measured:

| page | originally | now | views/month |
| ---- | -----: | ----: | ----: |
| one narration | 20 | 20 | 25,000,000 |
| collection page 1 | 58 | 58 | 8,620,000 |
| `/hadith` landing | ~297,000 | **72** | 6,940,000 |
| `/narrators` register | ~105,000 | **90** | 5,550,000 |
| `/hadith?book=N` | ~40,000 | **98** | 5,100,000 |
| `/api/narrator-facets` | ~84,000 | **40** | 12,500,000 |
| collection page 1,564 | 39,130 | **55** | 9,090,000 |
| `/narrators?q=` | 24,171 | **4,410** | 113,000 |
| `/hadith?narrator=N` | 207,461 | **10,527** | 47,000 |
| `/narrators/<id>` dossier | 83,594 | **16,817** | 29,700 |
| `/hadith?q=` search | 104,334 | **47,252** | 10,500 |

The search figure is the pessimistic end, not the typical one: cost scales with
how many narrations match, and that row used عائشة, one of the most common
words in the corpus. Measured across term frequencies — 47,180 rows for
عائشة (10,000+ matches), 15,995 for "ablution" (5,315), 443 for كسوف (131),
and 1 for a term that is absent. An ordinary research query costs hundreds of
rows, not tens of thousands.

Seven rules produce that, in order of how much they saved:

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
4. **Rank on an index, then fetch only what survived.** `ORDER BY bm25(...)
   LIMIT 25` over a joined query does not stop at 25: FTS5 scores every match,
   and with the join in place SQLite materializes the text of all of them into
   a temp b-tree before sorting. Ranking inside a CTE first, where there is
   nothing to hold but a rowid and a score, then joining the 25 survivors, was
   74,260 rows and 2,190 ms against 37,180 and 22 ms — byte-identical output,
   a hundredfold on latency. Search felt slow because it was.
5. **Drive from the index that answers the question.** `/hadith?narrator=N`
   scanned all 276,347 narrations evaluating an `EXISTS` per row, because
   `ORDER BY h.id` with an `EXISTS` filter walks the table. Counted from
   `idx_hn_narrator` instead it is 10,131 rows rather than 197,064. The same
   mistake made a rijal dossier gather all 16,511 of ʿĀʾishah's narrations to
   pick eight — now precomputed in `narrator_top_hadith` (migration 0006).

6. **Index what is searched, don't scan it.** The register matched names with
   `search_text LIKE '%q%'`, which no index can serve: 24,171 rows per query,
   and it could not match folded Arabic at all — عايشه found nobody while
   عائشة found sixty. `narrator_fts` (migration 0007) indexes the same
   haystack folded, so the register and the corpus now agree on Arabic
   orthography: 4,410 rows, and عايشه finds the sixty. Recall was compared
   against the old `LIKE` across fourteen queries: twelve identical, one a
   superset, and the two differences are both improvements — "mali" no longer
   matches the nisba *al-Thumālī* by infix, and "3026" no longer returns
   narrator #13026.
7. **Seek, don't skip.** `LIMIT 25 OFFSET n` walks and discards everything
   before it, so reading a long collection cost more the further in you got:
   page 1,564 of Musannaf Ibn Abi Shaybah read 39,130 rows. The pager now
   carries the last id on the page as a cursor, which is 55 rows at any depth.
   `?page=N` without a cursor still falls back to OFFSET so old links keep
   working.

Each of the cheap shapes in `src/lib/corpus-count.ts` is valid for exactly one
active filter and wrong for a combination — an FTS-only count cannot see a book
clause — so the pages check which single filter is narrowing and fall back to
the general form otherwise. That is why the fast paths are the bare query and
the bare narrator link: the two journeys the corpus is actually walked by.

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

### Refresh the derived tables after any import

Three tables are caches of things the pages used to compute per view:
`corpus_stat`, `narrator_facet` and `narrator_top_hadith`. A stale one does not
error — it shows a reader a wrong number — so the refresh is part of an import,
not an optional extra.

### Still costly, and why

**The 10,000-row bounded count on search**, which is most of the 47,252. The
honest floor for "how many results are there" over a corpus this size.
Lowering `COUNT_CAP` trades precision for reads; 10,000 was chosen because it
is the point past which the exact figure stops being information a reader
uses. The rest is FTS5 scoring every match, which is what relevance ranking
costs, and it is only that large for the most common words in the corpus.

**A jump straight to a deep page, 39,130 rows.** The pager seeks on a cursor,
so *reading* a collection through costs 55 rows a page at any depth. But
`?page=1564` on its own — an old link, a shared one, a crawler walking the
pager without following it — still falls back to OFFSET, because the
alternative is breaking those URLs. Capping `pages` would fix the crawler case
at the cost of making the tail of every long collection unreachable.

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
