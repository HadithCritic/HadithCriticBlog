# Library expansion review — 30 September 2026

The atlas now contains **261 works**, up from 229. This batch adds **32 works** and **367 citation edges**. All 229 previous work records and all 1,428 previous connections are preserved. Citation matches retain original PDF page evidence in `citation-evidence.json`; automated title/author matching can still miss abbreviated or damaged references. Representative new page matches were spot-checked. A false generic-wording match from Kara to Juynboll’s 1983 book was explicitly excluded; it actually refers to other works.

## Review coverage

- Reviewed the 976-entry Islamic Studies index and sampled every one of the 973 PDFs physically present in the folder, including alphabetical subfolders.
- Sampled up to four opening pages and 45 distributed body pages per PDF, using the existing scanner. This is a folder-wide relevance/text-layer screen, not a claim to have read all 973 PDFs in full.
- 869 PDFs had enough sampled text for screening; 104 did not. A text layer alone does not guarantee usable OCR: some additional PDFs have garbled encodings.
- Extracted the full PDF text for the selected additions and further candidates; checked front matter, opening arguments and representative citations.
- Excluded preceding encyclopedia entries, publisher matter and handbook contents from the new excerpt texts while preserving original PDF page numbers.
- Recovered the shifted Gentium Latin encoding in Görke’s comparative hadith chapter. Original library PDFs were not modified.

## Index integrity

The difference between 976 index entries and 973 physical PDFs is accounted for by three missing paths in the index’s Unidentified section: the al-Jūzjānī criticism article, the Trobisch book-review page, and the Syriac-heritage dictionary excerpt. The al-Jūzjānī article already has an atlas record attributed to Pavlovitch; no duplicate was created. No physical PDF in this folder was absent from the index.

## Added works

The internal, versioned source manifest is [library-additions.json](library-additions.json). It records source filenames and metadata checks; no local paths or source page numbers enter the public graph.

| Author | Work | Year |
| --- | --- | --- |
| Sean W. Anthony | Muhammad and the Empires of Faith: The Making of the Prophet of Islam | 2020 |
| J. Bruning | A Legal Sunna in Dhikr Ḥaqqs from Sufyanid Egypt | 2015 |
| Andreas Görke | Ḥadīth between Traditional Muslim Scholarship and Academic Approaches | 2020 |
| Andreas Görke; Gregor Schoeler | Reconstructing the Earliest Sīra Texts: The Hiǧra in the Corpus of ʿUrwa b. al-Zubayr | 2005 |
| Andreas Görke; Gregor Schoeler | The Earliest Writings on the Life of Muḥammad: The ʿUrwa Corpus and the Non-Muslim Sources | 2024 |
| Robert Hoyland | Writing the Biography of the Prophet Muhammad: Problems and Solutions | 2007 |
| Seyfeddin Kara | Debating the Origins: The Sanctity of Madina in Ḥadīth Narratives | 2026 |
| Andrew J. Newman | The Formative Period of Twelver Shīʿism: Ḥadīth as Discourse Between Qum and Baghdad | 2000 |
| Pavel Pavlovitch | Can We Reconcile Isnād, Matn, and Early Chronology? Isnād-cum-Matn Analysis and the Principle of Uncertainty | 2025 |
| Pavel Pavlovitch | Forgery in Ḥadīth | 2018 |
| Pavel Pavlovitch | Inna hādhā ʾl-ʿilma dīnun fa-ʾnẓurū ʿamman taʾkhudhūna-hu: Religion, Knowledge of Transmitters, and the Tyranny of the High Isnād | 2022 |
| Pavel Pavlovitch | Muslim b. al-Ḥajjāj | Not confirmed |
| Pavel Pavlovitch | One Name, Two Lives: Nāfiʿ, the Freedman of Ibn ʿUmar, in the Imagination of Early-Abbasid muḥaddithūn | 2026 |
| Pavel Pavlovitch | The Islamic Penalty for Adultery in the Third Century AH and al-Shafii's Risala | 2012 |
| Pavel Pavlovitch | The Life and Works of Abū al-Ḥusayn ʿAbd al-Bāqī b. Qāniʿ | 2021 |
| Pavel Pavlovitch | The Manda Family: A Dynasty of Isfahani Scholars | 2018 |
| Pavel Pavlovitch | The ʿUbāda b. al-Ṣāmit Tradition at the Crossroads of Methodology | 2011 |
| Ehsan Roohi | A Form-Critical Analysis of the al-Rajīʿ and Biʾr Maʿūna Stories: Tribal, Ideological, and Legal Incentives behind the Transmission of the Prophet’s Biography | 2022 |
| Ehsan Roohi | Between History and Ancestral Lore: A Literary Approach to the Sīra's Narratives of Political Assassinations | 2021 |
| Ehsan Roohi | The Murder of the Jewish Chieftain Kaʿb b. al-Ashraf: A Re-examination | 2020 |
| Uri Rubin | The Eye of the Beholder: The Life of Muhammad as Viewed by the Early Muslims: A Textual Analysis | 1995 |
| Stephen J. Shoemaker | The Death of a Prophet: The End of Muhammad's Life and the Beginnings of Islam | 2012 |
| Peter Webb | The Hajj Before Muhammad: The Early Evidence in Poetry and Hadith | 2023 |
| Shahab Ahmed | Before Orthodoxy: The Satanic Verses in Early Islam | 2017 |
| Christopher Melchert | Sufyān al-Thawrī and the Kufans | 2022 |
| Christopher Melchert | Kitāb al-Ḥujjah ʿAlā Ahl al-Madīnah and the Transition from Regional Schools to Personal | 2022 |
| Christopher Melchert | The Early Controversy Over Whether the Prophet Saw God | 2015 |
| Christopher Melchert | The Early Ḥanafiyya and Kufa | 2014 |
| Christopher Melchert | Al-Shāfiʿī against the Kufan School | 2022 |
| Christopher Melchert | How Ḥanafism Came to Originate in Kufa and Traditionalism in Medina | 1999 |
| Christopher Melchert | Ibrāhīm al-Nakhaʿī (Kufan, d. 96/714) | 2020 |
| Pavel Pavlovitch | The Sīra | 2018 |

