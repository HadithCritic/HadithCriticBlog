# Extracting readings from al-Dānī's *at-Taysīr*

This is the book-specific method for Shamela book 5527. It supplements the
project's shared claim schema; it does not treat *at-Taysīr* as another copy of
the ten-reader *Taḥbīr* workflow.

## What the source says about its own organization

The preface (vol. 1, p. 3) states that al-Dānī reports two riwāyāt for each
of seven qurrāʾ. Where a pair differs, he names the rāwī and omits the imam's
name; where they agree, he names the imam. It defines **al-Ḥaramiyyān** as
Nāfiʿ and Ibn Kathīr, and **al-Kūfiyyūn** as ʿĀṣim, Ḥamza, and al-Kisāʾī. The
latter is a three-reader group in this book; do not expand it with Khalaf
al-ʿĀshir from the ten-reader books. These are recorded as source-specific
groups in `../authorities.json`.

Resolve a bare **Khalaf** according to this book's stated seven-reader scope:
the preface (vol. 1, p. 3) explicitly gives `عن حمزة رواية خلف وخلاد عن سليم عنه`,
so `خلف` in a farsh item is Khalaf from Ḥamza (`khalaf_hamza`), not Khalaf
al-ʿĀshir. Preserve the local bare-name span and cite the p. 3 identification
with `identified_by` when the verifier needs the disambiguating context.
The same preface lists Abū Shuʿayb among Abū ʿAmr's transmitters via
al-Yazīdī; map this book's Abū Shuʿayb to `susi`. When a passage marks his
reading as a report (`روي`), preserve it with the project's `permitted` basis
instead of treating it as the source's ordinary listing.
The preface also names Abū ʿUmar among Abū ʿAmr's transmitters via al-Yazīdī.
In this book's context, map `أبو عمر` to the Abū ʿAmr route of al-Dūrī
(`duri_abu_amr`), using the p. 3 preface as `identified_by` so it is not
confused with al-Dūrī's al-Kisāʾī route.

The text is not uniformly a word-by-word list. It opens with biographies and
transmission chains (pp. 4–16), then istiʿādha and basmala (pp. 16–18),
general pronunciation chapters (pp. 19–71), and farsh by sura (pp. 72–226),
followed by takbīr (pp. 226–228). The uṣūl chapters include conditional and
cross-word rules that may apply at multiple Qurʾānic locations. The farsh
section mixes local word readings, several named locations, `حيث وقع`
(wherever it occurs), and rule-like statements; do not assume one paragraph
equals one verse feature.

## Extraction rules

1. Read the original source pages with `show-pages.py --book 5527`; use the
   bilingual chapter translation only to navigate. Arabic translation text is
   not evidence. Cite the original book's volume, printed page, and exact
   continuous passage for every assertion.
2. Before each range, identify its chapter/sura boundary and whether the
   passage is an uṣūl rule, a farsh reading, a transmission statement, or
   another kind of material. Record every passage as incorporated, out of
   scope with a reason, or unresolved. Page coverage alone is not proof that
   all variants on a page were extracted.
3. Use the seven-reader closed set for `rest`. Resolve a qāriʾ name to both
   of that qāriʾ's transmitters; a named rāwī applies only to that transmitter.
   Do not infer that one transmitter's reading applies to the other when the
   source is silent. Preserve the source's decision to name the imam when his
   two riwāyāt agree and a narrator when they differ. When a source-defined collective is followed by an explicit transmitter exception, narrow the collective to the sibling transmitter only when the book's definition and same passage identify that relation; otherwise record the membership as unresolved.
4. Use `haramiyan_taysir` and `kufiyun_taysir` for the source's two defined
   collectives. Other regional or plural terms remain unresolved until this
   book itself defines them. Keep source quotations and the expanded
   individual-reader claims together so the collective wording remains
   auditable.
5. For listed places, emit a distinct location assertion at each explicit
   place. For `حيث وقع`, record the book's wherever scope rather than guessing
   a finite verse. If the source gives multiple readings for one word, retain
   each reading and its own reader span; do not flatten phonetic distinctions
   into a gloss. Distinguish a rule that describes a recitation procedure
   from a located word reading, and do not force an unlocated rule into a
   verse.
6. Search existing features and claims before adding data. If the same
   feature and form already exist, add an *at-Taysīr* claim with its own
   evidence and citation; do not discard it as a duplicate source. If its
   forms or attributions differ, preserve those source-specific differences
   and document any feature-model limitation as unresolved.

