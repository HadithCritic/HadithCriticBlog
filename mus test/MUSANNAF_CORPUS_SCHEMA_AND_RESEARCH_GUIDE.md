# The Dual *Muṣannaf* Corpus: Technical Schema, Statistical Benchmarks & Research Guide

> **Target Audience**: AI Engineering Agents, Frontier LLMs, and Digital Humanities Researchers.  
> **Purpose**: Provides the complete structural schema, field data dictionary, statistical baselines, and representative JSON records for the two primary extant pre-classical Islamic legal compendia without requiring ingestion of the multi-gigabyte raw files.

---

## 1. Corpus Executive Summary & Comparative Benchmarks

| Metric | *Muṣannaf ʿAbd al-Razzāq* | *Muṣannaf Ibn Abī Shaybah* |
|---|---|---|
| **Author / Compiler** | Abū Bakr ʿAbd al-Razzāq al-Ṣanʿānī (d. 211 A.H. / 827 CE) | Abū Bakr Ibn Abī Shaybah (d. 235 A.H. / 849 CE) |
| **Geographic Center** | Ṣanʿāʾ (Yemen), with Meccan & Basran networks | Kufa (Iraq), with Hijazi connections |
| **Local File Path** | `mus test/musannaf-abd-al-razzaq.json` | `mus test/musannaf-ibn-abi-shaybah.json` |
| **Raw File Size** | **411,595,489 bytes (~411.6 MB)** | **703,323,480 bytes (~703.3 MB)** |
| **Total Hadith Records** | **21,109 narrations** | **39,096 narrations** |
| **Combined Corpus Volume**| **60,205 total pre-classical traditions (~1.12 GB of structured JSON)** |
| **Prophetic (*Marfūʿ*)** | **4,068 records (19.3%)** | **7,746 records (19.8%)** |
| **Non-Prophetic (*Āthār*)** | **17,041 records (80.7%)** | **31,350 records (80.2%)** |
| **Expressed Doubt (*Shakk*)** | **190 isnād occurrences (0.90%)** | **183 isnād occurrences (0.47%)** |

### The Core Methodological Reality
Both independent compendia exhibit the **exact same ~80% to 20% ratio** of Companion/Successor legal rulings (*āthār*) to Prophetic hadiths (*marfūʿ*). This empirically verifies Harald Motzki’s thesis (*The Origins of Islamic Jurisprudence*, Brill 2002): early Islamic jurisprudence was **not** initially codified as backward projections of prophetic hadith (as Joseph Schacht claimed), but as systematic regional records of 1st- and 2nd-century living legal practice.

---

## 2. Core Informants & Regional Transmission Networks

### Top Primary Informants in *ʿAbd al-Razzāq* (21,109 Records)
*Computed directly from the transmitter immediately preceding ʿAbd al-Razzāq in `chain_of_narrators`:*

1. **Maʿmar ibn Rāshid** (d. 153 / Basra ➔ Yemen): **6,476 traditions (30.7%)**
2. **Ibn Jurayj** (d. 150 / Mecca): **4,798 traditions (22.7%)**
3. **Sufyān al-Thawrī** (d. 161 / Kufa): **4,285 traditions (20.3%)**
4. **Sufyān ibn ʿUyayna** (d. 198 / Kufa ➔ Mecca): **962 traditions (4.6%)**
5. **Ibrāhīm b. Muḥammad b. Abī Yaḥyā** (d. 184 / Medina): **262 traditions (1.2%)**
6. **Isrāʾīl b. Yūnus** (d. 162 / Kufa): **243 traditions (1.2%)**
7. **Muʿtamir b. Sulaymān** (d. 187 / Basra): **222 traditions (1.1%)**
8. **ʿAbd Allāh b. ʿUmar al-ʿUmarī** (d. 171 / Medina): **219 traditions (1.0%)**
9. **Hishām b. Ḥassān** (d. 148 / Basra): **199 traditions (0.9%)**
10. **Mālik ibn Anas** (d. 179 / Medina): **196 traditions (0.9%)**

