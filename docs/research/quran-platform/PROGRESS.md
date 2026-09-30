# Quran Platform Phase Log

Append a short entry at each completed phase. Do not describe a phase as
complete until its exit criteria have evidence.

**Current scope:** the pinned Corpus Coranicum TEI release and Quran modules
already built from it. Nasser, the supplied Studies folder, and Shamela are
excluded from active ingestion, validation, and release gates. A separate qirāʾāt research track (D-065) reads local Shamela texts and does not enter the release. Their earlier
mentions below are historical audit records only. The Academic Studies site
module remains part of the site.

## Phase 0 — Source authority, rights, and acquisition manifest

- Pinned `telota/corpus-coranicum-tei` at commit
  `57cb2b7be321ecfba100cb5f7988974f47864a14`; upstream README identifies the
  export as CC BY-SA 4.0 and names its TEI data collections.
- Generated a local SHA-256 manifest for 3,243 TEI repository files (excluding
  Git metadata), the three Nasser JSON
  files, the 78 Studies-folder files, and the Shamela CSV. The manifest is
  private under ignored `scratch/` because it contains local absolute paths and
  hashes for materials whose rights remain unresolved.
- Nasser export provenance, version, field-code documentation, and reuse terms
  remain unverified. Studies-file rights are not established per file.
  Shamela export provenance and reuse terms are not established. All three are
  quarantined from public output; no supplied private text was copied into the
  application.
- Corpus Coranicum manuscript image references are not covered by the TEI
  data license unless an image's own rights say so.
- Harvard's official project announcement documents EvQ's word/phrase-level
  variant display and attached annotations (transmitters, source, type, status,
  and audio). Its design reference separates a Reading View from advanced
  Variant and Principle views. This is recorded as a navigation pattern only;
  the project website was unavailable when checked, and Nasser export code
  meanings remain unmapped.

**Exit:** Complete for source registration and conservative rights handling.
The quarantined sources remain blocked from public ingestion pending evidence.

- Current-state re-audit against the private prior manifest found all three
  Nasser files and all 78 Studies-folder files present with unchanged sizes
  and SHA-256 hashes. The supplied Shamela category 5 CSV path is missing, so
  its historical inventory is not reproducible from the current workspace.
  A private report is at `scratch/quran/source-availability-audit-2026-09-27.json`;
  no alternate Shamela export was substituted.

## Phase 1 — Canonical schema and source adapters

- Added a versioned canonical schema covering source snapshots and files,
  source records, works/editions, passages and text editions, separate
  translations, reading authorities/routes, variants and source word records,
  manuscript witnesses/observations, attestations, reviewed crosswalks,
  concepts, relationships, normalization profiles, reproducible comparisons,
  and append-only review events.
- Added source manifest generation and local ingestion. Ingest refuses to
  proceed if a source file is added, removed, or has changed since its hash was
  recorded. Raw sources remain untouched. Private Nasser, Shamela, and Studies
  rows are staged with quarantine state in ignored scratch output.
- All 3,243 pinned repository files are inventoried; all 3,240 XML files under
  `data/` validate against the upstream Relax NG schema. The local build stages
  18,000 variant assertions, 6,236 Cairo Arabic lines, 6,236 transcription
  lines, and 18,822 translation lines across English, German, and French.
- The import retains 3,035 `msDesc` records across `quran_manuscripts` and
  `quran_intertexts`; 2,322 belong to the manuscript collection.
- All 18,000 exported variant records have an empty per-record source key.
  17,986 reader keys resolve by the documented mechanical alias; the others
  remain without a linked reader. 34,172 word entries have no native `n`
  locator. No source or locator is inferred for these records.
- Created 34,163 candidate alignments from variant `w/@n` values to Cairo TEI
  word IDs. They remain `candidate` pending human review; the original values
  are preserved, and nine nonempty locators remain unmatched.
- The independent verifier reports zero text/locator mismatches for all 18,000
  variants and 31,294 Cairo lines. SQLite integrity and foreign keys pass.
- Parsed inventories reconcile for the prior available snapshot: 6,236 verses,
  14,983 variants, and 27,914 annotations in Nasser; 65,960 Shamela rows
  across 151 book IDs; and 77 Studies files matched to 77 rename-manifest
  rows. The current build revalidated Nasser and Studies but intentionally
  staged zero Shamela rows because the exact CSV path is missing. The
  undocumented Nasser `list` values remain unmapped; restricted sources remain
  quarantined.
- Two independent ingests with the same manifest and parser produce
  byte-identical SQLite files (SHA-256
  `a4413df2338e46f51dc890d35e40461bf25eb4f2798675743020c0183010308c`).
- Reader labels come from the variant record's own `persName` text; authority
  display labels use the TEI `name[@type=display]` value. Long authority notes
  remain in the source payload instead of being misused as a label.

**Exit:** Complete for deterministic source ingestion and inventory
reconciliation. Semantic source review, unresolved attributions, and rights
clearance remain explicit gates before public use.

## Phase 2 — Integrity audit and source-linked vertical slice

- Built a 24-record, Corpus Coranicum-only pilot from the pinned export.
  Every displayed variant string links to the exact `allvariants.xml` record
  and source line; the page preserves the missing source-authority key instead
  of suggesting an underlying work citation exists.
- Each of the 44 pilot locator matches is marked candidate. The page displays
  the exact Cairo 1924 Arabic token and verse context, each linked to its TEI
  source line. This is contextual display, not a verified equivalence claim.
- The independent verifier now checks source reader and source authority
  labels against `reader.xml` and `sources.xml`: 870 reader authorities and 58
  source authorities have zero label mismatches. All 18,000 variant records,
  their 68,344 words, Cairo layers, and candidate locators also verify with
  zero mismatches.
- Re-extracted all TEI character data after an audit found outer XML tail
  whitespace could cause short word text to be truncated. Independent
  comparison now reports zero mismatches across 18,000 variant assertions,
  68,344 variant words, 31,294 Cairo text/translation lines, and 154,864 Cairo
  word tokens. SQLite integrity, foreign keys, duplicate locators, and all
  34,163 candidate locator transforms pass.
- Rebuilt the CC BY-SA-only local release (421,310,464 bytes; SHA-256
  `5162f345cc2c190501c7121dcb239504977a25f40dc6252b47ffb9141609f499`). It
  contains only the pinned Corpus Coranicum snapshot. The 24-record JSON pilot
  is 87,257 bytes (SHA-256
  `5273acfbdf695c4d021eef68291a4ef6331218aec7e81e99e1a223e2d2329cef`);
  restricted local sources and manuscript images are absent.
- `npm run check`, `npm run test:design`, and `npm run build` pass against the
  regenerated JSON and final pilot pages. The design audit reports its existing
  warnings in unrelated article and Hadith UI files.

**Exit:** Source extraction, exact record navigation, and candidate labeling
are verified for the bounded pilot. The source export itself has no per-record
source citations; scholarly source review and reader-equivalence review remain
open and are disclosed in the UI.

## Phase 3 — Reader and source navigation (in progress)

- Added a pilot Read & Compare page with a passage selector for the distinct
  Cairo verse IDs referenced by the 24 pilot records. It shows the separately
  identified Cairo 1924 Arabic passage, source-native variant text, exact TEI
  line links, and candidate state; selecting a passage updates the shareable
  `?verse=` URL.
- Added a Methods & Data page documenting coverage, extraction behavior,
  source gaps, and reuse attribution. The Quran landing page links to Read &
  Compare, Variant Index, manuscript catalogue, analyses, and Methods & Data.
- Added deep links from each candidate alignment to its passage view, from
  each passage record back to its Variant Index anchor, and from variant
  reader keys to the source authority record through the documented alias.
- Local browser review confirmed the passage selector works from the keyboard,
  the selected verse is written to the shareable `?verse=` URL, and loading
  that URL restores the selected passage and matching source records. The
  Variant Index disclosure is keyboard operable. Read & Compare now links each
  displayed Cairo token to its exact TEI token line as well as linking the
  verse context. A single-record case was checked in the browser; its live
  status correctly says “has.”
- Added mobile wrapping and print styles; print opens source-detail panels and
  restores their previous state afterward. Automated project checks pass.
- The reader is bounded to the 24-record pilot. Real screen-reader/device
  review and visual print/responsive review remain open; browser accessibility
  tree and keyboard checks do not substitute for those reviews. The full
  read-to-evidence-to-return flow still needs a focused manual pass before
  Phase 3 can exit.
- A browser journey check followed verse `020:040` from Read & Compare to
  `variant_100`, expanded its unreviewed locator candidate, then followed the
  passage link back. The `?verse=verse-020-040` selection and exact verse text
  were restored. The candidate and its non-equivalence disclosure remained
  visible in the Variant Index. This closes that navigation check only; it
  does not close the human screen-reader/device/print review.
- Responsive browser checks at 320 px and 390 px report no horizontal overflow
  on all six Quran routes. This verifies viewport width only, not screen-reader
  output or visual quality on physical devices.

### Complete Cairo source reader — 2026-09-27

- Replaced the candidate-only reading surface with the complete pinned Cairo
  1924 `arabic_text` layer: all 6,236 source verses across 114 surahs and all
  77,432 direct source word tokens. Records are loaded by surah shard. The
  default HTML selection has exact Arabic text and source links before client
  interaction; passage selection can deep-link every source verse.
- Each verse record separately retains the containing `<lg>` verse-group
  locator/URL and the `<l>` text locator/URL. Every displayed word links to its
  own source `<w>` token. Candidate variant records continue to appear only
  where the source index has links and are labeled candidate; no linked record
  is not presented as proof of no variants.
- Added the source-faithful builder and independent verifier. The verifier
  reconstructed all 6,236 verse IDs, exact text, source attributes and paths,
  lines, URLs, plus all 77,432 token IDs/text/attributes/paths/lines/URLs:
  zero errors. A second crosswalk checked all 3,492 candidate verse texts and
  34,163 token links against this full source package: zero errors and zero
  candidate rows missing a target URL.
- Published immutable local release `v0.5.3-cc-57cb2b7be321`; the static
  release verifier checked all 360 assets and reported zero errors. No external
  storage destination has been supplied.
- Production-preview browser checks restored the deep link for
  `verse-020-040`, showed its exact Cairo text and 34 source token links, and
  kept the containing verse-group and text-line citations distinct. Eight
  source-index records were labeled as candidates. A check of `verse-002-005`
  showed its full source text with no candidate records and the explicit note
  that this absence does not establish absence of readings.
- `npm run check`: pass, 178 files, zero errors/warnings/hints.
- `npm run test:design`: pass, 211 files; its warnings remain in unrelated
  article and Hadith UI files.
- `npm run build`: pass; Astro completed and Pagefind indexed 258 pages and
  29,786 words. Release v0.5.3 contains 360 checked assets totaling
  247,350,414 uncompressed bytes; Cairo verse data loads one surah shard at a
  time. Full screen-reader, physical-device, and visual print review remain
  open, as does external-host performance testing.

## Phase 4 — Corpus expansion and manuscript library (in progress)

- The complete pinned Corpus Coranicum TEI variant, Cairo text, authority, and
  manuscript records are represented in the local CC-only release. Manuscript
  descriptions retain their exact TEI payload and file/ID locator; no images
  were copied.
- Added a browser-searchable catalogue index for all 2,322 `msDesc` records in
  the pinned manuscript collection. It exposes seven explicitly mapped TEI
  field paths, preserves exact text and attributes, and links every field to
  its XML line and XPath. An independent verifier compared 14,487 field
  elements to the pinned source with zero mismatches. The JSON index is
  10,775,365 bytes (SHA-256
  `0aa3fc98ee5e3728d691567b6734b957f0d24125c77e1e059f62d57decc214cc`).
- None of those `msDesc` records has a native `xml:id`; the catalogue leaves
  the native ID null and keeps a within-file ordinal plus line locator. It
  labels values as catalogue statements and does not claim image observation.
- Nasser, Shamela, and Studies inputs remain accounted for in local staging
  but quarantined. Their provenance or rights are unresolved; Nasser field
  meanings and detailed mappings beyond the seven indexed fields remain open.
  No restricted text is in the public app.
- Licensed book/study search, broader manuscript metadata mapping, and
  deployed performance review are still outstanding.

## Phase 5 — Research graph and reproducible analyses (in progress)

- The canonical schema includes typed relationships, concept mappings,
  normalization profiles, comparison runs/results, and append-only review
  events. The active Corpus Coranicum graph package includes explicit
  reader-authority links, source-reported commentary references, and candidate
  word-locator links; there are still no human-reviewed cross-source joins.
- Added a reproducible analysis that groups all 18,000 variant records by
  their exact reader key, preserves the 14-record missing-key group, and
  lists all member IDs and source lines. The output has 540 groups; 539 link
  to reader authorities through the documented alias. A separate verifier
  recomputed all 18,000 memberships and the analysis result hash with zero
  errors. Counts are described as source-record counts, not historical
  frequencies.
- The 945,858-byte result JSON has SHA-256
  `e55587479285f24a7107f1692e11d1e291cb8ddaae695eab07661ffd58fad8dc` and
  deterministic result hash
  `7d350be38deaef111e13663b5db3fa98ed97996ef17c78f61e67941f582d27e6`.
- Do not infer relationships from matching strings. Graph views and
  cross-source analyses remain incomplete until source citations and
  human-reviewed mappings are available.

## Phase 6 — Versioned public release (local artifact ready; publication blocked)

- Built a CC-only SQLite release with a local manifest, source hashes, counts,
  integrity result, and foreign-key result. The app includes a 24-record
  variant preview, 2,322-record source-anchored manuscript index, and
  reproducible reader-key analysis; the 421 MB database remains in ignored
  local scratch.
- Prepared immutable static assets under
  `/data/quran/releases/v0.1.0-cc-57cb2b7be321/` with a checksummed release
  manifest. Each asset path and SHA-256 is recorded; the small root manifest
  points to this release. Re-running the same release ID produces identical
  bytes and refuses conflicting content.
- The static-release verifier checks the root pointer, manifest hash, all
  three JSON asset hashes and sizes, source/license metadata, alias pointers,
  and coverage totals; it passes with no errors.
- No Quran release target or credentials were supplied. Per the explicit
  no-inference constraint, no R2 bucket, object prefix, or public URL is
  assumed. The full SQLite artifact publication and browser range-request
  test remain pending that destination. The site asset release is a compact
  JSON layer, not the complete SQLite corpus.

## Current validation — 2026-09-27

- `npm run check`: pass, 167 files, zero errors, warnings, or hints.
- `npm run test:design`: pass, 200 source files checked. Reported warnings are
  in existing article and Hadith UI files outside the Quran module.
- `npm run build`: pass; Astro prerendered the Quran routes and Pagefind
  indexed 253 pages.
- The initial check found three typing issues in print-state handling and a
  missing declared alignment field. These were corrected, then the full check
  and build passed.
- Browser review verified keyboard selection, URL restoration, reader count
  status, candidate disclosure, and direct source-line links for the token
  evidence. The Read & Compare locator now includes both its source-native
  value and its corresponding Cairo TEI token source URL.
- Phase 3 still needs screen-reader, device, and visual print review. Phase 4
  still needs rights resolution for quarantined sources and deployed
  performance review. Phase 5 still needs reviewed cross-source mappings.
  Phase 6 still needs an explicitly supplied release destination and range
  request verification.

## Full variant browser and reverse passage index — 2026-09-27

- Built the full source-native variant browser package: 18,000 catalog records,
  68,344 word entries, 34,163 candidate word links, and 24 immutable detail
  shards. Every catalog record and word was compared to the pinned source
  index; the independent verifier reports zero errors.
- Added the global candidate passage index for all 3,492 distinct Cairo verse
  IDs. Its 34,163 candidate word entries retain both source word strings,
  source locators, and source-line URLs. Independent reconstruction from the
  audited full index matches the published passage index exactly.
- Read & Compare now covers every passage represented by a candidate locator.
  A `variant_9998` deep link was followed to `020-069`; the reader restored that
  verse and displayed 43 source variant records, exact Cairo context, and
  individual Cairo token source lines. The selector has a text filter for its
  3,492 passage IDs.