## Current implementation boundary

The existing `farsh/` verifier validates book 5527 evidence and its
source-specific groups. The checked p. 76 batch adds 24 claims from 12
anchored items. Its Abū ʿAmr via al-Yazīdī distinction remains in route detail
because it does not identify a canonical riwāya. A separate cross-page batch
maps the 33-occurrence Ibrāhīm list to 28 locations and 68 claims; 27 anchors
are exact and the source-resolved 19:46 token has one documented weak anchor
because its vocative prefix is fused in the Cairo text. The p. 77 batch adds
28 claims from 14 anchored items, including the ten-position `لرءوف حيث وقع`
family. Page 78 adds 28 claims from 14 anchored items: the `تصريف الريح`
family at 11 loci, two readings at 2:165, and the wherever `خطوات` reading.
Ten wind-family positions supplement existing features and 18:45 adds a new
feature. Page 78 also begins two uṣūl passages that continue on p. 79; these
remain open for rule-layer review. Page 79 adds 15 claims from seven items,
page 80 adds 30 claims from 15 items, page 81 adds 32 claims from 15 items,
and page 82 adds 24 farsh claims from 12 reading items plus one rule claim.
The p. 81 `في الحرفين` statement is one assertion against the existing
feature documenting both 2:236 tokens. `يبسط` at 2:245 has a reviewed weak
anchor because the Cairo token includes a prefixed wāw. The `تمسوهن` locator
and the Khallād/al-Naqqāsh route details remain separately documented as
unresolved. `assemble-farsh.py` supports `merge_into` and
`value_of` for claims on existing positions, and `scope: rule` items enter the
existing rules layer. On p. 72, six located reading items merge into existing
features, while two rule items create separate source-supported rule
features. The 12 p. 73 items add 25 claims to existing positions. The p. 73
route-level pronunciation paragraph is preserved separately because it
distinguishes regional routes without naming a riwāya; it is not flattened
into al-Dūrī or al-Sūsī. The 18 p. 74 items add 38 claims: most supplement
existing positions, while three positions are created for the remaining
explicit occurrences in the source's `القدس حيث وقع` rule. Page 75 adds 17
farsh claims to existing and new positions, plus a rule-layer item for its
conditional future-verb family, named exceptions, and remainder. Its listed
exception loci still need position-level review. The full Qirāʾāt rebuild
verifies the mapped claims.
The Sura 1 pilot is assembled separately, so future at-Taysīr claims for its
positions need explicit pilot integration rather than assuming a farsh merge
will reach it.

## Coverage record

