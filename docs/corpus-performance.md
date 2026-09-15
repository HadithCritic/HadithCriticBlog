# Why the corpus is slow, and what makes it fast

Measured 2026-09-15 against production from Atlanta, 15 ms RTT to the Cloudflare
edge. Every figure below came from `curl`, the browser's resource timeline, or
`window.__corpusStats()`. Nothing here is estimated.

`docs/static-corpus.md` describes the system. This document is about what it
costs a reader, which turns out to be dominated by one configuration gap and one
structural property of the design.

## The measurements

The HTML is not the problem.

| | TTFB | `CF-Cache-Status` |
| --- | ---: | --- |
| `/hadith/collection/musannaf-ibn-abi-shaybah/` | 89 ms | `HIT` |
| `/hadith/237072` | 515 ms | Worker-rendered shell |
| a cached font on the site origin | 48 ms warm | `HIT` |

The corpus is. One narration record:

```
/hadith/237072   34 range requests, 143 KB fetched
corpus client module starts        1,039 ms
manifest.json                      1,114 ms  (282 ms)
first chunk request                1,398 ms
... then 34 requests, strictly serial:
77483 -> 77690 -> 77873 -> 78054 -> 78245 -> 78392 -> ...
```

Each request begins the millisecond the previous one ends. Per-request cost to
the corpus origin, measured over eight sequential probes on a reused connection:
**185 ms** median, 224 ms mean.

| Page | Range requests | At 185 ms serial |
| --- | ---: | ---: |
| `/hadith/[id]` record | 34 | ~6.3 s |
| `/hadith/collection/[slug]` | 14+ | ~2.6 s |
| `/hadith?q=` search | 74 | ~13.7 s |
| `/narrators/[id]` dossier | 117 | ~21.6 s |

The last two request counts are from `docs/static-corpus.md`; the first two were
measured here.

## Cause 1: Cloudflare is not caching the corpus at all

This is the whole difference between slow and tolerable, and it is a
configuration gap, not a code defect.

```
$ curl -sI -H "Range: bytes=0-4095" https://data.hadithcriticblog.com/<version>/chunks/hadith.chunk.000
Cache-Control: public, max-age=31536000, immutable
cf-cache-status: DYNAMIC
```

Five consecutive requests for the identical byte range, all `DYNAMIC`.
`manifest.json` too. `DYNAMIC` is not a cache miss. Cloudflare's own
troubleshooting page defines it as a decision made *before* the cache is
consulted: the request was never eligible.

The reason is the [default cached file extensions
list](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/).
Cloudflare caches a fixed set of extensions by default. `.json` is explicitly
excluded, and the chunks have no extension at all: `sql.js-httpvfs` builds each
URL as `urlPrefix + String(n).padStart(suffixLength, "0")`, so the last path
segment is `000`, `001`, `002`. Nothing on the corpus hostname matches the list,
so nothing on the corpus hostname is cached.

