# Quran Platform Decisions

Decisions are conservative defaults for implementation. Each entry can be
revised when stronger source documentation or rights evidence is available.

## D-001 — Source separation and release rights

- **Decision:** Keep each source and derived layer separately attributable.
  The Corpus Coranicum TEI data is identified as CC BY-SA 4.0 in its README;
  give the project attribution and identify modifications. Check linked image
  rights separately. Keep the supplied Nasser export, Studies files, and
  Shamela CSV local and quarantined until origin and reuse terms are documented.
- **Reason:** The sources have different provenance, structure, and rights.
  Combining their text into one undifferentiated release would obscure those
  differences.
- **Review when:** Rights evidence or upstream documentation for a quarantined
  source becomes available.

## D-002 — Variant record granularity

- **Decision:** Preserve each source-native variant record as its own
  assertion, keyed by source snapshot, file, and native ID. Do not deduplicate
  equivalent-looking assertions across records or sources. Any grouped display
  is a derived view with explicit provenance.
- **Reason:** Similar strings do not establish identical reading, evidence,
  category, or transmission.

## D-003 — Translations are separate editions

- **Decision:** Model translations as named `TranslationEdition` records linked
  to a passage and source record. Never merge translation strings into Arabic
  source text or use them as variant readings.
- **Reason:** The TEI export includes multiple translations, each with its own
  edition and rights context.

## D-004 — Public corpus serving

- **Decision:** Keep the Quran data release separate and versioned. Use the
  site's static, browser-queryable data path; benchmark the actual dataset
  before committing to SQLite chunking or source-specific indexes. Do not add a
  request-time server database to the public corpus path.
- **Reason:** This follows the existing site's static corpus architecture while
  leaving room to choose a physical format based on measured workload.

## D-005 — Unmapped fields and missing locators

- **Decision:** Retain source values verbatim and leave unknown meanings and
  locators explicitly unresolved. Do not infer the meaning of Nasser `status`
  or `standard`, fill missing pages, or promote fuzzy matches to evidence.
- **Reason:** A plausible interpretation is not source documentation.

## D-006 — Corpus Coranicum authority key alias

- **Decision:** The allvariants file uses reader keys such as
  `variantreader_12`, while the reader authority file identifies the matching
  authority entry with `xml:id="variantsreader_12"`. The staging parser retains the
  original key and applies only the explicit, counted prefix alias
  `variantreader_` → `variantsreader_` to resolve the authority record. The
  source key is empty (`variantsource_`) in the imported variant records; no
  source citation is inferred from another field.
- **Reason:** This makes the repository's intended authority relation
  navigable without rewriting source values or inventing source attributions.
- **Review when:** Upstream documentation clarifies these key conventions or a
  newer export changes them.

## D-007 — Quran release publication target

- **Decision:** Keep the complete SQLite release and its local manifest under
  ignored `scratch/`. Give cleared CC BY-SA JSON assets immutable versioned
  paths in the site bundle; keep a small mutable pointer to the active release.
  The full SQLite artifact remains local until a Quran data destination is
  specified.
- **Reason:** The repository documents an existing Hadith corpus R2 host, but
  the user explicitly requires supplying the target, URL, and credentials and
  prohibits inferring them. Reusing that bucket or inventing a Quran object
  path would violate that constraint. The compact JSON release can be served
  as versioned site assets; the full SQLite artifact and its range-request
  test still require a supplied target.
- **Review when:** The user supplies the intended Quran data host or release
  target and access credentials.

## D-008 — Reader-key analysis meaning (superseded in part by D-040)

- **Decision:** Group exact source-listed TEI `<persName>` keys without
  normalization. Count distinct variant records and source label entries
  separately, list every member ID and source line, and keep records without a
  direct `<persName>` in an explicit null-key group. Link each authority only
  through the documented prefix alias. D-040 defines the schema-v2 relation
  and the compatibility limit of the legacy scalar columns.
- **Reason:** This makes each total reproducible without treating record
  counts as historical reading frequency, evidence weight, or a judgment about
  a transmitter. No text normalization or fuzzy matching is involved. The
  schema-v1 scalar-count method is historical; current analysis uses every
  direct `<persName>` relation row.
- **Review when:** The source supplies documented semantics for keys or a
  future analysis adds an explicit edition comparison.

## D-009 — Full variant browser delivery

- **Decision:** Publish the pinned 18,000-record CC variant set as a searchable
  catalog, two source-listed reader-reference indexes, a source-linked passage
  index, and immutable word-detail shards. Keep source record strings,
  labels, and locators exact. Load the reader indexes only when a reader
  requests full search; load word-detail shards only when a candidate panel is
  opened. Store repeated Cairo verse context once per verse ID within a shard
  and retain its exact text and source URL. The passage index provides reverse
  navigation for all candidate-linked verses.
- **Reason:** The full source index is 92,471,390 bytes. The searchable record
  catalog is 21,878,399 bytes; the two reader-reference indexes are
  11,637,927 and 14,786,002 bytes; the passage index is 19,316,281 bytes; and
  the 24 detail shards are each below 2.6 MB. Splitting keeps every individual
  asset under the 25 MiB static-asset limit, while delaying reader indexes and
  detail shards avoids transferring the whole source package on first render.
- **Review when:** Full-index browser measurements or a user-supplied Quran
  data host show that catalog search or the site bundle no longer meets the
  documented performance target. At that point, move queries to the existing
  static SQLite/range-request pattern; do not add a request-time corpus DB.

## D-010 — Explicit relationship graph states

- **Decision:** Store three distinct graph relation types: the TEI's explicit
  reader authority key (linked through the counted prefix alias), the
  mechanically matched variant-word/Cairo-token locator (candidate), and the
  commentary's explicit `ref[@type="koran"]` target (source-reported). Preserve
  native target strings, source lines, and source text. Do not expand ranges or
  convert commentary targets to Cairo passage IDs until the upstream grammar
  and mapping are documented and verified.
- **Reason:** The graph must make documented source links navigable without
  promoting locator coincidence to evidence or introducing numbering
  assumptions. Large relation types are stored in checksummed immutable
  shards and loaded by type.
- **Review when:** Corpus Coranicum documents the target grammar or a later
  pinned release changes its reference syntax or authority-key conventions.

## D-011 — Commentary text search scope

- **Decision:** Index non-empty `ab`, `bibl`, `cell`, `head`, `l`, `label`,
  `item`, and `p` elements under each commentary TEI `text/body`; preserve exact
  descendant text, direct attributes and `xml:lang`, source file hash, XPath,
  source line, and source URL. Publish one immutable shard per source file and
  load only the selected file in the browser. Keep all remaining TEI structures
  available through the source repository and describe the search as a selected
  text-block index, not a complete commentary apparatus.
- **Reason:** Block-level text supports useful search and citation navigation
  while retaining original TEI as the authority for nesting, inline markup,
  apparatus, and editorial structure. Per-file assets avoid forcing the reader
  to download the whole commentary collection for one query.
- **Evidence:** The pinned export has 85 commentary files. The adapter indexes
  37,358 non-empty blocks containing 5,852,294 exact UTF-8 text bytes; the
  largest shard is about 1.12 MB. Independent reconstruction reports zero
  mismatches. The manifest also reports element nodes not indexed as standalone
  blocks and whitespace-only selected nodes.
- **Review when:** The export's commentary TEI schema or source hierarchy
  changes, search must cross files in one query, or a range-query release
  becomes available and provides better whole-collection discovery.

## D-012 — Intertext source descriptions remain a separate collection

- **Decision:** Publish the 713 TEI `msDesc` records from
  `data/quran_intertexts` as source descriptions, separate from Quran
  manuscript descriptions. Index the source-document title, identifier,
  repository, summary, described work title/author, text-language statement,
  origin date/place statements, and bibliography entries. Preserve native IDs,
  exact text/attributes, file hashes, XPaths, source lines, and direct source
  links. Keep `categories.xml` out of this record index and disclose it as an
  unindexed source artifact.
- **Reason:** The collection contains descriptions of intertext records, not
  necessarily Quran manuscript witnesses. Keeping the records under their
  source collection label avoids asserting that each is a physical codex or a
  verified Quranic relationship. Model the separate taxonomy as its own
  source-anchored hierarchy.
- **Evidence:** The pinned collection contains 714 XML files: 713 files each
  contain one `msDesc`; `categories.xml` contains the taxonomy. The source
  taxonomy contains 122 categories, while the 713 record files contain zero
  explicit `catRef` elements. The record index has 713 unique native IDs and
  9,452 field values. Independent reconstruction from source TEI reports zero
  mismatches for both datasets.
- **Review when:** The pinned export adds explicit record-to-category links,
  collection semantics change, or the record structure changes.

## D-013 — Preserve intertext taxonomy without inferred record assignments

- **Decision:** Index all 122 `category` elements from the pinned
  `quran_intertexts/categories.xml`, preserving document order, literal parent
  hierarchy, IDs, attributes, exact `catDesc` text, source file hash, XPath,
  source line, and line URL. Display the hierarchy in its own searchable
  module. Do not assign taxonomy values to source records.
- **Reason:** The taxonomy source describes category names and nesting, but
  none of the 713 intertext TEI records contains a `catRef`. A record-to-term
  join would therefore be an inference without evidence.
- **Evidence:** Independent reconstruction checks all 122 categories, 16
  top-level entries, and 122 descriptions against the pinned XML with zero
  mismatches. The intertext record audit finds zero explicit category links.
- **Review when:** The source supplies `catRef` elements or changes the
  taxonomy hierarchy.

## D-014 — Preserve the concordance as source-native records

- **Decision:** Publish one browser shard for each of the 114 pinned
  `quran_concordance` TEI files. Preserve each `<w>` element as one source
  record, its exact attributes, source order, XPath, line, source URL, and its
  42 `<seg>` text values in the exact field order declared by `seg/@type`.
  Keep empty values empty. Preserve source-title text used by file navigation
  with its own title XPath, line, and line URL. Search only the selected source
  file.
- **Reason:** The source records are the authority for their boundaries and
  repeated analysis rows. Aggregating them into inferred unique words or
  interpreting undocumented field codes would introduce unsupported
  transformations. Ordered field arrays keep the release small while the
  source-native type list and independent source comparison preserve exact
  value-to-field correspondence.
- **Evidence:** The pinned TEI source contains 91,285 `<w>` elements and
  3,833,970 `<seg>` values across 114 files. Every record has the same 42
  source field types in the same order. The independent verifier compares all
  values, attributes, paths, lines, hashes, and aggregate counts against the
  source and reports zero errors.
- **Review when:** Corpus Coranicum changes the TEI structure, field order,
  source file set, or publishes authoritative documentation for field-code
  meanings. Until then, field type names and values remain uninterpreted.

## D-015 — Keep the complete Cairo text distinct from candidate variant links

- **Decision:** Publish every pinned Cairo `arabic_text` verse group as the
  base reader corpus, retaining exact `<l>` text, its XPath/line URL, and the
  containing `<lg>` verse locator/line URL separately. Retain each direct `<w>`
  token, native `xml:id`, exact text, attributes, XPath, line, and URL. Attach
  candidate variant links only where the existing source index supplies them;
  label those links candidate and unreviewed. An absent candidate link must not
  be rendered as evidence that no variant exists.
- **Reason:** The full Cairo text layer has 6,236 source verses while the
  candidate variant index links only 3,492. Its verse URL points to the
  containing `<lg>` element; the displayed text URL points to the `<l>`
  element. Keeping both makes each citation unambiguous and allows exact
  crosswalk verification without conflating record and text locators.
- **Evidence:** The independent source verifier reconstructs 6,236 verses and
  77,432 word tokens with zero errors. The candidate crosswalk compares all
  3,492 passage texts and all 34,163 candidate token texts/URLs against Cairo
  source records and reports zero errors and zero missing target URLs. Static
  release v0.5.3 verifies all 360 asset checksums with zero errors.
- **Review when:** The Cairo TEI structure changes, another explicitly
  identified Arabic edition is added, or candidate links complete human review.
  Until then, the Cairo text remains a separately attributed source layer and
  unlinked verses make no claim about variant coverage.

## D-016 — Preserve the commentary element tree beside searchable text blocks

- **Decision:** For every pinned commentary TEI file, publish every element
  below `text/body` as a distinct source record with its exact descendant
  character data (including empty and whitespace-only values), `xml:id`, direct
  `xml:lang`, every attribute, XPath, source line, and source URL. Keep the
  existing selected non-empty text-block view as a separate search scope.
  Ancestor and descendant records may contain repeated text; retain them as
  separate source elements and disclose that behavior instead of deduplicating.
