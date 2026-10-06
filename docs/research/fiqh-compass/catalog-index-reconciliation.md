# Current Shamela index reconciliation

Generated UTC: 2026-10-05T02:14:48.411812+00:00

## Inventory checks

- Current index: 8,538 unique book IDs, SHA-256 `d5ab93126517f9c11bb631185ad3b79f650ae2e199c42f831247bc48e03cbe73`.
- Indexed corpus record counts sum to 7,552,019; serial ranges cover 1–7,552,019 with 0 overlaps and 0 gaps.
- Page count sum: 2,705,783; volume count sum: 30,718; 40 categories; 396 records lack an author string.
- Previous catalog snapshot: 8,492 IDs; current index adds 46 and drops 0.
- The 46 additions exactly match the prior Parquet-only ID set: True.

## Newly surfaced fiqh discovery candidates

These records were absent from the previous catalog snapshot, but are present in the new metadata index. Keyword/category matches are discovery leads only; review the source identity, edition, text layer, completeness, and rights before citing or using them.

| ID | Title | Catalogued author | Category | Records |
|---:|---|---|---|---:|
| 30064 | موسوعة أحكام الصلوات الخمس | أبو عمر دبيان بن محمد الدبيان | الفقه العام | 10332 |
| 30065 | موسوعة الفقه على المذاهب الأربعة | د ابن النجار الدمياطي ، أبو عمار ياسر بن أحمد بن بدر النجار الدمياطي راجعه : مجمع البحوث الإسلامية بالأزهر الشريف | الفقه العام | 15248 |
| 30066 | فتح وهاب المآرب على دليل الطالب لنيل المطالب | أحمد بن محمد بن عوض المرداوي [ كان حيا 1140 هـ ] | الفقه الحنبلي | 2245 |
| 30079 | فقه الصيام ومستجداته المعاصرة | أ . د . فضل بن عبد الله مراد | مسائل فقهية | 555 |
| 30081 | كتائب أعلام الأخيار من فقهاء مذهب النعمان المختار | محمود بن سليمان الكفوي ( ت 990 هـ ) | التراجم والطبقات | 2189 |
| 30083 | قطعة من تكملة المجموع شرح المهذب (تنشر لأول مرة) | تقي الدين علي بن عبد الكافي بن علي السبكي ( ت 756 هـ ) حققه وخرج أحاديثه وعلق عليه : د أويس منصور | الفقه الشافعي | 1731 |
| 30084 | القواعد الأم للفقه | أ . د . فضل بن عبد الله مراد | علوم الفقه والقواعد الفقهية | 774 |
| 30087 | معجم المصطلحات والألفاظ الفقهية | محمود عبد الرحمن عبد المنعم | الغريب والمعاجم | 1670 |
| 30128 | أحكام الطلاق (الطلاق السني والطلاق البدعي) | أبو عبد الرحمن أحمد بن عبد الرحمن الزومان | مسائل فقهية | 771 |
| 30130 | أسنى المطالب شرح روض الطالب | أبو يحيى زكريا الأنصاري الشافعي ( ت 926 هـ ) ومعه حاشية : أبى العباس بن أحمد الرملي الكبير ( ت 957 هـ )، جرَّدها من خطه محمد الشوبرى [ ت 1069 هـ ] ضبط نصه وخرج أحاديثه وعلق عليه : د محمد محمد تامر ( كلية دار العلوم - قسم الشريعة ) تنبيه : اعتمد المحقق على الطبعة الميمنية القديمة ، وجعل تعليقاته هو مع حاشية الرملي في الهامش . وذكر أن ما بدأ بكلمة ( قوله . . .) فهو من حاشية الرملي ، وغيره هو من كلام المحقق ، فليُتَنبَّه | الفقه الشافعي | 5785 |
| 30133 | الدرة في الحج والعمرة | أبو عبد الرحمن يحيى بن علي الحجوري | مسائل فقهية | 605 |
| 30135 | مسالك الجلالة في اختصار المناهل الزلالة | المختار بن العربي مؤمن الجزائري ثم الشنقيطي | الفقه المالكي | 1528 |

## Limits and workflow

The index says which catalog records and serial intervals are available in the local corpus. It cannot show that a work is complete or accurate, that its attribution/edition is correct, or that a quotation represents a school or legal position. Rights are not granted by indexing. Keep all passages and score mappings behind source, edition, and rights review.

Machine-readable detail, including all newly surfaced records and the 12 roadmap starter entries: `catalog-index-reconciliation.json`.