- Published local immutable site assets as
  `v0.2.1-cc-57cb2b7be321`. The release verifier checked hashes, sizes,
  provenance/license metadata, all catalog and shard identities, passage
  references, and all 34,163 candidate word entries; zero errors. No external
  storage target or credentials were supplied, so this is not an external
  deployment.
- `npm run check`: pass, 168 files, zero errors/warnings/hints.
- `npm run test:design`: pass, 201 files; existing unrelated article and
  Hadith UI warnings remain.
- `npm run build`: pass; Astro built 253 routes and Pagefind indexed 253 pages.
- Physical-device, screen-reader, visual print, and deployed performance
  reviews remain open. Rights and source documentation gaps for Nasser,
  Shamela, and Studies remain open.

## Source-anchored relationship graph — 2026-09-27

- Audited the pinned commentary TEI before mapping it. It contains 15,977
  `ref[@type="koran"]` entries and 5,146 distinct native target strings.
  Every target matches the source's declared reference syntax, but ranges and
  surah-level targets are deliberately left unexpanded and unconverted.
- Built a 68,126-edge relationship package: 17,986 explicit reader-key to
  reader-authority links, 34,163 unreviewed variant-word/Cairo-token locator
  candidates, and 15,977 source-reported commentary references. Each edge
  preserves its exact source locator and source-line URL; commentary entries
  also preserve the exact reference text, TEI type/target, and source file hash.
- Added an independent graph verifier. It rebuilds expected edges from the
  audited full variant index and pinned commentary XML, then checks each
  sharded payload, hash, state, count, key mapping, and exact source value.
  Result: 68,126 edges checked; zero errors.
- Added a searchable Relationship Index page with type-specific loading,
  source links, pagination, and explicit source-reported/candidate states. Its
  non-JavaScript view still exposes a source-linked preview and the complete
  graph manifest.
- Published immutable site release `v0.3.1-cc-57cb2b7be321`; the static
  release verifier checks all graph shard hashes and coverage totals. The
  active root pointer resolves to this release. It remains a local bundle,
  not an external deployment.
- Full commentary body indexing, concordance segments, intertext metadata,
  target-range resolution, reviewed graph edges, and joined analyses remain
  incomplete. Rights/provenance gates still quarantine Nasser, Shamela, and
  Studies.
- Browser verification exercised candidate and commentary filters. This caught
  and fixed a relative-URL base error; the candidate search returned 19 matching
  records and the commentary view loaded its first 20 exact source references.
- `verify-quran-research-graph.py`: pass, 68,126 edges reconstructed, zero
  errors. `verify-full-variant-browser-package.py`: pass, 18,000 records,
  68,344 words, 34,163 candidate words, 3,492 passages, zero errors.
- `verify-static-release.py`: pass for `v0.3.1-cc-57cb2b7be321`, all asset
  hashes and coverage checks valid, zero errors.
- `npm run check`: pass, 170 files, zero errors/warnings/hints.
- `npm run test:design`: pass, 203 source files; existing unrelated warnings
  remain in article and Hadith UI files.
- `npm run build`: pass; Astro built successfully and Pagefind indexed 254
  pages.
- Phase 4 collection indexing and Phase 5 reviewed joins remain open as listed
  above. Phase 6 external release and device/accessibility/performance review
  remain open; no deployment destination was supplied.

## Corpus Coranicum commentary and intertext catalogues — 2026-09-27

- Added a source-anchored commentary text index for 37,358 selected nonempty
  TEI blocks across all 85 commentary XML files. It preserves extracted text,
  attributes, source file hash, XPath, line, and source URL. The builder and
  independent verifier account for all 91,647 nonempty body elements,
  including 54,289 outside the declared indexed element scope and 2,696
  whitespace-only selections. These exclusions remain explicit.
- Added a searchable browser that loads commentary one source file at a time,
  searches literal case-sensitive text, and links each block back to the
  source XML line.
- Added a source-description index for all 713 `quran_intertexts` TEI records
  and 9,452 selected field elements. Native IDs, source values, attributes,
  file hashes, field XPaths, and line URLs are retained. The sibling
  `categories.xml` is counted but not indexed; categories and Quran-reference
  targets are not interpreted as established historical relationships.
- Added the searchable intertext catalogue page with source-native record IDs,
  exact field locators, source links, literal search, and paginated display.
  Browser search for “Jesaja” returned 47 records.
- Published immutable local release `v0.4.1-cc-57cb2b7be321`, including the
  commentary shards and intertext catalogue. Commentary, intertext, and full
  release verifiers pass with zero errors. No external release destination
  was supplied.
- `npm run check`: pass, 174 files, zero errors/warnings/hints.
- `npm run test:design`: pass, 207 source files; existing unrelated article
  and Hadith UI warnings remain.
- Physical-device, screen-reader, visual print, deployed performance,
  commentary concordance, `categories.xml` taxonomy, reviewed cross-source
  joins, and restricted-source rights review remain open.

## Corpus Coranicum intertext taxonomy — 2026-09-27

- Added a source-anchored index for all 122 category nodes in
  `quran_intertexts/categories.xml`, including the 16 source top-level nodes,
  native IDs, exact descriptions and attributes, source line/XPath, and pinned
  file hash. Parentage and sibling order follow the XML hierarchy literally.
- Audited all 713 intertext TEI records: there are no explicit `catRef`
  elements. The category browser therefore exposes the source taxonomy without
  assigning any intertext record to a category.
- Added a source-order taxonomy browser with literal search and visible source
  locators. Browser verification found “Genesis” in one source category and
  showed its source ancestors; no derived category or record links are added.
- Published immutable local release `v0.4.2-cc-57cb2b7be321` with the taxonomy
  JSON and source coverage metadata. The independent taxonomy verifier
  reconstructed all 122 categories and reported zero errors; the static release
  verifier also passed with zero errors.
- `npm run check`: pass, 176 files, zero errors/warnings/hints.
- `npm run test:design`: pass, 209 source files; existing unrelated article
  and Hadith UI warnings remain.
- `npm run build`: pass; Astro completed and Pagefind indexed 257 pages and
  33,168 words.
- Concordance segments, commentary concordance, reviewed cross-source joins,
  restricted-source rights review, and external deployment remain open.

## Corpus Coranicum concordance browser — 2026-09-27

- Audited all 114 files in `data/quran_concordance`: 91,285 source `<w>`
  elements and 3,833,970 `<seg>` values. Every word record has the same 42
  ordered `seg/@type` values. Each source row remains distinct, including
  repeated passage/word positions with different `analysis_number` values.
- Built one compact JSON shard per source file. Each shard retains the exact
  42 field values in a parallel array whose positions are bound to the exact
  source-native type order in the release catalog, plus word attributes,
  source order, source file hash, XPath, line, and line URL. Empty fields are
  preserved. Each source title used in the file selector also retains its own
  exact title XPath, line, and line URL. The builder rejects unexpected
  element attributes or schema shape instead of silently discarding them.
- Added a selected-file concordance browser with literal case-sensitive search,
  source-field comparisons, an expandable view of all 42 fields, pagination,
  and exact TEI source links. It labels each output as a source `<w>` record
  and does not merge rows into inferred words or interpret the analysis codes.
- The independent verifier reconstructed all rows from the pinned TEI and
  compared every field value, field type/order, attribute, locator, line, URL,
  source hash, and aggregate count. Result: 114 files, 91,285 records,
  3,833,970 fields, 42 field types, zero errors. Largest shard: 4.55 MB.
- Published immutable release `v0.5.1-cc-57cb2b7be321` with all previously
  verified datasets plus the concordance catalog and 114 shards. The static
  release verifier checks all asset hashes and concordance coverage; it passed
  with zero errors.
- Browser verification loaded Surah 1, showed source locators and empty source
  fields, expanded the 42-field disclosure, and searched exact `llāhi`, which
  returned two source records with their source text unchanged.
- A production preview confirmed the file-selector title link points to the
  pinned TEI title line and the two search results retain their source-line
  links.
- `npm run check`: pass, 178 files, zero errors/warnings/hints.
- `npm run test:design`: pass, 211 source files; existing unrelated article
  and Hadith UI warnings remain.
- `npm run build`: pass; Astro completed and Pagefind indexed 258 pages and
  33,184 words. The active v0.5.1 release contains 245 checked assets
  (203,686,256 bytes total); the concordance package accounts for 57,818,415
  bytes. Per-surah lazy loading limits the browser request to one shard.
- Remaining collection work: document concordance code meanings from an authoritative
  source, and review cleared ingestion for the quarantined Nasser, Shamela,
  and Studies files. External deployment and device/assistive-technology
  review remain open. Hosting capacity and performance for the full 203.7 MB
  active release must be measured on the eventual data host.

## Corpus Coranicum commentary element index — 2026-09-27

- Expanded the commentary package from 37,358 selected text blocks to also
  preserve every one of the 94,443 element nodes below `text/body` across the
  85 pinned TEI files. Each element retains exact descendant character data,
  including empty and whitespace-only values, plus its element name/native ID,
  direct `xml:lang`, all attributes, XPath, line, file hash, and source URL.
  The existing 37,358 non-empty block records remain a separate search scope.
- Added a client filter for source-file scope and TEI element name. The all
  element view labels each source node and explicitly explains that ancestor
  and descendant elements can repeat text; it never merges records.
- Independent source reconstruction checked every element record and each
  text-block record: 94,443 elements, 37,358 blocks, 30,398,779 exact element
  text bytes, zero errors. Largest combined per-file shard: 4.51 MB.
- Published immutable `v0.5.4-cc-57cb2b7be321`, preserving prior releases.
  Static release verification checked all 360 assets and reported zero errors.
  The TEI header is not part of this commentary body-element index; that limit
  is recorded in G-010. External hosting and performance verification remain
  blocked on a supplied Quran data destination.

## Static release provenance and commentary browser — 2026-09-27

- The commentary browser now offers two explicit scopes: selected non-empty
  text blocks and every element under TEI `text/body`. Users can filter by
  source file and element name; each result retains its source link, XPath,
  line, and element label. A filter check on the pinned first-surah TEI file
  returned its seven `<lem>` nodes with the matching source locators.
- Published immutable `v0.5.5-cc-57cb2b7be321`; it preserves v0.5.4 and records
  schema version 1, the prior manifest hash, 25 Quran pipeline-script hashes,
  working-tree/base-commit status, and a hashed release note. The tree was
  dirty, so `buildCommit` is null. The independent verifier checked all 360
  release assets and reported zero errors.
- Release notes document included data, attribution, limitations, and the
  uncommitted-build caveat. Source-data scope remains Corpus Coranicum only;
  Nasser, Shamela, and Studies remain quarantined pending provenance and rights
  clearance.
- Validation: `npm run check` reports zero errors, warnings, or hints;
  `npm run test:design` passes for 211 source files with nine existing design
  warnings in unrelated article/Hadith files; `npm run build` indexes 258 pages
  and 29,786 words. Production preview checks confirmed the commentary filter
  returns seven `<lem>` nodes for the selected TEI file with exact source
  locators, and the Quran deep link `verse-020-040` loads its matching Arabic
  verse and eight candidate source records after client hydration.

## Corpus Coranicum commentary header index — 2026-09-27

- Closed the known commentary header-index gap for the pinned release. The
  package now retains all 850 elements inside `teiHeader` across all 85 files,
  including exact descendant text, native ID, direct language, every
  attribute, XPath, source line, and commit-pinned URL. The prior 94,443 body
  elements and 37,358 selected text blocks remain distinct and unchanged.
- Added a separate header search scope and an explicit “include empty and
  whitespace-only” option so interface defaults do not hide source nodes.
  Header and body name counts remain source-derived; nested strings stay
  separate rather than being deduplicated.
- Independent reconstruction compared the complete header records and
  rechecked every existing body element and text-block record: 850 headers,
  94,443 body elements, 37,358 blocks, zero errors. The repeated header
  descendant text accounts for 67,947 UTF-8 bytes in the element records.
- Published immutable `v0.5.6-cc-57cb2b7be321`, linking to v0.5.5 and carrying
  the enlarged commentary shards. Static release verification checked all
  360 assets with zero errors. Nasser, Shamela, and Studies stay quarantined;
  TEI root/text wrapper elements, unclear concordance codes, manual review,
  and external hosting remain open.

## Corpus Coranicum complete manuscript TEI elements — 2026-09-27

- Expanded the manuscript package beyond its selected catalogue fields. Every
  `msDesc` root and descendant is now indexed with exact descendant text,
  native ID, direct language, all attributes, XPath, line, source URL, and
  source-file hash. The selected-field catalogue remains separately
  searchable and unchanged in meaning.
- Built 93 shards, grouped at 25 manuscript records each. The largest shard is
  11.13 MB. The manuscript page loads a shard only when a reader opens a
  record's full-element view; it checks byte size and SHA-256 before display,
  then filters source elements literally and renders 50 at a time.
- Independent source reconstruction checked all 2,322 manuscript records,
  14,487 selected field values, and 192,295 source elements: zero mismatches.
  The release verifier checked all 453 assets in immutable release
  `v0.5.7-cc-57cb2b7be321` and reported zero errors.
- Remaining limits: these are catalogue TEI statements rather than direct
  manuscript observations; images remain excluded pending image-rights review.
  Nasser, Shamela, and Studies remain quarantined. Human review, full-source
  wrappers outside `msDesc`, and external deployment/range-performance review
  remain open.

## Final v0.5.7 implementation validation — 2026-09-27

- The active Quran pages all reference immutable release
  `v0.5.7-cc-57cb2b7be321`; no page references v0.4.2 or v0.5.6.
- Independent static release verification passed for 453 assets with zero
  errors. The release manifest SHA-256 is
  `e8632346d147ce0b98c0e7748f238544adcea40f635025b5d2534ff6747d97d8`.
- Production preview inspection loaded manuscript record
  `manuscript-00170.xml` and verified its 4,394 source elements, exact
  attributes/text, source locations, and first 50 results with pagination.
  Commentary header and empty-element controls were also checked in preview.
- `npm run check`: pass, 178 files, zero errors, warnings, or hints.
- `npm run test:design`: pass, 211 files. Eight pre-existing warnings remain
  in unrelated article/Hadith files.
- `npm run build`: pass; Astro generated the site and Pagefind indexed 258
  pages and 29,790 words.
- The broader Quran data goal is still in progress. Nasser, Shamela, and Studies
  remain quarantined until source provenance and reuse rights are established.
  Concordance code meanings, human review, TEI wrappers outside indexed scopes,
  and external hosting/device/accessibility/performance checks remain open.

## Phase 3 reader-key round-trip correction — 2026-09-27

- Browser review caught a real initialization defect: the `reader` query
  parameter was preserved in links, but the passage selector defaulted to “All
  reader keys” on return navigation. The page now validates the key against
  the loaded source-native catalog and applies it before the first render.
- Rechecked `verse-020-040` filtered to `variantreader_193`: one source record
  remains (`variant_100`), selected source label/key is visible, and its
  unreviewed locator candidate remains explicitly marked as a candidate.
- Opened the same record in Variant Index, expanded its candidate, and followed
  the Read & Compare link back. The URL retained both `verse-020-040` and
  `variantreader_193`; the passage selector restored the same verse and reader
  key, and the view returned to one source record.
- `npm run check` passes after the correction with 178 files and no diagnostics.
  Design and production build checks are recorded in the 2026-09-28 validation entry below.

## Reader-key filter validation — 2026-09-28

- `npm run check`: pass, 178 files, zero errors, warnings, or hints.
- `npm run test:design`: pass, 211 source files. The same eight warnings remain
  in unrelated article and Hadith UI files.
- `npm run build`: pass; Astro completed, and Pagefind indexed 258 pages and
  30,852 words.
- Re-ran `python scripts/quran/verify-static-release.py` against the active
  immutable v0.5.7 release. All 453 asset hashes and sizes, provenance,
  licensing metadata, coverage, and source aliases verified with zero errors;
  manifest SHA-256 remains
  `e8632346d147ce0b98c0e7748f238544adcea40f635025b5d2534ff6747d97d8`.
