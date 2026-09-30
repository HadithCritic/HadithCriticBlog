# Quran research data releases

The active immutable browser-data release is
[`v0.5.28-cc-57cb2b7be321`](releases/v0.5.28-cc-57cb2b7be321/release-notes.md).
The root [`manifest.json`](manifest.json) points to its hashed release manifest.
Each correction creates a new versioned release; previous releases remain
available.

## Source and attribution

This release contains derived indexes from the pinned Corpus Coranicum TEI
export at commit
[`57cb2b7be321ecfba100cb5f7988974f47864a14`](https://github.com/telota/corpus-coranicum-tei/tree/57cb2b7be321ecfba100cb5f7988974f47864a14).
The export identifies its TEI data as CC BY-SA 4.0. Attribution: Corpus
Coranicum Project, ed. Michael Marx. TEI Data. Berlin-Brandenburg Academy of
Sciences and Humanities. When redistributing these adaptations, retain the
attribution, cite the pinned commit, and follow CC BY-SA 4.0. This data license
does not establish rights for third-party manuscript images.

## Contents

- **Variants:** the browser catalog covers all 18,000 source records. The
  downloadable `variants.json` is a separate 24-record pilot excerpt. All
  30,112 TEI-listed reader-reference entries are preserved. The export has no
  per-record variant source key; those citations remain missing.
- **Cairo 1924 Arabic layer:** 6,236 source verses and 77,432 source-identified
  word tokens, linked to the pinned TEI records.
- **Manuscript descriptions:** 2,322 records and 192,295 source elements from
  the pinned `quran_manuscripts` collection. No manuscript images are copied.
- **Commentary:** all 94,443 `text/body` elements and 850 `teiHeader` elements
  are retained in the release indexes; 37,358 selected text blocks are
  searchable.
- **Concordance:** 91,285 source word records and 3,833,970 exact field values
  across 114 source files. Field names and values remain source-native.
- **Intertexts and taxonomy:** 713 intertext records with 9,452 selected
  source-linked fields, plus all 122 source categories. The source has no
  explicit category assignments, so none are inferred.
- **Research graph:** 113,131 typed edges. Source-reported references and
  mechanically formed passage/word links retain their distinct types and
  review states.
- **Reader-key counts:** a reproducible count of source records grouped by
  exact TEI reader key. Counts do not represent historical frequency.

Candidate links remain candidates, not verified equivalences. Translation
text is withheld from the browser release while its layer-specific attribution
and rights review remains open. Nasser exports, the Quran Studies folder,
Shamela data, and manuscript images are outside this release. The complete
schema-v3 SQLite artifact is local-only and is not included in the browser
release.

The release manifest records asset hashes, coverage counts, source and license
metadata, build provenance, and the previous-release hash. Consult the linked
release notes and manifest before reusing individual assets; the contents and
known limits are release-specific.
