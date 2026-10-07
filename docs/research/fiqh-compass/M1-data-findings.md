# Fiqh Compass M1 data findings and gap report

Status: **M1 research prototype is in progress; its completion gate has not passed.**  
Checkpoint: 5 October 2026.  
Evidence store: private, ignored `scratch/fiqh-compass/`; no full corpus pages are copied into tracked files.

## Work completed in this checkpoint

- The first reconciliation used an earlier 8,492-ID CSV and found 46 additional corpus IDs. The newer index now has 8,538 unique IDs matching the previously scanned corpus inventory; its 7,552,019 per-book record counts and serial ranges cover all corpus records. The old catalog/Parquet metadata discrepancy counts remain archival for that earlier input, not results for the current index. The current index's independent hash, ID additions, category totals, and serial coverage are recorded in `catalog-index-reconciliation.md`.
- Recorded corpus limits: 314 literal text sentinels and 40,878 rows with no usable page label overall; none of the 12 priority starter works has a text sentinel. Digital page/volume values are not verified printed locators. Corpus presence does not establish complete coverage, edition identity, scan correspondence, OCR quality, or reuse rights.
- Created the versioned SQLite schema, stable IDs, private exact-text store, reconciliation/source manifests, retrieval plans, export pipeline, acquisition queue, and validators. Eight bounded source-based profile records remain candidates; profile scores and coordinates are unassigned.
- Completed a first-pass local lexical retrieval for all 20 roadmap issues, then expanded I17 and I14: the current plan returns **11,737 exact page candidates across 20 source IDs**, including 1,964 for I17 and 479 for I14. I17 additions include Shamela 30130 (282 rows), 30064 (762 rows), and a bounded tawaf/saʿi search in 2186. I14 was expanded with five cataloged works: al-Āmidī's *al-Iḥkām* (10801), al-Ghazālī's *al-Mustaṣfā* (5459), al-Qarāfī's *Nafāʾis al-uṣūl* (14280), Ibn ʿAqīl's *al-Wāḍiḥ fī uṣūl al-fiqh* (122232), and Ibn al-Qayyim's *Iʿlām al-muwaqqiʿīn* (17798). A broad normalized lexical screen covered 1,510 cataloged fiqh/uṣūl works and 1,501,147 corpus rows; its 1,208 matched book IDs and 40,696 matched rows are noisy discovery counts, not relevant-evidence counts. Seven exact I14 candidates from the five works were assembled in a private specialist packet. The new retrievals do not establish primary evidence or profile positions: quotations, reported views, commentary/editorial layers, authorial attribution, and scope must be traced. Edition/scan correspondence, completeness, relevance, translation, and rights remain unreviewed. No position or score was created.
- Generated an audit for all 24 draft questions. Twenty have partial candidate evidence; four remain at retrieval-only status. All 46 question-to-issue mappings remain provisional. No mapping, passage, translation, position, or profile has specialist approval.
- Completed a targeted catalog coverage audit and recorded primary-source acquisition leads for Ibadi, Zaydi, Imami/Twelver, and specified Qurʾan-alone approaches. The findings are discovery results, not an exhaustive census or evidence of absence.

### I18: evidentiary uncertainty and punishment

I18 now has three bounded candidate readings from Ibn Qudama's *al-Mughni*, al-Sarakhsi's *al-Mabsut*, and Ibn Hazm's *al-Muhalla*. Ibn Qudama explicitly applies the maxim that fixed penalties are averted by doubts to a specific, historically situated ownership-doubt case, while separating the penalty from discretionary punishment and recording an alternative view. Al-Sarakhsi discusses delayed testimony in a zina case and distinguishes suspicion attached to witnesses from suspicion attached to confession. Ibn Hazm argues in a wine-drinking testimony case that extra requirements about time, place, or vessel should not be imposed without textual basis; this is a bounded contrast about proof conditions, not a direct judgment on the maxim's authenticity. The passages do not establish a universal doctrine or settle the maxim's hadith status. Their translations, legal readings, historical framing, editions, scan correspondence, and rights all remain unreviewed.