No full range from book 5527 has yet been exhausted. The regenerated project
currently has 1,314 farsh claims and 38 rule claims from this book through
p. 119. These are generated claim counts, not counts of distinct
reading forms. The detailed page-by-page tally below is a working extraction
log; the generated totals are authoritative when the two differ. The farsh
claims include the pp. 94–95 additions (60 located assertions and three rule assertions). The farsh
claims are eight from the Sura 1 pilot, 12 claims for six reviewed farsh items
on p. 72, 25 claims from 12 reviewed farsh items on p. 73, 38 claims from 18
reviewed farsh items on p. 74, 17 claims from six reviewed farsh items on
p. 75, 24 claims from 12 reviewed farsh items on p. 76, and 28 claims
from 14 reviewed p. 77 items, plus 68 claims at 28 locations for the
cross-page Ibrāhīm list on pp. 76–77, 28 from 14 p. 78 items, 15 from seven
p. 79 items, 30 from 15 p. 80 items, 32 from 15 p. 81 items, and 24 from 12
p. 82 reading items, 41 from 33 p. 83 items, 29 from 12 p. 84 reading items, 51 from 31
p. 85–86 items, 41 from 21 pp. 87–88 items, 33 from 15 pp. 88–89 items,
22 from 11 p. 90 items, 22 from 11 p. 91 items, 20 from ten p. 92 items,
and 26 from 17 p. 93 items; 60 assertions from 30 pp. 94–95 locations; 23 p. 96 form assertions; 16 located and two rule assertions on p. 97; and 29 form assertions on p. 98.
The 23 rule claims are four from two p. 72 rule items, two from the
p. 75 verb-family rule, one from the p. 82 `أنا` rule, four from two p. 84
rules, one p. 86 sentence-final-yāʾ rule, two pp. 87–88 rules, and four
pp. 88–89 rules, plus the two-form `يحزن` rule spanning pp. 91–92 and the three-form imperative-sʾ-l rule on p. 95, and the two-form ṣād–dāl phonetic rule on p. 97. These
pages preserve source-specific groups,
local and wherever readings, and phonetic distinctions. The `متم` / `مت` /
`متنا` family on p. 91 remains unresolved pending exact occurrence mapping;
pages 91–92 otherwise retain their named forms, paired locations, and routes.
The pp. 99–104 source assertions are also incorporated: p. 99 contributes 22
generated claims, including the unresolved two other `السحت` locations; p. 100
contributes 21; p. 101 contributes 26, with the al-Ṣaff location of
`إلا ساحر` and the trailing Ibn Kathīr attribution at 6:23 retained as
unresolved; p. 102 contributes 33 farsh and three rule claims; and p. 103
contributes 20 farsh and one rule claim, with its unnamed stopping counterpart
and route-specific imāla exception kept unresolved. Page 104 contributes 11
farsh claims and six rule claims plus one permitted report: its explicit imāla
conditions, permitted Abū ʿAmr/Sūsī form, route-specific additions, and two
named loci are kept distinct. Page 105 contributes 28 farsh claims across its
12 reading items and the explicitly out-of-scope cross-reference. Page-by-page states,
unresolved clauses, and exact batch links are in `COVERAGE.md`. Pages 106–107
contribute 17 and 15 reading items respectively. The p. 106 `يصعد` sequence
is completed across the page break; p. 107 adds the named cross-sūra readings
and wherever forms, while retaining its incomplete `بزعمهم` locator, bare
`الذين قتلوا` mention, and unspecified `يوم حصاده` reader as tracked gaps.
Page 108 contributes 36 located reading items, including 17 explicit
occurrences of the tāʾ-initial `تذكرون` wherever form and the eight
hamza/yāʾ positions. Page 109 contributes 11 items: it resolves the Warsh
`ومحياي` distinction across two pages, preserves the Abū al-Azhar/Yūnus
routes and Uthmān b. Saʿīd's distinct preferences, then begins al-Aʿrāf
farsh. Page 110 adds 10 items and 23 claims, including the explicit 13:3
cross-reference and two wherever readings; its bare `وخفية` and `الريح`
pointers are out of scope. It also corrects the existing Taḥbīr remainder
form for the four raised nouns at 7:54, preserving that source's exact
evidence. Page 111 adds 27 farsh claims and two rule claims: it maps the three
`أبلغكم` loci, preserves Warsh's separate naql at 7:98, and records the
`أرجئه` forms and hāʾ stopping procedure in their proper layers. Page 112
adds 25 farsh claims and one bounded rule claim across al-Aʿrāf, Yūnus, Ṭā
Hā, and al-Shuʿarāʾ, including the three distinct `آمنتم به` positions. Page
113 adds 26 claims across 13 assertions, including explicit an-Naḥl and Ṭā Hā
locations. Its reader names were parsed in the source’s entry order, including
the trailing Ibn ʿĀmir attribution for the following `عنهم اصارهم` lemma. Page
114 adds 23 claims across 10 items. Abū Bakr’s disputed `بيئس` and separately
reported `بئيس` forms remain distinct; the reader of lightened `يمسكون` is
unresolved in this book. The paired yāʾ forms at 7:172–173 and the explicit
Fuṣṣilat cross-reference are mapped individually. Page 115 adds 20 claims: it
records the seven source-listed yāʾ loci separately and leaves the unnamed
readers of the omitted yāʾ at 7:195 unresolved. Its `معنى {بني إسرائيل}`
transcription is preserved verbatim. The shared Taḥbīr feature
descriptions at 7:62, 7:75, 7:81, 7:111, 7:113, and 7:117 were corrected to
separate reading forms from locators and stopping material. Page 116 adds 16
farsh claims across eight located items and two bare cross-references. It
preserves the rejected Qunbul report at 8:9 without assigning a canonical
reading, the at-Taysīr-specific remainder at 8:11, separate 8:18 forms for
`موهن` and `كيد`, both 8:42 occurrences named by `في الحرفين`, and the weak
Cairo anchor for the source's 8:50 tāʾ form. Page 117 adds 25 claims across
13 items, including the al-Anfāl paired yāʾ
positions and the opening at-Tawba `أئمة` sequence. Hishām's interposed-alif
form remains a route report tied to al-Dānī's reading on Abū al-Fatḥ; the
source's seven-reader group and remainder stay distinct. Page 118 adds 17
claims and one position; its 9:66 statement is completed across pp. 118–119.
Page 119 adds 24 claims and one position. It includes separate at-Tawba and
al-Fatḥ locations for `دائرة السوء`, the two `أسس بنيانه` loci, and explicit
cross-sūra attributions. The names at the end of p. 119 continue into `هار`
on p. 120 and are resolved there. Page 120 adds 19 claims; p. 121 adds 32
claims and four positions for its two an-Naḥl loci, ar-Rūm, and al-Anbiyāʾ.
Both pages preserve explicit route details outside canonical claims and keep
the `أدراك` wherever scope intact. Page 122's `وما يعزب` statement is
completed across pp. 122–123, while Qālūn and al-Yazīdī route distinctions at
10:35 remain separate from canonical reader forms. Pages 123–124 add 14 and
17 claims respectively, including all five expressly listed Yūnus yāʾ
positions, the route-specific stopping reports at 10:87, and the first Hūd
readings. Page 125 adds 35 claims and six positions, including its named
cross-sūra loci and the two wherever-scope hamza readings. Continue through
pp. 16–71 and 128–228, including istiʿādha and
basmala, the transition from uṣūl to farsh, and closing takbīr. Keep the
preface, biographies, and transmission chains accounted for separately as
contextual/structural material rather than variant claims unless an explicit
reading assertion is present.

