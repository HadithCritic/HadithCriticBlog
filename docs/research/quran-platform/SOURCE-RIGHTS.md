# Quran Source-Layer Rights Register

This register separates text-layer rights evidence from presentation assets.
The source statement applies to the pinned TEI export as a repository dataset;
it does not establish separate rights for linked images or material outside
that export.

| Layer | Source evidence | Rights state and release treatment | Remaining limit |
|---|---|---|---|
| Corpus Coranicum TEI records and derived data | The pinned repository README's Licence section states CC BY-SA 4.0 for the TEI data repository. Its dataset summary lists `cairo_quran` as including English, German, and French translations. Source commit: `57cb2b7be321ecfba100cb5f7988974f47864a14`. | Derived records carry the source commit, repository-level CC BY-SA 4.0 statement, and Corpus Coranicum attribution in release metadata. The reader package includes the Cairo Arabic layer; commentary packages preserve source TEI content. | This is the upstream repository's dataset-level rights statement. It is not an independent rights audit of works underlying individual translations. |
| Cairo English, German, and French translation layers | The README describes these translations as part of the Cairo Quran dataset and states CC BY-SA 4.0 for the TEI repository. It does not provide translator labels, source-work identities, or separate terms by language/layer. Local staging contains 6,236 `en`, 6,350 `de`, and 6,236 `fr` records; all 18,822 have a null `translator_label`. | `needs_review` for redistribution as translation editions. Exact translation rows remain in ignored local SQLite staging; the active immutable static release and reader UI exclude these translation layers. Do not infer translator names. | Resolve the rights and attribution scope for each language layer before adding its text to a distributable release or public reader. |
| Manuscript and other linked images | TEI records may contain external image URLs. The repository README's dataset license does not provide per-image rights evidence. | No linked image binaries are copied into the release. Records may link to their source; no image display is implied by the TEI data license. | Review the image host's terms and each image's rights statement before embedding or copying an image. |
| Shamela qirāʾāt texts (local, research track) | Books in the user's local Maktaba Shamela export, indexed in `shamela_books_info.csv`; roles in `qiraat/sources.json`. The works are classical; the Shamela editions add editors, vocalization and punctuation. | `needs_review`. Page text stays in ignored `scratch/`. Committed claim files carry only short evidence spans (about one sentence each) with book, volume and page locators. The Quran page display embeds about fifty of those spans in `src/data/quran-qiraat-sura-001.json`, and the transmission page about 230 sentences from an-Nashr in `src/data/quran-transmission.json`; keep both local until reviewed. | Assess the editions' rights before any qirāʾāt data, including quoted spans, enters a public release or a public repository. |
| Site fonts | See [ASSET-RIGHTS.md](ASSET-RIGHTS.md). | Kept separate from the Quran data release. | Runtime Google Fonts bytes are not pinned in the release. |

## Evidence boundary

The pinned `README.md` is the evidence for the repository-level CC BY-SA 4.0
claim. It describes translations as part of `cairo_quran`, but does not name
their translators, identify their source works, or give layer-specific terms.
The conservative platform state for those translation editions is therefore
`needs_review`: retain them locally for fidelity work, and withhold their text
from the active static release. This does not contradict the repository-level
license statement or extend it to images, live-site materials, or source code.