- **Reason:** The original block scope hid source distinctions carried by TEI
  elements such as `app`, `lem`, `ref`, and inline markup. Indexing source nodes
  verbatim makes those distinctions available without assigning scholarly
  meaning to element names or flattening the hierarchy into a single record.
  The block view remains convenient for ordinary text search.
- **Evidence:** The pinned 85-file collection contains 94,443 element nodes
  under `text/body`. The independent verifier reconstructs each node's text,
  ID, language, attributes, path, line, and URL and compares the 37,358 block
  records separately; it reports zero errors. Release v0.5.5 verifies all 360
  release assets, commentary coverage, provenance hashes, and release-note
  hash with zero errors.
- **Review when:** The upstream TEI schema or source hierarchy changes, a
  whole-collection search backend replaces per-file shards, or the TEI header
  receives a dedicated source-anchored index. The current node browser covers
  `text/body`, not `teiHeader`.

## D-017 — Record immutable release lineage and build provenance

- **Decision:** Every static Quran release records a schema version, its prior
  release ID and manifest hash, release-note path and hash, base repository
  commit, working-tree cleanliness, and SHA-256 hashes for all Quran pipeline
  scripts. Set `buildCommit` only when the build tree is clean; otherwise leave
  it null rather than claiming the base commit produced the artifact.
- **Reason:** Reproducibility needs to identify both the source inputs and the
  exact transformation code. A dirty working tree cannot be represented by a
  commit ID, so the generator hashes its scripts and records the dirty state.
- **Evidence:** Release `v0.5.5-cc-57cb2b7be321` links to v0.5.4 by manifest
  hash, contains hashes for all 25 `scripts/quran` Python files, and hashes its
  release note. The independent static verifier checked all 360 assets and
  reported zero errors.
- **Review when:** Release tooling can capture a clean immutable source commit
  or when manifest schema and deployment provenance requirements change.

## D-018 — Index commentary headers as a separate source scope

- **Decision:** Keep the existing complete `text/body` element index and add
  every element from each pinned commentary file's `teiHeader` as a distinct
  source record. Preserve exact descendant text, native ID, direct language,
  all attributes, XPath, line, and source URL. Let readers search header and
  body elements separately, with an explicit option to include empty and
  whitespace-only elements.
- **Reason:** Header titles, editors, publication statements, and source
  descriptions are part of the supplied source and provide essential
  provenance. Combining them with commentary body records would blur their
  roles, so the UI and package retain a separate scope.
- **Evidence:** Independent reconstruction of the pinned 85 files matched all
  850 header elements and 94,443 body elements, with all 37,358 text-block
  records unchanged and zero verifier errors. Release
  `v0.5.6-cc-57cb2b7be321` verifies all 360 release assets with zero errors.
- **Review when:** The upstream adds/removes header elements, an authoritative
  header schema changes, or the index is expanded to include TEI root and
  `text` wrapper elements as explicit records.

## D-019 — Preserve every manuscript description element in lazy shards

- **Decision:** Keep the selected manuscript field index for collection-wide
  search and add every `msDesc` root/descendant element to a separately
  checksummed, per-record source-element package. Split 2,322 records into
  groups of 25 records per shard and load a shard only when a reader opens a
  manuscript's complete element view. Verify the shard byte size and SHA-256
  before rendering it.
- **Reason:** A seven-field catalogue is useful for discovery but omits source
  details such as folio descriptions, item titles, and element-level dating
  attributes. Publishing every source node avoids a guessed field taxonomy.
  The observed 100-record grouping approached the 25 MiB static-asset limit,
  so 25-record shards keep the largest request near 11.1 MB.
- **Evidence:** The independent verifier reconstructed all 192,295 elements
  from 2,322 source records, rechecked the 14,487 selected field values, and
  found zero mismatches. Release `v0.5.7-cc-57cb2b7be321` contains 93 lazy
  element shards; the full static-release verifier checks all 453 assets with
  zero errors.
- **Review when:** Source cardinality changes, observed transfer sizes change
  materially, or a searchable server/index service is authorized and needed.

## D-020 — Keep the pinned TEI export as the Corpus Coranicum data boundary

- **Decision:** Use `telota/corpus-coranicum-tei` at the recorded commit as the
  current redistributable Corpus Coranicum data source. Do not ingest data by
  scraping the live site, treating `corpus-coranicum-xml-raw-files` as a second
  published edition, or copying the website/editor application repositories.
  Track live-site records and media as separate candidate sources with their
  own IDs, versions, coverage, and rights review.
- **Reason:** The TEI repository identifies itself as the project’s TEI export,
  documents its data collections, provides a validation schema, and explicitly
  states CC BY-SA 4.0. The raw-files repository says it is a working copy and
  not the officially published TEI/XML edition. The organization describes
  its website/editor repositories as application code backed by website data
  and a database. The live site and repository also present different license
  statements, with no artifact-level scope mapping in the inspected material.
- **Evidence:** The pinned TEI README documents Cairo text and translations,
  commentary, concordance, intertexts, manuscripts, and variants. The current
  official site describes Manuscripta Coranica, Variae Lectiones Coranicae,
  Texts from the World of the Qur'an, and Commentary. The GitHub organization
  lists the TEI export, raw-files working copy, website, and editor
  repositories. References are recorded in the implementation plan and
  known-gap register.
- **Review when:** Corpus Coranicum supplies a versioned public data export
  with a documented record scope and rights mapping, or the TEI export
  publishes a new version or license statement.

## D-021 — Preserve source reader-key selection across passage navigation

- **Decision:** Let Read & Compare filter candidate records by the exact
  `readerNativeKey` value in the pinned variant catalog. Store the selected
  passage and reader key in the URL and carry both into Variant Index and back
  to the passage. Keep a distinct filter value for records whose source reader
  key is null. Label the control as a Corpus Coranicum reader-key filter; do
  not call its choices canonical traditions or equate them with other sources.
- **Reason:** The source has named reader keys and linked authority labels, but
  that does not establish a reviewed cross-source taxonomy. Exact-key filtering
  makes a useful comparison view while preserving native identity and keeping
  the unreviewed Cairo locator links in candidate state.
- **Evidence:** The complete variant catalog retains each exact reader key,
  label, and authority link. Browser review followed a reader-key-filtered
  passage into a variant record and back while preserving the verse and reader
  key query parameters; displayed candidate state remained unreviewed.
- **Review when:** An authoritative source mapping documents reader-key
  semantics or a curator-reviewed cross-source reader mapping is published.

## D-022 — Reuse the EVQ and Qiraat Explorer references as interaction models only

- **Decision:** Borrow navigation patterns from EVQ's passage-focused Reading
  View and separate advanced variant/principle tables, and from Qiraat
  Explorer's passage/readers selection, highlighted comparison, citation
  links, morphology view, and manuscript view. Do not copy their sample Quranic
  strings, alignments, variant labels, or scholarly claims into this dataset.
- **Reason:** EVQ's repository is a static front-end redesign with illustrative
  HTML examples. Qiraat Explorer's own README identifies its current bundled
  readings as an eight-verse, 53-reading curated sample with zero readings yet
  scholarly-confirmed. Those repositories can inform navigation and review
  workflow, but they are not an authoritative source for this site's data.
- **Evidence:** Inspected the EVQ repository's Reading View and advanced
  variant/principle pages and the Qiraat Explorer README. The upstream README
  explicitly separates its demo sample from its planned fuller data workflow.
- **Review when:** Either project publishes a separately versioned,
  source-cited data release with explicit reuse terms and review status.

## D-023 — Preserve all explicit TEI references without interpreting targets

- **Decision:** Preserve each Corpus Coranicum TEI `ref` outside the already
  represented commentary Quran-reference class as a source-native graph record.
  Retain its exact `xml:id`, `type`, visible text, `target`, all attributes,
  source-file hash, collection path, file ordinal, and source line. Keep the
  four references without a `target` in the verifier's missing-target
  inventory. Do not normalize targets, infer their referents, or merge records
  with the same URI. The browser may link a target only when its exact value is
  itself an HTTP(S) URI; the raw value remains visible.
- **Reason:** TEI `ref` records express source-declared relationships, but the
  export does not provide a complete target grammar or crosswalk to this
  platform's entity IDs. Exact indexing exposes source evidence while keeping
  unresolved semantics explicit.
- **Evidence:** Independent reconstruction from the pinned 3,240 XML files
  counted 30,940 `ref` elements: 15,977 `type="koran"` commentary references
  already represented by the specialized edge class, 14,959 other explicit
  references, and four references without `target`. The v2 graph verifier
  rebuilt 83,085 total edges with zero errors. Static release v0.5.9 passed
  verification for all 453 assets with zero errors.
- **Review when:** Corpus Coranicum documents the target grammar and stable
  entity mapping, or a later pinned export changes the reference inventory.

## D-024 — Audit all explicit TEI link constructs before graph coverage claims

- **Decision:** Count `ref`, `ptr`, `relation`, `link`, `linkGrp`,
  `listRelation`, `join`, `joinGrp`, and `anchor` elements across every pinned
  data XML file as part of relationship-graph verification. Include the exact
  counts in the graph manifest and make the verifier fail if they change from
  the audited pinned-source inventory. An `anchor` alone is not a relationship
  edge; do not infer a link from its ID or nearby text.
- **Reason:** A graph limited to `<ref>` would otherwise leave ambiguous
  whether the export expresses relationships through other TEI link elements.
  Recording zero counts makes the graph's source scope auditable and signals
  when a future export requires new extraction logic.
- **Evidence:** A strict parse of all 3,240 pinned data XML files found 30,940
  `ref`, zero `ptr`, `relation`, `link`, `linkGrp`, `listRelation`, `join`, or
  `joinGrp`, and four empty-text `anchor` elements. The independent graph
  verifier now reconstructs these counts and passes; no anchor was converted
  into an edge. Immutable release `v0.5.10-cc-57cb2b7be321` includes the
  expanded graph manifest and retains the previous release.
- **Review when:** Any audited construct count changes in a later pinned
  export, or Corpus Coranicum documents target semantics that support safe
  in-site resolution.

## D-025 — Reconcile the XML walk to the full pinned file inventory

- **Decision:** Before building or verifying the research graph, compare the
  actual XML file set under the pinned TEI `data/` directory with the exact
  `data/**/*.xml` paths in the SQLite source-artifact hash inventory. Require
  exactly 3,240 files and fail on any missing, added, or unregistered XML file.
- **Reason:** Per-file hash checks prove the bytes of files that were visited,
  but do not prove that the walk encountered every expected file. Exact set
  reconciliation closes that omission gap without changing any source data.
- **Evidence:** The pinned current tree contains 3,240 XML files and matches
  its source hash inventory exactly. The updated builder completed and the
  independent verifier rechecked all 83,085 edges with zero errors. Immutable
  release `v0.5.11-cc-57cb2b7be321` retains the earlier release and has a
  distinct manifest.
- **Review when:** A new TEI commit changes the file count or inventory;
  update the expected count only after auditing the new pinned snapshot.

## D-026 — Keep strict commentary target parses in candidate state

- **Decision:** For each exact commentary `ref[@type="koran"]` target, apply
  only the strict pattern `koran-SSS:VVV-SSS:VVV`, retain every original value,
  and emit an `unreviewed` navigation candidate only when both derived
  `verse-SSS-VVV` IDs exist exactly in the pinned Cairo XML ID set. Do not trim,
  normalize, or interpret other forms. Keep zero-endpoint, cross-surah,
  missing-ID, and reversed ranges unlinked. Provide separate candidate links
  to the start and end source IDs; never label them verified equivalences.
- **Reason:** Exact ID-set membership makes safe passage navigation useful,
  while the pinned README only documents that commentary references use
  `xml:id` and `target` attributes. It does not define the range syntax or
  endpoint semantics. The website exporter later supplied syntactic evidence
  about target construction (D-053), but it does not define range semantics;
  automatic promotion to a confirmed mapping remains unsupported.
- **Evidence:** Independent reconstruction of 15,977 Quran commentary refs
  found 13,719 exact two-endpoint matches, 2,224 zero-endpoint ranges, 18
  cross-surah ranges, seven ranges with an absent Cairo ID, and nine reversed
  ranges. The graph verifier reproduces each candidate row with exact source
  attributes, text, target, hash, global `ref[n]` locator, and line. It reports
  zero errors. The repository is pinned at
  `57cb2b7be321ecfba100cb5f7988974f47864a14`; its README describes the Cairo
  edition's unique surah, verse, and word IDs, but does not specify the target
  range format. Release `v0.5.13-cc-57cb2b7be321` exposes the candidates as a
  distinct graph type and UI filter.
- **Review when:** Corpus Coranicum documents target syntax/endpoint meaning,
  or a curator reviews the candidate list against the source.