## Candidate retrieval counts

| Issue | Search topic | Exact machine candidates |
|---|---|---:|
| I01 | Extra-Qurʾānic authority | 438 |
| I02 | Report sufficiency | 207 |
| I03 | Report and general-principle conflict | 379 |
| I04 | Inherited practice | 149 |
| I05 | Consensus evidence | 1,207 |
| I06 | Tacit consensus | 36 |
| I07 | Analogy (qiyās) | 1,338 |
| I08 | Analogy in ritual requirements | 28 |
| I09 | Independent rational judgment | 26 |
| I10 | Public welfare | 513 |
| I11 | Custom and unstated contract terms | 1,129 |
| I12 | Custom and adequate fulfillment | 45 |
| I13 | Changed operative condition | 63 |
| I14 | Lay following across authorities | 479 |
| I15 | Juristic departure from inherited position | 2,343 |
| I16 | Default status under uncertainty | 105 |
| I17 | Uncertainty in ritual duty | 1,964 |
| I18 | Uncertainty and punishment | 340 |
| I19 | Establishing abrogation | 929 |
| I20 | Supersession across source types | 19 |
| **Total** |  | **11,737** |

Counts are reproducible for the recorded plan and corpus hash, but are not counts of relevant or supportive evidence. Dossier exports keep at most the configured 12-item per-source discovery shortlist; the complete candidate pages remain private in SQLite.

## Pilot interpretation limits

- **I01:** Ibn Hazm argues that the Sunna binds and clarifies the Qurʾan; al-Shafiʿi lists the Book, Sunna, consensus, transmitted reports, and analogy among knowledge sources. These are method statements, not evidence that every report is authentic or that a specific disputed prohibition is established.
- **I02:** al-Sarakhsi argues for acting on a qualified solitary report; Ibn Hazm argues that a just, accurate narrator's additional wording is accepted. Conditions and the distinction between practical legal action and certainty need specialist review.
- **I07:** Ibn Hazm's text directly rejects qiyas as he defines it; al-Sarakhsi argues that analogy is available where no text exists. These excerpts do not settle every domain or the roadmap's specific intoxicant case.
- **I11:** al-Mughni reports two views about custody in an unqualified nursing contract. The dissenting positions are comparative attributions, not direct passages from Abu Thawr, Ibn al-Mundhir, or the Ashab al-ra'y. Direct corroboration is needed.
- **I16:** Ibn Hazm states a general default of permissibility except where prohibition is specified in Qurʾan or Sunna. A separate Ibn Hazm passage applies that default while discussing a specific sexual ruling; it should not be exported as a domain-free ruling. al-Mughni's report of Dawud concerns sanctuary-game liability and is not evidence for a general ordinary-acts doctrine.
- **I03:** Ibn Hazm accepts qualifying general wording by another textual proof or necessary sensory evidence, while rejecting qualification without proof. This is related to but not a direct resolution of a report/text conflict.
- **I04:** al-Shafiʿi argues that a general report about observed property conditions did not establish that a specific *ʿumrā* transaction was included; this is a bounded argument, not a general rejection of inherited practice.
- **I05:** al-Shafiʿi distinguishes a Sunna agreed upon without disagreement, a singly transmitted Sunna, consensus, and analogy, but the excerpt does not define the participants or proof needed for every consensus claim.
- **I06:** Ibn Hazm quotes an opponent's tacit-consensus argument and challenges its assumptions in adjacent context. The argument is not attributed to one school and needs direct-source corroboration.
- **I08:** Ibn Rushd reports Salim b. ʿAbd Allāh's analogy for extending prayer joining in travel and says analogy in worship is weaker. The former is a later attribution; the latter is bounded comparative analysis, not a universal ban.
- **I09:** Ibn Hazm distinguishes reason's role in discerning properties and understanding commands from independently legislating lawful/forbidden status or ritual specifications. This is a direct authorial methodological argument, but it does not resolve every question about moral knowledge, harm, or injustice.
- **I12:** Ibn Qudama says customary practice determines delivery under a marriage contract in one temporary-illness case; he distinguishes a permanent condition and reports al-Qadi's contrary view. This historical passage has sensitive family-law content and must not be generalized or presented as contemporary advice.
- **I13:** Al-Shatibi separates verifying that case facts meet an operative description from establishing the transmitted legal rule, illustrating this with whether a drink is wine. It supports case-specific application analysis, not a claim that the legal rule changes when a condition disappears.
- **I14:** The initial al-Shatibi candidate says a layperson should not choose freely between two conflicting fatwas without effort and preference; by itself, it does not define a complete lay procedure or universally prohibit following a different school. The new cross-source shortlist asks whether other passages address that same question or instead concern choosing among muftis, asking qualified authorities, or a jurist following another jurist. Those passages are not yet attributed or interpreted by a reviewer.
- **I15:** Ibn Hazm says no post-Prophetic scholar’s view is independently authoritative and presents Abu Hanifa and Malik as jurists who exercised ijtihad; he distinguishes rewarded juristic error from following a position without proof. This is a polemical authorial account, not neutral biography or lay guidance.
- **I17:** Al-Shafiʿi treats water as pure when impurity is only suspected, but preserves impurity when it was established and removal is uncertain. These distinct starting states are a concrete ritual-purification case, not a general rule about all uncertainty.
- **I19:** Ibn Hazm distinguishes abrogation from ordinary expiry and requires explicit text, consensus, or necessary proof before calling an explanation abrogation. He also offers a contested argument that Sunna may abrogate a Qurʾanic ruling; its chronology and report need independent review.
- **I20:** Ibn Hazm argues that Qurʾan and Sunna can abrogate one another because Prophetic speech is revelation, giving one specific report as an example. This is his disputed methodological argument, not a consensus position.
- **I10:** Al-Shatibi distinguishes a later-arising occasion for action from a matter whose occasion was already present but not instituted. He describes later measures fitting established legal patterns as *maslaha mursala*, grounded in legal evidence, and excludes devotional acts. This is a methodological position, not a ruling on a specific modern transaction or proof that a claimed benefit exists.

