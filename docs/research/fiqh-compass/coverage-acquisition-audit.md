# Initial catalog coverage and acquisition audit

Status: targeted catalog audit, not an exhaustive tradition census. The input
catalog contains 8,492 records. Searches covered title, author, nickname, and
category strings in Arabic. Terms were designed to surface Ibāḍī, Zaydī,
Twelver/Imāmī, Ismāʿīlī, and Qurʾān-alone references. Homonyms, author
affiliations, and polemical titles produce false positives, so a keyword hit
is not a tradition assignment or direct-source qualification.

## Current index update (4 October 2026)

The previous paragraph and targeted findings below describe the 8,492-record
catalog snapshot used for that search. The newer `shamela_catalog_index.csv`
contains 8,538 unique records and covers the 46 IDs that had appeared only in
the merged Parquet inventory. Its indexed record counts sum to 7,552,019, and
its serial ranges form a continuous interval with no overlaps or gaps. The
metadata-only reconciliation is in
[`catalog-index-reconciliation.md`](catalog-index-reconciliation.md), with
the reproducible command in `README.md` and machine-readable details alongside.

The newly surfaced fiqh-related candidates include comparative fiqh, prayer
rulings, a Hanbalī manual, contemporary fasting, a Shāfiʿī continuation and
manual, legal maxims, fiqh terminology, divorce rulings, pilgrimage rulings,
and a Mālikī abridgment. These are availability/discovery leads only: the
catalog does not establish authorship, doctrinal relevance, completeness,
edition or scan alignment, or public-reuse rights.

The underrepresented-tradition query families have now been rerun over the
8,538-entry index. The bounded Arabic substring scan found 3 Ibāḍī-related,
38 Zaydī-related, 65 Imāmī/Twelver-related, 6 Ismāʿīlī-related, and 49
Qurʾān-alone/Qurʾānī-related IDs. These numbers are not comparative trend
counts: this scan uses a broader, newly recorded term set. Title and author
inspection found no direct legal work in the queried index hits for Ibāḍī,
Imāmī/Twelver, Ismāʿīlī, or self-representative Qurʾān-alone approaches, and
did not establish a school-representative Zaydī legal source. The Zaydī set is
dominated by false positives and al-Shawkānī works, which may only support a
profile of his own positions after passage review. The apparent
local *al-Baḥr al-zakhkhār* match is al-Bazzār's ḥadīth musnad. See the full
[query and classification report](catalog-coverage-scan.md), including exact
terms, per-term counts, and matched metadata. These findings are still not an
exhaustive census; all identified direct-source acquisition tasks remain open.

## Findings from the previous targeted scan (8,492-entry snapshot)

| Search target | Lexical hits | Audit finding |
|---|---:|---|
| Ibāḍī | 4 | One title is an explicit Sunni refutation; two are genealogy/history by authors catalogued as Ibāḍī; one is a language work. No direct Ibāḍī fiqh work was identified in these matches. |
| Zaydī / related nisbas | 27 | Many hits are unrelated names or broad Yemeni scholarship; one is explicitly a refutation. Exact title search did not find *al-Baḥr al-zakhkhār*; the matching “Baḥr al-Zakhkhār” record is al-Bazzār’s ḥadīth musnad. No direct primary fiqh manual was identified in the targeted title results. |
| Twelver / Imāmī / Jaʿfarī | 17 | Most hits are unrelated uses of “the two imams” or later authors’ nisbas. The three titles explicitly naming Twelver Imāmiyya are polemical works. Exact title search did not find al-Ṭūsī’s *al-Mabsūṭ fī fiqh al-Imāmiyya*. |
| Ismāʿīlī | 2 | The matches are author nisbas for a ḥadīth scholar and a biographical dictionary; neither establishes coverage of Ismāʿīlī legal doctrine. |
| Qurʾān-alone / Qurʾānī | 50 | Most direct keyword matches are polemical/“refutations” or general Qurʾānic works. No self-representative contemporary legal source was established by this search. |

These are **search findings, not proof of absence**. The local catalog and its
metadata miss known-source titles below, and the corpus may omit material not
catalogued in the supplied snapshot. No tradition may be represented by a
hostile refutation alone. The coverage status for these target traditions is
therefore “direct-source acquisition required,” not “no position exists.”

## Candidate primary-source leads