After p. 125, the generated index contains 2,075 positions and 7,387 claims
across 103 suras; the rules layer contains 164 rules and 304 claims.
At-Taysīr contributes 1,416 farsh claims and 38 rule claims, plus one
permitted report. These are implementation counts, not a claim that the book
is exhausted.

### Current checkpoint after pp. 126–135

The p. 126–127 work completes the 18-position Hūd yāʾ list and records the
remaining local readings and consensus passage. P. 128 records eight Yūsuf
items and layered route detail; p. 129 records eleven readings and the
five-token al-Bazzī report. P. 130 has seven local items plus the complete
22-locus counted yāʾ family spanning pp. 130–131. P. 131 adds five local
readings, a Qunbul route-specific report in route detail, and a bare pointer.
P. 133 adds eight local reading items and tracks the literal Bazzī wording
issue separately. P. 134 adds eleven items, merging repeated forms into the
existing 14:2, 14:19, 24:45, and 14:30 features. P. 135 adds ten items and
preserves a Hishām teacher route. P. 136 adds twelve items, including the three
explicitly cross-referenced locations for the nūn reading and a weakly anchored
an-Naml cross-reference for قدرنا; one reader assignment at 15:54 remains unresolved. Pages 139–140 add 22 items and four tracked passages, including at-Taysir attribution groups for the three-form Af family and both Awma occurrences; the readers of five nūn/yāʾ loci remain unresolved because the source does not name them. Pages 137–138 add 21 items and seven tracked passages, including cross-sura locations at 23:21 and 36:82; repeated material is supplemented, and unclear reader attributions at 16:79 and 16:103 remain explicitly unresolved. The paired-interrogative rule spans pp. 131–133 and is now separately extracted and merged into the existing rule feature; the source gives an eleven-place total and examples but does not enumerate every verse. The checked
22-yāʾ batch has zero errors/gaps and all 22 anchors agree. The p. 131 batch
has zero errors/gaps, four agreeing anchors, and one weak source locator
anchor retained with its source feature link. Earlier weak Yūsuf anchors are
listed in `COVERAGE.md`.

The rebuilt index currently reports 2,083 positions and 7,689 claims across
103 suras. At-Taysīr contributes 1,723 farsh claims, 42 rule claims, and one
permitted report. These are generated counts, not evidence that the book is
exhausted. Pages 137–142 are now extracted; continue auditing farsh pages from p. 143 through p. 228 and uṣūl pages 16–71. The p. 141–142 batch adds 41 form assertions and two permitted report assertions at 19 anchored items, including the explicit 17:100 yāʾ locator and four Ḥafṣ sakt locations. `ابن عمرو` at 18:17 remains unresolved rather than normalized to Abū ʿAmr. At-Taysīr's bare `خلف` is identified as Khalaf from Ḥamza from the preface's p. 3 chain; the Abū Shuʿayb report is mapped as a permitted Sūsī claim under that same preface's transmitter identification. The source-defined three-reader al-Kūfiyyūn group is retained. The paired-interrogative rule remains at rule scope with its source-specific attributions and exceptions; its precise verse list remains unspecified by at-Taysīr. The rebuilt index reports 2,083 positions and 7,732 claims; the generated rules layer contains 164 rules in 38 chapters and 308 claims.
### Current checkpoint after pp. 143–144

