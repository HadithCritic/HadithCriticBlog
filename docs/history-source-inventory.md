# History source inventory

The earlier source scan was checked 2026-10-14. The additional English-edition
drafts in `C:/Users/Jonathan/Desktop/t/tariikh/` were checked 2026-10-16. This
is an inventory of evidence found, not a claim that any translation is complete,
reviewed, or ready to publish.

## Earlier translation project

Update 2026-10-15: the user supplied `C:/Users/Jonathan/Desktop/tarikh/`, containing
new Arabic Markdown exports of al-Ṭabarī (Ketab 10764, 3,305 page blocks),
al-Balādhurī (23946, 609), and Khalīfa ibn Khayyāṭ (5305, 432), plus a scanned
Khalīfa PDF. These are not the missing older English database. A new local
translation workspace and 26 unreviewed Khalīfa pilot passages are documented in
`docs/tarikh-translation-pipeline.md`. Nothing from this pilot is published on
the website, and it does not establish that any complete book is translated.

Later on 2026-10-15, Codex translated and source-compared all 432 supplied
Khalīfa text pages. The completed local machine draft, 96 recorded corrections
and seven unapplied review proposals are documented in
`docs/khalifa-complete-translation.md`. It is not human-reviewed or published;
the missing older database has not been recovered by this work.

## Additional English-edition drafts

The supplied `tariikh/` folder contains eight work folders. Their `English.md`
title pages identify the titles and authors below; each folder also contains an
English-edition PDF. Build metadata marks the seven machine-prepared editions
with a `human_scholarly_review` value of `false`. These drafts are not published
as site readers.

| Work | Author | Contents represented in the edition |
|---|---|---|
| *Tārīkh Khalīfa ibn Khayyāṭ* | Khalīfa ibn Khayyāṭ (d. 240 AH / 854 CE) | Annalistic reports on early Islamic history, people and campaigns. |
| *The Conquests of the Lands* (*Futūḥ al-buldān*), Part 1 | Al-Balādhurī (d. c. 279 AH / 892 CE) | Conquests, settlements, agreements and local traditions across the early caliphate. |
| *Genealogies of Quraysh* (*al-Munammaq fī akhbār Quraysh*) | Muḥammad ibn Ḥabīb al-Baghdādī (d. 245 AH / 860 CE) | Quraysh lineages, alliances and remembered Meccan events. |
| *The Well-Informed* (*al-Muḥabbar*) | Muḥammad ibn Ḥabīb al-Baghdādī (d. 245 AH / 860 CE) | Arab and Quraysh social memory, leaders, lineages, expeditions and customs. |
| *Conquests of Egypt and the Maghrib* (*Futūḥ Miṣr wa-l-Maghrib*) | ʿAbd al-Raḥmān ibn ʿAbd Allāh ibn ʿAbd al-Ḥakam (d. 257 AH / 871 CE) | Egyptian history, its conquest, and accounts extending into the Maghrib. |
| *The Book of Apostasy* (*Kitāb al-Ridda*) | Muḥammad ibn ʿUmar al-Wāqidī (d. 207 AH / 823 CE) | The Saqīfa, the apostasy movements and the Ridda campaigns. |
| *The Book of Knowledge* (*al-Maʿārif*) | ʿAbd Allāh ibn Muslim ibn Qutayba al-Dīnawarī (d. 276 AH / 889 CE) | Genealogies, prophets, rulers and notable people. |
| *Knowledge and History* (*al-Maʿrifa wa-l-tārīkh*) | Yaʿqūb ibn Sufyān al-Fasawī (d. 277 AH / 890 CE) | Historical reports and transmitter biographies shaped by the author’s travels. |

Content summaries above follow the English-edition headings. They describe the
drafts’ scope and do not establish translation quality or completeness.

A surviving catalog claims 290 fully translated books: 186 sīrah and 104 tārīkh.
Those are the catalog's historical figures, not independently verified current
database counts. Its title and completeness claims have not been adopted as
publication status. No translation method or human review is established.

Surviving files:

- `C:/Users/Jonathan/.gemini/antigravity-ide/brain/47c5040a-14d9-4ea7-a324-067314318450/fully_translated_sirah_tarikh_catalog.md`
- `C:/Users/Jonathan/.gemini/antigravity-ide/brain/47c5040a-14d9-4ea7-a324-067314318450/scratch/analysis_7_tarikhs_clean.txt`
- In the same `scratch` directory: `analyze_7_tarikhs.py` and `extract_tarikh_1_to_7.py`.

The saved analysis includes Arabic and English excerpts, Arabic footnotes,
edition metadata, and these exported-page counts. These are page records from
the saved report, not narration counts or newly verified completeness totals.

| Book ID | Title as recorded in the analysis | Exported page records |
|---|---|---:|
| 7536 | The Fitnah and the Battle of the Camel | 184 |
| 12222 | *Al-Raddah* with an Epitome on the Conquests of Iraq and the Account of al-Muthannā ibn Ḥārithah al-Shaybānī | 225 |
| 37473 | The Crowns of the Kings of Ḥimyar | 490 |
| 6615 | The History of Khalīfah ibn Khayyāṭ (*Tārīkh Khalīfah ibn Khayyāṭ*) | 433 |
| 12205 | Al-Muḥabbar (The Informer) | 503 |
| 12212 | Al-Manmaq fī Akhbār Quraysh (The Ornamented Account of Quraysh) | 431 |
| 30741 | The History of Abū Zurrāʿah al-Dimashqī | 574 |

