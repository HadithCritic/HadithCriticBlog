# Musannaf ʿAbd al-Razzāq alignment audit

**Status:** source/database parity verified; edition hierarchy and numbering interpretation remain under review. No production corpus data has been changed.

## Fixed inputs

| Input | Value |
|---|---|
| Local compilation ID | `5` |
| HadithWeb book ID | `16` |
| Raw export | `mus test/musannaf-abd-al-razzaq.json` |
| Raw export SHA-256 | `eec06dfd39ac034a3c9e20d89c306dcca559957c34ee9429323ef66f7e5ebb41` |
| Master SQLite SHA-256 | `4fdd7d7bf2a9e50daddb25d28daea403c85c21463ab1eadab44514959f39a404` |
| Audit output | `dist-db/alignment/abd-al-razzaq/` (local generated evidence) |

The audit paired raw `mainId` values with stable `hadith.id` values. It compared number fields exactly and compared text after collapsing whitespace only; no corpus strings were rewritten. All **21,109** source rows paired with compilation 5, with zero field mismatches for report IDs, compilation title, number, Arabic chapter label, full Arabic text, Arabic matn, narrator surfaces, and ordered chain paths. This establishes parity between the two local representations, not fidelity to every printed-edition feature.

## Edition facts to preserve

HadithWeb identifies the edition used for numbering and volume/page references as the second edition of al-Maktab al-Islāmī, Beirut, 1390–1403 AH / 1970–1983 CE, in 12 volumes (the twelfth is indexes). Its description gives 32 books, 2,536 chapters, and 21,033 musnad texts (reports and athar) for the printed edition. [HadithWeb book record](https://sunna.alifta.gov.sa/Book/Details?bookId=16)

## Printed-number audit

| Measure | Count |
|---|---:|
| Export/database rows | 21,109 |
| Rows with a numeric `hadith_num` | 21,023 |
| Rows with blank `hadith_num` | 86 |
| Distinct numeric labels | 21,010 |
| Duplicate numeric occurrences beyond the first | 13 |
| Missing labels in the range 1–21,033 | 23 |
| Highest numeric label | 21,033 |

The number arithmetic reconciles: `21,033 − 23 missing labels + 13 duplicate occurrences = 21,023 numbered rows`; the remaining 86 rows have blank number fields. None of the 86 begins with an independently parseable printed number in the opening text. All 86 nevertheless have narrator surfaces and chain paths; 17 have no extracted matn, and one contains an edition note. These are observations, not a classification of those records as supplements or errors. Their text and blank number fields must remain untouched until the printed edition or its authoritative transcription resolves their status.

The exact missing labels and duplicate groups are recorded in `dist-db/alignment/abd-al-razzaq/report.json`. The review ledger for blank-number rows is `dist-db/alignment/abd-al-razzaq/blank-number-review.csv`.

English full-text prefixes were also checked independently: 672 `text_en` values begin with a number; 671 match that row's `hadith_num`. The one exception is report `213683`: its Arabic `hadith_num` is blank, while `text_en` begins `223 -`; the adjacent Arabic-numbered rows are 232 and 233. This is not evidence that 223 belongs in the Arabic printed-number field. It shows why English rendering prefixes cannot be used to fill or validate Arabic edition references without their own source provenance. The full exception list is in `report.json`; review rows are in `blank-number-english-prefixes.csv`.

Context review adds two cautions:

- All 86 blank-number records occur in source order between numbered records and share the previous record's chapter label; 67 also share the next record's chapter label. Their openings commonly begin with a continuation phrase such as `قال` or `وقال`, but every row has its own narrator surface and chain path. Seventeen have no extracted matn. This supports retaining them as source units with a blank printed number; it does not prove whether the printed edition groups them under a preceding numbered report.
- All 13 duplicated-number groups contain distinct full Arabic report text. Nine groups stay within one chapter label and four cross chapter labels; six groups are adjacent in source order. They are not duplicate database rows and must not be removed or renumbered automatically.

The neighbor and text review ledger is `dist-db/alignment/abd-al-razzaq/number-issues-context.csv`.

## Matn and bilingual-field coverage

The local compilation has Arabic and English chapter labels on all 21,109 rows, but the Arabic chapter labels are not a lossless unique key: three existing English labels each correspond to two different Arabic labels. There are **807** rows with no extracted Arabic matn and no English matn; this consists of 790 numbered rows and 17 blank-number rows. The Arabic full-text and English full-text fields are populated for all rows. An English full-text value does not establish that an aligned English matn exists, so the UI and exports must keep those fields separate and must not synthesize missing matn by copying the full text.

The source JSON supplies vocalized Arabic full text and matn fields, but does not supply English fields or a translation provenance/status for the local English text. Translation quality and matn alignment therefore require a separate provenance audit; current parity results do not certify those English values as reviewed translations.

## Readiness for the requested bilingual structure

| Requested layer | What the current data supports | Handling decision |
|---|---|---|
| Compilation | Arabic and English compilation titles exist in the local catalog. The edition metadata is Arabic-first. | Retain catalog wording; add verified English edition metadata only with its source recorded. |
| Kitāb | 31 source-header candidates are present; *Faḍāʾil al-Qurʾān* is a likely but unmarked boundary. | Store exact Arabic markers. Keep the inferred boundary flagged; do not invent an English Kitāb title. |
| Bāb | Every row has Arabic and English chapter labels; there are 2,504 label runs, 2,492 distinct Arabic labels, and 3 English-label collisions. | Create one stable Bāb occurrence per reviewed run. Keep Arabic and English on that occurrence; do not join rows by translated title. |
| Isnad (Arabic) | Full Arabic source text and structured chain paths/narrator surfaces are available, but 42 rows have no extracted chain path and 25 have no extracted narrator surfaces. | Keep the source Arabic text authoritative; expose structured isnād components only where present. |
| Isnad (English) | There is no separate English isnād field. English narrator names are register cross-references, not a line-aligned translation of each source isnād. | Do not present normalized English narrator names as a full English isnād translation. |
| Matn (Arabic/English) | Both extracted matn fields are blank on 807 rows; both are populated on the other 20,302. | Preserve missingness. Do not copy full-text fields into matn fields. |
| Reference (Arabic/English) | Printed number is blank on 86 rows and duplicated across 13 groups. Arabic page markers occur on 5,570 reports (5,777 marker occurrences). | Keep stable report ID as the record key; keep printed numbering non-unique and source page markers as edition locators. Localized bibliography needs separately verified metadata. |

The raw `narration_words` sequence is not a one-to-one positional translation of the `names` array: their lengths differ on 16,310 rows. Preserve the connector sequence independently; do not zip the arrays to manufacture an English/Arabic isnād phrase alignment.

## Hierarchy audit

The export has **2,504 contiguous runs** of Arabic chapter labels and **2,492 distinct Arabic labels**. HadithWeb reports 2,536 chapters, leaving a 32-heading difference that has not been explained. Repeated labels are not sufficient to identify Bābs, and `chapter_ar` is not itself a stable Bāb identifier.

### HadithWeb table-of-contents ID cross-check

The official HadithWeb table of contents provides a useful identifier-level cross-check. For the opening of *Kitāb al-Ṭahāra*, the TOC page is requested with `ParentId=213428`; it shows *Kitāb al-Ṭahāra* followed by `باب غسل الذراعين` and the subsequent Bābs. The first local report is ID `213430`. For *Kitāb al-Ḥayḍ*, the official page uses `ParentId=214726`, shows that Kitāb and its Bābs, and the first local report is ID `214728`. These examples support the pattern that a TOC parent ID can precede its first report by two IDs when the opening report has an explicit Bāb label. [Official Ṭahāra TOC](https://sunna.alifta.gov.sa/BookToc/ViewBookTocLevel?BookId=16&IsLeaf=False&ParentId=213428) · [Official Ḥayḍ TOC](https://sunna.alifta.gov.sa/BookToc/ViewBookTocLevel?BookId=16&IsLeaf=False&ParentId=214726)

The pattern changes when the opening report has no Bāb label in the export. At *Kitāb al-Buyūʿ*, local report `229188` carries `chapter_ar = كتاب البيوع`; the official TOC page is under `ParentId=229187`, begins with the Kitāb title and lists four opening report entries before the first explicit Bāb. Here the candidate Kitāb root is one ID before the first report, not two. This demonstrates that some `chapter_ar` runs encode a Kitāb heading/default label rather than a Bāb occurrence. [Official Buyūʿ TOC](https://sunna.alifta.gov.sa/BookToc/ViewBookTocLevel?BookId=16&IsLeaf=False&ParentId=229187)

In the local SQLite sequence, all **2,504** starts of a contiguous `chapter_ar` run have a missing immediately preceding ID. Across report IDs `213430–237068`, there are **2,530** missing IDs. Those facts make the gaps a strong way to locate possible TOC nodes, but the count is not a chapter-boundary proof: some openings use the Kitāb title as `chapter_ar`, and a boundary with a repeated title would not create a new label run. The candidate *Faḍāʾil al-Qurʾān* first report is `219945`; its predicted parent `219943` is missing, but that parent has not yet been confirmed on the official TOC.

Consequently, do not generate the publishable Kitāb/Bāb register by assigning `start_id - 1` or `start_id - 2` from local patterns alone. The official TOC hierarchy must be enumerated and paired to report IDs, then reconciled against source labels and the printed edition. The precise meaning of HadithWeb's published 2,536-Bāb figure also remains open: the local run count, the 32 Kitābs, and the TOC node sequence do not yet reconcile without a complete TOC enumeration.

The source text contains 31 explicit Kitāb heading candidates among the 32 books reported by HadithWeb. The expected book list includes *Faḍāʾil al-Qurʾān*, but no matching Kitāb marker appears in the raw export. A public secondary index places that book between *Ṣalāt al-ʿĪdayn* and *al-Janāʾiz*; its first listed report appears to correspond to local report ID `219945` (local printed number `5859`). That index assigns the report number `5696`, so its numbering is demonstrably not interchangeable with the local number field. This is a **boundary candidate only**, not an accepted boundary or a source for local numbering. [Sunnah.com collection index](https://sunnah.com/abdurrazzaq) · [Sunnah.com Book 6 opening](https://sunnah.com/abdurrazzaq/6)

The candidate source markers and their IDs are in `dist-db/alignment/abd-al-razzaq/book-heading-candidates.tsv`. They are not yet a publishable hierarchy register. The explicit headings, the likely unmarked *Faḍāʾil al-Qurʾān* section, and the official 2,536-chapter claim need to be reconciled against the edition-specific contents before Kitāb/Bāb rows are staged.

## Next audit actions

1. Verify the first/last report and Arabic heading for each Kitāb using the edition-specific HadithWeb table of contents and page evidence; record explicit versus inferred boundaries separately.
2. Reconcile the 2,504 source chapter-label runs with HadithWeb’s 2,536 Bābs. Do not fill the difference by estimation.
3. Review all 86 blank-number rows and 13 duplicate-number groups against the edition pages; preserve unresolved source values.
4. Only after those checks, create the source-backed boundary register and stage compilation 5’s structured hierarchy alongside compilation 1.
5. Re-run row parity, SQLite integrity, foreign-key, fixture, and distribution verification against the staged copy. Keep the original master database and published corpus unchanged until an explicitly reviewed release.