### Top Direct Informants in *Ibn Abī Shaybah* (39,096 Records)
1. **Wakīʿ ibn al-Jarrāḥ** (d. 197 / Kufa): **9,193 traditions (23.5%)** *(Primary transmitter from Sufyān al-Thawrī)*
2. **Ḥafṣ ibn Ghiyāth** (d. 194 / Kufa): **1,795 traditions (4.6%)**
3. **Hushaym ibn Bashīr** (d. 183 / Wasit): **1,664 traditions (4.3%)**
4. **Ḥammād ibn Usāma (Abū Usāma)** (d. 201 / Kufa): **1,638 traditions (4.2%)**
5. **Ismāʿīl ibn ʿUlayya** (d. 193 / Basra): **1,561 traditions (4.0%)**
6. **Yazīd ibn Hārūn** (d. 206 / Wasit): **1,389 traditions (3.6%)**
7. **Abū Muʿāwiya al-Ḍarīr** (d. 195 / Kufa): **1,375 traditions (3.5%)**
8. **Muḥammad ibn Fuḍayl** (d. 195 / Kufa): **1,333 traditions (3.4%)**
9. **Jarīr ibn ʿAbd al-Ḥamīd** (d. 188 / Rayy / Kufa): **1,308 traditions (3.3%)**
10. **Sufyān ibn ʿUyayna** (d. 198 / Mecca): **1,094 traditions (2.8% direct audition)**

### Shared 1st-Century Authorities Across Both Corpora
- **Ibrāhīm al-Nakhaʿī** (Kufa, d. 96): 4,659 in IAS; thousands via al-Thawrī in AR.
- **al-Ḥasan al-Baṣrī** (Basra, d. 110): 3,785 in IAS; prominent via Maʿmar & Qatāda in AR.
- **ʿAṭāʾ ibn Abī Rabāḥ** (Mecca, d. 114): 2,700 in IAS; 39% of Ibn Jurayj's entire corpus in AR.
- **Ibn Shihāb al-Zuhrī** (Medina/Syria, d. 124): 1,160 in IAS; 28% of Maʿmar's corpus in AR.

---

## 3. Universal JSON Record Schema & Field Dictionary

Every item in both JSON files is an object within a top-level array `[ { ... }, { ... } ]`. The schema is unified across both collections:

