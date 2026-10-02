# *At-Taysīr* passage coverage ledger

This ledger records review state, not just whether a script has spans over a
page. Citations are to book 5527,
volume 1, printed page as displayed by `show-pages.py`.

## Volume 1, p. 72 — opening of farsh, Sūrat al-Baqara

**Page status: audited; one scope question remains unresolved.** All reading
statements on p. 72 are accounted for in eight checked items. The remaining
uncertainty is whether the final `والباقون يحركون الهاء` applies to the
preceding wherever rule as well as the specifically quoted `ثم` locus.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Sura and chapter headings | Out of scope | Structural headings, not reading assertions. |
| `قرأ الحرميان وابو عمرو / وما يخادعون / ... والباقون بغير الف ...` | Incorporated | `farsh/taysir/batch-5527-p072-initial.json`, item `d72-01`; merged into 2:9. The group expands only as *at-Taysīr* defines it. |
| `الكوفيون {يكذبون} ... والباقون ...` | Incorporated | Same batch, item `d72-02`; merged into 2:10 with the source's three-reader Kūfī group. |
| `الكسائي وهشام {قيل} و {وغيض} و {وجيء} ... حيث وقع والباقون ...` | Incorporated | Same batch, items `d72-03` to `d72-05`; linked respectively to 2:11, 11:44, and 39:69, preserving the wherever scope and Hishām's transmitter-level attribution. |
| `ورش يمكن الياء من {شيء} و {شيئا} و {كهيئة} وشبهه وكذلك الواو من {السوء} و / سوءة / وشبهه اذا انفتح ما قبلهما وكانا مع الهمزة في كلمة حاشا {موئلا} و / الموءودة /` | Incorporated | Same batch, item `d72-07`, rule scope. Keeps Warsh's explicit examples, open-ended class, phonetic condition, and exceptions together; does not expand `وشبهه` into inferred locations. |
| `وحمزة يقف على الياء من {شيء} و {شيئا} في الوصل خاصة والباقون لا يمكنون ولا يقفون` | Incorporated | Same batch, item `d72-07`; Hamza's stopping distinction and the remainder's stated reading are separate forms, with Warsh excluded from the remainder as named in the evidence. |
| `قالون وابو عمرو والكسائي يسكنون الهاء من {هو} و {هي} اذا كان قبلها واو او فاء او لام حيث وقع` | Incorporated | Same batch, item `d72-08`, rule scope. Records the explicitly named positive reader set and wherever condition; no unstated opposition is added to this clause. |
| `وقالون والكسائي يسكنانها مع {ثم} في قوله {ثم هو يوم القيامة} والباقون يحركون الهاء` | Incorporated | Same batch, item `d72-06`; source's quoted locator resolves to 28:61 and supplements the existing feature there. Do not relocate it to Baqara based on the page's sura heading. |
| Scope of the final `والباقون يحركون الهاء` relative to the two hāʾ conditions | Unresolved | It is recorded for the specifically quoted `ثم` locus in `d72-06`. The source's sentence does not unambiguously show whether this remainder also applies to the earlier wherever condition; no broader rest claim is inferred. |

The batch verifier and full `build-qiraat.py --skip-verify-batches` rebuild
passed after all eight items were added. The generated farsh index then
reported 1,936 positions and 5,979 claims. This count was superseded after
reviewing p. 73; see the updated totals below.

## Volume 1, p. 73 — continuation of farsh, Sūrat al-Baqara

**Page status: reviewed; two clauses remain unresolved and are not claims.**
All directly locatable reading statements are recorded in the checked p. 73
batch. The source's route-specific Abū ʿAmr pronunciation report is retained
verbatim in `../second-witness/route-detail.json`: the text distinguishes
Baghdādī routes from Raqī routes and other routes, but does not name either
of this book's two riwāyāt, so assigning the difference to al-Dūrī or
al-Sūsī would be unsupported. The phrase `{عليهم الذلة} وبابه قد ذكر` gives
no reading or reader in this passage; its antecedent is unresolved and no
claim is made from it.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `حمزة فازالهما ... والباقون ...` | Incorporated | `farsh/taysir/batch-5527-p073-initial.checked.json`, `d73-01`; 2:36. |
| `ابن كثير / فتلقىءادم / بالنصب {كلمات} بالرفع ...` | Incorporated | `d73-02`; 2:37, retaining the source's case distinction. |
| `ابو عمرو / ولا تقبل منها / بالتاء ...` | Incorporated | `d73-03`; 2:48. |
| `ابو عمرو / واذ وعدنا / / ووعدناكم / بغير الف حيث وقع ...` | Incorporated | `d73-04` and `d73-05`; 2:51 and 20:80, with the stated wherever scope preserved. |
| `نافع {يغفر لكم} بالياء ... وابن عامر بالتاء ... والباقون بالنون ...` | Incorporated | `d73-06`; 2:58, with all three forms and their distinct reader attributions. |
| `نافع {النبيين} و {الأنبياء} و {النبوة} و {النبي} حيث وقع بالهمز` | Incorporated | `d73-07` to `d73-10`; four wherever family items at their respective linked positions. |
| `قالون الهمز في قوله في الاحزاب {للنبي إن أراد} و {بيوت النبي إلا أن} ...` | Incorporated | `d73-11` and `d73-12`; the two al-Aḥzāb locations, retaining Qālūn's stated connected-reading condition. No Warsh claim is added. |
| `ابو عمرو {بارئكم} ... باختلاس الحركة من طريق البغداديين ... ومن طريق الرقيين ... بالاسكان ... والباقون يشبعون الحركة` | Unresolved / route detail | Exact p. 73 passage recorded in `../second-witness/route-detail.json`. It attributes forms to regional routes and teachers, not explicitly to a particular riwāya; it is not mapped to the two canonical transmitters. |
| `{عليهم الذلة} وبابه قد ذكر` | Unresolved | p. 73 supplies only a cross-reference, without its antecedent or explicit form/reader in this passage. No reading is inferred. |

## Volume 1, p. 74 — continuation of farsh, Sūrat al-Baqara

**Page status: reviewed; one recurrence-scope question remains unresolved.**
Location phrases in the source were checked against the Qurʾān text, and
repeated positions were kept separate where the readers differ by locus.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `نافع ... الصابين و الصابون بغير همز حيث وقع والباقون بالهمز` | Incorporated | `farsh/taysir/batch-5527-p074-initial.checked.json`, `d74-01`, `d74-02`, and `d74-18`; 2:62 and 22:17 for `الصابين`, and 5:69 for `الصابون`, all occurrences of the named forms. |
| `حفص {هزوا} و {كفوا} ... وحمزة ... والباقون ...` | Incorporated | `d74-03` at 2:67 and `d74-04` at 112:4. Hafṣ, Ḥamza, and the remainder retain separate forms; Ḥamza's connected and stopping description is preserved. |
| Whether the `هزوا` form distinction applies to its other Qurʾānic occurrences | Unresolved | p. 74 names the lexical form but does not say `حيث وقع` or list the other loci. The claim is attached to the matching Baqara locus; no global scope is inferred. Revisit against the source's treatment of repeated lexical forms before closing this page. |
| `ابن كثير {عما يعملون} بعده {أفتطمعون} بالياء والحرميان وابو بكر {عما يعملون} بعده {أولئك الذين} بالياء والباقون بالتاء فيهما` | Incorporated | `d74-05` at 2:74 and `d74-06` at 2:85. The following-word locators distinguish the two positions and their different reader assignments. |
| `نافع / خطايته / بالجمع والباقون على التوحيد` | Incorporated | `d74-07`; 2:81, plural versus singular. The batch retains the source's spelling in its lemma and evidence. |
| `ابن كثير وحمزة والكسائي / لا يعبدون الا الله / بالياء والباقون بالتاء` | Incorporated | `d74-08`; 2:83. |
| `حمزة والكسائي {للناس حسنا} بفتح الحاء والسين والباقون بضم الحاء واسكان السين` | Incorporated | `d74-09`; 2:83, both vowel distinctions retained. |
| `الكوفيون {تظاهرون} ... وكذا في التحريم {وإن تظاهرا عليه} ... فيهما` | Incorporated | `d74-10` at 2:85 and `d74-11` at 66:4; the defined three-reader Kūfī group is used. |
| `حمزة {أسرى} بغير الف ... والباقون بالالف` | Incorporated | `d74-12`; 2:85. |
| `نافع وعاصم والكسائي / تفدوهم / بالالف وضم التاء والباقون بغير الف وفتح التاء` | Incorporated | `d74-13`; 2:85. ʿĀṣim is resolved at imam level to both transmitters, as the source names the imam. |
| `ابن كثير {القدس} حيث وقع مخففا والباقون مثقلا` | Incorporated | `d74-14` to `d74-17`; all four exact occurrences, 2:87, 2:253, 5:110, and 16:102. The latter three were added as new positions because no existing feature covered them. |

The p. 74 batch verifier reported 18 items, zero errors, zero coverage gaps,
and verified anchors at all 18 loci. At the build immediately after p. 74, the
index reported 1,940 farsh positions, 3,831 grouped reading forms, and 6,042
farsh claims, plus 144 general rules in 29 chapters with 267 rule claims.
At that historical build state, at-Taysīr contributed 83 farsh claims (eight
Sura 1 pilot claims, 12 from p. 72, 25 from p. 73, and 38 from p. 74) plus
four rule claims. The book was not exhausted: one p. 72 scope question, two
unresolved p. 73 clauses, later pages, and earlier relevant chapters still
needed audit.

## Volume 1, p. 75 — word-family rule and continuation of farsh

**Page status: partially incorporated; the named exceptions still need
position-level review.** The source mixes a future-verb family rule and
exceptions with ordinary word readings. The rule item is kept in the general
rules layer; the named exception loci remain in its exact citation until each
can be checked against the existing features and any required sub-feature.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `ابن كثير وابو عمرو {ينزل} و {تنزل} و {ننزل} اذا كان فعلا مستقبلا مضموم الاول بالتخفيف حيث وقع ... والباقون بالتشديد` and the named exceptions | Rule incorporated; exception loci unresolved | p. 75 item `d75-07` in `farsh/taysir/batch-5527-p075-initial.checked.json`, emitted to the rules layer. The exact exceptions cite al-Ḥijr `وما ننزله`, al-Isrāʾ `وننزل من القرآن` and `حتى تنزل علينا`, al-Anʿām `على أن ينزل آية`, Luqmān `وينزل الغيث`, and al-Shūrā `الذي ينزل الغيث`. These loci still need position-level comparison. `والذي في الحجر مجمع عليه` is preserved verbatim; its referent is unresolved. |
| `ابن كثير / جبريل / هنا وفي التحريم ...` with the four stated form groups | Incorporated | `d75-01` at 2:98 and `d75-02` at 66:4. The source explicitly gives these two loci; the second is a new feature because no Jibrīl feature existed there. |
| `حفص وابو عمرو {وميكال} ... ونافع ... والباقون ...` | Incorporated | `d75-03`; 2:98, with all three reading forms retained. |
| `ابن عامر وحمزة والكسائي {ولكن الشياطين} ... وفي الانفال {ولكن الله قتلهم} و {ولكن الله رمى} ...` | Incorporated | `d75-04` to `d75-06`; 2:102 and both cited words at 8:17. The shared three-reader attribution and the remainder's form are preserved. |

The p. 75 batch verifier reported six anchored farsh items and one rules
item, with zero errors or coverage gaps. The full build passed. At that
historical build, generated data reported 1,941 farsh positions, 3,835
grouped reading forms, and 6,059 farsh claims, plus 145 general rules in 29
chapters with 269 rule claims. At-Taysīr then contributed 100 farsh claims
through p. 75 and six rule claims from pp. 72 and 75. The verb-family rule's cited exceptions, the
al-Ḥijr cross-reference, and the p. 74 recurrence scope for `هزوا` remain open
review items; p. 76 onward and earlier relevant chapters are unaudited.

## Volume 1, p. 76 — continuation of farsh, Sūrat al-Baqara

**Page status: partially incorporated; one source passage remains under
review.** The twelve located items in the p. 76 batch were checked against
existing features and merged rather than duplicated. Their 24 claims are
present in the generated project. The p. 76 transmitter/teacher distinction
for `وأرنا` / `وأرني` is retained separately because the source names both
Abū Shuʿayb and Abū ʿAmr through al-Yazīdī; the second attribution cannot be
assigned to a canonical riwāya without inference. See the p. 76 record in
`../second-witness/route-detail.json`.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `ابن عامر / ما ننسخ من ءاية / بضم النون وكسر السين ...` | Incorporated | `farsh/taysir/batch-5527-p076-initial.checked.json`, `d76-01`; 2:106. |
| `ابن كثير وابو عمرو {أو ننسها} بالهمزة ...` | Incorporated | `d76-02`; 2:106. |
| `ابن عامر (قالوا اتخذ الله) بغير واو ...` | Incorporated | `d76-03`; 2:116. |
| `ابن عامر {فيكون} ... في الستة ... وتابعه الكسائي في النحل ويس فقط` | Incorporated | `d76-04`–`d76-09`; 2:117, 3:47, 16:40, 19:35, 36:82, and 40:68. The source's limited al-Kisāʾī attribution is retained at only 16:40 and 36:82. |
| `نافع / ولا تسئل / ...` | Incorporated | `d76-10`; 2:119. |
| `نافع وابن عامر واتخذوا بفتح الخاء ...` | Incorporated | `d76-11`; 2:125. |
| `ابن عامر {فأمتعه} مخففا ...` | Incorporated | `d76-12`; 2:126. |
| `ابن كثير وابو شعيب {وأرنا} و {وأرني} ... وابو عمرو عن اليزيدي ...` | Unresolved as a canonical transmitter claim; exact passage preserved | The route detail records the source's sukūn, ikhtilās, and full-vowel forms. The four stated occurrences are 2:260, 4:153, 7:143, and 41:29; the al-Yazīdī teacher route is not assigned to al-Dūrī or al-Sūsī. |
| `هشام ابراهيم بالالف جميع ما في هذه السورة ... فذلك ثلاثة وثلاثون حرفا ...` (continues p. 77) | Incorporated | `farsh/taysir/batch-5527-p076-077-ibrahim.checked.json`, items `d76-13`–`d76-40`; all 33 occurrences across 28 verse locations. At 2:124, the claims supplement the existing feature; 27 other features were added. Ibn Dhakwān's two reported forms in al-Baqara remain a separate source-defined distinction. At 19:46, the source-resolved word has a fused vocative prefix in the Cairo text, so the claim retains a documented weak anchor instead of moving to another occurrence. The exact at-Taysīr evidence is cited across pp. 76–77; *Taḥbīr* is not substituted. |

The initial p. 76 batch verifier reported 12 anchored items, zero errors, and
zero coverage gaps. The cross-page Ibrāhīm batch separately verifies 28
locations and 68 claims, with 27 exact anchors and one documented weak anchor
at 19:46. The four-locus `وأرنا` / `وأرني` route attribution remains unresolved.
Earlier open issues and all p. 78–228 and pre-farsh material remain unaudited.

## Volume 1, p. 77 — continuation of farsh, Sūrat al-Baqara

**Page status: partially incorporated; two further statements remain
unresolved.** Four other directly locatable
items were merged into existing features (eight claims), and the ten-place
`لرءوف` wherever family was fully mapped (20 claims).

| Passage | Status | Record / reason |
| --- | --- | --- |
| `نافع وابن عامر واوصى بالالف مخففا والباقون بغير الف مشددا` | Incorporated | `farsh/taysir/batch-5527-p077-initial.checked.json`, `d77-01`; 2:132. |
| `حفص وابن عامر وحمزة والكسائي {أم تقولون} بالتاء والباقون بالياء` | Incorporated | `d77-02`; 2:140; Hafṣ remains a transmitter-specific attribution. |
| `ابن عامر / مولاها / بالالف والباقون بالياء` | Incorporated | `d77-04`; 2:148. |
| `ابو عمرو {عما يعملون} بعده {ومن حيث} بالياء والباقون بالتاء` | Incorporated | `d77-05`; 2:149. |
| `ابن عامر وحمزة والكسائي {عما تعملون} بعده {ولئن أتيت} بالتاء والباقون بالياء` | Unresolved | The described `ولئن أتيت` locator points to 2:145, where `عما تعملون` does not occur; an exact-lemma search instead finds multiple other loci. The verifier's best match was 2:140, a moved anchor, so no claim is made until the source's intended relation is clear. |
| `الحرميان وابن عامر وحفص / لرءوف / بالمد حيث وقع والباقون بالقصر` | Incorporated | `d77-06`–`d77-15` in `farsh/taysir/batch-5527-p077-initial.checked.json`; the explicit wherever scope resolves to 2:143, 2:207, 3:30, 9:117, 16:7, 16:47, 22:65, 24:20, 57:9, and 59:10. The 2:143 item supplements the existing feature; nine other positions were added after checking existing entries. The source's al-Ḥaramiyyān + Ibn ʿĀmir + Ḥafṣ group is kept distinct from *Taḥbīr*'s broader group, which also names Abū Jaʿfar. |
| `حمزة والكسائي / ومن يطوع / في الموضعين هنا وفي ...` | Unresolved / incomplete locator | The export gives the first phrase and says there are two places, but the second locator is absent after `وفي`; do not assume it from another book. |
| Continuation of `هشام ابراهيم بالالف ...` from p. 76 | Incorporated | `farsh/taysir/batch-5527-p076-077-ibrahim.checked.json`, items `d76-13`–`d76-40`; the full counted list and special Ibn Dhakwān report are mapped as described above. |

The p. 77 batch verifier reported 14 anchored items, zero errors, and zero
coverage gaps. The page is not complete: the two unresolved statements above
remain open. Page 78 farsh material has been incorporated; the uṣūl rule
passage that begins there continues on p. 79 and remains under review. Earlier
relevant chapters and pp. 91–228 remain to be audited. The current generated
index reports 1,996 farsh positions, 3,946 grouped reading forms, and 6,525
farsh claims, plus 152 general rules in 31 chapters with 281 rule claims.
At-Taysīr contributes 566 farsh claims and 18 rule claims (584 total). The
Ibrāhīm list adds 68 claims at 28 locations; 27 locations were new, while
2:124 was supplemented. The four non-`رءوف` p. 77 items add eight claims to
existing positions; the ten `رءوف` items add 20 claims across ten positions,
nine of which were new.

## Volume 1, p. 78 — end of farsh, Sūrat al-Baqara; transition to uṣūl

**Farsh status: incorporated; uṣūl status: unresolved pending chapter-level
review.** The page's located farsh statements are in three checked batches:
`batch-5527-p078.checked.json`, `batch-5527-p078-more.checked.json`, and
`batch-5527-p078-wind.checked.json`. They contain 14 reading items and 28
claims. The 11-position wind family contributes 22 claims; it maps source
groups and singular/plural forms separately at each cited locus. Ten loci
supplement existing features, and 18:45 adds a new feature. The two 2:165
readings and the wherever-scope `خطوات` reading add six claims to existing
features.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `حمزة والكسائي / وتصريف الريح / هنا وفي الكهف والجاثية ...` and the following location groups | Incorporated | `batch-5527-p078-wind.checked.json`, `d78-04`–`d78-14`; 2:164, 18:45, 45:5, 7:57, 27:63, 30:48, 35:9, 15:22, 25:48, 14:18, and 42:33. Reader groups and singular/plural assignments follow each source locator. Existing features were supplemented; 18:45 was added as a new feature. |
| `نافع وابن عامر / ولو ترى الذين / بالتاء والباقون بالياء` | Incorporated | `batch-5527-p078.checked.json`, `d78-01`; 2:165, merged into the existing feature. |
| `ابن عامر {إذ يرون} بضم الياء والباقون بفتحها` | Incorporated | `batch-5527-p078.checked.json`, `d78-02`; 2:165, merged into the existing feature. |
| `قنبل وحفص وابن عامر والكسائي {خطوات} بضم الطاء حيث وقع والباقون باسكانها` | Incorporated | `batch-5527-p078-more.checked.json`, `d78-03`; source-defined wherever scope, merged into the existing `خطوات` feature. Transmitter-specific Qunbul and Ḥafṣ remain as named. |
| `عاصم وابو عمرو وحمزة يكسرون النون ... اذا كان بعد الساكن الثاني ضمة لازمة ...` | Unresolved uṣūl rule | The examples and the conditional are one general pronunciation rule, not a single verse reading. Preserve its source-defined examples and condition when adding it to the rules layer; the passage continues across p. 79. |
| `وعاصم وحمزة يكسران اللام من {قل} والواو من {أو} ... والباقون يضمون ذلك كله` | Unresolved uṣūl rule | General pronunciation procedure with examples, continued on p. 79 by an Ibn Dhakwān exception and named transmission routes. Review the complete chapter span before adding a rule claim. |

All three p. 78 batch verifier runs report zero errors and zero coverage gaps;
all 14 reading items have exact anchors. The page's uṣūl sentences are not treated
as out of scope and remain open for rule-layer extraction.

## Volume 1, p. 79 — continuation of farsh, Sūrat al-Baqara

**Farsh status: incorporated; one stopping-rule clause and the preceding
cross-page uṣūl material remain unresolved.** The p. 79 farsh batch
`batch-5527-p079.checked.json` contains seven items and 15 claims. Repeated
places named by the source are represented at their separate verse locations.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `حفص وحمزة {ليس البر} بالنصب والباقون بالرفع` | Incorporated | `batch-5527-p079.checked.json`, `d79-01`; 2:177, merged into the existing feature. The source explicitly says its second `ليس البر` is unanimously nominative; that 2:189 statement is documented as no variant. |
| `نافع وابن عامر {ولكن البر} في الموضعين ...` | Incorporated | `d79-02` at 2:177 supplements the existing feature; `d79-03` records the second explicit location, 2:189. The source's two reading forms remain distinct at both locations. |
| `ابو بكر وحمزة والكسائي {من موص} ...` | Incorporated | `d79-04`; 2:182. Abū Bakr is retained as Shuʿba, the transmitter named in this source's seven-reader system. |
| `نافع وابن ذكوان / فدية طعام مساكين / ... ما خلا هشاما ...` | Incorporated | `d79-05`; 2:184. Three forms preserve the source's distinction between idāfa with plural, Hishām's plural, and the rest's tanwīn, rafʿ, and singular. |
| `ابن كثير ... القرآن ... حيث وقع اذا كان اسما ... والباقون بالهمز` | Main word-form contrast incorporated; stopping clause unresolved | `d79-06`; nominal `القرآن` scope, merged into the existing wherever feature. The following `واذا وقف حمزة وافق ابن كثير` is preserved for rule review because its stopping scope is not represented by the farsh feature. |
| `ابو بكر و {ولتكملوا} مثقلا والباقون مخففا` | Incorporated | `d79-07`; 2:185, merged into the existing feature. Abū Bakr is recorded as Shuʿba. |
| `اذا وقف حمزة وافق ابن كثير` | Unresolved pronunciation / stopping rule | The clause follows the noun-only `القرآن` reading and must be scoped to the rule's stopping conditions without guessing additional transmitters or locations. |

The p. 79 verifier reports seven exact anchors, zero errors, and zero
coverage gaps. Page 80 onward and the cross-page rules remain unaudited.

## Volume 1, p. 80 — continuation of farsh, Sūrat al-Baqara

**Farsh status: incorporated; the page has one explicitly unanimous
statement, not a variant.** `batch-5527-p080.checked.json` contains 15 items
and 30 claims. They supplement existing features; the wherever reading of
`البيوت` and `بيوتكم` updates the distinct features for each named form.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `ورش وحفص وابو عمرو {البيوت} و {بيوتكم} بضم الباء حيث وقع والباقون بكسرها` | Incorporated | `d80-01` maps the `البيوت` family to the existing feature at 2:189; `d80-02` maps `بيوتكم` to the existing feature at 3:49. Both retain the source's wherever scope and its specific Warsh and Ḥafṣ attributions. |
| `حمزة والكسائي / ولا تقتلوهم / / حتى يقتلوكم / / فان قتلوكم / ...` | Incorporated | `d80-03`–`d80-05`; three distinct word locations in 2:191, merged into the three existing features. |
| `ابن كثير وابو عمرو {فلا رفث} {ولا فسوق} ...` | Incorporated | `d80-06`–`d80-07`; 2:197. The source's nominative with tanwīn and accusative without tanwīn remain separate forms. |
| `ولا خلاف في قوله {ولا جدال}` | No variant in this source | The source explicitly says there is no disagreement at `ولا جدال`; it is tracked here without generating a reading claim. |
| `الحرميان والكسائي {في السلم} ...` | Incorporated | `d80-08`; 2:208, using at-Taysīr's defined al-Ḥaramiyyān group. |
| `ابن عامر وحمزة والكسائي {ترجع الأمور} ... حيث وقع` | Incorporated | `d80-09`; wherever scope, merged into the existing feature. |
| `نافع {حتى يقول} ...` | Incorporated | `d80-10`; 2:214. |
| `حمزة والكسائي / اثم كثير / ...` | Incorporated | `d80-11`; 2:219. The distinction is the explicitly named thāʾ versus bāʾ. |
| `ابو عمرو {قل العفو} ...` | Incorporated | `d80-12`; 2:219. |
| `البزى من رواية ابي ربيعة عنه {لأعنتكم} ...` | Reading incorporated; teacher route documented separately | `d80-13`; 2:220. The canonical Bazzī reading claim retains the source's form; the specific Abū Rabīʿa route is preserved in `../second-witness/route-detail.json` without assigning it to a canonical riwāya. |
| `ابو بكر وحمزة والكسائي {حتى يطهرن} ...` | Incorporated | `d80-14`; 2:222. Abū Bakr is identified as Shuʿba under this source's naming convention. |
| `حمزة {إلا أن يخافا} ...` | Incorporated | `d80-15`; 2:229. |

The p. 80 verifier reports 15 exact anchors, zero errors, and zero coverage
gaps. Page 81 is partially incorporated; earlier relevant chapters remain
unaudited.

## Volume 1, p. 81 — continuation of farsh, Sūrat al-Baqara

**Farsh status: partially incorporated; one multi-location statement and
route distinctions remain unresolved.** The checked batch
`farsh/taysir/batch-5527-p081.checked.json` has 15 items, 32 claims, zero
verifier errors, and zero coverage gaps. It adds three locations (30:39,
57:11, and 47:22); all other items supplement existing positions. There are
14 matching anchors and one reviewed weak anchor at 2:245 because the source
quotes `يبسط` while the Cairo token is `ويبسط`.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `ابن كثير وابو عمرو {لا تضار} برفع الراء والباقون بفتحها` | Incorporated | `d81-01`; 2:233, merged into the existing feature. |
| `ابن كثير {ما آتيتم} بالقصر وكذا في الروم / وما ءاتيتم من ربا / والباقون بالمد` | Incorporated | `d81-02` at 2:233 supplements the existing feature; `d81-03` records the explicit second locus at 30:39. |
| `حمزة والكسائي {تمسوهن} في الموضعين هنا وفي الاحزاب ...` | Unresolved locator | The source names one local Baqara occurrence and one in al-Aḥzāb, but the local phrase matches both 2:236 and 2:237. Neither is selected without stronger locator evidence; exact text and reason are in `../second-witness/route-detail.json`. |
| `حفص وابن ذكوان وحمزة والكسائي {قدره} في الحرفين ...` | Incorporated | `d81-04`; 2:236. One source assertion is retained because the text explicitly says `في الحرفين` and the existing feature documents both tokens in that verse. |
| `الحرميان وابو بكر والكسائي {وصية} ...` | Incorporated | `d81-06`; 2:240. The defined al-Ḥaramiyyān group and Abū Bakr/Shuʿba distinction are preserved. |
| `عاصم وابن عامر {فيضاعفه له} هنا وفي الحديد ...` | Incorporated | `d81-07` at 2:245 supplements the existing feature; `d81-08` adds the explicit 57:11 locus. |
| `ابن كثير وابن عامر / فيضعفه / و / يضعف / و / مضعفة / ... حيث وقع` | Incorporated | `d81-09`–`d81-11`; source-defined wherever scope, supplemented at 2:245, 2:261, and 3:130. |
| `قنبل وحفص وهشام وابو عمرو وحمزة بخلاف عن خلاد {يبسط} ... وروى النقاش عن الاخفش ...` | Canonical forms incorporated; route detail unresolved | `d81-15` at 2:245 and `d81-16` at 7:69. The source-specific Khallād disagreement and al-Naqqāsh from al-Akhfash’s differing location forms are preserved in `../second-witness/route-detail.json`; no unstated route reading is assigned. |
| `نافع {عسيتم} هنا وفي القتال ...` | Incorporated | `d81-12` at 2:246 supplements the existing feature; `d81-13` adds the explicit 47:22 locus. |
| `الكوفيون وابن عامر {غرفة} ...` | Incorporated | `d81-14`; 2:249, using al-Dānī’s source-defined Kūfī group. |