Pages 143–144 are now extracted, checked, and entered in `COVERAGE.md`. The
batch contains 25 items and 54 form assertions, with three bare pointers
explicitly tracked out of scope. The checker found no errors or coverage
gaps; 24 anchors agree, and the explicit yāʾ form for `ولم يكن له` at 18:43
retains a reviewed weak-anchor note because the Cairo text has tāʾ there.
Cross-sūra mentions at 27:49, 48:10, and 65:8 are preserved as stated; the
`نكرا` statement is not extended to another al-Kahf occurrence. The rebuilt
index now reports 2,084 positions and 7,786 claims across 103 suras; the
rules layer has 164 rules, 38 chapters, and 308 claims. At-Taysīr is still
in progress: continue farsh pages through p. 228 and uṣūl pages 16–71, while
accounting for front matter and closing material separately.

### Current checkpoint after pp. 145–146

Pages 145–146 are now extracted, checked, and entered in `COVERAGE.md`. The
batch contains 25 items and 52 form assertions, with one route attribution
explicitly unresolved: the source pairs Ḥamza with Abū Bakr's disputed route
before `قال ءاتوني` without identifying which Abū Bakr route has which form.
At-Taysīr's cross-sūra forms for `أن يبدلهما` and `يأجوج ومأجوج` are recorded
at every named occurrence. At 18:96, Warsh's transfer note is retained apart
from the general `ردما ءاتوني` forms. The checker found no errors or coverage
gaps; 22 anchors agree and three weak anchors have source-specific notes. The
rebuilt index now reports 2,087 positions and 7,838 claims across 103 suras;
the rules layer contains 164 rules, 38 chapters, and 308 claims. At-Taysīr is
still in progress; continue auditing farsh through p. 228, uṣūl pp. 16–71,
front matter, and closing material.

### Current checkpoint after pp. 147–148

Pages 147–148 are now extracted and checked in `batch-5527-p147.json`.
The batch has 31 location items, 51 form assertions, five tracked passages,
and zero errors or coverage gaps. It records four counted yāʾ openings, the
seven-place yāʾ deletion list, the Maryam opening-letter vowel combinations,
and the source's named Maryam farsh readings. Abū Shuʿayb's matching opening-
letter report is retained as permitted Sūsī evidence under the p. 3
identification. The reader of the nūn-and-alif form at 19:9 remains unresolved
because the local name sequence does not identify it; the `من تحتها` mīm
distinction is kept separate from another book's combined mīm/tāʾ feature.
Three weak anchors have source-specific notes. The rebuilt index reports
2,090 positions and 7,892 claims across 103 suras; the rules layer remains
164 rules, 38 chapters, and 308 claims. At-Taysīr remains in progress.

### Current checkpoint after p. 150

Page 150 is extracted and checked in `batch-5527-p150.json`. The batch has
18 location items, 33 form assertions, three tracked passages, and zero
checker errors or coverage gaps. The cross-page five-place `walad` sequence
was treated as one source statement spanning pp. 149–150: the p. 149 list and
reader names are joined to the p. 150 forms, then recorded at all five
explicit verse locations. The page's reader names before a new lemma govern
that following lemma; the two explicit cross-sūra statements are split into
one record per named locus. The six-yāʾ count is accounted for by six
locations: four readings are recorded from clear wording, while the source
text `فحتمها` for 19:18 and 19:45 is left unresolved rather than normalized
without source-image confirmation. At Ṭā Hā, the source-specific seven-reader
groups and the exact opening-letter reader set are retained separately from
the ten-reader compilation already linked at 20:1. The 19:10 `اجعل لي آية`
anchor remains weak after review because the source cache spells the lemma
`لىءاية`; the source's local Maryam list and paired 19:47 phrase support the
location. The previous 19:9 attribution gap is unchanged. At-Taysīr remains
in progress.

### Current checkpoint after p. 151

