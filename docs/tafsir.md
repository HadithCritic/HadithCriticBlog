# Tafsir module

`/projects/tafsir/` sets the major commentaries beside every verse. Each commentary
is read in the qirāʾa it follows, resolved against the qirāʾāt collation in
`src/data/qiraat/`, and quoted from one named Shamela edition.

## Files

| Path | What |
|---|---|
| `src/data/tafsir/works.json` | The registry: one record per commentary, grouped by century. |
| `src/data/tafsir/sura-NNN.json` | Verse-placed entries and separately stored sura-level material for one sura. |
| `src/data/tafsir/second-century-source.json` | Source and coverage summary generated from the combined second-century catalog. |
| `src/data/tafsir/source/muqatil-80-114-en.json` | Supplied English translation records for Muqātil, keyed by Shamela serial. |
| `scripts/build-tafsir-second-century.mjs` | Rebuilds the five second-century works from the combined catalog and Arabic source exports. |
| `src/lib/tafsir-core.ts` | Types, validation and reading resolution. No file loading, so it runs under `node --test`. |
| `src/lib/tafsir.ts` | Loads and validates the data at build time and builds the per-sura view. |
| `src/components/tafsir/SuraTafsir.astro` | The sura page. |
| `src/pages/projects/tafsir.astro`, `src/pages/projects/tafsir/sura/[n]/` | The hub and the 114 sura pages. |
| `src/lib/tests/tafsir.test.mjs` | `npm run test:tafsir`, part of `validate`. |

A bad registry or entry file throws during the build with the file and the problem,
rather than rendering.

## Source exports

The five second-century editions come from the Shamela category 3 export staged at
`Desktop/tafsir/dated tafsir/02 century AH/`. Run
`node scripts/build-tafsir-second-century.mjs [source-directory]` to rebuild the
checked-in per-sura files. The default source directory is the Windows desktop path;
pass another directory on other machines. The generator uses the combined catalog
for placement and metadata, and the Arabic source records to recover al-Thawrī
passages when a printed report label identifies one unambiguously. It preserves
catalog text, Arabic, English, notes, references, labels and volume/page citations.
The supplied Muqātil translation for suras 80–114 is staged in
`src/data/tafsir/source/muqatil-80-114-en.json`; the builder joins it by source
serial and splits multi-verse records at their printed verse markers. It retains
the English edition notes and Arabic catalog text. The source metadata attributes
the translation to Claude (AI); the reader identifies it as not independently
reviewed. Bilingual commentary is paired in English and Arabic columns on wide
screens and stacks Arabic before English on narrow screens.
The reader includes 18,334 unique source items safely placed at a verse or sura.
The catalog reports a further 757 Ibn Wahb reports without a safe sura locator;
they are not assigned to a verse or sura page. Sura-level material is kept apart
from verse entries in `surahMaterial`. Thawrī boundary and numbering corrections are
cross-checked against the quoted verse text and retained in the source summary.

| Work | Shamela book | Volumes |
|---|---|---|
| Tafsīr Mujāhid | 12810 | 1 |
| Tafsīr Muqātil ibn Sulaymān | 23614 | 5 (the fifth volume is editorial study material) |
| Tafsīr Sufyān al-Thawrī | 2229 | 1 |
| Tafsīr Ibn Wahb | 37361 | 3 |
| Tafsīr Yaḥyā ibn Sallām | 12851 | 2 |

## The sura page at scale

Built for a library of a hundred or more commentaries.

- **Color is per era**, not per book (`src/styles/tafsir.css`, `works.json` `eras`). Add a century to an era or add an era; the build refuses a century that is in none.
- **Choosing**: "Choose commentaries" opens a panel of native checkboxes grouped by century. Several can be ticked at once; each ticked one shows as a chip and as a collapsible row under every verse. Show-or-hide is one CSS rule per work using `:has()` and a `--off` custom property, so it works with scripting off. With scripting on there is a filter box, "Only those with entries here" and "Clear", and the selection is kept in `?w=id,id` and carried across the parts links.
- **Parts**: a sura over 33 verses is split into parts of 25 (`versePartsOf`). Part 1 is `/projects/tafsir/sura/N/`, the rest are `/projects/tafsir/sura/N/part/P/`. The verse map always covers the whole sura.
- **Per verse**: a header with a count of commentaries by era, the verse on a plate (English first in the DOM), the positions where the ten readers differ, the reading each chosen commentary follows, then one collapsible row per commentary that has something to say there. Source Arabic and available catalog English are shown with their language marked. A commentary with nothing on a verse renders nothing.
- **Sura-level material**: passages without a safe verse locator appear in a separate section on that sura's page and never receive an inferred verse number.

## A work's reading

`works[].reading` is `not_established` with `default: null` until it is established
from the commentary's own text. Then `default` names a riwāya (`{"kind": "riwaya",
"id": "warsh"}`) or a qāriʾ (`{"kind": "qari", "id": "nafi"}`) from the qirāʾāt data,
`status` is `proposed` or `reviewed`, `basis` says how, and `evidence` quotes the
passages with volume and page. Validation refuses a default without evidence.

With a default, every qirāʾāt position in a verse resolves to that transmitter's
group. A qāriʾ whose two transmitters differ at a position shows that, instead of
picking one.

## Entries

```json
{
  "schemaVersion": "tafsir-entries/0.2.0",
  "sura": 1,
  "entries": [
    {
      "id": "mujahid-1-4-a",
      "work": "mujahid",
      "verses": { "from": 4, "to": 4 },
      "lemma": "the Qurʾānic words as the book prints them, or null",
      "reading": [
        { "feature": "f-1-4-malik", "value": "alif" },
        { "form": "the book's form of a reading outside the ten", "note": null }
      ],
      "text": "the commentary, exactly as the edition prints it",
      "text_ar": "Arabic source text, or null",
      "text_en": "English text supplied by the catalog, or null",
      "citation": { "volume": null, "page": "193" },
      "review_state": "proposed"
    }
  ],
  "silent": { "thawri": [1, 2, 3] },
  "surahMaterial": [
    {
      "id": "source-item-surah",
      "work": "thawri",
      "verses": null,
      "placement": "surah",
      "text": "source text",
      "citation": { "volume": "1", "page": "41" },
      "review_state": "proposed"
    }
  ]
}
```

- `reading` overrides the work's default for that verse. A collated reading names a
  qirāʾāt position (`features[].id` in `src/data/qiraat/sura-NNN.json`) and one of its
  group `value`s; a stated reading keeps the book's own form.
- `silent` lists verses a work has been read for and has nothing on. A verse cannot be
  both silent and entered for the same work. Anything not entered and not silent is
  shown as not entered yet.
- Never paraphrase `text`, `lemma` or `form`. If the edition looks wrong, note it; do
  not correct it.
- `surahMaterial` is shown in its own section. Its null `verses` value is deliberate;
  never assign it a verse without a safe source locator.

## Extent

For the five second-century editions, `works[].extent` is measured from the catalog's
explicit placement under a sura. It describes the extent represented in this reader,
not necessarily every sura present in the complete printed edition.

## Adding a century

Add the century to `works.json` `centuries`, then its works. The hub groups by century
and the sura pages order works by the author's death date.