Page 81 is not complete while the `تمسوهن` location and route details remain
open.

## Volume 1, p. 82 — continuation of farsh, Sūrat al-Baqara

**Farsh status: incorporated; one conditional rule has unresolved route, remainder, and waqf clauses.** The checked batch `farsh/taysir/batch-5527-p082.checked.json` contains
12 reading items and one rule item: 24 farsh claims and one rule claim, with
zero verifier errors or coverage gaps. The reading items have 12 matching
anchors. Three new positions are added: 22:40 for `دفع الله`, and 43:15 and
15:44 for the source's wherever-occurring `جزءا` and `جزء` forms. The other
readings supplement existing features.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `نافع {دفع الله} هنا وفي الحج ...` | Incorporated | `d82-01` supplements the 2:251 feature; `d82-02` records the second explicit location at 22:40. |
| `ابن كثير وابو عمرو {لا بيع فيه ولا خلة ولا شفاعة} وفي ابراهيم {لا بيع فيه ولا خلال} وفي الطور {لا لغو فيها ولا تأثيم} ...` | Incorporated | `d82-03`–`d82-05`; each of the three explicitly cited phrases has its own location (2:254, 14:31, and 52:23), with the same two source-defined forms. |
| `نافع {أنا أحيي وأميت} ... وروى ابو نشيط عن قالون اتباعا ... والباقون يحذفون الالف في الوصل خاصة وكلهم يثبتها في الوقف` | Rule partly incorporated; route/scope details unresolved | `d82-13` records Nafiʿ's conditional retention in the rules layer. The Abū Nashīṭ-from-Qālūn report, the relation of الباقون to that named transmitter route, and the all-readers waqf clause are preserved in `../second-witness/route-detail.json` pending precise representation. |
| `حمزة والكسائي {لم يتسنه} ...` | Incorporated | `d82-06`; 2:259. Deletion applies in waṣl only; the rest retain hāʾ in both states. |
| `الكوفيون وابن عامر {ننشزها} ...` | Incorporated | `d82-07`; 2:259, preserving the source-defined Kūfī group. |
| `حمزة والكسائي {قال أعلم أن الله} ...` | Incorporated | `d82-08`; 2:259. The source's waṣl/ibtidāʾ and mood distinctions remain in the form descriptions. |
| `حمزة {فصرهن} ...` | Incorporated | `d82-09`; 2:260. |
| `ابو بكر {جزءا} و {جزء} بضم الزاي حيث وقع ...` | Incorporated | `d82-10`–`d82-12`; the wherever scope is represented at 2:260, 43:15, and 15:44, using the source's two named lemma shapes and Abū Bakr/Shuʿba attribution. The 2:260 item merges into an existing position; the other two positions are new. |

Page 82's reading statements are accounted for. Its `أنا` rule details remain
open as noted above. Pages 83–90 are incorporated below; p. 91 onward and earlier
relevant chapters remain unaudited.

## Volume 1, p. 83 — continuation of farsh, Sūrat al-Baqara

**Farsh status: incorporated.** `farsh/taysir/batch-5527-p083.checked.json` has
33 items and 41 farsh claims, zero verifier errors or coverage gaps, 32 matching
anchors, and one reviewed weak anchor at 15:8.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `عاصم وابن عامر {بربوة} هنا وفي المؤمنون ...` | Incorporated | `d83-01` supplements 2:265; `d83-02` records the second explicit location, 23:50. |
| `الحرميان {أكلها} و {أكله} و {الأكل} حيث وقع ...` | Incorporated | `d83-03`–`d83-08`; the four feminine-annexed `أكلها` loci are 2:265, 13:35, 14:25, and 18:33, where Abū ʿAmr joins al-Ḥaramiyyān. His attribution is not extended to `أكله` (6:141) or `الأكل` (13:4). The latter three positions are new; the others supplement existing features. |
| Al-Bazzī's counted tāʾ-tashdīd list | Incorporated | `d83-09`–`d83-33` record 25 individually named locations from the source's thirty-one-place list. Each location retains its own source claim. The Hijr locator `/ ما تنزل /` is kept at 15:8 with a weak anchor because the source spelling has no exact Cairo token; no word ID is invented. |

## Volume 1, p. 84 — end of the counted list; further farsh and rule statements

**Farsh and rules status: incorporated.** `batch-5527-p084.checked.json` has
14 items: 29 farsh claims and four rule claims, zero verifier errors or coverage
gaps, 11 matching verse anchors, one reviewed weak anchor at 97:4, and two
rule-layer items. The `من ألف شهر تنزل` citation is explicitly located by the
source in al-Qadr; its contextual phrase crosses 97:3–4, so the verb remains at
97:4 without a guessed Cairo word ID.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Six remaining locations in al-Bazzī's thirty-one-place list | Incorporated | `d84-01`–`d84-06`: 60:9, 67:8, 68:38, 80:10, 92:14, and 97:4. Together with the 25 individually recorded on p. 83, these complete the source's counted 31 Kitāb-route places. |
| The two additions through Abū Rabīʿa | Incorporated; route preserved | `d84-07`–`d84-08` record the reported al-Bazzī forms at 3:143 and 56:65 with `basis: report`. The exact chain—Abū al-Faraj al-Najjād, Abū al-Fatḥ Ibn Budhan, Abū Bakr al-Zaynabī, Abū Rabīʿa, al-Bazzī—and the source's `قياس قول أبي ربيعة` remain in `../second-witness/route-detail.json`. These two are additional reported locations, not part of the counted 31. |
| `فنعما` in Baqara and Nisa | Incorporated | `d84-09` supplements 2:271; `d84-10` adds 4:58. Both preserve the three source distinctions, Qālūn/Shuʿba/Abū ʿAmr's permitted ʿayn sukūn, and the source's `والأول أقيس` assessment as commentary rather than a separate reader attribution. |
| `ونكفر` | Incorporated | `d84-11`; 2:271, retaining the three source-defined forms and attributions. |
| Future-tense `حسب` | Incorporated as a rule | `d84-12` preserves the condition and the four examples. The sentence does not provide verse numbers, so no loci are inferred. |
| `فأذنوا` | Incorporated | `d84-13`; 2:279, merged into the existing feature while retaining at-Taysīr's own evidence and Shuʿba/Hamza attribution. |
| Al-Bazzī's connection, beginning, and preceding-madd procedure; al-bāqūn | Incorporated as a rule | `d84-14` records the cross-page statement: tashdīd in waṣl, lightening at ibtidāʾ, added tamkīn after a madd letter, and lightening by the rest throughout the chapter. |

The full rebuild from checked batches completed: 103 suras, 1,990 positions,
6,378 farsh claims, and 148 rules in 29 chapters with 274 rule claims. At-Taysīr
now contributes 419 farsh and 11 rule claims by the coverage ledger's source
assertion count. Pages 85–228 and earlier relevant chapters remain unaudited;
open p. 72–82 route, locator, and rule clauses remain open as recorded above.

## Volume 1, pp. 85–86 — end of Baqara; eight yāʾs; opening of Āl ʿImrān

**Farsh and rule status: incorporated.** `batch-5527-p085-086.checked.json`
contains 31 items and one explicit omission record. Its 52 form assertions are
51 farsh claims and one rule claim, with zero verifier errors or coverage gaps;
29 verse anchors match and one is weak at 3:12 for the source's yaʾ form against
the Cairo tāʾ. The remaining item is the verse-less rule.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Closing Baqara readings on p. 85 | Incorporated | `d85-01`–`d85-10`; 2:280–285. `فيغفر` and `يعذب` remain separate claims within 2:284. All supplement existing features. |
| `رسلنا`, `رسلكم`, `رسلهم`, `سبلنا` | Incorporated with source-defined wherever scope | `d85-11`–`d85-14` map the four explicitly named patterns to the existing representative features. Abū ʿAmr has sukūn on sīn and bāʾ under the source's stated condition; al-bāqūn have ḍamma. The items retain the book's wherever scope instead of expanding beyond its four named forms. |
| Baqara's eight counted yāʾs | Incorporated | `d85-15`–`d85-22`: both `إني أعلم` occurrences (2:30, 2:33), `عهدي` (2:124), `بيتي` (2:125), `فاذكروني` (2:152), `بي` (2:186), `مني` (2:249), and `ربي` (2:258). Only the source-named readings are assigned; the non-named readers are not filled in. |
| The three deleted-yāʾ examples | Incorporated | `d85-23`–`d85-24` record both words in `{الداع إذا دعان}` at 2:186 for Warsh and Abū ʿAmr; `d85-31` records `{واتقون}` at 2:197 for Abū ʿAmr. All assertions are limited to yāʾ affirmation in waṣl. |
| Sentence-final yāʾ procedure | Incorporated as a rule | `d85-30` records Abū ʿAmr's statement that he follows the same waṣl procedure at the ends of suras. The source supplies no finite verse list. |
| Al-Tawrah in Āl ʿImrān | Incorporated | `d85-25`; 3:3 with source-wide scope. Three forms retain imāla, bayna al-lafẓayn, and fatḥ. Al-Dānī's personal Qālūn report is quoted in the note without inventing a transmission path. |
| `سيغلبون` and `يحشرون`; `ترونهم` | Incorporated | `d85-26`–`d85-28`; 3:12 (two separate words) and 3:13. The explicit 3:12 locator is retained for the yaʾ form with a weak anchor; no word ID is guessed. |
| Abū Bakr's `ورضوان` | Incorporated | `d85-29`; 3:15 with the source's wherever scope. The exclusion `ما خلا الحرف الثاني من المائدة` is retained: the second al-Māʾida occurrence `من اتبع رضوانه` (5:16) is not assigned Abū Bakr's ḍamma reading. |
| Al-Dānī's omission of remaining readers' yāʾ forms | Explicitly out of scope in this source | The skipped p. 86 clause records that he intentionally omits remaining readers' fatḥ, sukūn, affirmation, and deletion forms to avoid confusion. No other book is used to fill those omissions. |

The rebuild from checked batches completed: 103 suras, 1,996 positions,
6,525 farsh claims, and 152 general rules in 31 chapters with 281 rule claims.
At-Taysīr now contributes 566 farsh claims and 18 rule claims in the ledger's
source-assertion count. Pages 91–228 and earlier relevant chapters remain to be
audited; the earlier unresolved passages remain open as listed above.

## Volume 1, pp. 87–88 — opening of Āl ʿImrān readings

**Farsh and conditional-rule status: incorporated with one unresolved
attribution.** `batch-5527-p087-088.checked.json` contains 21 items, 41 farsh
form assertions, two rule assertions, and two passage records, with zero
verifier errors or coverage gaps. The 20 verse items anchor to their cited
verses; the conditional Zakariyyā hamza item is a rule.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Local readings at 3:19, 3:21, 3:27, 3:36, 3:37, and 3:39 | Incorporated | `d87-01`–`d87-09` preserve the named forms and reader groups. The 3:27 statement keeps its source-defined wherever scope; the 3:37 name treatment is not expanded to unlisted verses. |
| Conditional hamza after Zakariyyā | Incorporated as a rule | `d87-07`; the source gives no verse locator for its condition, so it remains a conditional rule. |
| `يبشرك` / `ويبشر` lightening family | Incorporated | `d87-10`–`d87-17` preserve all eight named locations: 3:39, 3:45, 17:9, 18:2, 9:21, 15:53, 19:7, and 19:97. Hamza and al-Kisāʾī are only assigned to the first four; Hamza alone is assigned to the other four. |
| 3:48 `ويعلمه` | Unresolved attribution | The text gives yāʾ versus nūn but does not unambiguously attach the adjacent Nafiʿ/ʿĀṣim cross-reference to the yāʾ form. `s88-02` preserves the clause; no reader is inferred. |
| `{كن فيكون}` cross-reference | Editorially out of scope | `s88-01` records that Nafiʿ and ʿĀṣim were mentioned earlier, without reconstructing the omitted forms here. |
| 3:49 `أني أخلق`, 3:49 and 5:110 `فيكون طيرا`, and 3:57 `فيوفيهم` | Incorporated | `d88-19`–`d88-22`. The existing 3:49 feature has no kasra value; the source's Nafiʿ-kasra/rest-fatḥa distinction is kept in a separate source-specific feature rather than forced into the other book's value. |

## Volume 1, pp. 88–89 — Hā-antum rule and continued Āl ʿImrān readings

**Farsh and rule status: incorporated.** `batch-5527-p088-089.checked.json`
contains 15 items, 33 farsh form assertions, and four rule assertions, with
zero verifier errors or coverage gaps. Twelve verse items agree with their
anchors; `ءاتايكم` is retained at the source-located 3:81 as a reviewed weak
anchor because the Cairo token differs, with no token ID guessed. Two items
are rules.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `هانتم` wherever it occurs | Incorporated as a rule | `d88-01` preserves Warsh, Qunbul, and the remainder's madd/hamza forms. Its note retains al-Bazzī's madd exception, the reader-specific hāʾ classification, and the conditional tamkīn procedure; no finite verse list is inferred. |
| 3:75 `يؤده` and `لا يؤده`; 3:145 `نؤته`; 4:115 `نوله` and `ونصله`; 42:20 `نؤته` | Incorporated | `d89-02`–`d89-07` preserve the source's sukūn, Qālūn ikhtilās, al-bāqūn's full kasra, and its explicit two-occurrence note for 3:145. The al-Ḥulwānī-from-Hishām route is retained in `second-witness/route-detail.json`. |
| Waqf on the hāʾ forms | Incorporated as a rule | `d89-08`; the source says all readers stop with sukūn, without listing individual verses. |
| 3:73, 3:79–81, and 3:83 readings | Incorporated | `d89-09`, `d89-16`–`d89-21` record the interrogative/indicative contrast, the grouped reader forms, and the explicit 3:81 locator. Abū ʿAmr's ikhtilās/iskān qualification at 3:80 remains distinct from the general rafʿ form. |

## Volume 1, p. 90 — continued Āl ʿImrān readings

**Farsh status: incorporated with one unresolved cross-reference.**
`batch-5527-p090.checked.json` contains 11 items and 22 farsh form assertions,
with zero verifier errors or coverage gaps; all 11 anchors agree. The additional
position at 3:172 records the third explicitly counted `قرح` occurrence.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `حج البيت`, `وما يفعلوا من خير فلن يكفروه`, and `لا يضركم` | Incorporated | `d90-01`–`d90-03`; 3:97, 3:115, and 3:120. The source's named groups and all-verb yāʾ/tāʾ distinction are preserved. |
| `منزلين` and `إنا منزلون` | Incorporated | `d90-04`–`d90-05`; 3:124 and 29:34, with Ibn ʿĀmir's tashdīd kept at both named locations. |
| `مسومين` and `سارعوا` | Incorporated | `d90-06`–`d90-07`; 3:125 and 3:133. |
| `قرح` / `القرح` | Incorporated | `d90-08`–`d90-09`; the source's two 3:140 tokens are represented at their shared verse position, and the third occurrence is added at 3:172. |
| `وكأين` | Incorporated; waqf cross-reference unresolved | `d90-10` preserves the wherever reading contrast on the existing feature. The source also refers to an earlier rule for stopping on the nūn; `s90-01` holds that reader-scope detail unresolved until the earlier waqf chapter is read. |
| `قاتل معه` | Incorporated | `d90-11`; 3:146. |

## Volume 1, p. 91 — continued Āl ʿImrān readings

**Farsh status: partially incorporated.** `batch-5527-p091.checked.json` has
11 items and 22 form assertions, with zero verifier errors or coverage gaps.
Ten anchors agree with the cited verse; `تغشى طائفة` is retained as a reviewed
weak anchor at 3:154 because the lemma also occurs at 3:69 and 3:72. The new
3:168 assertion supplements the existing feature. Hishām's first-person
reading chain through Abū al-Fatḥ is retained in `second-witness/route-detail.json`.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `الرعب` / `رعبا` wherever; 3:154 `تغشى طائفة` and `كله لله`; 3:156 `والله بما يعملون بصير`; 3:157 `خير مما يجمعون`; 3:161 `أن يغل` | Incorporated | `d91-01`–`d91-06`; existing features receive separate at-Taysīr claims and retain the book's seven-reader attributions. The `الرعب` claim preserves wherever scope. |
| 3:168 `ما قتلوا` | Incorporated | `d91-07`; supplements `u128723-1` with Hishām and the source's light-form remainder. |
| 3:169 `الذين قتلوا` and 22:58 `ثم قتلوا` | Incorporated | `d91-08`–`d91-09`; preserve the source's explicitly paired locations. |
| 3:169 `ولا يحسبن الذين قتلوا` | Incorporated | `d91-10`; Hishām's claim is recorded and the route through Abū al-Fatḥ preserved in route detail. |
| 3:171 `وأن الله لا يضيع` | Incorporated | `d91-11`. |
| `متم` / `مت` / `متنا` mīm-vowel family | Unresolved | `s91-01`; the source combines wherever scope with two Hafs exceptions in this sūra. Exact occurrence mapping and separate claims need review before encoding. |
| `ولا يحزنك` / `ليحزنني` / `ليحزن الذين` and the exception `لا يحزنهم` | Incorporated as a rule | The continuous pp. 91–92 passage is `d92-01`; it preserves Nafiʿ's wherever form, the stated 21:103 exception, and the remainder's form without expanding to a guessed list of loci. |

## Volume 1, p. 92 — continued Āl ʿImrān readings

**Status: incorporated, with one rule spanning pp. 91–92.**
`batch-5527-p092.checked.json` has ten items and twenty form assertions,
including the two-claim p. 91–92 wherever rule; all nine verse anchors agree
with their source locators. The 8:37 match is near because the Cairo token has
a prefixed lām; the source explicitly names al-Anfāl as the second location.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `يحزن` wherever, except 21:103 | Incorporated as a rule | `d92-01`; exact source statement crosses the page break. Nafiʿ's exception and the other readers' form remain distinct. |
| 3:178 `لا تحسبن الذين كفروا` and 3:180 `ولا تحسبن الذين يبخلون` | Incorporated | `d92-02`–`d92-03`; each source-specific two-form feature retains Hamza's tāʾ and the remainder's yāʾ. The existing position only had the named Hamza form, so no source assertion is lost to its narrower value set. |
| 3:188 `ولا تحسبن الذين يفرحون` | Incorporated | `d92-04`; the source's Kūfī group reads with tāʾ and the remainder with yāʾ, merged into the existing feature. |
| 3:179 `حتى يميز`; 8:37 al-Anfāl counterpart | Incorporated | `d92-05`–`d92-06`; Hamza and al-Kisāʾī's form and the remainder are kept at each explicitly named place. The 8:37 anchor aligns to the prefixed Cairo token. |
| 3:180 `بما يعملون خبير` | Incorporated | `d92-07`; Ibn Kathīr and Abū ʿAmr's yāʾ versus the remainder's tāʾ. |
| 3:181 `سيكتب` / `وقتلهم` / `ويقول` bundle | Incorporated | `d92-08`; preserves Hamza's three co-occurring forms as one bundled assertion against the remainder's corresponding nūn/naṣb forms. |
| 3:184 `وبالزبر` and `وبالكتاب` | Incorporated with route evidence | `d92-09`–`d92-10` preserve Hishām's bāʾ in both, Ibn Dhakwān's bāʾ only in al-zubur, and the remainder. Fāris ibn Aḥmad's report of ʿAbd al-Bāqī's letter from al-Ḥulwānī to Hishām is preserved for both positions in `second-witness/route-detail.json`. |

## Volume 1, p. 93 — end of Āl ʿImrān and opening of al-Nisāʾ

**Status: incorporated.** `batch-5527-p093.checked.json` has 17 items and
26 form assertions, all anchored to the source-located verses with zero
verifier errors or coverage gaps. The page moves from the end of Āl ʿImrān
into the opening of al-Nisāʾ; its six yāʾāt and two deleted-yāʾ statements
are retained as explicit position claims, not generalized beyond their listed
forms.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 3:187 `ليبيننه` and `ولا يكتمونه`; 3:188 `فلا يحسبنهم` | Incorporated | `d93-01`–`d93-03` merge their explicit yāʾ/tāʾ forms and reader groups into existing positions. |
| 3:195 `وقتلوا` and 6:140 `الذين قتلوا` | Incorporated | `d93-04`–`d93-05` preserve Ibn Kathīr and Ibn ʿĀmir's tashdīd and the source's explicit pairing. |
| 3:195 `وقتّلوا وقاتلوا`; 9:111 `فيقتلون ويقتلون` | Incorporated | `d93-06`–`d93-07` preserve Hamza and al-Kisāʾī's object-before-subject order at both stated locations. |
| Six yāʾāt: 3:20 `وجهي لله`; 3:35 `مني إنك`; 3:41 `اجعل لي آية`; 3:36 `وإني أعيذها`; 3:52 `من أنصاري إلى الله`; 3:49 `أني أخلق` | Incorporated | `d93-10`–`d93-15` record each location separately and preserve each stated reader group. The p. 93 yāʾ form at 3:49 supplements the separate p. 88 hamza-vowel statement. |
| Deleted yāʾs in 3:20 `ومن اتبعن` and 3:175 `وخافون إن كنتم` | Incorporated | `d93-16`–`d93-17` preserve only the source's positive waṣl attributions: Nāfiʿ and Abū ʿAmr for the first, Abū ʿAmr for the second. |
| 4:1 `تساءلون` and `والأرحام` | Incorporated | `d93-08`–`d93-09` record the source-defined Kūfī group and Hamza's separate case at the opening of al-Nisāʾ. |


## Volume 1, pp. 94–95 — continued al-Nisāʾ readings

**Status: incorporated with one unresolved reader-name transcription and one
editorial cross-reference.** `farsh/taysir/batch-5527-p094-095.checked.json`
contains 31 items, with zero verifier errors or coverage gaps. The five-place
`والذان` / `هاذان` family cites both pages. Existing features are supplemented
where present; 4:14, 9:53, 22:59, 33:30, and 65:1 are represented separately.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 4:5 `قياما`, 4:10 `وسيصلون`, and 4:11 `وإن كانت واحدة` | Incorporated | `d94-01`–`d94-03` supplement the corresponding existing positions and preserve al-Dānī's Nāfiʿ/Ibn ʿĀmir, Abū Bakr/Ibn ʿĀmir, and Nāfiʿ attributions. |
| Singular `أم` forms: two words in 4:11, 28:59, and 43:4; plural `أمهاتكم` at 16:78, 24:61, 39:6, and 53:32 | Incorporated in part; one attribution unresolved | `d94-04`–`d94-10` preserve the four singular tokens and all four plural locations, including waṣl/ibtidāʾ distinctions. The source JSON literally transcribes the plural attribution as `فحمرة`; the adjacent singular clause names Ḥamza, but that does not license silently correcting the plural clause. The other explicit plural forms are recorded, and `s94-02` leaves the first attribution unresolved pending a facsimile check. |
| 4:11 and 4:12 `يوصي بها`; the two 4:13–14 `ندخله` loci | Incorporated | `d94-11`–`d94-14`; Ḥafṣ joins the fatḥa-ṣād group only at 4:12. The source's `في الحرفين` nūn reading is represented at both `ندخله` locations; 4:14 is separately added. |
| Five positions `والذان` / `هاذان` / `هاتين` / `أرنا الذين` | Incorporated | `d94-15`–`d94-19` map 4:16, 20:63, 22:19, 28:27, and 41:29 from the pp. 94–95 passage; Ibn Kathīr's tashdīd and lengthening are kept distinct from the remainder. |
| 4:19 and 9:53 `كرها`; 4:19, 33:30, and 65:1 `بفاحشة مبينة` | Incorporated | `d94-20`–`d94-24`; repeated locations receive their own claims. Existing 4:19 positions are supplemented. |
| Wherever `المحصنات` / `محصنات`, except the first al-Nisāʾ position; 4:24 `وأحل لكم`; 4:25 `فإذا أحصن`; 4:29 `تجارة`; 4:31 and 22:59 `مدخلا` | Incorporated | `d94-25`–`d94-30` preserve the exception and source-specific reader groups. The 22:59 `مدخلا` location is separately recorded. |
| Conditional imperative pattern `وسئلوا الله من فضله` and its companion examples | Incorporated as a rule | `d94-31` records the condition (imperative addressed directly, preceded by wāw or fāʾ), the source's hamza distinction, and Ḥamza's exact statement `على أصله` without expanding it into an inferred reading. |
| `{ضعافا خافوا} قد ذكر` | Explicitly out of scope as a local claim | `s94-01`; an editorial cross-reference only. It supplies no form or attribution on p. 94, so earlier material is not reconstructed here. |

The p. 94–95 verifier reported 31 items, one out-of-scope note and one
unresolved note, zero errors, zero coverage gaps, and 30 located anchors plus
the rules-layer item. At that checkpoint, pages 99–228 and earlier relevant
chapters remained to be audited; the plural `فحمرة` attribution and previous
open items remain open.

## Volume 1, p. 96 — continued al-Nisāʾ readings

**Status: incorporated with one editorial cross-reference.**
`farsh/taysir/batch-5527-p096.checked.json` has 11 items and 23 form
assertions, with zero verifier errors or coverage gaps. Nine anchors agree;
the two explicit `أو لمستم` locations are reviewed weak anchors because the
source's no-alif reading differs from the Cairo text's alif form.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 4:33 `والذين عقدت` and 4:37 `بالبخل`; 57:24 counterpart | Incorporated | `d96-01`–`d96-03`; the book-defined Kūfī group and Ḥamza/al-Kisāʾī assignments are retained, including the second explicit `بالبخل` location in al-Ḥadīd. |
| 4:40 `وإن تك حسنة`; 4:42 `لو تسوى` | Incorporated | `d96-04`–`d96-05`; al-Ḥaramiyyān is kept as the book-defined Nāfiʿ/Ibn Kathīr group, separate from the next sentence's Nāfiʿ/Ibn ʿĀmir attribution. All three `لو تسوى` forms are recorded. |
| 4:43 and 5:6 `أو لمستم` | Incorporated with reviewed weak anchors | `d96-06`–`d96-07`; the source gives both locations explicitly. Its no-alif reading differs from the Cairo token at both places; no word anchor is invented. |
| 4:66 `إلا قليلا منهم`; 4:73 `كأن لم تكن`; 4:77 second `ولا يظلمون فتيلا`; 4:81 `بيت طائفة منهم` | Incorporated | `d96-08`–`d96-11`; transmitter-specific Ḥafṣ is retained at 4:73. The p. 96 attribution at 4:77 is Ibn Kathīr, Ḥamza, and al-Kisāʾī; the source separately says all readers use yāʾ at the first occurrence. |
| `{فتيلا انظر}` / `{إن الله نعما}` / `{أن اقتلوا}` / `{أو اخرجوا} قد ذكر` | Explicitly out of scope as a local claim | `s96-01`; this is a cross-reference without forms or attributions on p. 96. |

The p. 96 batch contributes 23 source form assertions. Page 97 onward and earlier
relevant chapters remain to be audited.

## Volume 1, p. 97 — continued al-Nisāʾ readings

**Status: incorporated with one unresolved lexical form.**
`farsh/taysir/batch-5527-p097.checked.json` contains nine items (eight
located readings and one general phonetic rule), with zero verifier errors or
coverage gaps. All eight verse anchors agree; the rule is retained without an
inferred verse list.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Sākin ṣād followed by dāl, with examples `ومن أصدق`, `يصدقون`, `وتصدية`, `يصدر`, and `قصد` | Incorporated as a rule | `d97-01`; Ḥamza and al-Kisāʾī use the source-described ishām; al-bāqūn retain pure ṣād. The source says وشبهه and gives no explicit verse locators for these examples, so the condition and examples stay in the rule record. |
| 4:94 `إليكم السلام لست مؤمنا`; 4:95 `غير أولي الضرر`; 4:74 `فسوف يؤتيه أجرا` | Incorporated | `d97-02`–`d97-04` preserve the full reader groups, including Ḥamza in the four-reader al-salām group and the source's `وهو الاخير` limitation. |
| `يدخلون الجنة` in 4:124, 19:60, and 40:40 | Incorporated | `d97-05`–`d97-07` record the three listed loci separately, with Ibn Kathīr, Abū ʿAmr, and Abū Bakr/Shuʿba kept as named. |
| 4:128 `أن يصلحا`; 4:135 `وإن تلوا` | Incorporated | `d97-08`–`d97-09` preserve the source-defined Kūfī group and the separate Ibn ʿĀmir/Ḥamza attribution. |
| `فتوا` in the two stated places, including al-Ḥujurāt | Unresolved | `s97-01`; the source transcription omits or corrupts the lexical form, although it preserves a two-place reference and a tāʾ/thāʾ versus yāʾ/nūn description. The word and verse loci cannot be attached without guessing. |

Page 97 contributes 16 located form assertions and two rule assertions. Page 98
onward and earlier relevant chapters remain to be audited.