- The browser-verified reader-key return journey is recorded above. Phase 3
  still needs screen-reader, physical-device, and visual print/responsive review.
  Phase 4 rights/source blockers, Phase 5 interpretation/review gaps, and
  Phase 6 the user-supplied hosting destination and range-request check remain
  open. The fixed UI does not change the immutable data release.


## Research graph source reconstruction — 2026-09-28

- Reconstructed the active graph from the pinned TEI snapshot, the complete
  18,000-record candidate index, and the latest local Corpus Coranicum SQLite
  release. The independent verifier checked 68,126 edges: 17,986 explicit
  reader-authority relations, 34,163 candidate locator matches, and 15,977
  commentary Quran references across 5,146 exact target strings; zero errors.
- The first audit attempt used the compact Variant Index search catalog, which
  intentionally omits word-level candidate details. It failed its candidate
  totals as expected for that incomplete verifier input; rerunning with the
  complete source-linked variant snapshot passed. No release data was changed.
- Phase 5 remains in progress: source-stated and mechanically matched edges
  are distinguished correctly, but Nasser/Shamela/Studies mappings and
  human-reviewed cross-source joins are unavailable or rights-blocked.

## Active release source-parity audit — 2026-09-28

Independent verifiers rebuilt the current static data packages from the pinned
Corpus Coranicum TEI snapshot and local release database. Every verifier below
reported zero errors:

- Variant package: 18,000 records, 68,344 words, 34,163 candidate words, and
  3,492 candidate passages; full catalog and detail shards match the complete
  source-linked variant index.
- Cairo Arabic: all 6,236 verse records and 77,432 source word tokens across
  114 surahs match their TEI records and locators.
- Commentary: 37,358 indexed text blocks, 94,443 body elements, and 850 header
  elements match exact source text, attributes, and locators.
- Concordance: 91,285 source word records and 3,833,970 field values across
  114 files and 42 field types match source order and values.
- Manuscripts: 2,322 `msDesc` records, 14,487 indexed field values, and 192,295
  full-tree source elements match; all 2,322 records correctly retain a null
  native ID because the source has none.
- Intertexts: 713 source descriptions and 9,452 field values match; their
  separate 122-node category taxonomy matches, and no unsupported record to
  category assignments are added.

These checks prove extraction parity for this pinned Corpus Coranicum release;
they do not verify the historical claims made by source records. Nasser,
Shamela, and Studies remain quarantined, and cross-source human review,
assistive-technology/physical-device review, and hosted range-query checks are
still open.

## Current source-input and design-reference audit — 2026-09-28

- Rechecked the local acquisition manifest against the supplied Nasser and
  Studies directories. All three Nasser JSON files and all 78 Studies-folder
  files are present and match their recorded SHA-256 values; the local staged
  report reconciles 27,914 annotations, 14,983 variants, 6,236 verses, and 77
  documents against 77 rename-manifest rows. The two identical-file groups
  remain explicit duplicate candidates; no document text was copied into the
  app.
- The exact supplied Shamela CSV path and its historically manifested file are
  both absent. The earlier 65,960-row audit therefore remains historical and
  cannot be refreshed from current input. No substitute file was searched for
  or used.
- Rechecked the supplied EVQ and Qiraat Explorer repositories. Recorded their
  view separation and citation/navigation patterns as design references only.
  Qiraat Explorer's README labels its eight-verse/53-reading set as a curated
  sample with zero readings yet scholarly-confirmed; neither repository's
  sample content is imported as source data.
- Nasser provenance, status/standard meanings, and reuse terms; per-file
  Studies origins and rights; and Shamela provenance and rights remain open.
  These datasets stay quarantined from public builds.

## Active local staging verification and optional-source handling — 2026-09-28

- A fresh run of `verify-local-staging.py` against the old default
  `scratch/quran/staging/quran-staging.sqlite` failed extraction parity:
  18,000 variant assertions, 870 reader-authority labels, 1 source-authority
  label, 31,294 Cairo lines, and 12,472 Cairo word tokens disagreed with the
  pinned TEI. Database integrity and foreign keys still passed. This stale
  artifact is not a trustworthy current staging result.
- Reran the same verifier against the later corrected snapshot at
  `scratch/quran/staging-corrected2/quran-staging.sqlite`. It passed with zero
  mismatches across 18,000 variants, 68,344 variant words, 870 reader
  authorities, 58 source authorities, 31,294 Cairo text/translation lines,
  and 154,864 Cairo tokens; all 34,163 candidate links were valid, SQLite
  integrity passed, and there were no foreign-key errors.
- Updated the pipeline so the exact supplied Shamela path may be recorded as
  missing without preventing a fresh TEI/Nasser/Studies-only staging build.
  A present source still requires a complete hash-matched inventory; absent
  Shamela is explicitly reported with zero staged rows. The old private
  acquisition manifest and staging databases were left untouched.
- Phase 1's original deterministic run remains valid for its recorded
  snapshot, but the former default staging directory is now explicitly
  superseded by the corrected snapshot and must not be treated as verified.
- Built a fresh present-sources-only release from the exact supplied paths.
  The new manifest has 3,243 TEI files, 3 Nasser JSON files, and 78 Studies
  files, all hash-pinned; it records Shamela as `missing` with zero files.
  The resulting staging database passes the independent verifier with zero
  variant, word, reader/source authority, Cairo line/token, and candidate
  mismatches; all 3,240 TEI XML files validate, SQLite integrity is `ok`, and
  there are no foreign-key errors.
- Repeated the full staging build from the same manifest. Both 532,721,664-byte
  SQLite outputs have SHA-256
  `c80cb74c4c427a551c74982c6306d2390ad4b50fc9c48def742364377c546001`.
  Nasser (49,136 staged source/container records) and Studies (154 staged
  file/manifest records) remain quarantined; the missing Shamela source adds
  no rows. The new source manifest and databases remain in ignored `scratch/`.
- Also exercised the distinct `not_supplied` state with `--shamela` omitted.
  It records zero Shamela rows and passes the same independent source verifier
  with zero parity/locator/authority errors and valid SQLite integrity.
- Required repository checks pass: `npm run check` (178 files, zero
  diagnostics), `npm run test:design` (211 files; eight existing warnings in
  unrelated articles/Hadith UI), and `npm run build` (258 indexed pages,
  30,852 words).

## Active static release provenance refresh — 2026-09-28

- The static-release verifier caught that the active v0.5.7 manifest recorded
  the pre-change ingestion script hash. Prepared immutable release
  `v0.5.8-cc-57cb2b7be321` from the same pinned and independently verified
  Corpus Coranicum packages, then moved every active Quran page and client
  loader to that release ID.
- The new root pointer references manifest SHA-256
  `54e47f8fc8817f56b21bc512b033614feba921bd7c0bd031bdf6a7ddb7706291`. The
  verifier passes all 453 assets with zero errors. All 453 asset content hashes
  are identical to v0.5.7; only the release/provenance wrapper changed. The
  refresh does not add Nasser, Shamela, Studies, raw PDFs, or image files to the
  public release.
- The full SQLite file still needs a user-supplied destination and access for
  upload plus byte-range testing. That Phase 6 external-publication gate stays
  open.
- After repointing the Quran pages and client loaders, `npm run check` passes
  with zero diagnostics, `npm run test:design` passes with the same eight
  unrelated existing warnings, and `npm run build` completes with 258 indexed
  pages and 30,852 words. A final static-release verification passes all 453
  assets with zero errors.

## Phase 3 keyboard navigation check — 2026-09-28

- Added `tabindex="-1"` to the shared main landmark so the existing skip link
  can move keyboard focus to its target. Added an inset gold focus marker that
  remains visible across the full main content region.
- Verified in the live Quran reader with keyboard Tab and Enter: the skip link
  sets `#main-content`, focus lands on the main landmark, and the selected
  Cairo verse (`verse-020-040`) and source reader key (`variantreader_193`)
  remain selected after a reload and skip-link activation.
- In-app browser capture confirms the focus marker is visible. This was a
  desktop Chromium check; mobile-width behavior and testing with assistive
  technology remain open Phase 3 checks.

## Source-exact TEI reference graph and v0.5.9 release — 2026-09-28

- Reconstructed all 30,940 `<ref>` elements across the 3,240 pinned TEI XML
  files. Of these, 15,977 `type="koran"` commentary references already have
  the specialized graph edge; 14,959 other explicit references now have
  source-exact graph records; four without `target` remain in a separate
  missing-target inventory. No target was normalized, semantically resolved,
  or merged.
- Each new reference record preserves exact native ID, type, visible text,
  target, complete attributes, file hash, collection path, file ordinal, and
  source line. The browser presents the raw target and only creates an
  external link when the exact target itself is an HTTP(S) URL.
- The expanded graph has 83,085 edges across four types and 16 shards. Its
  independent verifier reconstructed the pinned inputs with zero errors.
  Existing source staging independently remains verified: 18,000 variants,
  68,344 variant words, 870 reader authorities, 58 source authorities,
  31,294 Cairo lines, 154,864 Cairo tokens, 34,163 candidate links, zero
  mismatches, valid SQLite integrity, and no foreign-key errors.
- Published immutable release `v0.5.9-cc-57cb2b7be321` and moved the Quran
  pages/loaders and public pointer to it. The release manifest SHA-256 is
  `7b294f580d8e69c0aae51a6e9ad21e010b5628fa376e607060f83119249400ed`.
  The independent static-release verifier checked all 453 assets with zero
  errors. The prior v0.5.8 release remains intact.
- Browser review confirmed the relationship page's new reference type and
  count, search results, TEI source links, raw target, exact visible text,
  attributes, and source line. No target URI was followed. Full physical
  device, screen-reader, and print checks remain open; quarantined-source
  rights/provenance questions and SQLite hosting/range testing also remain
  open as recorded above.
- Final repository checks: `npm run check` passes with 178 files and zero
  diagnostics; `npm run test:design` passes for 211 files with the same eight
  pre-existing warnings in unrelated article/Hadith UI; `npm run build`
  completes and Pagefind indexes 258 pages and 30,853 words.

## Full TEI link-construct inventory and v0.5.10 release — 2026-09-28

- Strictly parsed all 3,240 XML files under the pinned `data/` tree and
  inventoried all TEI relationship constructs: 30,940 `<ref>` elements, no
  `<ptr>`, `<relation>`, `<link>`, `<linkGrp>`, `<listRelation>`, `<join>`, or
  `<joinGrp>`, and four `<anchor>` markers. The four anchors have empty text;
  no edge is inferred from them.
- Added those construct counts to the graph manifest and independent
  verifier. The verifier also pins the audited expected counts so a future
  source change cannot silently introduce an unhandled relationship form.
  Reconstructed all 83,085 graph edges with zero errors.
- Published `v0.5.10-cc-57cb2b7be321`, with the expanded graph manifest and
  the complete site pointer moved to the new immutable release. Its manifest
  SHA-256 is `9b01f410326023aafa0df1b71ac550b5e9b8421f4abe9e30eb743fed472b29db`;
  independent verification passes all 457 assets with zero errors. Release
  v0.5.9 remains intact.

## Exact TEI XML inventory enforcement and v0.5.11 release — 2026-09-28

- Hardened both the graph builder and independent verifier to compare the
  visited XML path set against the pinned SQLite source-artifact inventory.
  They now require exactly 3,240 files and fail on missing, added, or
  unregistered XML paths before validating edge contents.
- Rebuilt and independently verified all 83,085 graph edges; the verifier
  reports zero errors and confirms the 3,240-file set and audited link
  construct counts.
- Published immutable `v0.5.11-cc-57cb2b7be321`; the root Quran manifest and
  application references now point to it. The static-release verifier passes
  all 457 assets with zero errors; the release manifest SHA-256 is
  `f59fd2e7d97cc1c2c648cbf9e3bbe13b3f5d1601e2c4416da78629c1e3f740c9`.
  v0.5.10 and all earlier releases remain preserved.
- Runtime review on the active relationship page confirmed the new release
  loads the 14,959-record explicit-reference type, retains search state,
  reports 1,624 Zotero matches, and displays exact text, target, and TEI line
  links. The external target was not followed.
- Final repository checks after the inventory-enforcement change pass:
  `npm run check` (178 files, zero diagnostics), `npm run test:design` (211
  files, the same eight warnings in unrelated article/Hadith UI), and
  `npm run build` (258 Pagefind pages, 30,853 words).

## Source-exact commentary range candidates and v0.5.12 release — 2026-09-28

- Audited all 15,977 exact `ref[@type="koran"]` targets against the Cairo
  source's 6,236 native verse-group IDs. The strict, untrimmed syntax
  `koran-SSS:VVV-SSS:VVV` yields 13,719 two-endpoint candidates whose IDs both
  exist. The other 2,258 remain unlinked: 2,224 have a zero endpoint, 18 cross
  surah boundaries, seven name absent Cairo IDs, and nine have reversed
  endpoints. The grammar remains undocumented, so every match stays
  `unreviewed`; the original target, type, attributes, text, source file hash,
  document-wide `ref[n]` ordinal, line, and TEI link are retained.
- Corrected the specialized commentary reference locator to count every
  `<ref>` in its XML document before selecting `type="koran"`. Builder and
  independent verifier now agree on global file ordinals. The complete graph
  contains 96,804 edges across five types, and its verifier reports zero
  errors, including all candidate memberships and withheld cases.
- Added a separate Relationship Index filter for the candidates. Runtime
  review found 10 target-query results and confirmed a candidate link opens
  exactly the selected Cairo verse ID; the same row displays its untouched TEI
  target and source citation. Expanded attributes show the exact `type` and
  `target`. No candidate was relabeled as an equivalence.
- Published `v0.5.12-cc-57cb2b7be321`; the active root pointer and page loaders
  reference it. The release verifier passes all 461 assets with zero errors;
  release manifest SHA-256 is
  `abf2c8ed98e369ee93eba06cfc31e7cffafed22701e304516a00bbd5d7072b0f`.
- Required repository checks after the graph/UI extension pass: `npm run check`
  (178 files, zero diagnostics), `npm run test:design` (211 files, the same
  eight warnings in unrelated article/Hadith UI), and `npm run build` (258
  Pagefind pages, 30,861 words).
- Responsive and print interaction review: all 11 Quran routes were opened at
  320px and 390px viewport widths; none overflowed horizontally. A simulated
  print-media transition on the reader hides the passage picker while keeping
  the heading and black/white Arabic text visible. Manuscripts (20 disclosure
  panels) and Analyses (12 panels) expand before printing and restore their
  prior open/closed state afterward. These are automated Chromium event and
  viewport checks, not physical-device or assistive-technology review.
- Phase 3 remains in progress: physical-device rendering, screen-reader
  output, print preview on target browsers, and a focused end-to-end journey
  still need human review. Phase 4 rights/provenance clearance and collection
  expansion, Phase 5 reviewed cross-source mappings, and Phase 6 hosted SQLite
  range testing also remain open; see the implementation checkpoint and gap
  register for their explicit prerequisites.

## Release-wide source fidelity re-audit — 2026-09-28

- Reverified the active v0.5.12 static release against its root pointer,
  immutable manifest, asset sizes/hashes, coverage totals, and source/license
  metadata. All 461 assets pass with zero errors; the manifest SHA-256 remains
  `abf2c8ed98e369ee93eba06cfc31e7cffafed22701e304516a00bbd5d7072b0f`.
- Re-ran the local staging verifier against the current 2026-09-28 database
  and pinned TEI. All 18,000 variant records, 68,344 word strings/locators,
  870 reader authorities, 58 source authorities, 31,294 Cairo lines, 154,864
  Cairo tokens, and 34,163 candidate links match source; SQLite integrity is
  `ok`, with zero foreign-key errors or duplicate source locators.
- Independently rebuilt/checksummed the browser packages from source: 18,000
  variants and 3,492 candidate passages; all 6,236 Cairo verses and 77,432
  tokens; 37,358 commentary search blocks and 94,443 body elements plus 850
  header elements; 91,285 concordance records and 3,833,970 exact fields;
  2,322 manuscript records with 192,295 elements; 713 intertext records with
  9,452 indexed fields; and 122 taxonomy categories. Every verifier reported
  zero mismatches/errors.
