# Data completion audit and plan: Fiqh Compass, Qirāʾāt, Tafsir

Dated 2026-10-06. Status audit of three projects, written before any large ingestion or transformation. Every figure below was read from the files named beside it on this date. Where a project's own notes disagree with its data, the data wins and the disagreement is listed.

The three projects are at very different stages:

| Project | Stage | Public surface today | Binding gate |
|---|---|---|---|
| Qirāʾāt | Mature extraction pipeline; one source being completed book by book | 103 sura pages, rules, transmission | Second-witness reading, owner review, rights on embedded Shamela quotations |
| Tafsir | Five works fully placed; nothing beyond the second century imported | 114 sura pages, now showing 18,334 passages (labelled proposed) | Placement review, translation provenance, rights |
| Fiqh Compass | Research scaffold; zero reviewed evidence | Quiz, issue register, profiles, methodology | Bilingual and specialist review of every position; edition identity; rights |

---

## 1. Qirāʾāt Variants

### What exists

- **Pipeline** (`scripts/quran/qiraat/`): frozen farsh parser, review kit, `apply-farsh-review.py`, the `verify-farsh-items.py` gate (exact substring of the cited page, reader spans inside evidence, page coverage), `build-qiraat.py`, plus drafters for an-Nashr, al-Mabsūṭ and as-Sabʿa and a routes kit.
- **Generated data** (`src/data/qiraat/index.json`): 103 suras, **2,110 positions, 8,270 farsh claims**, 60 batches; rules index 168 rules in 41 chapters, 322 claims.
- **Taḥbīr at-Taysīr (5556)**: all 339 farsh pages (282 to 620) accounted for, zero verifier errors and gaps; rules pp. 181 to 281 entered. This is the spine.
- **at-Taysīr (5527)**: farsh pp. 72 to 168 checked (97 pages, `farsh/taysir/`, 180 files). Next page is 169.
- **an-Nashr, al-Mabsūṭ, as-Sabʿa**: mapped onto existing positions only where a complete statement agrees and reads cleanly; the rest sits in `second-witness/` queues.
- **Routes**: 448 route entries on 193 positions; 1,900 route passages held in `second-witness/route-detail.json`.
- **Source exports** (`Desktop/qiraat_sources`): ten Arabic Shamela JSONs. The five in use match the verifier's page cache byte for byte (2,857 of 2,857 pages, `SOURCE-AUDIT-2026-09-30.md`). The next five (al-Tajrīd 1273, Jāmiʿ al-Bayān 37649, Irshād 1283, al-Kanz 29864, al-Durra 7749) are exported but untouched.
- **Translations** (`qiraat_sources/translation/`): bilingual Taysīr, Taḥbīr and Mabsūṭ files. They name no translator; the audit treats them as aids, never as evidence. Correct.

### The unused asset: van Putten's Taysīr

`qiraat_sources/obp.0475.pdf` is Marijn van Putten, *al-Dānī's al-Taysīr fī al-Qirāʾāt al-Sabʿ: A Translation with Linguistic Commentary* (Open Book Publishers, 2026), 359 pages, **CC BY-NC 4.0**. Nothing in the repository references it.

Checked today:

- It translates **Otto Pretzl's 1930 edition**, which is the edition Shamela 5527 reproduces (Beirut reprint, 1984).
- It prints Pretzl page breaks inline as `(P:72)`, `(P:73)`. `(P:72)` falls exactly where Shamela 5527 p. 72 ends (after the huwa/hiya rule at 2:29), and `(P:73)` where p. 73 ends. The translation is therefore **page-aligned to the Arabic the project already cites**.
- Each farsh statement is prefixed with its verse number (`9:`, `10:`, `36:`), and readers are named in full, with the reading resolved in transliteration (`i.e., yukaḏḏibūna`).
- Footnotes record where he follows al-Ḍāmin's 2008 corrections against Pretzl, which are exactly the edition-misprint cases the verifier has to handle.

This is a reviewed, human, scholarly witness to the reader-to-form assignments of the book the project is currently extracting.

### Authoritative vs provisional