## D-027 — Count reference locators across every `ref` in the source file

- **Decision:** In all relationship records, assign `#ref[n]` ordinals over
  the complete document's ordered `<ref>` sequence before filtering by type.
  Never count only matching reference types when naming a file-level ordinal.
- **Reason:** A filtered ordinal is not the Nth `<ref>` in the source XML and
  can point readers to the wrong element when other reference types precede it.
- **Evidence:** Updated the specialized commentary edge builder and
  independent verifier to enumerate all `<ref>` elements, then select
  `type="koran"`. Candidate and source-reference locators now use the same
  document-wide ordinal definition. The v0.5.12 graph reconstruction passed
  with zero locator or edge mismatches.
- **Review when:** A future locator format adopts XPath or source-native IDs;
  preserve this ordinal as historical navigation evidence.

## D-028 — Keep study-file metadata private and separate from source content

- **Decision:** Parse PDF document-info values, encryption state, and page
  counts, plus DOCX core properties, into a private ignored audit report tied
  to the exact user-supplied file hashes and rename-manifest rows. Do not
  extract page text, OCR, or images. Treat embedded properties and filenames
  as unverified discovery clues; do not use them to establish authorship,
  edition, publication history, or redistribution rights. Keep all 77 study
  files quarantined.
- **Reason:** A metadata-only inventory improves navigation and provenance
  review while avoiding public copying of source content and preserving the
  distinction between user labels, embedded metadata, and verified
  bibliographic facts.
- **Evidence:** The 78-file acquisition inventory reconciles to 77 mapped
  documents: 76 PDF files and one DOCX. The metadata-only audit finds valid
  PDF signatures and page counts for all 76 PDFs, parses DOCX core properties,
  reports zero warnings/errors, and confirms two byte-identical duplicate
  pairs without merging them. The output remains in ignored `scratch/`.
- **Review when:** An authoritative bibliography or rights statement is
  supplied, the source files or rename manifest change, or metadata fields are
  considered for public display.

## D-029 — Do not promote array positions or filenames to native IDs

- **Decision:** Leave `source_record.native_id` null when an input record has
  no source-native ID. Keep JSON array positions, CSV line numbers, filenames,
  and generated stable database keys in their own locator or platform-ID
  fields. Do not copy any of those values into `native_id` as a fallback.
- **Reason:** A convenient locator is not an identifier asserted by the
  source. Storing it as native identity would silently fill a missing value
  and could make later exports or cross-source joins look more certain than
  the evidence permits.
- **Evidence:** Updated the Nasser and Studies adapters, bumped the local
  parser to `quran-local-ingest/0.1.2`, rebuilt staging from the same pinned
  manifest, and independently compared all Nasser/Studies source records,
  hashes, locators, null/native IDs, and quarantine states. The current Nasser
  snapshot has no missing IDs; its 49,133 rows and three container records
  match exactly. All 77 Studies file/manifest rows match with null native IDs.
- **Review when:** A source version defines a native identifier that is
  documented and present in its own records.

## D-030 — Publish a new immutable release when recorded builders change

- **Decision:** When a builder or parser named in release provenance changes,
  publish a new immutable release and repoint the active Quran manifest, even
  when the licensed data assets are byte-identical. Preserve the older release
  and state clearly why the new release exists.
- **Reason:** Keeping generator hashes auditable is part of reproducing a
  release. Reusing a prior manifest after changing a recorded builder would
  leave the active release provenance stale; overwriting the prior manifest
  would break immutability.
- **Evidence:** Updating the local ingestion parser caused the independent
  verifier to reject v0.5.12 because its recorded `ingest-local-sources.py`
  hash no longer matched. Published v0.5.13 with refreshed builder hashes,
  preserved the v0.5.12 asset bytes and manifest, and moved the root pointer
  and Quran page loaders to v0.5.13.
- **Review when:** The release provenance model gains a separately versioned
  generator set or a future build changes data asset bytes.

## D-031 — Use the shared layout landmark as the only main element

- **Decision:** Quran page components use a non-landmark root wrapper because
  `BaseLayout` already supplies the document's `<main id="main-content">`.
  Keep one main landmark per page and preserve the component's class and
  layout styles on its wrapper.
- **Reason:** Nesting a second `<main>` inside the shared landmark creates an
  invalid and confusing landmark tree for assistive technology. The issue was
  not covered before Quran routes were added to browser review.
- **Evidence:** Chromium identified two main landmarks on Quran routes. Replaced
  the nested Quran component roots with `<div>` wrappers across the project;
  the new browser suite confirms one main landmark across all Quran routes, no
  horizontal overflow at 390px, Arabic `lang="ar"` / `dir="rtl"`, and candidate
  navigation that preserves passage and source reader key in both directions.
- **Review when:** The shared page layout changes its landmark structure.

## D-032 — Superseded: do not collapse Cairo TEI whitespace in display

- **Decision:** Superseded by D-036. The temporary CSS whitespace-collapsing
  presentation is not active.
- **Reason:** Although the exact source string remained in `textContent`, CSS
  changed its visible whitespace. That does not meet the plan's strict rule to
  display source text verbatim.
- **Evidence:** A print screenshot exposed how TEI indentation affects layout.
  The readability benefit did not justify changing the visible source form.
- **Review when:** Historical record only; use D-036 for current behavior.

## D-033 — Superseded: render Cairo TEI source only with original whitespace

- **Decision:** Superseded by D-036. The exact source string is the primary
  visible passage; a readable whitespace-normalized format may appear only as a
  separate, explicitly labeled derivative.
- **Reason:** Data fidelity rule 3 requires the displayed source text to remain
  verbatim. Equality of DOM `textContent` alone is insufficient if styling
  changes the visible source form.
- **Evidence:** A current print capture showed source indentation rendering as
  a narrow vertical word list. D-035 temporarily moved the derivative into
  the primary view; D-036 restored the source string there.
- **Review when:** Historical record only; use D-036 for current behavior.

## D-034 — Keep Corpus Coranicum bibliography keys unresolved until crosswalk

- **Decision:** Index each keyed TEI `<bibl>` as an exact
  `source_bibliographic_key_reference` edge. Preserve the key, visible citation
  text, attributes, file hash, line, and file-local source locator. Label the
  record as a source key whose bibliography record is unresolved; do not turn
  Zotero-like keys into external links or infer bibliography metadata.
- **Reason:** The pinned TEI snapshot contains 4,201 keyed bibliography
  elements and 770 distinct keys, but only 58 local `biblStruct/@xml:id`
  values and no key-to-ID matches. No bibliography crosswalk is present in the
  pinned export.
- **Evidence:** The graph builder and independent verifier reconstruct all
  4,201 citations from source TEI and report zero local matches. Release
  `v0.5.14-cc-57cb2b7be321` packages the edges alongside the source-key
  coverage counts.
- **Review when:** The source supplies a bibliography crosswalk or a separately
  reviewed authority identifies a specific key mapping.

## D-035 — Superseded: make normalized Cairo rendering the primary view

- **Decision:** Superseded by D-036. The exact TEI source string is the primary
  visible passage; a readable whitespace-normalized format may appear only as a
  separate, explicitly labeled derivative.
- **Reason:** TEI indentation can render as a vertical word list. The plan
  requires exact source retention and traceability, while a named, disclosed
  derivative can make passages readable without replacing the source string.
- **Evidence:** The current-state audit found the normalized view had become
  primary, contrary to fidelity rule 3. The implementation now restores the
  exact source view as primary and tests it against the active release shard.
- **Review when:** Historical record only; use D-036 for current behavior.

## D-036 — Keep verbatim Cairo TEI text as the primary passage display

- **Decision:** Render the exact Cairo Arabic character string, including TEI
  whitespace, in the primary passage view. A readable whitespace-normalized
  format may appear only as a separate, explicitly labeled derivative and may
  never replace or be called the source text. Preserve the source line link.
- **Reason:** Fidelity rule 3 requires displayed source text to remain verbatim
  and keeps normalized strings separate. Usability concerns do not authorize
  changing the source display.
- **Evidence:** Browser coverage compares the primary passage `textContent`
  with the exact text in the active release shard. The derivative has its own
  element and its transformation is checked separately. The source element
  also asserts CSS `white-space: pre-wrap` so character parity does not mask a
  visible whitespace change.
- **Review when:** A distinct rendering layer is added or TEI source encoding
  changes. Keep the exact view primary unless the user revises the rule.

## D-037 — Defer the complete Variant Index catalog until requested

- **Decision:** Keep the 12-record source-linked preview immediately available.
  Fetch the complete 18,000-record catalog when the visitor submits a search,
  follows a record fragment, or arrives with a search/filter URL. Preserve the
  complete-catalog download and full client-side search behavior.
- **Reason:** The v0.5.14 release manifest records the complete variant catalog
  at 21,427,833 bytes. Fetching it on every Variant Index visit makes preview
  browsing pay the full catalog transfer even when no search is requested.
- **Evidence:** The Chromium test verifies no catalog request on an unfiltered
  visit and exactly one request after search is submitted. Candidate record
  links with URL state still trigger the full catalog automatically.
- **Review when:** A deployed range-query backend or a new search index is
  supplied; compare first-render and search transfer before changing strategy.

## D-038 — Version the optional Cairo reading-format transform

- **Decision:** Label the separate readable rendering as
  `quran-whitespace-collapse/1.0.0`. Its operations are ECMAScript `\s+` to a
  single U+0020 space, followed by JavaScript `trim()` on the result. Keep the
  exact TEI string as the primary display and the input to this derivative.
- **Reason:** Fidelity rule 2 requires transformations to be named and
  reproducible; rule 3 forbids this derivative from replacing source text.
- **Evidence:** The interface shows the profile ID and operations, and browser
  coverage checks the profile ID and output against the exact active-release
  source text.
- **Review when:** The operation sequence or runtime semantics change; issue a
  new profile version instead of silently changing v1.0.0.

## D-039 — Preserve the canonical method on every Cairo locator candidate

- **Decision:** Store the exact SQLite `crosswalk.match_method` value on each
  candidate alignment and show it in the Variant Index and relationship graph.
  Keep each row's review state as `candidate`; the method explains how the
  locator was produced and does not establish reading equivalence.
- **Reason:** Candidate rows need reproducible provenance that can be traced
  to the source database without conflating a locator rule with scholarly
  validation.
- **Evidence:** All 34,163 candidate alignments are independently compared to
  the pinned release database by variant record and word ordinal. Method,
  review state, target word ID, target text, verse ID, and source locator match
  the canonical crosswalk rows. The immutable v0.5.16 release preserves the
  preceding v0.5.15 and v0.5.14 releases.
- **Review when:** The source crosswalk method or matching logic changes; retain
  prior method IDs in each immutable data release.

## D-040 — Preserve every source-listed variant `persName`

- **Decision:** Store one `variant_reader_reference` row for every direct
  `<persName>` child of each source variant `<item>`. Preserve ordinal, exact
  `@key`, exact label text, source record, and source line. Keep the older
  scalar reader fields only as compatibility summaries of the first listed
  entry; analyses, filters, graph edges, and displays use the complete relation.
  Call these TEI-listed labels/references and linked authority rows; do not
  assume every label denotes a person or confirms the associated variant.
- **Reason:** 18,000 variant records contain 30,112 direct entries; retaining
  only the first entry discarded 12,126 source statements and misrepresented
  multi-label records.
- **Evidence:** Schema-v2 staging and the CC-only release independently match
  all 30,112 XML entries by record, order, key, exact text, locator, and
  documented authority alias. The analysis recomputes all groups from source
  XML and SQLite. The browser package retains the full set in two catalog
  assets and all detail shards; immutable site release v0.5.21 preserves
  earlier releases.
- **Review when:** The TEI structure or reader-key alias changes. Rebuild and
  independently reconcile every entry before publishing a new release.

## D-041 — Aggregate reader-reference coverage across every index shard

- **Decision:** The catalog and release coverage field `readerReferenceCount`
  reports the sum of direct TEI `persName` entries across every reader-index
  shard. Each shard retains its own local count. Verify the catalog and release
  totals against the complete index contents.
- **Reason:** A builder bug copied the final shard's count (17,320) into the
  catalog total even though both shards contain 30,112 entries together. The
  wrong number propagated into the release coverage manifest.
- **Evidence:** The corrected package verifier compares the catalog total to
  the sum of packaged index entries; the static-release verifier compares the
  catalog and release totals to those same entries. Immutable release
  `v0.5.23-cc-57cb2b7be321` reports 30,112 and preserves `v0.5.21`.
- **Review when:** The number or partitioning of reader-index shards changes;
  continue calculating the aggregate from shard contents rather than a single
  shard.