## Volume 1, p. 98 — end of al-Nisāʾ; opening al-Māʾida

**Status: incorporated, with the source's no-yāʾ note logged as out of scope.**
`farsh/taysir/batch-5527-p098.checked.json` has 14 items and 29 form
assertions, with zero verifier errors or coverage gaps; all 14 verse anchors
agree.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 4:136 `الذي نزل` and `والذي أنزل`; 4:140 `وقد نزل`; 4:145 `في الدرك`; 4:152 `سوف يؤتيهم أجورهم` | Incorporated | `d98-01`–`d98-05`; the book-defined Kūfī group, Nāfiʿ, ʿĀṣim, and transmitter-specific Ḥafṣ attributions remain as stated. |
| 4:154 `لا تعدوا` | Incorporated | `d98-06` preserves Warsh, Qālūn's concealment/tashdīd and the source's `النص عنه بالإسكان` qualification in one source-specific claim, plus al-bāqūn. It does not import Abū Jaʿfar's additional form from another book. |
| 4:162 `سيؤتيهم أجرا`; `زبورا` at 4:163 and 17:55, and `الزبور` at 21:105 | Incorporated | `d98-07`–`d98-10`; Ḥamza's ḍamma-zāy form is recorded at each of the three explicitly named locations. |
| 5:2 and 5:8 `شنئان قوم`; 5:2 `أن صدوكم`; 5:6 `وأرجلكم` | Incorporated | `d98-11`–`d98-14`; 5:8 is added as the second stated `شنئان` location, and the source's literal doubled-lām transcription in `الللام` is preserved in the evidence and form description. |
| No disputed yāʾs in the remainder of al-Nisāʾ | Explicitly out of scope | `s98-01` records the source's statement that no disputed yāʾ reading remains in this sūra. |

Page 98 contributes 29 source form assertions. At that checkpoint, page 99
onward and earlier relevant chapters remained to be audited; pages 99–100 are
recorded below.

## Volume 1, p. 99 — continued al-Māʾida readings

**Status: incorporated with one incomplete repeated-location clause and two
editorial cross-references.** `farsh/taysir/batch-5527-p099.checked.json` has
11 items, three skipped passage records, zero verifier errors or coverage
gaps, and ten matching anchors plus one reviewed weak anchor at 5:54.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 5:13 `قلوبهم قاسية` | Incorporated | `d99-01` supplements the existing feature with Ḥamza/al-Kisāʾī's doubled yāʾ without alif and the rest's light yāʾ with alif. |
| 5:42 `للسحت` | Local form incorporated; two other locations unresolved | `d99-02` records al-Kisāʾī's ḍamma-ḥāʾ form at the local “here” occurrence, identified by the al-Māʾida sequence. `s99-03` preserves the statement that there are three places; the two additional locators are missing after وفي and are not guessed. |
| 5:45 `والعين بالعين` and `والجروح` case readings | Incorporated | `d99-03`–`d99-04` add al-Kisāʾī's rafʿ at the eye phrase and al-Kisāʾī plus Ibn Kathīr, Ibn ʿĀmir, and Abū ʿAmr at the wounds phrase; the source's `ما بعده` sequence and its “wounds only” restriction are retained in the exact evidence and note. |
| 5:45 `والأذن بالأذن`; 31:7 `في أذنيه` | Incorporated | `d99-05`–`d99-06` supplement the existing wherever-family features with Nāfiʿ's sukūn of dhāl and the remainder's ḍamma. |
| 5:47 `وليحكم أهل`; 5:50 `تبغون`; 5:53 `يقول الذين` (wāw and lām distinctions); 5:54 `من يرتدد` | Incorporated | `d99-07`–`d99-11` preserve the Hamza/rest distinction, Warsh's unresolved-uṣūl qualification, Ibn ʿĀmir's tāʾ, the source-defined al-Ḥaramiyyān plus Ibn ʿĀmir group, Abū ʿAmr's lām case, and Nāfiʿ/Ibn ʿĀmir's two-dāl form. The 5:54 Cairo anchor is weak because Cairo has one dāl. |
| `{والمحصنات}` / `/ او لمستم / قد ذكر`; `{رسلنا} قد ذكر ...` | Explicitly out of scope as local claims | `s99-01`–`s99-02`; both are editorial references without local reading forms. |

Page 99 contributes 22 form assertions; the two missing `السحت` locators remain
unresolved.

## Volume 1, p. 100 — continued al-Māʾida readings

**Status: incorporated, with one unanimous-form note logged out of scope.**
`farsh/taysir/batch-5527-p100.checked.json` has ten items and one skipped
passage, zero verifier errors or coverage gaps, and ten matching verse anchors.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 5:57 `والكفار أولياء`; 5:60 `وعبد الطاغوت`; 5:67 `فما بلغت رسالاته`; 5:71 `ألا تكون` | Incorporated | `d100-01`–`d100-04` preserve the source's seven-reader groups and transmitter-specific Shuʿba attribution. |
| 5:89 `بما عاقدتم` | Incorporated | `d100-05` retains the three forms separately: Ibn Dhakwān with alif, Abū Bakr/Shuʿba, Ḥamza, and al-Kisāʾī without alif but light, and the rest doubled without alif. |
| 5:95 `فجزاء مثل ما`; `أو كفارة طعام` | Incorporated | `d100-06`–`d100-07` retain al-Kūfiyyūn as the book-defined three-reader group and Nāfiʿ/Ibn ʿĀmir on iḍāfa. The sentence's no-disagreement statement on `مساكين` is kept verbatim. |
| 5:97 `قياما للناس`; 5:107 `من الذين استحق`; `عليهم الأولين` | Incorporated | `d100-08`–`d100-10` preserve Ibn ʿĀmir, Ḥafṣ, and Abū Bakr/Shuʿba plus Ḥamza exactly as attributed. |
| 5:89 `مساكين` | Explicitly out of scope | `s100-01` records the source's explicit agreement on the plural; it supplies no variant to enter. |

Page 100 adds 21 generated source claims.

## Volume 1, p. 101 — close of al-Māʾida; opening al-Anʿām

**Status: incorporated with one out-of-scope cross-reference and two unresolved
source details.** `farsh/taysir/batch-5527-p101.checked.json` has 16 items and
three skipped records, zero verifier errors or coverage gaps, 14 matching
anchors, and two reviewed weak anchors at 5:112 and 6:23.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 5:109 and 9:78 `الغيوب` | Incorporated | `d101-01`–`d101-02` map the source's explicit `حيث وقع` scope to both exact occurrences in the Qurʾān text; Abū Bakr/Shuʿba and Ḥamza kasr the ghayn, while the rest use ḍamma. Singular `الغيب` instances are not included. |
| 5:110 `إلا ساحر`; 11:7 | Incorporated | `d101-03`–`d101-04` record al-Kisāʾī's alif form and the rest's no-alif form at the local verse and named Hūd occurrence. |
| The source's third `إلا ساحر` location, named `الصف` | Unresolved | `s101-03`; the source gives no verse. Elsewhere this book uses `الصف` for Sūra 61, while the related `إلا سحر مبين` wording at 37:15 is in al-Ṣāffāt. The two names are not conflated. |
| `{طيرا}` and `{القدس}` | Explicitly out of scope | `s101-01`; the source says these readings were mentioned earlier but does not restate their forms. |
| 5:112 `هل تستطيع ربك`; 5:115 `إني منزلها`; 5:119 `هذا يوم` | Incorporated | `d101-06`–`d101-08` preserve al-Kisāʾī, Nāfiʿ/Ibn ʿĀmir/ʿĀṣim, and Nāfiʿ as stated. 5:112 is weak-anchored because Cairo has يستطيع with yāʾ. |
| The six listed yāʾ positions: 5:28 `يدي إليك` and `إني أخاف`; 5:29 `إني أريد`; 5:115 `فإني أعذبه`; 5:116 `لي أن أقول` and `وأمي إلهين` | Incorporated | `d101-09`–`d101-14` retain each location separately with the source's reader groups, including transmitter-specific Ḥafṣ. |
| 5:44 `واخشون ولا` | Incorporated | `d101-15` records the one omitted yāʾ the source identifies in the sūra and Abū ʿAmr's retention of it in connected reading. |
| 6:16 `من يصرف`; 6:23 `ثم لم يكن` | Incorporated, with one unresolved attribution | `d101-16`–`d101-17` record the stated form contrasts. `s101-02` preserves the terminal Ibn Kathīr attribution at 6:23 as unresolved because the source's syntax does not clarify its attachment; the verse anchor is weak because the source form differs from Cairo. |

Page 101 adds 26 generated source claims.

## Volume 1, p. 102 — continued al-Anʿām readings

**Status: incorporated.** `farsh/taysir/batch-5527-p102.checked.json` has 16
items, including one general rule, zero skipped passages, zero verifier errors
or coverage gaps, 14 matching anchors and one reviewed weak anchor at 6:32.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:23 `فتنتهم`; `والله ربنا` | Incorporated | `d102-01`–`d102-02` retain Ibn ʿĀmir/Ḥafṣ rafʿ and Ḥamza/al-Kisāʾī naṣb, respectively, with the source's remainder readings. |
| 6:27 `ولا نكذب`; `ونكون` | Incorporated | `d102-03`–`d102-04` separate Ḥamza/Ḥafṣ naṣb on both verbs from Ibn ʿĀmir's naṣb on `ونكون` only; the source's remainder rafʿ is retained for each. |
| 6:32 `ولدار الآخرة`; `أفلا تعقلون` at 6:32 and 7:169 | Incorporated | `d102-05`–`d102-07`; Ibn ʿĀmir's one-lām form is weak-anchored against Cairo's two-lām text. The source's Nāfiʿ/Ibn ʿĀmir/Ḥafṣ group for the tāʾ form is recorded at both named locations. |
| 6:33 `لا يكذبونك` | Incorporated | `d102-08` records Nāfiʿ/al-Kisāʾī lightening and the rest's tashdīd. |
| 6:44, 7:96, 54:11, and 21:96 `فتحنا` / `فتحت` | Incorporated | `d102-09`–`d102-12` preserve Ibn ʿĀmir's tashdīd and the rest's light form separately at all four source-named locations. |
| 6:52 and 18:28 `بالغداوة` | Incorporated | `d102-13`–`d102-14` preserve the source spelling and its explicit Ibn ʿĀmir attribution for wāw/ḍamma; the rest read with alif/fatḥ. |
| 6:54 `أنه من عمل` and `فأنه غفور رحيم` | Incorporated | `d102-15` keeps the two source-paired hamzas and all three attributions together: ʿĀṣim/Ibn ʿĀmir open both, Nāfiʿ opens the first only, and the rest kasr both. |
| Hamza after rāʾ when a preceding hamza is present | Incorporated as a general rule | `d102-16` retains the four examples, `وشبهه`, al-Kisāʾī's omission, the rest's realization, and Ḥamza's waqf agreement with Nāfiʿ. No unlisted verse locations are inferred. |

Page 102 adds 33 generated farsh claims and three rule claims. Page 103 adds
20 generated farsh claims and one general-rule claim; its checked batch has 11
items, zero verifier errors or coverage gaps, ten matching anchors and one
rule item. Two clauses are unresolved and are not mapped to readers or verses.

## Volume 1, p. 103 — continued al-Anʿām readings

**Status: incorporated; two attribution/scope clauses remain unresolved.**
The page combines verse readings, explicit cross-references, and a general
imāla rule with route-specific exceptions. Each kind is retained at its
supported scope.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:55 `وليستبين`; `سبيل المجرمين` | Incorporated | `farsh/taysir/batch-5527-p103.checked.json`, `d103-01`–`d103-02`, supplements the existing features. Abū Bakr (Shuʿba), Ḥamza, and al-Kisāʾī use yāʾ for the first form; Nāfiʿ reads the second with naṣb, with the source's remainder forms retained. |
| 6:57 `يقص` and its stopping clause | Incorporated; counterpart unresolved | `d103-03` records the al-Ḥaramiyyān/ʿĀṣim ṣād form with ḍamma and the remaining readers' ḍād with kasra. `s103-01` leaves the unnamed counterpart for stopping without yāʾ unresolved; the source says to follow the rasm but gives no locator. |
| 6:61 `توفاه رسلنا`; 6:71 `استهواه` | Incorporated | `d103-04`–`d103-05`; the two source-paired forms and Ḥamza's imāla are retained separately at both places. 6:71 uses a reviewed near anchor because its source form differs from Cairo. |
| 6:63 and 7:55 `وخفية` | Incorporated | `d103-06`–`d103-07` add the two explicit locations: Abū Bakr reads khāʾ with kasra; the rest with ḍamma. |
| 6:63 `لئن أنجانا`; 6:64 `قل الله ينجيكم`; 6:68 `وإما ينسينك` | Incorporated | `d103-08`–`d103-10` preserve, respectively, the Kūfī alif form against the source's yāʾ/tāʾ form, the Kūfī/Hishām tashdīd, and Ibn ʿĀmir's tashdīd. |
| General `رأى` imāla rule and attached-pronoun exception | Rule incorporated; route attribution unresolved | `d103-11` retains the condition, examples, reader forms, and waqf statement in the rules layer. `s103-02` records al-Naqqāsh's report via al-Akhfash and the al-Fārisī/al-Fatḥ transmission without assigning it to a canonical reader or transmitter. |

Page 103's checked batch and the full generated rebuild passed. After this
page, the generated index reported 2,017 positions and 6,839 farsh claims;
at-Taysīr contributed 877 farsh claims and 29 rule claims.

## Volume 1, p. 104 — continuation of the al-Anʿām imāla rules and farsh

**Status: incorporated; one route-clause remains unresolved.** This page
continues the preceding imāla discussion, adds a distinct connected-reading
condition, and then returns to farsh. The extra route reports remain distinct
from the named canonical readings.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:80 `أتحاجوني` | Incorporated | `farsh/taysir/batch-5527-p104.checked.json`, `d104-01`, supplements the existing three-form feature. Nāfiʿ and Ibn Dhakwān read the light nūn; the source marks Ibn ʿĀmir as differing via Hishām, so only Ibn Dhakwān is assigned the light form. |
| 6:83 and 12:76 `نرفع درجات` | Incorporated | `d104-02`–`d104-03`; the Kūfī group reads with tanwīn at both explicitly named loci; the remainder reads without it. Each verse has its own source claim. |
| 6:86 and 38:48 `واليسع` | Incorporated | `d104-04`–`d104-05` add distinct positions for “here” in al-Anʿām and in Ṣād. Ḥamza and al-Kisāʾī double the lām and sukun the yāʾ; the rest use one lām and fatḥ the yāʾ. |
| General `رأى` rule when no sākin follows the yāʾ | Rule incorporated | `d104-06` continues p. 103: Warsh has the between-two-vowels form, al-Dūrī has imāla of hamza only, al-Sūsī is explicitly said to read like Ḥamza, and the rest open both. The al-Akhfash / ʿAbd al-Bāqī route wording remains preserved separately without assigning al-Akhfash to a canonical reader. |
| `رءا القمر`, `رءا الشمس` and similar forms before a separate sākin | Rule and permitted report incorporated; route detail retained | `d104-07` records the waṣl condition, Ḥamza and Shuʿba imāla of rāʾ only, the remainder's fatḥ, and the source's pause cross-reference to p. 103. It also records the explicitly permitted report of the combined rāʾ/hamza imāla in both Abū ʿAmr transmissions and from Abū Shuʿayb/al-Sūsī. Khalaf–Yaḥyā–Abū Bakr and al-Yazīdī routes remain in `second-witness/route-detail.json` without additional canonical transmitter assignments. |
| Transmission-route distinctions within the p. 104 imāla reports | Unresolved as further canonical claims | `s104-02`; the exact routes and “like the first” references are preserved in the item evidence and route-detail file. No other transmitter forms are inferred. |

The p. 104 batch has seven reviewed items, one unresolved skip, zero verifier
errors or coverage gaps, five matching verse anchors and two rule anchors. The
full rebuild reports 2,019 positions and 6,849 farsh claims; the rules layer
has 159 rules and 299 claims. At-Taysīr contributes 888 farsh claims and 35
rule claims, with one permitted report on p. 104. Pages 105–228 and earlier
relevant chapters remain to be audited.

## Volume 1, p. 105 — continued al-Anʿām readings

**Status: incorporated; one editorial cross-reference is out of scope.** The
page returns to local word readings and includes two explicit cross-sūra
locations. Its spelling-sensitive form at 6:92 has a reviewed weak anchor.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:90 `فبهداهم اقتده` | Incorporated | `farsh/taysir/batch-5527-p105.checked.json`, `d105-01`, maps the four stated forms to the existing feature: Ibn Dhakwān kasr with ṣila; Hishām kasr without ṣila; Ḥamza/al-Kisāʾī delete the hāʾ in waṣl; the rest retain it sākin in both states. |
| 6:91 `يجعلونه`, `يبدونها`, `ويخفون` | Incorporated | `d105-02`–`d105-04` preserve all three positions separately: Ibn Kathīr/Abū ʿAmr yāʾ in all three, the rest tāʾ. |
| 6:92 `ولينذر أم` | Incorporated with reviewed weak anchor | `d105-05` adds Abū ʿAmr's yāʾ form and the remainder's tāʾ form to the existing feature. The source locator differs from Cairo's tāʾ spelling, so no mismatching word anchor is imposed. |
| 6:94 `لقد تقطع بينكم` | Incorporated | `d105-06`; Nāfiʿ, Ḥafṣ, and al-Kisāʾī naṣb the nūn; the rest rafʿ it. |
| `{الحي من الميت وتخرج الميت من الحي} قد ذكر` | Explicitly out of scope | `s105-01`; the source only points back to an earlier discussion and supplies no form or attribution on this page. |
| 6:96 `وجعل الليل سكنا` | Incorporated | `d105-08`; the Kūfī group reads `وجعل` on the faʿal pattern with naṣb of layl; the rest `وجاعل` on fāʿil with layl in genitive. |
| 6:98 `فمستقر` | Incorporated | `d105-09`; Ibn Kathīr/Abū ʿAmr kasr the qāf, the rest fatḥ it. |
| 6:99 and 36:35 `ثمره` | Incorporated | `d105-10`–`d105-11` preserve the source's two explicit locations separately. Ḥamza/al-Kisāʾī read with two ḍammas; the rest with two fatḥas. At 36:35 the Qurʾānic phrase has `من ثمره`; the source's `إلى ثمره` remains in its evidence. |
| 6:100 `وخرقوا` | Incorporated | `d105-12`; Nāfiʿ tashdīd of rāʾ, the rest light. |
| 6:105 `دراست` | Incorporated | `d105-13` records three forms: Ibn Kathīr/Abū ʿAmr with alif and fatḥ tāʾ; Ibn ʿĀmir without alif, fatḥ sīn and sukūn tāʾ; the rest without alif, sukūn sīn and fatḥ tāʾ. |

The checked p. 105 batch contains 12 reading items and one out-of-scope skip,
with zero verifier errors or coverage gaps, 11 matching anchors and one
reviewed weak anchor at 6:92.

## Volume 1, pp. 106–107 — continued al-Anʿām readings

**Status: mapped with three passage-level gaps recorded.** The `يصعد` reading
starts on p. 106 and continues onto p. 107; the two batches preserve that
page break rather than treating the first-page fragment as complete.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:109–6:125, p. 106 | Incorporated | `farsh/taysir/batch-5527-p106.checked.json`, `d106-01`–`d106-17`, retains the listed forms, 6:122/36:33/49:12 and 6:125/25:13 paired loci, and Abū Bakr's `بخلاف عنه` as a disputed report. `d106-17` is completed by p. 107 `d107-01`: Ibn Kathīr's sukūn form, Shuʿba's alif form, and the remaining readers' doubled ṣād/ʿayn form remain distinct. |
| 6:128, 10:45, and 34:40 | Incorporated | p. 107 `d107-02`–`d107-04` preserve the source's explicit second-occurrence references and Hafṣ's yāʾ against the seven-reader remainder's nūn at each named place. |
| 6:22 `ثم نقول` | Incorporated as a separate position | `d107-05` records the explicit Hafṣ yāʾ and remainder nūn for this verb only. The p. 107 statement does not specify the preceding verb at 6:22, so the existing combined two-verb feature is not reused for this partial assertion. |
| 6:132 `عما تعملون`; 6:135 `مكاناتكم` and `من يكون له`; 28:37 `من يكون له`; 36:67 `مكاناتهم`; 39:39 `مكانتكم` | Incorporated | `d107-06`–`d107-11` add the named readings. Abū Bakr is kept as Shuʿba; the `حيث وقع` plural reading is applied to the matching occurrences at 6:135, 36:67, and 39:39. The 6:135 and al-Qaṣaṣ `من يكون له` anchors are reviewed weak because of the source/Cairo spelling or attached wāw. |
| 6:136 `بزعمهم` | Local occurrence incorporated; second locus unresolved | `d107-12` records the local al-Kisāʾī ḍamma-zāy form. `s107-01` preserves the source's `في الحرفين هنا وفي` wording; the transcription lacks the second locator, so no second verse is assigned. |
| 6:137 `وكذلك زين قتل أولادهم شركائهم`; 6:139 `وإن تكن` and `ميتة` | Incorporated | `d107-13`–`d107-15` preserve Ibn ʿĀmir's complete four-word inflectional sequence and the respective source reader sets/forms at 6:139. The compact target feature remains supplemented by the full source description. |
| `الذين قتلوا`; 6:141 `يوم حصاده` | Out of scope / unresolved | `s107-02` notes the bare reader mention beside `الذين قتلوا` without a stated form. `s107-03` retains the 6:141 fatḥ/kasr contrast as unresolved because this transcription does not identify who reads fatḥ; the adjacent reader names are not assigned to it. |

The checked p. 106 batch has 17 items, zero skips, zero errors or gaps, and
15 agreeing plus two reviewed weak anchors. The checked p. 107 batch has 15
items and three tracked passages (one unresolved locator, one out-of-scope
bare mention, and one unresolved attribution), zero errors or coverage gaps,
13 agreeing anchors, and two reviewed weak anchors. Pages 108–228 and earlier
relevant chapters remain to be audited.

## Volume 1, p. 108 — continued al-Anʿām readings

**Status: readings incorporated; Warsh's contrast is resolved by the p. 109
continuation.** The
page gives local farsh, explicit cross-sūra positions, a 17-occurrence
wherever family, and a list of eight hamza/yāʾ positions. The latter are
handled individually so each location retains its own stated readers.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:143 `ومن المعز`; 6:145 `إلا أن تكون` and `ميتة` | Incorporated | `farsh/taysir/batch-5527-p108.checked.json`, `d108-01`–`d108-03`; the source-defined Kūfī group plus Nāfiʿ, Ibn Kathīr/Ibn ʿĀmir/Ḥamza, and Ibn ʿĀmir are preserved separately. The `تكون` locator has a reviewed weak anchor because its source form differs from Cairo. |
| `تذكرون` where it begins with tāʾ | Incorporated at all 17 matching occurrences | `d108-04`–`d108-20`: 10:3, 11:24, 11:30, 16:17, 16:90, 23:85, 24:1, 24:27, 27:62, 37:155, 45:23, 51:49, 56:62, 6:152, 69:42, 7:3, and 7:57. Ḥafṣ, Ḥamza, and al-Kisāʾī lighten the dhāl; the remainder double it. The source's initial-tāʾ condition is retained. |
| 6:153 `وإن هذا` hamza; 6:153 nūn in `أن` | Incorporated as two distinctions | `d108-21` supplements the existing hamza feature; `d108-22` creates a separate nūn feature for Ibn ʿĀmir's light form versus the remainder's doubled form. |
| 6:158 and 16:33 `إلا أن يأتيهم` | Incorporated | `d108-23`–`d108-24` preserve Ḥamza/al-Kisāʾī yāʾ against the remainder's tāʾ at both explicitly named sites. Both have reviewed weak anchors because the source reading differs from the Cairo token. |
| 6:159 and 30:32 `فارقوا` / `فرقوا` | Incorporated | `d108-25`–`d108-26` retain the source's two explicit locations: Ḥamza/al-Kisāʾī read with alif and light form; the remainder without alif and doubled. |
| 6:161 `دينا قيما` | Incorporated | `d108-27`; the source-defined Kūfī group plus Ibn ʿĀmir use kasr qāf, fatḥ yāʾ, and the light form; the remainder use the opposite vowels and doubling. |
| Eight hamza/yāʾ positions at 6:14, 6:15, 6:74, 6:79, 6:153, 6:161, and 6:162 | Incorporated position by position | `d108-28`–`d108-35` preserve each source assignment: the paired al-Ḥaramiyyān/Abū ʿAmr positions; Nāfiʿ's two positions; Nāfiʿ/Ibn ʿĀmir/Ḥafṣ; Ibn ʿĀmir; and Nāfiʿ/Abū ʿAmr. The two listed readings at 6:162 remain distinct. |
| 6:162 `ومحياي`, Warsh route | Incorporated across pp. 108–109 | p. 108 `d108-35`–`d108-36` preserve Nāfiʿ's sukūn and the Ibn Khāqān route through Warsh; p. 109 `d109-01`–`d109-05` adds the Abū al-Azhar and Yūnus routes and Abū ʿAmr's explicit conclusion that Warsh transmits Nafiʿ's sukūn and chooses fatḥ himself. Uthmān b. Saʿīd's distinct route preferences are preserved in `second-witness/route-detail.json`. |

The checked p. 108 batch has 36 reading items, zero skips, verifier errors, or
coverage gaps, 33 agreeing anchors, and three reviewed weak anchors.

## Volume 1, p. 109 — Warsh continuation and opening al-Aʿrāf readings

**Status: incorporated with route reports preserved separately.** The page
completes the detailed `محياي` / `مماتي` account, adds the Abū ʿAmr `وقد هدان`
waṣl form in al-Anʿām, then begins al-Aʿrāf farsh.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 6:162 `ومحياي` and `ومماتي` | Canonical claims incorporated; route reports documented | `farsh/taysir/batch-5527-p109.checked.json`, `d109-01`–`d109-05`, records the Warsh reports through Abū al-Azhar and Yūnus, the transmitted Nāfiʿ sukūn, Warsh's own fatḥ choice, and the Warsh-through-Yūnus `مماتي` form. Uthmān b. Saʿīd's instructions and differing preferences are not conflated with canonical readings; both chains are retained in `second-witness/route-detail.json`. |
| 6:80 `وقد هدان` | Incorporated | `d109-06` adds Abū ʿAmr's yāʾ retention in waṣl to the existing position. A duplicate feature already in the project is not given another copy of this source claim. |
| 7:3 `قليلا ما يتذكرون` | Incorporated | `d109-07` adds Ibn ʿĀmir's extra yāʾ and the remainder without it. |
| 7:25 and 43:11 `تخرجون` | Incorporated at both named loci | `d109-08`–`d109-09`; Ḥamza, al-Kisāʾī, and Ibn Dhakwān use fatḥ tāʾ/ḍamma rāʾ; the remainder use ḍamma tāʾ/fatḥ rāʾ. |
| 7:26 `ولباس التقوى`; 7:32 `خالصة` | Incorporated | `d109-10`–`d109-11` preserve the stated reader sets and naṣb/rafʿ forms. |

The checked p. 109 batch has 11 items, zero skips, verifier errors, or
coverage gaps, and 11 agreeing anchors. The full rebuild reports 2,045
positions and 7,019 claims across 103 suras; the rules layer remains at 159
rules and 299 claims. At-Taysīr contributes 1,088 farsh claims and 35 rule
claims, plus one permitted report. Pages 110–228 and earlier relevant
chapters remain to be audited.

## Volume 1, p. 110 — al-Aʿrāf readings

**Status: readings incorporated; two bare editorial cross-references are out of
scope.** This page continues the book's sura-by-sura farsh, with two
source-explicit wherever statements and a second named location in al-Raʿd.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 7:38 `ولكن لا يعلمون` | Incorporated; weak word anchor | `farsh/taysir/batch-5527-p110.checked.json`, `d110-01`, attributes yāʾ to Abū Bakr (Shuʿba) and tāʾ to the remainder. The source locates it in al-Aʿrāf, but the Cairo token did not yield an exact anchor; the feature keeps the source's 7:38 location without invented word IDs. |
| 7:40 `لا تفتح`; 7:43 `ما كنا لنهتدي`; 7:44 `قالوا نعم` and `أن لعنة الله` | Incorporated | `d110-02`–`d110-05` retain the three distinct forms of `لا تفتح`, Ibn ʿĀmir's omission of wāw, al-Kisāʾī's kasr-ʿayn wherever form, and the four named authorities for tashdīd nūn/naṣb tāʾ. Existing features are supplemented with independent at-Taysīr citations. |
| 7:54 and 13:3 `يغشى اليل` | Incorporated at both explicit locations | `d110-06`–`d110-07`; Abū Bakr (Shuʿba), Ḥamza, and al-Kisāʾī read it heavy; the remainder read it light. The second item follows the explicit `وكذلك في الرعد` locator. The source page transcription has `اليل`; the anchored Qurʾānic text has `الليل`. |
| 7:54 `والشمس والقمر والنجوم مسخرات` | Incorporated; existing form model corrected | `d110-08` supplements existing item `u147672-1`: Ibn ʿĀmir raises all four nouns; the remainder use naṣb, with kasr on the tāʾ of `مسخرات`. The existing Taḥbīr form had mistakenly used the following editorial cross-reference as its remainder value; its source evidence is preserved and its form description corrected to the reading actually stated before that cross-reference. |
| `بشرا` wherever; `من إله غيره` wherever under its stated condition | Incorporated | `d110-09` records the four forms and named reader sets for `بشرا`; `d110-10` records al-Kisāʾī's kasr rāʾ and the remainder's rafʿ only when `إله` follows a genitive-governing `من`. The source's global scopes and conditional wording are preserved rather than expanded into guessed loci. |
| `{وخفية} قد ذكر`; `{الريح} قد ذكر` | Out of scope | `s110-01` and `s110-02` are bare pointers to earlier reading material and state no reading or attribution on this page. |