```typescript
interface HadithRecord {
  // 1. Identification & Pagination
  mainId: number;                  // Global database record ID in the Ifta corpus
  book: string;                    // Arabic book title: "مصنف عبد الرزاق" or "مصنف ابن أبي شيبة"
  chapter: string;                 // Subject chapter heading (e.g. "باب غسل الذراعين")
  hadith_num: string;              // Printed tradition index (e.g. "1", "1250", etc.)

  // 2. Full Narration Text
  hadith_text: string;             // Unvowelled Arabic text containing isnād + matn + volume/page header
  hadith_text_diac: string;        // Full Tashkeel (vocalized) Arabic text

  // 3. Extracted Matn (Content only, without Isnād)
  matn_text: string;               // Unvowelled legal ruling / dialogue / statement
  matn_text_diac: string;          // Fully vocalized matn

  // 4. Structured Transmitter Parsing
  names: Array<[
    standardName: string,          // Standardized lookup name (e.g. "ابن جريج")
    vowelledName: string,          // Vocalized name (e.g. "ابْنِ جُرَيْجٍ")
    narratorId: number             // Relational database ID for narrator in Ifta Rijal database
  ]>;

  narrators: string[];             // Flat list of standardized transmitter names in this narration

  chain_of_narrators: Array<      // Directional transmission path(s):
    string[]                       // [Originating Authority, Teacher 1, Teacher 2, ..., Compiler]
  >;

  narration_words: Array<[         // Transmission verbs used between links:
    unvowelledVerb: string,        // e.g. "عن", "قال", "حدثنا", "أخبرنا", "سمعت"
    vowelledVerb: string
  ]>;

  // 5. Semantic & Apparatus Metadata
  places: Array<[placeName: string, placeDiac: string, placeId: number]>;
  ghareeb: Array<[word: string, wordDiac: string, dictionaryId: number]>;
  subjects: Array<[topicString: string, topicId: number]>;
  
  takhreej: Array<{                // Parallel citations in classical Hadith compendia
    book_name: string;
    page_info: string;             // e.g. "1 (ج1 ص5)"
    bookId: number;
    mainId: number;
  }>;

  comparisons: Array<{
    comparison_type: string;       // e.g. "بنحوه.", "مثله."
    book_name: string;
    page_info: string;
    bookId: number;
    mainId: number;
  }>;

  shawahed: any[];

  // 6. Detailed Jurisprudential & Critical Features
  features: {
    مرفوع?: Array<[text: string, textDiac: string]>;        // Present if Prophetic narration
    موقوف?: Array<[text: string, textDiac: string]>;        // Present if Companion narration
    مقطوع?: Array<[text: string, textDiac: string]>;        // Present if Successor/Jurist fatwā
    متن_مرفوع?: Array<[text: string, textDiac: string]>;
    متن_موقوف?: Array<[text: string, textDiac: string]>;
    متن_مقطوع?: Array<[text: string, textDiac: string]>;
    المصنف?: Array<[name: string, nameDiac: string]>;       // The compiler (ʿAbd al-Razzāq / Ibn Abī Shaybah)
    شيخ_المصنف?: Array<[name: string, nameDiac: string]>;   // Direct teacher (e.g. Ibn Jurayj, Wakīʿ)
    صاحب_الأثر?: Array<[name: string, nameDiac: string]>;   // The primary jurist whose ruling is reported
    راوي_أعلى_مرفوع?: Array<[name: string, diac: string]>;
    صيغة_تحديث?: Array<[verb: string, verbDiac: string]>;
    طرف?: Array<[incipit: string, incipitDiac: string]>;   // Narration incipit (first phrase)
    رقم_حديث_مطبوع?: string[];
  };
}
```

---

## 4. Concrete Examples from *Muṣannaf ʿAbd al-Razzāq*

### Example A: 1st-Century Meccan Legal Ruling (*Maqṭūʿ* Fatwā)
> **Significance**: Demonstrates ʿAbd al-Razzāq reproducing the direct student notes of **Ibn Jurayj questioning ʿAṭāʾ b. Abī Rabāḥ** (d. 114) in Mecca regarding ritual purification. Notice the presence of `features.مقطوع` and `features.صاحب_الأثر`.

