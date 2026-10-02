# Hadith criticism atlas: to-do list

Status as of 2026-09-30. The atlas maps 261 works. Ten of them are volumes that print other studies, and 114 of the works are studies printed inside those volumes. The 32-work library expansion and the remaining candidate queue are documented in [library-expansion-review.md](library-expansion-review.md). Everything below was deliberately left out or is still open.

## 1. Scanned PDFs waiting for OCR

Seven of the eleven priority scans were OCR'd on 2026-09-29 (folder `02 Full Text OCR Transcripts\ocrd`) and are in the atlas: Schacht *Origins of Muhammadan Jurisprudence*, Goldziher *Introduction to Islamic Theology and Law*, Azmi *Studies in Early Hadith Literature*, Motzki (ed.) *The Biography of Muhammad*, Dutton "ʿAmal v. Ḥadīth", Görke on al-Ḥudaybiya, and Cook "The Stemma" (a Qurʾān-codices article, kept because it was OCR'd). Azami's *Studies in Hadith Methodology and Literature* was already a text PDF in the same folder and is in too.

The OCR PDFs are searchable OCR, not corrected transcriptions. Citation edges into and out of them are found by title matching, so misread transliteration can hide a citation. Spot-check before relying on a missing edge.

Also waiting for OCR, from `Desktop\newtexts` (see `newtexts-manifest.md`):

- `Lucas_S_C_-_Constructive_Critics_Hadith_Literature_and_the_Articulation_of_Sunni_Islam.pdf`: six scanned chunks merged into one PDF, no text layer.
- `Motzki_H_-_The_Prophet_and_the_Cat_On_Dating_Maliks_Muwatta_and_Legal_Traditions.pdf`: rotated scan with garbage embedded text.
- `Hallaq_W_B_-_Was_al-Shafii_the_Master_Architect_of_Islamic_Jurisprudence.pdf`: the text layer is character-shifted and unreadable.