The checked p. 110 batch has 10 reading items, two documented skips, zero
errors or coverage gaps, nine agreeing anchors, and one weak anchor at 7:38.
It adds 23 at-Taysīr claims, including two new positions at 7:54 and 13:3.
The rebuilt index reports 2,047 positions and 7,042 claims across 103 suras;
the rules layer has 159 rules and 299 claims. At-Taysīr contributes 1,111
farsh claims and 35 rule claims, plus one permitted report. Pages 111–228 and
earlier relevant chapters remain to be audited.

## Volume 1, p. 111 — al-Aʿrāf readings and the hāʾ of `أرجئه`

**Status: readings and stopping procedure incorporated; two bare pointers are
out of scope.** The page gives located farsh, a route-specific distinction,
a named cross-sūra position, and a stopping rule tied to the preceding word.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `أبلغكم` at 7:62, 7:68, and 46:23 | Incorporated at all three source-supported loci | `farsh/taysir/batch-5527-p111.checked.json`, `d111-01`–`d111-03`; Abū ʿAmr reads it light, the remainder doubled. The two al-Aʿrāf positions resolve the source's counted local pair; al-Aḥqāf is explicit. |
| `{بسطة} قد ذكر`; `{لفتحنا عليهم} قد ذكر` | Out of scope | `s111-01` and `s111-02` are pointers only; they restate no reading or attribution. |
| 7:75 `قال الملأ الذين استكبروا`; 7:81 `إنكم لتأتون` | Incorporated | `d111-04`–`d111-05` merge Ibn ʿĀmir's extra wāw and the Nāfiʿ/Hafṣ hamza-kasra report into the existing positions, with the source's remainder forms. |
| 7:98 `أو أمن` | Incorporated as a source-specific three-form feature; weak word anchor | `d111-06` distinguishes al-Ḥaramiyyān plus Ibn ʿĀmir with wāw sukūn, Warsh's named naql route, and the remainder's fatḥ. The book's own definition of al-Ḥaramiyyān and the explicit Warsh exception narrow the collective to Qālūn and Ibn Kathīr for this claim. The short locator could not be anchored uniquely by the automatic matcher, so the source's 7:98 location is kept without word IDs. |
| 7:105 `على أن لا` | Incorporated | `d111-07` supplements existing item `u148704-1`: Nāfiʿ has fatḥ yāʾ with tashdīd; the remainder has sukūn, which the source says yields alif in pronunciation. |
| 7:111 and 26:36 `ارجئه` | Incorporated at both named loci | `d111-08` merges the six at-Taysīr reading forms into existing 7:111; `d111-09` adds the explicit al-Shuʿarāʾ occurrence. The named transmitter-level differences and Imam-level readings remain separate. |
| Waqf on the hāʾ of `أرجئه` | Incorporated as two rule assertions | `d111-10` records the source's general sukūn at pause; `d111-11` separately records the permission of rawm and ishmām for the readers whose preceding forms have ḍamma. This is not assigned as a form exclusive to ʿĀṣim and Ḥamza. |

The checked p. 111 batch has 11 items, two documented skips, zero errors or
coverage gaps, eight agreeing anchors, one weak anchor, and two rule items.
It adds 27 farsh claims and two rule claims. While reviewing the shared 7:62,
7:75, 7:81, and 7:111 features, their Taḥbīr form labels were corrected to
exclude locators/cross-references from reading descriptions; Taḥbīr's hāʾ-at-
waqf statement was split into its own two rule assertions at its original
printed citation. The rebuilt index reports 2,051 positions and 7,069 claims
across 103 suras; the rules layer has 163 rules and 303 claims. At-Taysīr
contributes 1,138 farsh claims and 37 rule claims, plus one permitted report.
Pages 112–228 and earlier relevant chapters remain to be audited.

## Volume 1, p. 112 — al-Aʿrāf readings continuing into Yūnus, Ṭā Hā, and al-Shuʿarāʾ

**Status: listed readings and the bounded no-insertion rule incorporated.** The
page uses explicit multi-sūra locators, Imam/transmitter distinctions, and
three position-specific forms for `آمنتم به`.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `بكل سحر` at 7:112 and 10:79 | Incorporated at both named loci | `farsh/taysir/batch-5527-p112.checked.json`, `d112-01`–`d112-02`; Ḥamza and al-Kisāʾī have the source's alif-after-ḥāʾ form, the remainder alif-after-sīn. These supplement existing `بكل سحار` positions while preserving at-Taysīr's own quoted spelling and citation. |
| 7:113 `إن لنا لأجرا` | Incorporated | `d112-03` adds al-Ḥaramiyyān and Ḥafṣ on the kasr-hamza/khabar form and the remainder on istifhām. The related two-hamza chapter is retained in the exact evidence, not expanded into an unlocated claim. |
| `تلقف ما` at 7:117, 20:69, and 26:45 | Incorporated at all three listed loci | `d112-04`–`d112-06`; Ḥafṣ has sukūn lām/light form, the remainder fatḥ lām/tashdīd. The 20:69 and 26:45 features are separate from existing `تلقف` features there, which record different letter distinctions. |
| `قال فرعون آمنتم به` at 7:123, 20:71, and 26:49 | Incorporated position by position | `d112-07`–`d112-09` preserve Qunbul's distinct connected, Ṭā Hā, and al-Shuʿarāʾ forms; Ḥafṣ's khabar; Abū Bakr/Ḥamza/al-Kisāʾī's two articulated hamzas; and the remainder's hamza plus long madd. The two weak anchors are at 20:71 and 26:49 because the source/Cairo hamza spellings differ; both retain the source's explicit sura locators. |
| 7:127 `سنقتل` | Incorporated | `d112-10` supplements existing item `u150054-1`: the source-defined al-Ḥaramiyyān use fatḥ nūn/ḍamma tāʾ with lightening; the remainder use ḍamma nūn/kasr tāʾ with tashdīd. |
| No inserted alif between the articulated and softened hamzas at these three `آمنتم به` positions | Incorporated as a bounded rule | `d112-11` records the source's explicit negative rule and its stated reason, with scope limited to the three named loci. Its reference to `ءانذرتهم` is preserved as comparison only and not expanded to additional positions. |

The checked p. 112 batch has 11 items, no skips, zero errors or coverage gaps,
eight agreeing anchors, two weak anchors, and one rule item. It adds 25 farsh
claims and one rule claim. The prior Taḥbīr descriptions for 7:113 and 7:117
were also corrected to separate their form descriptions from cross-reference
text. The rebuilt index reports 2,053 positions and 7,094 claims across 103
suras; the rules layer has 164 rules and 304 claims. At-Taysīr contributes
1,163 farsh claims and 38 rule claims, plus one permitted report. Pages
113–228 and earlier relevant chapters remain to be audited.



## Volume 1, p. 113 — al-Aʿrāf readings continuing into an-Naḥl and Ṭā Hā

**Status: all located readings incorporated.** This dense continuation uses reader names before the next lemma in several places; the attribution sequence was followed item by item. Explicit cross-sūra references are represented at each named verse.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `يعرشون` at 7:137 and 16:68 | Incorporated at both named locations | `farsh/taysir/batch-5527-p113.checked.json`, `d113-01`–`d113-02`; Abū Bakr (Shuʿba) and Ibn ʿĀmir use ḍamm rāʾ; the remainder use kasr. The source explicitly names an-Naḥl for the second location. |
| 7:138 `يعكفون`; 7:141 `وإذ أنجاكم` and `يقتلون أبناءكم` | Incorporated | `d113-03`–`d113-05`; Ḥamza and al-Kisāʾī are kept as the source's exact group for `يعكفون`; Ibn ʿĀmir has the unextended `أنجاكم` form, while Nāfiʿ alone is named for lightening `يقتلون`. |
| 7:143 `جعله دكا`; 7:144 `برسالتي`; 7:146 `سبيل الرشد`; 7:148 `من حليهم` | Incorporated | `d113-06`–`d113-09` supplement existing positions with the source's distinct hamza/madd/tanwīn, singular/plural, vowel, and ḥāʾ distinctions. `الحرميان` is resolved only through at-Taysīr's own definition. |
| 7:149 `ترحمنا ربنا وتغفر لنا`; 7:150 and 20:94 `قال ابن أم` | Incorporated | `d113-10`–`d113-12`; Ḥamza and al-Kisāʾī are named for the two tāʾ forms and naṣb at 7:149. Ibn ʿĀmir, Abū Bakr (Shuʿba), Ḥamza, and al-Kisāʾī are named for kasr mīm at both explicit `ابن أم` locations. |
| 7:157 `عنهم اصارهم` | Incorporated | `d113-13` supplements existing `u151049-1`: the source names Ibn ʿĀmir for fatḥ hamza with alif/plural, and the remainder for kasr hamza without alif/singular. The trailing `ابن عامر` precedes and introduces this next lemma; it is not carried backward to `قال ابن أم`. |

The checked p. 113 batch has 13 items, no skips, verifier errors, or coverage
gaps, ten agreeing anchors, two weak anchors, and one source-supported item
without a Cairo word anchor. It adds 26 claims and two positions, at 16:68
and 20:94. The rebuilt index reports 2,055 positions and 7,120 claims across
103 suras; the rules layer remains at 164 rules and 304 claims. At-Taysīr
contributes 1,189 farsh claims and 38 rule claims, plus one permitted report.
Pages 114–228 and earlier relevant chapters remain to be audited.


## Volume 1, p. 114 — closing al-Aʿrāf readings

**Status: located readings incorporated; one bare cross-reference is out of scope and one attribution remains unresolved.** The page completes readings in al-Aʿrāf and explicitly cross-references Fuṣṣilat. Reader names preceding a lemma were assigned to that following entry, while an additional transmitted Abū Bakr form is retained as a separate report.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 7:161 `تغفر لكم` and `خطيئاتكم` | Incorporated | `farsh/taysir/batch-5527-p114.checked.json`, `d114-01`–`d114-02`; at-Taysīr names Nāfiʿ and Ibn ʿĀmir for the tāʾ form, and records four distinct noun forms across Abū ʿAmr, Ibn ʿĀmir, Nāfiʿ, and the remainder. These supplement existing features without importing the additional readers named by other compilations. |
| 7:164 `قالوا معذرة` | Incorporated | `d114-03`; Ḥafṣ has naṣb and the remainder rafʿ. |
| 7:165 `بعذاب بيس` | Incorporated, including an additional route report | `d114-04` preserves Nāfiʿ’s no-hamza reading, Ibn ʿĀmir’s sākin hamza, Abū Bakr (Shuʿba)’s explicitly disputed form, and the remainder. `d114-05` separately records the source’s report that Abū Bakr also transmitted the remainder’s form. |
| `{أفلا تعقلون} قد ذكر` | Out of scope | `s114-01` is a bare pointer to a reading discussed elsewhere and supplies no form here. |
| 7:170 `والذين يمسكون` | Unresolved | `s114-02` records the lightened/doubled contrast, but this passage does not name the reader(s) of the lightened form. The attribution found in another compilation is not transferred to at-Taysīr. |
| 7:172 `ذرياتهم`; 7:172 `أن يقولوا` and 7:173 `أو يقولوا` | Incorporated at all three locations | `d114-06`–`d114-08`; the named reader sets and the paired yāʾ/tāʾ forms are retained. The 7:172 form has a weak Cairo anchor because its source spelling differs at that location; the source’s explicit `فيهما هنا` identifies the paired al-Aʿrāf locations. |
| `يلحدون` at 7:180 and 41:40 | Incorporated at both named locations | `d114-09`–`d114-10`; Ḥamza has fatḥ yāʾ/ḥāʾ and the remainder ḍamm yāʾ/kasr ḥāʾ. The second location follows the source’s explicit `وفي فصلت`. |

The checked p. 114 batch has 10 items and two documented skips, zero
verifier errors or coverage gaps, nine agreeing anchors, and one weak anchor.
It adds 23 claims and two positions at 7:180 and 41:40. The rebuilt index
reports 2,057 positions and 7,143 claims across 103 suras; the rules layer
remains at 164 rules and 304 claims. At-Taysīr contributes 1,212 farsh claims
and 38 rule claims, plus one permitted report. Pages 120–228 and earlier
relevant chapters remain to be audited.


## Volume 1, p. 115 — al-Aʿrāf readings and seven yāʾ loci

**Status: 13 items incorporated; the unnamed deleted-yāʾ reading remains unresolved.** The page closes the al-Aʿrāf farsh list with four located word readings, then gives a source-organized list of seven yāʾ positions plus a separate omitted-yāʾ note. Each yāʾ assertion is mapped to its own verse and retains only the readers named by at-Taysīr.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 7:186 `ويذرهم` | Incorporated | `farsh/taysir/batch-5527-p115.checked.json`, `d115-01`; ʿĀṣim and Abū ʿAmr read yāʾ with rafʿ rāʾ; Ḥamza and al-Kisāʾī read yāʾ with jazm; the remainder read nūn with rafʿ. |
| 7:190 `له شركا`; 7:193 and 26:224 `لا يتبعوكم` / `يتبعهم الغاوون`; 7:201 `طيف` | Incorporated at each named location | `d115-02`–`d115-05` preserve at-Taysīr’s Nafiʿ/Shuʿba group and the source’s distinct forms, with both al-Shuʿarāʾ locations recorded separately. Reader sets are not expanded from the ten-reader books. |
| Seven yāʾ positions: 7:33 `ربي الفواحش`; 7:59 `إني أخاف`; 7:150 `من بعدي أعجلتم`; 7:105 `بني إسرائيل`; 7:144 `إني اصطفيتك`; 7:146 `عن آياتي الذين`; 7:156 `عذابي أصيب` | Incorporated | `d115-06`–`d115-12` record the source’s named readers for each locus. The page transcription reads `معنى {بني إسرائيل}`; the exact evidence is preserved and not silently changed to `معي`. |
| 7:195 `ثم كيدون` yāʾ retention and deletion | Named retention forms incorporated; deletion attribution unresolved | `d115-13` records Hishām’s disputed retention in both states and Abū ʿAmr’s retention in waṣl. `s115-01` records the source’s separate statement that a yāʾ is omitted, without assigning that omission to unnamed readers. |

The checked p. 115 batch has 13 items and one documented unresolved passage,
zero verifier errors or coverage gaps, and 13 agreeing anchors. It adds 20
claims and one position at 7:59. The rebuilt index reports 2,058 positions
and 7,163 claims across 103 suras; the rules layer remains at 164 rules and
304 claims. At-Taysīr contributes 1,232 farsh claims and 38 rule claims, plus
one permitted report. Pages 120–228 and earlier relevant chapters remain to
be audited.


## Volume 1, p. 116 — opening of al-Anfāl

**Page status: eight located readings incorporated; two bare cross-references are out of scope.** The p. 116 transition opens the al-Anfāl sequence and gives local forms in source order. The established at-Taysīr reader set and its al-Ḥaramiyyān collective are retained; no readers named only by other compilations are added.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 8:9 `مردفين` | Incorporated, with rejected report preserved | `farsh/taysir/batch-5527-p116.checked.json`, `d116-01`; Nāfiʿ has fatḥ dāl and the remainder kasr. The source reports an Ibn Mujāhid/Qunbul-related reading but judges it `وهو وهم`; that report is retained in the note, not asserted as a canonical Qunbul reading. |
| 8:11 `إذ يغشاكم` | Incorporated | `d116-02`; Ibn Kathīr and Abū ʿAmr are distinguished from the source's `الباقون` form. The source's reading is retained at 8:11 despite its difference from the Cairo token. |
| `{الرعب}` and `{ولكن الله}` `قد ذكر` | Out of scope | `s116-01`; these are bare pointers and give no forms on this page. |
| 8:18 `موهن كيد`; 8:18 `كيد` | Incorporated as two dimensions | `d116-03` records the al-Ḥaramiyyān/Abū ʿAmr form and remainder; `d116-04` separately records Ḥafṣ's idāfa/no-tanwīn form and the remainder's tanwīn/naṣb. |
| 8:19 `وأن الله مع` | Incorporated | `d116-05`; Nāfiʿ, Ibn ʿĀmir, and Ḥafṣ have fatḥ hamza; the remainder have kasr. |
| `{ليميز الله} مذكور قبل` | Out of scope | `s116-02`; a bare pointer to an earlier entry, with no form stated here. |
| 8:42 `بالعدوة` in both occurrences | Incorporated | `d116-06`; Ibn Kathīr and Abū ʿAmr have kasr ʿayn in both words, and the remainder ḍamm. The source's explicit `في الحرفين` is retained. |
| 8:42 `من حيى عن` | Incorporated | `d116-07`; Nāfiʿ, al-Bazzī, and Abū Bakr (Shuʿba) have two yāʾs with the first kasra; the remainder have one fatḥa yāʾ with tashdīd. |
| 8:50 `إذ تتوفى الذين` | Incorporated with weak Cairo anchor | `d116-08`; Ibn ʿĀmir has two tāʾs and the remainder yāʾ plus tāʾ. The source's explicit 8:50 locator is preserved although its form differs from Cairo spelling. |

The checked p. 116 batch has eight items and two documented skips, zero
verifier errors or coverage gaps, seven agreeing anchors, and one weak anchor.
It adds 16 claims and no new positions. The rebuilt index reports 2,058
positions and 7,179 claims across 103 suras; the rules layer remains at 164
rules and 304 claims. At-Taysīr contributes 1,248 farsh claims and 38 rule
claims, plus one permitted report. Pages 120–228 and earlier relevant
chapters remain to be audited.


## Volume 1, p. 118 — at-Tawba readings

**Page status: eight reading items incorporated; three bare cross-references are out of scope; one 9:66 statement remains unresolved across the page break.** The page continues the at-Tawba farsh sequence. Reader groups and remainders are limited to the seven-reader set used by at-Taysīr; named forms from other compilations are not added.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 9:17 `أن يعمروا مسجد الله` | Incorporated | `farsh/taysir/batch-5527-p118.checked.json`, `d118-01`; Ibn Kathīr and Abū ʿAmr read the first occurrence as singular, and the remainder plural. The source explicitly says there is no difference at the second occurrence. |
| `{يبشرهم} قد ذكر` | Out of scope | `s118-01`; a bare pointer to a reading discussed earlier. |
| 9:24 `وعشيراتكم` | Incorporated | `d118-02`; Abū Bakr (Shuʿba) reads the plural form; the remainder reads singular. |
| 9:30 `عزير ابن الله`; 9:30 `يضاهئون` | Incorporated | `d118-03`–`d118-04`; ʿĀṣim and al-Kisāʾī are named for tanwīn/kasr, with al-Kisāʾī's note about the nūn's nonfixed iʿrāb ḍamma preserved. ʿĀṣim alone is named for the hamzated/kasr-hāʾ form of `يضاهئون`; the source-defined remainder is retained. |
| 9:37 `إنما النسي` | Incorporated, including a conditional pause report | `d118-05`; Warsh's tashdīd-without-hamza form and the remainder's hamza/madd/sukūn-yāʾ form are retained. The source's separate report that Hamza and Hishām agree with Warsh at pause is marked as conditional route evidence. This creates a new 9:37 position. |
| 9:37 `يضل به` | Incorporated | `d118-06`; Ḥafṣ, Ḥamza, and al-Kisāʾī have ḍamm yāʾ/fatḥ ḍād; the source's remainder has fatḥ yāʾ/kasr ḍād. Yaʿqūb's separate form in other compilations is not imported. |
| `{أو كرها} قد ذكر` | Out of scope | `s118-02`; a bare pointer with no form stated on this page. |
| 9:54 `أن يقبل منهم` | Incorporated with weak Cairo anchor | `d118-07`; Ḥamza and al-Kisāʾī have yāʾ, and the remainder tāʾ. The source's yāʾ form is retained at 9:54 although Cairo has tāʾ. |
| `{أذن قل أذن خير لكم} قد ذكر` | Out of scope | `s118-03`; a bare pointer with no form stated on this page. |
| 9:61 `ورحمة للذين` | Incorporated | `d118-08`; Ḥamza reads with khafḍ and the remainder rafʿ. |
| 9:66 `إن نعف عن طائفة` and following `نعذب` | Resolved across pp. 118–119 | The opening is preserved as `s118-04` on p. 118; `d119-01` in `batch-5527-p119.checked.json` incorporates the complete coordinated contrast, including both verbs and the case of the second `طائفة`, against existing position `u156651-1`. |

The checked p. 118 batch has eight items and four documented skips, zero
verifier errors or coverage gaps, seven agreeing anchors, and one weak anchor.
It adds 17 claims and one position. The rebuilt index reports 2,059 positions
and 7,221 claims across 103 suras; the rules layer remains at 164 rules and
304 claims. At-Taysīr contributes 1,290 farsh claims and 38 rule claims, plus
one permitted report. Pages 120–228 and earlier relevant chapters remain to
be audited.


## Volume 1, p. 117 — al-Anfāl close and opening of at-Tawba

**Page status: 13 located reading items incorporated; no skipped passages.** The page closes the al-Anfāl sequence, includes a paired yāʾ list with two explicit 8:48 locations, then crosses into Sūrat at-Tawba. At-Taysīr's own seven-reader groups are maintained: its Kūfī collective is not expanded with Yaʿqūb, and readers named by other compilations are not imported.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 8:59 `ولا يحسبن الذين`; 8:59 `إنهم لا يعجزون`; 8:61 `للسلم` | Incorporated | `farsh/taysir/batch-5527-p117.checked.json`, `d117-01`–`d117-03`; the named forms are attributed only to Ḥafṣ/Ibn ʿĀmir/Ḥamza, Ibn ʿĀmir, and Abū Bakr (Shuʿba), respectively, as at-Taysīr states. |
| 8:65 `وإن يكن منكم مائة يغلبوا`; 8:66 `فإن يكن منكم مائة صابرة` | Incorporated at both locations | `d117-04`–`d117-05`; the source's three-reader Kūfī group reads yāʾ at both; Abū ʿAmr is named for the first only; the source's remainder is kept with tāʾ at both. Yaʿqūb is not added from another compilation. |
| 8:66 `فيكم ضعفا` | Incorporated | `d117-06`; Ḥamza and ʿĀṣim have fatḥ ḍād and at-Taysīr's seven-reader remainder ḍamm. The separate Abū Jaʿfar form in another compilation is not attributed to this source. |
| 8:67 `أن تكون له`; 8:70 `من الأسارى`; 8:72 `من ولايتهم` | Incorporated | `d117-07`–`d117-09`; Abū ʿAmr's tāʾ form, his `فعالى` weight, and Ḥamza's kasr wāw are kept distinct with their respective remainders. The 8:67 tāʾ form has a weak Cairo anchor because Cairo has the yāʾ form. |
| 8:48 `إني أرى`; 8:48 `إني أخاف` | Incorporated as two distinct loci | `d117-10`–`d117-11`; at-Taysīr explicitly lists these two Anfāl yāʾ positions together and assigns fatḥ to the al-Ḥaramiyyān and Abū ʿAmr. No other same-lemma loci are inferred from this list. |
| Wherever `{أئمة}` in at-Tawba; 9:12 `لا أيمان لهم` | Incorporated | `d117-12`–`d117-13`; the source's two-hamza form is recorded with its explicit wherever scope. Hishām's interposed-alif form is preserved as a route report tied to al-Dānī's reading on Abū al-Fatḥ; it is not treated as an unqualified Ibn ʿĀmir reading. The source's 9:12 hamza-vowel contrast is separately retained. |

The checked p. 117 batch has 13 items and no skips, zero verifier errors or
coverage gaps, 12 agreeing anchors, and one weak anchor. It adds 25 claims and
no new positions. The rebuilt index reports 2,058 positions and 7,204 claims
across 103 suras; the rules layer remains at 164 rules and 304 claims.
At-Taysīr contributes 1,273 farsh claims and 38 rule claims, plus one
permitted report at this historical p. 117 checkpoint. Pages 120–228 and
earlier relevant chapters remain to be audited.


## Volume 1, p. 119 — at-Tawba readings and cross-sūra locations

**Page status: 12 located reading items incorporated; one explicit consensus statement recorded as non-variant; the trailing `هار` attribution is resolved across pp. 119–120.** The extraction follows at-Taysīr's entry order: reader names after a completed lemma can introduce the next lemma. Its seven-reader remainder is not expanded with readers from other compilations.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 9:66 `إن نعف عن طائفة` and `نعذب طائفة` | Incorporated across pp. 118–119 | `farsh/taysir/batch-5527-p119.checked.json`, `d119-01`, completes the p. 118 carryover. It preserves ʿĀṣim's nūn/fatḥ-fāʾ, second verb with nūn/kasr-dhāl, and accusative `طائفة`; the remainder's first and second verb forms and nominative noun are recorded together. |
| 9:98 and 48:6 `دائرة السوء` | Incorporated at both explicit locations | `d119-02` merges into 9:98; `d119-03` adds the separately named al-Fatḥ position at 48:6. Ibn Kathīr and Abū ʿAmr read with ḍamm sīn; the source's remainder has fatḥ. |
| 9:99 `قربة لهم` | Incorporated | `d119-04`; Warsh has ḍamm rāʾ, the remainder sukūn. The reader names following the statement belong to the next lemma. |
| 9:100 `من تحتها` | Incorporated at the source-located position | `d119-05` merges into `u157094-r1`; Ibn Kathīr adds `من` and reads with kasr tāʾ, and the remainder omits `من` and reads fatḥ. The existing position is weakly anchored; the verifier finds matching tokens elsewhere, so the source locator is preserved without moving the entry. |
| 9:103 `إن صلواتك` | Incorporated | `d119-06`; Ḥafṣ, Ḥamza, and al-Kisāʾī read singular with naṣb tāʾ; the remainder reads plural with kasr tāʾ. The source explicitly reports no difference in rafʿ tāʾ at 11:87; this consensus is listed as `s119-01`, not as a new variant. |
| 9:106 `مرجئون`; 33:51 `ترجىء` | Incorporated at both explicit locations | `d119-07` and `d119-08`; Ibn Kathīr, Abū Bakr (Shuʿba), Abū ʿAmr, and Ibn ʿĀmir read with hamza in both; the remainder without hamza. |
| 9:107 `الذين اتخذوا` | Incorporated | `d119-09`; Nāfiʿ and Ibn ʿĀmir omit the preceding wāw; the remainder retains it. |
| 9:109 `أفمن أسس بنيانه`; `خير أم من أسس بنيانه` | Incorporated at both positions | `d119-10`–`d119-11`; the preceding Nāfiʿ/Ibn ʿĀmir names carry into this entry. Both read ḍamm hamza, kasr sīn, and rafʿ nūn; the remainder reads fatḥ hamza/sīn and naṣb nūn. |
| 9:109 `جرف` | Incorporated | `d119-12`; Ibn ʿĀmir, Abū Bakr, and Ḥamza read with sukūn rāʾ; the remainder with ḍamm. |
| 11:87 `أصلاتك تأمرك` consensus | Recorded as non-variant | `s119-01`; at-Taysīr explicitly says there is no difference in rafʿ tāʾ. |
| Trailing `ابن كثير وحمزة وحفص` before `هار` | Incorporated across pp. 119–120 | `s119-03` preserves the p. 119 lead-in; p. 120 `d120-01` completes the reader list and the three forms. Naqqāsh-from-al-Akhfash route detail is kept separately in `second-witness/route-detail.json`. |

The checked p. 119 batch has 12 reading items and two tracked non-reading or
cross-page continuation entries, zero verifier errors or coverage gaps, and 11 agreeing
anchors plus one moved-token attention item. It adds 24 claims and one new
position at 48:6. The rebuilt index reports 2,060 positions and 7,245 claims
across 103 suras; the rules layer remains at 164 rules and 304 claims.
At-Taysīr contributes 1,314 farsh claims and 38 rule claims, plus one
permitted report. Pages 120–228 and pp. 16–71 remain to be audited.