```json
{
  "mainId": 213430,
  "book": "مصنف عبد الرزاق",
  "chapter": "باب غسل الذراعين",
  "hadith_num": "1",
  "hadith_text": "[1/5]\r\n     بسم الله الرحمن الرحيم  كتاب الطهارة  باب غسل الذراعين  1  -  عبد الرزاق  عن  ابن جريج قال :  قلت لعطاء :  أرأيت إن غمست يدي في  كظامة  غمسا  قال  : حسبك ، والرجل كذلك ولكن أنقها  .",
  "hadith_text_diac": "[1/5]\r\n     بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ  كِتَابُ الطَّهَارَةِ  بَابُ غَسْلِ الذِّرَاعَيْنِ  1  -  عَبْدُ الرَّزَّاقِ  عَنِ  ابْنِ جُرَيْجٍ قَالَ :  قُلْتُ لِعَطَاءٍ :  أَرَأَيْتَ إِنْ غَمَسْتُ يَدَيَّ فِي  كِظَامَةٍ  غَمْسًا  قَالَ  : حَسْبُكَ ، وَالرِّجْلُ كَذَلِكَ وَلَكِنْ أَنْقِهَا  .",
  "matn_text": "قلت لعطاء :  أرأيت إن غمست يدي في  كظامة  غمسا  قال  : حسبك ، والرجل كذلك ولكن أنقها",
  "matn_text_diac": "قُلْتُ لِعَطَاءٍ :  أَرَأَيْتَ إِنْ غَمَسْتُ يَدَيَّ فِي  كِظَامَةٍ  غَمْسًا  قَالَ  : حَسْبُكَ ، وَالرِّجْلُ كَذَلِكَ وَلَكِنْ أَنْقِهَا",
  "names": [
    ["عبد الرزاق", "عَبْدُ الرَّزَّاقِ", 3447],
    ["ابن جريج", "ابْنِ جُرَيْجٍ", 4035],
    ["لعطاء", "لِعَطَاءٍ", 4385]
  ],
  "narrators": [
    "ابن جريج",
    "عطاء بن أبي رباح",
    "عبد الرزاق الصنعاني"
  ],
  "chain_of_narrators": [
    [
      "عطاء بن أبي رباح",
      "ابن جريج",
      "عبد الرزاق الصنعاني"
    ]
  ],
  "narration_words": [
    ["عن", "عَنِ"],
    ["قال", "قَالَ"]
  ],
  "ghareeb": [
    ["كظامة", "كِظَامَةٍ", 12664]
  ],
  "subjects": [
    ["غسل الكفين قبل إدخالهما في الإناء : الفقه", 8436],
    ["غسل اليدين قبل إدخالهما في الإناء : الفقه", 8598]
  ],
  "features": {
    "مقطوع": [
      ["عبد الرزاق  عن  ابن جريج قال :  قلت لعطاء...", "عَبْدُ الرَّزَّاقِ..."]
    ],
    "المصنف": [["عبد الرزاق", "عَبْدُ الرَّزَّاقِ"]],
    "شيخ_المصنف": [["ابن جريج", "ابْنِ جُرَيْجٍ"]],
    "صاحب_الأثر": [["لعطاء", "لِعَطَاءٍ"]]
  }
}
```

---

### Example B: Inadvertent Criterion of Authenticity (Expressed Doubt / *Shakk*)
> **Significance**: Tradition #379. ʿAbd al-Razzāq preserves his teacher Maʿmar's honest uncertainty about whether the intermediate transmitter was *"Qatāda OR SOMEONE ELSE"* (`سمعت قتادة ، أو غيره`). Under Motzki's analysis, a forger fabricating chains never advertises doubt about their own sources.

```json
{
  "mainId": 213808,
  "book": "مصنف عبد الرزاق",
  "chapter": "باب الوضوء بفضل سؤر الحائض والجنب",
  "hadith_num": "379",
  "hadith_text": "379  -  عبد الرزاق  عن  معمر قال :  سمعت  قتادة ، أو غيره  يحدث عن  عكرمة ،  عن  ابن عباس ، أنه  كان لا يرى بأسا بفضل طهور الحائض  .",
  "matn_text": "أنه  كان لا يرى بأسا بفضل طهور الحائض",
  "narrators": [
    "معمر بن راشد",
    "قتادة بن دعامة السدوسي",
    "عكرمة مولى ابن عباس",
    "عبد الله بن عباس",
    "عبد الرزاق الصنعاني"
  ],
  "chain_of_narrators": [
    [
      "عبد الله بن عباس",
      "عكرمة مولى ابن عباس",
      "قتادة بن دعامة السدوسي",
      "معمر بن راشد",
      "عبد الرزاق الصنعاني"
    ]
  ],
  "features": {
    "موقوف": [
      ["عبد الرزاق  عن  معمر قال :  سمعت  قتادة ، أو غيره...", "..."]
    ],
    "شيخ_المصنف": [["معمر", "مَعْمَرٌ"]],
    "صاحب_الأثر": [["ابن عباس", "ابْنِ عَبَّاسٍ"]]
  }
}
```