- The full 96,804-edge graph independently reconstructs with zero errors:
  17,986 source-reported reader-authority edges, 34,163 candidate word
  locators, 15,977 source commentary Quran references, 14,959 other explicit
  TEI references, and 13,719 unreviewed range candidates. Four target-less
  refs remain inventoried; all other target values remain uninterpreted.
- This audit verifies extraction, packaging, and source locators for the
  pinned Corpus Coranicum snapshot; it does not certify the source's historical
  assertions or close rights, human-review, accessibility, or hosting gates.
- Required project commands pass after this re-audit: `npm run check` reports
  178 files with zero diagnostics; `npm run test:design` passes 211 files
  with eight existing warnings in unrelated article/Hadith UI; `npm run build`
  indexes 258 pages and 30,861 words.

## Quarantined Studies metadata inventory — 2026-09-28

- Added a reproducible metadata-only parser for the user-supplied Studies
  directory. It validates the complete file set and SHA-256 values against the
  private source manifest and exact rename-manifest targets, reads PDF
  document-info/page-count/encryption properties and DOCX core properties,
  and extracts no page text, OCR, or images.
- The input reconciles as 77 documents (76 PDFs and one DOCX) plus the rename
  manifest: all 76 PDFs have valid signatures and readable page counts; all
  77 documents have metadata records; there are no parser warnings or errors.
  Two duplicate SHA-256 pairs are reported separately and remain unmerged.
- The generated report stays under ignored `scratch/`. Embedded metadata and
  rename-manifest labels are only research leads; all Studies material remains
  quarantined because per-file provenance and reuse terms are still unknown.
  See D-028 and G-002.
- Project verification after adding the metadata parser passes: `npm run check`
  reports 178 files and zero diagnostics; `npm run test:design` passes 211
  files with the same eight unrelated warnings; `npm run build` indexes 258
  pages and 30,861 words.

## Quarantined staging identity and row-level verification — 2026-09-28

- Changed the local source adapter so absent Nasser native IDs remain null;
  array ordinals are locators only. Studies file records and rename-manifest
  rows likewise leave native IDs null and retain their filename/CSV line in
  the locator. The parser version is now `quran-local-ingest/0.1.2`.
- Rebuilt a fresh private staging database at
  `scratch/quran/staging-no-native-id-backfill-2026-09-28/`; all 3,240 TEI
  files validate, with 18,000 variants, 3,035 manuscript descriptions,
  SQLite integrity `ok`, and zero foreign-key errors. Independent TEI source
  parity reports zero text, locator, token, authority, and candidate errors.
- Added a separate verifier for quarantined local sources. It rejects
  duplicate JSON object keys, compares every Nasser row and container payload
  to source, checks all Studies file hashes and rename-manifest rows, requires
  null native IDs for file/manifest rows, enforces quarantine state, and
  confirms the exact missing Shamela source contributes no artifact. Result:
  three duplicate-key-free Nasser files, 49,133 exact Nasser data rows, 77
  exact Studies documents, 77 manifest rows, and zero errors.
- Nasser fields remain semantically undocumented, and all Nasser/Studies
  material remains quarantined. The missing Shamela export is not substituted.
  Phase 0 origin/rights gates and Phase 1 meanings for undocumented fields
  therefore remain open.

## v0.5.13 provenance refresh and active-pointer validation — 2026-09-28

- The static verifier correctly rejected v0.5.12 after the recorded ingestion
  parser changed. Published v0.5.13 with refreshed generator hashes and moved
  the root manifest plus all Quran loaders/pages to the new release. The
  v0.5.12 directory and root-independent assets remain preserved.
- Static verification passes all 461 active assets with zero errors; the
  manifest SHA-256 is
  `338b8dbf2956498f25aa7b53d98235703fd4ed300197365ffee87776645805f`. A
  record-by-record asset-manifest comparison finds all 461 hashes identical
  between v0.5.12 and v0.5.13; this release refreshes provenance only.
- Live browser review on v0.5.13 loaded the candidate relationship filter,
  returned 10 matches for the exact query `koran-073:017`, and displayed the
  exact Cairo verse destination plus pinned TEI source-line links. The
  relationship remains visibly `unreviewed`; no external target was followed.
- Cross-checked the Methods & Data page against the release and corrected two
  stale coverage statements: it now distinguishes 13,719 unreviewed range
  candidates from the 2,258 unlinked target forms, and documents that the 122
  source categories are indexed separately without record assignments. Live
  browser accessibility-tree review confirms those current descriptions.
- Required repository checks pass: `npm run check` reports 178 files and zero
  diagnostics; `npm run test:design` passes 211 files with eight existing
  warnings in unrelated article/Hadith UI; `npm run build` indexes 258 pages
  and 30,864 words.
- Phase 6's full SQLite hosting/range test remains pending an explicitly
  supplied Quran data destination. Phase 0 rights/provenance, Phase 3 human
  accessibility/device review, and Phase 5 reviewed cross-source mappings
  remain open as recorded above.

## Current local SQLite release row-parity audit — 2026-09-28

- Rebuilt the CC-only SQLite artifact from the current no-native-ID-backfill
  staging snapshot into new ignored directory `scratch/quran/release-v4/`;
  kept the older release untouched. The artifact is 421,310,464 bytes with
  SHA-256
  `85788652038557b980dd88bed4fbdf5024c7e0ea9aa98041d51f68ed956601d3`.
- Added an independent release verifier. It confirms the SQLite contains only
  the pinned Corpus Coranicum snapshot, compares every row in 27 tables and
  all 49,294 full-text search rows against staged source rows, validates the
  complete 3,243-artifact hash inventory and license metadata, and reruns
  SQLite integrity/foreign-key checks. Result: zero errors.
- This is a local audited artifact only. External SQLite publication and
  range-request/browser parity remain open until a Quran data destination is
  supplied; the website continues to use the separate immutable static JSON
  release.

## Commentary target documentation check — 2026-09-28

- Verified the checked-out Corpus Coranicum TEI repository HEAD matches the
  pinned commit `57cb2b7be321ecfba100cb5f7988974f47864a14`.
- The pinned `README.md` says commentary references to surahs use `xml:id`
  and `target` attributes and says Cairo surahs, verses, and words have unique
  IDs. It does not document the exact target range syntax or endpoint meaning.
- Updated G-014, G-017, and D-026 to reflect this partial upstream evidence.
  The 13,719 exact-ID matches remain `unreviewed` navigation candidates; no
  source-confirmed relation was inferred from the README statement.

## Phase 3 automated navigation and narrow-screen review — 2026-09-28

- Added `tests/quran.spec.ts` to check all 11 Quran routes at 390px, require
  one main landmark, and verify no horizontal overflow or page errors. A
  second browser journey follows an actual
  source-linked candidate from Variant Index to Read & Compare and back,
  checking that the selected passage and source reader key stay in the URL and
  that the displayed Cairo text retains its Arabic language/direction.
- The first browser run found Quran routes had nested `<main>` landmarks
  because `BaseLayout` already provides the document main. Replaced page-root
  `<main>` elements in all Quran project routes with wrapper `<div>` elements;
  layout classes remain attached to those wrappers. Recorded D-031.
- Rebuilt the site and reran Chromium coverage: all 11 routes passed the
  responsive/landmark check, and the linked journey passed. Screen-reader
  testing with assistive technology, physical-device review, print review, and
  a longer human journey remain open; this automated check does not claim those
  gates are complete.

## Phase 3 print and Arabic source-string review — 2026-09-28

- Captured and visually inspected the Read & Compare page in print media. The
  exact TEI indentation made the Arabic passage wrap as a vertical word list,
  and the site-wide header/footer took up printed space.
- Updated the display to collapse whitespace through CSS only, disclosed this
  presentation transform beside the passage, and hid global site chrome in
  print while retaining Quran source citations and record details. The
  browser test compares `#qr-arabic.textContent` exactly with the selected
  active-release Cairo shard before checking print visibility.
- The Chromium print test passes with passage, variant details, and citations
  visible. The refreshed screenshot is stored in ignored
  `test-results/quran-read-print-review.png`. See D-032. Human printer output
  and assistive-technology review remain open.

## Phase 3 textual-fidelity correction — 2026-09-28 (superseded by D-036)

- Rejected the temporary CSS whitespace-collapsing display after checking it
  against data fidelity rule 3: exact DOM `textContent` alone did not make a
  visibly altered source form a verbatim display. Restored `pre-wrap` and the
  `<pre>` source view. D-032 and D-033 are historical; D-036 records the
  current rule.
- Kept the print improvement that hides site chrome and search controls. The
  exact source passage, word-token citations, and variant record evidence stay
  in the output. Rerun the print screenshot against the restored verbatim
  display before treating it as current visual evidence. D-035 briefly made a
  readable derivative primary; current-state audit rejected that placement
  under fidelity rule 3. D-036 restores the exact TEI view as primary.

## Phase 5 bibliography key evidence and release v0.5.14 — 2026-09-28

- Audited the pinned TEI bibliography directly: 10,678 `<bibl>` elements,
  4,201 exact `@key` citations, 770 distinct key values, 58 local
  `biblStruct/@xml:id` values, and zero key/local-ID matches. The export has no
  bibliography crosswalk. D-034 keeps these citations as unresolved source
  keys; G-018 records what evidence is needed before resolving them.
- Added the typed bibliography-key graph edges with exact key, citation text,
  XML attributes, source line, file-local locator, and source-file hash. The
  independent graph verifier reconstructs all 4,201 keyed citations and
  reports zero mismatches. The v4 graph has 101,005 edges across its seven
  evidence types.
- Built immutable release `v0.5.14-cc-57cb2b7be321`, preserving v0.5.13.
  Static release verifier passes with no errors; its manifest SHA-256 is
  `30535e03d8852b72e05f28a29149ee278132436359ba27114b4ac857eac3826d`.
- The previous print review established that TEI indentation reduces
  readability, but that does not permit the derivative to replace the source
  text in its display slot. Restored `#qr-arabic` as the exact TEI source string
  and moved the named readable format to a separate expandable view. D-038
  names/version-controls its transformation.
- Browser coverage compares the primary passage to the exact release shard and
  independently compares the derivative to its named whitespace transform.
  A new print capture must be reviewed against the corrected source-primary
  layout; the earlier readable screenshot is no longer current evidence.
- Final verification before this correction: `npm run check` passes (179 files,
  zero diagnostics); `npm run test:design` passes with eight existing audit
  warnings; `npm run build` passes and indexes 258 pages / 30,867 words;
  `npx playwright test tests/quran.spec.ts` passes all four Chromium tests;
  static release verification reports zero errors for v0.5.14.

## Phase 4 lazy search and Phase 6 release revalidation — 2026-09-28

- Rechecked the active root pointer and immutable manifest: v0.5.14 has 463
  assets totaling 479,103,726 bytes. Its full 18,000-record variant catalog is
  21,427,833 bytes uncompressed. The Variant Index previously fetched that
  catalog on every visit. It now keeps the 12-record cited preview immediate
  and requests the full catalog only after search submission or a record
  follow/deep link; D-037 records the reversible client-static choice and
  G-019 records the still-open deployed performance gate.
- Re-ran the independent local SQLite release comparison against the
  no-native-ID-backfill staging snapshot: all 27 tables, 49,294 search rows,
  source hashes, integrity, and foreign keys pass with zero errors. The active
  static release verifier also reports zero errors.
- Rechecked the passage text against fidelity rule 3. The exact Cairo TEI text
  is the primary view, with `pre-wrap`; the normalized reading format is a
  separately labeled, expandable derivative. Browser assertions check source
  text equality, computed whitespace behavior, and the separate transform.
  The exact-format print capture remains visually awkward because TEI source
  indentation is retained; this is a disclosed fidelity tradeoff, not a
  passing human print/usability gate.
- Chromium confirms the Variant Index makes no `variant-catalog.json` request
  on an unfiltered visit, then requests it once after a submitted search. The
  reader-key/fragment deep link still loads the complete catalog and the
  round-trip journey passes. The complete Quran suite passes five tests.
- One initial round-trip test run timed out because its link-name regular
  expression did not match the rendered “Open this passage” label. The trace
  showed the source link was present; after correcting the test locator, the
  focused journey and full suite passed. No product navigation behavior was
  changed for that test-only correction.
- Refreshed site build passes (258 pages, 30,865 words). `npm run check`
  reports zero diagnostics across 179 files; `npm run test:design` passes with
  eight existing warnings. Static release and 27-table/49,294-row SQLite
  verifiers both report zero errors. This closes the local checks for this
  increment; Phase 3 human print/accessibility, Phase 4 deployed performance,
  Phase 5 reviewed-relationship/analysis coverage, and Phase 6 external hosting
  remain open.

## Phase 2 transformation profile and Phase 3 fidelity regression check — 2026-09-28

- Assigned the optional readable Cairo rendering the stable profile ID
  `quran-whitespace-collapse/1.0.0`. Documented its exact operation (`/\s+/gu`
  to U+0020, then `trim()`) beside the view and in D-038. The exact TEI string
  remains the primary visible text with `white-space: pre-wrap`.
- Updated Chromium checks to compare the exact passage against the active
  release, require the computed `pre-wrap` style, and verify the derivative's
  profile ID and output separately. The complete Quran suite passes five
  tests.
- Final required checks pass: `npm run check` (179 files, zero diagnostics),
  `npm run test:design` (211 files; eight pre-existing warnings),
  `npm run build` (258 pages, 30,869 words). The print capture remains visually
  awkward for TEI-indented source text; no fidelity rule was relaxed to improve
  that appearance. Phase 3 human print/accessibility review stays open.

## Phase 5 candidate provenance and immutable release v0.5.15 — 2026-09-28

- Found that 34,163 Cairo candidate edges lost their source
  `crosswalk.match_method` during index generation, causing the relationship
  graph to display a null method. Updated the index and browser packages to
  retain the exact `cc-variant-n-to-cairo-xml-id-v1` value and show it beside
  the explicit “Candidate · not reviewed” state.
- Strengthened the full browser-package verifier to reconstruct candidate
  method, state, target word ID/text, verse ID, and source locator from the
  canonical SQLite crosswalk, joined to variant source record and word
  ordinal. All 34,163 rows match; the 18,000-record, 68,344-word, 3,492-passage
  package reports zero errors.
- Rebuilt and independently checked the relationship graph: 101,005 edges,
  including 34,163 candidate links, zero verification errors. Candidate method
  provenance now flows into each graph edge; candidate state remains
  unreviewed.
- Built immutable static release `v0.5.15-cc-57cb2b7be321`, preserving
  `v0.5.14`. The browser test then exposed that the 24-record immediate
  preview still used the older schema. Regenerated it from the canonical
  index and built v0.5.16, preserving both earlier releases; the app now points
  to v0.5.16. The active release verifier reports zero errors. Updated D-039
  and clarified G-006: 17,986 authority links resolve by the documented alias,
  while 14 records have no reader key.
- Added a browser assertion for the visible candidate method. The final Quran
  browser suite passes five tests, including the 24-record preview, all module
  routes at 390px, and the read/candidate round trip. `npm run check` passes
  with zero diagnostics across 179 files; `npm run test:design` passes across
  211 files with eight existing warnings; `npm run build` indexes 258 pages
  and 30,882 words. The active static-release verifier reports zero errors.

## Phase 1/5 source-reference completeness and immutable release v0.5.21 — 2026-09-28

- Re-auditing `allvariants.xml` found that one scalar key had been retained per
  variant `<item>`, although its direct children contain 30,112 `<persName>`
  entries across 17,986 records (up to 17 entries on one record); 14 records
  have no direct `<persName>`. The earlier 17,986 total was a count of records
  with at least one entry, not a count of source-listed references.