Page 151 is extracted in `batch-5527-p151.json`: 12 items, 22 form
assertions, four tracked passages, and zero checker errors or coverage gaps.
The sequential Ṭā Hā list explicitly assigns Ḥamza to the doubled-nūn form
at 20:13 and Ibn ʿĀmir to `اخترناك`; a separate named phrase assigns Ibn
ʿĀmir at 20:31. The page's two `مهدا` loci and Kufi group are split by verse,
and its explicit no-disagreement note for al-Nabaʾ 78:6 is tracked without a
variant record. The waqf mention at 20:58 is preserved as a pointer only.
For 20:32, the page states the positive hamza form but does not name its
reader locally, so only the explicit remainder is recorded and the missing
reader assignment is tracked. At 75:36, Warsh and Abū ʿAmr's between-between
reading and the remainder's fatḥ are preserved; the preceding readerless
imāla statement remains unresolved. Separate items preserve the 20:63
`هذين` yāʾ/alif and nūn-gemination claims. Two weak anchors have source-based
hints: `اخترناك` (20:13) and the extended `أخي اشدد` phrase (20:31).
The successful rebuild now reports 2,092 positions and 7,967 claims across
103 suras; the rules layer remains 164 rules, 38 chapters, and 308 claims.
At-Taysīr remains in progress.

### Current checkpoint after p. 152

Page 152 is extracted in `batch-5527-p152.json`: 12 items, 24 form
assertions, three tracked passages, and zero checker errors or coverage gaps.
The sequential method keeps the reader names attached to the source's next
named lemma, while the three explicitly counted `قد انجيتكم`, `واعدتكم`, and
`ما رزقتكم` locations are recorded separately. Qālūn's `بخلاف عنه` wording
is preserved as a route qualification; Abū Shuʿayb's report is mapped to
the Sūsī only because at-Taysīr's own p. 3 preface identifies his Abū ʿAmr
transmission through al-Yazīdī. The adjacent 20:81 `فيحل`/`ومن يحلل` readings
are split by locus but retain their coordinated al-Kisāʾī attribution. The
source's bare pointers are retained without expanding prior forms. Its final
no-difference note quotes `أن يحل عليكم` but gives no sura or verse; this
reference remains unresolved rather than being assigned a location from
another compilation. The 20:81 `ومن يحلل` item explicitly extends the
existing feature with the source's newly documented remainder form; the
assembler's `extend_target_values` flag is limited to that missing, evidenced
form. The successful rebuild now reports 2,094 positions and 7,991 claims
across 103 suras; the rules layer remains 164 rules, 38 chapters, and 308
claims. At-Taysīr remains in progress.

### Current checkpoint after p. 153

Page 153 is extracted in `batch-5527-p153.json`: ten items, 23 form
assertions, one tracked passage, and zero checker errors or coverage gaps.
The page closes the verse-by-verse Ṭā Hā list, then gives a sura-specific
end-verse imāla synopsis. That passage is entered as a general rule scoped
to Ṭā Hā, preserving the boundary from `لتشقى` onward, the additional
`ومن اهتدى` locus, Abū ʿAmr's rāʾ examples and other between-between cases,
Warsh's treatment throughout, and the remainder's pure fatḥ. The bare
`يبنؤم` cross-reference is not expanded. The variant `بما لم تبصروا` is
linked to 20:96 with a reviewed weak anchor because it is absent from the
Cairo word form. The successful rebuild now reports 2,096 positions and
8,010 claims across 103 suras; the rules layer has 165 rules in 39 chapters
with 312 claims. At-Taysīr remains in progress.

### Current checkpoint after p. 154

Page 154 is extracted in `batch-5527-p154.json`: 16 items, 19 form
assertions, three tracked passages, and zero checker errors or coverage gaps.
This page closes Ṭā Hā with a counted yāʾ list and begins al-Anbiyāʾ. The
source's own `الحرميان` and `الكوفيون` groups are used; named transmitters
Warsh and Ḥafṣ are not broadened to their imams. Fourteen distinct yāʾ
locations are explicitly named despite the source heading's count of thirteen.
All are retained while the count discrepancy remains open. The quoted
`لذكري إن`, `على عيني إذ`, and `أخي اشدد` spans cross verse boundaries; each
is anchored to the verse containing the yāʾ-bearing word. For `لنفسي` and
`في ذكري`, the source explicitly says the sukūn yāʾs drop from pronunciation
when two sukūns meet. At 20:125, the source also says the yāʾ is omitted but
does not name a reader; that attribution remains unresolved. At al-Anbiyāʾ
21:7, `نوحي إليهم` is only a pointer, while the explicitly restated second
occurrence at 21:25 is entered. The checked batch has 14 agreeing anchors and
two reviewed weak anchors at 20:14 and 20:39, where the cited phrases include
the following verse's opening word. The successful rebuild reports 2,096
positions and 8,029 claims across 103 suras; the rules layer remains 165 rules
in 39 chapters with 312 claims. At-Taysīr remains in progress.