| Authoritative (as source) | Provisional |
|---|---|
| Arabic page text of the five books (hash-matched exports) | Every claim on the site: LLM read-through, mechanically verified, not owner-approved |
| Book structure facts the books state about themselves (group terms, p. 104) | Verse anchors marked weak (77) or none (69) |
| van Putten's translation, as an attributed scholarly reading | The bilingual JSON translations (translator unrecorded) |
| | Second-witness agreement counts (machine triage) |

### Gaps

1. at-Taysīr farsh pp. 169 to 226, uṣūl pp. 19 to 71, end matter pp. 226 to 228, and the unresolved spans in `taysir/COVERAGE.md`.
2. al-Mabsūṭ queue: 144 partial, 529 not located, 391 yāʾ-list results unread; agreements unsampled.
3. an-Nashr queue: 355 agreeing items with routes, several places or exceptions; 104 differences; 91 not located.
4. as-Sabʿa: passages outside mapped positions not reviewed.
5. Five unresolved spans in Taḥbīr; the Iraqi route at 39:7.
6. The next five books: no method documents yet.
7. The 11 suras without positions (62, 94, 95, 100, 103, 105, 107, 108, 110, 113, 114) all carry a reason in `silent-suras.json`. `ROADMAP.md` still says 13; that figure is stale.

### Normalization still needed

- **One status source.** `ROADMAP.md` says 1,930 positions and 3,927 claims; `SOURCE-AUDIT` says 1,999 and 6,591; `HANDOFF` says 2,110 and 8,270. The build should write a `status.json` (counts per book, per tier, per review state) and every document should cite it rather than restating numbers.
- **A per-claim review field** with values `machine`, `llm-read`, `cross-checked` (van Putten or a second book agrees), `owner-reviewed`. Today the site has one label ("proposed") for all four states.
- **Witness type on each claim**: `primary`, `independent-witness`, `dependent` (Taḥbīr is Taysīr plus additions, so Taysīr is not independent of it; `ROADMAP.md` already says so, the data does not encode it).

### Safe automation

- **van Putten alignment** (highest yield): parse the PDF into `{pretzl_page, verse, statement_en}` records; join to `farsh/taysir` items by page and verse; flag every Taysīr item whose verse or reader set disagrees with his statement. This is a check, not a source of claims: output goes to a review queue, never into `claims/`.
- Re-running `nashr-compare.py` and `witness-compare.py` after each batch.
- Generating per-page skeletons for at-Taysīr pp. 169 to 226 with his verse numbers as anchor hints, so each page's reading starts with the verse already known.

### Requires human or specialist review

- Owner sign-off on a sample of claims per book (`ROADMAP` tier 3).
- Every disagreement the van Putten join flags.
- Route-sensitive differences (Rawḥ vs Ruways, Hishām vs Ibn Dhakwān).
- Rights: CC BY-NC permits non-commercial display of van Putten's English with attribution; confirm the site counts as non-commercial (no ads, no paid tier) before showing his translation. The Shamela quotation question is unchanged and still open.

### Order of operations

1. Write `status.json` from the build; point the docs at it. (Half a day.)
2. Build the van Putten parser and join, read-only. Run it over pp. 72 to 168 first; that measures the existing Taysīr batches against a human witness. (One to two days.)
3. Continue at-Taysīr from p. 169 with his verse numbers as hints, through p. 226, then uṣūl pp. 19 to 71. (Largest block.)
4. Add the `review` and `witness` fields; show "cross-checked" on positions where van Putten agrees.
5. Read the al-Mabsūṭ partial and not-located queues; then the an-Nashr remainder.
6. Owner sample review and the rights ruling.
7. Only then the next five books, each starting with its own method document.

### Biggest accuracy gain fastest

Step 2. It turns 97 pages of LLM-read Taysīr batches into batches checked against a published scholar's reading, at the cost of a parser, and it does the same for every page still to come.

### Risks

- **Treating his English as evidence.** His transliterations are interpretations of the Arabic descriptions. They may check a claim; the claim's evidence stays the Arabic span.
- **Dependent witnesses counted as corroboration.** Taysīr agreeing with Taḥbīr is not two witnesses.
- **Unit id drift**: any change to `authorities.json` or the parser moves ids; re-apply every review after such a change (already documented).
- **Rights**: the HANDOFF says the module is "not cleared for deployment", while the `drafts` branch renders it. Decide which is true before `main`.