## Volume 1, p. 120 — at-Tawba close and opening of Yūnus

**Page status: nine located reading items incorporated; one bare pointer out of scope; one route-only attribution retained separately; the cross-sūra `ضياء` entry is resolved with p. 121.** The page completes the `هار` list begun on p. 119, closes at-Tawba, then begins Yūnus. At the sura boundary, `الر` and `المر` are mapped to their distinct opening verses; the unfinished `ضياء` list was held open for its source continuation.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 9:109 `هار` | Incorporated across pp. 119–120 | `farsh/taysir/batch-5527-p120.checked.json`, `d120-01`, completes the p. 119 names. Ibn Kathīr, Ḥamza, Ḥafṣ, and Hishām have fatḥ; Warsh has bayna al-lafẓayn; the remainder has imāla. The Naqqāsh-from-al-Akhfash report is preserved separately as route detail and not generalized to a canonical reader. |
| 9:110 `إلا أن تقطع`; 9:117 `يزيغ قلوب`; 9:126 `أولا ترون` | Incorporated | `d120-02`–`d120-04`; the source's named readers and remainders are retained. `فيها ياءان` for the final locator is preserved without deriving another form. |
| 9:83 `معي أبدا`; `معي عدوا` | Incorporated as named forms only | `d120-05`–`d120-06`; at-Taysīr names Abū Bakr, Ḥamza, and al-Kisāʾī for sukūn in the first, and Ḥafṣ for fatḥ in the second. No unmentioned remainder reading is inferred. |
| 10:1 `الر`; 13:1 `المر` | Incorporated at both opening loci | `d120-07`–`d120-08`; Ibn Kathīr, Qālūn, and Ḥafṣ have fatḥ; Warsh has bayna al-lafẓayn; the remainder imāla. The source explicitly pairs both opening forms. |
| 10:2 `لساحر مبين` | Incorporated | `d120-09`; the source-defined Kūfī group and Ibn Kathīr read with alif; the remainder without alif. The source-defined Kūfī group retains its at-Taysīr-specific membership. |
| `{فيقتلون ويقتلون} قد ذكر` | Out of scope | `s120-02`; bare cross-reference to an earlier reading, with no form stated here. |
| Naqqāsh from al-Akhfash at 9:109 `هار` | Route detail incorporated separately | `s120-01` and `second-witness/route-detail.json`; the source explicitly includes the route in the fatḥ list, but it has no canonical qāriʾ/riwāya mapping in this schema. |
| Qunbul's `ضياء` / `بضياء` in Yūnus, al-Anbiyāʾ, and al-Qaṣaṣ | Incorporated across pp. 120–121 | `s120-03` preserves the p. 120 lead-in; p. 121 items `d121-01`–`d121-03` record Qunbul's hamza-after-ḍād form and the remainder's open-yāʾ form at 10:5, 21:48, and 28:71. |

The checked p. 120 batch has nine reading items and two skipped/unresolved
passages, zero verifier errors or coverage gaps, and nine agreeing anchors.
It adds 19 claims and no new positions. The rebuilt index reports 2,060
positions and 7,264 claims across 103 suras; the rules layer remains at 164
rules and 304 claims. At-Taysīr contributes 1,333 farsh claims and 38 rule
claims, plus one permitted report. Pages 122–228 and pp. 16–71 remain to be
audited.


## Volume 1, p. 121 — Yūnus readings and explicit cross-sūra loci

**Page status: 15 located reading items incorporated; two named teacher-route details retained separately.** Page 121 completes the Qunbul `ضياء` entry, then lists local Yūnus readings and explicit loci in an-Naḥl and ar-Rūm. The source's wherever scope for `أدراك` / `أدراكم` is retained as such rather than expanded into an inferred list.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 10:5 `ضياء`; 21:48 `ضياء`; 28:71 `بضياء` | Incorporated at all three source-listed positions | `farsh/taysir/batch-5527-p121.checked.json`, `d121-01`–`d121-03`; Qunbul has hamza after ḍād; the remainder has an open yāʾ after it. The 21:48 position is new; the Yūnus and al-Qaṣaṣ positions supplement existing features. |
| 10:5 `يفصل الآيات` | Incorporated | `d121-04`; Ibn Kathīr, Abū ʿAmr, and Ḥafṣ read with yāʾ; the remainder with nūn. The at-Taysīr reader set is retained without importing Yaʿqūb. |
| 10:11 `لقضي إليهم` and `أجلهم` | Incorporated as one coordinated reading item | `d121-05`; Ibn ʿĀmir has fatḥ qāf/ḍād and naṣb lām in `أجلهم`; the remainder has the source's ḍamm/kasr/fatḥ and rafʿ forms. |
| 10:16 `ولادنكم به` | Incorporated with source spelling preserved | `d121-06` maps the source's Qunbul no-alif reading to the existing 10:16 position and preserves the explicitly reported al-Bazzī form through Naqqāsh from Abū Rabīʿa as a report. Its cached source wording is retained verbatim with a weak anchor note; it is not silently corrected to the Cairo text. |
| 10:16 `أدراك` and `أدراكم` wherever | Incorporated with wherever scope | `d121-07` retains Ibn Kathīr, Qālūn, Ḥafṣ, and Hishām for fatḥ; Warsh for bayna al-lafẓayn; remainder for imāla. The source also names Naqqāsh from al-Akhfash; that route is preserved separately in `second-witness/route-detail.json`. |
| `عما يشركون` at 10:18, 16:1, 16:3, and 30:40 | Incorporated at all four stated loci | `d121-08`–`d121-11`; Ḥamza and al-Kisāʾī read with tāʾ at all four; the remainder with yāʾ. Both early an-Naḥl occurrences are listed individually, as the source directs. |
| 10:22 `ينشروكم في البر والبحر` | Incorporated with weak source-to-Cairo anchor | `d121-12`; Ibn ʿĀmir has nūn/shīn from nashr; the remainder has sīn/yāʾ from taysīr. The source form is not replaced with the Cairo token. |
| 10:23 `متاع الحياة الدنيا`; 10:27 `قطعا من الليل`; 10:30 `هنالك تلوا` | Incorporated | `d121-13`–`d121-15`; Ḥafṣ naṣb; Ibn Kathīr/al-Kisāʾī sukūn ṭāʾ; and Ḥamza/al-Kisāʾī tāʾ versus the remainder's bāʾ are retained. The p. 121 printed locator `هنالك تلوا` is preserved alongside the existing position label. |
| Naqqāsh routes through Abū Rabīʿa/al-Bazzī and al-Akhfash | Route detail incorporated separately | `s121-01`–`s121-02` and `second-witness/route-detail.json`; the source's chains are retained without expanding them into additional canonical reader claims. |

The checked p. 121 batch has 15 reading items and two route-detail entries,
zero verifier errors or coverage gaps, 13 agreeing anchors, and two weak
anchors. It adds 32 claims and four new positions (21:48, 16:1, 16:3, and
30:40). The rebuilt index reports 2,064 positions and 7,296 claims across
103 suras; the rules layer remains at 164 rules and 304 claims. At-Taysīr
contributes 1,337 farsh claims and 38 rule claims, plus one permitted report.
Pages 122–228 and pp. 16–71 remain to be audited.


## Volume 1, p. 122 — Yūnus readings and paired locations

**Page status: ten reading items incorporated; one bare pointer, one procedural note, and two route-specific ascriptions tracked separately.** The page lists verse-local forms, an explicit three-location `كلمت ربك` family, and two `الآن` loci with a shared pronunciation note. Its closing `وما يعزب` entry continues onto p. 123 and is incorporated across that page break.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `كلمت ربك` at 10:33, 10:96, and 40:6 | Incorporated at all three explicit loci | `farsh/taysir/batch-5527-p122.checked.json`, `d122-01`–`d122-03`; Nāfiʿ and Ibn ʿĀmir read the plural; the remainder singular. |
| 10:35 `أمن لا يهدى` | Incorporated with six forms and route reports | `d122-04` supplements `u159723-r1`: Ibn Kathīr/Warsh/Ibn ʿĀmir; Qālūn/Abū ʿAmr with concealed hāʾ movement; Abū Bakr; Ḥafṣ; and Ḥamza/al-Kisāʾī are kept distinct. Qālūn's naṣṣ with sukūn and al-Yazīdī's report from Abū ʿAmr remain separately documented in `route-detail.json`, not flattened into a single canonical assignment. |
| 10:44 `ولكن الناس` | Incorporated | `d122-05`; Ḥamza and al-Kisāʾī read kasr nūn, lightening, and rafʿ sīn; the remainder fatḥ nūn, doubling, and naṣb sīn. |
| 10:58 `خير مما تجمعون` | Incorporated | `d122-06`; Ibn ʿĀmir reads tāʾ; the remainder yāʾ. |
| 10:51 `به ءالئان`; 10:91 `ءالئان وقد عصيت` | Incorporated at both positions | `d122-07`–`d122-08`; Nāfiʿ reads with fatḥ lām and no hamza; the remainder with sukūn lām and following hamza. The source's shared articulation explanation is retained as `s122-02`, not modeled as another reading. |
| 10:61 and 34:3 `وما يعزب عن ربك` | Incorporated across pp. 122–123 | `d122-09`–`d122-10`; al-Kisāʾī reads kasr zāy and the remainder ḍamm. The source names Sabāʾ explicitly; its p. 123 continuation supplies the comparison. |
| `{ويوم يحشرهم كأن لم} قد ذكر` | Out of scope | `s122-01`; a bare earlier cross-reference with no form on this page. |
| Qālūn's sukūn and al-Yazīdī's report from Abū ʿAmr at 10:35 | Route detail retained separately | `s122-03`–`s122-04` and `second-witness/route-detail.json`; these source-specific statements are preserved without expanding the canonical reader set or collapsing the distinct routes. |

The checked p. 122 batch has ten reading items and four tracked entries,
zero verifier errors or coverage gaps, nine agreeing anchors, and one weak
anchor on the explicitly located 34:3 form. It adds 25 claims and one new
position at 34:3. The rebuilt index reports 2,065 positions and 7,321 claims
across 103 suras; the rules layer remains at 164 rules and 304 claims.
At-Taysīr contributes 1,362 farsh claims and 38 rule claims, plus one
permitted report. Pages 123–228 and pp. 16–71 remain to be audited.


## Volume 1, p. 123 — Yūnus readings, stopping reports, and yāʾ list

**Page status: eight located reading items incorporated; two bare pointers, one route-specific stopping passage, and the general rasm/waqf rule tracked separately.** The page closes the `وما يعزب` item begun on p. 122, then gives Yūnus readings and announces five yāʾ loci whose list continues onto p. 124.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 10:61 `ولا أصغر من ذلك ولا أكبر` | Incorporated | `farsh/taysir/batch-5527-p123.checked.json`, `d123-01`; Ḥamza reads rafʿ rāʾ in both words; the remainder fatḥ. |
| 10:81 `به ءالسحر` | Incorporated | `d123-02`; the interrogative with madd and the statement without madd are preserved with the source's Abū ʿAmr assignment. |
| 10:89 `ولا تتبعان` | Incorporated | `d123-03`; Ibn Dhakwān lightens the nūn; the remainder doubles it. The source separately states that the tāʾ is doubled without disagreement, including Ḥamza and al-Kisāʾī. |
| 10:90 `ءامنت به` | Incorporated | `d123-04` maps to the second occurrence at 10:90, not the separate `آمنت إنه` position; Ḥamza and al-Kisāʾī have kasr hamza, the remainder fatḥ. |
| 10:100 `ونجعل الرجس`; 10:103 `ننج المؤمنين` | Incorporated | `d123-05`–`d123-06`; Abū Bakr (Shuʿba) reads with nūn at 10:100; Ḥafṣ and al-Kisāʾī read the 10:103 form lightly. The source's following waqf statement is kept separate. |
| 10:15 `لي أن أبدله`; `إني أخاف` | Incorporated across pp. 123–124 | `d123-07`–`d123-08`; the source's five-yāʾ list is recorded locus by locus. Both forms are attributed to the al-Ḥaramiyyān and Abū ʿAmr; the latter's name is on p. 124 and checked as cross-page context. |
| `/بكل سحر/ قد ذكر أبو عمرو`; `{ليضلوا} قد ذكر ابن ذكوان` | Out of scope | `s123-01`–`s123-02`; bare cross-references without forms on this page. |
| 10:87 `أن تبوءا` stopping reports | Route detail retained separately | `s123-03` and `second-witness/route-detail.json`; two named routes disagree on stopping with yāʾ versus hamza. Al-Dānī explicitly states his own reading and preference for the hamza route; neither report is generalized to a canonical transmitter. |
| General stop/rasm clause and five-yāʾ list | Rule passage accounted for; finite loci incorporated | `s123-04`, the route-detail record, and `d123-07`–`d124-03`; the rule follows the rasm except where a transmitted yāʾ is specified. `وشبهه` is not expanded into further loci. |

The checked p. 123 batch has eight reading items and four tracked passages,
zero verifier errors or coverage gaps, and eight agreeing anchors. It records
14 claims and adds the 10:15 `لي أن أبدله` position. The route-specific
stopping reports and the general waqf/rasm rule remain distinct from canonical
reader claims.


## Volume 1, p. 124 — completion of the Yūnus yāʾ list and opening Hūd readings

**Page status: ten located reading items incorporated; two bare-pointer groups recorded out of scope.** This page completes the five explicitly counted Yūnus yāʾ positions, then changes to Sūrat Hūd. At-Taysīr's order is preserved: reader names at the end of a completed entry can introduce the following lemma, and the five yāʾs remain separate verse-level records.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 10:15 `نفسي إن أتبع`; 10:53 `وربي إنه لحق`; 10:72 `إن أجري إلا على الله` | Incorporated as the remaining three of five listed yāʾ loci | `farsh/taysir/batch-5527-p124.checked.json`, `d124-01`–`d124-03`; Nāfiʿ and Abū ʿAmr are named for the first two; Nāfiʿ, Ibn ʿĀmir, Abū ʿAmr, and Ḥafṣ for the fifth. The 10:72 location follows the source's list order before the explicit Hūd heading. |
| 11:25 `إني لكم نذير` | Incorporated | `d124-04`; Ibn Kathīr, Abū ʿAmr, and al-Kisāʾī read with fatḥ hamza; the remainder kasr. The exact phrase identifies 11:25; 11:2 contains intervening `منه`. |
| 11:27 `بادىء الرأى` | Incorporated | `d124-05`; Abū ʿAmr reads with hamza after dāl, the remainder with open yāʾ. |
| 11:28 `فعميت عليكم` | Incorporated | `d124-06`; Ḥafṣ, Ḥamza, and al-Kisāʾī have ḍamm ʿayn and doubled mīm; the remainder fatḥ and light mīm. |
| 11:40 and 23:27 `من كل زوجين اثنين` | Incorporated at both named locations | `d124-07`–`d124-08`; the source names Ḥafṣ for tanwīn on lām and the remainder without tanwīn. The Muʾminūn cross-reference is mapped to 23:27. |
| 11:41 `مجراها` | Incorporated | `d124-09`; Ḥafṣ, Ḥamza, and al-Kisāʾī read with fatḥ mīm; the remainder ḍamm. The source's earlier imāla reference is not expanded into an additional rāʾ form. |
| 11:42 `يا بني اركب` | Incorporated with weak token anchor | `d124-10`; ʿĀṣim reads with fatḥ yāʾ, the remainder kasr. The source's explicit verse and lemma are retained despite the weak Cairo token match. |
| `{الر}`; `{إلا سحر}`; `{اركب معنا}`; `{وقيل}`; `{وغيض}`; `{من إله غيره}` | Out of scope | `s124-01`–`s124-02`; the source marks these as earlier mentions but supplies no form or new attribution here. |

The checked p. 124 batch has ten reading items and two tracked pointer groups,
zero verifier errors or coverage gaps, nine agreeing anchors, and one weak
anchor at 11:42. It adds 17 claims and two positions: 10:15 `نفسي إن أتبع`
and 23:27 `من كل زوجين اثنين`.


## Volume 1, p. 125 — Hūd readings and cross-sūra loci

**Page status: seventeen reading items incorporated; no skipped passages.** The page continues Hūd, gives explicit cross-sūra occurrences for `ثمود`, `قال سلم`, and the sīn-ishmām forms, and includes two wherever-scope hamza items. Distinct word loci within 11:46 are kept separate.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 11:46 `إنه عمل`; `غير صالح` | Incorporated as separate word-level assertions | `farsh/taysir/batch-5527-p125.checked.json`, `d125-01` and `d125-17`; al-Kisāʾī's kasr mīm/fatḥ lām and the distinct naṣb rāʾ at `غير صالح` are not collapsed; the source's remainder forms are retained. |
| 11:46 `فلا تسئلن` | Incorporated with three forms | `d125-02`; the source names Nāfiʿ and Ibn ʿĀmir for fatḥ lām with doubled nūn, Ibn Kathīr's related form with fatḥ nūn, and the remainder with sukūn lām/light nūn. |
| 11:66 `ومن خزي يومئذ` | Incorporated | `d125-03`; Nāfiʿ and al-Kisāʾī read with fatḥ mīm; the remainder kasr. |
| 11:68, 25:38, and 29:38 `ثمود` | Incorporated at all three stated loci | `d125-04`–`d125-06`; Ḥafṣ and Ḥamza read with fatḥ dāl without tanwīn and stop without alif; the remainder tanwīn and substitute alif at waqf. |
| 11:68 `ألا بعدا لثمود` | Incorporated | `d125-07`; al-Kisāʾī reads kasr dāl with tanwīn; the remainder fatḥ without tanwīn. |
| 11:69 and 51:25 `قال سلم` | Incorporated at both named loci | `d125-08`–`d125-09`; Ḥamza and al-Kisāʾī read kasr sīn and sukūn lām; the remainder fatḥ both with a following alif. |
| 11:71 `يعقوب قالت` | Incorporated with weak token anchor | `d125-10`; Ibn ʿĀmir, Ḥamza, and Ḥafṣ read the bāʾ with naṣb; the remainder rafʿ. The source wording and weak anchor are preserved. |
| 11:77 `سيء بهم`; 29:33 `سيء بهم`; 67:27 `سيئت` | Incorporated at all three stated loci | `d125-11`–`d125-13`; Nāfiʿ, Ibn ʿĀmir, and al-Kisāʾī read with ishām of ḍamm on sīn; the remainder with pure kasr. The source's al-ʿAnkabūt and al-Mulk references are mapped individually. |
| 11:81 `فأسره`; wherever `أن أسر` | Incorporated with wherever scope | `d125-14`–`d125-15`; the al-Ḥaramiyyān use waṣl of the hamza-alif; the remainder qaṭʿ. The wherever scope for `أن أسر` is retained without expanding an inferred occurrence list. |
| 11:81 `إلا امرأتك` | Incorporated | `d125-16`; Ibn Kathīr and Abū ʿAmr read rafʿ; the remainder naṣb. |

At the p. 125 checkpoint, that batch had 17 reading items and no skipped
passages, zero verifier errors or coverage gaps, 16 agreeing anchors, and one
weak anchor at 11:71. It added 35 claims and six positions. The generated
counts at that checkpoint were 2,075 positions and 7,387 claims across 103
suras, with 1,416 at-Taysīr farsh claims. The later p. 126–127 updates are
recorded below; pp. 128–228 and pp. 16–71 remain to be audited.


## Volume 1, p. 126 — Hūd close and the eighteen yāʾ positions

**Page status: twenty-three reading items incorporated; one pointer passage recorded out of scope.** The page finishes Hūd, names an explicit three-locus `لما` family, and begins a counted list of eighteen yāʾ positions that continues onto p. 127. Each listed yāʾ locus is preserved separately.

| Passage | Status | Record / reason |
| --- | --- | --- |
| `{أصلاتك}`; `على مكاناتكم` | Out of scope as bare pointers | `s126-01`; the source says these were already mentioned and supplies no new reading form. |
| 11:108 `سعدوا` | Incorporated | `d126-01`; Ḥafṣ, Ḥamza, and al-Kisāʾī have ḍamm sīn; the remainder fatḥ. |
| 11:111 `وإن كلا` | Incorporated | `d126-02`; al-Ḥaramiyyān and Abū Bakr have sukūn nūn; the remainder has doubled nūn. The exact verse is 11:111. |
| 11:111 `لما ليوفينهم`; 36:32 `لما جميع`; 86:4 `لما عليها` | Incorporated at all three named loci | `d126-03`–`d126-05`; ʿĀṣim, Ibn ʿĀmir, and Ḥamza have doubled mīm; the remainder lightens it. The three positions remain distinct. |
| 11:123 `وإليه يرجع`; `عما يعملون` at 11:123 and 27:93 | Incorporated | `d126-06`–`d126-08`; source reader groups and the al-Naml cross-reference are preserved. |
| First fifteen of the eighteen yāʾ loci: 11:3, 11:84, 11:46, 11:47, 11:26, 11:89, 11:10, 11:34, 11:31, 11:78, 11:29, 11:84, 11:29, 11:51, and 11:51 | Incorporated as separate positions | `d126-09`–`d126-23`; the source's successive groups (`فتح الستة`, `فتح الأربعة`, `فتحهما`, and the single final form) are attached to their own listed loci. The printed `شقاق آن` wording is retained as evidence. The final `فطرني أفلا` attribution continues onto p. 127. |

The checked p. 126 batch has 23 reading items and one skipped pointer, zero
verifier errors or coverage gaps, and 23 agreeing anchors. It adds 31 claims;
the cross-sūra `عما يعملون` reading is also recorded at 27:93.


## Volume 1, pp. 127–128 — yāʾ-list completion, deleted yāʾs, and opening Yūsuf

**Page status: thirteen reading items incorporated; two passages recorded out of scope with reasons.** The p. 127 batch includes the three remaining members of the eighteen-item yāʾ list, the chapter's three deleted-yāʾ statements, and the first Yūsuf readings. The final consensus explanation runs onto p. 128 and is tracked with its full page span.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Final three yāʾ loci: 11:54 `إني أشهد الله`; 11:88 `وما توفيقي إلا بالله`; 11:92 `أرهطي أعز` | Incorporated | `d127-01`–`d127-03`; the names continuing after the p. 126 page break are attached to the correct counted entries. |
| 11:46 `فلا تسئلن`; 11:78 `ولا تخزون`; 11:105 `يوم يأت` | Incorporated as deleted-yāʾ assertions | `d127-04`–`d127-06`; waṣl retention is kept distinct from Ibn Kathīr's retention in both waṣl and waqf at 11:105. These claims supplement the separate p. 125 inflectional reading at 11:46. |
| 12:4 `يا أبت` | Incorporated with wherever scope | `d127-07`; Ibn ʿĀmir has fatḥ tāʾ wherever it occurs; the remainder kasr. The source's Ibn Kathīr/Ibn ʿĀmir waqf form with hāʾ is a separate item, `d127-08`. |
| 12:5 and 37:102 `يا بني` | Incorporated at both named loci | `d127-09`–`d127-10`; Ḥafṣ has fatḥ yāʾ; the remainder kasr. Both token anchors are weak because the same phrase recurs within each sūra; the explicit source locators are retained. |
| 12:7 `ءايت للسائلين` | Incorporated | `d127-11`; Ibn Kathīr reads the singular and the remainder the plural. Source spelling is retained. |
| 12:10 and 12:15 `غيابات الجب` | Incorporated at both explicitly counted occurrences | `d127-12`–`d127-13`; Nāfiʿ reads the plural in both, and the remainder the singular. The explicit “in both occurrences” wording and the matching Yūsuf locus support 12:15; its anchor agrees. |
| `وقد ذكر في باب الوقف` | Out of scope as a bare pointer | `s127-01`; the local waqf assertion about `يا أبه` is separately incorporated in `d127-08`. |
| 12:11 `مالك لا تأمنا` | Out of scope as a cross-reader variant; consensus/procedure passage audited | `s127-02`, cited across pp. 127–128. The source says all readers use idghām with ishām and explains its articulation; it asserts no inter-reader contrast, so it is not expanded into competing claims. |

The checked p. 127–128 batch has 13 reading items and two tracked out-of-scope
passages, zero verifier errors or coverage gaps, nine agreeing anchors, and
four weak Yūsuf anchors (12:4 twice, 12:5, and 37:102). It adds 20 claims.
The rebuild after pp. 126–127 reports 2,078 positions and 7,438 claims across
103 suras; at-Taysīr contributes 1,467 farsh claims. Pages 128–228 and pp.
16–71 still require audit.


## Volume 1, p. 128 — layered Yūsuf readings

**Page status: eight reading items incorporated; one source-specific anchor is weak.** The page contains multiple forms at 12:12, route and phonetic qualifications at 12:13 and 12:19, four forms at `هيت لك`, a wherever-scope `المخلصين` statement, and the two `حاش لله` loci. The latter's transmission and remainder continue onto p. 129 and are cited as a page-spanning item.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 12:12 `يرتع ويلعب` | Incorporated | `d128-01`; the Kūfiyyūn and Nāfiʿ have yāʾ in both verbs; the remainder has nūn. |
| 12:12 `يرتع` | Incorporated as a distinct vowel assertion | `d128-02`; al-Ḥaramiyyān kasr the ʿayn; the remainder has jazm. The at-Taysīr distribution is retained even though Taḥbīr's position distinguishes Warsh alone. |
| 12:13 `الذئب` | Incorporated | `d128-03`; Warsh, al-Kisāʾī, and Abū ʿAmr read without hamza when lightening; the remainder with hamza in both states. Ḥamza's explicit waqf-uṣūl qualification is separately retained in route detail. |
| 12:19 `يا بشرى` | Incorporated with weak anchor | `d128-04`; the Kūfiyyūn's `فعلى` form and the remainder's alif-after-rāʾ/open-yāʾ form are recorded. A route-detail record preserves Ḥamza/al-Kisāʾī's rāʾ imāla, Warsh's between-the-two form, pure fatḥ, and the source's performance and al-Sūsī/al-Yazīdī references. |
| 12:23 `هيت لك` | Incorporated with four forms | `d128-05`; Nāfiʿ/Ibn Dhakwān, Hishām, Ibn Kathīr, and the remainder keep their separate source forms. Hishām's reported ḍamm tāʾ is retained as a report, not substituted for his stated hamz reading. |
| 12:24 `المخلصين` | Incorporated with wherever scope | `d128-06`; the Kūfiyyūn and Nāfiʿ fatḥ the lām when the word begins with alif-lām; the remainder kasr. |
| 12:31 and 12:51 `حاش لله` | Incorporated at both named loci | `d128-07`–`d128-08`; Abū ʿAmr has the alif in waṣl and deletes it at waqf in accordance with the rasm; the p. 129 remainder is without alif in both states. Five route-detail records preserve the Hamza/Hishām qualifications, the `يا بشرى` performance report, and both al-Yazīdī chain loci. |

The checked p. 128–129 batch has eight reading items, zero skipped passages,
zero verifier errors or coverage gaps, seven agreeing anchors, and one weak
anchor at 12:19. It adds 18 claims. The route-detail evidence for all five
new records was checked against the cited Shamela page window. At the p. 128
checkpoint, the index reported 2,078 positions and 7,456 claims across 103
suras, with 1,485 at-Taysīr farsh claims. The remaining p. 129 material is
recorded below; pp. 130–228 and pp. 16–71 still require audit.


## Volume 1, p. 129 — Yūsuf readings and the al-Bazzī route list

**Page status: eleven reading items incorporated; one bare pointer recorded out of scope.** The page continues the `حاش لله` route chain from p. 128, then gives seven local Yūsuf contrasts and a five-token al-Bazzī report spanning four verse features. The source's named transmitters and route are retained independently of the matching Taḥbīr forms.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 12:47 `دأبا` | Incorporated | `d129-01`; Ḥafṣ has a moving hamza; the remainder has sukūn. |
| 12:49 `وفيه تعصرون` | Incorporated | `d129-02`; Ḥamza and al-Kisāʾī have tāʾ; the remainder yāʾ. |
| 12:53 `بالسو الا` | Incorporated with two named groups; remainder qualified separately | `d129-03`; Qālūn and al-Bazzī have the connected wāw/hamza form, Warsh and Qunbul follow their own rule for the two kasra hamzas, and the source says the remainder follows its own uṣūl. The latter is retained in route detail rather than flattened into one reading form. |
| 12:56 `حيث نشاء`; 12:62 `وقال لفتيانه`; 12:63 `اخانا يكتل`; 12:64 `خير حافظا` | Incorporated | `d129-04`–`d129-07`; Ibn Kathīr's nūn, the Ḥamza/al-Kisāʾī forms, and the Ḥafṣ/Ḥamza/al-Kisāʾī form remain separately attributed. |
| 12:80 `فلما استايسوا منه`; 12:87 `لا تايسوا ... إنه لا يايس`; 12:110 `حتى إذا استايس الرسل`; 13:31 `أفلم يايس الذين آمنوا` | Incorporated as the source's five-token al-Bazzī report | `d129-08`–`d129-11`; 12:87's one project feature covers two of the five explicitly named tokens. Each verse feature receives an al-Bazzī claim; route detail preserves his chain through Abū Rabīʿa and al-Naqqāsh, as heard by al-Dānī from Ibn Khuwāstī al-Fārisī. |
| 12:76 `نرفع درجات` | Out of scope as a bare pointer | `s129-01`; `قد ذكر` supplies no new form or attribution on this page. |