### Current checkpoint after p. 155

Page 155 is extracted in `batch-5527-p155.json`: seven items, 13 form
assertions, five tracked passages, and zero checker errors or coverage gaps.
This is a verse-order continuation through al-Anbiyāʾ, with a named
cross-sura location at Luqmān 31:16 and several bare “already mentioned”
pointers. Reader names immediately before a slash-delimited lemma are
assigned to that next lemma. That source-order rule matters at 21:80: Abū
Bakr's nūn reading is explicit, but the tāʾ reader is not named, while Ibn
ʿĀmir and Abū Bakr appear before the next slash-delimited reading at 21:88.
The 21:58 kasra and 21:104 plural forms also lack unambiguous readers, so
their complementary `الباقون` forms are not expanded. Those passages remain
tracked unresolved. One reviewed weak anchor remains at 21:30 (`d155-01`),
where the source's `الم تر` form differs in wording from the Cairo token; its
same-locus target is documented. The successful rebuild reports 2,096
positions and 8,053 claims across 103 suras; the rules layer now has 166 rules
in 40 chapters with 314 claims. At-Taysīr remains in progress.

### Current checkpoint after p. 156

Page 156 is extracted in `batch-5527-p156.json`: eight items, 13 form
assertions, seven tracked passages, and zero checker errors or coverage gaps.
It closes al-Anbiyāʾ and opens al-Ḥajj, then gives a four-word lām sequence
with reader names placed between lemmas. The names immediately preceding
`ثم ليقضوا` and the paired `وليوفوا`/`وليطوفوا` are assigned to those following
lemmas. The kasra at 22:15 `ثم ليقطع` remains unresolved because the local
sequence does not identify its reader. The four-yāʾ list includes an explicit
reader assignment for `إني أنا الله`, but its location is not identifiable
within the al-Anbiyāʾ context and is left unresolved. A separate rule item
preserves the source's Qurʾān-wide first-hamza treatment for the luluʾ forms
and Ḥamza's waqf condition. Rebuild counts are recorded after the successful
build below. At-Taysīr remains in progress.

### Current checkpoint after p. 157

Page 157 is extracted in `farsh/taysir/batch-5527-p157.json`: 11 items and two tracked passages, with zero checker errors or coverage gaps. It continues the Qurʾān-wide hamza rule begun on p. 156, which is represented as a source-specific continuation with the p. 157 witness retained. Hishām's separate second-hamza statement is captured, while the following remainder is unresolved because its transmitter-set boundary is not explicit. The verse-order sequence through al-Ḥajj 22:45 records each named form and source-local reader set. The p. 157 `{ولولا دفع الله}` remains only a pointer; the dāl contrast on `{لهدمت صوامع}` remains unresolved for missing positive attribution, while tāʾ-to-ṣād idghām is independently recorded. At-Taysīr remains in progress.

### Current checkpoint after p. 158

Page 158 is extracted in `farsh/taysir/batch-5527-p158.json`: 14 reading items and four tracked passages, with zero checker errors or coverage gaps. Its organization shifts from al-Ḥajj farsh in verse order to a yāʾ inventory, then begins al-Muʾminūn. Explicit cross-sura locations are entered separately. The global phrase `حيث وقعت` is resolved against the local Qurʾān text and entered at all four matching occurrences. Bare cross-references remain pointers; the unspecified reader set for `وأن ما تدعون` and the second item in the two-deletion notice remain unresolved. At-Taysīr remains in progress.

### Current checkpoint after p. 159

Page 159 is extracted in `farsh/taysir/batch-5527-p159.json`: three directly supported items and nine tracked passages, with zero checker errors or coverage gaps. It continues al-Muʾminūn in verse order and includes bare “already mentioned” pointers between variants. The page's Kufi group is mapped through the source-specific `kufiyun_taysir` authority group. Names following `قد ذكر` remain attached to the preceding pointer; they are not moved to the next lemma. Five explicit contrasts stay unresolved where their positive reader set is missing. At-Taysīr remains in progress.

