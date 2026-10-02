# Research graph pipeline

Builds `src/data/research-graph.json`, the data behind `/research/`.

## Final stage (reproducible)

`build_graph.py` merges verified bibliographic data with hand-checked overrides, reads the
PDFs for full text, and derives the edges. Run it from the inputs folder:

```bash
cd docs/research/hadith-graph/inputs
HADITH_LIBRARY="/path/to/Islamic Studies" python ../../../../scripts/research-graph/build_graph.py
cp research-graph.json ../../../../src/data/research-graph.json
cp evidence.json ../citation-evidence.json
npm run test:research
```

Also set `HADITH_OCR_DIR` to the `ocrd` folder and `HADITH_NEWTEXTS_DIR` to `Desktop\newtexts` if they are not at the default paths. `RG_BASE=1` skips `extras.json` and `chapters.json` and reproduces the original 85-work graph.

To refresh DOIs for new studies, run `python ../../../../scripts/research-graph/lookup_dois.py` from the inputs folder before building.

Requires `pymupdf`. Inputs in `docs/research/hadith-graph/inputs/`:

Reviewed library additions also live in the tracked
`docs/research/hadith-graph/library-additions.json`. The final stage merges them
with the earlier local inputs. Each source key is relative to the library root;
the library's `RENAME_LOG.csv` resolves older source names after reorganization.
The manifest records metadata checks and any excerpt boundaries or known font
decoding needed for citation extraction. Original PDFs are read-only; page
evidence keeps their original PDF page numbers. `RG_BASE=1` skips these additions.
`crossrefVerified: false` distinguishes a DOI printed in a PDF from an accepted
Crossref metadata match. `excludeCitationIds` records individually reviewed false
matches, such as generic wording near a surname, with the reason in `verification`.

| File | What it is |
|---|---|
| `triage.csv` | Every library PDF with tier (A core, B adjacent, C out of scope), scan status, duplicates |
| `seeds.json` | Title and author seed for each Tier A work |
| `enriched2.json` | Crossref candidates, accepted only when the title appears on the PDF's own front matter |
| `crossref_full.json` | Full Crossref records for the accepted DOIs |
| `extras.json` | Works added after the first build that are not in `triage.csv`: the OCR'd copies (`ocrd`), the reviewed `newtexts` folder, and volumes taken straight from the library. `dir` says where the file is |
| `chapters.json` | Studies printed inside larger volumes: title, author, first-publication year and venue, printed start page, and the volume's page offset or spread |
| `crossref_extra.json` | DOIs accepted for those, written by `lookup_dois.py` |

## Earlier stages (run interactively)

`scan.py` scores every PDF for hadith-criticism vocabulary and text-layer presence, and
`triage.py` turns that into tiers. They read the library read-only.
The scanner traverses subfolders and writes relative source paths, so alphabetic
folders and duplicate basenames are handled. It samples opening and distributed
body pages; its output is a relevance screen, not a full reading or an OCR check.

## How edges are found

A work A cites work B when A's text contains B's title, or an alias for it, within 500
characters of B's lead-author surname. The first 6 to 12 pages of long works are skipped so a
volume's own contents page is not counted. `part_of` comes from `chapters.json` (contents pages of the volumes),
`reviews` and `replies_to` are hand-set from the works' front matter. A volume and its own studies never
count as citing each other, because a volume prints its studies' titles in running heads. A study inside a
volume is searched only over its own pages. Page evidence for each citation is in
`docs/research/hadith-graph/citation-evidence.json` (PDF page numbers, not printed ones).

## Rules

- Nothing is graded. No reliability, authenticity or quality field exists in the data.
- Anything not printed in a work's front matter or returned by Crossref is listed in the
  work's `unconfirmed` field, and in `docs/research/hadith-graph/TODO.md`.
- The public JSON carries no local paths or PDF page numbers (`test:research` enforces this).