### I17 comparison screen: uncertainty during prayer (not a completed example)

A local-corpus screen found a promising, but insufficiently secure, comparison. In
*al-Umm* (Shamela 1655; digital vol. 1, pp. 154–155), the retrieved text includes
the report instructing a worshipper uncertain of the number of prayer units to
build on what is certain, and then discusses formulations transmitted under
later headings. The exact authorial layer and the passage's own reasoning are
not clear from this excerpt alone. In *al-Mughnī* (Shamela 8463; digital vol. 2,
p. 15), Ibn Qudāma's text distinguishes the solitary worshipper from an imam,
explains building on certainty for the solitary worshipper by the absence of
someone to correct him and the need to ensure completion, and discusses how
different reports may be reconciled. This is a potentially useful contrast, but
it does **not** yet prove that two authors reach the same fully specified case
outcome through distinct authorial reasoning: the Shafiʿi-side reasoning and
attribution need direct review, and conditions around the imam/solitary cases
must be aligned. The cataloged editions and digital locators have not been
collated against scans. Therefore the roadmap's shared-ruling/different-reasoning
criterion remains **open**; no score, profile answer, or public comparison is
derived from this screen.

#### Source-layer follow-up: al-Umm p. 154

A separate online text view labeled *Kitāb al-Umm*, page 154, and identifying
Dar al-Fikr as publisher reproduces the relevant section and its editorial
footnotes. Within that section, the text explicitly introduces material in
*Mukhtaṣar al-Muzanī* that its compiler says was not found in *al-Umm*, before
quoting wording attributed to al-Shāfiʿī through al-Muzanī. The same view's
footnotes identify later commentary by al-Sirāj al-Bulqīnī. This supports
treating the digital passage as a layered compilation and rules out using this
excerpt alone as a verified direct *al-Umm* statement by al-Shāfiʿī.

