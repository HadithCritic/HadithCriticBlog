# Quran Data Pipeline

## Scope

The first adapter creates a **local-only staging database**. Its default
location is under ignored `scratch/`; it is not read by an app page or copied
to `dist/`. The active product scope uses the pinned Corpus Coranicum TEI
source. Nasser, Studies, and Shamela adapters below document historical
private inventory work only; those inputs are excluded from the active goal
and must not be ingested or published.

The multi-source commands and quarantine verifiers in this document reproduce
historical private audit snapshots. They are not required for the active
Corpus Coranicum release. Use the pinned TEI source and the CC-only release
builder/verifiers for current work; do not pass excluded source paths.

## Rebuild

From the repository root, with Node 24+, Python 3.10+, and `lxml` installed.
The active command uses only the pinned local Corpus Coranicum checkout:

```powershell
node scripts/quran/build-source-manifest.mjs `
  --scope corpus-coranicum-only `
  --tei "scratch\quran\corpus-coranicum-tei" `
  --out "scratch\quran\source-manifest-coranicum-only.local.json"

python scripts/quran/ingest-local-sources.py `
  --tei "scratch\quran\corpus-coranicum-tei" `
  --schema "docs\research\quran-platform\schema-v3.sql" `
  --source-manifest "scratch\quran\source-manifest-coranicum-only.local.json" `
  --out-dir "scratch\quran\staging-coranicum-only"

python scripts/quran/verify-local-staging.py `
  --tei "scratch\quran\corpus-coranicum-tei" `
  --db "scratch\quran\staging-coranicum-only\quran-staging.sqlite"

python scripts/quran/build-coranicum-release.py `
  --staging-db "scratch\quran\staging-coranicum-only\quran-staging.sqlite" `
  --schema "docs\research\quran-platform\schema-v3.sql" `
  --out-dir "scratch\quran\release-coranicum-only"

python scripts/quran/verify-coranicum-release.py `
  --staging-db "scratch\quran\staging-coranicum-only\quran-staging.sqlite" `
  --release-dir "scratch\quran\release-coranicum-only"
```

The ingest step refuses to run if a source file is missing, added, removed, or
has changed since the SHA-256 manifest was written. In `corpus-coranicum-only`
scope, the manifest records Nasser, Studies, and Shamela as
`excluded_by_scope`, with zero files and no local paths; ingestion rejects
those paths and does not call their parsers. This state is distinct from
`not_supplied` and `missing`. The generated manifest, staging database, and
parse report remain under ignored `scratch/`.

## What is staged

- Each repository file and local input file becomes a `source_artifact` with a
  SHA-256 hash and byte count.
- The TEI source manifest records the exact Git commit and, when the local Git
  reflog contains a `clone:` event, records its ISO-8601 clone time and the
  reflog entry used as evidence. Ingestion stores that timestamp in
  `source_snapshot.acquired_at`; it remains null if no acquisition timestamp
  is evidenced. Manifest-generation time remains a separate `createdAt` field.
- All 3,240 TEI XML files under `data/` are checked against the repository's
  `corpus_coranicum.rng`. Parser errors remain in the local report; any schema
  failure makes the command fail.
- Corpus Coranicum `allvariants.xml` records retain their `xml:id`, exact
  source key strings, TEI fragment, word order, each word's exact character
  data, and native `w/@n` locator. Schema v2 stores each direct `<persName>`
  in `variant_reader_reference` with its one-based source order, exact key,
  exact label, source record, locator, and separately linked authority row.
  The legacy scalar reader fields on `variant_assertion` summarize only the
  first entry; do not use them for complete counts, filters, or graph edges.
  A record with no direct `<persName>` has no relation row. The documented
  alias and interpretation limits are in [DECISIONS.md](DECISIONS.md). An
  empty source key remains empty.
- Cairo Arabic, transcription, and each language translation are stored as
  distinct text layers linked to the TEI-native verse ID. Only descendant
  character data is extracted; only the element's own trailing sibling tail
  is excluded. Values are not trimmed or Unicode-normalized. The verifier
  compares each extracted line and word against its source XML.
- Every TEI manuscript description is retained with its source file and TEI
  ID or a within-file `msDesc[n]` locator where no ID exists. Images are not
  copied.
- Word boundaries are stored only where TEI supplies `<w>` elements. A
  reproducible `w/@n` to Cairo `xml:id` transform creates review candidates;
  each candidate points to both exact source records and stays unverified
  until a human checks it. The pilot compares against the Cairo `arabic_text`
  layer and shows the whole source verse as context; this does not certify an
  equivalence.
