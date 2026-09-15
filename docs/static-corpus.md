# The static corpus

The hadith corpus and the rijāl register are a 1.62 GB SQLite database that the
reader's browser queries directly, over HTTP range requests, against immutable
static files on a CDN. There is no database server in the request path for any
public page.

This document is the map. `DATABASE.md` is the history of how the corpus got
here; `CLAUDE.md` carries the traps.

## Why

The corpus had been on D1, then on Turso. Both bill reads, and the corpus is
276,347 narrations and 20,950 transmitters. One unqualified `COUNT(*)` cost a
quarter of a million billed rows, sixteen page views exhausted a daily
allowance, and the site then answered "temporarily unavailable" on pages that
were themselves costing almost nothing.

Moving to another provider moves the quota. It does not remove it. What removes
it is making a read cost nothing: a static file on a CDN, fetched in 4 KiB
pieces by the client that wants them, cached by the browser and by every edge in
between. A thousand readers searching the corpus generate a thousand cache hits
and no database load, because there is no database.

What it costs is stated plainly under [Consequences](#consequences).

## Shape

```
master SQLite  (dist-db/silsilah.db, built from the seed dumps, not in git)
      |
      |  scripts/build-distribution-db.mjs   ANALYZE, VACUUM, integrity check
      v
distribution SQLite  (dist-db/builds/<version>/hadith.db)
      |
      |  scripts/chunk-db.mjs                162 x 10 MiB + manifest.json
      |  scripts/build-corpus-meta.mjs       src/data/corpus-meta.json
      |  scripts/verify-distribution.mjs     counts + query parity vs master
      v
published artifact  (dist/client/data/corpus/<version>/  or  R2)
      |
      |  HTTP range requests
      v
sql.js-httpvfs in a web worker  ->  SQLite WASM  ->  FTS5
      |
      v
src/lib/corpus-client.ts  ->  the pages
```

## Versions are immutable

A corpus build is named `YYYY-MM-DD-<short commit>` and published under a
directory of that name. Chunks are never rewritten in place. Publishing
`2026-09-20` leaves `2026-09-14` reachable, so a reader who is midway through
loading the old corpus when a deploy lands finishes on the file they started
with rather than reading half of each.

The deployment picks a version through `src/data/corpus-meta.json`, which is
generated and committed, or through `PUBLIC_CORPUS_VERSION` to pin or roll back
without a rebuild. The version is printed on `/hadith` under the catalogue and
is readable as `window.__corpusVersion`.

## Where the chunks are served from

One variable, and on this deployment only one usable answer.

| | `PUBLIC_CORPUS_BASE_URL` | Publish with |
|---|---|---|
| Separate data host on R2 | `https://data.hadithcriticblog.com/` | `npm run publish:corpus` (already `--target r2 --cors`) |
| Dev server only | `/data/corpus/` (default) | nothing to stage; served from dist-db/builds |

The site's own assets are **not** an option, for the reason in the next
section: Cloudflare answers a range request with `200` and the whole file. A
built site therefore has to be told an absolute origin, and
`src/lib/corpus-config.ts` fails the build when it is not. That check exists
because the default shipped once: every corpus page on the deployed site
reported that the corpus could not be loaded, and the first report came from a
reader. `npm run publish:corpus:dist` remains for a host that does serve
ranges; it is not the Cloudflare path.

Nothing else changes, because the manifest's `urlPrefix` is **relative**.
`sql.js-httpvfs` resolves it against the URL the manifest was fetched from, so
the same bytes work from either place. An absolute `/data/...` prefix would pin
the chunks to the site origin no matter where the manifest came from, and
`scripts/verify-distribution.mjs` fails a build that has one.

The artifact would fit the site's own assets comfortably: 1,138 files totalling
1.7 GB against Cloudflare's limits of 20,000 files and 25 MiB per file, so 5.7%
of the file budget and 40% of the per-file ceiling. Size is not the problem.

### Byte serving is the problem, and it decides the host

**Cloudflare Pages and Workers static assets answer a range request with `200`
and the whole file.** Measured against `wrangler` locally: a
`Range: bytes=0-15` on a 10 MiB chunk returned `200`, 10,485,760 bytes, no
`Accept-Ranges`, no `Content-Range`. Cloudflare documents this as current
behaviour, "Pages currently returns `200` responses for HTTP range requests;
however, the team is working on adding spec-compliant `206` partial responses."

That is not merely wasteful here, it is **wrong**. `sql.js-httpvfs` sends
`Range: bytes=from-to` and then treats the response body as if it began at
`from`. Given the whole file it copies bytes from offset 0 into the page it
believes it requested, and SQLite reads a database assembled from the wrong
pages. The library itself only warns: "The server did not respond with
Accept-Ranges=bytes ... This may lead to incorrect results." On a site whose
entire purpose is reproducing source text exactly, a corpus that silently
returns the wrong narration is the worst available failure.

So `openCorpus()` in `src/lib/corpus-client.ts` refuses to proceed without
proof: one `Range: bytes=0-15` request, which must answer `206` with a matching
`Content-Range` and the SQLite magic string. A host that fails it gets
"corpus unavailable", not fabricated hadith.

Cloudflare's CDN cache in front of the asset server does serve ranges from
cached files, so a production deployment on Pages may well pass the probe once a
chunk is warm. That has not been confirmed on the real domain. Until it is:

- **R2 behind a data hostname is the safe host.** R2 is an object store with
  first-class byte serving, and range requests against it are `206` by design.
- Deploying with the default `/data/corpus/` is safe to *try*, because the probe
  turns the failure mode into a readable message rather than corruption. If
  readers see "corpus unavailable", set `PUBLIC_CORPUS_BASE_URL` to the R2
  hostname and redeploy. No code changes.

R2 needs CORS, because a cross-origin range request is not sent otherwise.
`publish-corpus.mjs --target r2 --cors` sets it: `GET`/`HEAD`, `range` allowed,
`content-range` and `accept-ranges` exposed.

## Building and publishing

```bash
npm run build:corpus                 # build, chunk, meta, verify
npm run publish:corpus               # upload the release to R2, with CORS
npm run build                        # the site
npm run publish:corpus:dist          # copy the corpus into dist/client
```

`build:corpus` needs the master database, which is 1.62 GB and not in git. It is
therefore a local, occasional step, not a CI step: the site builds from
`src/data/corpus-meta.json`, which is committed. Corpus releases and site
deployments are separate events, and the version in that file is what ties a
deployment to a corpus.

`publish:corpus` stages that same version by default. It reads
`src/data/corpus-meta.json` rather than minting a name the way `build:corpus`
does, so publishing after a later commit still stages the corpus the site is
built against. Pass `--version` to stage a different one.

The corpus is deliberately **not** in `public/`. Astro copies `publicDir`
wholesale into `dist/` on every build, which would mean copying 1.6 GB per
build. In development it is served from `dist-db/builds/` by the Vite plugin in
`scripts/lib/corpus-dev-server.mjs`, which implements the range semantics
`sql.js-httpvfs` requires; for a deployment it is hard-linked into the build
output once.

## What the reader actually downloads

Measured on a cold page against the current corpus, in the browser, with
`await window.__corpusStats()`:

| Workflow | Fetched | Range requests |
|---|---|---|
| `/hadith?q=الصلاة` (cold, FTS5 + 25 results) | 4.4 MiB | 74 |
| `/hadith/20614` (record, chain, subjects, glosses) | 160 KiB | 37 |
| `/narrators/5361` (Mālik: 118 statements, 80 relations) | 2.7 MiB | 117 |

The 1.62 GB figure is the size of the file, not of a visit. A search reads about
0.27% of it. Versioned paths are `immutable`, so a second search on the same
page reads almost nothing new.

This is why the query shapes in `src/lib/corpus-count.ts` still matter. They were
written to stop D1 billing for scans; the arithmetic is unchanged because the
cost only changed units. Every row SQLite touches that is not already cached is
a 4 KiB request over the network, so an unbounded `COUNT(*)` is now a reader
watching a spinner rather than a quota failure. Counts are capped at 10,000,
relevance ranking happens in a CTE before the join, and a total that is already
stored is never recounted.

## Where the code is

| Path | What |
|---|---|
| `src/lib/corpus-config.ts` | Which version, served from where. No chunk count. |
| `src/lib/corpus-client.ts` | Worker lifecycle, every query, typed results. |
| `src/lib/corpus-types.ts` | Row shapes, mirroring the schema. |
| `src/lib/corpus-count.ts` | The bounded-count and CTE-ranking query shapes. |
| `src/lib/hadith-search.ts` | `/hadith` search and results. |
| `src/lib/hadith-record.ts` | `/hadith/[id]` record. |
| `src/lib/collection-edition.ts` | `/hadith/collection/[slug]` narration stream. |
| `src/lib/narrator-register.ts` | `/narrators` register. |
| `src/lib/narrator-dossier.ts` | `/narrators/[id]` dossier. |
| `src/lib/narrator-compare.ts` | `/narrators/compare` table. |
| `src/data/corpus-meta.json` | Generated totals, collections, facets. Committed. |
| `src/data/narrator-sitemap.json` | Generated sitemap id list. Committed. |
| `tests/corpus.spec.ts` | The acceptance suite, including "no database traffic". |

Which routes are prerendered:

| Route | Rendering |
|---|---|
| `/hadith` | Prerendered shell; search client-side |
| `/hadith/collection/[slug]` | Prerendered, one page per collection (33) |
| `/narrators` | Prerendered shell; rows client-side |
| `/narrators/compare` | Prerendered shell |
| `/sitemap-narrators*.xml` | Prerendered from generated ids |
| `/hadith/[id]` | On demand, **no I/O**, edge-cached |
| `/narrators/[id]` | On demand, **no I/O**, edge-cached |

The last two are on demand only because their ids are unbounded, 276,347 and
20,950 is past what Cloudflare will hold as assets. They read nothing at request
time; they render a frame with the id in it and cost a Worker invocation.

## Testing it

The corpus is not in git, so CI has no corpus. The suite would therefore have
had to skip there, which would have left the browser-side data layer, all six
renderers and the range-request path with no automated coverage at all. A suite
that always skips protects nothing.

So there are two suites and a committed fixture.

| | Runs against | Asserts |
|---|---|---|
| `tests/corpus.spec.ts` | any corpus, real or fixture | behaviour, with counts read from the served `corpus-meta.json` |
| `tests/corpus-data.spec.ts` | the real corpus only | the totals and the particular records a release is expected to carry |

`tests/fixtures/corpus/` is a miniature corpus cut out of the real one by
`npm run build:corpus:fixture`: 48 narrations, 161 transmitters, 4 collections,
two chunks, about 2.6 MB, committed. Same schema, same derived tables, same
Arabic fold, chunked by the same script. The subset is chosen rather than
random, so it contains the records the data suite names and both spellings of
the folded-Arabic cases.

CI builds twice. Once from the committed metadata, which is what deploys, and
once after `npm run use:corpus-fixture` swaps in the fixture's own metadata, so
the page totals and the corpus it is served agree. `npm run use:corpus-real`
puts the tracked files back.

Locally, against the real corpus:

```bash
npm run build:e2e          # build with the corpus on its own origin
npm run test:e2e:corpus    # both suites, including the data assertions
```

Stop `npm run dev` first. Playwright reuses a server already answering on 4321,
and a dev server serves the source rather than that build, so the corpus is
requested from the wrong origin and every corpus test fails on a 404.
`scripts/preview-foreground.mjs` refuses to adopt one and says so.

The data suite skips itself when the served corpus announces itself as
`fixture`, so it cannot quietly pass against the wrong one.

## Traps

**Client-rendered markup gets no scope hash.** Astro scopes a page's `<style>`
to `[data-astro-cid-*]`, and a node created by script never carries that
attribute. Every rule for markup these modules emit lives in an `is:global`
block. Moving a rule back into a scoped block silently unstyles the page.

**`:global()` inside an `is:global` block ships as a literal selector.** Astro
only rewrites `:global()` in a scoped block; in a global one it passes through,
lightningcss logs "'global' is not recognized as a valid pseudo-class", and the
emitted CSS contains `.facing-prose :global(.folio){...}`, which matches
nothing. That reached production: emphasis, bold and folio references inside
narration text were unstyled on every record page, with a build warning as the
only sign. When converting a block to `is:global`, unwrap every `:global()` in
it.

**Middleware runs while Astro prerenders.** `src/middleware.ts` reads
`context.request.headers` to decide cacheability, and there is no request during
a build: touching it logs "`Astro.request.headers` is not available on
prerendered pages" once per page, which became 33 warnings once the collection
editions were prerendered. It now returns early on `context.isPrerendered`.

**`requestChunkSize` must equal the database page size.** A mismatch makes every
SQLite page read span two range requests. `chunk-db.mjs` reads `PRAGMA page_size`
from the file rather than assuming, and the acceptance suite asserts it.

**Chunks must be large compared to the read-ahead, or the corpus loses rows.**
The VFS grows its read window as it walks pages sequentially and maps each read
to exactly one chunk file. A read wider than a chunk is clamped to that chunk's
end, and only the pages that arrived get stored. Nothing errors. Measured on a
2.5 MB fixture chunked at 64 KiB: a term present in seven narrations returned
none, and one present in nine returned two, while the same queries on the same
file returned seven and nine locally. `chunk-db.mjs` now refuses a chunk size
below 1 MiB. Production's 10 MiB is nowhere near the floor.

The read window doubles on every sequential hit and is not bounded by the chunk
size, so a long enough table scan would eventually outgrow even a 10 MiB chunk.
That is one more reason the query shapes in `corpus-count.ts` matter: the site
does not scan. Counts stop at 10,000, ranking happens on the index before the
join, and stored totals are read rather than recomputed.

**A version is immutable, so never rebuild one in place.** The chunks are served
`immutable` for a year. Republishing different bytes at the same URLs leaves a
browser holding the old manifest and the new chunks, which is the same failure
as above: a database that answers with missing rows rather than failing. This
bit the test fixture while it was named `fixture`; it is now named for a hash of
its own contents, so a rebuild publishes somewhere new. The manifest itself is
deliberately *not* immutable, for the same reason and so a rollback can take
effect.

**A check that waits for `load` measures a spinner.** Corpus pages are shells
until the corpus answers. `scripts/check-contrast.mjs` waits for real content
per route and fails the route if it never arrives, because a contrast check run
against a loading state reports two colours and passes.

**The shell is one document for every page of a collection.** `?page=2` must be
read from the URL, not from a data attribute baked into the prerendered HTML.
This shipped wrong once: the right records with the pager insisting it was page
one.

## Consequences

**A crawler that does not run JavaScript sees a shell** on `/hadith/[id]` and
`/narrators/[id]`, roughly 297,000 URLs, of which 18,924 narrator dossiers are
submitted by sitemap. There is no free way around this: serving rendered HTML
for those pages requires a server-side data source, which is the thing that was
removed. The collection pages, the corpus totals, the catalogue and every
article remain fully server-rendered.

**Corpus browsing requires JavaScript.** Each corpus page carries a `<noscript>`
saying so and pointing at what still works. The written research does not depend
on it.

**Turso still exists**, for one thing: the `article_notifications` ledger behind
the admin notification route. It is a handful of rows written by hand a few
times a month and is not the corpus. `src/lib/db.ts` says so at the top, and
nothing under `/hadith` or `/narrators` imports it.

## Research distribution

Not built. A Parquet export of the same tables, published as a Hugging Face
dataset with schema, provenance, row counts and checksums, is the natural
complement to the web distribution and would be generated from the same
distribution database. It is not a runtime dependency of the site and should
never become one.