Still waiting for OCR. Copies are in `Desktop\PDFs to OCR\`. Nothing in `02 Full Text OCR Transcripts` covers them.

### Priority (4)

- Guillaume_A_-_Traditions.pdf
- Kose_S_-_When_Shaykh_Albani_Disagrees_with.pdf
- Lindsay_J_-_Ibn_Asakir_and_Early_Islamic.pdf
- Burton_J_-_The_Sources_of_Islamic_Law.pdf

### Secondary (24)

- Crone_P_-_Islam_Judeo-christianity.pdf
- Crone_P_-_Jahili_and_Jewish.pdf
- Crone_P_-_The_Book_of_Watchers_in.pdf
- Crone_P_-_Were_the_Qays_and_Yemen.pdf
- Crone_P_and_Hinds_M_-_God_s.pdf
- Donner_F_-_From_Believers.pdf
- Donner_F_-_Messianisme.pdf
- Donner_F_M_-_The_Role_of_Nomads.pdf
- Griffith_H_-_The_Sunna_of_Our_Messengers.pdf
- Hussein_T_-_The_Great_Fitna_-_II.pdf
- Melchert_C_-_Basran_Origins_of_Classical_Sufism.pdf
- Melchert_C_-_Ibn_Mujahid_and_the_Establishment.pdf
- Melchert_C_-_Sufis_and_Competing_Movements_in.pdf
- Melchert_C_-_The_Adversaries_of_Ahmad_Ibn.pdf
- Melchert_C_-_The_Etiquette_of_Learning_in.pdf
- Melchert_C_-_The_Hanabila_and_the_Early.pdf
- Melchert_C_-_The_Hanbali_Law_of_Jihad.pdf
- Melchert_C_-_Whether_to_Keep_Women_Out.pdf
- Watt_W_M_-_Prophet_and_Statesman.pdf
- Donner_F_-_Narratives_of_Islamic_Origins.pdf
- Melchert_C_-_The_History_of_the_Judicial.pdf
- Robinson_C_-_Islamic_Historiography.pdf
- Crone_P_-_Roman_Provincial_and_Islamic_Law.pdf
- Crone_P_-_Two_Legal_Problems.pdf

Note: `Watt_W_M_-_Prophet_and_Statesman.pdf` reports 0 pages and may be corrupt.

## 2. Text layer present but unusable

- `Guillaume_A_-_The_Traditions_of_Islam.pdf` (Internet Archive copy): the embedded text is garbled and needs re-OCR. It is the same book as the scanned `Guillaume_A_-_Traditions.pdf`.

## 3. Bibliographic details to confirm

Works with no printed year yet: Al-Jūzjānī's Approach to Hadith Criticism and His "Antagonism toward ʿAlī": A Comparative Analysis; Mohammed and Islam; Muslim Studies (Muhammedanische Studien), Volume 2; The Notion of Truth in Hadith Sciences; Ḥadīth and Sunnah: Ideals and Realities.

Fields entered from editorial knowledge and not printed in the front matter (flagged `unconfirmed` in the data):

- An Introduction to Islamic Law: year
- The Opponents of the Writing of Tradition in Early Islam: year, venue
- Authorship in the Sīra Literature: title
- How to Cite Hadith: Some Proposed Conventions: year

Works without a DOI (books, theses, older articles) are listed in the atlas without a link: 20 of 85.

The Cook, "The Opponents of the Writing of Tradition", copy in the library is a later revision of the 1997 article (it cites 2002 work); the atlas dates it 1997 and says so.

## 4. Data still to add

- **OpenAlex enrichment** (citing works since 2023, citation counts, abstracts). The free anonymous budget for this network was exhausted; it needs an API key from a free OpenAlex account. This is what would power a real "latest research" feed.

- **Tier B review** (205 adjacent works in `inputs/triage.csv`, tier column). Decide which belong in the atlas.

- **Classical and Muslim-scholar sources.** The library has almost no muṣṭalaḥ manuals or Muslim-scholar responses; an atlas of hadith criticism will look lopsided without them.

- **Links to HadithCritic studies.** Only the ten-promised-Paradise and al-Zuhrī studies are linked so far; each link was verified by hand. More need the same check.

## 5. Site follow-ups

- The search dock and filter chips now exist in three page-local copies (`/resources`, `/projects/academic-studies`, `/research`). Fold them into one global component and delete the copies in the same commit (see the scoped-style trap in CLAUDE.md).

- `/research/` is not linked from the header or `/projects` yet.

- No social preview card for `/research/` yet.

## 6. Problems in the existing library catalogs

- `03 Catalogs and Bibliographies/*Bibliography*`: titles are truncated and years are guessed from OCR text (its own note says "YEAR UNVERIFIED"; *Modern Hadith Studies* is dated 1850).

- `OCR_AUDIT_REPORT.md`: reports 2,706 OCR files and 0 partial; the folder holds 791 transcripts, none of them OCR.

- `Completed Books Master Catalog` and `00 Catalog Index`: name transcripts by the pretty source name, which does not match the underscore filenames on disk (472 of 846 entries).

## 5. Studies inside volumes

`inputs/chapters.json` lists the studies printed inside ten volumes: Motzki's *Ḥadīth: Origins and Developments*, *Analysing Muslim Traditions*, the Motzki festschrift, the Wiley Blackwell *Concise Companion to the Hadith*, *Modern Hadith Studies*, Duderija's *The Sunna and its Status in Islamic Law*, Koya's *Ḥadīth and Sunnah*, Motzki's *The Biography of Muhammad*, *Islam at 250* (Sijpesteijn and Adang) and Berg's *Method and Theory in the Study of Islamic Origins*. Each study is a work of its own with a part_of link and the printed page it begins on.

- **Left out on purpose:** chapters that are not about ḥadīth, sīra or rijāl (Qurʾān manuscripts, modern Salafi debates, mysticism, Gilliot on the ḥanīfs and similar) and Koya's Part Three (spiritual dimension). They stay in `chapters.json` as `"skip": true` boundary entries so the neighbouring study's pages end in the right place. Remove the flag to add one.
- **Not decomposed:** Shah, *The Ḥadīth* (Critical Concepts) is only 74 pages in the library (front matter and contents), so its reprinted articles have no text to read.
- **Years:** Koya's chapters have no printed year and are marked unconfirmed. Chapters printed for the first time in a volume take the volume's year. Reprints take the year of first publication, with the original venue in the venue field.
- **DOIs:** `scripts/research-graph/lookup_dois.py` accepts a Crossref match only when the title and author agree and books are book records. A DOI set by hand in `extras.json` wins over that match, because the automatic match can land on a reprint chapter. Works without a DOI are listed without a link.
- **Page offsets:** each volume's `offset` (PDF pages before printed page 1) or `spread` (two printed pages per PDF page, used for the Biography scan) was set by reading the volume's own page numbers, and every study's opening page was checked for its author or title.

## 6. Works added from `newtexts`

Twenty-six works from `Desktop\newtexts` plus the *Islam at 250* and Berg volumes were added on 2026-09-29. `extras.json` records each with `"dir": "newtexts"` or `"lib"`. Hand-set fields:

- Brown, "Did the Prophet Say It or Not?": year and venue are from memory and flagged unconfirmed.
- Ehteshami, "The Four Books of Shiʿi Hadith": Crossref gives volume 29.3 but dates it 2021 (online first). The printed issue is probably 2022.
- Motzki, *The Origins of Islamic Jurisprudence*: carries `originalYear` 1991 because the German original is what Schoeler (1996) cites.
- Held back, still to decide: the Lowry translation of al-Shāfiʿī's *Risāla* (a primary source). The full 2024 Görke/Schoeler book was added on 2026-09-30.

## 7. Library expansion metadata checks (2026-09-30)

Pavlovitch’s separate EI3 entry *Muslim b. al-Ḥajjāj* still needs a publication year from publisher/front matter. Görke’s comparative hadith chapter and Pavlovitch’s ʿUbāda article have institution/journal metadata sources recorded in `library-additions.json`; their year/venue fields remain flagged until confirmed directly in the supplied PDFs.