- Nasser JSON preserves its complete root payload, list metadata, and row
  fields without assigning meanings to undocumented values. Native IDs come
  only from source `id` fields; absent IDs stay null and array positions remain
  locators. Shamela body and footnote fields remain separate CSV values.
  Studies files are hashed and linked to supplied rename-manifest rows; file
  records and manifest rows have null native IDs, with filename/CSV line in
  their locators. No PDF text or images are extracted during ingestion.
- A missing or not-supplied Shamela file remains explicit in the local ingest
  report and contributes zero staged rows. Historical counts from an earlier
  snapshot are not current ingestion evidence.

## Historical schema v1 audit snapshots

The pinned TEI commit is
`57cb2b7be321ecfba100cb5f7988974f47864a14`. These earlier local runs validate
all 3,240 TEI data XML files and stage 18,000 variant assertions, 31,294 Cairo text
and translation lines, 154,864 Cairo word tokens, and 3,035 TEI `msDesc`
records across manuscript and intertext collections; it also creates 34,163
variant-to-Cairo locator candidates. The schema-v1 parser retained only a
scalar reader reference per variant assertion; its counts are not a complete
account of direct `<persName>` entries. The complete 30,112-entry relation is
documented and independently checked under “Complete source-listed variant
references (schema v2)” below. SQLite integrity and foreign-key checks pass.
The dedicated manuscript collection has 2,322 descriptions. The TEI release's
README refers to a broader 2,500+ inventory, so the platform does not claim
that count for this pinned export.

The historical schema v1 verifier compared staged variant strings, variant
word strings and locators, Cairo lines and word tokens, and candidate locators
with the same source XML. That run reported zero text, locator, token,
candidate, or duplicate-source-locator mismatches. This verifies extraction
parity; it does not verify historical claims in the source or fill absent
citations.

The same schema v1 run independently compared all 870 reader authority labels
and all 58 source authority labels with their source XML, with zero
mismatches. The manuscript catalogue adapter was checked separately against
2,322 source records and 14,487 mapped field elements; its verifier also
reported zero mismatches.

These notes describe historical schema v1 snapshots only. Two corrected v1
ingests produced the same staging database hash:
`a4413df2338e46f51dc890d35e40461bf25eb4f2798675743020c0183010308c`. A later
audit found the old default `scratch/quran/staging` database failed TEI
text/authority parity, while `scratch/quran/staging-corrected2` passed. The
historical CC-only releases v3 and v4 are preserved; they are superseded by
the current schema v3 release below. Do not use those older databases for a
new build or treat their scalar reader-reference counts as complete.

## Historical combined snapshot and current Corpus Coranicum-only release

The earlier `staging-final-provenance-v2-2026-09-28` and `release-v5`
directories are historical audit outputs. The current pipeline uses parser
`quran-local-ingest/0.1.5`, source manifest version 3, and explicit
`corpus-coranicum-only` scope. The manifest records the three excluded inputs
as `excluded_by_scope`; only the pinned 3,243-file TEI checkout is inventoried
and parsed. Schema v3 adds explicit `rights_state` fields on text and
translation editions. Corpus Coranicum Arabic/transcription rows are
identified; English, German, and French translations remain `needs_review` in
local staging and carry no inferred translator labels. The current v3 staging
and local SQLite parity artifact are recorded in the latest progress entry;
both remain ignored local artifacts. The local-only SQLite release is not
copied into the browser release.

The quarantine commands below reproduce historical private audits only; they
are not part of a current build.

Run the current release comparison after rebuilding:

```powershell
python scripts/quran/verify-coranicum-release.py `
  --staging-db 'scratch\quran\staging-coranicum-only-v3-2026-09-28\quran-staging.sqlite' `
  --release-dir 'scratch\quran\release-coranicum-only-v6-2026-09-28'
```

Historical quarantine verifier (not part of the active scope):

```powershell
python scripts/quran/verify-quarantined-source-staging.py `
  --source-manifest 'scratch\quran\source-manifest-local-only-2026-09-28.json' `
  --db 'scratch\quran\staging-final-provenance-v2-2026-09-28\quran-staging.sqlite' `
  --nasser 'C:\Users\Jonathan\Desktop\Quran\nasser' `
  --studies 'C:\Users\Jonathan\Desktop\Quran\Studies' `
  --out 'scratch\quran\verify-quarantined-staging-current-2026-09-28.json'