This is a source-layer warning, not a completed edition collation: the online
page metadata does not establish that its text is the same manifestation as
Shamela 1655, and no image of the corresponding printed page has been checked.
The local passage's identity, surrounding structure, and textual lineage must
be checked against a scan or another independently identified edition. The
*al-Mughnī* side remains a candidate reading; it does not by itself satisfy
the shared-ruling/different-reasoning criterion. No score, profile answer, or
public comparison follows from this lead. A private review packet records the
exact local record identifier and the checks required without copying the
Arabic passage into tracked documentation.

#### Supplemental I17 screen: Shamela 30083

The current index also includes *Qiṭʿa min Takmilat al-Majmūʿ sharḥ
al-Muhadhdhab* (Shamela 30083), cataloged under Shāfiʿī fiqh and attributed to
al-Subkī, with a named modern editor and a first edition dated 1441/2020. An
additive search of its 1,731 corpus records produced 23 candidates from the
existing broad I17 terms (mostly the low-precision term *taḥarrī*) and nine
from focused prayer-doubt phrases (mostly the generic term “certainty”). A
separate co-occurrence scan found one related analogy at digital vol. 1, p. 260
(serial 4039470). That page discusses a sale dispute and invokes doubt arising
after prayer as an analogy; it is not a standalone treatment of that prayer
case. A separate *al-Mughnī* passage at digital vol. 3, p. 344 (serial 4224391)
compares post-completion doubt in ṭawāf with doubt in prayer, but it does not
present the same case with a demonstrably different rationale. These are
discovery leads, not an M1 worked example or added positions. Attribution,
edition/scan correspondence, translation, and rights remain unreviewed. Details
and the exact source-text hash are in the ignored private packet. The 10,232
candidate total across the original 13-source screen and the existing I17
dossier were unchanged at the time of this 30083-only scan. A later separate
screen extended I17 to Shamela 30064; that expansion is described below.

Bibliographic metadata is also inconsistent: the current Shamela index lists
696 pages for this three-volume record, while an external bookseller listing
reports 1,750 pages across three volumes. ISBN/OCLC and publisher/editor data
appear in an aggregator record, but neither that listing nor the bookseller
record establishes which printed manifestation the corpus represents. The
index field's page-count meaning, edition match, completeness, and reuse rights
remain unverified; neither page count is treated as printed pagination.

#### Supplemental I17 screen: Shamela 30064

The current index lists *Mawsūʿat aḥkām al-ṣalawāt al-khams* (30064), a
2024, 18-volume prayer compendium cataloged under general fiqh and attributed
to Abū ʿUmar Dubyān b. Muḥammad al-Dubyān. Applying the existing I17 retrieval
plan produced 762 machine candidates and raised the complete retrieval to
10,994 candidates across 14 source IDs; the regenerated validator confirms
the 1,696 I17 rows, exact Parquet text and digital locators, and matching
dossier/export counts. A 16-row shortlist screen surfaced sections on doubt
about prayer time, the opening takbīr, and the number of prayer units. The
compendium cites works including *al-Umm*, *al-Majmūʿ*, and *al-Mughnī*, which
may help locate primary discussions. It is a modern synthesis: its quotations,
reports, attributed school positions, and own analysis must be distinguished.
This is a retrieval expansion and citation-discovery lead only, not a reviewed
I17 ruling, an M1 worked example, or a position to score. Digital pagination,
work/edition correspondence, completeness, source layers, translation, and
rights remain unverified. Five exact local serials, hashes, scope cautions,
and primary-source follow-up checks are recorded in the ignored private
packet `I17-30064-prayer-doubt-compendium-screen.json`.

#### Supplemental I17 screen: al-Majmuʿ and al-Mughni tawaf-count passages

