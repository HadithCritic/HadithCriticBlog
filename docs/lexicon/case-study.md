# Lexicon case study: from Lane to a modern entry

This document works through seven roots from Lane's *Arabic-English Lexicon* and shows, for each one, what Lane gives us, what we do with it, and what the finished entry looks like. It is the reference the pipeline is built against:

- The **derivation rules** in section 4 become the parser's behavior and the instructions for drafting summaries.
- The **finished entries** in section 3 are the gold standard. Drafted entries for these roots are compared against them, and they double as test fixtures.

The finished entries below were written by hand from the Lane text (Perseus XML, converted to Arabic script). They should be reviewed and edited before they are treated as final, because every later entry will imitate them.

Source files: `C:\Users\Jonathan\Desktop\lanes-lexicon\arabic\` (Arabic-script copies) and `tools/lane_to_arabic.py` (converter).

---

## 1. The seven roots

Five are hadith-criticism vocabulary, chosen because they matter to this site's readers. Together the seven cover every shape of source data the pipeline has to handle.

| Root | Lane pages | Part of Lane | Entries | Cross-ref-only entries | Senses | What it tests |
|---|---|---|---|---|---|---|
| ح د ث | 527-529 | Main, Lane's own work | 27 | 11 | 50 | A medium root in full Lane style: long discussions, hadith quotations |
| س ن د | 1442-1444 | Main, Lane's own work | 24 | 7 | 58 | Technical senses (isnād, musnad) mixed with unrelated homonyms (Sind, anvil) |
| ع ل م | 2138-2142 | Main, Lane's own work | 38 | 10 | 96 | A very large root: grouping, Quran references, divine names |
| ن س خ | 2788-2789 | Main, later (thinner) volumes | 11 | 4 | 28 | Quran references, legal and theological terms |
| ك ت ب | 2589-2591 and supplement | Main plus supplement | 22 | 3 | 61 | Merging two records of one root |
| م ت ن | 3017 | Supplement only | 7 | 2 | 17 | A thin root, a missing technical sense, typos |
| و ض ع | 3055-3056 | Supplement only | 11 | 2 | 36 | A common root that Lane's main volume lacks entirely |

"Cross-ref-only" means entries whose whole content is "see X".

### What the source looks like

Reading these roots showed how the XML encodes Lane's structure:

| In the XML | Meaning | What the pipeline does with it |
|---|---|---|
| `<superEntry xml:id="Root_Hdv">` | One root | The unit of an entry page |
| `<entry>` with `<form>/<orth>` | One headword | Becomes a word, unless it is a cross-reference stub or a phrase |
| `<iType>2</iType>` | Verb form (Form II) | Stored as `form: 2` |
| `<span type="dis">＝</span>` | A new, unrelated meaning group (Lane's homonym break) | A strong hint for clustering |
| `<span type="sig">―</span>` | Next sense within the same group | Sense boundary |
| `<hi>` | Lane's italics: the English translation proper | The core of the gloss |
| `[ ... ]` in the text | Lane's own words, not from his Arabic sources | Provenance: "Lane" rather than a classical authority |
| `(tropical:)` / `(assumed tropical:)` | Figurative use (majāz), per the sources / per Lane's own judgment | Tag `figurative` |
| `(S, K, TA)` | Lane's sources for that statement | Mapped to works through the authorities list in `Encoding.dtd` |
| `<anchor type="arrow">` and `↓` | Lane's marker for a word that has its own article | Cross-link |
| `<pb n="528">` | Printed page | Citation back to the printed Lane |

Things the XML does **not** tag, and which the parser has to detect in plain text: Quran references (`Kur, ii. 100`, `Kur [viii. 62]`, `(Jel in iii. 31)`), hadith quotations (`occurring in a trad.`), poetry, and the source abbreviations themselves.

### Findings that shape the pipeline

1. **Lane uses the old Flügel verse numbering, and the offset changes from verse to verse.** It cannot be fixed with a fixed shift. Matching the quoted words against the site's Quran text (`src/data/quran-verses.json`) within a window of about 8 verses resolved every reference in these roots:

   | Lane writes | Standard (Cairo) |
   |---|---|
   | ii. 100 | 2:106 |
   | ii. 153 | 2:158 |
   | ii. 173 | 2:178 |
   | iii. 31 | 3:36 |
   | viii. 62 | 8:60 |
   | xxii. 29 | 22:28 |
   | xxv. 6 | 25:5 |
   | xxxviii. 82 | 38:81 |
   | xlii. 31 | 42:32 |
   | xlv. 28 | 45:29 |

   Others (lx. 10, lxv. 1, xliii. 61, lxiii. 4) happen to match the standard number.

2. **The second half of the alphabet is much thinner.** From ك onward, roots average about 6 KB of XML against 12 to 20 KB before it. Pages 2984 to 3064 are a separate supplement (the `_1` files, covering ق to ي) built from Lane's notes, with about 2 to 3 KB per root.

3. **The main volume and the supplement must be merged by root.** ك ت ب has records in both. و ض ع and م ت ن exist **only** in the supplement: Lane's main volume goes from وضر straight past وضع.

4. **Entries in the later parts are sometimes keyed on whole phrases**, for example `هُوَ مَوْضِعُ سِرِّى` instead of `مَوْضِعٌ`, or `قِرْبَةٌ كَتِيبٌ` instead of `كَتِيبٌ`. The parser has to pull out the actual word.

5. **The source abbreviations don't match the DTD list as written.** The DTD spells them with dots (`Ṣ`, `Ḳ`, `Mṣb`, `Bḍ`, `Ḥam`), while the entries use plain letters (`S`, `K`, `Msb`, `Bd`, `Ham`). The DTD also has a typo (`lbrD` for `IbrD`). Matching needs a normalization step and a small hand-made table on top.

6. **The data has typos**, and they must be recorded rather than silently fixed: `تَمُتِينٌ` for `تَمْتِينٌ` and "form" for "firm" (م ت ن), `سَنَد إِلَيْهِ` missing its final fatha and `ضُزِبَ` for `ضُرِبَ` (س ن د), `مَوُضُوعَةٌ` (و ض ع), `الخُرُوفُ` for `الحُرُوفُ` (ن س خ).

8. **A file's first page number is not always in that file.** The ك supplement file starts partway through p. 2998, before its first page marker, so its first root (ك ت ب) has no page of its own. The parser carries the last page number over from the previous file.

7. **About a third of all entries are cross-reference stubs** ("حَدُثٌ: see حَدَثٌ"). They carry no meaning of their own and become spelling variants of the word they point to.

---

## 2. The finished entry: shape

Every root page has the same parts, in this order:

1. **Header**: the root letters, a transliteration, a one-line core idea, and the Lane pages.
2. **Meaning map**: two to six groups of related meaning, each with a plain-English label, ordered from most to least useful to a reader of this site. Rare and specialized senses go in a final group.
3. **Words**, grouped by meaning. Each word has:
   - the Arabic, fully vowelled, plus a transliteration
   - what kind of word it is (Form II verb, verbal noun, active participle, plural pattern)
   - a gloss of eight words or fewer
   - one to three sentences of plain explanation
   - at most two examples, with translations
   - tags: `hadith term`, `Quran`, `figurative`, `law`, `grammar`, `divine name`
   - spelling variants that were folded in from cross-reference stubs
4. **In the Quran**: verses in standard numbering, linked to the site's Quran pages.
5. **In hadith**: quotations Lane gives, linked to the corpus once a match has been verified.
6. **Notes**: Lane discussions worth keeping, such as how two near-synonyms differ.
7. **Editorial**: material that is not from Lane, written by the editor, clearly labeled, with its source. Empty until written.
8. **Sources**: which classical works Lane draws on for this root.
9. **Lane's original**: the full Lane text, collapsed by default.

The stored data for one word looks like this (abbreviated):

```json
{
  "root": "ح د ث",
  "laneRoot": "Root_Hdv",
  "lanePages": [527, 528, 529],
  "laneSection": "main",
  "lemma": "حَدَّثَ",
  "translit": "ḥaddatha",
  "kind": { "pos": "verb", "form": 2, "imperfect": "يُحَدِّثُ", "imperfectSource": "generated" },
  "cluster": "telling",
  "gloss": "to tell, relate; to transmit hadith",
  "summary": "To tell someone something or relate a story to them. In Islamic usage, to transmit hadith: ḥaddatha ʿan fulān means he transmitted reports he heard from that person.",
  "examples": [
    { "ar": "حَدَّثَهُ الحَدِيثَ", "en": "he told him the story", "sources": ["Lisān"] }
  ],
  "tags": ["hadith term"],
  "variants": [],
  "provenance": [
    { "work": "lane", "page": 527, "entry": "HdRvhu", "senses": [1] }
  ],
  "status": "draft"
}
```

`status` is `draft` (machine or hand draft, not yet reviewed), `reviewed`, or `edited`. It works like the `[AI]` marker in the hadith corpus.

---

## 3. The seven case studies

### 3.1 ح د ث (ḥ-d-th)

**Source profile.** Lane pp. 527-529, his own work. 27 entries, of which 11 are cross-reference stubs. 50 senses, 11 marked figurative, 8 hadith quotations, 1 Quran reference.

**Decisions.**

- Lane's order is grammatical: verbs by form, then nouns by pattern. The meaning map regroups everything around four ideas that run through the root: newness, events, telling, and ritual impurity.
- ḥadīth is the reason most readers will come here, so the telling group goes first.
- The 11 stubs (ḥadutha, ḥadith, ḥudthā, ḥadathān, ḥādith, ḥāditha, uḥdūtha, muḥdath, muḥdith, ḥiddīth, ḥiddīthā) are folded into the words they point to.
- Lane's distinction between ḥadīth, khabar and athar (from the Kulliyyāt) is kept as a note, because it is exactly what a reader of this site wants to know.
- Lane's long dispute over whether to say *ḥadath al-sinn* or *ḥadīth al-sinn* is cut down to the usage.
- The philosophical distinction between ḥudūth zamānī and ḥudūth dhātī (from al-Taʿrīfāt) goes to Notes.

**Finished entry.**

> ## ح د ث · ḥ-d-th
> **Core idea:** something comes into being for the first time. From "new" come "event" and "news", and from "news" comes the ḥadīth.
> Lane, pp. 527-529.
>
> **Meaning map**
> 1. Telling: talk, stories, reports, hadith
> 2. New, recent, young
> 3. Something that happens: event, mishap, innovation
> 4. Ritual impurity
> 5. Rare: polishing a sword; the early rains
>
> **1. Telling**
>
> - **حَدَّثَ ḥaddatha** (Form II verb): *to tell, relate; to transmit hadith.* To tell someone something or relate a story to them (ḥaddathahu l-ḥadītha, "he told him the story"). In Islamic usage it means to transmit reports of the Prophet: ḥaddatha ʿan fulān, "he transmitted reports he heard from so-and-so." Verbal noun taḥdīth. `hadith term`
> - **تَحَدَّثَ taḥaddatha** (Form V verb): *to talk; to talk about something.* taḥaddatha bihi, "he talked about it, told it." yataḥaddathu ilā l-nisāʾ, "he chats with women." A hadith says the clouds "will laugh and talk with the best talk"; Ibn al-Athīr explains the talking as thunder and the laughing as lightning. `figurative`
> - **حَادَثَ ḥādatha** (Form III verb): *to converse with someone.* Verbal noun muḥādatha, conversation between two people. Form VI taḥādathū, "they talked together," is used of more than two.
> - **حَدِيثٌ ḥadīth** (noun), plural **أَحَادِيثُ aḥādīth** (irregular): *report, story, talk; a hadith.*
>   1. A piece of news, a story, talk of any length (same as khabar).
>   2. A report of what the Prophet said or did. `hadith term`
>   3. **ḥadīth qudsī**, "holy hadith": a report whose meaning is from God, given to the Prophet by inspiration or in a dream, and whose wording is the Prophet's own. The Quran ranks above it because its wording is also revealed. `hadith term`
>
>   Variants: ḥiddīthā (same meaning).
> - **أُحْدُوثَةٌ uḥdūtha** (noun): *a story people tell; talk of the town.* Some authorities restrict it to a laughable, absurd or bad story; others say it can be good. ṣāra fulān uḥdūthatan, "so-and-so became the talk of the town." `figurative`
> - **مُحَدِّثٌ muḥaddith** (active participle): *a storyteller; a hadith transmitter or scholar.* Plural muḥaddithūn, and the irregular ḥuddāth. `hadith term`
> - **رَجُلٌ حِدْثٌ rajul ḥidth**: *a great talker, a good storyteller.* ḥidth mulūk, a king's companion in conversation. Variants: ḥadith, ḥaduth, ḥiddīth.
> - **مُحَدَّثٌ muḥaddath** (passive participle): *one inspired with true intuition.* A person of sound judgment who speaks as if he had been told the thing. Used in a hadith, and applied to ʿUmar. `hadith term`
>
> **2. New, recent, young**
>
> - **حَدَثَ يَحْدُثُ ḥadatha, yaḥduthu** (Form I verb): *to be new; to come into being.* Verbal nouns ḥudūth and ḥadātha. Opposite of qaduma, "to be old." ḥadatha amrun, "something happened." In the paired phrase mā qaduma wa-mā ḥadutha, "old and new worries," the verb takes a damma (ḥadutha) to match qaduma; this is the only case where it does.
> - **حَدِيثٌ ḥadīth** (adjective): *new, recent.* Opposite of qadīm. ḥadīth al-sinn, "young." ḥadīth ʿahd bi-l-islām, "a recent convert."
> - **حَدَثٌ ḥadath** (adjective and noun): *young; a youth.* Plural aḥdāth and ḥudthān. Also used of young animals.
> - **حَدَاثَةٌ ḥadātha** (noun): *newness; youth.* ḥadāthat al-sinn, "youth, the first part of life."
> - **حِدْثَانٌ ḥidthān** (noun): *the beginning or fresh state of something.* fī ḥidthān shabābihi, "in his early youth." The Prophet's words to ʿĀʾisha: "Were it not that your people have so recently left unbelief, I would demolish the Kaʿba and rebuild it" (also transmitted with ḥadātha). `hadith`
> - **أَحْدَثُ aḥdath** (comparative): *newer, newest.* Feminine ḥudthā. "My most recently married wife" (from a hadith).
> - **مُحْدَثٌ muḥdath** (passive participle): *newly made; post-classical.* Of a poet, a post-classical author. al-muḥdathūn, "the moderns," as opposed to al-qudamāʾ, "the ancients."
>
> **3. Something that happens**
>
> - **أَحْدَثَ aḥdatha** (Form IV verb): *to bring about, originate, invent.* Of God or a person: to make something exist for the first time. Quran 65:1, "God may bring about some new matter." aḥdatha ḥadathan, "he introduced an innovation." Form X istaḥdatha has the same meaning, and also "to come by fresh news." `Quran`
> - **حَدَثٌ ḥadath** (noun): *an innovation; an event or mishap.*
>   1. Something new, especially an innovation in religion not known from scripture or the Sunna. Also amr muḥdath, plural muḥdathāt al-umūr, "newly invented matters": innovations of people in error.
>   2. An event, usually a bad one (same as ḥāditha). aḥdāth al-dahr, "the blows of fortune."
>   3. In Sībawayh's grammar, the verbal noun (maṣdar), since verbal nouns name events. `grammar`
> - **حَادِثَةٌ ḥāditha** (noun), plural **حَوَادِثُ ḥawādith**: *an event; a misfortune.* The plural is more common than the singular. ḥawādith al-dahr, "the misfortunes of time." Variants: ḥadathān, ḥidthān.
>
> **4. Ritual impurity**
>
> - **حَدَثٌ ḥadath** (noun): *a state that breaks ritual purity.* Literally an evacuation of the bowels or breaking of wind. In law, the impurity that prevents prayer until ablution. Plural aḥdāth. The verb is aḥdatha, "he did something that broke his ritual purity." `law` `figurative`
> - **أَحْدَثَ aḥdatha** also has the rarer figurative sense "to commit fornication."
>
> **5. Rare**
>
> - **حَادَثَ سَيْفَهُ ḥādatha sayfahu**: *he polished his sword*, as if making it new. A saying of al-Ḥasan al-Baṣrī: "Polish these hearts with the remembrance of God, for they quickly grow dull." `figurative`
> - **حَدَثٌ ḥadath**: the rain that follows the wasmī rain; aḥdāth, the rains at the start of the year. arḍ maḥdūtha, land that has received this rain.
>
> **In the Quran:** 65:1 (yuḥdithu).
>
> **In hadith** (to be linked once matched in the corpus): the Kaʿba report to ʿĀʾisha; the clouds that "laugh and talk"; "my most recently married wife"; ʿUmar as muḥaddath; āwā muḥdithan / muḥdathan, "he sheltered an offender" or "he embraced an innovation."
>
> **Notes.**
> - *ḥadīth, khabar, athar.* Lane gives two views. In the first, all three can mean a report traced back to the Prophet, a Companion or a Successor. In the second (al-Kulliyyāt), ḥadīth is what comes from the Prophet, khabar what comes from someone else (or from anyone), and athar what comes from a Companion, though it is also used of the Prophet's sayings.
> - *Two kinds of coming into being* (al-Taʿrīfāt): ḥudūth zamānī, being preceded by non-existence in time, and ḥudūth dhātī, depending on something else for one's existence.
>
> **Editorial** (not from Lane, needs a source before publishing): ḥaddathanā, "he told us," is the transmission formula that normally signals the transmitter heard the report directly.
>
> **Sources Lane draws on:** Ṣiḥāḥ, Qāmūs, Lisān al-ʿArab, Miṣbāḥ, Mughrib, Asās, Tāj al-ʿArūs, al-Taʿrīfāt, al-Kulliyyāt, Ibn al-Athīr.

---

### 3.2 س ن د (s-n-d)

**Source profile.** Lane pp. 1442-1444, his own work. 24 entries, 7 stubs, 58 senses, 23 marked figurative, 1 Quran reference.

**Decisions.**

- The root mixes one productive idea (leaning on something for support) with unrelated homonyms: the land of Sind, a Yemeni cloth, an anvil, the ilex tree. The homonyms go in a final "Other words spelled with these letters" group so they don't interrupt the main explanation.
- The hadith senses (asnada, isnād, sanad, musnad) are shown as the natural extension of "leaning": a report leans on the authorities it is traced back to. Lane makes this link himself with his bracketed gloss "resting it upon his authority."
- Lane notes that Sībawayh used musnad and musnad ilayhi the opposite way round from later grammarians. That is kept in short form, because it confuses anyone reading old grammar.
- Lane's camel descriptions (sinād, musānada) are cut to one line each.
- Data issues recorded: `سَنَد إِلَيْهِ` missing its final fatha (should be سَنَدَ), `سَنَدَفِى` and `هُوَسَنَدِى` with no space, and `ضُزِبَ` for `ضُرِبَ`.

**Finished entry.**

> ## س ن د · s-n-d
> **Core idea:** leaning on something for support. From this come relying on a person, propping something up, and tracing a report back to the authorities it rests on.
> Lane, pp. 1442-1444.
>
> **Meaning map**
> 1. Tracing a report to its authorities (isnād)
> 2. Leaning, propping, relying
> 3. Grammar and logic: attribution
> 4. Other words spelled with these letters
>
> **1. Tracing a report**
>
> - **أَسْنَدَ asnada** (Form IV verb): *to trace a report back to its source.* asnada l-ḥadītha ilā qāʾilihi: to attribute a report to the person who said it, by naming the transmitters one after another, without a break, up to the Prophet ("so-and-so told me, from so-and-so, from the Messenger of God"). Some allowed the term even when the chain has a gap. Verbal noun isnād. `hadith term` `figurative`
> - **إِسْنَادٌ isnād** (verbal noun), plural **أَسَانِيدُ asānīd**: *the chain of authorities behind a report.* A saying quoted in the Asās: al-asānīd qawāʾim al-aḥādīth, "chains of transmission are the legs that reports stand on." Also used to mean riwāya, "transmission." `hadith term`
> - **سَنَدٌ sanad** (noun): *a support; the authority a report rests on.* ḥadīth qawī al-sanad, "a report with a strong chain." `hadith term`
> - **مُسْنَدٌ musnad** (passive participle): *a report traced back with a connected chain.* Used of a report traced back by naming its transmitters without a break up to the Prophet. The opposite of mursal and munqaṭiʿ, though some allowed a musnad to have a gap. Plural masānid, and masānīd (used by al-Shāfiʿī). `hadith term`
> - **أَسْنَدُ asnad** (comparative): *more firmly traced back* (of a report).
>
> **2. Leaning, propping, relying**
>
> - **سَنَدَ يَسْنُدُ إِلَى sanada, yasnudu ilā** (Form I verb; also sanida, yasnadu), and more commonly **اِسْتَنَدَ istanada** (Form VIII): *to lean against.* Of a person leaning on a wall or other support. Forms VI tasānada and IV asnada are also used this way.
> - **سَنَدَ يَسْنُدُ فِى الجَبَلِ sanada, yasnudu fī l-jabal**: *to climb a mountain.* Figuratively, sanada li-l-khamsīn, "he was nearing fifty." `figurative`
> - **أَسْنَدَ asnada** (Form IV, transitive): *to lean something against; to entrust.* asnada ẓahrahu ilā l-ḥāʾiṭ, "he leaned his back against the wall." asnadtu ilayhi amrī, "I rested my affair on him," that is, entrusted it to him. `figurative`
> - **سَانَدَ sānada** (Form III verb): *to prop up; to help.* sūnida l-marīḍ, "the sick man was propped up on a cushion." Also: to help someone, or to reward them for work. `figurative`
> - **سَنَّدَ sannada** (Form II verb): *to prop up with wooden stays* against a wall.
> - **سَنَدٌ sanad** (noun): *a slope; a support; someone relied on.* The rising face of a mountain or valley. Anything one leans on. Of a person, one's mainstay: huwa sanadī, "he is my support." Variant: mustanad. `figurative`
> - **مِسْنَدٌ misnad / مَسْنَدٌ masnad** (nouns of place and instrument): *a cushion; a couch or throne.* Plural masānid.
> - **خُشُبٌ مُسَنَّدَةٌ khushubun musannadatun**: *timbers propped against a wall.* Quran 63:4, describing the hypocrites. `Quran`
> - **مُتَسَانِدِينَ mutasānidīn**: *setting out side by side, each group under its own banner,* not under one commander. `figurative`
>
> **3. Grammar and logic**
>
> - **إِسْنَادٌ isnād**: *predication.* In logic, judging that a thing does or does not have an attribute. isnād majāzī, "figurative attribution," for example ʿīsha rāḍiya, "a contented life," for a life that is pleasing. `grammar`
> - **مُسْنَدٌ musnad / مُسْنَدٌ إِلَيْهِ musnad ilayhi**: *predicate and subject.* In later usage musnad is the predicate and musnad ilayhi the subject. Sībawayh's usage, as Lane reports it, is the reverse. `grammar`
>
> **4. Other words spelled with these letters**
>
> - **السِّنْدُ al-Sind**: the land between India, Kirmān and Sijistān, or its people (one person: sindī). Also the river Indus.
> - **سَنَدٌ sanad**: a striped Yemeni cloth of the burd type.
> - **سَنْدَانٌ sandān / sindān**: an anvil. sindān is also a big strong man or wolf; sindāna a she-ass.
> - **سِنْدِيَانٌ sindiyān**: the ilex, or evergreen oak.
> - **مُسْنَدٌ musnad**: one of doubtful lineage, or an adopted son (also sanīd). al-musnad: the Ḥimyarite script of Yemen. ākhir al-musnad: "to the end of time," that is, never.
> - **سِنَادٌ sinād**, **مُسَانَدَةٌ musānada**: strong, well-built she-camels.
>
> **In the Quran:** 63:4 (musannada).
>
> **Editorial** (not from Lane, needs a source): musnad as a book genre, a hadith collection arranged by Companion, as in the Musnad of Aḥmad ibn Ḥanbal.
>
> **Sources Lane draws on:** Ṣiḥāḥ, Muḥkam, Qāmūs, Miṣbāḥ, Asās, Tahdhīb, Lisān, al-ʿUbāb, Tāj al-ʿArūs, al-Kulliyyāt, al-Taʿrīfāt, Ḥamāsa commentary.

---

### 3.3 ع ل م (ʿ-l-m)

**Source profile.** Lane pp. 2138-2142, his own work. 38 entries, 10 stubs, 96 senses, 10 Quran references, 2 hadith quotations. The largest root in this set.

**Decisions.**

- Lane's article opens with a long discussion of the difference between ʿilm, maʿrifa and shuʿūr, drawn from the Miṣbāḥ and the Tāj. It is valuable but dense. The entry gives a one-sentence version in the gloss and keeps the fuller version in Notes.
- The marks-and-signs meaning (ʿalam, ʿalāma, maʿlam) is a full second branch of the root, not a footnote, so it gets its own group.
- The harelip senses (ʿalima, aʿlam, ʿalmāʾ) and the scattered rare words (ʿaylam, ʿullām) go in the last group.
- The three divine names are grouped and tagged.
- All ten Quran references needed conversion. The verse numbers in the entry are already converted.

**Finished entry.**

> ## ع ل م · ʿ-l-m
> **Core idea:** knowing. A second branch means a mark or sign, the thing by which something is known.
> Lane, pp. 2138-2142.
>
> **Meaning map**
> 1. Knowing, learning, teaching
> 2. Marks, signs, way-markers, banners
> 3. The world
> 4. Rare: split lip, wells, birds and plants
>
> **1. Knowing, learning, teaching**
>
> - **عَلِمَ يَعْلَمُ ʿalima, yaʿlamu** (Form I verb): *to know.* Verbal noun ʿilm. Most lexicographers treat it as the same as ʿarafa, "to know, recognize," but most critics distinguish them (see Notes). With two objects it means "to know someone to be something": fa-in ʿalimtumūhunna muʾmināt, "if you know them to be believers" (Quran 60:10). With bi- it means "to be aware of": mā ʿalimtu bi-khabari qudūmihi, "I knew nothing of his arrival." yaʿlamu llāh, "God knows," is used as an oath.
> - **عِلْمٌ ʿilm** (verbal noun): *knowledge.* No plural in the classical language. In later usage the plural ʿulūm means "the sciences." Sometimes used for a strong opinion, since that stands in for knowledge. Some explained it as "acting on knowledge" in Quran 12:68, though Lane thinks the plain meaning fits better there.
> - **عَالِمٌ ʿālim** and **عَلِيمٌ ʿalīm** (adjectives): *learned; one whose knowledge is firmly rooted.* Plurals ʿulamāʾ and ʿullām. A beginner is a mutaʿallim, not yet an ʿālim. Also explained as "one who acts on what he knows."
> - **عَلَّامٌ ʿallām**, **عَلَّامَةٌ ʿallāma** (intensive adjectives): *very learned.* The final -a of ʿallāma marks the highest degree, and it is used of women as well as men. Both also mean a great genealogist. Variants: ʿullām, tiʿlima, tiʿlāma.
> - **أَعْلَمُ aʿlam** (comparative): *more or most knowing.* Said of God it often just means "knowing": Allāhu aʿlam, "God knows best," or simply "God knows." Quran 3:36. `Quran`
> - **العَلِيمُ al-ʿAlīm, العَالِمُ al-ʿĀlim, العَلَّامُ al-ʿAllām**: *the All-Knowing.* As names of God: the one who knows what has been and what will be, from whom nothing in the earth or the heavens is hidden. `divine name`
> - **عَلَّمَ ʿallama** (Form II verb): *to teach.* ʿallamtuhu l-Fātiḥa, "I taught him the Opening Chapter." Verbal noun taʿlīm.
> - **أَعْلَمَ aʿlama** (Form IV verb): *to inform, notify.* Al-Rāghib's distinction: iʿlām is a quick telling, taʿlīm repeated teaching that leaves a mark on the learner. Verbal noun iʿlām, "notification, announcement."
> - **تَعَلَّمَ taʿallama** (Form V verb): *to learn.* taʿallama l-ʿilm, "he acquired knowledge." The imperative taʿallam can mean simply "know that ..."
> - **اِسْتَعْلَمَ istaʿlama** (Form X verb): *to ask to be told.* istaʿlamanī l-khabara fa-aʿlamtuhu, "he asked me for the news and I told him."
> - **عَالَمَهُ فَعَلَمَهُ ʿālamahu fa-ʿalamahu**: *he competed with him in knowledge and beat him.* In this pattern the second verb's imperfect is always yaʿlumu (yaʿlumuhu, "he beats him in knowledge").
> - **مُعَلِّمٌ muʿallim**: *a teacher.* **مُتَعَلِّمٌ mutaʿallim**: *a learner.* **مُعَلَّمٌ muʿallam**: *taught; guided by inspiration to what is right.* **عِلْمِىٌّ ʿilmī**: *theoretical, scholarly*, as opposed to ʿamalī, "practical."
> - **مَعْلُومٌ maʿlūm** (passive participle): *known.* al-waqt al-maʿlūm, "the known time": the Resurrection (Quran 15:38, 38:81). al-ayyām al-maʿlūmāt, "the known days": the first ten days of Dhū l-Ḥijja (Quran 22:28). In grammar, the active voice. `Quran`
>
> **2. Marks and signs**
>
> - **عَلَمَ يَعْلُمُ / يَعْلِمُ ʿalama, yaʿlumu or yaʿlimu** (Form I verb): *to mark something.* Same as wasamahu. Form IV aʿlama: to put a mark on cloth or a book, to embroider a border, or (of a horseman) to wear the badge of the brave. ʿallama l-qabra, "he set a stone on the grave."
> - **عَلَامَةٌ ʿalāma** (noun), plural ʿalāmāt: *a sign, mark, symptom, badge.* Variants: ʿalam, uʿlūma, ʿalām.
> - **عَلَمٌ ʿalam** (noun), plural aʿlām:
>   1. A sign or mark; a trace or footprint.
>   2. The embroidered border of a garment.
>   3. A way-marker set up in the desert; aʿlām al-ḥaram, the boundary markers of the Sacred Territory.
>   4. A mountain, or a long mountain. Quran 42:32 and 55:24 compare ships to aʿlām, "mountains."
>   5. A banner or flag.
>   6. The chief of a people (as visible as a mountain or banner). `figurative`
>   7. In grammar, a proper name (ʿalamiyya, being a proper name). `grammar`
>   8. In the plural (aʿlām, also maʿālim), the signs of the pilgrimage rites: the places where they are performed, the animals for sacrifice, and the rites themselves. This is how the commentators explain Quran 2:158, 2:198, 22:32 and 22:36.
> - **مَعْلَمٌ maʿlam** (noun of place), plural maʿālim: *a sign that guides; a landmark.* maʿlam al-ṭarīq, "the marker of the road." Also where something is known to be found: huwa maʿlam li-l-khayr, "goodness is to be found in him." Variants with the same meaning: ʿalm, ʿullāma. A reading of Quran 43:61 with ʿalm, la-ʿalmun li-l-sāʿa (as Lane gives it, for the usual la-ʿilmun), makes Jesus, by his descent, "a sign of the Hour." `Quran` `qirāʾa`
>
> **3. The world**
>
> - **العَالَمُ al-ʿālam** (noun), plurals ʿālamūn and ʿawālim: *the world; all creation.* Lane's sources explain it as "that by which something is known," above all that by which the Creator is known. They differ on its scope: all created things, or only rational beings, or mankind and the jinn. One also says ʿālam al-ins, "the world of mankind," ʿālam al-ḥayawān, "the animal kingdom." Jaʿfar al-Ṣādiq's division into the "great world" (the heavens) and the "small world" (man, a microcosm). Also "a generation of people."
> - **رَبُّ العَالَمِينَ Rabb al-ʿālamīn**: Ibn ʿAbbās explained it as "Lord of jinn and mankind," Qatāda as "Lord of all creatures." Al-Azharī backs Ibn ʿAbbās from Quran 25:1, where the Prophet is a warner to al-ʿālamīn, which cannot include beasts or angels. `Quran`
>
> **4. Rare**
>
> - **أَعْلَمُ aʿlam**, feminine **عَلْمَاءُ ʿalmāʾ**: *harelipped.* The verbs are ʿalima, yaʿlamu, "to have a split upper lip," and ʿalama, yaʿlimu shafatahu, "he split his lip." al-ʿalmāʾ is also a coat of mail.
> - **عَيْلَمٌ ʿaylam**: a well with abundant water; the sea; the water under the earth; a large cooking pot; a frog. ʿaylām: a male hyena.
> - **عُلَّامٌ ʿullām**: a hawk; henna; the kernel of the lote-fruit stone.
> - **اِعْتَلَمَ iʿtalama**: of water, to flow over the ground; of lightning, to flash over a mountain.
>
> **In the Quran:** 2:158, 2:198, 3:36, 8:60, 12:68, 15:38, 22:28, 22:32, 22:36, 25:1, 38:81, 42:32, 43:61, 55:24, 60:10.
>
> **Notes.**
> - *ʿilm and maʿrifa.* Most lexicographers treat them as the same. Most critics separate them and hold ʿilm to be the higher, since it is attributed to God, while God is not called ʿārif. The Miṣbāḥ explains: when ʿalima means certainty it takes two objects; when it means recognizing (ʿarafa) it takes one (Quran 8:60, "you do not know them; God knows them").
> - *taʿlīm and iʿlām* (Sībawayh, al-Rāghib): see aʿlama above.
>
> **Sources Lane draws on:** Ṣiḥāḥ, Qāmūs, Miṣbāḥ, Tāj al-ʿArūs, Muḥkam, Mughrib, Baṣāʾir, Kashshāf, Bayḍāwī, Jalālayn, Ḥamāsa commentary, Ibn Jinnī, Ibn Barrī.

---

### 3.4 ن س خ (n-s-kh)

**Source profile.** Lane pp. 2788-2789, the later main volume. 11 entries, 4 stubs, 28 senses, 7 Quran references (counting mentions), 6 figurative.

**Decisions.**

- Lane's core definition, "one thing taking the place of another," holds the whole root together, so it becomes the core idea and every group is phrased as a version of it.
- Abrogation (naskh) and copying are the senses readers need. They lead.
- Lane's note on the variant reading of Ibn ʿĀmir (nunsikh for nansakh in 2:106) is kept, tagged as a qirāʾa. It can link to the site's Qirāʾāt project later.
- The saying mā nasakhahu wa-innamā masakhahu, "he did not copy it, he garbled it," is promoted to an example. It is directly relevant to textual criticism.
- The grammatical nawāsikh (inna, kāna, ẓanna and their sisters) are kept as a grammar sense.

**Finished entry.**

> ## ن س خ · n-s-kh
> **Core idea:** one thing takes the place of another. From this come abrogation, copying (a copy takes the place of the original), and the passing of souls into new bodies.
> Lane, pp. 2788-2789.
>
> **Meaning map**
> 1. Abrogation: one ruling replacing another
> 2. Copying a text
> 3. Change, succession, transformation
> 4. Law and grammar
>
> **1. Abrogation**
>
> - **نَسَخَ يَنْسَخُ nasakha, yansakhu** (Form I verb): *to cancel or replace one thing with another.* Lane's sources' examples: "the sun replaced the shade," "grey hair replaced youth." Of God and the Quran: to abrogate a verse by substituting another. Verbal noun naskh. Also intasakha. `figurative`
> - **Abrogation (naskh) in law**, as the Miṣbāḥ explains it: it can affect a verse's wording, its ruling, or both, and a command can be abrogated before it is carried out. The example given is Abraham's command to sacrifice his son. `law`
> - **أَنْسَخَ ansakha** (Form IV verb): *to cause a verse to be abrogated*, or to find it abrogated. At Quran 2:106, Ibn ʿĀmir reads mā nunsikh instead of mā nansakh. `Quran` `qirāʾa`
> - **آيَةٌ نَاسِخَةٌ āya nāsikha / آيَةٌ مَنْسُوخَةٌ āya mansūkha**: *an abrogating verse / an abrogated verse.* `Quran`
>
> **2. Copying a text**
>
> - **نَسَخَ الكِتَابَ nasakha l-kitāba**: *to copy a text letter by letter.* Also intasakhahu and istansakhahu.
> - **مَا نَسَخَهُ وَإِنَّمَا مَسَخَهُ mā nasakhahu wa-innamā masakhahu**: *"He did not copy it, he only garbled it,"* by changing the dots and so the meanings.
> - **نَسْتَنْسِخُ nastansikhu**: *we record and preserve*, or *we have it copied and recorded.* Quran 45:29, "We were recording all that you did." `Quran`
> - **نُسْخَةٌ nuskha** (noun), plural nusakh: *a copy; the original a copy is made from.* So called because it stands in for the original.
> - **نَاسِخٌ nāsikh** (active participle): *a copyist.* Variant: muntasikh.
> - **مَنْسُوخٌ mansūkh** (passive participle): *copied* (of a text). Variant: muntasakh.
>
> **3. Change, succession, transformation**
>
> - **نَسَخَ nasakha**: *to change or alter.* "The wind altered (or erased) the traces of the camp."
> - **نَسَخَ nasakha**: *to transfer* something from one place to another, as bees to a new hive.
> - **نَسَخَهُ nasakhahu** (same as masakhahu): *to transform into a worse shape.* nasakhahu llāhu qirdan, "God turned him into an ape."
> - **تَنَاسَخَ tanāsakha** (Form VI verb): *to follow one another, each taking the other's place.* tanāsakhat al-qurūn, "the ages succeeded one another." `figurative`
> - **تَنَاسُخُ الأَرْوَاحِ tanāsukh al-arwāḥ**: *transmigration of souls.* A note in a copy of al-Taʿrīfāt names the stages: into another human body naskh, into an animal maskh, into a plant faskh, into a lifeless body raskh. **التَّنَاسُخِيَّةُ al-Tanāsukhiyya**: the sect that holds this and denies the resurrection.
> - **بَلْدَةٌ نَسِيخَةٌ balda nasīkha**: *a distant land.* Variant: nusakhiyya.
>
> **4. Law and grammar**
>
> - **تَنَاسُخٌ tanāsukh / مُنَاسَخَةٌ munāsakha** (inheritance): *heirs dying one after another before an estate is divided.* `law`
> - **نَاسِخٌ nāsikh** (grammar): *a particle or verb that changes a nominal sentence*, such as inna, kāna and ẓanna and their sisters. al-ḥurūf al-nāsikha li-l-ibtidāʾ, "the particles that cancel the subject's independent status." `grammar`
>
> **In the Quran:** 2:106, 45:29.
>
> **Editorial** (not from Lane, needs a source): nāsikh al-ḥadīth wa-mansūkhuh, the field that deals with hadith superseded by other hadith.
>
> **Sources Lane draws on:** Ṣiḥāḥ, Lisān, Qāmūs, Miṣbāḥ, Asās, Tahdhīb, Tāj al-ʿArūs, al-Taʿrīfāt, al-Farrāʾ, Ibn al-Aʿrābī.

---

### 3.5 ك ت ب (k-t-b)

**Source profile.** Lane pp. 2589-2591 in the main volume, plus one supplement entry on p. 2998. 22 entries, 3 stubs, 61 senses, 7 Quran references, 12 figurative.

**Decisions.**

- The supplement adds one new sense to an existing word (kitāb as the marriage ceremony). It is merged into the main kitāb entry, with its provenance recorded as "Lane supplement."
- Lane groups the senses under four homonym breaks (＝): writing, decreeing, binding, troops. That grouping is right and is kept, reordered by importance.
- The binding senses involve camel and mule anatomy. They are kept, briefly and plainly worded.
- kataba ʿanhu, "he wrote down what he heard from him," which Lane calls "a phrase of common occurrence in biographies," is tagged as a hadith term because it is how transmission by writing is described in the rijāl literature.

**Finished entry.**

> ## ك ت ب · k-t-b
> **Core idea:** writing. Separate branches mean prescribing (what God "writes" is decreed), drawing or binding together, and a body of troops.
> Lane, pp. 2589-2591, and supplement.
>
> **Meaning map**
> 1. Writing, books, letters, scripture
> 2. Prescribing and decreeing
> 3. Binding and closing
> 4. Troops
> 5. Rare
>
> **1. Writing**
>
> - **كَتَبَ يَكْتُبُ kataba, yaktubu** (Form I verb): *to write.* Verbal nouns katb, kitāba, kitāb, kitba. kataba ʿanhu, "he wrote down what he heard from him," a phrase common in biographies. kataba can also mean "to be a scribe and a learned man." `hadith term`
> - **اِكْتَتَبَ iktataba** (Form VIII verb): *to write for oneself, or have something written or dictated.* Quran 25:5, "he has had them written down." Also: to enter one's name in the army register. `Quran`
> - **اِسْتَكْتَبَ istaktaba** (Form X verb): *to ask someone to write something.*
> - **أَكْتَبَ aktaba** (Form IV verb): *to dictate.* aktibnī hādhihi l-qaṣīda, "dictate this ode to me." Also, with kattaba (Form II): to teach writing.
> - **كَاتَبَ kātaba** (Form III verb): *to write to someone.* takātabā, "they wrote to each other."
> - **مُكَاتَبَةٌ mukātaba**: *a contract by which a slave buys his freedom* in installments. Both the slave and the master can be called mukātab or mukātib; later jurists keep mukātab for the slave and mukātib for the master. Jurists also call it kitāba, even when nothing is written. `law`
> - **كِتَابٌ kitāb** (noun), plurals kutub and kutb:
>   1. Anything written: a book, a record, a letter.
>   2. A revealed scripture. ahl al-kitāb, "people of a scripture." al-Kitāb, the Torah, the Gospel, or the Quran.
>   3. The marriage ceremony: katabū kitābahu ʿalā fulāna, "they performed his marriage contract with so-and-so" (supplement).
>   4. A container for ink.
>
>   Variant: katība (a writing).
> - **كَاتِبٌ kātib** (active participle), plurals kuttāb, kātibūn, kataba: *a writer, scribe, secretary.* Among the early Arabs, also a learned man, since few could write (Quran 52:41, 68:47). `Quran`
> - **كِتَابَةٌ kitāba**: *the art of writing.* **كِتْبَةٌ kitba**: *a manner of writing*; also copying a book.
> - **مَكْتَبٌ maktab** and **كُتَّابٌ kuttāb**, plurals makātib and katātīb: *a school where writing is taught.* Some held that kuttāb properly means the pupils, not the place, but it is attested in the classical language for the school.
> - **مُكْتِبٌ muktib**: *a writing teacher.* **كُتُبِىٌّ kutubī**: *a bookseller* (a colloquial word).
>
> **2. Prescribing and decreeing**
>
> - **كَتَبَ kataba** (of God): *to prescribe and make obligatory.* kutiba ʿalaykum al-qiṣāṣ, "retaliation is prescribed for you" (Quran 2:178); kutiba ʿalaykum al-ṣiyām, "fasting is prescribed for you" (Quran 2:183). Of a judge: to rule, as in "the judge ruled that the expenses be paid." `Quran` `law` `figurative`
> - **كِتَابٌ kitāb**: *a divine decree; predestination.* "I will judge between you by the kitāb of God," from a hadith, where the kitāb is God's ruling and not the Quran. al-kitāb al-awwal, "the first writing": the register of God's decrees.
>
> **3. Binding and closing**
>
> - **كَتَبَ يَكْتُبُ / يَكْتِبُ kataba, yaktubu or yaktibu**: *to draw together; to sew or tie shut.* To sew a waterskin with two thongs, or tie its mouth shut (also aktaba, iktataba). To close a she-camel's or mule's vulva with a ring, to prevent mating.
> - **كُتْبَةٌ kutba**, plural kutab: *a sewing thong; a seam.* **قِرْبَةٌ كَتِيبٌ qirba katīb**: a skin sewn or tied shut.
>
> **4. Troops**
>
> - **كَتِيبَةٌ katība**, plural katāʾib: *a troop of soldiers.* A body of an army, or a raiding troop of cavalry from one hundred to a thousand.
> - **كَتَّبَ الكَتَائِبَ kattaba l-katāʾib**: *to marshal troops, unit by unit.* takattaba, of an army: to gather. `figurative`
>
> **5. Rare**
>
> - **كُتَّابٌ kuttāb**: a small round-headed arrow boys learn to shoot with.
> - **اِكْتَتَبَ iktataba**: to be constipated; to have one's urine held back. `figurative`
> - **مُكَتَّبٌ mukattab**: a partly eaten bunch of grapes. **مُكْتَوْتِبٌ muktawtib**: swollen, full.
>
> **In the Quran:** 2:178, 2:183, 25:5, 52:41, 68:47.
>
> **Sources Lane draws on:** Ṣiḥāḥ, Qāmūs, Miṣbāḥ, Asās, Tāj al-ʿArūs, Muḥkam, Mughrib, Bayḍāwī, al-Azharī, al-Layth, Ibn al-Aʿrābī.

---

### 3.6 م ت ن (m-t-n)

**Source profile.** Supplement only, p. 3017. 7 entries, 2 stubs, 17 senses, no Quran references.

**Decisions.**

- A thin root, so nothing is cut. The task here is ordering and filling gaps honestly.
- Lane's only hadith-related sense is matn as "a tradition," the same as ḥadīth, khabar and athar (from Ibrāhīm al-Dasūqī). He does not give the sense every hadith student knows: matn as the text of a report, as opposed to its chain. The entry gives Lane's sense and flags the gap in Editorial.
- The anatomical definition of matn (Lane's "erector spinae muscle") is rewritten in plain words: the firm flesh on either side of the backbone.
- Data issues recorded: `تَمُتِينٌ` for `تَمْتِينٌ`, and "form" for "firm" in the gloss of mattanahu.

**Finished entry.**

> ## م ت ن · m-t-n
> **Core idea:** firmness. The matn is the firm, hard part of a thing: the muscle along the back, the flat of a blade, raised hard ground.
> Lane, p. 3017 (supplement).
>
> **Meaning map**
> 1. Firm and strong
> 2. The back, the middle, the hard surface
> 3. A report (hadith)
>
> **1. Firm and strong**
>
> - **مَتِينٌ matīn** (adjective): *strong, firm, solid.* Lane adds: having any quality to a strong degree.
> - **مَتَّنَ mattana** (Form II verb): *to make strong or firm.* Verbal noun tamtīn. Also: to season a skin with thickened fruit juice (rubb).
> - **أَمْتَنُ حَلَاوَةً amtanu ḥalāwatan**: *sweeter*, more intensely sweet.
>
> **2. The back, the middle, the hard surface**
>
> - **مَتْنٌ matn** (noun), plurals mutūn and mitān:
>   1. The back. More exactly, the two firm strips of flesh and sinew on either side of the backbone (matnā l-ẓahr, also matna).
>   2. The flat of a sword blade, or the raised ridge along its middle.
>   3. The hard outer or visible part of anything.
>   4. The middle of a bow or spear.
>   5. Raised, level, hard ground.
>   6. The space between two tent poles.
>   7. matn al-faras, a star in Pegasus.
> - **تَمْتِينٌ tamtīn**, **تِمْتَانٌ timtān**: *tent ropes.*
>
> **3. A report**
>
> - **مَتْنٌ matn**: *a tradition*; the same as ḥadīth, khabar and athar. A report from the Prophet, or from a Companion or someone else (Ibrāhīm al-Dasūqī). `hadith term`
>
> **Editorial** (not from Lane, needs a source): in hadith criticism the matn is the text of a report as opposed to its isnād, the chain of transmitters. The word is also used for a base text as opposed to its commentary.

---

### 3.7 و ض ع (w-ḍ-ʿ)

**Source profile.** Supplement only, pp. 3055-3056. 11 entries, 2 stubs, 36 senses. Lane's main volume has no article for this root at all.

**Decisions.**

- This is the clearest example of why the lexicon needs more than Lane. A root this common has only a short supplement article built from notes.
- Lane does give "to forge (a word, or poetry ascribed to someone)" from al-Suyūṭī's Muzhir. That is the nearest he comes to the hadith sense, and it is kept and tagged. The hadith terms mawḍūʿ, "fabricated report," and waḍḍāʿ, "fabricator," are absent and go into Editorial.
- Lane records mawḍūʿ and marfūʿ as opposite names for two gaits of a riding animal. This pairing also exists in hadith terminology (marfūʿ, "raised to the Prophet"). The entry gives Lane's meaning plainly and does not speculate about a connection.
- Phrase headwords are reduced to words: `هُوَ مَوْضِعُ سِرِّى` becomes mawḍiʿ, with the phrase kept as an example.
- Data issue recorded: `مَوُضُوعَةٌ` (stray damma).

**Finished entry.**

> ## و ض ع · w-ḍ-ʿ
> **Core idea:** putting something down. The opposite of rafaʿa, "to raise." From it come lowering, humility, giving birth, laying down rules and meanings, and forging.
> Lane, pp. 3055-3056 (supplement only).
>
> **Meaning map**
> 1. Putting down, laying down
> 2. Lowering and humility
> 3. Setting up: rules, meanings, forgeries
> 4. Place and subject
>
> **1. Putting down**
>
> - **وَضَعَ يَضَعُ waḍaʿa, yaḍaʿu** (Form I verb; the imperfect is not given by Lane): *to put or lay something down.* The opposite of rafaʿa. Broader in meaning than ḥaṭṭa.
>   - waḍaʿat: *she gave birth.*
>   - waḍaʿū l-ḥarb: *they laid down war, made peace.* `figurative`
>   - waḍaʿa ʿalayhi: *to impose a tax or fine on someone.*
>   - waḍaʿa (with a tax as object): *to remit it, not collect it.*
>
> **2. Lowering and humility**
>
> - **وَضَعَ مِنْهُ waḍaʿa minhu**: *to lower someone's rank or standing.*
> - **وُضِعَ فِى تِجَارَتِهِ wuḍiʿa fī tijāratihi**: *he lost money in his trade.* Also ūḍiʿa (Form IV, passive).
> - **تَوَاضَعَ tawāḍaʿa** (Form VI verb): *to be humble; to humble oneself.* Of land: to lie lower than the land around it. `figurative` tawāḍaʿā l-ruhūn: "they laid bets with each other."
> - **وَضِيعٌ waḍīʿ** (adjective): *lowly, of no rank.* akama mutawāḍiʿa: a low hill.
>
> **3. Setting up: rules, meanings, forgeries**
>
> - **وَضَعَ waḍaʿa**: *to forge* a word, or poetry ascribed to someone else (al-Suyūṭī, al-Muzhir). `hadith term`
> - **وَضَعَ لَهُ waḍaʿa lahu**: *to appoint a sign or token for someone.*
> - **وَضَعَ لَفْظًا لِشَىْءٍ waḍaʿa lafẓan li-shayʾ**: *to assign a word to a meaning.* `grammar`
> - **وَضْعٌ waḍʿ** (verbal noun): *posture* (one of the ten categories of logic); *make, constitution*; *manner.*
> - **مُوَاضَعَةٌ muwāḍaʿa**: *convention, agreed usage* (same as iṣṭilāḥ). `grammar`
>
> **4. Place and subject**
>
> - **مَوْضِعٌ mawḍiʿ** (noun of place): *a place; the proper place.*
>   - huwa mawḍiʿu sirrī: "he is the keeper of my secrets."
>   - The proper meaning or use of a word.
>   - Grounds for something: fulān mawḍiʿ li-l-ikrām, "so-and-so deserves to be honored."
> - **مَوْضُوعٌ mawḍūʿ** (passive participle):
>   1. In logic, *a subject* as opposed to a predicate (maḥmūl), or *a substance* as opposed to an accident. `figurative`
>   2. *The subject* of a book.
>   3. A gait of a riding animal, the opposite of marfūʿ.
>
> **Editorial** (not from Lane, needs a source): in hadith criticism, mawḍūʿ is a fabricated report and waḍḍāʿ a fabricator. Neither sense appears in Lane.

---

## 4. Derivation rules

These are what the seven case studies add up to. The parser and the summary drafting follow them, and they will grow as more roots are reviewed.

### Structure

1. **The unit is the root.** Merge every `superEntry` with the same root id across the main volume and the supplement. Record which part each sense came from.
2. **Fold cross-reference stubs into their targets.** An entry whose only content is "see X" never becomes a word of its own. Its spelling becomes a variant of X, searchable but not displayed separately.
3. **Reduce phrase headwords to words.** When a headword is a phrase (`هُوَ مَوْضِعُ سِرِّى`), find the word from the root and keep the phrase as an example.
4. **Group senses into a meaning map of two to six groups.** Lane's `＝` breaks are strong hints for separate groups. His `―` divisions are senses within a group. A verb and the nouns that share its meaning belong in the same group, not in separate verb and noun sections.
5. **Order groups by what a reader of this site is most likely looking for.** Hadith and Quran vocabulary first, then everyday meanings, then rare and specialized senses last. Within a group, the base verb or most common word first.
6. **Put unrelated homonyms in a final group** ("Other words spelled with these letters") instead of forcing a connection.

### Each word

7. **Give every word:** fully vowelled Arabic, transliteration in the site's style (ḥ, ʿ, ā), what kind of word it is, a gloss of eight words or fewer, one to three sentences of explanation, and at most two examples. Form I verbs also show their imperfect (see decision 2 in section 5).
8. **Translate Lane's grammar terms:**

   | Lane | Entry |
   |---|---|
   | aor. | imperfect (yafʿalu form) |
   | inf. n. | verbal noun |
   | act. part. n. / pass. part. n. | active / passive participle |
   | n. un. | single-item noun |
   | coll. gen. n. | collective noun |
   | i. q. / syn. | same as / synonym of |
   | contr. of | opposite of |
   | trad. | hadith, or report |
   | Kur, Kur-án | Quran |
   | Mohammad, the Apostle of God | the Prophet |
   | El-Islám, Islámee | Islam, Islamic |
   | 2, 4, 10 (verb numbers) | Form II, Form IV, Form X |

9. **Use modern English.** No Victorian phrasing ("such a one" becomes "so-and-so", "voided his ordure" becomes "relieved himself").
10. **Keep sense distinctions the sources draw, and say when they disagree.** "Some authorities restrict it to a bad story; others say it can be good." Drop disputes over spelling or plural forms unless the form itself matters to a reader.

### Tags and links

11. **Tags:** `hadith term`, `Quran`, `qirāʾa`, `figurative`, `law`, `grammar`, `divine name`. `(tropical:)` and `(assumed tropical:)` both become `figurative`. The second is stored with a note that the judgment is Lane's own.
12. **Quran references:** convert every one to standard numbering by matching the quoted words against `src/data/quran-verses.json` within about 8 verses of Lane's number. If nothing matches, flag it for review and do not guess.
13. **Hadith quotations:** store the Arabic text. Link to the corpus only after a full-text match has been checked. Until then, list them without links.
14. **Sources:** map abbreviations to works through the authorities list in `Encoding.dtd`, after normalizing dotted letters (Ṣ to S, Ḳ to K, ḍ to d). Keep a hand-made table for the ones that still don't match. Show works by their usual names (Ṣiḥāḥ, Qāmūs, Lisān al-ʿArab), not Lane's abbreviations.

### Provenance and honesty

15. **Every word records where it came from:** Lane page, entry id, and sense numbers. Every summary carries a status (`draft`, `reviewed`, `edited`).
16. **Lane's own words are marked.** Text in square brackets is Lane speaking, not his Arabic sources. A summary built on it records "Lane" as the source.
17. **Never present outside knowledge as Lane's.** When a technical sense looks missing (matn as the text of a report, mawḍūʿ as fabricated), the pipeline flags the gap and leaves the Editorial slot empty. The editor writes Editorial notes, each with a named source. The Editorial notes in section 3 are placeholders that show where a note belongs, not finished text.
18. **Never silently fix the data.** Typos go into a corrections list (word, what the XML says, proposed fix). Corrections are applied at build time, so the source files stay untouched.
19. **Keep the full Lane text available** on every root page, collapsed by default, with page references.

### What to leave out or shorten

20. Long chains of authorities for a single word, alternate readings between manuscript copies (CK, TK) that don't change the meaning, and Lane's references to other articles that we have already merged.

---

## 5. Decisions

Settled 2026-11-04.

1. **Crude or explicit senses** stay in, plainly worded, like the rest of the entry. No hiding.
2. **Form I verbs show the imperfect** on the word line, in Arabic and transliteration: كَتَبَ يَكْتُبُ kataba, yaktubu. Where Lane gives more than one imperfect, show all of them. Where Lane gives none, supply the standard one and record that it is not from Lane. Derived forms (II to X) have predictable imperfects, so they are generated for the details view and not shown on the word line.
3. **Editorial notes are written by the editor**, not drafted by the pipeline. The pipeline only flags likely gaps (a hadith or Quran technical sense with no matching sense in Lane) and leaves an empty Editorial slot for review.
4. **Address:** `/lexicon/`, alongside `/hadith/` and `/narrators/`.
5. **Review:** entries are published as `draft` and reviewed over time. Hadith and Quran vocabulary is reviewed first.