| Target | Source lead | Access and metadata to verify | Rights status |
|---|---|---|---|
| Ibāḍī | ʿAbd al-ʿAzīz al-Thamīnī, *Kitāb al-Nīl wa-shifāʾ al-ʿalīl* | The [al-Saʿīdiyya library](https://alsaidia.com/node/527) lists the text and downloadable PDF/TXT parts. Visual inspection of part 1's title page confirms a 1423 AH / 2002 first-edition printing and says the text is a photographic reproduction of the 1287 AH / 1967 second edition. Printed p. 50 was visually inspected in the 337-page PDF at page 76; matching searchable text was reviewed, though the full OCR has not been line-checked. Preliminary matter p. 17 describes the editor's use of three copies for correction, so the textual history needs bibliographic review. A separate [College of Sharia Sciences Library record](https://maq.css.edu.om/home/item_detail/4346) lists a 2003 first edition, editor, and three parts under a platform-wide Omani Open Government License notice; its dynamic PDF was not acquired or collated. | Unresolved; no item-level republication clearance inferred. |
| Ibāḍī | Muḥammad b. Yūsuf Aṭṭafayyish, *Sharḥ Kitāb al-Nīl wa-shifāʾ al-ʿalīl* | The al-Saʿīdiyya library lists PDF/DOCX volumes and a third edition (1405 AH / 1985); the Tunisian National Library catalogue independently describes a 17-volume 1986 printing. Usul.ai hosts searchable text. Treat this as a later commentary with its own authorial layer, not as the base text’s wording. [Library entry](https://alsaidia.com/node/546) · [National Library catalogue](https://www.bibliotheque.nat.tn/BNTK/doc/SYRACUSE/6215844/) · [Searchable text](https://usul.ai/ar/t/sharh-al-nil-lil-qutb-atfish) | Unresolved; edition and rights review required. |
| Zaydī | Aḥmad b. Yaḥyā b. al-Murtaḍā, *al-Baḥr al-zakhkhār al-jāmiʿ li-madhāhib ʿulamāʾ al-amṣār* | Usul.ai has a searchable text under its Zaydī collection. A BSB manuscript witness is now identified as Cod.arab. 1291 (former Cod.arab. Glaser 18), 189 leaves, copy date 1032 AH / 1623 CE; its first/title leaf is visible in the BSB IIIF scan at canvas 3, but no folio-to-canvas map or equivalence to Usul.ai or a printed edition is established. DDB's linked GND authority page gives birth 1373/death 1437 without labeling the era; preserve this raw claim alongside AH variants (839/840) pending bibliographic review. [DDB record](https://www.deutsche-digitale-bibliothek.de/item/PFT7CDYQLSKBUY7DGWLX4QXEJMWQOV7Z) · [BSB viewer](https://www.digitale-sammlungen.de/en/view/bsb00038405) · [Searchable text](https://usul.ai/ar/t/bahr-zakhkhar-1) · [Zaydī text overview](https://zaydi.info/jurisprudence/key-texts-in-zaydi-jurisprudence/) | Unresolved; DDB displays CC BY-NC-SA 4.0 while the BSB IIIF manifest declares Public Domain Mark 1.0. Scope and applicability conflict; no reuse permission inferred. |
| Twelver / Imāmī | Muḥammad b. al-Ḥasan al-Ṭūsī, *al-Mabsūṭ fī fiqh al-Imāmiyya* | Usul.ai lists a second edition, Tehran, 1387 AH, editors Muḥammad Taqī al-Kashfī and Muḥammad Bāqir al-Bahbūdī; CiNii catalogues an eight-volume Arabic set. Use the direct text for discovery, then identify matching volume/page in a verified scan. [Searchable text and metadata](https://usul.ai/t/al-mabsut-fi-fiqh-al-imamiyyah) · [CiNii bibliographic record](https://ci.nii.ac.jp/ncid/BA69026060.amp) | Unresolved; modern edition and digital platform terms require review. |
| Qurʾān-alone | Self-representative contemporary legal/methodological texts | No source selected yet. Identify named authors and versions directly from their own publications; keep each approach bounded by author and period rather than treating “Qurʾān-alone” as a single school. | Acquisition and rights review required. |

## Follow-up source discovery (4 October 2026)

  The following access checks refine the acquisition queue. They establish
catalogue or digitization leads only; they do not establish a legal position,
authorial attribution for any passage, text-to-scan equivalence, or permission
to republish.

- **Ibāḍī, *Kitāb al-Nīl wa-shifāʾ al-ʿalīl*:** the [al-Saʿīdiyya landing
  page](https://alsaidia.com/node/527) calls its digital item a first edition
  (1423 AH / 2002) and links three PDF/TXT parts. Visual inspection of the
  [first-part PDF](https://alsaidia.com/sites/default/files/%D9%83%D8%AA%D8%A7%D8%A8%20%D8%A7%D9%84%D9%86%D9%8A%D9%84%20%D9%88%D8%B4%D9%81%D8%A7%D8%A1%20%D8%A7%D9%84%D8%B9%D9%84%D9%8A%D9%84%201.pdf)
  confirms its title page says first edition, 1423 AH / 2002 and photographic
  reproduction of the 1287 AH / 1967 second edition. The 337-page PDF's page
  76 is printed p. 50; its purity-transfer discussion was inspected against
  the scanned image and the paired TXT. Full text/scan equivalence and the
  editorial collation note on preliminary p. 17 remain unresolved. A separate
  [College of Sharia Sciences Library record](https://maq.css.edu.om/home/item_detail/4346)
  lists a 2003 first edition and an editor under a platform-wide Omani Open
  Government License notice; its PDF was not acquired or matched. Neither
  provider record establishes a permission for this project's text reuse.
- **Zaydī, *al-Baḥr al-zakhkhār*:** an institutional manuscript witness is
  discoverable through the [Deutsche Digitale Bibliothek / Bayerische
  Staatsbibliothek record](https://www.deutsche-digitale-bibliothek.de/item/PFT7CDYQLSKBUY7DGWLX4QXEJMWQOV7Z):
  Cod.arab. 1291 (former shelfmark Cod.arab. Glaser 18), 189 folios, copied
  1032 AH / 1623 CE. The record describes its first part as dogmatics and
  Zaydī law and displays a CC BY-NC-SA 4.0 notice for the digital object. This
  manuscript is not the same edition as Usul.ai's searchable text. Confirm
  object-level license scope before reusing images or transcriptions.
- **Twelver / Imāmī, al-Ṭūsī's *al-Mabsūṭ*:** [NYU Libraries' Arabic
  Collections Online viewer](https://sites.dlib.nyu.edu/viewer/books/nyu_aco001662/1)
  exposes a digitized copy with a permanent handle, call number
  KBP370.T88 A35 1967, and 420 pages in the opened viewer volume. Its
  catalogue metadata names Tehran, the publisher, and contributors Kashfī and
  Bahbūdī. [WorldCat's edition record](https://search.worldcat.org/title/mabsut-fi-fiqh-al-imamiyah/oclc/976637436?ht=edition&referer=di)
  independently gives a second edition dated 1387–1393 AH (1967/68–1973).
  NYU says it believes displayed materials are public domain, but that notice
  does not grant blanket permission to reproduce a modern edition's text.
  Match individual volume title pages and printed locators before use.
- **A bounded Qurʾān-alone lead:** the [hosted *Quran: The Final Testament*
  appendices](https://www.quran.us/quran/appendices/index.html) label the
  English version as translated by Rashad Khalifa and include sections on
  Qurʾān sufficiency and hadith authority; the page states copyright
  © Islamic Productions, 2003. This is a lead for one author/community only,
  not a proxy for Qurʾān-alone approaches as a whole. Keep text use to
  discovery/citation until permission is resolved and acquire independent
  self-representative sources for other authors.

The detailed locator, edition and rights follow-ups are recorded in
`acquisition-review-queue.json`. One *al-Nīl* passage is preserved in the
private evidence store as a hash-checked machine candidate, with unresolved
attribution and rights and no question, position, profile, or score link.

### BSB manuscript-access follow-up — 2026-10-05

- The [DDB catalog record](https://www.deutsche-digitale-bibliothek.de/item/PFT7CDYQLSKBUY7DGWLX4QXEJMWQOV7Z)
  reports Bayerische Staatsbibliothek Cod.arab. 1291 (former Cod.arab. Glaser
  18), 189 leaves, copy date 1032 AH / 1623 CE, and says the first part covers
  dogmatics and Zaydi law. Its linked [GND authority page](https://www.deutsche-digitale-bibliothek.de/person/gnd/103490949)
  lists birth 1373 and death 1437 without labeling the era. The catalog record
  also provides a digitized-object link to the [BSB viewer](https://www.digitale-sammlungen.de/en/view/bsb00038405).
- The BSB [IIIF Presentation v2 manifest](https://api.digitale-sammlungen.de/iiif/presentation/v2/bsb00038405/manifest)
  contains 451 sequential canvases labeled `(0001)` through `(0451)`. Visual
  inspection of canvas 3 confirms a title leaf bearing *Kitāb al-Baḥr al-zakhkhār*.
  A subsequent sample of canvases 1 and 4–6 shows the binding and opening
  manuscript text, including a prominent work heading on canvas 6. The canvas
  labels are not folio identifiers, and marginal marks in this small sample do
  not establish a folio-to-canvas map. Author attribution from the title leaf,
  completeness, and collation against any printed or Usul.ai text have not been
  established.
- Rights notices are unresolved: the DDB item page displays CC BY-NC-SA 4.0,
  while the BSB IIIF manifest's license field points to Public Domain Mark 1.0.
  Do not infer which notice governs the images, metadata, or downstream
  derivatives; retain `needs_review` and do not reuse manuscript images or
  transcriptions publicly pending an object-specific rights decision.

## I17 *al-Mughnī* volume 3 holding lead (5 October 2026)

- The current local catalog/corpus record is Shamela book 8463, titled
  *al-Mughnī li-Ibn Qudāma*, with publisher Maktabat al-Qāhirah, a first-edition
  date span of 1388–1389 AH / 1968–1969 CE, 5,019 indexed rows, and no text
  sentinels. The I17 hit is corpus serial 4224391, digital vol. 3/page 344,
  SHA-256 `c2e0bf830ed6bcbae423150d6eb0cb9640044862b8be5ce7d9a3b3a68e73ce06`.
  Printed volume/page fields are blank; attribution is unresolved, extraction
  remains `machine_candidate`, and rights remain `needs_review`.
- A University of Jordan Library catalog search result lists a 1968 Cairo
  Library volume 3 holding (call number `I22 A35 1968 V.3`) marked available.
  Its page timed out when opened during this check, so availability is a
  search-result lead awaiting direct confirmation. [CiNii record BA68491178](https://ci.nii.ac.jp/ncid/BA68491178)
  independently identifies the Arabic Cairo Library set, dates it 1968–1970,
  and lists ten volumes and a Tōyō Bunko holding by volume. [WorldCat OCLC
  28906251](https://search.worldcat.org/fr/title/mughni-li-ibn-qudamah/oclc/28906251)
  independently records Cairo Library and 1968 at set level.
- The catalogue date span differs from Shamela 8463 by one year. No title page
  or scan of the volume 3 holding was inspected, so this does not establish that
  the available copy is the exact input edition or that printed p. 344 contains
  the candidate. A metadata-only work/manifestation link and acquisition task
  `AQ-H01` now capture the lead and the conflict; no passage, profile answer, or
  score was promoted. Rights are not cleared.

### Text-access follow-up (5 October 2026)

- The Shamela-mirror provider index for book 8463 identifies the Cairo Library
  text as 10 parts, dated 1388 AH / 1968 CE, and says its numbering matches
  print. Its direct volume 3 link timed out when opened. This is upstream
  metadata from the same source family as the local corpus; it supports a
  provider pagination claim but is neither an independent witness nor direct
  inspection of the target page.
- [Maknoon](https://maknoon.org/ai/view.php?bk=03_elmoghni&p=21) exposes a text
  page and a linked page image labeled *al-Mughnī*, Cairo Library edition,
  volume 3. The inspected page is digital page 21, not the target page, and no
  volume title page or target scan had yet been inspected at that checkpoint.
  A later scan inspection below adds title-page and p. 344 evidence.
- [IslamWeb's chapter record](https://www.islamweb.net/ar/library/content/15/2002/%D9%81%D8%B5%D9%84-%D8%A5%D8%B0%D8%A7-%D8%B4%D9%83-%D9%81%D9%8A-%D8%A7%D9%84%D8%B7%D9%87%D8%A7%D8%B1%D8%A9-%D9%88%D9%87%D9%88-%D9%81%D9%8A-%D8%A7%D9%84%D8%B7%D9%88%D8%A7%D9%81)
  identifies the section (2463) in volume 3; its visible Arabic agrees with the
  corresponding section in local serial 4224391. The local row also concatenates
  sections 2464–2466, which were not separately collated against this page.
  Treat this as a text concordance with uncertain source dependency, not an
  independent edition witness. The section
  itself contains Ibn Qudāma's reasoning alongside attributed reports and other
  jurists' views; those layers still need a specialist to separate.
- [IslamArchive's Cairo Library entry](https://islamarchive.cc/ketab_content/2508463/p-2232)
  indexes the conditions-of-tawaf section in a Cairo Library-labeled text.
  Its digital page 2232 has not been equated with printed page 344, and no scan
  was inspected. These text services do not grant reuse rights.
- Result: the text lead is strengthened, but `AQ-H01` remains open. Establish
  an independently verifiable edition chain and rights decision, collate full
  context, assess authorial versus quoted layers, and review reuse rights
  separately. Keep the I17 candidate unscored.

### Maknoon Cairo Library volume 3 scan inspection — 5 October 2026

- Inspected the [volume 3 page-1 image](https://maknoon.org/ai/view.php?bk=03_elmoghni&p=1)
  and [page-344 image and OCR](https://maknoon.org/ai/view.php?bk=03_elmoghni&p=344).
  The page-1 image identifies *al-Mughnī*, Ibn Qudāma, volume 3, editor Ṭāhā
  Muḥammad al-Zaynī, and Maktabat al-Qāhirah. Its publication year is not
  securely legible. The p. 344 image visibly prints page number 344 and shows
  the I17 passage (section 2463), followed by adjacent sections 2464 and 2465.
- The [Waqfeya catalog record](https://waqfeya.com/books/%D8%A7%D9%84%D9%85%D8%BA%D9%86%D9%8A-%D8%B7-%D8%A7%D9%84%D9%82%D8%A7%D9%87%D8%B1%D8%A9-bfaa5ad280c64610986908cbab100d84)
  identifies a 10-volume Cairo edition dated 1388 AH / 1968 CE and links an
  [Internet Archive volume 3 PDF](https://archive.org/details/FPelmoghni). The
  PDF is 526 pages (14,224,100 bytes; SHA-256
  `8386E2FE6D9613C9196BE57D197C95B50DD2E6F9A0655908973D862245638504`). Its
  pages 1 and 344 were visually inspected; they appear to show the same scan as
  the Maknoon page images. This provides a separate access route, not a second
  physical witness. Internet Archive's item metadata has no rights/license
  statement; no reuse permission is inferred.
- Retrieved the exact local Shamela row (book 8463, serial 4224391; source hash
  `c2e0bf830ed6bcbae423150d6eb0cb9640044862b8be5ce7d9a3b3a68e73ce06`) and
  compared it to Maknoon's page OCR. After ignoring diacritics and punctuation,
  the **entire 1,717-character normalized local row is contained in the 1,785-
  character OCR for the scanned p. 344**. This is a strong candidate
  text-to-printed-page match within the displayed digitization; it does not
  establish that the scan supplied Shamela's text or that the page is from the
  exact same copy/printing. The source chain and edition year remain
  unresolved: CiNii describes 1968–1970 at set level, Shamela claims 1388–1389
  AH / 1968–1969 CE, and the title-page year could not be read confidently.
- Recorded Maknoon and Internet Archive as separate digital-access objects
  linked at candidate level to the Cairo Library volume 3 manifestation. Waqfeya
  claims 1388 AH / 1968 CE; retain the separate Shamela 1388–1389 AH /
  1968–1969 CE and CiNii 1968–1970 claims, because the title-page year is not
  securely legible and volume-level publication chronology is not resolved.
  No item-level reuse license was identified; both scan and OCR rights remain
  `needs_review`. The I17 row
  remains `machine_candidate`, attribution unresolved, score-ineligible, and
  unapproved. No legal proposition was added.

## Next coverage batch

1. Obtain bibliographic review of the Ibāḍī PDF's 1423/2002 title-page
   statement, its 1287/1967 reproduced pagination, and the preliminary p. 17
   three-copy correction note; reconcile the separate Omani 2003 catalog item
   and its platform-license scope. Have a reviewer collate p. 50 and clarify
   the compilation/source layer; rights remain uncleared.
2. For the BSB manuscript, continue only if a reliable folio-to-canvas key or
   independently identifiable passage can be established; keep scan sequence,
   manuscript folio, and printed pagination as distinct locators. For the NYU
   Imāmī scan, extend the two-volume title-page check to the target printed-page
   mapping and text collation.
3. Treat the Rashad Khalifa source as one bounded author/community lead; select
   a second independent self-representative author and establish version and
   rights before defining any broader approach-level claim.
4. Re-run the 20 issue searches against those sources with tradition-specific
   wording. Keep direct statements, transmitted reports, commentarial text,
   and comparative attributions as separate evidence types.
5. Compare the relevant printed pages or scans before promoting any candidate
   position beyond `machine_candidate` / `candidate` status.
6. Confirm the volume 3 catalog holding directly; obtain authorized access to
   its title page and the printed locator that contains the I17 candidate, then
   compare the complete passage and context against serial 4224391. Preserve
   the Shamela/catalog date discrepancy unless the physical manifestation
   resolves it.