- Added schema v2 relation `variant_reader_reference`, one row per direct
  element, preserving source order, exact native key, exact label, source
  record, source path/line locator, and the documented authority alias. The
  legacy scalar fields remain first-entry summaries only. Labels are described
  as TEI-listed labels because some are descriptors and source membership does
  not itself validate a person's identity or a reading assignment.
- Rebuilt into a new ignored staging directory from the pinned source
  manifest. The independent TEI verifier reports zero errors across all 3,240
  XML files, 18,000 variant records, 30,112 labels, 68,344 variant words,
  31,294 Cairo layers, 154,864 Cairo tokens, all reader/source authorities,
  and 34,163 candidate locators. The CC-only SQLite release contains 28 tables,
  309,927 source records, 49,294 FTS rows, and 30,112 reader-reference rows;
  integrity, foreign keys, and full table parity pass. Artifact SHA-256:
  `d69e65c6dbaa2dacd346f48670e7259c78a809d219761792f14c3cd1e7e39975`.
- Recomputed the source-label analysis from TEI and SQLite independently:
  30,112 entries, 17,986 records with labels, 14 records without labels, 753
  exact keys linked to authority rows, and one null-key group. All row content
  and the result hash match. The static variant package's 18,000-record catalog
  is 21,878,399 bytes; the two source-label indexes are 11,637,927 and
  14,786,002 bytes. Package verification compares every label against the
  pinned source XML and database and reports zero errors.
- Rebuilt the explicit relationship graph and independently reconstructed its
  edges. It has 113,131 edges, including all 30,112 TEI-listed reader-reference
  edges and 34,163 still-unreviewed Cairo locator candidates. No candidate is
  promoted to a confirmed reading equivalence.
- Built immutable site release `v0.5.21-cc-57cb2b7be321`, preserving the prior
  release chain and carrying forward the full Cairo, commentary, concordance,
  intertext, manuscript, variant, analysis, and graph packages. Its static
  release verifier checks all asset hashes, source license/commit metadata,
  complete multi-label coverage, aliases, and the prior-release pointer with
  zero errors. Root data pointer now targets v0.5.21.
- Added a browser regression for `variant_1000`, which has two labels; it checks
  both exact labels and the second `persName` line link. All six Quran browser
  tests pass. `npm run check` passes for 179 files with zero diagnostics;
  `npm run test:design` passes for 211 files with eight existing warnings;
  `npm run build` succeeds and indexes 258 pages and 31,605 words.
- External hosting, cache behavior, transfer size on the intended host, and
  SQLite byte-range parity remain unverified because no Quran data destination
  was provided. Nasser, Studies, and Shamela remain private/quarantined under
  unresolved origin or redistribution rights; this release contains only the
  licensed pinned Corpus Coranicum data.

## Phase 3 contrast audit and Phase 5 label-search correction — 2026-09-28

- A full-route contrast check found that a page-scoped link selector overrode
  the shared button text color on Methods & Data, producing a 1:1 text/background
  pair in both themes. Excluding `.hc-btn` from that generic link rule restores
  the shared inverse text color. Every Quran route then passed the rendered
  contrast check in dark and light themes when checked individually. Two
  aggregate-loop attempts encountered dev-server navigation reloads on
  Relationship or Commentary pages; each affected route passed a separate
  retry. Human accessibility and device review stay open.
- Found that label analysis advertised exact-label and variant-ID search but
  filtered only reader keys and authority display labels. Search now includes
  all source labels and member variant IDs while leaving displayed strings
  exact. A browser regression searches for the descriptive label
  `grammatisch möglich` and finds its source-key group.
- After these UI changes, `npm run check` passes for 179 files with zero
  diagnostics, `npm run test:design` passes for 211 files with eight existing
  warnings, `npm run build` succeeds for 258 pages and 31,605 indexed words,
  and all eight Quran browser tests pass. The active v0.5.21 data manifest and
  source hashes remain unchanged because this increment changes only the
  presentation/search layer. The no-JavaScript regression confirms that the
  server-rendered variant preview, source links, and full analysis download
  remain available without the browser module.

## Phase 3 interactive-name audit — 2026-09-28

- Added a Chromium DOM audit across all 11 Quran routes for accessible names on
  links, form controls, buttons, summaries, and ARIA button/link roles. It
  checks visible text, explicit labels, label associations, image alternatives,
  and placeholders. Astro's injected development toolbar controls are excluded;
  all application controls pass.
- The focused audit passes. It is a structural name check, not a screen-reader
  session or a full accessibility conformance audit. Human assistive-technology
  and physical-device review remain open Phase 3 work.
- Full Quran browser coverage passes all nine tests. Required repository gates
  pass: `npm run check` (179 files; zero diagnostics), `npm run test:design`
  (211 files; eight existing warnings in unrelated article/Hadith UI), and
  `npm run build` (258 pages; 31,605 indexed words). No Quran release asset or
  source data changed in this audit.
- Re-ran the active v0.5.21 static release verifier against the current
  worktree: all manifested assets, source metadata, checksums, and release
  pointer pass with zero errors. Re-ran the independent SQLite release
  comparison against schema v2 staging selected by its exact source-manifest
  hash: all 28 tables, 49,294 search rows, 449,683,456-byte artifact, integrity,
  foreign keys, and row digests pass with zero errors.

## Phase 1/6 data-pipeline guide correction — 2026-09-28

- Current-state review found that `DATA-PIPELINE.md` labeled the superseded
  schema v1/release-v4 snapshot as current, while later sections correctly
  documented schema v2/release-v5. Rewrote the conflicting section to label v1
  results historical, name the active parser, exact source-manifest hash,
  schema v2 staging database, and v0.5.21 SQLite artifact, and use current
  paths in the independent verifier commands.
- Confirmed the named staging snapshot carries the manifest hash recorded in
  the active release manifest. Re-running the SQLite verifier against it
  reports 28 tables checked and zero errors. The separate static release
  verifier also reports zero errors. The Nasser/Studies inventory remains
  quarantined and Shamela remains missing; this documentation fix does not
  change data or rights state.

## Phase 1/6 aggregate reader-reference count correction — 2026-09-28

- Package review caught a catalog-level count bug: the second reader-index
  shard count (17,320) had been reported as the catalog total instead of the
  sum across both shards (30,112). The package builder now aggregates every
  shard, and both independent package and static-release verifiers assert the
  complete total.
- Rebuilt the full variant package and immutable site release
  `v0.5.23-cc-57cb2b7be321`, preserving verified release `v0.5.21` as its
  predecessor. The active root pointer and all Quran module paths now target
  v0.5.23. The static release verifier reports zero errors and validates the
  manifested assets and source metadata. The full package verifier previously
  passed with 18,000 records, 68,344 words, 30,112 source references,
  34,163 candidate word links, and 3,492 passages.
- Current `npm run check` passes with zero errors and one existing unused-value
  hint. `npm run build` succeeds, rendering 258 pages and indexing 31,654
  words. The required design audit currently fails on font-size floor and
  focus-outline findings in the existing Blogs, Contact, and YouTube pages;
  it reports no Quran-page findings. Those unrelated UI issues remain open.
- The previous `.21` release remains immutable. External hosting, public
  transfer/cache measurements, SQLite range behavior, human screen-reader and
  physical-device review, and rights/origin clearance for Nasser, Studies, and
  Shamela remain open.
## Phase 0/1/2 source-manifest and staging revalidation — 2026-09-28

- Reopened the exact user-supplied input paths. All three Nasser JSON files
  and 78 Studies-folder files are present and still match the pinned SHA-256
  manifest. The exact supplied Shamela CSV path remains absent; the canonical
  acquisition manifest records it as `missing` with no staged artifacts.
- An earlier `not_supplied` experiment was not suitable as the current
  provenance snapshot because the exact Shamela path had already been supplied.
  The first current-state staging check also exposed an old database that
  stored Studies filenames as native IDs. Rebuilt to a new ignored directory
  with schema v2 and the canonical `source-manifest-local-only` manifest.
- Independent quarantine verification now passes with zero errors: 3
  duplicate-key-free Nasser files, 49,133 exact data rows, 77 Studies files,
  77 rename-manifest rows, and zero Shamela files/rows. All restricted-source
  rows remain quarantined; no PDFs or Nasser content enter the public release.
- Independent TEI verification passes with zero mismatches: 18,000 variant
  records, 30,112 reader references, 68,344 variant words, 870 reader
  authorities, 58 source authorities, 31,294 Cairo lines, 154,864 Cairo word
  tokens, and 34,163 unreviewed candidate links. SQLite integrity and foreign
  keys pass. The CC-only release verifier compares all 28 tables and 49,294
  search rows with zero errors.
- Repeated the same complete staging build from the same manifest. Both
  561,233,920-byte SQLite outputs have SHA-256
  `e28f3892eb4665d76eb0d513e3c727124fc7beca2df27e15281cc173854d07bc`.
  This confirms deterministic bytes under the current source manifest and
  parser.
- Phase 0 authority and reuse questions for Nasser/Studies remain unresolved;
  Shamela provenance/rights and the exact missing CSV remain blocked. These
  sources stay quarantined. Human review and hosting/range tests remain open.
## Phase 1 Nasser structural schema audit — 2026-09-28

- Generated ignored local report `scratch/quran/nasser-json-shape-profile.local.json`
  with transform `nasser-json-structural-profile/1.0.0`. It records exact
  source hashes, root keys, row counts, JSON-pointer field paths, occurrence
  counts, and JSON types; array positions use a wildcard. It stores no scalar
  field values and makes no semantic mapping.
- The report confirms the `standard` fields are Boolean or null and `status`
  fields are string or null, with source-specific null counts now recorded in
  G-001. The names and values remain un-interpreted; this structural evidence
  does not establish export origin, field meaning, version, or reuse rights.
- The report remains ignored local scratch data. Nasser remains quarantined,
  and source files were read only.
## Phase 0/3 supplied display-reference review — 2026-09-28

- Reopened the user-supplied EVQ design repository and Qira'at Explorer README.
  Recorded the passage-selector, distinct reading/evidence areas, and nearby
  citations as workflow references in D-044. The site's existing reader,
  Variant Index, and source locators cover these information roles while
  retaining the project's own brand and source data.
- Qira'at Explorer identifies its eight-verse/53-reading sample as curated
  and not yet scholarly-confirmed. Its data and the EVQ static examples remain
  design/reference material only; no readings or Arabic strings were copied.
- Phase 0 origin, schema, and rights questions for Nasser, Studies, and the
  missing Shamela CSV remain open. The reference review changes no source data
  or release assets.

## Phase 4 concordance field-code documentation audit — 2026-09-28

- Compared all 42 exact field names in the active v0.5.23 concordance catalog
  against the pinned TEI README and `schema/corpus_coranicum.odd`. `verse` is
  present only as generic schema prose; the other 41 field names are absent.
  Neither file defines the concordance vocabulary, although the README says
  the project uses a standard vocabulary.
- Kept every concordance value and field code source-native and uninterpreted.
  G-010 remains open pending an authoritative field glossary or data
  dictionary; no grammatical or semantic labels were inferred from names.

## Active scope narrowed to Corpus Coranicum and existing Quran modules — 2026-09-28

- Per the user's direction, Nasser JSON, the Studies folder, and Shamela are
  out of scope for this goal. Their provenance/rights questions and missing
  Shamela path are no longer completion blockers; they must remain unused and
  unpublished unless the user later reopens that scope.
- Updated the implementation plan, gap register, decision log, and pipeline
  overview to distinguish active Corpus Coranicum work from historical private
  source audits. Earlier log entries remain as dated evidence, not current
  requirements.
- Remaining active gates are human review of implemented journeys, the
  incomplete local release artifact, identified-host performance checks, and
  source semantics that must remain explicitly uninterpreted until documented.

## Phase 3/6 current build and release revalidation — 2026-09-28

- `npm run check` passes with zero errors and one existing unused-value hint.
  `npm run build` succeeds; Pagefind indexes 258 pages and 31,668 words.
- `npx playwright test tests/quran.spec.ts` passes all nine browser checks,
  including narrow viewport layout, named controls, no-JavaScript source
  access, passage/reader-key navigation, print output, and unresolved
  bibliography keys. The active v0.5.23 static-release verifier reports zero
  errors across its manifested assets.
- `npm run test:design` still fails on font-size and focus-outline findings in
  existing Blogs, Contact, Legal, and YouTube pages; it reports no Quran-page
  findings. Those pages are outside the current Quran scope.
- The production build copies the incomplete, unreferenced v0.5.22 release
  directory into `dist/client`. It has 466 files but its manifest accounts for
  only 31, leaving 435 unmanifested files. G-020 remains a direct deployment
  blocker even though the active release pointer and v0.5.23 manifest verify.
  A prior recursive deletion attempt was rejected by the execution safety
  policy; no alternate deletion method was used. Screen-reader, physical-device,
  and visual print review and deployed-host performance remain open.

## Phase 0/1/6 scope-only staging and release — 2026-09-28

- Updated manifest and ingest adapters to support an explicit
  `corpus-coranicum-only` build. Nasser, Studies, and Shamela are marked
  `excluded_by_scope` with zero files and no local paths; their path arguments
  are rejected, and no excluded-source parser runs. Historical source audit
  artifacts remain ignored and are not used by this build.
- Built a fresh staging snapshot with parser `quran-local-ingest/0.1.4` from
  the pinned 3,243-file TEI checkout. All 3,240 XML files validate; independent
  source comparison reports zero mismatches across 18,000 variants, 30,112
  reader references, 870 reader authorities, 58 source authorities, 31,294
  Cairo lines, 154,864 tokens, and 34,163 candidate links. SQLite integrity
  and foreign keys pass.
- Built a new 449,683,456-byte CC-only SQLite artifact at
  `scratch/quran/release-coranicum-only-v6-2026-09-28/`; SHA-256 is
  `2fc2aa251731821a70857ae4b6a8d596314594a3b188382d35ab671dfa457363`.
  The independent verifier compares all 28 tables and 49,294 search rows with
  zero errors. The manifest binds only the pinned TEI source snapshot.
- Rebuilt immutable site release `v0.5.24-cc-57cb2b7be321` with the changed
  pipeline hashes. Its static release verifier reports zero errors; the
  production build succeeds with 258 pages and 31,668 indexed words; all nine
  Quran browser tests pass against the new build.
- At this checkpoint, G-020 remained a deployment blocker: the build copied
  435 unmanifested files from the incomplete v0.5.22 directory. The later
  Phase 6 production asset allowlist entry below supersedes this status without
  modifying that local source directory. No public Quran host was supplied,
  so deployed transfer/cache/range measurements remain pending.
  Screen-reader and physical-device review also remain open.

## Phase 5 scoped reader-analysis verification — 2026-09-28

- Rebuilt the reader-key count artifact against the 449,683,456-byte
  Corpus Coranicum-only SQLite release. It records the matching input database
  SHA-256 `2fc2aa251731821a70857ae4b6a8d596314594a3b188382d35ab671dfa457363`,
  30,112 exact source label entries, and result SHA-256
  `8eeb2cea9456be5e47feff796d4d788ed7f5404ee907a329adafcf03713c8a3`.
- Independent verification recomputed all 754 groups and 30,126 member
  records, confirmed zero database/source mismatches, and reported zero errors.
  The static reader-count asset currently carries the same source-derived
  counts from an earlier audited database input; refreshing its embedded input
  database provenance would require a new immutable site release.

## Phase 6 production asset allowlist — 2026-09-28

- Changed the production build to stage `public/` temporarily. For every
  immutable Quran release it verifies each manifest-listed file's path, size,
  and SHA-256, then stages only those declared assets plus the release notes
  and manifest. Source release directories are not changed.
- The new build excluded 435 unmanifested files from v0.5.22 while retaining
  its 31 manifest-listed assets. A post-build path check confirmed that none of
  the excluded files reached `dist/client`; the v0.5.22 output directory has
  only its 31 assets, release notes, and manifest. The active v0.5.24 release
  verifier still reports zero errors.
- This closes the unmanifested-file deployment gap without deleting the local
  orphan. Production packaging is now manifest-bound across all 33 archived
  releases; external-host performance and human accessibility review remain
  open.