```

## Private Studies document metadata audit

The supplementary `scripts/quran/audit-study-document-metadata.py` command
compares the supplied Studies directory to the pinned local source manifest
and rename manifest. It reads only PDF document-info properties, PDF
encryption state and page counts, and DOCX core properties. It does not extract
body text, OCR, or images. Run it with the exact user-supplied location and
write the report under ignored `scratch/`. This optional local audit requires
Python `pypdf`; it adds no runtime dependency to the website:

```powershell
python scripts/quran/audit-study-document-metadata.py `
  --studies 'C:\Users\Jonathan\Desktop\Quran\Studies' `
  --source-manifest 'scratch\quran\source-manifest-local-only-2026-09-28.json' `
  --out 'scratch\quran\studies-document-metadata-audit-2026-09-28.json'
```

The historical audit reconciled 77 mapped documents (76 PDFs and one DOCX) to
the 78-file manifest and finds two byte-identical pairs. Metadata and
rename-manifest values remain unverified clues; this private report does not
clear publication or redistribution rights. No files are merged or changed.

## Complete source-listed variant references (schema v2)

The active source-listed-reference relation is verified from the TEI-only
staging snapshot at `scratch/quran/staging-coranicum-only-v3-2026-09-28/` and
`schema-v2.sql`. It adds `variant_reader_reference`, with a separate row for
each direct `<persName>` under each `<item>`. Do not substitute the legacy
`variant_assertion.reader_native_key` or `reader_authority_id` scalars for this
relation: those columns preserve only the first direct entry for compatibility.
The relation records source order, native key, exact source label, source
record ID, source locator, and an authority foreign key only when the
documented prefix alias resolves. A row with no direct `<persName>` remains
without a reference; source labels are not normalized or presumed to name a
person.

For the pinned export, `verify-local-staging.py` independently reconciles all
30,112 direct entries across 18,000 variant records and all 3,240 validated
data XML files. The CC-only SQLite release uses schema version 2 and adds the
30,112-row relation; its independent release verifier compares all 28 schema
tables and 49,294 full-text search rows to staging. Its 449,683,456-byte
artifact SHA-256 is
`2fc2aa251731821a70857ae4b6a8d596314594a3b188382d35ab671dfa457363`.
Run the independent checks with:

```powershell
python scripts/quran/verify-local-staging.py `
  --tei "scratch\quran\corpus-coranicum-tei" `
  --db "scratch\quran\staging-coranicum-only-v3-2026-09-28\quran-staging.sqlite"

python scripts/quran/verify-coranicum-release.py `
  --staging-db "scratch\quran\staging-coranicum-only-v3-2026-09-28\quran-staging.sqlite" `
  --release-dir "scratch\quran\release-coranicum-only-v6-2026-09-28"

python scripts/quran/verify-reader-count-analysis.py `
  --release-db "scratch\quran/release-coranicum-only-v6-2026-09-28/quran-coranicum-57cb2b7be321.sqlite" `
  --tei "scratch\quran\corpus-coranicum-tei" `
  --analysis "scratch\quran\reader-counts-all-persname-v3-2026-09-28.json"
```

Browser JSON preserves every entry in two checksummed index assets, each below
the 25 MiB static-asset limit; detail shards also retain complete per-record
reference arrays. The independent package verifier recomputes source keys,
exact labels, order, source locators, alias targets, and candidate crosswalk
details. The static site release pointer currently targets
`v0.5.27-cc-57cb2b7be321`. Its reader-label analysis names the exact SQLite
release hash used as input; the whole-release verifier checks record/label
coverage against both reader-index shards and the release coverage manifest.
To intentionally refresh the analysis, first confirm the root pointer and
choose a new, unique release ID. The command independently verifies the active
static release and SQLite/TEI analysis before copying the release chain and
advancing the root pointer. This example creates v0.5.28; do not run it unless
you intend to publish that new local release:

```powershell
python scripts/quran/refresh-reader-analysis-release.py `
  --release-id v0.5.28-cc-57cb2b7be321 `
  --release-db "scratch\quran\release-coranicum-only-v6-2026-09-28\quran-coranicum-57cb2b7be321.sqlite" `
  --tei "scratch\quran\corpus-coranicum-tei" `
  --analysis "scratch\quran\reader-counts-all-persname-v3-2026-09-28.json"
```

## Nasser JSON structural audit

The local-only report `scratch/quran/nasser-json-shape-profile.local.json`
uses transform `nasser-json-structural-profile/1.0.0`. It reads the three
hash-pinned user files as UTF-8 with optional BOM, traverses the parsed JSON
without rewriting it, encodes object paths with JSON Pointer escaping, and
represents each array position with `/*`. The report contains source file
hashes, byte lengths, row counts, top-level keys, path occurrence counts, and
JSON types; it does not copy leaf values, normalize strings, infer field
semantics, or enter the public release. `KNOWN-GAPS.md` records the resulting
field-shape evidence without assigning meanings to `status` or `standard`.