The correct `Cache-Control` on the objects does not change this. An origin
header decides how long an *eligible* response is cached, not whether it is
eligible. [R2's own
documentation](https://developers.cloudflare.com/r2/buckets/public-buckets/)
says the same thing in one line: "By default, only certain file types are
cached. To cache all files in your bucket, you must set a Cache Everything page
rule."

So every 4 KiB SQLite page read is a full trip to the bucket in one region,
paid again by every reader, on every page, forever.

### What it costs, and what fixing it is worth

Measured on warm reused connections from the same client:

| | Latency |
| --- | ---: |
| Raw network RTT to the edge | 15 ms |
| Cached asset, `CF-Cache-Status: HIT` | **48-58 ms** |
| Corpus range request, `DYNAMIC` | **185 ms** |

### What the cache rule actually fixed, and what it did not

A Cache Rule on the hostname was applied on 2026-09-15 (`cache: true`,
`edge_ttl: respect_origin`). Smart Tiered Cache was enabled with it. Measured
immediately afterwards:

| Request | Before | After |
| --- | --- | --- |
| `manifest.json`, plain GET | `DYNAMIC` | **`HIT`** |
| chunk, plain GET (10 MiB) | `DYNAMIC` | **`HIT`**, `Age: 65` |
| chunk, `Range: bytes=0-4095` | `DYNAMIC` | **`DYNAMIC`** |

So the rule works, and the objects are demonstrably in cache, but **a request
carrying a `Range` header is still not served from that cached object**. Adding
`origin_range_requests: {mode: "on"}` to the rule did not change it either.
Per-request latency improved from 185 ms to roughly 150 ms, which is the
tiered-cache path to the bucket, not a cache hit.

That is the entire corpus read path. A cache rule alone therefore does **not**
fix corpus page latency, and the earlier projection in this document that it
would take a record page from 6.3 s to 1.8 s was wrong.

### The fix: serve the ranges from a Worker

Since Cloudflare will not cache the range on this setup, the range has to be
turned into something it will cache, on a cache key we control. That is
`workers/corpus/`:

- an R2 **binding**, so a miss is an in-network read of the bucket rather than
  a second internet round trip
- each client range widened to the enclosing **1 MiB slice**, which is the grain
  Cloudflare already aligns its own origin fetches to
- the slice stored in the Workers Cache API under a synthetic URL carrying the
  slice number and **no `Range` header**, so every client range inside it maps
  to one entry
- the requested sub-range returned as a correct `206`, never a `200`, because
  `openCorpus()` probes for exactly that and the alternative is SQLite
  assembling pages from the wrong bytes

One reader's 4 KiB page read then warms the 256 page reads around it, and the
next request for any of them is a colo cache hit instead of a bucket read. The
response carries `X-Corpus-Slice-Cache: <hits>/<slices>` so this is measurable
rather than assumed.

It is configured against `corpus.hadithcriticblog.com`, a second hostname, so
the corpus can be verified end to end before anything readers use is repointed.
Cutting over is then one change to `PUBLIC_CORPUS_BASE_URL` in the build
environment, and rolling back is the same change in reverse.

## Cause 2: the requests are serial, and nothing can parallelize them

SQLite's VFS interface is synchronous. `sql.js-httpvfs` therefore reads pages
with **synchronous XHR inside a web worker**, which is the only place a browser
still permits one. A synchronous call cannot be batched, pipelined, or issued in
parallel by construction. The library's own source keeps an LRU of read heads
but issues one `doXHR()` at a time.

This is not a defect in the library and switching libraries does not fix it.
`sqlite-wasm-http`, the modern successor built on the official SQLite WASM
distribution, has the same property for the same reason.

What follows from it: **page latency is request count times round-trip time,
and the only levers are the two factors.** Cause 1 attacks the second. Causes 3
and 4 attack the first.

The library does have a read-ahead: `maxReadHeads` defaults to 3 and
`maxReadSpeed` to 5 MiB, doubling the fetch width while access stays
sequential. It does nothing for a record page, because a record page is index
seeks and row lookups, which are random. The 34 requests are 34 random 4 KiB
reads. Raising the read-ahead further is also unsafe here: `CLAUDE.md` records
that a read window wider than a chunk silently loses rows, which is why chunks
are 10 MiB and the floor is 1 MiB.

## Cause 3: the page size makes every read 4 KiB

`requestChunkSize` is 4096 because the database page size is 4096, and the two
must match or every logical read spans two requests. That is correct as written.

But 4096 is the SQLite default, not a decision anyone made for this corpus. When
latency dominates, a 4 KiB read and a 32 KiB read cost the same 185 ms, so a
small page size buys nothing and costs round trips: more pages per B-tree level,
more index pages to walk, more requests per query.

phiresky's own guidance is that page size is "a trade off of number of requests
that need to be made vs overhead." At 185 ms per request and 15 ms of that being
actual network time, the overhead side of that trade is free here.

The lever already exists and is plumbed through:

```bash
npm run build:corpus -- --page-size 32768
```

`build-distribution-db.mjs` applies the pragma before the VACUUM, and
`chunk-db.mjs` reads `PRAGMA page_size` back out of the finished file into the
manifest, so `requestChunkSize` follows automatically. Nothing else needs
editing.

Expect roughly 3-5x fewer requests per query, at the cost of a somewhat larger
file and more bytes per read. The bytes do not matter: the record page fetched
143 KB in total, and even 8x that is nothing next to six seconds of waiting.

## Cause 4: the record and collection pages should not be querying at all

This is the architectural observation, and it is worth stating plainly because
the static corpus is otherwise the right design.

Moving off Turso optimized for **cost**, and it worked: reads are free and
unmetered now. But it also replaced, for the record page, **one server-side
query that was then edge-cached for every subsequent reader** with **34 serial
client round trips that every reader pays in full**. `DATABASE.md` measures a
narration record at 20 rows read. That was never the expensive shape. Search,
the dossier and the register were, and those are the shapes the static corpus is
genuinely right for: unbounded, exploratory, and impossible to precompute.

Record pages and collection pages are neither. They are bounded, they are
deterministic, and their inputs are known at build time.

Three ways to act on that, in increasing order of change:

**4a. Publish the record payloads as static JSON on R2.** A narration record is
one row plus its chain, subjects and glosses. Generated at corpus-build time and
written beside the chunks, `/<version>/records/237072.json` is **one cached
request, ~50 ms**, against 34 serial ones. R2 has no file-count limit, unlike
Workers static assets, so 276,347 objects is allowed; at $4.50 per million
Class A operations a full publish costs about **$1.25 one-time**. The corpus
stays the source of truth and the generator stays in the same pipeline that
already emits `corpus-meta.json`. This is the largest single win available for
the two pages a reader actually lands on, and it does not disturb search.

**4b. Server-render those two routes from a hosted database again.** The size
constraint that forced the migration off D1 is gone: D1 now allows **10 GB per
database** on Workers Paid, against the 500 MB that refused a write in
`DATABASE.md`, with 25 billion rows read per month included. At the measured 20
rows for a record and 58 for a collection page, the corpus would not approach
the included allowance at any plausible traffic. D1 also runs inside Cloudflare's
network, so it is not the us-east-1 HTTPS round trip that made Turso expensive
in latency terms. This restores server-rendered HTML on ~297,000 URLs, which
also closes the crawler consequence documented at the end of
`docs/static-corpus.md`.

**4c. Do nothing structural and accept ~1.8 s** after the cache rule, or ~0.6 s
after the cache rule plus a 32 KiB page size. Defensible if the corpus stays a
research tool rather than a landing surface.

4a is the better first move. It needs no new service, no new bill beyond a
dollar, and no retreat from the static-corpus decision.

## Three page-weight problems, unrelated to the corpus

Found in the same resource timeline, and they delay the corpus bootstrap
because they compete for the connection before it starts:

1. **`public/search-index.json` is 2.6 MB on disk and 480 KB over the wire, and
   it is fetched on every page load.** [SearchDialog.astro:897](../src/components/SearchDialog.astro)
   fetches it at module scope, whether or not the reader ever opens search. It
   landed at 825 ms on the record page. Move it inside `open()` behind a
   once-guard.
2. **`public/images/brand/geometric_emblem_transparent.png` is 175 KB and took
   508 ms**, rendered at 32x32 in the header and 24x24 in the mobile nav. A
   64x64 WebP is about 2 KB. `scripts/optimize-images.cjs` already exists.
3. **The corpus does not start until 1,039 ms**, after fonts, two stylesheets,
   the emblem, the search index and a 47 KB motion runtime. A `preconnect` to
   the corpus hostname and a `preload` on the manifest in `BaseLayout` recovers
   a few hundred milliseconds for free.

## The fixes, in order

| | Change | Status | Effect on a record page |
| --- | --- | --- | ---: |
| 1 | Cache Rule: corpus hostname eligible for cache | **applied** | whole-object GETs only; ranges unaffected |
| 2 | Smart Tiered Cache | **applied** | 185 ms -> ~150 ms per request |
| 3 | `workers/corpus/`: range slices in the Cache API | **written, not deployed** | ~6.3 s -> well under 1 s once warm |
| 4 | Defer the search index, shrink the emblem, preconnect | **applied** | -0.5 s of bootstrap, -650 KB per page |
| 5 | `--page-size 32768` rebuild | blocked: no master database locally | 3-5x fewer requests, compounds with 3 |
| 6 | Static record JSON on R2 | blocked: no master database locally | one cached request per record |

Items 5 and 6 both read the master corpus database, which is 1.62 GB, not in
git, and not currently on this machine; `scripts/d1seed-hadith/` is absent too,
so `build-static-db.py` cannot regenerate it. They are unblocked by restoring
`dist-db/silsilah.db`, or by reassembling it from the published chunks, which
`verify-distribution.mjs` already knows how to do.

### What item 4 changed, measured

| | Before | After |
| --- | ---: | ---: |
| `search-index.json`, fetched on every page load | 480 KB | **not fetched** until search opens |
| header emblem | 175,359 B PNG at 1254x1254 | **2,718 B** WebP at 96x96 |
| corpus origin handshake | begins at ~1,039 ms | `preconnect` in `<head>` |

The preconnect is emitted only on `/hadith` and `/narrators`, so an article page
does not open a connection it never writes to. It is also conditional on
`PUBLIC_CORPUS_BASE_URL` being an absolute origin, so `npm run dev` (where the
dev server serves the corpus itself) emits nothing.

### 1. The cache rule

Caching > Cache Rules. Match `hostname eq "data.hadithcriticblog.com"`, set
**Eligible for cache**: Yes, and Edge TTL **Use cache-control header from
origin**. The objects already say `immutable, max-age=31536000`.

By API:

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_request_cache_settings/entrypoint" \
  --request PUT \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "rules": [{
      "expression": "(http.host eq \"data.hadithcriticblog.com\")",
      "description": "cache the static corpus chunks and manifest",
      "action": "set_cache_settings",
      "action_parameters": {
        "cache": true,
        "edge_ttl": { "mode": "respect_origin" }
      }
    }]
  }'