- Final checks on this build: `npm run check` passed with zero errors and one
  existing unused-value hint; `npm run build` completed with 258 indexed pages
  and 31,668 words; and `npx playwright test tests/quran.spec.ts` passed all
  nine browser checks. `npm run test:design` still reports existing
  font-size/focus-outline findings on Blogs, Contact, Legal, and YouTube, with
  no Quran-page findings.

## Phase 4 concordance field-label crosswalk — 2026-09-28

- Inspected the pinned Corpus Coranicum website repository at commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4`, specifically its English
  concordance locale and the TEI export command that writes the source field
  types. The locale supplies matching labels for 37/42 exact TEI field types;
  an independent comparison found zero mismatches.
- Added those official interface labels beside the unchanged native types in
  the concordance browser. The five fields without matching locale keys remain
  raw. Values, empty states, field order, and source locators are unchanged;
  `analyse_mortality` is shown with its upstream “modality” label without
  correcting either string.
- The pinned TEI codebook documents field labels, not the value vocabulary.
  Grammatical values remain source-native and uninterpreted except for the
  interface labels explicitly shown by the upstream website. Value decoding
  and human review are still open where the upstream sources provide no
  definition.
- Verification: the new concordance browser check confirms both exact
  transcriptions (`bi-sm-i`, `bi-smi`), the official field labels beside their
  exact native types, raw fallback for unmatched types, the upstream
  `analyse_mortality`/“modality” pairing, and the TEI source line. All 10 Quran
  Playwright checks pass. `npm run check` reports zero errors; the production
  build succeeds with 258 pages and 31,677 indexed words. The required design
  audit still fails on existing non-Quran font-size/focus-outline findings and
  reports no Quran-page findings.

## Phase 3 Read & Compare print presentation — 2026-09-28

- Print now opens the separately labeled, whitespace-collapsed Arabic
  rendering while retaining the exact TEI character string, source links,
  variant records, and their citations. After printing, the readable-format
  disclosure returns to its previous state.
- The targeted Playwright check passed. It exercises the print event, confirms
  the derived view and source citations are visible, then confirms the normal
  screen state returns. A visual print review was captured; physical printer
  pagination and human device/accessibility review remain open.

## Phase 5/6 reader-analysis provenance refresh — 2026-09-28

- Rechecked the current asset instead of relying on the prior progress note.
  The v0.5.24 static analysis named SQLite hash
  `d69e65c6dbaa2dacd346f48670e7259c78a809d219761792f14c3cd1e7e39975`, not the
  current CC-only release hash
  `2fc2aa251731821a70857ae4b6a8d596314594a3b188382d35ab671dfa457363`; the
  independent verifier rejected that old input binding.
- Correction to the earlier Phase 5 note: the then-current v2 analysis file
  also named the older `d69e65...` database, despite the earlier note reporting
  the new database hash. Treat this entry and the pinned v0.5.25 manifest as
  authoritative for the refreshed analysis.
- Regenerated the analysis from the current audited database and pinned TEI.
  Verification recomputed 18,000 records, 30,112 direct labels, 754 groups,
  and 30,126 member rows with zero database/source mismatches and zero errors.
  The rows match v0.5.24 exactly; the canonical result hash is now
  `8eeb2cea9456be5e47feff796d4d788ed7f5404ee907a329adafcf03713c8a3` because
  the input database hash is part of the hashed analysis. The new analysis file
  SHA-256 is `e2e375dd0756d6fb688d2d5d76cf1afde26757c2ab908975cb1970fd29a3ddba`.
- Published immutable `v0.5.25-cc-57cb2b7be321`, chained to v0.5.24. It contains
  466 declared assets; 465 are byte-identical copies and only the reader-count
  analysis differs. Its manifest SHA-256 is
  `cd52faf5700fffa9a41802ff5b46068406ae519cb8e1bb0c6eb79b4340b62f98`.
  The independent static-release verifier passed with zero errors. The
  production package check remains to be rerun against this active release.

## Phase 6 v0.5.25 production verification — 2026-09-28

- The production build completed successfully with 258 indexed pages and
  31,677 indexed words. It staged 34 manifest-verified Quran releases and
  excluded all 435 unmanifested v0.5.22 files.
- An independent distribution audit checked the active v0.5.25 manifest hash,
  exact 466-asset file set, and every asset byte length/SHA-256 in
  `dist/client`; zero mismatches were found. The deployed bundle’s analysis
  input SHA-256 is the audited local SQLite release hash.
- All 10 Quran Playwright checks pass against the v0.5.25 pointer. User-supplied
  hosting is still absent, so public-host transfer, caching, and range behavior
  remain unmeasured.

## Phase 3/6 production Quran navigation audit — 2026-09-28

- Scanned rendered production HTML for every Quran route and resolved each
  internal `href` and `src` target against `dist/client`, including active
  release assets. All 11 routes and 576 internal references were checked; zero
  missing targets or paths escaping the distribution root were found.
- The audit covers static rendered links and resources. External source hosts
  and dynamically constructed record links remain covered by existing source
  URL/index verifiers and browser navigation checks, not by this local-path
  sweep.

## Phase 5 bibliography-key navigation — 2026-09-28

- Review of the pinned Corpus Coranicum website code supports a direct
  Zotero item-key URL pattern for exact `zotero-` plus eight uppercase
  alphanumeric characters. The relationship browser now exposes that URL for
  4,189 citation occurrences across 768 keys. It preserves each exact TEI key,
  citation text, source line, and unresolved local bibliography state. Twelve
  malformed/empty occurrences stay unlinked; Zotero target content and
  bibliographic identity remain unverified. No external metadata was imported.
- Targeted bibliography navigation checks pass, and the complete Quran browser
  suite passed 11/11 before the final explanatory-copy-only adjustment.
- The independent source reconstruction passed when supplied the v0.5.25 graph
  manifest, the matching staged SQLite artifact, and the full reader-reference
  input (`variants-full-reader-references-v1.json`). It verified 113,131 graph
  edges: 30,112 source-listed reader references, 34,163 candidate word
  locators, 15,977 commentary Quran references, 14,959 other explicit TEI
  references, and 13,719 unreviewed commentary range candidates; zero errors.
  The earlier audit attempt used the compact Variant Index catalog where this
  verifier requires the pre-package full index; that mismatch is superseded by
  this successful paired-input run.
- Active scope remains the pinned Corpus Coranicum release and existing Quran
  modules. Nasser, Studies-folder documents, and Shamela data remain excluded.

## Phase 3/6 current-build verification — 2026-09-28

- Rebuilt the production site after the bibliography-locator explanatory-copy
  update. Build completed successfully; 34 Quran releases were manifest-checked,
  435 undeclared v0.5.22 files were excluded, and Pagefind indexed 258 pages.
- The current-build Quran Playwright suite passed 11/11, including responsive
  route checks, accessible control names, print output, JavaScript-disabled
  evidence, exact bibliography keys, and malformed-key handling.
- The active v0.5.25 static-release verifier passed against all declared
  assets and recorded zero errors. The source-graph audit above also passed
  with zero errors. Human device/screen-reader review and a supplied public
  Quran data host remain external completion gates.
- `npm run check` reports zero errors and zero warnings, with one pre-existing
  unused-value hint in Blogs. `npm run test:design` still fails on existing
  font-size and focus-outline findings in Blogs, Contact, Legal, and YouTube;
  it reports no Quran-page findings.

## Phase 4 concordance source-generation cross-check — 2026-09-28

- Checked the pinned Corpus Coranicum website's TEI concordance generator and
  template against the exact field types retained by the browser. The
  generator explicitly maps the five still-raw types to database fields, but
  does not provide a one-to-one English label for four; `analyse_prefix3`
  appears adjacent to the locale alias `cprefix3` (“prefix 3”) without an
  explicit alias mapping. Following D-052, all five stay code-labeled and
  verbatim rather than promoting that plausible but unproven equivalence.
- Logged repository commit and source-file hashes in D-052. The 42-field data,
  source order, values, and release assets were not changed.

## Phase 5 commentary target-generation evidence — 2026-09-28

- The official Corpus Coranicum website exporter at commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4` creates commentary TEI targets by
  concatenating a source `<q>` element's `@type`, `@versstart`, and `@versend`.
  Its Cairo template separately shows how verse IDs are generated. This
  corroborates target syntax in the pinned export but does not define range
  inclusion semantics; the 13,719 exact-ID matches remain unreviewed
  navigation candidates.
- Updated the Relationship Index explanation and G-014 evidence; logged the
  source commit, dates, file hashes, and conservative boundary in D-053. No
  graph edge state, source value, or release artifact was changed.
- `npm run check` passes with one existing Blogs hint; `npm run test:design`
  still reports only the previously recorded non-Quran findings. The required
  production rebuild stopped with `ENOSPC` while copying generated assets to
  ignored `dist/`; C: had zero free bytes. A cleanup attempt for that generated
  output was rejected by the execution policy, so the rebuild and browser
  rerun must wait until workspace disk space can be reclaimed.

## Phase 5 exact intertext target crosswalk audit — 2026-09-28

- Pinned website UI code maps `#TUK` fragments by extracting the numeric suffix
  and parsing it as a base-10 integer; its TEI exporter writes matching
  intertext IDs as `tuk_{id}`. Comparing this documented transform with all
  713 unique IDs in the pinned intertext catalog found 146 resolvable
  occurrences across 100 records, 36 numeric target values absent from the
  release, and one malformed target without digits.
- Updated G-017 and logged D-054. At this audit checkpoint the graph
  crosswalk and internal links were still pending; the subsequent Phase 5/6
  entry below records their implementation and successful verification. The
  original `target` strings remain unchanged.

## Phase 5/6 exact intertext links, scoped release, and production verification — 2026-09-28

- The user reconfirmed that Nasser, the supplied Studies folder, and Shamela
  are excluded. The active plan now omits their import/parser specifications
  and data-quality gates. The site's existing Academic Studies module remains
  in place; the supplied Studies-folder files are not used by the Quran data
  layer.
- Implemented the D-054 publisher-coded `#TUK` crosswalk in graph v5. The
  builder independently indexes all 713 pinned `msDesc/@xml:id` records from
  hash-checked source XML, preserves every original target, and attaches a
  separate destination only when the documented decimal-to-`tuk_{id}`
  transform finds one unique record. The independent verifier reconstructs
  and compares every row. Result: 183 occurrences, 182 numeric targets, 146
  resolved references across 100 destination IDs, 36 absent IDs, one
  malformed target, and zero verification errors. Unmatched targets remain
  raw and unlinked.
- Relationship Index now links resolved targets to an exact native-ID filter
  in the pinned Intertext Catalogue; it preserves the publisher method and
  does not present cross-reference as content verification. The browser test
  covers a resolved target (`#TUK909`), an absent target (`#TUK501`), a
  malformed target (`#TUK`), and the exact `tuk_909` record filter.
- Published immutable `v0.5.26-cc-57cb2b7be321`, chained to v0.5.25. Its
  release manifest SHA-256 is
  `000fbc30397ffd64e7a8d9b6e8c17e2324d96a220b4939f7fa0484ea104289f5`.
  The static-release verifier reports zero errors across declared assets.
- `npm run check` passes with zero errors, zero warnings, and one existing
  Blogs unused-value hint. `npx playwright test tests/quran.spec.ts` passes
  all 12 browser checks. `npm run build` succeeds, verifies 35 immutable
  Quran releases, excludes 435 undeclared v0.5.22 files, hardlinks 10,863
  declared release assets, and indexes 258 pages / 31,694 words after the
  active-scope clarification on Methods & Data.
- `npm run test:design` still fails on existing findings in Blogs, Contact,
  Legal, and YouTube; it reports no Quran-page findings. Human screen-reader,
  physical-device, complete journey, and print review remain open. Deployed
  search performance remains open until a Quran data host is identified.

## Phase 0–6 current-state audit — 2026-09-28

This audit rechecks the active TEI snapshot, the schema-v2 SQLite release,
source-specific browser packages, graph, and immutable site release against the
phase exit criteria. Excluded input audits do not count as current deliverables.

- **Phase 0 — met for current scope.** The clean TEI checkout is pinned at
  `57cb2b7be321ecfba100cb5f7988974f47864a14`. All 3,243 source-manifest files
  (325,321,174 bytes) still match their recorded size and SHA-256. The three
  excluded inputs are `excluded_by_scope`, with zero files and zero paths.
  The pinned TEI export is identified as CC BY-SA 4.0; no linked images are
  published, and image rights remain separate.
- **Phase 1 — met for current scope.** Independent staging verification checks
  18,000 variant records, 30,112 direct reader references, 870 reader
  authorities, 58 source authorities, 31,294 Cairo lines, 154,864 tokens, and
  34,163 candidate links with zero text/locator/authority errors. SQLite
  integrity is `ok`, with zero foreign-key errors. The canonical release
  independently matches all 28 tables and 49,294 search rows with zero errors.
- **Phase 2 — met for the source-linked vertical slice.** The 24-record pilot
  exposes exact TEI locators and clearly labeled candidates. The full source
  reconstruction verifies the source layers and crosswalk. The TEI export
  does not provide primary-source citations for every variant, so no stronger
  attestation claim is made.
- **Phase 3 — automated exit checks met; human review open.** The complete
  reader, Variant Index, source links, shareable URLs, Arabic/RTL display,
  print behavior, and Methods page are implemented. The current Quran browser
  suite passes 12/12. The generated print preview has been visually inspected;
  screen-reader, physical-device, physical-printer, and complete journey review
  remain open.
- **Phase 4 — local source coverage met; host performance open.** Fresh
  independent checks report zero errors for Cairo text (6,236 verses and
  77,432 tokens), 2,322 manuscript records and 192,295 source elements,
  94,443 commentary body elements plus 850 header elements, 713 intertexts
  and 9,452 selected fields, 122 taxonomy entries, and the concordance's
  91,285 word records / 3,833,970 fields. No manuscript image is copied.
  Performance still needs a user-identified Quran data host.
- **Phase 5 — reproducible graph and analysis checks met; semantic limits
  remain explicit.** The 113,131-edge graph independently verifies with zero
  errors. The `#TUK` crosswalk preserves raw targets and links only the 146
  exact destinations among 183 occurrences. Reader-label analysis recomputes
  18,000 records and 30,112 labels with matching rows and result hash.
  Commentary range links remain unreviewed candidates; local bibliography
  identity and human-reviewed cross-source equivalences remain unavailable.
- **Phase 6 — immutable local release met; external publication is blocked by
  missing destination details.** Release `v0.5.26-cc-57cb2b7be321` passes its
  static-release verifier. The production build checks all 35 release
  manifests, excludes 435 undeclared v0.5.22 files, hardlinks 10,863 declared
  assets, and indexes 258 pages. The full SQLite artifact remains local;
  external transfer and range behavior cannot be measured without a Quran
  data host and credentials supplied by the user.
- Repository-wide design audit still flags existing Blog, Contact, Legal, and
  YouTube issues, with no Quran-page findings. These are recorded separately
  from Quran source fidelity and the unresolved manual review gates above.

## Final print and required-check pass — 2026-09-28

- Compact print-only typography was added for the exact TEI Arabic block. Its
  source string, indentation, line breaks, and `pre-wrap` behavior remain
  unchanged; the readable format remains separately labeled. The targeted
  print browser test passes, and the generated preview was visually inspected.
- `npm run check` passes with zero errors, zero warnings, and one preexisting
  Blogs unused-value hint. `npm run build` passes with the active immutable
  releases. `npm run test:design` still fails only on preexisting findings in
  Blogs, Contact, Legal, and YouTube; it reports no Quran-page findings.
- The focused print test and the complete 12-test Quran browser suite both
  pass after the final print-only CSS adjustment.
- Remaining work is manual screen-reader/device/printer review, performance
  and range behavior against a user-selected data host, and resolution of the
  explicitly listed source gaps (commentary ranges, bibliography identity,
  unclear image rights, and unsupported canonical entities). External deploy
  readiness cannot be claimed without its host and transfer configuration.

## Local preview scope and route check — 2026-09-28