---

## 5. Concrete Examples from *Muṣannaf Ibn Abī Shaybah*

### Example C: Kufan Juristic Tradition (*Maqṭūʿ* Precedent)
> **Significance**: Ibn Abī Shaybah transmitting via his chief teacher **Wakīʿ b. al-Jarrāḥ** (accounting for 23.5% of the book) from **Sufyān al-Thawrī** from **Ibrāhīm al-Nakhaʿī** (d. 96). This is the hallmark transmission line of the early Kufan legal school.

```json
{
  "mainId": 237077,
  "book": "مصنف ابن أبي شيبة",
  "chapter": "ما يقول الرجل إِذا دخل الخلاء",
  "hadith_num": "6",
  "hadith_text": "6  -  حدثنا  وكيع ،  عن  سفيان ،  عن  منصور ،  عن  إبراهيم قال :  كانوا يقولون :  أعوذ بالله من الخبيث المخبث الرجس النجس الشيطان الرجيم  .",
  "hadith_text_diac": "6  -  حَدَّثَنَا  وَكِيعٌ ،  عَنْ  سُفْيَانَ ،  عَنْ  مَنْصُورٍ ،  عَنْ  إِبْرَاهِيمَ قَالَ :  كَانُوا يَقُولُونَ :  أَعُوذُ بِاللَّهِ مِنَ الْخَبِيثِ الْمُخْبِثِ الرِّجْسِ النَّجِسِ الشَّيْطَانِ الرَّجِيمِ  .",
  "matn_text": "كانوا يقولون :  أعوذ بالله من الخبيث المخبث الرجس النجس الشيطان الرجيم",
  "names": [
    ["أبو بكر عبد الله بن محمد بن أبي شيبة", "أَبُو بَكْرٍ عَبْدُ اللهِ بْنُ مُحَمَّدِ بْنِ أَبِي شَيْبَةَ", 3889],
    ["وكيع بن الجراح", "وَكِيعٌ", 8072],
    ["سفيان الثوري", "سُفْيَانَ", 3058],
    ["منصور بن المعتمر", "مَنْصُورٍ", 7772],
    ["إبراهيم النخعي", "إِبْرَاهِيمَ", 137]
  ],
  "narrators": [
    "وكيع بن الجراح",
    "سفيان الثوري",
    "منصور بن المعتمر",
    "إبراهيم النخعي",
    "أبو بكر ابن أبي شيبة"
  ],
  "chain_of_narrators": [
    [
      "إبراهيم النخعي",
      "منصور بن المعتمر",
      "سفيان الثوري",
      "وكيع بن الجراح",
      "أبو بكر ابن أبي شيبة"
    ]
  ],
  "features": {
    "مقطوع": [
      ["حدثنا  وكيع ،  عن  سفيان ،  عن  منصور ،  عن  إبراهيم قال...", "..."]
    ],
    "المصنف": [["أبو بكر ابن أبي شيبة", "أَبُو بَكْرٍ"]],
    "شيخ_المصنف": [["وكيع", "وَكِيعٌ"]],
    "صاحب_الأثر": [["إبراهيم", "إِبْرَاهِيمَ"]]
  }
}
```

---

### Example D: Cross-Corpus Parallel via Hijazi Common Link
> **Significance**: Ibn Abī Shaybah heard directly from **Sufyān b. ʿUyayna** (who is also ʿAbd al-Razzāq’s 4th largest teacher). Both collections independently preserve Ibn ʿUyayna’s transmission from ʿAmr b. Dīnār and al-Zuhrī.