The checked p. 129 batch has eleven reading items and one skipped pointer,
zero verifier errors or coverage gaps, and eleven agreeing anchors. It adds
24 generated claims. All five newly added route-detail records were checked
against p. 129. The rebuilt index reports 2,078 positions and 7,474 claims
across 103 suras; at-Taysīr contributes 1,505 farsh claims. Pages 134–228
and pp. 16–71 remain to be audited.


## Volume 1, pp. 130–131 — counted Yūsuf yāʾ list and opening ar-Raʿd readings

**Page status: p. 130 local readings and the complete 22-yāʾ list incorporated; p. 131 has five local reading assertions incorporated, one bare pointer out of scope, one route report preserved separately, and the paired-interrogative rule continued as pending through p. 133.** At-Taysīr's counted list is grouped by attribution and crosses the page break. Each listed locus is its own item, including the two occurrences of `إني أراني`; only the yāʾ of `لي` is meant at 12:80.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 12:13 `ليحزنني أن` | Incorporated | `d130-22y-01`; the Ḥaramiyyān. |
| 12:23, 12:36 (two loci), 12:43, 12:69, 12:80, 12:96 | Incorporated as seven counted loci | `d130-22y-02`–`d130-22y-08`; the Ḥaramiyyān and Abū ʿAmr. |
| 12:36 (two occurrences), 12:37, 12:53 (two loci), 12:80, 12:98, 12:100 | Incorporated as eight counted loci | `d130-22y-09`–`d130-22y-16`; Nāfiʿ and Abū ʿAmr. The source explicitly identifies the yāʾ of `لي` at 12:80. |
| 12:38 `آبائي إبراهيم`; 12:46 `لعلي أرجع`; 12:59 `أني أوفي الكيل`; 12:108 `سبيلي أدعو`; 12:86 `وحزني إلى الله`; 12:100 `وبين إخوتي إن` | Incorporated as the final six loci | `d130-22y-17`–`d130-22y-22`; Kūfiyyūn sukūn at the first two, Nāfiʿ fatḥ at 12:59 and 12:108, Nāfiʿ/Ibn ʿĀmir/Abū ʿAmr at 12:86, and Warsh at 12:100. 12:38 creates a new anchored project feature. |
| 12:90 `إنك لأنت`; 12:109, 16:43, 21:7 `نوحي إليهم`; 12:109 `أفلا تعقلون`; 12:110 `قد كذبوا` and `فنجي من نشاء` | Incorporated | `d130-01`–`d130-07`; all seven local items pass the source-page verifier. The three `نوحي` loci remain separate and the named Hamza/al-Kisāʾī imāla detail is in route detail. |
| 12:66 `تؤتون موثقا`; 12:90 `إنه من يتق` | Incorporated | `d131-01`–`d131-02`; distinguishes Ibn Kathīr's both-state retention from Abū ʿAmr's waṣl retention, and Qunbul's both-state retention from the remainder's deletion. |
| 13:4 `وزرع ونخيل صنوان وغير`; `يسقى بماء`; `/ويفصل بعضها/` | Incorporated | `d131-03`–`d131-05`; retains each reader group and the source's stated forms. The final locator anchor is weak because its source wording differs from the Cairo-token form; its source feature link is retained for review. |
| 12:12 `/يرتعى/` | Preserved in route detail | The two named Qunbul reporter routes retain the extra yāʾ in both states; other routes from Qunbul delete it in both. The claims layer is not flattened to one Qunbul form. |
| `/يغشى اليل/ قد ذكرت` | Out of scope as a bare pointer | `s131-01`; this page gives no new form or attribution. |
| Paired interrogatives, eleven loci | Pending rule-layer review | `s131-02` and `s133-03`; the general rule begins on p. 131 and continues on pp. 132–133. It is not a local farsh item. |

The checked page-spanning 22-yāʾ batch has 22 items, zero errors or gaps, and 22 agreeing anchors. The p. 131 batch has five items and two tracked passages, zero errors or coverage gaps, four agreeing anchors, and one weak anchor. Together these batches add 32 claims and one new position. The rebuilt index reports 2,081 positions and 7,524 claims across 103 suras; at-Taysīr contributes 1,558 farsh claims. The paired-interrogative passage and remaining source pages still require audit.


## Volume 1, p. 133 — route rule continuation and ar-Raʿd / an-Naḥl readings

**Page status: eight reading items incorporated, one source wording issue preserved for review, one bare pointer out of scope, and the paired-interrogative rule continuation explicitly tracked.** The first portion completes the reader-specific paired-hamza rule begun on pp. 131–132; it remains pending as one general rule until all eleven loci and source exceptions can be mapped. The local p. 133 statements are separated below.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 13:7 `هاد`; 13:11 `وال`; 13:34 `واق`; 16:96 `باق` | Incorporated at four named loci with wherever scope | `d133-01`–`d133-04`; Ibn Kathīr has tanwīn in waṣl and yāʾ at waqf; the remainder has tanwīn in waṣl and no yāʾ at waqf. |
| 13:16 `/أم هل يستوي/` | Incorporated | `d133-05`; Abū Bakr, Ḥamza, and al-Kisāʾī read with yāʾ; the remainder with tāʾ. The source locator anchor is weak because its cited wording differs from the Cairo form; it merges into the existing 13:16 feature. |
| 13:17 `ومما يوقدون` | Incorporated | `d133-06`; Ḥafṣ, Ḥamza, and al-Kisāʾī read with yāʾ; the remainder with tāʾ. |
| 13:33 `وصدوا عن السبيل`; 40:37 `وصد عن السبيل` | Incorporated at both named loci | `d133-07`–`d133-08`; the Kūfiyyūn read with ḍamm ṣād in both, the remainder with fatḥ in both. The existing feature also retains Yaʿqūb from Taḥbīr, while the at-Taysīr claim names only its own group. |
| 13:31 `/أفلم يايس/` | Unresolved wording, preserved in route detail | `s133-01`; p. 133 literally says `بفتح الباء من غير همز`, while p. 129 already records al-Bazzī's five-token reading as `بالألف وفتح الياء من غير همز`. No second canonical form is inferred. |
| `{أكلها} قد ذكر` | Out of scope as a bare pointer | `s133-02`; no new form or reader attribution appears here. |
| Paired interrogatives, eleven loci | Pending rule-layer review | `s133-03` tracks the p. 133 continuation. Preserve its reader-specific deviations and exceptions when the complete eleven positions are mapped. |

The p. 133 batch has eight items and three tracked passages, zero verifier errors or coverage gaps, seven agreeing anchors, and one weak anchor. The rebuilt index reports 2,081 positions and 7,540 claims; at-Taysīr contributes 1,574 farsh claims. Remaining material includes the continued paired-interrogative rule, p. 134 onward, and uṣūl pp. 16–71.


## Volume 1, p. 134 — end of ar-Raʿd and Ibrahim readings

**Page status: eleven reading items incorporated; one bare-pointer passage is explicitly tracked.** The page begins by finishing the ar-Raʿd lemmas, then changes to Ibrahim. The source’s trailing reader names after one completed lemma are parsed as introducing the next lemma where the braced locator confirms that structure.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 13:39 `ويثبت وعنده` | Incorporated | `d134-01`; Ibn Kathīr, ʿĀṣim, and Abū ʿAmr read it lightened; the remainder doubled. |
| 13:42 `/وسيعلم الكفر/` | Incorporated | `d134-02`; the Kūfiyyūn and Ibn ʿĀmir read the plural; the remainder the singular. It supplements the existing project feature. |
| 13:9 `الكبير المتعال` | Incorporated | `d134-03`; Ibn Kathīr retains the yāʾ in both states; the remainder deletes it in both. |
| 14:2 `الله` in source locator `{الحميد الله}` | Incorporated | `d134-04`; Nāfiʿ and Ibn ʿĀmir read with rafʿ of the final hāʾ; the remainder with jarr. The locator spans the 14:1–14:2 boundary; it supplements the existing 14:2 feature, preserving this book’s Nāfiʿ/Ibn ʿĀmir and remainder attributions. |
| 14:19 `خالق السموات والأرض`; 24:45 `خالق كل دابة` | Incorporated at both source-named loci | `d134-11` and `d134-05`; Ḥamza and al-Kisāʾī have the alif/rafʿ-qāf form; the remainder has the `خلق` form with naṣb. The Ibrahim phrase matches the existing 14:19 feature; the an-Nūr form is 24:45. |
| 14:22 `بمصرخي إني` | Incorporated with source qualification | `d134-06`; Ḥamza has kasr yāʾ; the remainder fatḥ. The source separately says al-Farrāʾ and Quṭrub cite the language and Abū ʿAmr permits it; those names are not added as readers. |
| 14:30; 22:9; 31:6; 39:8 `ليضلوا/ليضل` | Incorporated at four explicit loci | `d134-07`–`d134-10`; Ibn Kathīr and Abū ʿAmr fatḥ the yāʾ; the remainder ḍamm. `هنا` resolves to 14:30 within the Ibrahim section. |
| `{رسلهم} و{سبلنا} و{الريح} قد ذكر` | Out of scope as bare pointers | `s134-01`; these supply no new form or attribution here. |

The checked p. 134 batch has eleven items and one tracked bare pointer, zero verifier errors or coverage gaps, and eleven agreeing anchors. It contributes 22 claims and no new positions; all assertions supplement existing features. The remaining paired-interrogative rule and source pages continue to require audit.


## Volume 1, p. 135 — Ibrahim yāʾ lists and opening al-Ḥijr readings

**Page status: ten reading items incorporated, one bare pointer out of scope, and a teacher-route report preserved separately.** At-Taysīr marks a three-locus yāʾ list and a separate set of three deleted-yāʾ loci; both are split into individual claims with the source's distinct waṣl/waqf states. The page then opens al-Ḥijr with two reading statements.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 14:37 `أفئيدة من الناس` | Incorporated with route detail | `d135-01`; Hishām reads with yāʾ after hamza. The source says this was al-Dānī's reading to Abū al-Fatḥ and that al-Ḥulwānī explicitly transmits it from Hishām; the teacher-route corroboration is separately recorded. |
| 14:46 `لتزول منه` | Incorporated | `d135-02`; al-Kisāʾī has fatḥ of the first lām and rafʿ of the second; the remainder kasr/nasb. |
| 14:22 `وما كان لي`; 14:31 `قل لعبادي الذين`; 14:37 `إني أسكنت` | Incorporated as three counted yāʾ loci | `d135-03`–`d135-05`; respectively Ḥafṣ fatḥ, Ibn ʿĀmir/Ḥamza/al-Kisāʾī sukūn, and the Ḥaramiyyān plus Abū ʿAmr fatḥ. |
| 14:14 `وخاف وعيد`; 14:22 `بما أشركتمون`; 14:40 `وتقبل دعاء` | Incorporated as three deleted-yāʾ loci | `d135-06`–`d135-08`; Warsh in waṣl; Abū ʿAmr in waṣl; and al-Bazzī in both states plus Warsh/Abū ʿAmr/Ḥamza in waṣl. |
| 15:2 `ربما` | Incorporated | `d135-09`; Nāfiʿ and ʿĀṣim light bāʾ; the remainder shaddah. The at-Taysīr claim supplements without adding Abū Jaʿfar from Taḥbīr. |
| 15:8 `ما نزل` / `{الملائكة}` | Incorporated as three distinct forms | `d135-10`; Ḥafṣ/Ḥamza/al-Kisāʾī have the two-nūn form with naṣb; Abū Bakr the tāʾ form with rafʿ; the remainder matches that form except for fatḥ tāʾ. The source's shorter locator is retained, with a weak anchor note to the existing 15:8 feature. |
| 14:31 `{لا بيع فيه ولا خلال} قد ذكر` | Out of scope as a bare pointer | `s135-01`; the following Hishām attribution belongs with `أفئيدة من الناس` and is documented there. |

The checked p. 135 batch has ten items and one pointer, zero verifier errors or coverage gaps, nine agreeing anchors, and one weak source-lemma anchor retained for review. The rebuilt index reports 2,081 positions and 7,578 claims; at-Taysīr contributes 1,612 farsh claims. Remaining material includes the paired-interrogative rule, p. 136 onward, and uṣūl pp. 16–71.

## Volume 1, p. 136 — al-Ḥijr readings and counted yāʾs

**Page status: twelve source items incorporated or linked, two bare pointers out of scope, one reader attribution unresolved, and one cross-reference anchor retained as weak.** The source resumes the contextual-name pattern: reader names immediately before a new lemma introduce that lemma. The entry for `{وعيون}` is explicitly general (`حيث وقع`) and stays marked `wherever`; the source’s cited Hijr occurrence anchors the existing feature. The counted-yāʾ statement gives two yāʾs in the 15:49 phrase, one in 15:89, and a fourth in 15:71.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 15:15 `إنما سكرت` | Incorporated | `d136-01`; Ibn Kathīr lightens the kāf; the remainder doubles it. |
| `{وعيون}` / `{العيون}` | Incorporated with global scope | `d136-02` supplements the 15:45 feature. Nāfiʿ, Abū ʿAmr, Ḥafṣ, and Hishām read ḍamm of the ʿayn; the remainder kasr. The source says “wherever it occurs.” |
| 15:54 `فبم تبشرون` | Partially incorporated; attribution unresolved | `d136-03` records Ibn Kathīr’s explicitly named doubled-nūn form. The source also states a light-nūn form and fatḥ for “the remainder” but does not identify the light-form readers; that assignment remains unresolved rather than inferred. |
| 15:56 `من يقنط`; 30:36 `يقنطون`; 39:53 `لا تقنطوا` | Incorporated at all three named locations | `d136-04a`–`d136-04c`; Abū ʿAmr and al-Kisāʾī kasr the nūn at all three; the remainder fatḥ. |
| 15:59 `إنا لمنجوهم` | Incorporated | `d136-05`; Ḥamza and al-Kisāʾī lighten the jīm; the remainder doubles it. |
| 15:60 `قدرنا إنها`; 27:57 an-Naml occurrence | Incorporated at both source-named locations | `d136-06a` and `d136-06b`; Abū Bakr lightens the dāl; the remainder doubles it. The an-Naml item keeps the source’s cross-reference while using the located Quran token `قدرنا` as its lemma; its source anchor is weak because the source gives the 15:60 locator and says “in an-Naml” rather than repeating the local word. |
| 15:49 `عبادي أني أنا`; 15:89 `إني أنا النذير`; 15:71 `بناتي إن كنتم` | Incorporated as the source’s four-yāʾ count | `d136-07`–`d136-09`; the Ḥaramiyyān and Abū ʿAmr fatḥ the first two yāʾs in the 15:49 phrase and the 15:89 phrase; Nāfiʿ fatḥs the 15:71 yāʾ. |
| `/الريح لواقح/`, `{جزء}`, `{المخلصين}`, `{فأسر}`; `{إنا نبشرك}` | Out of scope as bare pointers | `s136-01` and `s136-02`; these say the readings were treated previously and give no new local form or attribution. |

The checked p. 136 batch has twelve items and two skips, zero errors or coverage gaps, eleven agreeing anchors, and one weak cross-reference anchor for the an-Naml occurrence. Pp. 131–133’s paired-interrogative rule is separately source-attributed and merged into the existing rule feature by batch-5527-paired-interrogative.json; this source gives an eleven-place total and examples but does not list every verse.


### Rule-layer update after pp. 131–133 review

The paired-interrogative passage is incorporated in checked batch `batch-5527-paired-interrogative.json` and merged into the existing rule feature `ru420-05` rather than duplicated. The source has four reader groupings (Nāfiʿ/al-Kisāʾī, Ibn Kathīr/Abū ʿAmr, ʿĀṣim/Ḥamza, and Ibn ʿĀmir), with Qālūn, Ḥafṣ, Hishām, and Ibn Dhakwān distinctions and named exceptions retained in the note. At-Taysīr says there are eleven positions and gives examples, but does not enumerate every verse; therefore the source claim stays at rule scope and no verse list is assigned to this book. The generated rules layer reports 164 rules, 38 chapters, and 308 claims.


## Volume 1, pp. 137–138 — closing an-Nahl readings

**Page status: 21 items incorporated or linked, seven passages tracked, zero source-text coverage gaps; two reader-attribution issues and one rest-form mapping remain unresolved.** The reading lists continue to interleave reader names before the next lemma, so attribution follows the local wording and the book’s established contextual-name convention.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 16:11 `ننبت لكم` | Incorporated | `d137-01`; Shuʿba (Abū Bakr) reads with nūn; the remainder with yāʾ. |
| 16:12 `والشمس` and `والنجوم مسخرات` | Incorporated at both indexed features | `d137-02a`–`d137-02b`; the source names Ibn ʿĀmir’s four-member phrase and contrasts it with the remainder’s naṣb of the word ending. Its phrase does not explicitly use the word rafʿ, so the source description is retained literally. |
| 16:20 `والذين يدعون` | Incorporated | `d137-03`; ʿĀṣim reads with yāʾ; the remainder with tāʾ. |
| 16:27 `أين شركاي الذين`; `تشاقون فيهم` | Incorporated | `d137-04`–`d137-05`; the source marks al-Bazzī’s no-hamza form as disputed, and Nāfiʿ reads the nūn of `تشاقون` with kasr. |
| 16:28 and 16:32 `الذين توفاهم` | Incorporated at both local occurrences | `d137-06a`–`d137-06b`; Ḥamza reads with yāʾ; the remainder with tāʾ. The printed locator says “in both places, here and in…” and breaks off; the two matching occurrences in this an-Naḥl passage are used, with the incomplete wording noted. |
| 16:37 `لا يهدي من` | Incorporated | `d137-07`; al-Kūfiyyūn as defined by at-Taysīr read with fatḥ yāʾ and kasr dāl; the remainder with ḍamm yāʾ and fatḥ dāl. |
| 16:40 and 36:82 `فيكون` | Supplemented with a repeated source citation | `d137-08a`–`d137-08b`; Ibn ʿĀmir and al-Kisāʾī read with naṣb. The p. 76 at-Taysīr passage already records the same source-book remainder claim at both positions, so this repeated passage adds its exact citation and attribution without duplicating a second “remainder” claim. |
| 16:48 `أولم تروا إلى ما` | Incorporated | `d138-01`; Ḥamza and al-Kisāʾī read with tāʾ; the remainder with yāʾ. |
| 16:48 `تفيؤا ظلاله` | Incorporated | `d138-02`; Abū ʿAmr reads with tāʾ; the remainder with yāʾ. |
| 16:62 `مفرطون` | Partially incorporated | `d138-03`; Nāfiʿ reads with kasr rāʾ. The source says the remainder has fatḥ, but does not specify the shadda distinction required to map the remainder to one of the project’s separate values. |
| 16:66 and 23:21 `نسقيكم` | Incorporated at both named locations | `d138-04a`–`d138-04b`; Nāfiʿ, Ibn ʿĀmir, and Abū Bakr read with fatḥ nūn; the remainder with ḍamm. |
| 16:71 `تجحدون` | Incorporated | `d138-05`; Abū Bakr reads with tāʾ; the remainder with yāʾ. |
| 16:79 `ألم تروا إلى الطير` | Unresolved attribution | `s138-04`; the two forms are explicit, but the source does not unambiguously name their readers. |
| 16:80 `يوم ظعنكم` | Incorporated with at-Taysīr’s distinct attribution | `d138-07`; at-Taysīr assigns sukūn of ʿayn to al-Kūfiyyūn and Ibn ʿĀmir, and fatḥ to the remainder; this book-specific ascription is preserved separately from other compilations. |
| 16:96 `ولنجزين الذين` | Incorporated with a rejected report preserved | `d138-08`; Ibn Kathīr and ʿĀṣim read with nūn, the remainder with yāʾ. The source reports al-Naqqāsh’s nūn attribution to Ibn Dhakwān through al-Akhfash and explicitly rejects it, citing al-Akhfash’s book for yāʾ. |
| 16:103 `يلحدون` | Partially incorporated; first reader assignment unresolved | `d138-09`; the source’s remainder (ḍamm yāʾ / kasr ḥāʾ) is linked to the existing feature; the fatḥ yāʾ/ḥāʾ form is explicit, but its reader attribution is not safely attached to this lemma. |
| 16:110 `من بعد ما فتنوا` | Incorporated | `d138-10`; Ibn ʿĀmir reads with fatḥ fāʾ and tāʾ; the remainder with ḍamm fāʾ and kasr tāʾ. |
| `{عما يشركون}`, `{إلا أن تأتيهم الملائكة}`, `/يوحى اليهم/`, `{يعرشون}`, `{من بطون أمهاتكم}`, and `{القدس}` | Out of scope as bare pointers | `s137-01`–`s137-03`, `s138-01`–`s138-03`; no local reading form is supplied. |

The checked p. 137–138 batch has 21 items and seven tracked passages, zero verifier errors or coverage gaps, 18 agreeing anchors, two anchorless linked occurrences, and one weak anchor at 16:48. The rebuilt index reports 2,082 positions and 7,636 claims; at-Taysīr contributes 1,670 farsh claims and 42 rule claims. These totals remain a progress checkpoint, not proof that the compilation is exhausted.


## Volume 1, pp. 139–140 — start of al-Isra readings

**Page status: 22 items incorporated or supplemented, four passages tracked, zero verifier errors or coverage gaps; the reader group for five nūn forms remains unresolved.** This batch carries a cross-page lemma over pp. 139–140, follows the reader names in their local source context, and separates the source’s three forms for Af.