The analysis reports no English footnotes for these seven books. Preserve its
wording as evidence; do not silently correct titles or transliterations while
recovering the source files.

The scripts reference these paths, none of which were present during this scan:

- `C:/Users/Jonathan/Desktop/silsilah/sirah_tarikh.db`
- `C:/Users/Jonathan/Desktop/silsilah/tarikh_extracted_1_to_7/`

Saved session metadata also records earlier projects at:

- `C:/Users/Jonathan/Desktop/shamela monir/tarikh_project/`
- `C:/Users/Jonathan/Desktop/Tarikh - Islamic Histories (Shamela)/`

Neither project directory was present. The current
`C:/Users/Jonathan/Developer/silsilah/` contains `ocr_pipeline` and `pdf_cache`,
but the sought database and seven JSON exports were not found there.

## Readable local library files

Under `C:/Users/Jonathan/Desktop/org/05 Scholarly Library and OCR/`:

| Relative path | Evidence / next step |
|---|---|
| `01 PDF Library Collections/Islamic Studies/T/al-Tabari - The History of al-Tabari (Vol. 5, The Sasanids, the Byzantines, the Lakhmids, and Yemen).pdf` | Published English PDF present. Verify title page, translator, edition and permissions before importing text. |
| `01 PDF Library Collections/Islamic Studies/T/Al-Tabari - Al-Tabari's History, Vol 39 -Biographies of the Prophet's Companions and their Successors.pdf` | Published English PDF present; separate volume, not proof of a complete series. |
| `02 Full Text OCR Transcripts/T/Tabari_A_J_-_Volume_05.md` | OCR transcript present. Needs comparison with the printed translation before publication. |
| `01 PDF Library Collections/Islamic Studies/B/al-Baladhuri - History of the Arab Invasions, The Conquest of the Lands (tr. Kennedy).pdf` | PDF present. The translator in the filename is unverified; check the title page rather than adopting this attribution. |
| `01 PDF Library Collections/Islamic Studies/T/Al-Tabari - tarykh altbry.pdf` | Additional PDF; language and edition not established. |

`C:/Users/Jonathan/Documents/Codex/2026-09-24/ta/work/history_catalog.txt`
contains Shamela history book metadata, including Khalīfa (6615) and
Futūḥ al-buldān (12221). This is a catalog, not translated text.

The file `Musnad Khalifah ibn Khayyat.json` under the Master Hadith JSON Library
is a different work. It is not evidence that Khalīfa's history is available.
Likewise, the site's existing al-Ṭabarī tafsir data is a different work.

## Scan scope and Google Drive

Local discovery covered the user's Desktop, Documents, Downloads, Research,
Developer, PycharmProjects, OneDrive, Proton Drive, Calibre Library, C:/data,
C:/backups and C:/C. A broader C: filename pass supplied the surviving session
and analysis leads. A second pass included ignored files in likely source
directories. System and package trees were excluded from the final targeted
pass. Access errors and volatile files mean this is not proof of absence from
every possible location. Scratch scan listings remain under `scratch/history-*`.

Google Drive was searched after the user's explicit request. Queries included
`sirah_tarikh`, `sirah_tarikh.db`, `tarikh`, `Khayyat`, `Baladhuri`,
`تاريخ خليفة`, and `fully_translated`, plus name filters for those authors,
book IDs, database/Parquet extensions, translation folders, Shamela and Silsilah.
No copy of the history database or seven JSON exports was located.

Drive did return research documents, Arabic source excerpts and a hadith
monograph index. None establishes that the requested translated histories are
available. A candidate Parquet folder was empty; its parent was a `tests`
directory. A `translation` folder belonged to `qiraat_sources` and was not a
history lead. No Drive organization or sharing settings were changed.

## Publication boundary

The initial History page is a project introduction and source catalog. It
publishes no recovered excerpts or third-party PDFs and offers no nonfunctional
reader, map, or timeline. It distinguishes prior translation records from
identified published editions. Full-text reading and visualizations are marked
as in preparation. Recover the full exports, verify provenance and translation
method, preserve page and edition IDs, and review the text before enabling them.

## Interface direction

Editorial source library using the existing Astro, Cormorant, Source Serif,
IBM Plex, and theme-token system. Design variance 5, motion intensity 2, visual
density 4: a restrained source shelf with native disclosures, no new animation.
The archive introduction is a fixed-dark editorial plate in both themes,
consistent with the Projects index. No long-form history reader is published
yet. Desktop and mobile project menus share one component.

Each book has an individual historical landscape painting following the user's
reference image. Illustration subjects, references and asset locations are
recorded in `docs/history-artwork.md`. They are thematic illustrations, not
reconstructions of particular events.

## Verification

- `npm run check`: no errors or warnings (existing informational hints only).
- `npm run test:design`: passed; existing unrelated article warnings remain.
- `npm run build`: passed, including Pagefind indexing.
- Browser smoke checks passed in dark and light at 1440, 768 and 390 pixels:
  source list, edition disclosures, desktop/mobile menu links, project-page
  listing and eight-row project table, no horizontal overflow, no page errors.
- Native disclosures and project menu also worked with JavaScript disabled.
- `scripts/check-contrast.mjs --route /projects/history/ --open-details`:
  zero contrast failures in both themes.
- Desktop dark and mobile light screenshots were visually inspected. Review
  images and logs remain under `scratch/history-review/` and `scratch/history-*`.