- The user clarified that external hosting is out of scope; local display is
  the current delivery target. D-057 records that reversible scope decision.
  The plan now treats remote hosting, transfer, cache, and SQLite range tests
  as deferred deployment work rather than current completion gates.
- An Astro development server was already running at `127.0.0.1:4321`. It
  returned HTTP 200 for the Quran landing page and all ten linked module
  routes, including Read & Compare, Variant Index, Relationships, Commentary,
  Intertexts and taxonomy, Manuscripts, Concordance, Analyses, and Methods &
  Data. The landing page and Read & Compare are open in the Codex browser for
  user inspection; the selected passage renders exact Cairo TEI text and its
  source-linked candidate records.
- Corrected the pipeline notes to identify `v0.5.26-cc-57cb2b7be321` as the
  current pointer rather than the superseded v0.5.25. Updated G-019 to mark
  external-host performance as deferred.
- Human review of screen-reader behavior, physical devices/printer, and the
  complete researcher journey remains open. Source-semantic and rights gaps
  stay recorded; excluding external hosting does not clear them.

## Local release refresh — 2026-09-28

- Rebuilt the local source manifest with acquisition time only when supported
  by the TEI checkout's Git clone reflog entry: `2026-09-27T22:39:00.000Z`.
  The pinned source remains commit `57cb2b7be321ecfba100cb5f7988974f47864a14`;
  the excluded Nasser, Studies-folder, and Shamela inputs remain absent.
- Rebuilt and verified the local SQLite release. It contains 18,000 variants,
  30,112 reader references, 870 reader authorities, 58 source authorities,
  31,294 Cairo lines, 154,864 tokens, and 34,163 candidates; SQLite integrity
  and foreign-key checks pass. All 3,240 TEI files in the checked schema pass.
- Reader analysis was rebuilt against the new database and its source/result
  hashes match. Immutable static release `v0.5.27-cc-57cb2b7be321` verifies all
  466 declared assets with zero errors; its manifest hash is
  `f7371de32985c8808c28d5daa2618020d9bdb56721fd10a5ed0d3cc5eefcd2d6`.
  The Methods & Data page now displays that active release ID, confirmed in the
  local production preview at `http://127.0.0.1:4322/projects/quran/methods/`.
- The production build passes after stopping the preview process that had held
  a Windows lock on `dist/client`; it verified 36 Quran release manifests,
  excluded 435 undeclared files, hardlinked 11,331 declared assets, and indexed
  258 pages / 31,728 words. The full 13-test Quran browser suite also passes.
- `npm run check` currently reports four unrelated TypeScript errors in
  `src/pages/contact.astro` and one existing unused-value hint in Blogs.
  `npm run test:design` reports preexisting findings in Blogs, Contact, Legal,
  and YouTube; it reports no Quran-page findings. `git diff --check` passes.
- After the build, the production preview restarted at
  `http://127.0.0.1:4322`; all ten Quran routes return HTTP 200, and the Methods
  page shows `v0.5.27-cc-57cb2b7be321`.
- The production preview is running locally at `http://127.0.0.1:4322` for
  inspection. Manual screen-reader/device/printer review and the recorded
  source-semantic and rights gaps remain open. Remote hosting remains deferred.

## Phase 0–6 release re-audit — 2026-09-28

- The strict static release verifier passed for
  `v0.5.27-cc-57cb2b7be321`: 466 declared assets, current Quran script hashes,
  source/license metadata, and prior-release manifest linkage; zero errors.
- Independent source-to-staging verification passed against the pinned TEI
  checkout: 18,000 variants, 30,112 reader references, 870 reader authorities,
  58 source authorities, 31,294 Cairo lines, 154,864 tokens, and 34,163
  candidate links; zero text, locator, authority, invalid-candidate, or
  duplicate-locator mismatches. SQLite integrity is `ok`; foreign-key errors:
  zero.
- Staging-to-release comparison passed for all 28 SQLite tables and 49,294
  search rows. The local release artifact remains 449,683,456 bytes with
  SHA-256 `b8137f47221fc3573775737d827f4999bf2f3b3389f495d4a658a415f2158aae`;
  zero errors.
- All 13 Quran browser checks pass against the production preview. Coverage
  includes narrow routes, accessible control names, no-JavaScript evidence,
  passage/reader-key round-trips, print source parity, unresolved bibliography
  handling, exact intertext links, and the Methods page release pointer.
- Inspected the production Read & Compare view for `verse-020-040`: its 34
  displayed word links expose individual Cairo TEI line locators, and its eight
  candidate-linked variant records expose their own TEI source lines while
  retaining the unreviewed candidate label and absent source-authority notice.
- Phase 0–6 implementation and local release gates are met for the pinned
  source and declared scope. Remaining completion gates are human review of
  the complete researcher journey and real screen-reader/device/printer
  behavior. Source facts not supplied by the pinned export—variant primary
  citations, commentary range semantics, local bibliography identity, and
  image rights—remain explicitly unresolved and disclosed. Closing those data
  questions requires authoritative source evidence; they are not silently
  inferred. External hosting remains outside this goal.
- Audited display-font rights for the site layout: the bundled Glacial
  Indifference files have their OFL 1.1 notice beside them; Poppins, Gentium
  Plus, Amiri, and Amiri Quran are listed as OFL in the official Google Fonts
  family metadata. Added a separate asset register and D-060; these fonts are
  not part of the Quran data release, and the dynamic Google Fonts response is
  not claimed to be byte-pinned.

## Source-layer rights scope — 2026-09-29

- Added a separate text-layer rights register after checking the pinned TEI
  README. It describes English, German, and French translations as part of
  `cairo_quran`, under the repository's CC BY-SA 4.0 statement; it does not
  provide translator names or per-layer terms. D-061 records that boundary,
  and G-008 now carries the unresolved attribution limit.
- The register keeps linked images outside the TEI data license. No image
  binaries are included in the active release.
- This documents the source evidence; it does not add a new translation
  package or change the release contents.

## Current local release verification — 2026-09-29

- `npm run check` passes with 0 errors, 0 warnings, and one existing Blogs
  unused-value hint. `npm run test:design` reports no Quran-page findings; it
  still fails on existing findings in Blogs, Contact, Legal, and YouTube.
- The first production build attempt found the running local preview holding
  `dist/client`. After stopping only the preview on port 4322, `npm run build`
  completed successfully: 36 Quran releases verified, 435 undeclared assets
  excluded, 11,331 declared assets hardlinked, and 258 pages / 31,728 words
  indexed by Pagefind.
- Restarted the preview on port 4322. All 11 Quran routes return HTTP 200,
  including Read & Compare at `verse-020-040`. The separate server on port
  4321 was left running.
- `git diff --check` passes. The local build and route checks verify the
  machine-run portion of the local goal. Full researcher-journey and actual
  screen-reader/physical-device/physical-printer review remain for human
  inspection; source facts absent from the pinned TEI remain disclosed in
  `KNOWN-GAPS.md`.

## Homepage module layout review — 2026-09-29

- Reviewed the production homepage after its scroll reveal. The existing
  project cards appear in the requested order: Hadith Corpus, Rijāl Register,
  Quran, Academic Studies. At a 1440px viewport they form two side-by-side
  pairs; at 390px they stack in the same order. All four card images load.
- The Quran card links to `/projects/quran/`; the same four cards are present
  on `/projects/`. This confirms the homepage and project-directory placement
  in the local production build.

## Translation release-boundary correction — 2026-09-29

- Reconciled `TranslationEdition` staging with the active static release note.
  English, German, and French source rows remain byte/text-faithful in private
  local staging, while the active static release and reader UI exclude their
  text. Updated the layer rights register and G-008 to mark those editions
  `needs_review` for redistribution, and added D-062 to preserve the boundary.
- A direct SQLite inspection confirmed 6,236 English, 6,350 German, and 6,236
  French rows (18,822 total), each linked to a source record and passage; all
  18,822 translator labels are null. The immutable v0.5.27 release note says
  translations are excluded, and its release directory has no translation-
  named assets.
- This is documentation of the existing release filter; it does not alter
  source data or rebuild the current release.

## Per-layer rights state and schema-v3 parity rebuild — 2026-09-29

- Added schema-v3 `rights_state` fields to Arabic/transcription and translation
  editions. The pinned Cairo layer is marked `identified`; English, German,
  and French translations are marked `needs_review`. The local parity
  SQLite metadata is explicitly `local_only_needs_review`.
- Rebuilt private staging at
  `scratch/quran/staging-coranicum-only-v5-2026-09-29/` from the hash-pinned
  TEI-only source manifest. All 3,240 XML files validate against the pinned
  TEI schema. The staging verifier reports zero source-text, locator, authority,
  token, candidate, rights-state, duplicate-locator, SQLite, or foreign-key
  errors; 18,822 translation rows retain exact source and passage links, with
  no inferred translator labels.
- Built the local-only SQLite parity release at
  `scratch/quran/release-coranicum-only-v8-2026-09-29/` (450,113,536 bytes;
  SHA-256 `88af2c641edc21cba50619d7e2257b4b2a4c9e881f2304395e15252035bb1ba2`).
  The release contains 49,294 search rows. Its independent staging/release
  comparison checked all 28 tables and 49,294 search rows with zero errors.
- Refreshed the immutable browser release to
  `v0.5.28-cc-57cb2b7be321`, preserving v0.5.27 and all current browser
  packages, excluding translation text, and recording current builder hashes.
  The release pointer now chains back to v0.5.27. The full asset/hash/coverage
  verifier and current Quran-script hash check pass with zero errors.

## Local build and preview verification — 2026-09-29

- `npm run check` passes with 0 errors and 0 warnings (one existing unused
  variable hint in `src/pages/blogs/index.astro`).
- `npm run build` passes after validating 37 Quran releases, excluding 435
  unmanifested release files, prerendering all Quran routes, and indexing 258
  pages / 31,728 words.
- `npm run test:design` exits 1 on 32 errors and 8 warnings in Blogs, Contact,
  Legal, YouTube, and shared article styles. It reports no Quran-page findings;
  these unrelated findings remain outside the Quran implementation scope.
- Restarted the local production preview at `http://127.0.0.1:4322`. The
  homepage, Projects directory, Quran landing page, Methods, Variants, and
  Read & Compare routes all return HTTP 200. The served release pointer is
  v0.5.28 and its manifest contains zero translation assets.

## Quran illustration source-neutral correction — 2026-09-29

- Visual inspection found that the prior decorative project art contained
  invented Arabic-like marks. Replaced both homepage and Projects references
  with `public/images/quran-variants-art-v2.webp`: a generated, source-neutral
  diagram using geometric bars and comparison links, with no writing or
  manuscript facsimile. The prior image was moved to ignored scratch storage
  for rollback and is excluded from the production build.
- Added the v2 image's generation method, SHA-256, local-preview scope, and
  unreviewed external-publication rights state to `ASSET-RIGHTS.md`. The
  illustration remains hidden from the evidence layer with empty alt text and
  `aria-hidden`; source strings and data records are unaffected.

## Final local-preview verification — 2026-09-29

- Rebuilt production output after moving the superseded pseudo-script image out
  of `public/`; `npm run build` completed successfully. The final Pagefind pass
  indexed 258 pages and 31,686 words.
- Re-ran `tests/quran.spec.ts` against the local production preview: 13/13
  passed. The final preview serves the replacement art as `image/webp` (HTTP
  200), returns 404 for the retired image, and returns HTTP 200 for the
  homepage, Projects directory, Quran landing page, Methods, Variants, and
  Read & Compare routes.
- The existing rendered layout audit covered 88 combinations (11 Quran routes,
  four widths, two themes) with no horizontal overflow. The contrast audit
  covered the same 11 routes in both themes with zero failures. Both were run
  after the replacement image references were installed; removing the unused
  retired image did not change rendered markup.
- Machine-verifiable implementation and local preview are ready. Remaining
  completion evidence requires human review of the full researcher journey,
  screen-reader behavior, a physical device, and printed output. Those checks
  need a reviewer with the relevant assistive technology and hardware; they
  are not asserted as passed by automated browser tests. External hosting is
  out of scope per the user.

## Live reader visual and accessibility-tree spot check — 2026-09-29

- Inspected the running local production page at
  `/projects/quran/read/?verse=verse-020-040` in the in-app browser. Its
  accessibility tree exposes one main landmark, labeled passage and reader
  selectors, named actions, passage/source links, and the exact Cairo source
  block. Candidate word links and the missing source-authority state are
  announced as such in the visible evidence.
- The visual spot check found the page hierarchy and explanatory caveat clear
  at the captured viewport. This browser accessibility-tree inspection is not
  a real screen-reader session and does not close the assistive-technology,
  physical-device, print, or complete user-journey reviews.

## Active release guide correction and Quran-only revalidation — 2026-09-29

- Audited the public `public/data/quran/README.md` against the root release
  pointer and found it still named v0.5.13 as current and listed obsolete graph
  totals. Rewrote the guide to match v0.5.28, its release notes, the pinned
  source commit, current coverage, and current rights/review boundaries. The
  immutable release assets and root pointer were not changed. Added D-064 to
  keep this guide aligned when the pointer advances.
- The strict static release verifier passed with current script hashes and
  verified all declared v0.5.28 asset hashes with zero errors. `npm run check`
  passed with 0 errors and 0 warnings (one existing Blogs hint). `npm run build`
  passed; it verified 37 immutable Quran releases, excluded 435 undeclared
  files, and indexed 258 pages / 31,686 words.
- The rebuilt preview serves the corrected guide at `/data/quran/README.md`
  (HTTP 200); it names v0.5.28 and contains no stale v0.5.13 claim. The active
  release pointer and all 11 Quran module routes return HTTP 200. The focused
  Quran browser suite passed 13/13.
- The design audit still reports errors only in non-Quran site pages and
  shared article styles. No such findings concern Quran routes; this turn
  makes no changes outside the Quran documentation and release guide.

## Phase 0–6 data-release re-audit — 2026-09-29

- **Phase 0 — met for the declared source scope:** rechecked the pinned
  Corpus Coranicum TEI source at `57cb2b7be321ecfba100cb5f7988974f47864a14`;
  the independent verifier read the source snapshot and checked all 3,240 XML
  files' extracted records. Nasser, Studies, and Shamela remain excluded by
  scope. Linked manuscript images remain absent; translation rows retain
  `needs_review` in local staging and are withheld from the browser release.
- **Phase 1 — met:** schema-v3 staging retains 18,000 variant assertions,
  30,112 direct reader references, 870 reader authorities, 58 source
  authorities, 31,294 Cairo lines, 154,864 tokens, 18,822 translation rows,
  and 34,163 candidate links. The independent verifier reports zero text,
  locator, authority, rights-state, duplicate-locator, SQLite, or foreign-key
  errors.
- **Phase 2 — met for the source-linked pilot, with a source limit:** each
  displayed pilot record links to its exact TEI source record and line. The
  export supplies no per-variant source key for any of its 18,000 records;
  those citations remain missing and are not invented. All 44 pilot word
  locators remain candidates, not verified equivalences.
- **Phase 3 — automated criteria met; human review remains:** the production
  preview serves all 11 Quran routes; the 13-test browser suite passes,
  including the passage/reader-key return journey and print-source parity.
  The contrast and 88-case viewport audits passed. The accessibility-tree
  spot check is not a substitute for a real screen-reader and user journey
  review on a physical device/printer.
- **Phase 4 — local release coverage met:** the verified active release
  reconciles all declared Cairo, variant, manuscript, commentary, intertext,
  taxonomy, and concordance packages to the pinned TEI scope. It preserves
  absent links as absent and publishes no manuscript images. External-host
  performance is outside the local-preview goal.
- **Phase 5 — reproducibility and provenance checks met within source
  semantics:** the graph and analyses retain exact source locators and
  candidate states; bibliography identities and commentary range semantics
  remain unresolved where the export does not establish them.
- **Phase 6 — local release met:** the 450,113,536-byte schema-v3 SQLite
  artifact matches staging across all 28 tables and 49,294 search rows with
  zero errors (SHA-256
  `88af2c641edc21cba50619d7e2257b4b2a4c9e881f2304395e15252035bb1ba2`). The
  browser release remains immutable v0.5.28 and the Quran modules run from the
  local production preview. Hosting is excluded by the user.