## D-042 — Preserve the exact supplied source path as `missing`

- **Decision:** When a user has supplied an exact path and it is currently
  absent, record the source as `missing`, not `not_supplied`. Reserve
  `not_supplied` for an input that was never provided. A missing source gets a
  manifest snapshot but zero file artifacts or data rows.
- **Reason:** These states encode different acquisition histories. Keeping
  them distinct prevents a test fixture or stale manifest from replacing the
  user's declared source with an inferred substitute.
- **Evidence:** The canonical manifest records the supplied Shamela CSV path
  as `missing`; the independent quarantine verifier confirms the path is still
  absent and the source has zero staged artifacts. Nasser and Studies remain
  present, hash-pinned, exact-parsed, and quarantined.
- **Review when:** The user supplies a new exact Shamela path or the original
  file reappears. Create a new immutable manifest and rerun the row-level audit.
## D-043 — Limit the Nasser schema profile to structure, not interpretation

- **Decision:** A private profile may count exact JSON-pointer field paths,
  occurrence totals, and JSON types, but it must not include field values or
  assign meanings to names such as `status` or `standard`. Array indexes are
  represented by `/*`; object-key escaping follows JSON Pointer.
- **Reason:** Structural counts help reconcile and document the parser without
  turning undocumented codes into claims or exposing quarantined text.
- **Evidence:** The local report records source hashes and the three row counts
  (27,914 annotations, 14,983 variants, 6,236 verses). It confirms the
  source-specific Boolean/string/null shapes while retaining all Nasser rows
  in quarantined staging and none in the public release.
- **Review when:** An authoritative export schema or versioned codebook is
  supplied. Add semantic mappings only with source citation and review state.
## D-044 — Use EVQ and Qira'at Explorer as workflow references only