---

## 2. Tafsir Reader

### What exists

- **Five second-century works**, all imported (`src/data/tafsir/`): Mujāhid (Shamela 12810), Muqātil (23614), al-Thawrī (2229), Ibn Wahb (37361), Yaḥyā ibn Sallām (12851). `works.json` carries edition, editor, publisher and measured extent for each.
- **18,334 unique passages placed** (16,322 verse entries and 2,644 sura-level passages before de-duplication by source id). Ibn Wahb has 757 reports with no safe sura locator, kept out of the reader. Placement adjustments for al-Thawrī are recorded with reasons in `second-century-source.json`.
- **Placement basis per entry** (`locator_status`): explicit numbered verse markers (Muqātil, 6,191), explicit citations in source sections (6,330), explicit Arabic verse citations (1,997), catalogue locators (715), cross-references (745), English-text locators (326), and 18 corrections made after checking the source wording.
- **Review state**: all 16,322 entries are `proposed`. No entry is reviewed.
- **English**: 14,788 entries have none; 1,059 carry "English text supplied in catalog" (Ibn Wahb and al-Thawrī; the translator is not recorded in `translation/*.json`); 475 carry an AI translation (Muqātil 80 to 114).
- **Reading layer**: every work's `reading.status` is `not_established`. The qirāʾāt join exists in code (`readVerse`) and is unused because no default reading has evidence.
- **Source library** (`Desktop/tafsir`): 271 Shamela tafsir book ids, indexed by century with edition-comprehensiveness ranking (`TAFSIR_CHRONOLOGICAL_INDEX.md`): 7 works in the third century, 7 in the fourth, 12 in the fifth, 11 in the sixth, and so on. `SURAH_ORGANIZATION_AUDIT.md` ranks which texts have explicit verse boundaries (Muqātil, al-Baghawī, al-Ṭabarī 7798).
- **Print witnesses**: scans of the Ibn Wahb (645 pp.) and al-Thawrī (482 pp.) editions sit in `02 century AH/translation/pdf/`. These can check the cited volume and page against print.

As of this session the sura pages display the passages, each with volume and page, "Placement proposed", and an English provenance label.

### Authoritative vs provisional

| Authoritative (as source) | Provisional |
|---|---|
| Arabic text as exported from the named Shamela edition, with its volume/page | Every verse placement |
| Edition metadata in `works.json` | Catalogue English (translator unrecorded); AI English |
| | Era assignments (death-date proxies, stated as such) |

### Gaps

1. No placement has been reviewed, including the 18 already corrected.
2. Translator identity for the 1,059 catalogue English entries.
3. Nothing from the third century onward, although the reader was built for a hundred works.
4. No reading (qirāʾa) established for any work.
5. Shamela digital volume/page has not been compared with print for any work, though two scans are on disk.

### Normalization still needed

- Split `translation_status` into structured fields: `translation_source` (`catalogue`, `ai`, `published`, `none`), `translator`, `review_state`.
- Split `locator_status` into a controlled vocabulary (`printed-marker`, `explicit-citation`, `catalogue`, `cross-reference`, `corrected`) so the reader can show placement strength per passage.
- One `source_entry_id` scheme across works (Ibn Wahb and al-Thawrī use catalogue serials; Muqātil uses Shamela record serials).
- A sha256 per passage, so a re-export can prove which passages changed.

### Safe automation

- **Placement self-check**: for every entry whose text quotes Qurʾānic wording in braces, match the quotation against the Cairo text of its assigned verse and flag mismatches. This is the same anchoring the qirāʾāt verifier already does, and it would test 16,000 placements mechanically.
- **Print locator sampling** against the Ibn Wahb and al-Thawrī scans (OCR is poor for al-Thawrī; sample by eye).
- **Importing the next works** by the method already used, starting with works whose verse boundaries are explicit (al-Ṭabarī 7798 has `القول في تأويل قوله` headings; ʿAbd al-Razzāq 21791 is report-structured).

