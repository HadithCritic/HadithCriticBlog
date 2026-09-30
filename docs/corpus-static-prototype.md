# Static corpus delivery prototype

This is a read-only export experiment for the static, lazy-loaded delivery
path. It reads the local master SQLite database and writes sample artifacts
under ignored `dist-db/static-prototype/`; it does not change the production
reader, the master database, or any published release.

Run it with:

```bash
npm run prototype:corpus
```

Then start the local HTTP origin in another terminal:

```bash
npm run serve:corpus-prototype
```

Open `http://127.0.0.1:4323/`. The harness loads one collection projection,
then individual hadith and narrator JSON objects. It displays per-fetch browser
timings, compressed transfer bytes and its in-page repeat cache behavior. The
local server logs exact request count and compressed bytes sent.

With that server running, automate the sample flow and print a repeatable
browser report with:

```bash
npm run benchmark:corpus-prototype
```

Optional arguments select the hadith and narrator used for the detail examples:

```bash
npm run prototype:corpus -- 20614 5361
```

The default sample uses the whole Muwatta' Malik search projection, hadith
20614, and narrator 5361. The report records the source row counts, raw JSON
sizes, and gzip sizes. Gzip sizes are a transfer estimate; the export itself
also writes a `.json.gz` beside each JSON artifact. Production hosting would
need to set the correct `Content-Encoding` metadata when publishing those
precompressed objects.

## First sample

Measured from the local 1.62 GB master database on 2026-09-26:

| Sample | Rows / purpose | JSON | gzip |
|---|---:|---:|---:|
| Muwatta' Malik search projection | 1,781 narrations | 3,598,591 B | 684,757 B |
| Hadith 20614 detail | one narration, chain, subjects, glosses | 7,864 B | 2,199 B |
| Narrator 5361 dossier | detail, criticism, transmissions, aliases | 67,332 B | 12,224 B |

The first headless browser run against the local static origin fetched three
objects total: the selected book shard (685,057 transfer bytes including HTTP
overhead), the hadith detail (2,499 bytes), and the narrator dossier (12,524
bytes). The browser reported 52.0 ms, 11.1 ms, and 13.5 ms respectively. It
then repeated the hadith and narrator loads from the in-page cache with zero
additional data requests. These are localhost measurements, so they validate
the request shape and code path rather than predict reader latency from the
Cloudflare edge.

Current cold-reader measurements in `static-corpus.md` are 4.4 MiB / 74 range
requests for an all-corpus hadith search, 160 KiB / 37 requests for the hadith
detail, and 2.7 MiB / 117 requests for the narrator dossier. These figures are
not a same-scope benchmark: the prototype search is limited to the selected
Muwatta' Malik collection, and the current detail measurements include SQLite
pages and browser overhead. The harness renders extracted sample records and
counts static requests, but it does not reproduce the complete production
reader or measure Cloudflare edge latency. Search still needs a design that
can find results across books without downloading every book projection.

## Next decision

Before switching the reader, render these files through the existing hadith
and narrator views. Compare cold and repeat browser loads, cache behavior, and
exact visible text against the SQLite reader. Keep the current versioned
SQLite release as the rollback path until that comparison passes.