- The public release guide now identifies v0.5.28 and its actual limits. The
  repository-wide design lint has non-Quran findings; no unrelated page was
  changed. The remaining completion evidence is the user's real-device,
  assistive-technology, print, and full-journey review.

## Qirāʾāt source registry and Sura 1 pilot, 2026-09-29

- Registry of 60 Shamela books with roles, built from the index CSV; every book has stored pages in the parquet. Authority table for the ten qāriʾs and twenty riwāyāt; owner-supplied regions are unverified.
- Segmentation of Ibn Mujāhid, K. as-Sabʿa (book 5530): 106 sura sections and 1,245 numbered items, each with a quoted form; 1,222 carry a verse number printed by the book, not yet checked. The book skips five item numbers; each gap and stray is reported. An independent code review corrected an earlier undercount (44 sections, 915 items) and a raw-slice defect in the verifier.
- Sura 1 pilot: 51 claims from Ibn Mujāhid, al-Mabsūt, at-Taysīr, an-Nashr and Taḥbīr at-Taysīr over five features. All 51 evidence spans are exact substrings of the cited pages (diacritics and tatweel removed, whitespace runs read as one space). Resolved comparison in `qiraat/pilot-sura-001-matrix.md`.
- Results: mainstream readings agree across witnesses; disagreement is confined to route-level disputes (Khallād, Qunbul) and to Ibn Mujāhid's reports outside the ten. Vocalization of the source editions ranges from 1 to 83 marks per 100 letters.
- Limits: the claims were authored by reading and then verified mechanically; only segmentation and verification are automatic. Rule-based differences need a separate layer. Nothing has been reviewed by a person yet.

## Qirāʾāt display on the Quran page, 2026-09-29

- `/projects/quran/` replaced with the pilot display: passage with the differing words underlined, a reader index that filters the ledger, a by-position ledger and a table view, books cited, and a short guide to the marks. Data comes from `src/data/quran-qiraat-sura-001.json` (5 positions, 17 groups, 5 books, 51 claims).
- Verified: contrast 0 failures in both themes; `astro check` 0 errors; filter and view switching work with scripting disabled; no horizontal overflow at 390 and 320 px.
- Earlier tool routes are untouched and unlinked from the page, pending a decision (D-066). The display data embeds short Shamela quotations and is not cleared for deployment.

## Quran page redesign, 2026-09-29

- Rewrote `/projects/quran/` (D-067): collation matrix, cream passage leaf with numbered discs, colored reading cards with a proportion rail, book jackets, and a guide. The earlier ledger and table view are gone, along with the per-reader note elements and the view switch.
- Verified: contrast 0 failures in both themes; `astro check` 0 errors; design audit clean for the file; 4 display tests pass; reader focus works with scripting off; no overflow at 390 and 320 px. A scratch production build completes.
- Still open: the display data embeds short Shamela quotations and is not cleared for deployment (SOURCE-RIGHTS.md); the earlier tool routes remain unlinked (D-066).

## Reader colors and the transmission diagram, 2026-09-29

- Recolored `/projects/quran/` (D-068): ten reader hues with two shades each for the transmitters, reading letters A to D with a ring for departures from the Cairo text, group strips, neutral book jackets. Added a shared palette, `src/styles/qiraat.css`.
- Built `/projects/quran/transmission/`: a scrollable left-to-right diagram of 126 people and 219 links, a reader focus that shows one line, and a list of every link with its quoted sentence. Data pipeline: `verify-transmission-edges.py`, `merge-transmission.py`, `build-transmission-data.py`; merged links in `qiraat/transmission/edges.json`.
- Exported the five cited source books as individual JSON files for personal use (outside the repository).
- Verified: contrast 0 failures on both routes; `astro check` 0 errors; eight display and transmission tests pass; a scratch production build completes.
- Still open: nothing is reviewed by a person; the display data embeds Shamela quotations and is not cleared for deployment.

## Phase 2 gate and Phase 4 parts, 2026-09-29

- Phase 2 gate passed. All 40 items of pages 282 to 287 were read against their evidence sentences: no reader-assignment errors. The one item that looked doubtful (2:58, where Yaʿqūb falls under "the rest") is right: Taḥbīr names Yaʿqūb for the tāʾ reading only at 7:161 (p. 379).
- Extraction batch p303-307 added (27 items, verifier errors 0, gaps 0). Data now: 17 suras, 72 positions, 189 claims from pages 282 to 287 and 303 to 307.
- Three further batches were started and stopped before their agents finished their own read-through, so they are held out of the build in `scratch/quran/qiraat/held/`: p313-317 and p318-322 pass the verifier but are not read against the page; p323-327 has one verifier error (t325-02). Pages 288 to 302 and 308 to 312 are not extracted. Remaining work is done in the main session, not by sub agents.
- Long suras now open on an overview with a list of parts (D-069).

## Taḥbīr continuation through page 620, 2026-09-30

- Read all 923 units starting on pp. 431-620 in the main LLM session, including clean parser drafts. Added 13 durable review files and reviewed batches, with 1,026 items. There were 286 replacement decisions, 112 explicitly accepted exceptions, 131 explicit drops and 394 unflagged units confirmed after reading. No sub agents were used.
- Drops remain auditable in the review JSON: 82 rules/cross-references, ten route/model limitations, 37 fragments or statements consolidated into other entered items, and two non-farsh passages (a poem and a duplicate sentence). The new batches have 768 skipped spans, including replacement context and structural text; this number is not the number of omitted readings. Thirteen unresolved spans remain in seven new items. Qunbul's listing/report overlap at 89:9 is retained as unresolved, rather than relabeled disputed to pass a gate.
- Re-ran the entire chain. All 27 batches through p. 620 have zero quotation errors and zero coverage gaps. They contain 1,828 farsh items and 3,614 claims; with the five-position, 51-claim Sura 1 pilot, the display has 101 suras, 1,833 positions and 3,665 claims. The hub accounts for all 339 inclusive source pages. Page coverage includes recorded omissions and is not exhaustive Tier 1 content completion.
- Anchor audit: corrected eleven relocations, five in the continuation and six in older batches. The older corrections include the prefix-conditioned item at 2:74, the ya variants at 7:172, added من at 9:100, 12:96, 12:98 and the changed word at 14:2 following a locator at 14:1. Exact source quotations remain intact. Final farsh anchor counts: 1,682 agree, 77 weak, 69 none, zero moved. New-range counts: 929 agree, 43 weak and 54 none. `anchor_at_hint` records a reviewed source locator without inventing a Cairo word match (D-072).
- Replaced draft `form N` labels with the first four words of exact Arabic descriptions at verification, for compact and canonical items. Existing authored labels remain. Arabic labels and note fragments have language markup; the guide distinguishes source excerpts from English apparatus (D-071). Two edition-specific authority aliases stay in the verifier only, keeping parser segmentation and durable unit IDs frozen.
- Started the independent-witness audit: Taḥbīr pp. 611-620 against al-Mabsūṭ pp. 469-480, plus the edition problem at Taḥbīr p. 381 against al-Mabsūṭ p. 216. The 45 comparisons record 22 agreements, 14 differences or edition conflicts, eight partial and one not located in the passage read. All exact evidence and review notes are in `qiraat/second-witness/`; `queue.json` lists 1,783 remaining items and 23 attention records. No comparison becomes a site corroboration claim. Early routes are not automatically mapped onto later canonical transmitters.
- Site verification: eight hub/sura Playwright tests passed against the owner's dev server using a scratch configuration without the production-preview wrapper. A separate text-node and layout smoke check passed on 35 routes at both 320 and 390 px, including new source labels, unresolved entries and the corrected verse locations: no overflow, unmarked Arabic, empty reader cards, placeholder labels or page errors. Contrast passed in both themes for the hub, sura 2, its first part, sura 72 and sura 112. `npm run check` passed. The production build was run with `PUBLIC_CORPUS_BASE_URL=https://data.hadithcriticblog.com/` and `--outDir dist-check`; the wrapper now forwards that option and uses the selected directory for hardlinks and Pagefind, preserving the owner's `dist`.
- `npm run test:design` was run and failed on 32 existing errors outside this module: font-size floors and outline resets in the blog index, contact, legal and YouTube pages. No qirāʾāt file was reported. These unrelated pages were not modified by this continuation.
- The final scratch build's HTML counts, source labels and Pagefind output were checked. `dist-check` remains because automatic approval review rejected its cleanup with "blocked by policy". It is the continuation's build output, not the owner's `dist`.
- Still open: the deferred rules layer, route exceptions, unresolved reader terms, full Tier 2, human owner review and quotation rights. All site claims remain proposed. Nothing was deployed or committed.

## Qirāʾāt: the general rules and the deferred statements — 2026-09-30

- Entered pages 181 to 281 of Taḥbīr as 141 rules in 27 chapters (261 claims) on `/projects/quran/rules/`: the isti'ādha and basmala, the plural mīm and pronoun hāʾ, Abū ʿAmr's major idghām, the connecting hāʾ, madd, the hamza chapters, Warsh's naql, Abū ʿAmr's and Abū Jaʿfar's omission of the hamza, Ḥamza's and Hishām's stopping, silent-letter iẓhār and idghām, fatḥ and imāla, Warsh's rāʾ and lām, stopping on the ends of words and on the written form, and Ḥamza's silent pause. Every batch reports zero verifier errors and zero coverage gaps.
- Entered the farsh statements that earlier reviews had set aside: al-Bazzī's thirty-one tashdīd places (33 items), the further places of الرياح (12), and the disputed-branch statements for Hishām, Warsh, Ibn Wardān, Ibn Dhakwān, Shuʿba, Khallād, Qālūn and Qunbul. Two supplement batches (43 items) enter the verse-ending imāla of ten suras, the opening letters, the ينزل family, the paired questions with their per-place exceptions, المسيطرون, وامنتم and رأى.
- The full build now reports 103 suras, 1,930 positions and 3,927 claims (before: 101, 1,833, 3,665). Sura 92 and Sura 93 have their first positions.
- The hub says why 11 suras have no position, with the book's own words checked against the cached pages. A search of pp. 282 to 620 for every yāʾ and zawāʾid verb found all but two occurrences (both on a summary page) inside an item's evidence.
- Checks: `npm run check` 0 errors; 11 hub, sura and rules tests pass; contrast 0 failures on the hub and the rules page in both themes; no horizontal overflow at 320 px.
- Open: the permitted ways of beginning a word, a few second-level rules, the unread independent-witness queue, owner review and the rights ruling. Nothing is committed.

## Qirāʾāt: independent-witness comparison, 2026-09-30

- Wrote `witness-compare.py`: it matches Taḥbīr items to al-Mabsūṭ items and tests whether the same readers are grouped together. Result over the whole farsh: 661 agree, 200 differ, 144 partial, 391 yāʾ lists, 529 not located.
- Read all 200 differences by hand against the full al-Mabsūṭ item: 101 agree on the point compared, 85 genuinely differ, 7 address different aspects, 6 were matched to the wrong item, 1 unread. Forty-two differences are Yaʿqūb (Taḥbīr splits Rawḥ and Ruways, al-Mabsūṭ often does not) and 17 are Hishām against Ibn Dhakwān.
- Checked five of them against an-Nashr. It confirms that the printed Taḥbīr sentence leaves out al-Kisāʾī at 12:62, Ḥamza at 30:50 and Ḥafṣ at 41:47, and that it sides with Taḥbīr at 16:66 and 74:56. The site entries are not edited; the discrepancies are recorded in `second-witness/compare-read.json` (D-079).
- Nothing from al-Mabsūṭ or an-Nashr is promoted into claims. Open: the 144 partial results, a sample of agreements, the not-located items, owner review, rights. Nothing is committed.

## Qirāʾāt: permitted forms, identified names and second-level rules, 2026-09-30

- Added a `permitted` basis (D-081) and used it for the six ways of beginning الأولى at 53:50 and the sukūn of the ʿayn in نعما at 2:271. Permitted entries stay out of "the rest".
- Resolved 17 of 22 unresolved reader spans. Six misprinted or bare names (المكي, وعمرو, وأبو عمر, أبو ذكر, أبو عمر عن اليزيدي, the Naqqāsh report) are identified by a quotation from an-Nashr that the verifier finds on its page (`identified_by`); the pronoun-only Ruways at 4:36 uses a context reader. Five remain, each with a stated reason.
- Entered the second-level rules and sub-features the reviews had skipped: زكرياء before a hamza, أمهاتكم in four places, the doubling of the zāy in ينزل at 16:2, and the hamza realization in أأعجمي at 41:44.
- Compared the word inventory of an-Nashr with the entered positions (D-080): it treats the same words. Added `nashr-compare.py` (796 agree, 104 differ, 91 not located); reading its differences found a real misprint (ابن كثبر at 6:145, which had dropped Ibn Kathīr from the tāʾ group; fixed) and one more source discrepancy at 24:1.
- Reports on the sura page now name the transmitter when an entry is not for the whole qāriʾ.
- The full build reports 103 suras, 1,936 positions and 3,963 claims (before: 1,930 and 3,927); rules 142 in 28 chapters with 263 claims. `npm run check` 0 errors.
- Added an-Nashr as a second book (D-083): 438 items drafted by rule from the agreeing comparison, merged onto their Taḥbīr positions, zero verifier errors. The build reports 4,849 claims (3,963 before); 445 positions show two books. 355 agreeing items carry routes, several places or exceptions and are not entered.
- Added al-Mabsūṭ (383 items) and Ibn Mujāhid's Sabʿa (146 items) as further books on the positions where they agree and read by rule (D-084). 615 of 1,936 positions now carry two or more books. The Taysīr is not extracted because Taḥbīr contains it. All batches: 0 verifier errors; `npm run check` 0 errors; 30 quran Playwright tests pass; contrast 0 failures on the routes checked.
- Final counts of this pass (D-085): claims per book Taḥbīr 4,175, an-Nashr 883 (438 items), al-Mabsūṭ 775 (383 items, now including the partial comparisons), Sabʿa 310 (146 items); 652 of 1,936 positions carry two or more books. `second-witness/route-detail.json` holds the 1,888 passages no claim can carry, each with its exact text and page. `npm run check` 0 errors, 30 quran Playwright tests pass, contrast 0 failures on the routes checked.
- Route layer, first form (D-086): 341 quoted passages naming narrators below the twenty are attached to 312 positions and shown collapsed on the sura pages, marked as not entered as readings. New test for the block; 31 quran Playwright tests pass, `npm run check` 0 errors, contrast 0 failures on the routes checked.

## Hand-read route layer (D-087)

- Read all 341 route passages of `second-witness/route-detail.json` by hand and entered 448 route entries on 193 positions (`qiraat/routes/routes-a.json` to `routes-r.json`); `verify-routes.py` reports 0 errors.
- Build: 103 suras, 1,936 positions, 5,931 claims, 0 verification errors. `npm run check` 0 errors; `tests/quran.spec.ts` 33 tests pass (added a test for the route block at 18:16, repointed the route-notes test to 3:66); contrast passes in both themes for the hub, sura 18 part 1 and sura 3 part 1.
- Still open: five unresolved spans; the route passages whose form is unstated or whose antecedent lies outside the excerpt; owner review and the rights ruling on the Shamela quotations. Nothing is committed or cleared for deployment.

## Saba sura fix (D-088)

- The Sabʿa drafter now assigns suras 44 to 114 correctly and refuses forms that name another place. 163 items enter (24 on suras 44 to 114); build: 103 suras, 1,936 positions, 5,965 claims, 0 verification errors.
- Stopping point: the route layer (D-087) and the Sabʿa fix are built and verified; commit organization and push to `drafts` follow. Open work is unchanged: the al-Mabsūṭ multi-place and exception items, the 31 where a transmitter differs from Taḥbīr, the 54 Sabʿa items with no single Taḥbīr position, the five unresolved spans, and owner review and the rights ruling on the Shamela quotations.