- 16:127 and 27:70, fi dayq: Ibn Kathir kasr of dad, remainder fath; items d139-01 and d139-02.
- 17:2, ala tattakhidhu: Abu Amr yāʾ, remainder tāʾ; d139-03.
- 17:7, lasu'u wujuhakum: Abu Bakr, Ibn Amir, and Hamza use yāʾ with hamza naṣb and singular; al-Kisai nūn with hamza naṣb and plural; the remainder yāʾ with a ḍamma hamza between two wāws and plural; d139-04.
- 17:13, yalqahu: Ibn Amir doubles it and ḍamm the yāʾ; the remainder lightens it and fatḥs the yāʾ; d139-05.
- {wa-yubashshir al-mu'minin}: bare pointer; s139-02.
- 17:23, imma yablughan: Hamza and al-Kisai kasr the nūn and add an alif before it; the remainder fatḥ without the alif. All agree on doubling the nūn; d139-06.
- 17:23, 21:67, and 46:17, Af: Nafi and Hafs tanwīn/casr fāʾ; Ibn Kathir and Ibn Amir fatḥ without tanwīn; the remainder kasr without tanwīn; d139-07-1 through d139-07-3.
- 17:31, kan khata'a: Ibn Kathir kasr khāʾ/fatḥ ṭāʾ with lengthening; Ibn Dhakwan fatḥs both without lengthening; the remainder kasr khāʾ and sukūn ṭāʾ. Evidence spans the page break; d139-08.
- 17:33, fala tusrif: Hamza and al-Kisai read with tāʾ; the remainder yāʾ; d140-01.
- 17:35 and 26:182, al-qistas: Hafs, Hamza, and al-Kisai kasr the qāf; the remainder ḍamm; d140-02 and d140-03.
- 17:38, kana sayyi'uhu: al-Kufiyyun and Ibn Amir ḍamm hamza/hāʾ in the masculine form; the remainder fatḥ both with tanwīn in the feminine form; d140-04.
- 17:41 and 25:50, li-yadhakkaru: Hamza and al-Kisai sukūn the dhāl and ḍamm the kāf in the light form; the remainder fatḥ and shadda; d140-05 and d140-06.
- 17:42, kama yaqulun: Ibn Kathir and Hafs yāʾ; the remainder tāʾ; d140-07.
- 17:43, amma taqulun: Hamza and al-Kisai tāʾ; the remainder yāʾ; d140-08.
- 17:44, yusabbihu lahu: the Haramiyyan, Ibn Amir, and Abu Bakr yāʾ; the remainder tāʾ; d140-09 has one weak source-text anchor.
- The interrogatives and zabura are bare pointers; s140-01.
- 17:64, wa-rajlika: Hafs kasr jīm; the remainder sukūn; d140-10.
- 17:68–69, the five forms an nakhsif, aw nursil, an nu'idakum, fa-nursil, and fa-nughriqakum: the nūn/yāʾ opposition and all five loci are explicit, but readers of the nūn form are not named; unresolved as s140-02.
- 17:72 and 20:124, a'ma: Abu Bakr, Hamza, and al-Kisai imāla both; Abu Amr imāla in the first only; Warsh between the two in both; the remainder fatḥ. The source says “in the two words”; 20:124 is entered as the second matching Quranic word; d140-11 and d140-12.
- The negative note “no yāʾs in this sura” is tracked as s139-01, not a variant.

The checked pp. 139–140 batch has 22 items and four tracked passages, zero errors or coverage gaps, 21 agreeing anchors and one weak anchor. The rebuilt index reports 2,083 positions and 7,689 claims; at-Taysir contributes 1,723 farsh claims and 42 rule claims. The compilation remains in progress.


## Volume 1, pp. 141–142 — closing al-Isrāʾ and beginning al-Kahf

**Page status: 19 source items incorporated or supplemented, three passages tracked, zero verifier errors or coverage gaps, and all 19 verse anchors agree.** The extraction follows at-Taysīr's seven-reader scope and its contextual placement of reader names before the next lemma. It adds 41 form assertions to existing features; it does not duplicate their readings.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 17:76 `خلافك` | Supplemented | `d141-01`; Ibn ʿĀmir, Ḥafṣ, Ḥamza, and al-Kisāʾī read with kasr khāʾ, fatḥ lām, and following alif; the remaining readers fatḥ khāʾ and sukūn lām. |
| 17:83 and 41:51 `ونا بجانبه` hamza placement | Supplemented at both explicit locations | `d141-02`–`d141-03`; Ibn Dhakwān alone is assigned hamza after alif in this source; its seven-reader remainder places it before alif. Abū Jaʿfar's different attribution in another compilation is not imported. |
| 17:83 and 41:51 imāla | Supplemented as separate source-specific claims | `d141-04`–`d141-05`; al-Kisāʾī and Khalaf (from Ḥamza, identified by the preface at p. 3) incline the nūn and hamza; Khallād inclines the hamza only; Warsh follows his rule for dhawāt al-yāʾ; the remainder has pure fatḥ. At 17:83, Abū Bakr/Shuʿba inclines the hamza; at 41:51, he has pure fatḥ. The source's report of the same hamza imāla from Abū Shuʿayb is retained as a permitted Sūsī claim, following the preface's identification of Abū Shuʿayb among Abū ʿAmr's transmitters. |
| 17:90 `حتى تفجر لنا` | Supplemented | `d141-06`; at-Taysīr's three-reader al-Kūfiyyūn read the light form; the remainder reads the doubled form. The source says there is no disagreement at its second referenced occurrence and supplies no second variant. |
| 17:92 `كسفا`; 17:93 `قال سبحان ربي`; 17:102 `لقد علمت` | Supplemented | `d141-07`–`d141-09`; respectively Nāfiʿ, ʿĀṣim, and Ibn ʿĀmir with fatḥ of sīn; Ibn Kathīr and Ibn ʿĀmir with the alif form; and al-Kisāʾī with ḍamm of tāʾ. Each source remainder is recorded separately. |
| 17:100 `رحمة ربي إذا` | Supplemented | `d141-10`; the counted yāʾ claim is located at 17:100, with fatḥ attributed to Nāfiʿ and Abū ʿAmr. |
| 17:62 `لئن أخرتن إلى` | Supplemented from a cross-page citation | `d141-11`; Ibn Kathīr establishes the yāʾ in both states; Nāfiʿ and Abū ʿAmr establish it in waṣl. The evidence spans pp. 141–142. |
| 18:17 `فهو المهتد` | Partially incorporated; one attribution unresolved | `d142-01`; Nāfiʿ's waṣl claim is added to the existing feature. The source's additional printed name `ابن عمرو` is retained as unresolved and is not silently normalized to Abū ʿAmr. |
| 18:1 `عوجا`; 36:52 `من مرقدنا`; 75:27 `راق`; 83:14 `ران` | Supplemented at all four cited locations | `d142-02`–`d142-05`; Ḥafṣ pauses without a break at each stated location; the remainder connects without sakt and assimilates nūn/lām into rāʾ. The p. 142 transcription prints `القيمة` in its 75:27 locator; the quoted `من ... راق` identifies the verse, and the printed wording is retained in evidence. |
| 18:2 `من لدنه` | Supplemented with a route detail | `d142-06`; Abū Bakr/Shuʿba's specialized form and the source remainder are recorded. Ibn Kathīr's connection with wāw is preserved in the note because the existing feature has only two phonetic values. |
| `{ويبشر المؤمنين} قد ذكر` | Out of scope as a bare pointer | `s142-02`; no new form is supplied. The names Nāfiʿ and Ibn ʿĀmir immediately before the next lemma are assigned to 18:16 `مرفقا`. |
| 18:16 `مرفقا`; 18:17 `تزور عن كهفهم` | Supplemented | `d142-07`–`d142-08`; Nāfiʿ and Ibn ʿĀmir read the first `مرفقا` form. For `تزور`, Ibn ʿĀmir reads sukūn zāy/doubled rāʾ, the source-defined three-reader al-Kūfiyyūn read fatḥ/light zāy with alif, and the remainder reads doubled zāy with alif. |
| `الوقف على {أياما} مذكور في بابه`; `{سورة الكهف}` | Out of scope | `s141-01` is a bare cross-reference to the waqf chapter; `s142-01` is the sura heading. |

The checked batch `farsh/taysir/batch-5527-p141-142.checked.json` records 19 items and three skips, with 41 form assertions and two permitted report assertions, zero errors/gaps, and 19 agreeing anchors. The full rebuild reports 2,083 positions and 7,732 indexed claims; the rules layer remains 164 rules, 38 chapters, and 308 claims. At-Taysīr's working farsh checkpoint increases to 1,766 claims and its rule checkpoint remains 42; the book is not exhausted.
## Volume 1, pp. 143–144 — al-Kahf

**Status: 25 reading items incorporated or linked, three bare pointers tracked, zero checker gaps.** Reader names that precede a lemma continue to govern that lemma under at-Taysīr’s source-specific ordering. The p. 3 preface is used to identify Abū ʿUmar as al-Dūrī from Abū ʿAmr; source group labels retain the seven-reader scheme.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 18:18 `ولملئت منهم`; 18:19 `بورقكم`; 18:26 `ولا تشرك`; 18:25 `ثلاث مائة سنين` | Incorporated | `d143-01`–`d143-04`; the source’s Ḥaramiyyān, Ibn ʿĀmir, Ḥamza/al-Kisāʾī, and Abū ʿUmar/Abū Bakr/Ḥamza assignments are retained. |
| 18:34 `وكان له ثمر`; 18:42 `وأحيط بثمره`; 18:36 `خيرا منها`; 18:38 `لاكنا هو الله` | Incorporated or supplemented | `d143-05`–`d143-08`; both fruit loci retain the same source’s three-form distinction; the source’s lemma spelling and reading distinction are preserved. |
| 18:43 `ولم يكن له`; 18:44 `هنالك الولاية`, `لله الحق`, `وخير عقبا` | Incorporated | `d143-09`–`d143-12`; `d143-09` is a source-explicit yāʾ reading against the Cairo text’s tāʾ form, retained at the named locus with a weak anchor note. |
| 18:47 `ويوم نسير`; 18:52 `ويوم نقول`; 18:55 `قبلا`; 18:59 `لمهلكهم`; 27:49 `مهلك أهله` | Incorporated | `d144-01`–`d144-05`; al-Kūfiyyūn means at-Taysīr’s own group, and Abū Bakr/Ḥafṣ distinctions are retained at both named locations. |
| 18:63 `وما أنسانيه إلا`; 48:10 `عليه الله`; 18:66 `مما علمت رشدا`; 18:70 `فلا تسئلنى`; 18:71 `ليغرق`; 18:74 `نفسا زكية` | Incorporated | `d144-06`–`d144-11`; cross-sūra wording and the full source descriptions remain in the evidence. |
| 18:74 and 65:8 `نكرا` | Incorporated at the two source-named locations | `d144-12`–`d144-13`; the source says “here and in al-Ṭalāq,” so no additional al-Kahf occurrence is inferred. |
| `{رعبا} قد ذكر`, `/بالغداوة/ قد ذكر`, `/تذروه الريح/ قد ذكر` | Out of scope as bare pointers | `s143-01`–`s143-03`; no new local reading form is stated. |

The checked batch `batch-5527-p143-144.json` has 25 items, 54 form assertions, three skips, zero errors or coverage gaps, 24 agreeing anchors, and one weak anchor (`d143-09`) explicitly reviewed against the source wording. This closes the extraction and review of these two pages only; the book remains in progress.
## Volume 1, pp. 145–146 — al-Kahf

**Status: 25 reading items incorporated or linked; one route detail tracked as unresolved; zero checker gaps.** The source’s reader names are read in the local sequence, including names that precede the next slash-delimited lemma. Cross-sūra lists are split into one location record per explicitly named occurrence.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 18:76 `من لدني`; 18:77 `لتخذت عليه`; 18:81 `أن يبدلهما`, 66:5 `أن يبدله`, 68:32 `أن يبدلنا`; 18:81 `رحما` | Incorporated or supplemented | `d145-01`–`d145-04`; reader sets follow the source's local name placement. The three `أن يبدل` locations are kept distinct. |
| 18:85 `فأتبع`; 18:89 and 18:92 `ثم أتبع` | Incorporated at all three source-named locations | `d145-05a`–`d145-05c`; at-Taysīr's own al-Kūfiyyūn group and Ibn ʿĀmir are preserved. |
| 18:86 `في عين حامية`; 18:88 `فله جزاء الحسنى`; 18:93 `بين السدين` and `يفقهون` | Incorporated | `d145-06`–`d145-09`; explicit reader attributions and remainder forms are recorded as printed. |
| 18:94 and 21:96 `يأجوج ومأجوج`; 18:94 and 23:72 `خراجا`; 18:94 `وبينهم سدا` | Incorporated at all source-named locations | `d145-10`, `d145-10b`, `d146-01`, `d146-01b`, and `d146-02`; the Yaʾjūj/Maʾjūj statement crosses pp. 145–146, so its citation spans both pages. |
| 18:95 `ما مكنني`; 18:96 `ردما ءاتوني`, `بين الصدفين`, and `قال ءاتوني`; 18:97 `فما استطاعوا`; 18:98 `جعله دكاء`; 18:109 `قبل ان ينفد` | Incorporated or supplemented | `d146-03`–`d146-09`; the source's Warsh transfer note remains separate from the general forms. Weak anchors for 18:95 and 18:109 are explained as readings absent from the Cairo text; the 18:96 combined lemma spans the existing `ائتوني` feature. |
| `حمزة وابو بكر بخلاف عنه` before 18:96 `قال ءاتوني` | Unresolved route detail | `s146-01`; the phrase is preserved with the item, but the source does not specify which Abū Bakr route has which form, so no route is assigned. |

The checked `batch-5527-p145-146.json` contains 25 items and 52 form assertions, one unresolved passage, zero errors or coverage gaps, 22 agreeing anchors, and three reviewed weak anchors. This closes the review of pp. 145–146 only; at-Taysīr remains in progress.
## Volume 1, pp. 147–148 — closing al-Kahf yāʾ lists and Maryam

**Status: 31 location items incorporated or linked; one reader attribution and one open-ended scope are unresolved; four passages tracked out of scope; zero checker gaps.** This spread includes a counted yāʾ list, a seven-place deletion list, a sura transition, opening-letter readings, and Maryam's first farsh readings. The names at the end of a complete local reading clause are preserved with that clause; names before a new slash-delimited lemma govern the new entry only when the local sequence supports that relation.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 18:22 `ربي أعلم`; 18:38 and 18:42 `بربي أحدا`; 18:40 `ربي أن يؤتين` | Supplemented at the four counted locations | `d147-y-01`–`d147-y-04`; opening of the yāʾ is attributed to at-Taysīr's Ḥaramiyyān plus Abū ʿAmr, without importing the ten-reader set's Abū Jaʿfar. |
| 18:67, 18:72, 18:75 `معي`; 18:69 `ستجدني إن شاء الله`; 18:102 `دوني أولياء` | Supplemented | `d147-05-1`–`d147-07`; the source assigns fatḥ of the yāʾ to Ḥafṣ at the three `معي صبرا` loci, Nāfiʿ at `ستجدني`, and Nāfiʿ/Abū ʿAmr at `دوني أولياء`. |
| 18:17 `المهتد`; 18:24 `أن يهدين`; 18:40 `أن يؤتين`; 18:66 `على أن تعلمن`; 18:39 `إن ترن أنا أقل`; 18:64 `ما كنا نبغ`; 18:70 `فلا تسئلني` | Supplemented at all seven deletion-list locations | `d147-08`–`d147-14`; both-state and waṣl-only establishment are kept distinct. At 18:70, Ibn Dhakwān's deletion is marked disputed via al-Akhfash, and the source's explicit remainder and rasm note are retained. |
| 19:1 `كهيعص` hāʾ/yāʾ vowels; 19:1–2 opening-letter dāl before dhāl | Supplemented | `d148-01`–`d148-03`; the five hāʾ/yāʾ combinations map to the existing opening-letter record, with Abū Shuʿayb's reported match retained as permitted Sūsī evidence identified by the p. 3 preface. The dāl/dhāl feature links to the existing opening rule and records its specific Maryam transition. |
| 19:2–3 `زكريا إذ نادى`; 19:7 `يا زكريا إنا` | Incorporated as two named hamza loci | `d148-04a`–`d148-04b`; both are source-stated, the first crosses an āya boundary, and the source's open `وشبهه` pointer is not expanded. |
| 19:6 `يرثني ويرث`; 19:8, 19:69 `عتيا`; 19:70 `صليا`; 19:68, 19:72 `جثيا`; 19:58 `وبكيا` | Supplemented at every named or countable occurrence | `d148-05`–`d148-11`; Abū ʿAmr/al-Kisāʾī jussive, Ḥamza/al-Kisāʾī initial-vowel distinctions, and remainder forms are preserved. |
| 19:9 `وقد خلقناك`; 19:19 `ليهب لك`; 19:23 `وكنت نسيا`; 19:24 `من تحتها` | Partially incorporated; one reader set unresolved | `d148-12`–`d148-14` plus `s148-03`. The source's 19:9 nūn/alif vs tāʾ forms are explicit, but the local sequence does not securely assign its first form, so that passage remains unresolved. At 19:19, the al-Ḥalwānī-from-Qālūn route is retained as permitted. At 19:24, at-Taysīr states the mīm distinction only; it is preserved separately from the other compilation's combined mīm/tāʾ feature. |
| `ياءاتها تسع`; `{إنا نبشرك}` and `{لتبشر به}`; `وشبهه`; `سورة مريم` | Out of scope or unresolved with reasons | `s147-01` tracks the count only; `s148-01` is a bare pointer to earlier readings; `s148-02` is open-ended without additional locations; `s148-04` is a structural heading. |

The checked `batch-5527-p147.json` contains 31 items and 51 form assertions, five tracked passages, zero errors or coverage gaps, 28 agreeing anchors, and three reviewed weak anchors. The weak anchors concern the opening-letter dāl/dhāl rule and the two source-named Zakariyyā phrases; the latter's exact local phrase spans 19:2–19:3 or is repeated in a verse with another Zakariyyā. This closes these two pages only; at-Taysīr remains in progress.
## Volume 1, p. 149 — Maryam

**Status: ten reading items incorporated or linked; three passages tracked, including one cross-page unresolved list; zero checker gaps.** Reader names immediately before a new slash-delimited lemma are handled in the local sequence. The source distinguishes ordinary readings, a route report, and bare pointers to earlier readings.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 19:25 `تسقط عليك`; 19:34 `قول الحق`; 19:36 `وأن الله`; 19:51 `مخلصا` | Incorporated or supplemented | `d149-01`–`d149-04`; Ḥafṣ/Ḥamza/remainder forms, ʿĀṣim/Ibn ʿĀmir, at-Taysīr's Kufi group, and the explicitly named remainder are kept source-specific. |
| 19:66 `إذا ما مت`; 19:67 `أولا يذكر`; 19:72 `ثم ننجي الذين`; 19:73 `خير مقاما`; 19:74 `أثاثا وريا` | Incorporated or supplemented | `d149-05`–`d149-10`; the al-Naqqāsh report through al-Akhfash on Ibn Dhakwān is separate from the direct one-hamza listing. At-Taysīr assigns lightening `ثم ننجي` to al-Kisāʾī only; no Yaʿqūb attribution is imported. Ḥamza's stopping reference at 19:74 remains a pointer to its separate chapter. |
| `{كن فيكون}` and `{يا أبت}`; `{يدخلون الجنة}` | Out of scope as bare pointers | `s149-01`–`s149-02`; the readings are only referred to as already discussed. |
| `{مالا وولدا}`, `{الرحمن ولدا}`, `{للرحمن ولدا}`, `{أن يتخذ ولدا}`, and al-Zukhruf `{للرحمن ولد}` | Incorporated across pp. 149–150 | `d150-01`–`d150-05` preserve the five-place list and at-Taysīr's Ḥamza/al-Kisāʾī attribution; the separate source claim supplements all five existing loci. This resolves `s149-03`. |

The checked `batch-5527-p149.json` has ten items and twenty form assertions, three tracked passages, zero errors or coverage gaps, and ten agreeing anchors. The five-place continuation is completed in `batch-5527-p150.json`; the two pages' shared list is documented there without losing its p. 149 location list or p. 150 reading forms.

## Volume 1, p. 150 — closing Maryam and opening Ṭā Hā

**Status: 18 location items incorporated or linked; one two-locus reading statement unresolved; two structural/count passages tracked; zero checker errors or coverage gaps.** This page finishes the cross-page five-place `walad` list, then gives a cross-sūra `يكاد` statement, counted yāʾ readings, a sura transition, and Ṭā Hā readings. Reader names preceding a bracketed lemma are assigned to that following lemma; counted lists and explicit cross-sūra locations are split into separate verse records.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 19:77, 19:88, 19:91, 19:92, and 43:81 `walad` forms | Incorporated across pp. 149–150 | `d150-01`–`d150-05` add at-Taysīr's own Ḥamza/al-Kisāʾī claim and the five-place contrast to the existing source records. The location list begins on p. 149; the reading description closes on p. 150. |
| 19:90 and 42:5 `يكاد السماوات`; 19:90 `يتفطرن` | Supplemented at all explicitly named locations | `d150-06`–`d150-08`; Nāfiʿ/al-Kisāʾī for yāʾ in `يكاد`, and at-Taysīr's Ḥaramiyyān/Ḥafṣ/al-Kisāʾī set for `يتفطرن` are preserved separately from another book's reader set. |
| Six counted Maryam yāʾ loci: 19:5 `من ورائي`; 19:10 `اجعل لي آية`; 19:47 `لك ربي إنه`; 19:18 `إني أعوذ`; 19:45 `إني أخاف`; 19:30 `آتاني الكتاب` | Four incorporated; two unresolved | `d150-09`–`d150-11` and `d150-14` record Ibn Kathīr, Nāfiʿ/Abū ʿAmr, and Ḥamza as stated. `s150-03` tracks 19:18 and 19:45 as unresolved because the cached text reads `فحتمها`; it is not silently corrected to `فتحها`. |
| 20:1 `طه`; 20:10 and 28:29 `لأهله امكثوا`; 20:12 `إني أنا ربك`; 20:12 and 79:16 `طوى` | Incorporated or supplemented at every named location | `d150-15`–`d150-20` retain at-Taysīr's opening-letter groups, Ḥamza's hāʾ-in-waṣl reading, Ibn Kathīr/Abū ʿAmr's hamza opening, and its own Kufi-group definition for `طوى`. Opening letters supplement the existing opening-letter item without importing another source's extra readers. |
| `ياءاتها ست`; `سورة طه` | Tracked as list count and structural heading | `s150-01`–`s150-02`; the six yāʾ loci are individually mapped, and the heading is not a variant claim. |

The checked `batch-5527-p150.json` contains 18 items and 33 form assertions, three tracked passages, zero errors or coverage gaps, 17 agreeing anchors, and one reviewed weak anchor (`d150-10`). The weak anchor is explained by the source's OCR spelling `لىءاية`; its explicit Maryam list and paired 19:47 locus identify 19:10. This closes p. 150 only; at-Taysīr remains in progress.

## Volume 1, p. 151 — Ṭā Hā continuation

**Status: 12 location items incorporated or linked; two local attributions unresolved; two passages explicitly tracked out of scope; zero checker errors or coverage gaps.** The page continues a sequential list of Ṭā Hā variants, gives two cross-sūra `مهدا` occurrences, refers to waqf treatment, and records separate word-form and nūn distinctions at 20:63. Reader names are attached only where the local clause explicitly supports them; when the source gives a form without naming its reader, only the stated remainder or other named forms are recorded.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 20:13 `وإنا`; `اخترناك` | Incorporated or supplemented | `d151-01`–`d151-02`; Ḥamza's nūn gemination and Ibn ʿĀmir's nūn/alif form are preserved as at-Taysīr states them. `اخترناك` does not match the Cairo text's form, so its reviewed anchor is linked to the source's explicit local 20:13 context and the existing same-locus entry. |
| 20:31 `أخي اشدد`; 20:32 `وأشركه` | Partially incorporated; one attribution unresolved | `d151-03`–`d151-04`; Ibn ʿĀmir's 20:31 form and the explicit remainder form at 20:32 are recorded. `s151-03` tracks the 20:32 positive `بضم الهمزة` form whose reader is not named in this clause. |
| 20:53 and 43:10 `مهدا`; 78:6 al-Nabaʾ word | Incorporated at both variant loci; no-difference statement out of scope | `d151-05`–`d151-06` preserve the source's Kufi group and remainder at both named locations. `s151-01` records the source's explicit statement that the al-Nabaʾ word has no disagreement. |
| 20:58 `مكانا سوى`; waqf on `سوى` | Incorporated; waqf pointer out of scope | `d151-07` supplements the existing word-form entry with ʿĀṣim/Ibn ʿĀmir/Ḥamza and the remainder. `s151-02` preserves the source's waqf cross-reference without inventing an unstated stopping form. |
| 75:36 `أن يترك سدى` | Partially incorporated; one attribution unresolved | `d151-08` records Warsh/Abū ʿAmr's between-between treatment and the remainder's fatḥ. `s151-04` tracks the preceding bare imāla statement because no reader is named for it locally. |
| 20:61 `فيسحتكم`; 20:63 `قالوا إن`, `هذين`, and nūn gemination | Supplemented at all named loci | `d151-09`–`d151-12`; the source's spelling `فيسحتكم` is preserved alongside the existing edition's `فيستحكم`; Ḥafṣ/Ḥamza/al-Kisāʾī, Ibn Kathīr/Ḥafṣ, Abū ʿAmr, and Ibn Kathīr distinctions remain separate. |

The checked `batch-5527-p151.json` has 12 items, 22 form assertions, four tracked passages, zero checker errors or coverage gaps, ten agreeing anchors, and two reviewed weak anchors (`d151-02` and `d151-03`). This closes p. 151 only; at-Taysīr remains in progress.

## Volume 1, p. 152 — Ṭā Hā continuation

**Status: 12 location items incorporated or linked; one unlocated no-difference statement unresolved; two bare pointers tracked; zero checker errors or coverage gaps.** The page continues verse-order readings through Ṭā Hā, including a three-place list. The names before new lemmas are interpreted locally; the coordinated 20:81 phrases share the stated al-Kisāʾī attribution, while each locus is recorded separately.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 20:64 `فأجمعوا`; 20:66 `تخيل إليه`; 20:69 `تلقف ما` and `كيد سحر`; 20:71 `ءامنتم له` | Incorporated or supplemented | `d152-01`–`d152-05` preserve Abū ʿAmr, Ibn Dhakwān, Ḥamza/al-Kisāʾī, and Qunbul/Ḥafṣ as at-Taysīr attributes them. The earlier al-Bazzī and Ḥafṣ pointers for `تلقف` and the prior `ءامنتم` pointer are not expanded. |
| 20:75 `ومن يأته مؤمنا` | Incorporated with route detail | `d152-06` records Qālūn's `بخلاف عنه` qualification, Abū Shuʿayb's sukūn report mapped to the Sūsī route using the book's p. 3 preface, and the remainder's full vowel. |
| 20:77 `لا تخف دركا` | Incorporated | `d152-07` records Ḥamza's jazm and the remainder's rafʿ with the preceding alif. |
| 20:80 `قد انجيتكم من عدوكم`, `واعدتكم`; 20:81 `ما رزقتكم` | Supplemented at all three counted loci | `d152-08`–`d152-10` preserve the source's shared three-place statement and Ḥamza/al-Kisāʾī attribution at each explicitly named occurrence. |
| 20:81 `فيحل عليكم`; `ومن يحلل` | Supplemented | `d152-11`–`d152-12` preserve al-Kisāʾī's ḍamm readings and the remainder's kasr where stated. |
| `{أن يحل عليكم}`; `قد تقدم` pointers | Unresolved / out of scope | `s152-01`–`s152-03` preserve the prior-reading pointers and the source's no-difference statement. That statement supplies no sura or verse for its “third” reference, so its location is not inferred. |

The checked `batch-5527-p152.json` has 12 items, 24 form assertions, three tracked passages, zero checker errors or coverage gaps, nine agreeing anchors, and three reviewed weak anchors (`d152-08`–`d152-10`) linked to the existing same-locus items. This closes p. 152 only; at-Taysīr remains in progress.

## Volume 1, p. 153 — closing Ṭā Hā readings and end-verse imāla

**Status: nine verse items and one sura-specific rule incorporated or linked; one bare pointer tracked; zero checker errors or coverage gaps.** The page ends the Ṭā Hā verse-order list and then states the sura's end-verse imāla pattern. The latter is a source-defined rule with a bounded starting phrase, explicit extra locus, rāʾ examples, Warsh's between-between reading, and the remainder's pure fatḥ; it is kept in the rules layer.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 20:87 `بملكنا`, `حملنا` | Supplemented | `d153-01`–`d153-02` preserve at-Taysīr's smaller seven-reader attributions, not the expanded ten-reader sets in the existing items. |
| 20:96 `بما لم تبصروا`; 20:97 `لن تخلفه`; 20:102 `يوم ننفخ` | Supplemented | `d153-04`–`d153-06`; the source's ta/yāʾ form at 20:96 is absent from the Cairo token, so `d153-04` keeps a reviewed weak anchor to the existing 20:96 item. Ibn Kathīr/Abū ʿAmr at 20:97 and Abū ʿAmr at 20:102 remain source-specific. |
| 20:112 `فلا يخف ظلما`; 20:119 `وأنك لا`; 20:130 `لعلك ترضى`; 20:133 `أولم تأتهم` | Incorporated or supplemented | `d153-07`–`d153-10` retain Ibn Kathīr, Nāfiʿ/Abū Bakr, Abū Bakr/al-Kisāʾī, and Nāfiʿ/Abū ʿAmr/Ḥafṣ sets as placed in the local sequence. |
| Sura Ṭā Hā ending vowels from `لتشقى` to its end; `ومن اهتدى`; rāʾ examples `الثرى`, `من افترى`, `ولا تعرى` | Incorporated as a rule | `d153-11` records Ḥamza/al-Kisāʾī imāla, Abū ʿAmr's rāʾ-conditioned imāla and remaining between-between cases, Warsh's between-between reading throughout, and the remainder's pure fatḥ. The source's open `وشبهه` scope is preserved without expanding more words. |
| `/ يبنؤم / قد ذكر` | Out of scope as a bare pointer | `s153-01`; the page refers to an earlier reading without restating its forms. |

The checked `batch-5527-p153.json` has ten items, 23 form assertions, one tracked passage, zero checker errors or coverage gaps, eight agreeing anchors, one reviewed weak anchor (`d153-04`), and one rule item. This closes p. 153 only; at-Taysīr remains in progress.

## Volume 1, p. 154 — closing Ṭā Hā yāʾ list and opening al-Anbiyāʾ

**Status: 14 yāʾ locations and two al-Anbiyāʾ readings incorporated or linked; one omitted-yāʾ attribution unresolved; one bare pointer and two structural/count passages tracked; zero checker errors or coverage gaps.** The source moves from its counted Ṭā Hā yāʾ list into al-Anbiyāʾ. At-Taysīr’s own collective groups are retained (`الحرميان`, `الكوفيون`); Warsh and Ḥafṣ remain explicitly named transmitters. The quoted phrases `لذكري إن`, `على عيني إذ`, and `أخي اشدد` cross verse boundaries, so each is placed at the verse containing the yāʾ-bearing word.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Ṭā Hā yāʾ list: 20:10 `إني آنست`, 20:12 `إني أنا ربك`, 20:14 `إنني أنا الله`, 20:10 `لعلي آتيكم`, 20:14 `لذكري`, 20:26 `لي أمري`, 20:39 `عيني`, 20:94 `برأسي إني`, 20:18 `ولي فيها`, 20:30 `أخي`, 20:41 `لنفسي`, 20:42 `في ذكري`, 20:125 `حشرتني`, and 20:93 `ألا تتبعن` | Incorporated or supplemented | `d154-01`–`d154-14` preserve the local fatḥ, sukūn, and retention distinctions and the exact reader/group spans. For 20:41–42 the source explicitly says the two sukūn yāʾs drop from pronunciation at the meeting of two sukūns. At 20:125, only the Ḥaramiyyān fatḥ is attributed; the separately stated omitted-yāʾ reading has no named reader and remains unresolved. |
| Al-Anbiyāʾ 21:4 `قل ربي يعلم`; 21:25 `نوحي إليه` | Incorporated or supplemented | `d154-15`–`d154-16` preserve Ḥafṣ, Ḥamza, and al-Kisāʾī's explicitly named forms and the source's stated remainder. |
| 21:7 `{نوحي إليهم} قد ذكر` | Out of scope as a bare pointer | `s154-03`; the source points to a previously described reading and does not restate the forms here. |
| `ياءاتها ثلاث عشر ياء`; `سورة الانبياء عليهم السلام` | Tracked as count and structural heading | `s154-01`–`s154-02`. The heading says 13 yāʾs, while the clauses explicitly enumerate 14 locations; the mismatch remains unresolved and no listed location is suppressed. The sura heading is only a section boundary. |

The checked `batch-5527-p154.json` has 16 items, 19 form assertions, three tracked passages, zero checker errors or coverage gaps, 14 agreeing anchors, and two reviewed weak anchors (`d154-05`, `d154-07`). This closes p. 154 only; at-Taysīr remains in progress.

## Volume 1, p. 155 — al-Anbiyāʾ continuation

**Status: seven reading items incorporated or supplemented; five passages tracked as pointers or unresolved; zero checker errors or coverage gaps.** The page continues verse order through al-Anbiyāʾ, includes one reading explicitly repeated at Luqmān 31:16, and interleaves bare “already mentioned” pointers. Reader names immediately before a slash-delimited lemma are assigned to that following lemma. This leaves missing reader assignments open instead of carrying names backward across an item boundary.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 21:30 `ألم تر`; 21:45 `ولا تسمع الصم`; 21:47 and 31:16 `مثقال حبة`; 21:80 `لتحصنكم`; 21:88 `نجي المؤمنين`; 21:95 `وحرم` | Incorporated or supplemented | `d155-01`–`d155-04`, `d155-06`–`d155-08`. At-Taysīr's claims stay distinct from Taḥbīr's broader reader sets. At 21:80 the source names Abū Bakr (mapped to Shuʿba) for the nūn form but leaves the tāʾ reader and the scope of `والباقون` unresolved; the Ibn ʿĀmir and Abū Bakr names preceding `/ نجى المؤمنين /` are assigned to that next lemma. |
| 21:58 `جذاذا` | Unresolved | `s155-02`; the kasra and remainder ḍamm are explicit, but the source does not name the kasra reader. The nearby al-Kisāʾī name closes the bare `وضياء` pointer and is not imported into this item. |
| 21:104 `للكتب` | Unresolved | `s155-05`; the plural/singular contrast is explicit, but the plural reader set is not stated in this clause. Since that set is unresolved, the complement indicated by `والباقون` is not expanded. |
| `{وضياء} قد ذكر الكسائي`; `{أف لكم}` and `{أئمة}`; `{إذا فتحت}` and `{يأجوج ومأجوج}` | Out of scope as bare pointers | `s155-01`, `s155-03`–`s155-04`; these refer to previously discussed readings and do not restate their forms. |

The checked `batch-5527-p155.json` has seven items, 13 form assertions, five tracked passages, zero checker errors or coverage gaps, six agreeing anchors, and one reviewed weak anchor (`d155-01`). This closes p. 155 only; at-Taysīr remains in progress.

## Volume 1, p. 156 — closing al-Anbiyāʾ and opening al-Ḥajj

**Status: seven verse items and one Qurʾān-wide hamza rule incorporated or supplemented; seven passages tracked as pointers or unresolved; zero checker errors or coverage gaps.** The page closes al-Anbiyāʾ, lists four yāʾ items, then changes to al-Ḥajj. It also interleaves bare cross-references and a four-word lām sequence whose reader names fall between successive lemmas. Those names are attached in the source's local sequence, rather than copied backward or applied uniformly to all four words.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Al-Anbiyāʾ 21:24 `من معي`; 21:83 `مسني الضر`; 21:105 `عبادي الصالحون` | Incorporated or supplemented | `d156-01`–`d156-03`; Ḥafṣ's fatḥ and Ḥamza's sukūn are recorded as stated. The four-yāʾ list also gives `إني أنا الله` for Nāfiʿ and Abū ʿAmr, but no location in al-Anbiyāʾ is identifiable from this page; it remains unresolved in `s156-03`. |
| 21:112 `قال رب احكم` | Unresolved | `s156-02`; the alif/no-alif contrast is explicit, but the alif reader is not named. Ḥafṣ belongs to the preceding `في الزبور` pointer and is not carried forward. |
| Al-Ḥajj 22:2 `سكرى وما هم بسكرى` | Incorporated | `d156-04` preserves the source's Hamza/al-Kisāʾī set and does not import Khalaf al-ʿĀshir from Taḥbīr. |
| 22:15 `ثم ليقطع`; 22:29 `ثم ليقضوا`, `وليوفوا`, `وليطوفوا` | Partially incorporated; one locus unresolved | `s156-04`, `d156-05`–`d156-07`. The names Warsh, Qunbul, Abū ʿAmr, and Ibn ʿĀmir precede `ثم ليقضوا` and are assigned there. Ibn Dhakwān precedes the paired `وليوفوا`/`وليطوفوا` forms. The `ثم ليقطع` kasra has no unambiguous reader in this sequence; it remains unresolved. |
| 22:23 and 35:33 `ولؤلؤا` case forms | Unresolved | `s156-07`; naṣb and khafḍ are explicit at both named locations, but the naṣb reader is not identified, so the complementary reader set is not expanded. |
| General hamza treatment for `لؤلؤ`, `اللؤلؤ`, and `لؤلؤا` | Incorporated as a rule | `d156-08` records Abū Bakr/Abū ʿAmr's stated first-hamza treatment across the Qurʾān and Ḥamza's separate easing at waqf. It remains distinct from the unresolved case-ending contrast above. |
| `{في الزبور} قد ذكر حفص`; `{ليضل} قد ذكر ورش وابو عمرو وابن عامر`; `/ هاذان / قد ذكر نافع وعاصم` | Out of scope as bare pointers | `s156-01`, `s156-05`, and `s156-06`; these refer to previously discussed readings without restating their forms. |

The checked `batch-5527-p156.json` has eight items, 13 form assertions, seven tracked passages, zero checker errors or coverage gaps, seven agreeing anchors, and one rule item. This closes p. 156 only; at-Taysīr remains in progress.

## Volume 1, p. 157 — al-Ḥajj continuation

**Status: ten verse/rule items incorporated or supplemented; two passages tracked; zero checker errors or coverage gaps.** The page continues the Qurʾān-wide hamza rule from p. 156, then resumes verse order through al-Ḥajj 22:45. Reader names and remainder clauses are attached only within each source clause; a preceding bare pointer does not supply names for the next item.

| Passage | Status | Record / reason |
| --- | --- | --- |
| General treatment of the two hamzas at waqf; Hishām's easing of the second outside naṣb | Incorporated as continuation of a rule | `d157-01` supplements `d156-08`. Ḥamza's object is now explicit across the page break. Hishām's separate transmitter-level statement is retained. The following `والباقون` remains unresolved because this clause does not settle Ibn Dhakwān's membership in the remainder. |
| Al-Ḥajj 22:25 `للناس سواء`; 22:29 `وليوفوا`; 22:31 `فتخطفه`; 22:34 and 22:67 `منسكا`; 22:38 `إن الله يدفع`; 22:39 `أذن للذين` and `يقاتلون`; 22:40 idghām of tāʾ into ṣād; 22:45 `اهلكتها` | Incorporated or supplemented | `d157-02`–`d157-11` preserve the stated reader groups and forms. The waw/fāʾ feature at 22:29 supplements, but remains distinct from, the p. 156 lām-vowel feature. The source expressly says `منسكا` occurs in both locations. No Khalaf al-ʿĀshir attribution is imported. The 22:40 citation anchors the idghām to `لهدمت صوامع`; the item records only idghām, separately from dāl lengthening. The 22:45 variant is located by verse sequence although the source lemma is the variant form and does not match the base text exactly. |
| 22:40 `لهدمت صوامع` light/doubled dāl; `{ولولا دفع الله} قد ذكر الحرميان` | Unresolved / out of scope as pointer | `s157-02` tracks the explicit dāl contrast without assigning the unstated light-form reader or expanding its remainder. `s157-01` is a bare pointer with no form restated. |

The checked `batch-5527-p157.json` has 11 items, two tracked passages, zero checker errors or coverage gaps, nine agreeing anchors, one Qurʾān-wide rule continuation, and one source-form anchor without a matching base-text lemma (`d157-11`). This closes p. 157 only; at-Taysīr remains in progress.

## Volume 1, p. 158 — al-Ḥajj close and al-Muʾminūn opening

**Status: 14 reading items incorporated or supplemented; four passages tracked; zero checker errors or coverage gaps.** At-Taysīr's layout shifts from al-Ḥajj verse-order variants to a yāʾ inventory, then opens al-Muʾminūn. I treated the explicitly located cross-sura items separately at each verse and kept the text's “already mentioned” notices as pointers rather than reusing unshown forms.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Al-Ḥajj 22:47 `مما يعدون` | Incorporated | `d158-01` records the yāʾ reading for Ibn Kathīr, Ḥamza, and al-Kisāʾī, with the source's `الباقون` tāʾ form. |
| 22:51 and Sabaʾ 34:5, 34:38 `معجزين` | Incorporated or supplemented | `d158-02`–`d158-04` record the same expressly cross-referenced reading at all three locations: Ibn Kathīr and Abū ʿAmr with doubled jīm and no alif; the remainder with alif and light jīm. |
| Al-Ḥajj 22:26 `بيتي للطائفين`; 22:25 `والباد`; `كان نكير` at 22:44, Sabaʾ 34:45, Fāṭir 35:26, and al-Mulk 67:18 | Incorporated or supplemented | `d158-05`–`d158-10` preserve the page's yāʾ inventory, including its conditional retention statements. The `حيث وقعت` statement is entered at each of the four locally verified occurrences. For `والباد`, only the explicitly named retention groups are entered; no omitted remainder is inferred. |
| Al-Muʾminūn 23:8 `لأمانتهم`; al-Maʿārij 70:32; 23:9 `على صلواتهم`; 23:14 `عظما فكسونا العظم` | Incorporated or supplemented | `d158-11`–`d158-14` preserve the singular/plural and vowel/number distinctions and attach the names in the page's local slash-delimited order. The source explicitly repeats 23:8's reading at 70:32. |
| `{ثم قتلوا}` and `{مدخلا}`; `{منسكا}` | Out of scope as pointers | `s158-01` and `s158-03`; the text says these readings were already mentioned and does not restate their forms. |
| 22:62 and Luqmān 31:30 `وأن ما تدعون`; the second item in `{والباد ومن}` | Unresolved | `s158-02` preserves the explicit tāʾ/yāʾ contrast but no positive reader set is named, so `الباقون` cannot be resolved. `s158-04` tracks the second deletion notice because its quoted `من` entry is insufficient to establish a lemma/location; the locatable `والباد` is recorded separately. |

The checked `batch-5527-p158.json` has 14 items and four tracked passages, zero checker errors or coverage gaps, and 14 agreeing verse anchors. This closes p. 158 only; at-Taysīr remains in progress.

## Volume 1, p. 159 — al-Muʾminūn continuation

**Status: three items incorporated or supplemented; nine passages tracked; zero checker errors or coverage gaps.** This page continues al-Muʾminūn verse order. Its `قد ذكر` clauses explicitly point back to prior entries; reader names inside those clauses are not reassigned to the next slash-delimited lemma. I therefore entered only the directly attributed forms and recorded incomplete contrasts with their missing attribution.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 23:20 `سينا` | Incorporated or supplemented | `d159-01` preserves at-Taysīr's Kufi/Ibn ʿĀmir group for fatḥ and the stated remainder kasra. This source-specific group is retained even where other books group readers differently. |
| 23:52 nūn in `{وإن هذه}` | Incorporated | `d159-02` records Ibn ʿĀmir's light nūn against the explicitly stated remainder. |
| 23:67 `تهجرون` | Incorporated or supplemented | `d159-03` records Nāfiʿ's ḍamm/kasr form and the stated remainder. |
| 23:20 `تنبت بالدهن`; 23:29 `منزلا`; 23:44 `تترا`; hamza in 23:52 `{وإن هذه}`; 23:72 `{فخرج ربك}` | Unresolved | `s159-01`–`s159-05`. Each contrast is explicit, but its positive reader set is absent or belongs to the immediately preceding “already mentioned” pointer. Complementary `الباقون` forms are not expanded when that set is missing. |
| `{نسقيكم}`, `{من إله غيره}`, `{من كل زوجين}`, `{هيهات هيهات}`, `{إلى ربوة}`, `{أم تسئلهم خرجا}` | Out of scope as bare pointers | `s159-06`–`s159-09`; the source says these have already been mentioned but does not restate their reading forms. |

The checked `batch-5527-p159.json` has three items and nine tracked passages, zero checker errors or coverage gaps, and three agreeing verse anchors. This closes p. 159 only; at-Taysīr remains in progress.

## Volume 1, p. 160 — al-Muʾminūn close

**Status: ten reading items incorporated or supplemented; three passages tracked; zero checker errors or coverage gaps.** The page continues al-Muʾminūn verse order, then closes with a one-yāʾ inventory. It uses ordinal references (“the two latter occurrences,” “the first occurrence,” and “both”) to scope readings; I split each supported verse locus while preserving those stated groupings.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 23:87 and 23:89 `سيقولون الله` | Incorporated or supplemented | `d160-01`–`d160-02` record Abū ʿAmr's alif/rafʿ form and the source's remainder for the two latter occurrences. The first occurrence at 23:85 is explicitly said to have no disagreement (`s160-01`). |
| 23:92 `عالم الغيب`; 23:106 `شقواتنا`; 23:110 and Ṣād 38:63 `سخريا`; 23:111 `إنهم هم`; 23:112 `قل كم لبثتم`; 23:114 `قل إن لبثتم` | Incorporated or supplemented | `d160-03`–`d160-09` preserve at-Taysīr's reader groups and distinctions. For the paired لبثتم forms, the page's explicit `فيهما` applies the Hamza/al-Kisāʾī no-alif and remainder alif readings to both loci. |
| Al-Muʾminūn 23:100 `لعلّي أعمل` | Incorporated | `d160-10` records the source's one-yāʾ list and Kufi sukūn using the at-Taysīr-specific `kufiyun_taysir` group. |
| 23:115 `لا ترجعون` | Unresolved | `s160-03`; the forms are explicit but the first reader group is not. The preceding `فيهما` group is scoped to the two لبثتم locations and is not transferred. |
| 23:85 `سيقولون لله`; al-Zukhruf 43:32 `سخريا` | Out of scope as no-variant loci | `s160-01`–`s160-02`; the source explicitly states no disagreement at either occurrence. |

The checked `batch-5527-p160.json` has ten items and three tracked passages, zero checker errors or coverage gaps, and ten agreeing verse anchors. This closes p. 160 only; at-Taysīr remains in progress.

## Volume 1, p. 161 — al-Nūr opening

**Status: six reading items incorporated or supplemented; seven passages tracked; zero checker errors or coverage gaps.** The page starts al-Nūr's verse-order list. Bare pointers and first/second wording remain distinct from fresh variants. Reader names immediately before a following lemma are assigned forward in the source sequence; names after a “previously mentioned” pointer stay with that pointer.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Al-Nūr 24:1 `وفرضناها`; 24:2 `بهما رأفة` | Incorporated or supplemented | `d161-01` and `d161-02` record Ibn Kathīr/Abū ʿAmr's doubled rāʾ and Ibn Kathīr's hamza movement, with the stated remainders. The al-Ḥadīd 57:27 occurrence is explicitly said to have no disagreement (`s161-01`). |
| 24:7 `إن لعنت الله`; 24:9 `أن غضب الله` | Incorporated or supplemented | `d161-03`–`d161-04` preserve Nāfiʿ's explicitly paired light-nūn/raised-tāʾ readings and the additional ḍād and divine-name vowels at 24:9. |
| 24:31 `على جيوبهن`; `غير أولي الإربة` | Incorporated or supplemented | `d161-05`–`d161-06` follow the reader names placed immediately before each lemma: Nāfiʿ, ʿĀṣim, Abū ʿAmr, and Hishām for the ḍamm form; Abū Bakr (Shuʿba) and Ibn ʿĀmir for the nasb form. |
| `{المحصنات}`; `{خطوات}` | Out of scope as bare pointers | `s161-02` and `s161-05`; readers are named, but the page says these readings were already mentioned and does not restate forms. |
| 24:6 `أربع شهادات`; 24:9 `{والخامسة أن غضب الله}`; 24:24 `يوم يشهد` | Unresolved | `s161-03`–`s161-04`, `s161-06` retain the explicit contrasts and their source wording. Positive reader sets are not securely assigned in the local sequence, so no attribution or remainder is inferred. |
| 24:31 `{أيه المؤمنون}` and the Zukhruf cross-reference | Carried into p. 162 | `s161-08`; p. 162 completes the three locations and reading conditions in the next batch. |

The checked `batch-5527-p161.json` has six items and seven tracked passages, zero checker errors or coverage gaps, and six agreeing verse anchors. This closes p. 161's page accounting; its final cross-page item is completed in `d162-01`–`d162-06`. At-Taysīr remains in progress.


## Volume 1, p. 162 — al-Nūr continuation

**Status: 14 reading items incorporated or supplemented; two passages tracked; zero checker errors or coverage gaps.** This page completes a cross-page three-locus `أيها` item from p. 161 and then resumes al-Nūr in verse order. The connected hāʾ-vowel and stopping-alif distinctions are separate features. Names preceding slash-delimited lemmas are assigned to the following item; source-specific groups are preserved.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 24:31 `أيها المؤمنون`; 43:49 `يا أيها الساحر`; 55:31 `أيها الثقلان` | Incorporated as two distinct features | `d162-01`–`d162-06` complete p. 161's continuation. Ibn ʿĀmir's connected ḍamm-hāʾ form is preserved separately from Abū ʿAmr/al-Kisāʾī's waqf form with alif and the source's remainder without alif. |
| 24:34 and al-Ṭalāq 65:11 `آيات مبينات` | Incorporated or supplemented | `d162-07`–`d162-08` record at-Taysīr's own group (Ibn ʿĀmir, Ḥafṣ, Ḥamza, and al-Kisāʾī) for kasr yāʾ, with the stated remainder. The second anchor is reviewed against the source's explicit “here and in al-Ṭalāq” locator. |
| 24:35 `دريء`; `توقد` | Incorporated or supplemented | `d162-09` records the three stated `دريء` forms; `d162-14` keeps Ḥamza's separate waqf easing condition from his general form. `d162-10` records the three `توقد` forms and their source-specific reader sets. |
| 24:36 `يسبح له`; 24:43 `سحاب`; 24:40 `ظلمات` | Incorporated or supplemented | `d162-11`–`d162-13` record Ibn ʿĀmir/Abū Bakr, al-Bazzī, and Ibn Kathīr respectively, with each stated contrast. `d162-11` supplements canonical Taḥbīr feature `u200809-1`; the matching al-Mabsūṭ item is supporting evidence, not a valid merge target. |
| 24:52 `{ويتقه}`; `{خالق كل دابة}` | Unresolved / out of scope as pointer | `s162-01` tracks the unassigned “sukūn of hāʾ” statement pending p. 163's route details. `s162-02` is a bare pointer with a qualified Khallād route; no forms are restated. |

The checked `batch-5527-p162.json` has 14 items and two tracked passages, zero checker errors or coverage gaps, 13 agreeing anchors, and one reviewed weak cross-sūra anchor at 65:11. At-Taysīr remains in progress.

## Volume 1, p. 163 — al-Nūr close and al-Furqān opening

**Status: nine reading items incorporated or supplemented; five passages tracked; zero checker errors or coverage gaps.** The page closes the al-Nūr list, then explicitly changes to al-Furqān. Reader names before a lemma are assigned to that following item. A final `ويوم تشقق` reference continues to p. 164 without its form yet stated.

| Passage | Status | Record / reason |
| --- | --- | --- |
| Al-Nūr 24:52 `ويتقه`; 24:55 `كما استخلف`, `وليبدلنهم`; 24:57 `ولا يحسبن الذين`; 24:58 `ثلاث مرات` | Incorporated or supplemented | `d163-01` records Qālūn's hāʾ ikhtilās, the remainder, and Ḥafṣ's qāf/hāʾ form while retaining source-specific value mappings. The p. 162 bare sukūn-hāʾ statement remains unresolved. `d163-02`–`d163-05` preserve Abū Bakr, Ibn Kathīr, Ibn ʿĀmir, Ḥamza, and al-Kisāʾī exactly as attributed on this page. |
| Al-Furqān 25:8 `نأكل منها`; 25:10 `ويجعل لك`; 25:17 `فنقول ءانتم`; 25:19 `فما تستطيعون` | Incorporated or supplemented | `d163-06`–`d163-09` keep at-Taysīr's groups, including its Hamza/al-Kisāʾī set at 25:8 and Ibn ʿĀmir at `فنقول`. |
| 25:17 `ويوم يحشرهم` | Unresolved | `s163-02`; yāʾ/nūn is explicit, but its positive reader set is not. Ibn ʿĀmir occurs before the next slash-delimited lemma and is assigned there. |
| `{أو بيوت أمهاتكم}`; `{ضيقا}` | Out of scope as pointers | `s163-01` and `s163-03`; the text gives no new reading form, and explicitly says the first item has no yāʾ addition. |
| Al-Furqān 25:25 and Qāf 50 `ويوم تشقق` | Carried into p. 164 | `s163-04`; the source gives the reader group and paired loci but not the reading form before the page break. The `سورة الفرقان` heading is tracked as structure in `s163-05`. |

The checked `batch-5527-p163.json` has nine items and five tracked passages, zero checker errors or coverage gaps, eight agreeing anchors, and one reviewed weak anchor at al-Nūr 24:57. Its cross-page `ويوم تشقق` passage is completed in the p. 163–164 evidence window below. At-Taysīr remains in progress.

## Volume 1, p. 164 — al-Furqān continuation

**Status: 12 reading items incorporated or supplemented; three pointer passages tracked; zero checker errors or coverage gaps; all 12 anchors agree.** The page completes a cross-page reading begun on p. 163, continues al-Furqān in verse order, and ends with the plural-form distinction at 25:74. Reader names immediately before a slash-delimited lemma are assigned to that following lemma when the local sequence supports it. The cross-page claim cites both source pages and keeps al-Taysīr's own seven-reader group definitions.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 25:25 and 50:44 `ويوم تشقق` | Supplemented at both loci | `d164-01`–`d164-02` join p. 163's explicit al-Kūfiyyūn/Abū ʿAmr attribution and paired loci to p. 164's lightening/gemination contrast. Each location supplements its own existing feature. |
| 25:25 `وننزل الملائكة` | Supplemented | `d164-03` records Ibn Kathīr's two nūns, light zāy, raised lām, and accusative `الملائكة`, with the source's stated remainder. |
| 25:60 `لما يأمرنا`; 25:61 `فيها سرجا`; 25:62 `أن يذكر` | Supplemented | `d164-04`–`d164-06` preserve the source's Hamza/al-Kisāʾī yāʾ form, its Hamza/al-Kisāʾī two-ḍamma form, and Hamza's lightened `أن يذكر` form. Khalaf is not imported into the 25:61 attribution. |
| 25:67 `ولم يقتروا` | Supplemented | `d164-07` records all three source forms and at-Taysīr's stated reader groups. Its first form does not add a qāf sukūn absent from this source's wording. |
| 25:69 `يضعف` and `ويخلد`; `فيهى مهانا` | Supplemented; lexical form separately recorded | `d164-08`–`d164-09` add Ibn ʿĀmir/Abū Bakr's rafʿ attribution to both existing mood features. `d164-10` separately preserves Ibn Kathīr/Ibn ʿĀmir's deletion of the alif and gemination of ʿayn, which is a lexical-form distinction rather than the existing rafʿ/jazm feature. `d164-11` supplements the hāʾ connection feature and preserves the source spelling `فيهى`. |
| 25:74 `وذرياتنا` | Supplemented | `d164-12` records the source-defined al-Ḥaramiyyān, Ibn ʿĀmir, and Ḥafṣ group for the plural form and the explicitly stated singular remainder. |
| `وثمودا`; `الريح`; `بشرا`; `ليذكروا` | Out of scope as repeated pointers | `s164-01`–`s164-03`; the source points back to earlier at-Taysīr entries and adds no new reading form or attribution on this page. |

The checked `batch-5527-p164.json` has 12 items and three tracked passages, zero checker errors or coverage gaps, and 12 agreeing anchors. At-Taysīr remains in progress.

## Volume 1, pp. 165–166 — al-Furqān close and al-Shuʿarāʾ

**Status: 18 reading/rule items incorporated or supplemented; five passages tracked; zero checker errors or coverage gaps; 15 agreeing anchors, one reviewed weak anchor, and two rule anchors.** The source finishes al-Furqān, introduces al-Shuʿarāʾ, lists yāʾ al-iḍāfa examples, then continues in sura order. A waṣl/waqf imāla procedure spanning the p. 165–166 break is represented in the rules layer, located by its quoted phrase at 26:61. The source's use of `قد ذكر` was checked against its p. 159 usage: names after that phrase stay with the preceding pointer.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 25:75 `ويلقون فيها`; 25:27 `يا ليتني اتخذت`; 25:30 `إن قومي اتخذوا` | Incorporated or supplemented | `d165-01`–`d165-03`; the two yāʾ al-iḍāfa readings are retained at their explicit locations and with their own reader sets. |
| 26:1, 28:1 `طسم`; 27:1 `طس` — ṭāʾ imāla | Supplemented at all three openings | `d165-04`–`d165-06` add only at-Taysīr's Abū Bakr, Ḥamza, and al-Kisāʾī attribution; Khalaf is not imported. |
| 26:1 and 28:1 — nūn of the letter-name Sīn before mīm | Supplemented | `d165-07`–`d165-08` preserve Ḥamza's iẓhār and the source's remainder idghām. The separate Abū Jaʿfar sakt in the existing feature is not attributed to at-Taysīr. |
| 26:61 `فلما ترءا الجمعان` — waṣl and waqf | Incorporated as two rule items | `d165-09`–`d165-10` cite pp. 165–166, preserve Ḥamza's waṣl/waqf details, al-Kisāʾī's waqf imāla, Warsh's between-between treatment, and the source's explicit remainders. |
| 26:137 `إلا خلق الأولين`; 26:149 `فارهين` | Supplemented | `d165-11`–`d165-12`; source-specific readers are preserved without importing Abū Jaʿfar, Yaʿqūb, or the ten-reader group. |
| 26:176 and 38:13 `أصحاب ليكة` | Supplemented at both loci | `d165-13`–`d165-14` record al-Ḥaramiyyān/Ibn ʿĀmir and the source's stated remainder. Abū Jaʿfar is not added. |
| 15:78 and 50:14 — Warsh hamza-to-lām route | Incorporated as separate route features | `d165-15`–`d165-16`; the source explicitly names al-Ḥijr and Qāf and says Warsh transfers the hamza vowel to lām. These are distinct from the al-Ḥaramiyyān/Ibn ʿĀmir spelling contrast at 26:176 and 38:13. |
| 26:193 `نزل به`; 26:197 `أولم تكن` / `لهم آية` | Supplemented | `d165-17`–`d165-18`; the source's four-reader set at 26:193 and Ibn ʿĀmir's combined verb/case form at 26:197 are kept as stated. |
| Pointers to `أرجه`, `قال نعم`, `تلقف`, `ءامنتم`, `أن أسر`, `وعيون`; `بالقسطاس` | Out of scope as repeated pointers | `s165-01`, `s165-04`; no new forms are restated. The `قد ذكر` names stay with their preceding pointer. |
| 26:56 `حاذرون`; 26:187 and 34:9 `كسفا` | Unresolved | `s165-02`, `s165-05`; each contrast is explicit, but its positive reader group is not safely recoverable under the book's local `قد ذكر` convention. No attribution is borrowed from another compilation. |
| `سورة الشعراء` | Out of scope as structure | `s165-03` records the printed sura transition. |

The checked `batch-5527-p165-166.json` has 18 items and five tracked passages, zero checker errors or coverage gaps, 15 agreeing anchors, one reviewed weak anchor, and two rule anchors. At-Taysīr remains in progress.

## Volume 1, pp. 167–168 — al-Shuʿarāʾ yāʾ inventory and al-Naml

**Status: 26 reading items incorporated or supplemented; eight passages
tracked; zero verifier errors or coverage gaps; 24 agreeing anchors and two
items with no direct Cairo-word anchor.** Pages 167–168 complete the
al-Shuʿarāʾ yāʾ inventory and proceed through al-Naml in verse order. The
source-defined `في الخمسة` list was resolved to the five matching occurrences
of `إن أجري إلا` in al-Shuʿarāʾ. The explicit paired location `هنا وفي سبإ`
maps the word to al-Naml 27:22 and Sabaʾ 34:15.

| Passage | Status | Record / reason |
| --- | --- | --- |
| 26:217 `فتوكل` | Supplemented | `d167-01`; Nāfiʿ and Ibn ʿĀmir read with fāʾ; the source's remainder reads with wāw. |
| The 13 yāʾ inventory locations in al-Shuʿarāʾ | Supplemented | `d167-02`–`d167-14`; the source's own reader sets are retained, including `فتحهن` for the five `إن أجري إلا` tokens at 26:109, 127, 145, 164 and 180. Abū Jaʿfar is not imported from other books. |
| 27:7 `بشهاب`; 27:21 `او ليأتينني`; 27:22 `فمكث` | Supplemented | `d167-15`–`d167-17`; source-defined al-Kūfiyyūn, Ibn Kathīr, and ʿĀṣim readings respectively. The 27:21 citation identifies the verse directly, but its variant lemma has no direct Cairo-word anchor. |
| 27:22 and 34:15 `سبإ` | Supplemented at both locations | `d167-18`–`d167-19`; the three-way hamza/tanwīn distinction and Qunbul's stated intention to stop are preserved. The 34:15 word is `لسبإ` in the Cairo text, so the source's explicit paired locator anchors the shared word `سبإ`. |
| 27:25 `ألا يسجدوا`; 27:25 `ما تخفون وما تعلنون`; 27:28 `فألقه إليهم` | Supplemented | `d168-01`–`d168-03`; retain the distinct stopping and starting procedure, Hafṣ/al-Kisāʾī tāʾ form, and the three stated hāʾ routes. |
| 27:44, 38:33, 48:29 hamza forms; 27:51 `أنا دمرناهم`; 27:59 `خير أما يشركون` | Unresolved | `s168-02`, `s168-04`, `s168-06`. The forms/locations are explicit, but the nearby reader names are not securely attributable to these contrasts under at-Taysīr's forward-lemma syntax. No attribution is borrowed from another compilation. |
| 27:49 `لنبيتنه` / `ثم لتقولن`; 27:62 `قليلا`; 27:66 `بل ادرك علمهم` | Supplemented | `d168-04`–`d168-07`; the paired Hamza/al-Kisāʾī form, Abū ʿAmr/Hishām yāʾ, and Ibn Kathīr/Abū ʿAmr hamza-separation form are preserved. The second 27:49 lemma differs from the Cairo-text spelling and has no direct token anchor; the source's verse sequence fixes its locus. |
| `{يتبعهم الغاوون}`; `سورة النمل`; `/ آتيك به / قد ذكر قنبل`; `{مهلك أهله} قد ذكر الكوفيون`; `{قدرناها} قد ذكر عاصم وابو عمرو` | Out of scope as pointers or structure | `s167-01`–`s167-02`, `s168-01`, `s168-03`, `s168-05`; no new reading form is stated in these spans. |

The checked `batch-5527-p167-168.json` records 26 items and eight tracked
passages, zero errors and zero coverage gaps, with 24 agreeing anchors and two
unanchored word forms. This closes page accounting through p. 168, not the
book. The book's earlier unresolved passages remain open; the next farsh page
is p. 169, and its uṣūl chapters and end matter have not been exhausted.