### Current checkpoint after p. 160

Page 160 is extracted in `farsh/taysir/batch-5527-p160.json`: ten supported items and three tracked passages, with zero checker errors or coverage gaps. The verse-order section uses ordinal and paired-locus wording. The two later `سيقولون الله` occurrences and both `لبثتم` phrases were entered separately, with the source's explicit shared scope preserved. The page then gives a one-yāʾ inventory for al-Muʾminūn. One explicit contrast, `لا ترجعون`, remains unresolved because its positive reader set is absent. At-Taysīr remains in progress.

### Current checkpoint after p. 161

Page 161 is extracted in `farsh/taysir/batch-5527-p161.json`: four directly attributed items and eight tracked passages, with zero checker errors or coverage gaps. The page opens al-Nūr, mixes verse-order readings with bare pointers and ordinal references, and ends mid-entry with an Ibn ʿĀmir cross-page item. That continuation is completed in the p. 162 batch. The names immediately before `على جيوبهن` and `غير أولي الإربة` are assigned forward to those lemmas; the positive group for `يوم يشهد` and the ambiguous 24:6 and oath statements remain unresolved. At-Taysīr remains in progress.

### Current checkpoint after p. 163

Pages 162–163 are extracted in their own source-page batches. Page 162 completes p. 161's cross-page three-locus item and keeps the connected hāʾ vowel separate from the waqf alif feature. Page 163 closes al-Nūr, records its explicit one-yāʾ and variant material, and begins al-Furqān. The route and group names are attached according to each page's local order. The p. 162 unassigned `ويتقه` sukūn-hāʾ statement remains tracked while p. 163's named Qālūn/Ḥafṣ forms are recorded. The p. 163 `ويوم تشقق` list continues on p. 164 because its reading form is not stated yet. At-Taysīr remains in progress.

### Current checkpoint after p. 164

Page 164 is extracted in `farsh/taysir/batch-5527-p164.json`: 12 reading items and three tracked pointer passages, with zero checker errors or coverage gaps. It completes the p. 163 paired-locus `ويوم تشقق` statement using a two-page evidence window, then continues by verse order through 25:74. Existing features receive source-specific claims; Ibn Kathīr/Ibn ʿĀmir's alif deletion and ʿayn gemination at 25:69 is a separate lexical-form feature because the existing item models only rafʿ/jazm. Bare references to Thamūd, `الريح`, `بشرا`, and `ليذكروا` remain out of scope here because their reading forms are already stated elsewhere in this book. At-Taysīr remains in progress.

### Current checkpoint after pp. 165–166

Pages 165–166 are extracted in `farsh/taysir/batch-5527-p165-166.json`: 18 reading/rule items and five tracked passages, with zero checker errors or coverage gaps. The two explicit yāʾ al-iḍāfa readings, the three opening-letter locations, and the cross-page 26:61 waṣl/waqf rule are separately represented. At 26:56 and 26:187/34:9, `قد ذكر` prevents safely carrying the preceding reader group onto the following lemma, so the explicit forms remain unresolved rather than being given another source's attribution. The Hamza-to-lām Warsh route statement is kept distinct at the source's named al-Ḥijr and Qāf locations (15:78 and 50:14). At-Taysīr remains in progress.

### Current checkpoint after pp. 167–168

Pages 167–168 are extracted in `farsh/taysir/batch-5527-p167-168.json`:
26 reading items and eight tracked passages, with zero verifier errors or
coverage gaps, 24 agreeing anchors and two source-located items without direct
Cairo-word anchors. The p. 167 yāʾ inventory is mapped to all 13 explicitly
named al-Shuʿarāʾ locations, including the five occurrences of `إن أجري إلا`;
the second `من سبإ` location is Sabaʾ 34:15. Page 168 then continues the
source's al-Naml verse order. Names placed before the next lemma are assigned
forward; names after `قد ذكر` remain with the preceding pointer. The positive
reader attribution remains unresolved for `عن ساقيها` / `بالسوق` / `على
سوقه`, `أنا دمرناهم`, and `خير أما يشركون`, because names do not securely
attach to those contrasts under this local syntax. Direct-token anchor absence
for the source's variant spellings at 27:21 and 27:49 is documented in the
checked items. At-Taysīr remains in progress; the next farsh page is p. 169.