- **Decision:** Keep passage selection, source text, variant details, and source
  evidence as distinct interface areas. Keep citations and review state adjacent
  to each displayed difference. Reuse only these information-architecture ideas
  from the supplied [EVQ reading-view principles](https://github.com/artshumrc/evq-designs/blob/main/reading-view-principles.html),
  [EVQ reading view](https://github.com/artshumrc/evq-designs/blob/main/reading-view-varients.html),
  and [Qira'at Explorer](https://github.com/snesmaeili/qiraat-explorer).
  Do not import their sample readings, Arabic strings, or inferred links.
- **Reason:** These references demonstrate useful researcher workflows, but
  only our pinned Corpus Coranicum records support this release. The Qira'at
  Explorer README describes its eight-verse/53-reading set as curated sample
  data with zero scholarly-confirmed readings; that is a useful model for
  honest review labels, not a source dataset.
- **Evidence:** The current Quran routes provide passage selection, a source-
  linked reader, a separately searchable Variant Index, source locators, and
  explicit candidate states. Existing browser checks cover passage/reader-key
  round trips. No reference-project data is present in the source manifests.
- **Review when:** A new display mode is proposed or a source supplies a
  verified data crosswalk that supports additional reading filters or overlays.

## D-045 — Limit the active Quran platform goal to the pinned Corpus Coranicum work

- **Decision:** The active implementation goal covers the pinned Corpus
  Coranicum TEI source and Quran modules already built from it. Nasser JSON,
  Quran Studies files, and Shamela data are excluded from this goal; do not
  ingest or publish them as part of it.
- **Reason:** The user narrowed the goal to the other available Quran-platform
  work. This removes unresolved provenance and rights for those three inputs
  from the active completion criteria without changing the historical record.
- **Evidence:** Scope is stated in the implementation plan; G-001 through
  G-003 and G-012 are marked excluded, and private-source audit entries remain
  in the phase log for provenance history.
- **Review when:** The user explicitly brings one of those sources back into
  scope.

## D-046 — Record deliberately excluded inputs as `excluded_by_scope`

- **Decision:** A Corpus Coranicum-only manifest records the three previously
  supplied private inputs as `excluded_by_scope`, with zero files and no local
  paths. The ingester rejects paths for those source IDs and does not create
  their source snapshots or parse their contents. Keep `not_supplied` for an
  input that was never provided, and `missing` for a previously supplied path
  that is currently absent.
- **Reason:** This makes the active staging snapshot match the narrowed goal
  without rewriting acquisition history or implying that the files were never
  supplied.
- **Evidence:** Source manifest schema v3 and parser `quran-local-ingest/0.1.5`
  build the TEI-only staging snapshot; the independent staging and SQLite
  release verifiers pass with one source snapshot and zero rows from excluded
  inputs.
- **Review when:** The user explicitly reopens any excluded source.

## D-047 — Stage only manifest-declared Quran release assets for production

- **Decision:** Keep source release directories intact, but build the site's
  temporary production `publicDir` from each release's declared assets,
  release notes, and `release.json`. Reject a listed asset if its path, byte
  count, or SHA-256 does not match its manifest. Exclude unlisted files from
  the staged production tree.
- **Reason:** An incomplete, unreferenced v0.5.22 directory contains 435 files
  outside its 31-entry asset manifest. Copying `public/` wholesale makes those
  files directly deployable even though the active release pointer does not
  reference them. Manifest-filtered staging prevents that leak without
  deleting, moving, or changing the immutable source files.
- **Consequence:** Every production build validates and stages all 33 release
  directories. The v0.5.22 directory contributes its 31 manifest-listed
  assets, release notes, and manifest; the 435 unlisted files remain local and
  are absent from `dist/client`. Dev mode continues to serve `public/`
  directly.

## D-048 — Show official concordance labels beside native field types

- **Decision:** For each `seg/@type` with a one-to-one English label in the
  pinned Corpus Coranicum website interface, display that label beside the
  exact TEI type. Keep the raw type visible; leave fields without a matching
  locale key raw. Do not rewrite, normalize, or gloss any field value.
- **Evidence:** The official website repository at commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4` contains the English locale
  catalog and the TEI export's field mapping. It accounts for 37 of the 42
  types in the pinned TEI concordance. The five unmatched types are
  `word_number`, `analysis_number`, `analyse_prefix3`, `created_at`, and
  `updated_at`. The pinned English locale SHA-256 is
  `e1bd4fcc74cab1d85225fed03cb8d21403ada8aae137abd4f4e52b2b2397aab9`; the
  TEI export mapping SHA-256 is
  `dcc38ca984986033fb25ad3759aad54040bd228cd9efb7fdd60b826ade5a9343`.
- **Reason:** The official locale makes the concordance easier to navigate,
  while retaining the source type prevents the interface label from replacing
  the source's own field identity. `analyse_mortality` is labeled “modality”
  by the official English locale; both strings remain visible without an
  attempted correction.
- **Rights note:** This interface-label reference is separate from the TEI
  dataset license. The website repository identifies its source code as
  GPL-3.0; the TEI data remains attributed and licensed according to its own
  pinned repository metadata.

## D-049 — Include the named readable passage rendering in print

- **Decision:** Before printing Read & Compare, open the separately labeled
  `quran-whitespace-collapse/1.0.0` rendering so readers have a continuous
  Arabic passage view. Preserve the exact TEI string and source citations in
  the same print output. Restore the disclosure's prior open/closed state
  after printing.
- **Reason:** The exact TEI passage preserves source whitespace, which can
  produce a tall line-broken block in print. The existing named rendering
  improves reading without replacing or mutating the source string.
- **Evidence:** `tests/quran.spec.ts` verifies the print event opens the named
  rendering, the exact Arabic passage and citation links remain present, and
  the disclosure and screen layout restore after the print event.
- **Review when:** A human print review identifies a source-fidelity or
  pagination problem that cannot be addressed while retaining both views.

## D-050 — Refresh reader-analysis provenance in a new immutable release

- **Decision:** Keep the previous static release intact and publish a new
  release when the reader-count analysis is regenerated against the current
  audited SQLite artifact. Copy every unchanged asset byte-for-byte, replace
  only `reader-record-counts.json`, and advance the release pointer only after
  the complete new release verifies.
- **Reason:** Equal result rows do not make an old input hash current. The
  previous v0.5.24 analysis named SQLite hash
  `d69e65c6dbaa2dacd346f48670e7259c78a809d219761792f14c3cd1e7e39975`, while
  the active Corpus Coranicum-only SQLite artifact hashes to
  `2fc2aa251731821a70857ae4b6a8d596314594a3b188382d35ab671dfa457363`.
  The independent analysis verifier correctly rejected the old artifact.
- **Evidence:** Regenerated the analysis from the latter database and pinned
  TEI. Independent verification recomputed all 754 groups and 30,126 member
  rows, matched 18,000 variant records and 30,112 direct labels, and reported
  zero errors. Published `v0.5.25-cc-57cb2b7be321` with 466 declared assets;
  465 retain their prior bytes, and the new analysis asset records the current
  database hash. The full static-release verifier passed with zero errors.
- **Review when:** The SQLite release changes or the analysis calculation
  changes. Rebuild and verify the analysis before publishing another static
  release.

## D-051 — Link only structurally valid Zotero source keys

- **Decision:** Preserve every TEI bibliography key and citation verbatim.
  When and only when `@type` is exactly `zotero` and the key matches
  `^zotero-([A-Z0-9]{8})$`, expose an external Zotero item-key URL using the
  captured eight-character suffix and the pinned Corpus Coranicum website
  route. Keep the local bibliography record labeled unresolved and state that
  the external target's content has not been verified. Do not link the empty
  `zotero-` key or the malformed `zotero-R7C4TX` key.
- **Reason:** The pinned website code creates a Zotero `items/itemKey/` URL
  from `Zotero_Id_1`, extracts keys from that route, and queries a
  `zotero_bibliography.zotero_key` field defined as `varchar(8)`. This supports
  an exact source-key locator, not a bibliographic metadata import or verified
  equivalence to one of the TEI's local `biblStruct` records.
- **Evidence:** Website commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4`. Relevant source files and
  SHA-256 values: `backend/resources/xsl/zotero.xsl`
  `f46c56d709b9e0d32c78d458d565fdc449c609714c215450bfda021b3474a780`,
  `backend/config/cc_config.php`
  `47621826b023a567b690c2c0c801702d0e2ead8ca3689389e10398ebda3ab368`,
  `backend/app/Helpers/ZoteroToBibliography.php`
  `77f69c84467286d9cf50ca3e9d90839b0757ee7ba068a0559558c84874b1072c`,
  `backend/app/Models/ZoteroBibliography.php`
  `41828a5e597a238cf8fd235ad0b4d467e58472108945cda7be79932c4889b601`,
  and `documentation/corpuscoranicum.sql.nodata`
  `bcc81e8af9221987199a6965f3b223e83c17df242e2ad0a8ba01897ac2042772`.
  The pinned TEI has 4,201 keyed citation occurrences and 770 distinct keys;
  4,189 occurrences across 768 distinct keys match the exact form. The
  remaining 12 occurrences have two nonconforming keys. The website repository
  license is GPL-3.0; no website code or Zotero metadata is copied into the
  Quran data release.
- **Review when:** Corpus Coranicum publishes an authoritative bibliography
  crosswalk, the key convention changes, or external item resolution is
  proposed as more than a source-key URL.

## D-052 — Keep concordance fields raw when the locale mapping is indirect

- **Decision:** Preserve the five concordance source types
  `word_number`, `analysis_number`, `analyse_prefix3`, `created_at`, and
  `updated_at` without an English display label. Continue displaying their exact
  source codes and verbatim values. Do not treat a similarly named locale key
  as a one-to-one label unless the pinned source explicitly connects it to the
  TEI type.
- **Reason:** The pinned website's TEI generator maps the types to database
  fields (`word_no`, `analysis_no`, `prefix3`, `created_at`, `updated_at`),
  and the TEI template emits those exact type strings. The English locale has a
  `cprefix3` key with label `prefix 3`, but the source code inspected does not
  explicitly map `cprefix3` to the generated TEI type `analyse_prefix3`.
  Guessing that alias would turn a plausible match into a displayed
  interpretation. The other four types have no English locale key in this
  path.
- **Evidence:** Corpus Coranicum website/export commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4`. SHA-256:
  `backend/app/Console/Commands/TeiExportConcordanceCommand.php`
  `dcc38ca984986033fb25ad3759aad54040bd228cd9efb7fdd60b826ade5a9343`;
  `backend/resources/views/tei/concordance/sura.blade.php`
  `27b2cf91d591d097435bb9f1d2c7080fe705746da96ea40f28cc8b288d0d7cdb`;
  `backend/config/config_translations.php`
  `40db7a2d5253376a3b21a767dbf701474d53b37105cb3f4e30487ba502fe4a35`;
  and `frontend/src/i18n/database/en.json`
  `e1bd4fcc74cab1d85225fed03cb8d21403ada8aae137abd4f4e52b2b2397aab9`.
  No source values, TEI records, or release assets were changed.
- **Review when:** The pinned publisher documents a one-to-one localized label
  mapping for one of these exact TEI types.

## D-053 — Use commentary exporter code to explain syntax, not to verify ranges

- **Decision:** Document the publisher's target-generation rule as evidence
  about syntax: its XSLT constructs each TEI `ref/@target` from the source
  commentary `<q>` element's `@type`, `@versstart`, and `@versend` values.
  Keep Cairo-ID matches as `candidate`/`unreviewed` navigation links. Do not
  infer interval inclusion, verse-numbering equivalence, or scholarly
  interpretation from target construction alone.
- **Reason:** The TEI repository README says commentary references use `xml:id`
  and `target`, and that Cairo verse IDs are unique, but does not define target
  grammar or range semantics. The official website/export code corroborates
  the observed syntax and Cairo ID pattern. It does not define whether the
  range is inclusive or how a reader should interpret its endpoints. The
  website commit predates the pinned TEI repository's initial commit by 17
  days, which is close evidence of the corresponding export process but not a
  same-commit provenance link; the candidate state remains the conservative
  one.
- **Evidence:** Website repository remote is
  `https://github.com/telota/corpus-coranicum-website.git`, commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4` (2024-12-03); pinned TEI commit is
  `57cb2b7be321ecfba100cb5f7988974f47864a14` (2024-12-20). SHA-256:
  `backend/resources/xsl/tei/kommentar.xsl`
  `1acf7551a7de4e85fd6868d79de90acbce5fe9d50cce4545e7b55ac3730e7513`;
  `backend/app/Console/Commands/TeiExportCommentaryCommand.php`
  `cfa4eb23c24992493898943eea1feba2fc3ea6ec1f1aa78e422f5d3a048dc2e`;
  `backend/resources/views/tei/cairo/all.blade.php`
  `984095ae3a4c8fc1d56dee31509529c6d5202829e76a94fc6c17343d78f62989`.
  The matching-release independent graph verifier reproduces 13,719 candidate
  range edges and reports zero errors. UI wording and gap register now explain
  this evidence while preserving candidate state; no source data or graph
  assets changed.
- **Review when:** Corpus Coranicum publishes range inclusion/numbering
  semantics, or an explicitly recorded human review supports a narrower
  interpretation.

## D-054 — Resolve only publisher-coded `#TUK` targets to exact intertexts

- **Decision:** Extend the research-graph builder with a separate target
  crosswalk only for exact `#TUK` plus decimal-digit targets. Reproduce the
  pinned publisher behavior: remove the `#TUK` prefix, parse the remaining
  digits as a base-10 integer, then form `tuk_{integer}`. Add a local-record
  link only if that exact `xml:id` exists uniquely in the pinned intertext
  catalogue. Preserve the original target unchanged and record the transform
  and destination source locator separately. Keep absent IDs and malformed
  values raw and unlinked. Present a resolved target as a source-reported
  cross-reference, not as independent validation of either record's content.
- **Reason:** The pinned website's commentary renderer turns `#TUK...` into an
  intertext ID, and its UI parses the digits with `parseInt(..., 10)`. The TEI
  intertext export generates the corresponding `msDesc/@xml:id` as `tuk_` plus
  its source database ID. This is an explicit publisher mapping, unlike a
  fuzzy title or text match. Exact existence and uniqueness in the pinned
  local catalogue are still required; unmatched targets must not be guessed.
- **Evidence:** Website commit
  `27a4fb359218a8c23bbca92b12d76b8516749bb4`. SHA-256:
  `backend/resources/xsl/flowtext.xsl`
  `216742d1b21ff70046b8e0ecbf613ee4a7d03c371306dd5b6056b3fe41af91b0`;
  `frontend/src/components/commentary/linker.ts`
  `cdb76721b985bd95c554a11dc33eb25bf7452f3ecd484a1c4b2cf215f9d46f59`;
  `backend/resources/views/tei/intertexts/all.blade.php`
  `ee8bc020b362a57d9b87dd04fef2a0a3c8fd33a6fb3a42bd0a2cc81c36678989`.
  An independent read-only comparison found 183 `#TUK` reference occurrences:
  146 resolve through the publisher transform to 100 unique IDs among the
  713 unique pinned intertext record IDs; 36 numeric targets are absent and
  one target has no digits. The v5 graph builder and independent verifier now
  reproduce that transform from pinned XML; the verifier reports zero errors.
  Resolved edges retain `targetExact` and add a separate destination locator,
  source hash, and transform ID. The Relationship Index links only those
  resolved records; unmatched references stay raw and unlinked. Release
  v0.5.26 contains the graph and exact `tuk_909` deep-record filter.
- **Review when:** The publisher changes its `#TUK` handler, a later TEI
  release changes intertext IDs, or the independent crosswalk finds any
  non-unique destination.

## D-055 — Hardlink immutable Quran releases into production output

- **Decision:** Validate every release manifest, file length, and checksum;
  omit undeclared files; then hardlink manifest-declared release files into
  `dist/client` after Astro builds. Require source and output to be on the same
  volume and do not fall back to a second 11+ GiB copy.
- **Reason:** Copying all immutable releases into a temporary public directory
  exhausted the workspace volume. Hardlinks preserve the exact file bytes in
  the production tree while avoiding a second physical copy on this build
  host.
- **Evidence:** `scripts/build-site.mjs` verified 34 release manifests, omitted
  435 undeclared v0.5.22 files, and hardlinked 10,395 declared assets into
  `dist/client`. An independent comparison confirmed all 10,395 outputs are
  same-file hardlinks with zero checksum or size mismatches. The build indexed
  258 pages and 31,684 words.
- **Review when:** The deployment build uses another volume, release assets
  become mutable, or the production host consumes output through a process
  that does not preserve hardlinked file bytes.

## D-056 — Compact print typography without normalizing source text

- **Decision:** Use print-only compact typography for the exact TEI Cairo text
  block while preserving its original string, whitespace, and `pre-wrap`
  rendering. Keep the separately labeled readable format available below it.
- **Reason:** The source-faithful block retained indentation and line breaks
  that made the printout disproportionately tall. Typography can improve
  printed legibility without rewriting the source representation.
- **Evidence:** `Read & Compare print view keeps the selected source passage
  and its citations` passed after the CSS change. The generated print review
  image was visually inspected; the exact source block remains present and
  the readable format remains separately labeled.
- **Review when:** A source change affects the Cairo text string or whitespace,
  or physical-printer review identifies a legibility problem.

## D-057 — Use the local preview as the current release target

- **Decision:** Treat the locally served Quran modules and manifest-verified
  static JSON release as the current delivery target. Defer external hosting,
  remote transfer/cache measurement, and SQLite range-request deployment work.
- **Reason:** The user wants to inspect the experience locally and explicitly
  removed hosting from the current task. The local app already reads the
  versioned static package; the large SQLite artifact can remain a local audit
  source without adding a server or deployment dependency.
- **Evidence:** The running Astro server returns HTTP 200 for `/projects/quran`
  and all ten linked Quran module routes. The `v0.5.27` release manifest
  remains the local app pointer. External host behavior has not been tested.
- **Review when:** The user asks to deploy or evaluates an identified host.

## D-058 — Record repository acquisition only from Git evidence

- **Decision:** Add an `acquiredAt` value to the TEI source manifest only when
  the repository reflog contains a `clone:` event. Preserve the event's ISO
  timestamp and its exact reflog source in the manifest, then copy that value
  into `source_snapshot.acquired_at`. Leave the field null if no clone event
  proves a timestamp. Keep manifest creation time separate.
- **Reason:** The data-fidelity rule requires acquisition time, while an
  arbitrary manifest-generation timestamp does not prove when the repository
  was acquired. The clone reflog provides a concrete, reproducible timestamp
  without editing the pinned source snapshot.
- **Evidence:** The pinned TEI checkout reflog contains
  `clone: from https://github.com/telota/corpus-coranicum-tei.git` at
  `2026-09-27T22:39:00Z`. The generated scope manifest contains that timestamp,
  the exact commit, and a separate manifest `createdAt` value. New staging v4
  and SQLite release v7 record it; source/SQLite parity checks pass. Local
  static release v0.5.27 binds reader analysis to the new database hash.
- **Review when:** The source repository is reacquired, or the manifest builder
  is used with a checkout that has no trustworthy clone reflog entry.

## D-059 — Verify historical release provenance without comparing it to current code

- **Decision:** By default, validate the stored script-hash map and its
  canonical tree hash without requiring an immutable release's builder files
  to match the current checkout. Require `--check-current-script-hashes` when
  verifying a release immediately after building it.
- **Reason:** A valid historical release keeps its original builder hashes
  after later code changes. Comparing those hashes with today's working tree
  falsely rejected v0.5.26 and prevented a new version from being assembled.
  Asset checksums, source/license metadata, previous-release linkage, and
  source-derived coverage checks remain active for historical and current
  releases.
- **Evidence:** v0.5.26 passes the default verifier with zero errors after the
  parser update. The v0.5.27 refresh ran the strict current-script check and
  verified all 466 declared assets, with zero errors.
- **Review when:** Quran build provenance begins retaining the actual builder
  code as an immutable artifact, or the verification scope changes.

## D-060 — Track display-font rights outside the Quran data license

- **Decision:** Keep site typography rights in a separate asset register.
  Treat the Corpus Coranicum CC BY-SA 4.0 record as applying to its data, not
  to fonts or manuscript images. Record the bundled Glacial Indifference OFL
  notice and the OFL metadata for the four Google Fonts families used by the
  shared layout. Do not add those fonts to Quran data-release manifests.
- **Reason:** Presentation fonts and source datasets have different origins,
  licenses, and update cycles. Mixing them into the Quran data license would
  misstate the scope of both. The local Google Fonts API reference does not
  pin the exact font binaries, so rendering bytes are not claimed as
  reproducible release inputs.
- **Evidence:** `docs/research/quran-platform/ASSET-RIGHTS.md` identifies the
  bundled license file, layout reference, Google Fonts family metadata, and
  upstream commits checked on 2026-09-28. The active Quran asset manifest
  contains no font binaries.
- **Review when:** The Google Fonts API reference changes, a font binary is
  self-hosted, or the project requires byte-identical rendering across
  releases.

## D-061 — Record translation rights at the TEI dataset level

- **Decision:** Treat English, German, and French translation layers named in
  the pinned Cairo TEI README as part of the TEI repository's dataset-level
  CC BY-SA 4.0 statement. Do not invent translator names or claim separate
  translator-level rights clearance. Keep linked manuscript images outside
  that statement and out of the release unless their own rights are checked.
- **Reason:** The pinned README's Licence section states CC BY-SA 4.0 for the
  TEI data repository, and its dataset summary explicitly says the Cairo
  dataset includes those translation layers. It supplies no translator labels
  or per-language terms. Preserve the upstream dataset-level claim and state
  what it does not establish.
- **Evidence:** `scratch/quran/corpus-coranicum-tei/README.md` at commit
  `57cb2b7be321ecfba100cb5f7988974f47864a14`; the layer-by-layer record is in
  `docs/research/quran-platform/SOURCE-RIGHTS.md`.
- **Review when:** The source adds translator identities or layer-specific
  rights, or a new translation source is proposed.

## D-062 — Withhold translation text from the static release pending layer review

- **Decision:** Keep the exact English, German, and French translation rows in
  private local staging as separate `TranslationEdition` records, but mark
  each row's `rights_state` as `needs_review` in schema v3, and exclude their
  text from the active immutable static release and reader UI. Mark the local
  SQLite parity artifact `local_only_needs_review`. Do not remove or alter the
  staging source values.
- **Reason:** The pinned README asserts CC BY-SA 4.0 for the TEI repository and
  lists translations in the Cairo dataset, but gives no translator names,
  source-work identities, or layer-specific terms. The current release note
  explicitly excludes translations. Keeping the staging records preserves
  source fidelity while withholding material until the layer-specific rights
  and attribution scope is established.
- **Evidence:** `scripts/quran/prepare-static-release.py` writes “No ...
  translations ... content is included”; the active release is built by that
  script. Staging retains translation editions through
  `scripts/quran/ingest-local-sources.py`; schema v3 carries the per-row state
  and the local release verifier checks it in both staging and SQLite. See
  `docs/research/quran-platform/SOURCE-RIGHTS.md` and G-008.
- **Review when:** An authoritative translation-level rights/attribution
  statement is available and the release scope is intentionally updated.

## D-063 — Use source-neutral art for the Quran project card

- **Decision:** Use a generated diagram of abstract comparison bars and links
  for the homepage and Projects card. Do not use generated script-like marks or
  an unlicensed manuscript image to illustrate source variation.
- **Reason:** The card needs a brand-matched visual cue for variant comparison,
  while every Quranic or manuscript source string/image must remain traceable
  to an identified source and rights record. Abstract bars communicate
  difference without resembling a textual witness.
- **Evidence:** `public/images/quran-variants-art-v2.webp` contains geometric
  rows and gold links only; `docs/research/quran-platform/ASSET-RIGHTS.md`
  records its generated origin, hash, and local-only rights boundary. Both UI
  references mark the image decorative; no text or record is derived from it.
- **Review when:** A sourced, rights-cleared project image is available or the
  user requests a different visual direction.

## D-064 — Derive the public release guide from the active release pointer

- **Decision:** Keep `public/data/quran/README.md` as a concise guide to the
  active release, and verify its release ID and coverage against the root
  manifest and that release's notes. Do not leave an earlier release described
  as current after the pointer advances.
- **Reason:** A stale public guide said v0.5.13 was active while the root
  pointer selected v0.5.28, and it showed old graph totals. That mismatch
  could send readers to outdated documentation even when asset hashes and the
  browser package were correct.
- **Evidence:** Root pointer
  `public/data/quran/manifest.json` selects
  `v0.5.28-cc-57cb2b7be321` with manifest SHA-256
  `5761c5497296c0da3a6169f2acde0b30e3a428555b370b7b2f474f7708f48127`;
  its release notes give current scope and counts. The rebuilt local preview
  serves the updated README with v0.5.28 and no v0.5.13 reference.
- **Review when:** The root active-release pointer changes.

## D-065: Open a separate qirāʾāt track from local Shamela texts

- **Decision:** Add a research track for the ten qirāʾāt and their twenty riwāyāt, sourced from Arabic classical texts in the user's local Maktaba Shamela export (index CSV plus merged parquet). The track is separate from the pinned Corpus Coranicum release: it writes nothing under `public/data/quran/releases/`, and no Shamela page text is redistributed. Shamela is therefore no longer wholly outside scope. Nasser and the Studies folder remain outside; Nasser is a design reference only. Corpus Coranicum is kept for manuscript content.
- **Reason:** Corpus Coranicum's 18,000 variants are Latin transliteration only (34,172 empty `<w xml:lang="ara"/>` slots, and the live API has none either), and the underlying source of every record is empty in the TEI. The ten qirāʾāt are a required layer, and the Shamela corpus holds the classical works that state them.
- **Evidence:** `docs/research/quran-platform/qiraat/` holds a 60-book source registry (all present in the parquet), the authority table, and 51 Sura 1 claims from five witnesses whose evidence spans all verify as exact substrings of the cited pages. See `qiraat/PILOT-SURA-001.md`.
- **Rules carried over:** exact source strings only; no generated Arabic; every reading carries a page locator and stays `proposed` until a person reviews it; qari-level expansion and "the rest" resolution are labeled as inference; no grading of readings.
- **Review when:** Any qirāʾāt data is proposed for the public release, or the rights of the Shamela editions are assessed (see `SOURCE-RIGHTS.md`).

## D-066: Make the Quran project page the qirāʾāt display

- **Decision:** `/projects/quran/` now renders the qirāʾāt pilot (Sura 1) instead of the Corpus Coranicum overview and its list of eleven tool links. The page is built from `src/data/quran-qiraat-sura-001.json`, which `scripts/quran/qiraat/build-display-data.py` generates from the verified claims. The earlier tool routes under `/projects/quran/` (read, variants, relationships, concordance, commentary, intertexts, manuscripts, analyses, methods) are not deleted and are no longer linked from the page.
- **Reason:** The owner asked to see the intended display first and to drop the earlier page content. The earlier routes may still be wanted (Corpus Coranicum is kept for manuscripts), so they stay reachable by URL until the owner decides what to retire.
- **Design choices:** Filtering by reader and switching between the by-position ledger and the table are native radio inputs plus `:has()` rules, so both work with scripting off. The page ships no script of its own. Each reading shows its written forms with book and page, the readers who share it, and every book that gives it, with the quoted text one click away. Inference is labeled where it happens ("names the qāriʾ", "says the others"). A disagreement between books is shown as a disagreement, and a report or rejected attribution is kept apart from what a book lists.
- **Evidence:** Contrast check on the route, both themes, 0 failures. `astro check` 0 errors. Design audit has no findings in the new files (its existing findings are in other pages). Checked at 1280, 390 and 320 px: one main landmark, no overflow, no unnamed controls, all Arabic marked `lang="ar"`.
- **Rights:** The generated data file embeds about fifty short quotations from Shamela editions. Treat it as `needs_review` (see `SOURCE-RIGHTS.md`) and do not deploy or publish the page until that review is done.
- **Review when:** The owner decides whether to retire or relink the earlier tool routes, or the display is proposed for a public release.

## D-067: Rebuild the Quran page around a collation matrix

- **Decision:** Replace the by-position ledger and table view with a collation matrix (20 transmitters by 5 positions) as the page's main component, followed by position blocks made of colored reading cards. The passage becomes a cream leaf with numbered discs, and reader focus moves to a sticky dock of chips. The masthead plate carries a mosaic of the same matrix in miniature.
- **Reason:** The owner found the first display dated and too plain. The matrix answers the question the display exists for, which transmitters read what and which books say so, in one look, and it takes its structure and color from the Resources and Academic Studies pages.
- **Color rules:** Fixed jewel tones, the same in both themes. Teal always marks the reading that includes Ḥafṣ (the Cairo text). Other tones are handed out inside one position and mean nothing across positions, so no color signals better or worse. Hatched parchment means the books differ, dashed means reported only, dotted means not stated. The book jackets use their own hues in a separate section.
- **Dots:** One dot per book in a fixed order. Round means the book lists the reading, square means it reports it, a ring means it is silent. Shape carries the state, not color.
- **Focus:** A chosen reader gets a gold ring on his matrix rows and the cards that exclude him are hidden. It is native radios plus `:has()`, with no script on the page. An earlier version dimmed other rows to 28% opacity; that would have failed contrast, so it was replaced.
- **Data:** `build-display-data.py` now writes per-transmitter cells (group, per-book marks), a tone per reading group, short labels from the claims, book marks, and a transmitter roster. Short labels live in `claims/sura-001.json` under each feature's `short`; book marks live in `source-roles.json`.
- **Evidence:** Contrast check 0 failures in both themes; `astro check` 0 errors; no design-audit findings in the file; four display tests pass, including reader focus with scripting off; no overflow at 390 and 320 px.
- **Review when:** More suras are added (the matrix has one column per position and will need paging or grouping), or the owner rules on the earlier tool routes (D-066).

## D-068: Color by reader, and a transmission diagram from an-Nashr

- **Decision:** On `/projects/quran/`, color now means the reader. Each of the ten qāriʾs has one hue, and his two transmitters wear its deeper and lighter shades (`src/styles/qiraat.css`). The reading at a position is carried by a letter (A is the reading that includes Ḥafṣ, the Cairo text) and a ring on any reading other than A, not by color. A new page, `/projects/quran/transmission/`, draws the chains from the Prophet down to the ten readers and twenty transmitters, and the Quran page links to it from its masthead.
- **Reason:** The owner found the earlier per-reading colors arbitrary and asked that each qirāʾa read as its own color, with transmitters as shades of it. Separating identity (color) from reading (letter and ring) also removes any suggestion that a color ranks readings.
- **Palette:** Ten hues, each with a deep and a light shade. All twenty inks clear WCAG AA (5.5 to 10.3), and the two shades of a hue differ by a luminance ratio of at least 3.7. Names are always printed beside a color, so hue is an aid and never the only carrier. The book jackets on the Quran page are now neutral so no hue means two things on one page.
- **Transmission data:** Four extractions read the biographical entries in an-Nashr (Shamela 22642, vol. 1 pp. 105 to 200 and the passages they point to). Each link is a sentence "X read on Y", verified as an exact substring of the cited page by `verify-transmission-edges.py`, then merged by `merge-transmission.py` into 126 people and 219 links (204 stated as reading on the teacher, 15 hedged or describing hearing, letters only or companionship, drawn dashed). All 30 readers and transmitters reach the Prophet. `build-transmission-data.py` lays the graph out left to right.
- **Limits:** One book only. Names matched across entries by the extraction are noted on the link (for example "ʿAbd Allāh b. Kathīr" with the reader Ibn Kathīr; "Abū Bakr" with Shuʿba by context). Khalaf and al-Dūrī each appear twice, as the book presents them. Kisāʾī's chain to the Prophet is joined from other readers' entries because his own entry refers back to them. No link has been reviewed by a person.
- **Rights:** The transmission page quotes about 230 passages from an-Nashr in `src/data/quran-transmission.json`, in addition to the roughly fifty readings quotations. Same status as the rest: `needs_review`, keep local (see `SOURCE-RIGHTS.md`).
- **Evidence:** Contrast 0 failures on both routes in both themes; `astro check` 0 errors; no design-audit findings in the new files; eight display and transmission tests pass, including reader focus with scripting off on both pages; no overflow at 390 and 320 px.
- **Review when:** More suras or more books are added, or the owner rules on the earlier tool routes (D-066).

## D-069: Split long suras into parts

- **Decision:** A sura with more than 12 positions is set out in parts. `/projects/quran/sura/N/` becomes an overview (whole-sura departure strip, list of parts, books cited) and `/projects/quran/sura/N/part/P/` carries the passage, collation and position blocks for one run of positions. A part never splits a verse, a last part under 4 positions is folded into the one before, and position numbers stay global to the sura. Suras of 12 positions or fewer keep the single page.
- **Reason:** Position blocks are about 770 px and 8 KB each. Al-Baqara at 22 positions was already 25,860 px tall and slow to paint, and the full sura will have several hundred. With 47 positions the overview is 4,591 px, and a part is a full 20 by 13 collation matrix.
- **Implementation:** `src/lib/qiraat-parts.ts` (split, slice, URLs), `src/lib/qiraat-suras.ts` (loads the sura files), routes `sura/[n]/index.astro` and `sura/[n]/part/[p].astro`. Decorative arrow glyphs were removed from `SuraQiraat.astro` because the design audit forbids them in components.
- **Evidence:** Sura tests 8 of 8 pass, including that the parts of sura 2 add up to its positions, no position id repeats, and each part's numbering starts where the last ended. Contrast 0 failures on sura 1, sura 2 and sura 2 part 2, both themes. `astro check` 0 errors.
- **Review when:** The part size needs tuning once the full farsh is in, or a verse index across parts is added.

## D-070: Draft mechanically, read every source unit, retain human review as a release gate

- **Decision:** The frozen rule-based parser supplies drafts, not publishable reader assignments. The main session reads every unit, including unflagged units, against its complete source sentence and records replacements, accepted exceptions and omissions in durable review JSON. No sub agents are used. A human reviewer must approve the assignments before release; an LLM read-through does not change a claim's `proposed` state.
- **Reason:** Earlier blind audits found roughly one silent error in each round of 25 to 30 clean units, with a new kind of error in each round. This is an informal calibration observation recorded in `qiraat/HANDOFF.md`, not a measured corpus-wide error rate. Exact quotations and zero coverage gaps cannot establish which reader belongs to which form.
- **Limits:** Coverage includes explicit omissions, rules awaiting a separate layer and unresolved reader terms. Reader and sub-route exceptions that the model cannot represent stay in the omission record. Independent witnesses require direct source reading, especially when their routes differ from the twenty transmitters used by the display.
- **Evidence:** The 2026-09-30 continuation read all 923 units starting on pages 431 to 620, added 1,026 items in 13 reviewed ranges and recorded 131 explicit dropped units. All batches pass the quotation and coverage gates; no human approval is implied.

## D-071: Use the source description for missing short labels

- **Decision:** At verification, a missing short label or a draft placeholder such as `form 1` becomes the first four whitespace-separated words of the book's exact form description. Existing authored English or transliterated labels stay unchanged. This applies to canonical drafts as well as compact hand-authored items. Full descriptions and evidence remain available beside the labels.
- **Reason:** Numbered placeholders describe the extraction structure rather than the reading. Literal Arabic excerpts give a useful label without inventing an English gloss or vocalized reconstruction.
- **Display:** Arabic labels use `bdi` with `lang="ar"` in tiles, cards, reports and book comparisons. Arabic fragments in editorial notes are marked separately. The guide distinguishes source excerpts from our English apparatus.
- **Evidence:** The complete qirāʾāt rebuild passes; source-label and authority-alias checks pass; hub and sura Playwright tests pass. Short excerpts are labels, not a substitute for reading the complete source description.

## D-072: Preserve a reviewed source locator when the Cairo matcher relocates a variant

- **Decision:** An item may carry `anchor_at_hint`, an explicit review reason for retaining the source-specified verse when the matcher proposes another occurrence. Such an item is marked weak and receives no Cairo word IDs. This does not manufacture an exact match. Incorrect authoring hints are corrected in the durable review instead.
- **Reason:** A variant absent from the Cairo verse can match a different occurrence exactly or under loose spelling. Examples are the added `من` at 9:100, the second occurrence of `ذو الجلال` at 55:78 and the listed `اللاء` places. The word before or after a variant can also be a locator rather than the changed word itself, as at 14:1-2.
- **Evidence:** The full anchor audit corrected eleven relocations: five in the continuation and six in prior batches. Seven preserve reviewed source locations without word anchors; four repair earlier hints or the target lemma. Final verified batches have zero moved anchors. The garbled rest description at 7:172-173 is preserved and separately queued against al-Mabsūṭ, not silently corrected from it.

## D-073: Enter a transmitter under a wider name only when the same sentence sets his sibling apart

- **Decision:** A reader entry may carry `narrowed_from`, the qāriʾ or collective term whose name the span carries, so that one transmitter (or the members of a term other than one excepted transmitter) can be entered from a sentence that names the wider group. The verifier accepts it only when the span names that qāriʾ or term and the same evidence names another transmitter of the same qāriʾ, or of a member of the term. Any other case still fails with "does not name".
- **Reason:** The book excepts one transmitter inside a wider name: "Ibn ʿĀmir, with a dispute about Hishām", "Nāfiʿ, with a dispute about Warsh", "the Ḥaramiyyān, and Warsh throws the vowel". Earlier reviews dropped these as unrepresentable (D-070). The rule that a transmitter's own name must stand in his span stays, so a slip cannot pass silently.
- **Implementation:** `narrowing_ok` in `verify-farsh-items.py`; the fifth element of a reader in `review_kit.A`.
- **Evidence:** 23 previously dropped units entered with it, all with zero verifier errors and gaps.

## D-074: Name a reader once for a chapter that continues with pronouns

- **Decision:** A reader entry may carry `context`, a page (and optional last page) where the reader is named, and the span is cut from that page instead of the evidence. The claims verifier checks the span there. The chapter heading is the intended source, as with "مذهب أبي عمرو في الإدغام" for the seventeen pages of the major idghām.
- **Reason:** A rules chapter names its subject in the heading and then writes "he merged", "he did not merge". Requiring the name inside every paragraph would pull the heading into every quotation.
- **Implementation:** `C()` in `review_kit.py`; `context_witness` in `verify-farsh-items.py`; the check in `verify-qiraat-claims.py`.

## D-075: The general rules are `rule` items on their own page, and the yāʾāt summaries are not duplicated

- **Decision:** Pages 181 to 281 of Taḥbīr are entered as items of scope `rule` (no verse), filed under sura 0 by the assembler, verified like any other claims, and shown at `/projects/quran/rules/`, grouped by the book's own chapter titles. Each paragraph that states a treatment for named readers is an item; the views of teachers outside the ten, the author's own routes beyond the book, agreements of all readers and definitions are skipped with a stated reason. Pages 268 to 281 (the principles of the yāʾāt al-iḍāfa and the dropped yāʾāt) are recorded as summary pages, because the word-by-word section repeats every place under its sura; a check found every yāʾ and zawāʾid verb in pp. 282 to 620 inside an item's evidence.
- **Reason:** The rules are where most of the ten readers' differences are stated as principles; they were deferred in every farsh review (D-070) and were the largest unentered part of the main source.
- **Implementation:** `rules_kit.py` (batch builder), `build-rules-data.py`, `src/pages/projects/quran/rules.astro`, `src/data/qiraat/rules.json`. The lengths of the madd are listed in the book as an order from the longest; the page shows them as a description of length only.
- **Limits:** A rule paragraph is one item per treatment. Where a reader appears in two treatments of one rule the book's exceptions are in the quotation and the note, not as a second form.

## D-076: Supplement batches enter deferred statements without measuring coverage again

- **Decision:** A batch with `"coverage": "supplement"` is verified for exact quotations, readers and anchors but not for coverage gaps, and is left out of the hub's page ranges. Such batches enter statements that earlier reviews set aside as "belonging to the rules layer" from pages another batch already accounts for. Statements about the verse endings of a whole sura are entered as positions at the verse where the range begins, with `anchor_at_hint`.
- **Reason:** The alternative was to repeat every stretch of those pages as a skip. The gate that matters, that every quoted word is on the page and every reader is named there, is unchanged.
- **Content:** Verse-ending imāla for suras 20, 53, 75, 79, 80, 87, 91, 92, 93 and 96; the opening letters كهيعص, طه, طسم, طس, يس and ن; the imāla of أعمى and نأى; the ينزل family; the paired questions and their per-place exceptions; المسيطرون; وامنتم in al-Mulk; رأى; and Bazzī's thirty-one tashdīd places, the further places of الرياح and the disputed-branch statements in the ordinary batches.

## D-077: A sura with no position says what the books say

- **Decision:** The hub no longer prints "Not extracted yet" for a sura when a book states why there is nothing to extract. `silent-suras.json` holds, per sura, the status (no difference stated, only a general rule, only a report from outside the twenty transmitters) and quotations that the builder checks against the cached pages. A sura for which no book speaks stays "Not extracted yet".
- **Reason:** Taḥbīr prints a heading only for a sura it has something to say about, and Ibn Mujāhid writes "there is no difference in it" for several. The old label read as an unfinished task.
- **Limit:** This records that a book says nothing, not that no reading exists. The 11 suras concerned are 62, 94, 95, 100, 103, 105, 107, 108, 110, 113 and 114. Sura 93 was in this list until its verse-ending imāla was entered (D-076).

## D-078: The independent-witness gap list finds candidates, not claims

- **Decision:** `witness-gap.py` cuts al-Mabsūṭ into items, reads the verse numbers it prints and lists the items on verses with no entered position. The list is a search aid. Al-Mabsūṭ numbers some verses differently from the Cairo text, spells some words differently, and gives routes that are not among the twenty, so a candidate is read against Taḥbīr before anything is entered.
- **Result:** Of 1,158 items with a printed verse number, all but about 85 sit on a verse with an entered position. Reading them showed that the candidates which were Taḥbīr statements (the ينزل family, رأى, المسيطرون) had been deferred, and they are now entered (D-076). Most of the others are routes outside the twenty (Zayd from Yaʿqūb, al-Burjumī from Shuʿba, Qutayba from al-Kisāʾī) or differences of spelling and verse numbering. Each remaining candidate has not been read individually against Taḥbīr; the list stays in `second-witness/mabsut-gap.json` for that.

## D-079: The witness comparison is a partition test followed by reading, and its results stay out of the site

- **Decision:** `witness-compare.py` matches each Taḥbīr item to an al-Mabsūṭ item, splits the item into clauses (readers, "the rest", the quoted word), and compares who is grouped with whom. The result is a status (agree, differ, partial, not located, yāʾ list) and nothing more. Every item the script marked `differ` (200) was then read by hand against the Taḥbīr entry and the full al-Mabsūṭ item, and given a verdict: AG agrees on the point compared, DF differs, AS the two entries address different aspects, WR the script matched the wrong al-Mabsūṭ item, UN not read. Results, with the exact al-Mabsūṭ item text and page, are in `qiraat/second-witness/compare-read.json`.
- **Result of the reading:** 102 AG, 84 DF, 7 AS, 6 WR, 1 UN. The differences are not spread evenly. Forty-two of the 84 concern Yaʿqūb, in almost every case because Taḥbīr separates Rawḥ from Ruways and al-Mabsūṭ gives a reading to Yaʿqūb as a whole (Rawḥ 24, Yaʿqūb 18). Seventeen concern Hishām against Ibn Dhakwān, where al-Mabsūṭ gives Ibn ʿĀmir as a whole what Taḥbīr gives to one transmitter. Eight concern Abū Jaʿfar's transmitters. These are differences of granularity between two books, and each names a place where a reader should not be assigned a form from al-Mabsūṭ alone. Checked against an-Nashr (`nashr-compare.py`), 49 of the 84 differences sit in items where an-Nashr groups the readers as Taḥbīr does, 27 could not be compared and 8 were flagged by the script (read: wording of the clause or a wrong match). al-Mabsūṭ is Ibn Mihrān's own book, and in three places (20:53, 36:49, 56:89) an-Nashr says that Ibn Mihrān alone reports the reading from Rawḥ, in one of them calling it his error.
- **Source discrepancies found:** three places where the Taḥbīr sentence as printed leaves out a reader that both an-Nashr and al-Mabsūṭ name: al-Kisāʾī at 12:62 (فتيانه), Ḥamza at 30:50 (آثار) and Ḥafṣ at 41:47 (ثمرات). The site gives those readers the remainder reading because it follows the Taḥbīr sentence. Per the rule on source data, the entries are not edited; they are recorded in `compare-read.json` with an-Nashr's wording, and the owner should decide whether the site shows a note. Two places where an-Nashr sides with Taḥbīr against al-Mabsūṭ (Abū Jaʿfar's tāʾ at 16:66 and Nāfiʿ alone at 74:56) are recorded the same way.
- **Reason for keeping it out of the claims:** al-Mabsūṭ routes, edition readings and item cutting are not yet checked, and several of its printed lines look corrupt against the other two books (20:97, 17:42 to 44, 81:6). A corroboration mark would say more than the reading supports.
- **Limits:** The 144 partial and 529 not-located results and any sample of the 661 agreements are not yet read. The machine status `agree` is a partition match, not a reading.

## D-080: an-Nashr adds routes, not words

- **Decision:** an-Nashr (Shamela 22642), Ibn al-Jazarī's larger work, is not extracted as a second set of claims. A comparison of its word-by-word section (vol. 2 pp. 206 to 402, about 990 items introduced by "he differed on") with the entered positions found every word already present in Taḥbīr, once spelling differences were allowed for: the two books differ in the base text of the lemma (تعبدون against يعبدون, أنجيناكم against أنجاكم) more often than in which words they treat. What an-Nashr adds is the route level (al-Ḥulwānī against al-Dājūnī, students of a transmitter, criticism of other books), which lies outside the twenty transmitters the model resolves to.
- **Use:** an-Nashr is used to settle a name the Taḥbīr edition misprints or leaves bare (D-081) and to arbitrate a difference between Taḥbīr and al-Mabsūṭ (D-079).
- **Limit:** The comparison used lemma stems, not a reading of every item, and left about 46 items to a manual look; each of those was a spelling variant or an entered word except the cases below. It does not show that every difference of reading between the books is captured.

## D-081: A permitted basis, and readers identified by a second book

- **Permitted:** a fifth basis, `permitted`, is for the alternatives the book allows for beginning a word or for a second way of reading a word (Taḥbīr p. 568, الأولى: three ways to begin for Abū ʿAmr, Abū Jaʿfar and Yaʿqūb, two of which it extends to Warsh and Ḥamza, and three for Qālūn; p. 314, the sukūn of the ʿayn in نعما for Qālūn, Shuʿba and Abū ʿAmr). A reader may sit in a permitted form and in an ordinary form of the same item, and a permitted entry does not remove him from "the rest". The page lists permitted forms with the reports, labelled "The book permits this as a way of beginning the word".
- **Identified by:** a reader entry can carry `identified_by` (book, volume, page, quotation) when the Taḥbīr edition prints a misspelled or bare name. The verifier finds the quotation on that page of the other book and checks that it names the reader. Used for ابن كثبر (a misprint of Ibn Kathīr, found by comparing with al-Mabsūṭ and an-Nashr) at 6:145, المكي (Ibn Kathīr) at 36:62, وعمرو and وأبو عمر (Abū ʿAmr) at 40:26 and 41:50, أبو ذكر (Abū Bakr) at 72:19, and أبو عمر عن اليزيدي (al-Dūrī of Abū ʿAmr) at 2:128, 2:260 and 41:29, and the report of al-Naqqāsh from al-Akhfash (Ibn Dhakwān) at 30:19. A scan of the whole farsh for tokens that nearly match a reader's name found no other misprint of this kind. The item notes say so. The quoted Taḥbīr words are unchanged.
- **Second-level rules entered:** زكرياء before a hamza (p. 321), the plural أمهات (p. 335, four places) and, as sub-features, the doubling of the zāy in ينزل at 16:2 (p. 430) and the hamza realization in أأعجمي at 41:44 (p. 543).

## D-082: The an-Nashr comparison finds candidates; only two of its differences were real

- **Decision:** `nashr-compare.py` matches each an-Nashr item to a Taḥbīr position (same sura, similar lemma, in order) and tests, at the level of the qāriʾ, whether Taḥbīr keeps together the readers an-Nashr names together, and whether Taḥbīr keeps with them a reader an-Nashr leaves to "the rest". Result: 796 agree, 104 differ, 91 not located, of 991 items.
- **Reading:** The 37 differences of the strict test and about half of the 51 "leaves to the rest" cases were read. Nearly all were the script (a word that recurs in the sura matched to the wrong place, a clause that names a reader without a conjunction, an item about another aspect of the word) or an an-Nashr clause that names only some of the readers who agree. Two were real: the printed Taḥbīr sentence at 6:145 reads ابن كثبر for ابن كثير, so the parser had dropped Ibn Kathīr (fixed, D-081), and the sentence at 41:47 leaves Ḥafṣ out of the plural (recorded, D-079). The other 46 or so "leaves to the rest" cases were not read one by one.
- **Limit:** The comparison cannot see a difference when the item is not located, and it treats an-Nashr's clauses as complete lists, which they are not. It is a triage, not an audit of the entered positions.
- **Label check:** `nashr-form-check.py` compares, for the clauses of an-Nashr that agree in grouping with Taḥbīr, the person (yāʾ, tāʾ, nūn), the case and the doubling given to the named readers with the label of the Taḥbīr group that holds them. Of 864 clauses, 337 had a comparable family in both books; three were flagged and all three were items matched to the wrong place. No swapped label was found. Other families (the vowels of a letter, an alif, a hamza) are not compared.
- The same label check against al-Mabsūṭ (`mabsut-form-check.py`) compared 273 clauses and flagged five, all of them a different place or a different aspect of the word (the first and second places of يطوع, the doubling of the qāf in تلقف, and so on). No swapped label was found there either.

## D-083: an-Nashr enters as a second book on positions where it agrees, and only there

- **Decision:** `draft-nashr-items.py` turns 441 an-Nashr items into claims of book 22642 added to the Taḥbīr position they treat (`merge_into` on the item, `value_of` on each form; the assembler attaches them and the display builder already groups by reading across books). Each clause "A, B and C read X, and the rest read Y" becomes a form whose readers are the names in the clause. The al-Baṣriyyān and al-Kūfiyyūn groups are defined from an-Nashr vol. 1 p. 38 (al-Madaniyyān already was). That page names three Kūfiyyūn; the farsh never adds Khalaf beside the term, and wherever it can be compared he reads as the three do, so the group carries Khalaf with a stated note and an item is entered only when Taḥbīr gives him the same reading.
- **Guards:** the item must be one the comparison found to agree in grouping; every clause must be read completely (names only, a short form phrase); the item is skipped if it has any word of route, agreement or place (he agreed, he reported, only here, wherever, the two places, "except that"); and every transmitter Taḥbīr states must end with the reading Taḥbīr gives him. A difference is therefore never turned into a claim; differences stay in `second-witness/`. Evidence, lemma and every reader span pass the same verifier as the Taḥbīr items (0 errors).
- **Result:** 445 positions now carry two books (441 an-Nashr plus the al-Fātiḥa pilot); 4,849 claims in all. A form-label guard (person, case, doubling) and the transmitter-level guard skipped nothing further; ten items first flagged as disagreements were all the Kūfiyyūn term and now enter. an-Nashr is by the same author as Taḥbīr, so the second book shows that the fuller work states the same, not that an independent tradition does. Of the 796 agreeing items, 355 were skipped (308 with a word of route, agreement or place, 31 clauses not readable by rule, 16 lemmas); they are not lost, only not entered.
- **Limit:** the match of an-Nashr item to Taḥbīr position is by sura, lemma and order, and was checked by the lemma overlap (eleven weak overlaps were the same word under a different spelling). A sample of 25 drafts was read against the text.

## D-084: al-Mabsūṭ and Ibn Mujāhid's Sabʿa enter the same way; the Taysīr does not

- **al-Mabsūṭ (36104):** `draft-mabsut-items.py` reads clauses of the form "he read: A and B {the word} [verse] form; and the rest read {the word} form" and merges 324 items onto their Taḥbīr positions under the same guards as D-083 (only names before the brace, no route or student outside the twenty, one verse, the form label not contradicting Taḥbīr's, no transmitter given a reading other than Taḥbīr's). "Ḥafṣ from ʿĀṣim" and the like keep the transmitter. The evidence must contain every form, reader span and the word, and be unique on its pages. 21 agreeing-by-partition items were refused because a transmitter would differ from Taḥbīr; they are among the differences already recorded in `second-witness/compare-read.json`.
- **Ibn Mujāhid, Kitāb al-Sabʿa (5530):** `draft-saba-items.py` takes items of the form "they differed on {the word} N: so A and B read ..., and C and D read ..." from the sura heading and the verse number after the braced word, matches the single Taḥbīr position at that verse with a similar word, and enters 146 items. The book names every side and has no "the rest", so the three readers outside its seven stay unstated. The spelling الكسائى is accepted as a verification alias.
- **al-Dānī, at-Taysīr (5527):** not extracted. Taḥbīr is al-Dānī's text with Ibn al-Jazarī's additions in brackets (see the roadmap), so every Taysīr statement is already an entry; a second copy would count one book twice.
- **Result:** with an-Nashr, positions now carry up to four books (Taḥbīr, an-Nashr, al-Mabsūṭ, Sabʿa). None of them is independent of the others as a tradition: Ibn al-Jazarī's two works share an author, and Ibn Mihrān and Ibn Mujāhid are earlier books that Ibn al-Jazarī used. The marks say that another book states the same, not that a reading is verified.
- **Limit:** only items that agree and read by rule enter. Routes, students outside the twenty, several places and every disagreement stay in `second-witness/`.
- **Transmitter-level clauses:** Sabʿa clauses such as "al-Dūrī from Abū ʿAmr", "Nāfiʿ in the narration of Warsh" or "Ḥafṣ from ʿĀṣim" are read as the transmitter alone (`read_head_rich`), so the claim names only the transmitter the book names. Matching to the Taḥbīr position uses the sura, the verse number after the braced word, and word coverage in both directions; a tie between two positions is refused rather than guessed.
- **What was not entered, and where it is:** every item the drafters refused is listed with its reason in `second-witness/nashr-not-entered.json`, `mabsut-not-entered.json` and `saba-not-entered.json`. The reasons are the same few: a route or a student outside the twenty (Ḥulwānī, Dājūnī, Zayd, al-Burjumī, al-Aʿshā, Ḥammād, Yaḥyā, Qutayba), a clause that covers several places, an exception ("except"), an item whose braced words span several positions, or a disagreement with Taḥbīr. The model resolves to the twenty transmitters and cannot carry those; they are documented as residue, not lost.

## D-085: What the claims model cannot carry is recorded as passages, not dropped

- **Decision:** the passages of an-Nashr, al-Mabsūṭ and the Sabʿa that the drafters refuse (routes below the twenty transmitters, several places, exceptions, a disagreement with Taḥbīr) are collected by `build-route-detail.py` into `second-witness/route-detail.json`. Each record has the exact text (checked as a substring of the book's pages), the page, the Taḥbīr position where one was matched, the reason it was refused, which narrators below the twenty it names (al-Ḥulwānī, al-Dājūnī, al-Akhfash, Zayd, al-Burjumī, al-Aʿshā, Ḥammād, Yaḥyā, Qutayba, al-Qawwās, Ibn Fulayḥ, Ibn Mihrān and others) and which of the twenty it names. Nothing is interpreted and nothing becomes a claim.
- **Reason:** turning a route statement into a reading requires a route layer (narrators below the transmitters as entries, with their own forms), which changes the data schema and the sura pages. Until the owner decides that, the passage is kept whole, so the material is documented and findable and no reading is invented from it.
- **Result:** 1,888 verified passages (an-Nashr 358, al-Mabsūṭ 422, Sabʿa 1,108); the file stays in `docs/` and is not embedded in the site.
- **Also:** the 144 partial al-Mabsūṭ comparisons now go through the same drafter as the agreeing ones, and any form that folds a "the rest" sentence into a reader's clause is refused, so a reader is never given another group's form. an-Nashr 438, al-Mabsūṭ 383 and Sabʿa 146 items are entered.

## D-086: The route passages that name a narrator are shown on the position, quoted and not read

- **Decision:** the 341 passages of `route-detail.json` that name a narrator below the twenty transmitters and belong to a Taḥbīr position (an-Nashr 100, al-Mabsūṭ 122, the Sabʿa 119, the last matched by sura, verse and word) are attached to 312 positions as `route_notes` and shown in a collapsed block "Routes named below the transmitters". Each shows the book, page, the narrators named (marked as Arabic) and the exact sentences that name them, up to 700 letters. The block says the passages are not entered as readings.
- **Reason:** this gives the reader the route detail at the position, from the book, without the site claiming which route reads which form. A route layer that reads the forms (al-Ḥulwānī reads X, al-Dājūnī reads Y, under Hishām) is still a schema decision. This layer needs no schema change and can be replaced by one.
- **Limit:** 1,547 of the 1,888 route-detail passages are not shown: the ones that name no narrator below the twenty (several places, exceptions, two verses, a disagreement with Taḥbīr) and the Sabʿa ones that could not be matched to one position. They remain in the JSON file. Rights are as for the other embedded quotations: `needs_review`.

## D-087: A hand-read route layer: narrators below the twenty, with the form each is reported to read

- **Decision:** D-085 and D-086 kept the route passages whole and quoted. This layer reads them. Each of the 341 route passages was read by hand, and where the text says in so many words that a named narrator below the twenty (al-Aʿshā, al-Burjumī, Zayd, Ḥammād, Yaḥyā ibn Ādam, al-Ḥulwānī, al-Dājūnī, Ibn Mihrān and so on) reports that a transmitter or reader reads a form, that statement is entered as a route entry: narrator, the reader or transmitter it runs under, and the form. 448 entries on 193 positions, in `docs/research/quran-platform/qiraat/routes/routes-a.json` to `routes-r.json`, written with `routes_kit.py` and checked by `verify-routes.py`.
- **Checks:** the evidence is an exact substring of the cited pages (the page, or its neighbour when a passage crosses a page); the narrator and the form are exact substrings of the evidence; the reader is one of the ten or twenty; the reading number given as `value_of` is a reading of that position. The build fails on any error (0 at this release).
- **Rules:** only an explicit narrator, reader, form statement is entered. A form is tied to a numbered Taḥbīr reading (`value_of`) only when it is the same form; otherwise it stands alone. A phrase like "likewise" is entered only when its antecedent is inside the quoted passage. `kind` is `reads`, `reports` (the book says the narrator reports it, often adding that it is an error, a rare report or a single narrator's) or `disputed`. Where the book judges a report an error or an aberration, the entry keeps it and carries the book's own words in its note; nothing is graded by the site.
- **Display:** a position shows "Routes read below the transmitters" with each row and its quoted passage. A passage that has a hand-read entry no longer also appears under "Routes named below the transmitters, not read"; the other 130 positions still show only the quotation.
- **Not entered:** passages where the narrator is named but the form is unstated, several words treated in one sentence, exceptions, and statements whose antecedent is outside the excerpt. They remain in `second-witness/route-detail.json`. The 1,547 passages that name no narrator below the twenty are unchanged from D-085.
- **Rights:** as for the other Shamela quotations (`needs_review`, SOURCE-RIGHTS.md). Nothing here is cleared for deployment.

## D-088: The Sabʿa drafter assigned every sura after al-Zukhruf to sura 43; forms that name another place are refused

- **Bug:** `draft-saba-items.py` took the sura of an item from the first 43 headings. After sura 43 the book heads each sura "ذكر اختلافهم في سورة X" and skips suras it has nothing to say about, so 276 items were filed under sura 43 and could not match a position. The drafter now reads those headings by name (`LATER_SURAS`).
- **Guards added:** the next sura's heading is cut from the last item of a section (it had leaked into two form descriptions at 86:4); an item is refused when one reader appears in two clauses (89:17 mixed several words); a form that mentions another sura or place ("in sura al-Mumin", "here", "this sura") is refused. That last guard removed items at 10:61 and 30:57 whose forms had carried a note about another place.
- **Result:** 163 Sabʿa items (was 146), 24 of them on suras 44 to 114, all verified (0 errors, 0 gaps). 5,965 claims on 1,936 positions. The refusals are recorded with reasons in `second-witness/saba-not-entered.json`.
- **Not done:** the 81 al-Mabsūṭ "two verses" items are multi-place statements ("in all of the Qur'an", "except at ..."). They need a rule-scope entry, not a position entry, and are left in the not-entered file.