Added Shamela 2186 (*al-Majmuʿ*) to the I17 plan with bounded terms for doubt
about the number of tawaf/saʿi rounds. The resulting complete export contains
11,737 machine candidates across 20 source IDs, including 479 I14 and 1,964
I17 candidates; the
source/term expansion contributed 268 rows to I17. A private, hash-anchored
comparison packet pairs *al-Majmuʿ* Shamela serial 3960970 (digital vol. 8,
p. 21) with *al-Mughni* Shamela serial 4224391 (digital vol. 3, p. 344). Both
address a person who doubts the number of tawaf rounds while performing it
and direct the person to use the lesser/certain count. The *al-Mughni* passage
explicitly reports Ibn al-Mundhir's consensus claim and draws an analogy to
prayer; the *al-Majmuʿ* passage is in al-Nawawi's commentary on al-Shirazi's
base text. This is a candidate same-outcome comparison, not yet a worked
example: a specialist must determine whether the reasoning is materially
distinct and whether the scope and textual layer have been represented fairly.

A page-level source check narrows the pagination question. The [NYU/AUB catalog record](https://sites.dlib.nyu.edu/viewer/books/aub_aco003847/display?lang=ar)
identifies aub_aco003847 as *al-Majmuʿ*, vol. 8, Medina, al-Maktabah al-Salafiyah,
with a catalog date of 1344 H. [1925? M.]. Visual inspection of the volume title
page and [canvas 25](https://sites.dlib.nyu.edu/viewer/api/image/books/aub_aco003847/25/full/1800,/0/default.jpg) confirms that this witness's printed p. 21 contains the
candidate live-tawaf-count ruling in the commentary layer. This corroborates
printed p. 21 for this manifestation and the local 8/21 pinpoint, but does not
identify the edition behind Shamela 2186 or establish complete text-to-scan
identity. An earlier NYU link to aub_aco003855 was a mistaken volume lead; that
identifier is vol. 16, while aub_aco003847 is vol. 8. A [secondary online reference](https://www.islamarchive.cc/fatwa_show_14305_4)
also cites 8/29, which should be treated as a variant manifestation/citation
locator, not substituted for either verified p. 21 reference. Exact hashes,
scan canvases, scope, and rights caveats are in the ignored private packet
`I17-tawaf-shared-outcome-comparison-candidate.json`. The comparison remains
unapproved pending full manifestation collation and specialist assessment of
whether the reasoning differs materially. A second bounded scan check rejects a
tempting pagination shortcut for al-Mughni: [NYU/AUB aub_aco003830](https://sites.dlib.nyu.edu/viewer/books/aub_aco003830/display?lang=ar) is a separately
cataloged 1926 al-Mughni, vol. 3, from Matbaat al-Manar, whereas the current
Shamela 8463 index record describes a 1388-1389 H./1968-1969 Cairo Library
printing in 10 volumes. [NYU canvas 348](https://sites.dlib.nyu.edu/viewer/api/image/books/aub_aco003830/348/full/1800,/0/default.jpg) is printed p. 344, but the photographed
page covers a different passage and does not contain the tawaf-count candidate.
This witness cannot collate Shamela vol. 3/p. 344 by matching page numbers; the
target may occur elsewhere in the NYU manifestation and was not located in this
check. NYU's provider public-domain notice is not treated as reuse clearance.
Specialist assessment of distinct reasoning and full edition matching remain
open. No position or score was added.

A targeted catalog search found an acquisition lead for the matching-looking
Cairo printing: [Waqfeyah's set listing](https://waqfeyah.wordpress.com/2002/10/22/12691/)
labels *al-Mughni* as Cairo Library, 1388/1968, ten volumes and links volume 3
to [Internet Archive](https://archive.org/download/Elmoghni/03_elmoghni.pdf).
A separate Muslim Library listing also identifies a volume 3, Cairo Library,
1968, edited by Taha al-Zayni. The Archive PDF endpoint returned HTTP 403 during the initial discovery check, so it was then only a bibliographic lead. A later follow-up retrieved the 526-page file and inspected its title page and p. 344; Maknoon and Archive appear to expose the same scan, and the normalized local row matches the page OCR. This later check supports a candidate text/page concordance, not exact manifestation identity or source lineage for Shamela 8463. The title-page year remains unreadable with confidence; rights remain `needs_review`, and no scan or text reuse is authorized. See the dated I17 scan-page match entry in `PROGRESS.md` and the private tawaf comparison packet.

These interpretations are research triage, not expert-verified legal conclusions. Exact Arabic pages remain in the ignored private database. Working translations are not approved translations; printed locators, scans, edition correspondence, and rights remain unresolved.

## Cross-tradition coverage gaps

The current 8,538-entry metadata scan did not establish a direct legal source for Ibadi, Imami/Twelver, Ismaili, or self-representative Quran-alone approaches, nor a school-representative Zaydi legal source. Al-Shawkani's fiqh/usul titles can support inquiry into his own positions only. The local *al-Bahr al-zakhkhar* title hit is al-Bazzar's hadith musnad. This is a bounded literal-query scan, not proof of absence; exact search terms, hits, and false positives are in `catalog-coverage-scan.md`. A privately stored, unreviewed *Kitab al-Nil* passage now provides a direct Ibadi source lead for a specific purity-transfer case; it does not establish an issue position, school-wide representation, or scoring eligibility. External leads also include Aṭṭafayyish's commentary, al-Murtada's *al-Bahr al-zakhkhar*, and al-Tusi's *al-Mabsut fi fiqh al-Imamiyya*. Their versions, printed pagination, scan correspondence, and reuse terms still require review. A second independently bounded self-representative Quran-alone source has not yet been selected.

## Validation evidence

The latest data validator passed SQLite integrity and foreign-key checks; duplicate and unreproducible passage IDs; exact Arabic and footnote fidelity against the supplied Parquet; raw digital locator agreement; absence of invented printed locators; all 20 dossier/count checks; question and JSON export counts; exact translation-segment offsets and hashes; position-evidence references; profile links; and candidate score/status invariants. At this checkpoint the store has 8,538 source records, 20 issues, 12 axes, 24 questions, 46 provisional mappings, eight candidate profiles, 11,737 machine-retrieved passages across 20 source IDs, 28 position candidates, 28 working translation segments, 24 profile-position links, and 28 automated/editorial triage events. I14's 479 candidates include seven private shortlist passages from five newly screened works; none is promoted to a reviewed position. Validation does **not** establish attribution, legal interpretation, translation accuracy, printed-edition identity, scan fidelity, rights clearance, or human review.

## M1 gate and next work

M1 remains open. All twenty dossiers now have candidate assessments; none is fully resolved. The roadmap still requires traceable or explicitly unresolved dossiers, evidence-linked profile answers, a worked example of shared outcomes with different reasoning, and a five-to-eight-reader comprehension check with resulting corrections. No reviewed scoring walkthrough has been produced; this memo is the current data checkpoint, not the final M1 findings after review. Specialist fiqh review, bilingual review, scan collation, and rights review remain human gates.

**Next research batch:** obtain qualified review of the new I14 packet to determine which passages, if any, bear on the scoped lay-following question; then add contrary views and direct case comparisons across I09–I17 and I19–I20 and seek cross-tradition primary-source material for the best-supported issues. I09–I17, I19, and I20 have bounded candidates but need contrary views and additional direct cases; I10 and I14 especially need other author/tradition treatments. Prioritize terms that distinguish authorial conclusions from reports and opponents' views. In parallel, record direct-source acquisition/version checks for the underrepresented traditions and identify a self-representative Qurʾan-alone source. Keep all resulting positions and profile matches unscored until review criteria are met.

## Roadmap effort context

The original roadmap allocates 2–4 focused weeks to M1, 4–10 to M2, and a serial 20–41 working weeks across M1–M8 before reviewer or acquisition delays. These are planning allowances rather than estimates of remaining effort. Re-estimation should use measured time from completing and reviewing five dossiers. Current gates are M1 open, M2 partial, M3 in progress, M4 partial, and M5–M8 not started; see `roadmap-gates.md` for criterion-level status.
