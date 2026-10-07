# Fiqh Compass research store

This directory documents the research-data workflow behind the Fiqh Compass
prototype. It is not a source of automatically publishable legal positions.
The 12 axes, 24 questions, and 20 issues remain provisional. A retrieved page
is a search lead until its context, authorial voice, edition, locator, and
relevance have been reviewed.

## Data boundary

The Shamela catalog and Parquet corpus have separate immutable input hashes in
`scratch/fiqh-compass/reconciliation.json`. The initial database and all exact
Arabic passages live in `scratch/fiqh-compass/`, which is ignored by Git. Do
not move full passages or large exports into tracked files until the rights
review is resolved. The Parquet's page/volume fields are digital locators;
they do not establish printed pagination or scan collation. A corpus row's
presence does not prove a work is complete or that it matches the named
edition.

Isolated review builds cited in `PROGRESS.md`, `roadmap-gates.md`,
`task-ledger.json` and the M4 audit as `dist-fc-review-mN/...` were deleted
on 2026-10-05 at the owner's decision (each was a full copy of the site).
The records stand as logs of checks that ran; repeat a check against a fresh
build when it needs re-establishing.

## Workflow

Run commands from the repository root in PowerShell. The input files are kept
outside the repository:

```powershell
python scripts/fiqh-compass/reconcile_corpus.py `
  --catalog 'C:\Users\Jonathan\Desktop\shamela_catalog_index.csv' `
  --parquet 'C:\Users\Jonathan\Desktop\silsilah\shamela_full_merged.parquet' `
  --out scratch/fiqh-compass

python scripts/fiqh-compass/reconcile_catalog_index.py `
  --index 'C:\Users\Jonathan\Desktop\shamela_catalog_index.csv' `
  --previous-manifest scratch/fiqh-compass/catalog-snapshots/previous-8492/source-manifest.json `
  --previous-reconciliation scratch/fiqh-compass/catalog-snapshots/previous-8492/reconciliation.json `
  --json-out docs/research/fiqh-compass/catalog-index-reconciliation.json `
  --markdown-out docs/research/fiqh-compass/catalog-index-reconciliation.md

python scripts/fiqh-compass/audit_catalog_coverage.py `
  --index 'C:\Users\Jonathan\Desktop\shamela_catalog_index.csv' `
  --json-out docs/research/fiqh-compass/catalog-coverage-scan.json `
  --markdown-out docs/research/fiqh-compass/catalog-coverage-scan.md

node --experimental-strip-types scripts/fiqh-compass/export_seed_data.mjs `
  scratch/fiqh-compass

python scripts/fiqh-compass/build_research_store.py `
  --input scratch/fiqh-compass --out scratch/fiqh-compass

python scripts/fiqh-compass/extract_candidates.py `
  --parquet 'C:\Users\Jonathan\Desktop\silsilah\shamela_full_merged.parquet' `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite `
  --out scratch/fiqh-compass `
  --plans scripts/fiqh-compass/retrieval-plans-v1.json

python scripts/fiqh-compass/build_research_store.py `
  --input scratch/fiqh-compass --out scratch/fiqh-compass

python scripts/fiqh-compass/seed_pilot_assessments.py

python scripts/fiqh-compass/build_question_audit.py

python scripts/fiqh-compass/validate_research_store.py `
  --parquet 'C:\Users\Jonathan\Desktop\silsilah\shamela_full_merged.parquet' `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite `
  --exports scratch/fiqh-compass/json

python scripts/fiqh-compass/build_review_packets.py `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite `
  --assessments docs/research/fiqh-compass/pilot-assessments-v1.json `
  --out scratch/fiqh-compass/review-packets

python scripts/fiqh-compass/migrate_research_store_v2.py `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite

python scripts/fiqh-compass/seed_acquisition_entities.py `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite

python scripts/fiqh-compass/export_research_store_v2.py `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite
```

The first build loads the seed data; candidate extraction adds all exact
machine hits to SQLite; the second build regenerates deterministic JSON
summaries. The pilot-assessment step adds only bounded candidate claims and
working translations whose Unicode codepoint spans and hashes point into the
preserved Arabic rows. These are editorial/LLM triage records, not specialist
approval. The question-audit export preserves all provisional mappings while
recording issue evidence counts and gaps. Reconciliation and retrieval reports
include run timestamps, so compare their substantive counts and hashes when
checking reproducibility.

The current-index reconciliation reads only CSV metadata and the previous
metadata reports; it does not read Parquet passage text. It verifies unique
book IDs, indexed record-count totals, and serial-range coverage, then identifies
records newly exposed since the prior catalog snapshot. Fiqh-related keyword
matches are leads for human review, not doctrine labels or source approval.

The review-packet generator checks Arabic anchors against a lossy normalized
copy and verifies exact translation-segment hashes against preserved text. Its
output contains private corpus passages and remains restricted working material
until source-use rights are established. Packet creation does not mean a human
review was performed.

## Evidence rules

- `machine_candidate` is a lexical lead, not evidence that a passage answers
  the issue. Arabic search normalization is lossy; `arabic_verbatim` remains
  unchanged and is the only text eligible for quotation checking.
- Keep the hit field visible: a term found only in `foot_note_verbatim` does
  not establish that the author used it in the main text.
- Preserve quoted authorities, opponents' views, later attributions, and
  editorial language as distinct from an author's own statement.
- Store digital volume/page separately from printed volume/page. Leave printed
  fields empty until an edition or scan has been checked.
- Translation status starts at `working_draft`; specialist review is a
  separate gate. No score or profile coordinate is implied by passage count.
- Unknown, absent from the searched sources, and contrary evidence are three
  different findings. Search failure is not evidence of absence.
- Rights and specialist review remain explicit gates. Machine validation
  checks data integrity and passage fidelity, not legal interpretation.

## Main records

`schema-v1.sql` defines datasets and Shamela source records, axes, issues,
corpus passages, translations, positions, bounded profiles, and review events.
`schema-v2.sql` additively defines normalized authors, works, manifestations
(printed editions, manuscripts, and web publications), digital access,
acquisition leads, external passages, and their evidence links.
`migrate_research_store_v2.py` applies the extension transactionally;
`seed_acquisition_entities.py` imports candidate metadata; and
`export_research_store_v2.py` writes the deterministic private register to
`scratch/fiqh-compass/json/external-source-register-v2.json`. The metadata-only
importer is idempotent and does not create passages, approve rights, or assign
scores. Its scoped refreshers update only unresolved/candidate al-Nīl,
al-Mabsūṭ, al-Baḥr, and al-Mughnī acquisition metadata; reviewed identity or
rights decisions are preserved. `import_external_candidate_packet.py`
separately imports an exact-text
hash-checked private review packet as a machine candidate; it never links that
passage to a question or position. Run it only after the cited manifestation
and access rows exist. Run the metadata seeder after the v2 migration; a fresh
v1 rebuild needs both commands again. Stable IDs are deterministic for source rows, issue, retrieval profile,
and acquisition seed records. In-memory smoke checks run with
`python scripts/fiqh-compass/test_schema_v2.py`.
`task-ledger.json` tracks project work; `PROGRESS.md` records the latest
checkpoint and the next research batch.

Current release artifacts are private under `scratch/fiqh-compass/`: the
SQLite database, exact Arabic candidate text and adjacent context, issue
dossiers, source manifest, reconciliation, and JSON exports. Tracked files
contain workflow code and methodology only.