```

Cloudflare caches the complete object and serves client ranges out of it,
aligning its own origin fetches to 1 MiB boundaries. A 4 KiB read therefore
warms a 1 MiB neighbourhood, and the next several reads near it are hits. The
10 MiB chunks are far below the 512 MB maximum cacheable file size on
Free/Pro/Business, so nothing is excluded by size.

Verify with `curl -sI -H "Range: bytes=0-4095" ...` and expect `HIT` on the
second request.

### 2. Smart Tiered Cache

Caching > Tiered Cache. Free on all plans, and [R2's public-bucket
documentation](https://developers.cloudflare.com/r2/buckets/public-buckets/)
recommends it specifically for custom domains: a single upper tier next to the
bucket, so a miss in one region does not become a separate origin fetch from
every region.

**Cache Reserve does not apply.** Cloudflare's documentation states that
requests to R2 public buckets linked to a zone's domain will not use Cache
Reserve. Do not spend time on it.

## What not to do

- **Do not swap `sql.js-httpvfs` for another HTTP VFS expecting parallelism.**
  The synchronous-XHR constraint is inherent to SQLite's VFS contract, not to
  this library.
- **Do not raise `maxReadSpeed` past the chunk size.** A read window wider than
  a chunk is clamped and the missing pages are silently dropped, which returns
  fewer rows rather than an error. This is recorded in `CLAUDE.md` and was
  measured on a 64 KiB fixture.
- **Do not rename the chunks to a cacheable extension.** The obvious trick,
  `hadith.chunk.000.bin`, does not work: the library appends the zero-padded
  number as the final path segment, so the extension cannot follow it.
- **Do not lower the corpus chunk size to make cache entries smaller.** 10 MiB
  is already well inside the cacheable limit, and `chunk-db.mjs` refuses
  anything under 1 MiB for the read-ahead reason above.

## Sources

- [Cloudflare: Cache responses (DYNAMIC)](https://developers.cloudflare.com/cache/concepts/cache-responses/)
- [Cloudflare: Investigate uncached responses](https://developers.cloudflare.com/cache/troubleshooting/investigating-uncached-responses/)
- [Cloudflare: Default cache behavior and cached file extensions](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [Cloudflare: Range request behavior](https://developers.cloudflare.com/cache/reference/range-requests/)
- [Cloudflare: Cache Rules settings, including Origin Range Requests](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/)
- [Cloudflare: Create a cache rule via API](https://developers.cloudflare.com/cache/how-to/cache-rules/create-api/)
- [Cloudflare: R2 public buckets, custom domains and caching](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Cloudflare: Cache Reserve limits](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)
- [Cloudflare: D1 limits](https://developers.cloudflare.com/d1/platform/limits/) and [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [phiresky/sql.js-httpvfs](https://github.com/phiresky/sql.js-httpvfs) and [lazyFile.ts](https://github.com/phiresky/sql.js-httpvfs/blob/master/src/lazyFile.ts)
- [mmomtchev/sqlite-wasm-http](https://github.com/mmomtchev/sqlite-wasm-http)
- [PowerSync: The current state of SQLite persistence on the web](https://powersync.com/blog/sqlite-persistence-on-the-web)