## Metadata and overlap decisions

- Melchert’s Kitāb al-Ḥujjah article ends its title at *Personal*. The index adds *Schools*; the [Oxford record](https://ora.ox.ac.uk/objects/uuid%3Ae6f42a5a-66e7-4997-8f7b-03ffa41a8023) and the PDF confirm the shorter publication title.
- Pavlovitch’s handbook chapter *The Sīra*: the [publisher’s volume record](https://www.routledge.com/Routledge-Handbook-on-Early-Islam/Berg/p/book/9781138821187) establishes 2018, flagged pending direct confirmation in the excerpt.

- Görke’s *Ḥadīth between Traditional Muslim Scholarship and Academic Approaches*: the [University of Edinburgh record](https://www.research.ed.ac.uk/en/publications/hadith-between-traditional-muslim-scholarship-and-academic-approa/) supplies the 2020 volume identification. Year/venue remain flagged in the public record because they are not printed in the supplied chapter excerpt.
- Pavlovitch’s ʿUbāda article: the [journal’s author index](https://www.lancaster.ac.uk/jais/authorindex1.htm) supplies 2011 and pages 137–235; year/venue remain flagged pending confirmation in the PDF itself.
- Pavlovitch’s *Muslim b. al-Ḥajjāj* is a separate encyclopedia entry from the existing 2023 monograph. The supplied entry does not establish its publication year, so the atlas leaves it undated.
- Roohi’s Kaʿb article is dated to the supplied 2020 advance-online copy; its journal issue may carry a later date.
- Kara’s Medina article carries 2026 in the PDF, and Melchert’s *Al-Shāfiʿī against the Kufan School* carries the 2022 printed issue despite its 2021 copyright line.
- Görke/Schoeler’s complete 2024 book is one work. Its separate chapter 8 PDF is not duplicated as a second publication.
- Pavlovitch’s *Dating*, Motzki’s al-Zuhrī study, Görke’s Zaynab study, Melchert’s *Musnad al-Shāfiʿī* and Mitter’s women/hell study were already represented and were not added again.

## Next candidates, after text or scope checks

| Candidate | Remaining work |
| --- | --- |
| The Author and his Work in Islamic Literature of the First Centuries: The Case of ʿAbd al-Razzāq's Muṣannaf | Rotate/re-OCR: the text layer is badly garbled. Check reprint overlap before creating a second record. |
| Dating the So-Called Tafsīr Ibn ʿAbbās: Some Additional Remarks | Repair font encoding; an adjacent dating/tafsīr methods study. |
| The Traditions of Islam | Re-OCR the garbled or image-only copy before extracting citations. |
| The Sources of Islamic Law: Islamic Theories of Abrogation | Image-only scan: OCR is needed. |
| Ibn ʿAsākir and Early Islamic History | Image-only edited volume: OCR, then assess individual chapters. |
| When Shaykh Albani Disagrees with Himself (tr. Kose) | Partial image-only translation; attribute authorship to al-Ghareeb and translation to Kose. Keep modern reception/polemics distinct. |
| Islamic Methodology in History | Map the collected book’s overlap with the already present Social Change and Early Sunnah chapter. |
| Studies in the Origins of Early Islamic Culture and Tradition | Check contents for existing Cook essays before adding any new constituent work. |
| A Life with the Prophet? Examining Hadith, Sira and Qurʾan (Partial Volume) | Only a partial volume is available; identify exactly which studies the PDF includes. |
| Basra and Kufa as the Earliest Centers of Islamic Legal Controversy | An author manuscript with a bibliography revised in 2015; establish original publication and edition before dating it. |
| The Concluding Salutation in Islamic Ritual Prayer | Inspect the ritual-prayer paper’s publication metadata and distinguish legal description from hadith source criticism. |
| Renunciation (Zuhd) in the Early Shiʿi Tradition | Shiʿi renunciation: possible thematic expansion, requiring a scope decision. |
| Criteria for Dating Early Tafsīr Traditions: The Exegetical Traditions and Variant Readings of Abū Mijlaz Lāḥiq b. Ḥumayd | Early tafsīr dating: methodological relevance, but label exegesis accurately. |
| Remnants of an Old Tafsīr Tradition? The Exegetical Accounts of ʿUrwa b. al-Zubayr | ʿUrwa exegetical accounts: assess alongside the already represented sīra corpus. |
| The Popular Preachers and Storytellers (Quṣṣāṣ): The Earliest Historians, Exegetes and Legal Specialists in Islam (Qussas) | 2023 storytellers/preachers article: assess language and transmission focus; remove journal front matter. |
| In Search of Ali ibn Abi Talib's Codex History and Traditions of the Earliest Copy of the Quran | Qurʾān-codex traditions: adjacent ICMA, not automatically a core hadith study. |
| The Integrity of the Qurʾan: Sunni and Shiʿi Historical Narratives | Qurʾān integrity narratives: adjacent ICMA, not automatically a core hadith study. |

Other high-density PDFs concern Qurʾān readings, exegesis, piety or general Islamic history. They were not included solely because they mention hadith frequently. Primary texts and translations remain distinct from modern criticism.

The full local scanner output is `scratch/library-pdf-scan.jsonl` (not redistributed). Repeat the folder-wide screen with `python scripts/research-graph/scan.py <library-root> <output.jsonl>`.