### Requires human review

- A placement sample per work (start with the 745 cross-reference placements and the 715 catalogue placements; numbered markers are the strongest).
- Every AI and catalogue English passage before it loses its "not reviewed" label.
- Establishing a work's reading from its own text (`works[].reading`, which validation already requires to carry quoted evidence).

### Order of operations

1. Structured provenance fields and passage hashes (a schema bump to `tafsir-entries/0.3.0`, migrated by script, no text touched).
2. The brace-quotation placement check across all five works; read every flag.
3. A reviewed sample per work, recorded as `review_state: reviewed` on those entries only.
4. Third-century imports: ʿAbd al-Razzāq (21791) and al-Ṭabarī (7798, the edition the index ranks first), each with its own extraction note, as the second-century works have.
5. Reading evidence for the five early works where their text states one.

### Biggest accuracy gain fastest

Step 2. It costs one script and turns 16,000 unexamined placements into a known-good set plus a short reading list.

### Risks

- **The display now shows unreviewed placements publicly** (owner's choice this session). Keep "Placement proposed" until a review field says otherwise; never remove the label in bulk.
- **AI English read as translation.** It is labelled per passage; keep the label in any export or social card.
- **Al-Ṭabarī's size** (two editions; reports often span several verses) can multiply duplicates across verses. Keep the "print once, point back" behavior the reader now uses.
- **Rights**: the same open question as the qirāʾāt quotations, now for 18,334 passages.

---

## 3. Fiqh Compass

### What exists

Read from `scratch/fiqh-compass/fiqh-compass-research.sqlite` (read-only) and `docs/research/fiqh-compass/`:

- **Instrument**: 12 provisional axes, 24 live draft questions (Q01 to Q24), a private bank of 96 (Q25 to Q96 unscored).
- **Issues**: 20, all `dossier_status: candidate_evidence`.
- **Positions**: 28, all `epistemic_status: candidate`; attribution types recorded (17 author argument, 7 author statement, 3 later attribution, 1 represented opponent). Every issue has one to three.
- **Passages**: 11,737 retrieval candidates from 20 Shamela sources; 24,360 question-to-passage links, all `unreviewed`.
- **Translations**: 28 segments, all `Codex working translation`, `working_draft`.
- **Review events**: 28, all `automated_editorial_triage`. No human review exists.
- **Profiles**: 8 candidates (al-Shāfiʿī, al-Sarakhsī, Ibn Ḥazm, Ibn Rushd, Ibn Qudāma, Ibn al-Mundhir, al-Ṭabarī, al-Shāṭibī), coordinates `not_computed`.
- **Source catalogue**: 8,538 Shamela book ids reconciled with `shamela_full_merged.parquet` (7.9 GB, 7,552,019 rows; both files present on disk). Relevant categories: uṣūl al-fiqh 247, fiqh general 206, Ḥanbalī 151, Shāfiʿī 88, Mālikī 87, Ḥanafī 85, qawāʿid 57, masāʾil 425.
- **External acquisition**: 5 works, 7 manifestations, 10 access records, **0 rights-cleared**.
- **Public evidence manifest** (`src/data/fiqh-compass-evidence.ts`): empty, and the browser fails closed. Correct.
- **Roadmap gates**: zero of eight milestones passed (`roadmap-gates.md`).

### Authoritative vs provisional

Nothing in the research store is authoritative yet. The catalogue reconciliation (ids, serial ranges, hashes) is the only verified layer, and it proves availability, not content.

### Gaps

1. Human bilingual and specialist review of any position.
2. Edition identity: digital volume/page versus printed page for any cited passage (I17 has a candidate scan concordance, not a witness).
3. Direct sources for Ibāḍī, Zaydī, Imāmī, Ismāʿīlī and Qurʾān-alone approaches (catalogue scan found none that represent those traditions in their own works).
4. Comprehension testing of the 24 items (M5).
5. A frozen scoring specification.

### Normalization still needed

- **Passage de-duplication**: 11,737 candidates across 20 sources almost certainly include the same passage retrieved by several queries or issues. Key on `(source_id, corpus_serial)` and keep a many-to-many link to issues.
- **Page labels**: 40,878 corpus rows lack a usable page label and 314 rows are literal sentinels (`LLM-PROJECT-HANDOFF.md` §6). Flag these rows once in the store so retrieval never cites them as page evidence.
- **Question-evidence triage**: 24,360 links is not reviewable. Collapse to passages actually linked to a position (28) plus a ranked shortlist per question.

### Safe automation

- De-duplication and page-label flagging (deterministic, reversible).
- Re-running retrieval with the recorded hashes to prove reproducibility.
- Ranking candidate passages per issue by exact-term density, to build review packets, never to promote a passage.

### Requires human or specialist review

Everything that would change what the site says: every position, every translation, every question-to-issue mapping, profile scope, and the scoring contract. An LLM cannot pass these gates (the project's own rule, and the right one).

### Order of operations

1. **Narrow the review target.** Eight profiles across twenty issues is 160 cells, of which 64 have no candidate at all. Pick two or three profiles with direct sources (for example Ibn Qudāma, Ibn Ḥazm, al-Shāfiʿī) and the issues where they have candidates, and take only those to review.
2. De-duplicate passages; flag unusable page rows.
3. Build one review packet per selected position: Arabic span with hash, context, edition, digital locator, the working translation marked as such.
4. Reviewer passes (bilingual, then specialist), recorded as `review_event` rows with a human `reviewer_role`.
5. Edition matching for reviewed passages only (scan concordance, as attempted for I17).
6. Comprehension interviews on Q01 to Q24 (M5) in parallel, since they need no source work.
7. Only after 4 and 5: add approved passages to the public manifest, one at a time.

### Biggest gain fastest

Step 1. The bottleneck is reviewer time, not data. Concentrating it on a few fully sourced profiles produces the first publishable evidence; spreading it across 160 cells produces none.

### Risks

- **Retrieval counts read as findings.** "11,737 passages" and "24,360 links" must never appear publicly as evidence counts.
- **Working translations leaking.** They are labelled `Codex working translation`; keep that label in any export.
- **School by proxy**: one author standing for a school (al-Shawkānī for the Zaydīs is already flagged).
- **Representation**: four traditions have no direct source; the quiz must not imply coverage it lacks.
- **The parquet is a lead, not a witness**: digital page numbers are not printed locators.

---

## 4. Across the three projects

- **One review vocabulary.** Qirāʾāt says proposed, Tafsir says proposed, Fiqh Compass says candidate and working draft. Adopt one ladder for all three (`machine`, `llm-read`, `cross-checked`, `owner-reviewed`, `specialist-reviewed`) and let each page show the state per item.
- **One rights decision.** The qirāʾāt quotations, the tafsir passages and any Fiqh Compass evidence all depend on the same question about reproducing Shamela editions. Resolve it once.
- **Status from data, not prose.** Each project's build should emit its own counts; documents cite those files.
- **What not to rebuild.** The qirāʾāt verifier, the tafsir catalogue placement, and the Fiqh Compass catalogue reconciliation are sound. None needs redoing; each needs a review layer on top.

## 5. Decisions needed from the owner

1. May van Putten's English (CC BY-NC) be shown beside at-Taysīr claims, with attribution, on a site you treat as non-commercial?
2. The rights position on displaying Shamela edition text (qirāʾāt quotations, tafsir passages) on `main`.
3. Which two or three Fiqh Compass profiles to take to review first, and who reviews.
4. Whether the next tafsir imports start with al-Ṭabarī (largest, best structured) or ʿAbd al-Razzāq (smaller, report-based).

## 6. Data issue found during the UI work

Hadith record 5 (Ṣaḥīḥ al-Bukhārī no. 1) links the chain's ʿAlqama ibn Waqqāṣ al-Laythī (Arabic: علقمة بن وقاص الليثي) to register entry 4494, whose English name reads "ʿAqqaḥ ibn Waqāṣ al-ʿAṭawārī". The Arabic is correct; the register's English name for that entry looks wrong. Not edited, per the rule on source data.
