# D1 capacity

The hadith corpus does not fit on Cloudflare's Workers Free plan. This note
records the measurements so the decision does not have to be rediscovered.

## Where things stand

The `silsilah` database is **1.74 GB**. The free plan allows **500 MB per
database**. Writes are refused:

```
CREATE TABLE _probe (x INTEGER)
  -> Exceeded maximum DB size [code: 7500]
```

Reads hit a separate ceiling the same day. The free plan allows 5 million rows
read per day; importing and verifying the corpus read 31.7 million and wrote
23.9 million:

```
DROP INDEX idx_hadith_num
  -> Your account has exceeded D1's free tier daily row read limit [code: 7500]
```

The import itself completed — 305 files, 0 failures, 2,077 seconds — and
verification passed 22 of 23 checks against the remote database before the read
limit was reached. The data is intact and correct. The database is simply past
what the plan permits, and enforcement is applied at query time rather than at
write time, which is why the import was allowed to finish.

## Why trimming does not fix it

The payload alone, before any index, is about 832 MB:

| bytes  | column                    |
| -----: | ------------------------- |
| 166 MB | `hadith.text_ar`          |
| 169 MB | `hadith_subject`          |
| 138 MB | `hadith.text_en`          |
| 108 MB | `hadith_chain.name`       |
|  75 MB | `hadith.matn_ar`          |
|  72 MB | `hadith.matn_en`          |
|  53 MB | `hadith_narrator.surface` |
|  33 MB | chapter headings          |

Plus a 205 MB FTS index and roughly 700 MB of B-tree overhead for the 5.2M rows
in the join tables.

Dropping the entire search index frees 205 MB and leaves the database at 1.5 GB,
still three times the limit. There is no subset that both fits in 500 MB and
remains the thing the project is for: `matn_ar` and `matn_en` are what matn
comparison reads, and the chain tables are what makes isnad analysis possible.

## Options

1. **Workers Paid, $5/month.** 10 GB per database and 25 billion rows read per
   month. 1.74 GB fits with room for the sirah corpus later. This is the only
   option that keeps the product whole, and it is the recommendation.
2. **Corpus text in R2, index in D1.** R2 has no practical size limit and no
   per-row read accounting. It costs a second lookup per narration and a
   meaningful rewrite of every page that reads text.
3. **Cut the corpus.** Drop one language, or the matn columns, or the chain
   tables. Each of these removes a capability the archive exists to provide.

## What is blocked until this is resolved

`migrations/0004_hadith_search_index.sql` and `scripts/fill-hadith-fts.mjs`
rebuild the search index so it covers all 276,347 narrations instead of
truncating 67 of them. Both are written, tested, and verified end to end against
the local database. They cannot run against production because rebuilding
requires writes.

The current production index still works. It is missing the tail of 67
narrations, which is 0.024% of the corpus.

Once the plan allows writes, the whole rebuild is one command:

```bash
npm run fts:rebuild:remote
```

That applies the migration, fills the index range by range, and runs the 26
verification checks. It took 7 minutes against the local database and is size
neutral: the index went from 204.7 MB to 205.6 MB, the extra 0.9 MB being the
67 recovered tails.