```json
{
  "mainId": 237073,
  "book": "مصنف ابن أبي شيبة",
  "chapter": "ما يقول الرجل إِذا دخل الخلاء",
  "hadith_num": "2",
  "hadith_text": "2  -  حدثنا  ابن عيينة ،  عن  عمرو ،  عن  سعيد بن جبير قال :  كان يستحب أن يقول الرجل إِذا دخل الخلاء :  بسم الله أعوذ بالله من الرجس النجس الخبيث المخبث الشيطان الرجيم  .",
  "matn_text": "كان يستحب أن يقول الرجل إِذا دخل الخلاء :  بسم الله أعوذ بالله من الرجس النجس الخبيث المخبث الشيطان الرجيم",
  "narrators": [
    "سفيان بن عيينة",
    "عمرو بن دينار",
    "سعيد بن جبير",
    "أبو بكر ابن أبي شيبة"
  ],
  "chain_of_narrators": [
    [
      "سعيد بن جبير",
      "عمرو بن دينار",
      "سفيan بن عيينة",
      "أبو بكر ابن أبي شيبة"
    ]
  ],
  "features": {
    "مقطوع": [["حدثنا  ابن عيينة ،  عن  عمرو ،  عن  سعيد بن جبير...", "..."]],
    "المصنف": [["أبو بكر ابن أبي شيبة", "أَبُو بَكْرٍ"]],
    "شيخ_المصنف": [["ابن عيينة", "ابْنُ عُيَيْنَةَ"]],
    "صاحب_الأثر": [["سعيد بن جبير", "سَعِيدِ بْنِ جُبَيْرٍ"]]
  }
}
```

---

## 6. How an LLM / Developer Can Programmatically Query This Data

### 1. Extracting Primary Informant Sub-Corpora (Python)
```python
import json

def get_teacher_corpus(json_path: str, compiler_name: str, teacher_query: str):
    """Filter all narrations derived from a specific direct teacher."""
    with open(json_path, 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    
    matches = []
    for item in corpus:
        chains = item.get('chain_of_narrators', [])
        for chain in chains:
            for i, narrator in enumerate(chain):
                if compiler_name in narrator and i > 0:
                    if teacher_query in chain[i - 1]:
                        matches.append(item)
                        break
    return matches

# Example: Extract all 4,798 Ibn Jurayj traditions in Abd al-Razzaq
ibn_jurayj_corpus = get_teacher_corpus(
    'mus test/musannaf-abd-al-razzaq.json',
    'عبد الرزاق',
    'ابن جريج'
)
print(f"Found {len(ibn_jurayj_corpus)} Ibn Jurayj traditions.")
```

### 2. Identifying Cross-Muṣannaf Parallel Legal Mutūn
Because both datasets contain clean `subjects` and `chapter` tags along with standardized `names`:
1. Query by topic: e.g. `item['chapter']` contains `"نكاح"` or `"طلاق"` or `"بيوع"`.
2. Match 1st-century common authorities: e.g. `ʿAṭāʾ` or `Ibrāhīm al-Nakhaʿī`.
3. Align the Yemeni/Meccan recension (ʿAbd al-Razzāq) against the Kufan recension (Ibn Abī Shaybah) to verify whether identical rulings were transmitted through independent channels.

---

## 7. Recommended Project Implementations

1. **Interactive Motzki Replication Dashboard**:
   - Dynamic charts comparing the teacher distribution of ʿAbd al-Razzāq (Maʿmar 30.7%, Ibn Jurayj 22.7%, al-Thawrī 20.3%) against Ibn Abī Shaybah (Wakīʿ 23.5%, al-Thawrī 10.6%).
2. **Pre-Classical vs. Classical Genre Visualizer**:
   - An interactive bar contrasting the 80% non-prophetic *āthār* composition of early *Muṣannafs* versus 3rd-century Sahīh collections.
3. **Cross-Muṣannaf Isnād Graph Explorer**:
   - Interactive transmission diagrams showing how 2nd-century common links (Sufyān al-Thawrī, Ibn ʿUyayna, Ibn Jurayj) bridge the Kufan and Yemeni/Meccan corpora.
