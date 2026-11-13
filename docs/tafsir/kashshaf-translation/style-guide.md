# al-Kashshāf translation: style guide

How the English translation of al-Zamakhsharī’s *al-Kashshāf* is laid out, one surah per document. Sūras 100 to 114 follow it (`sources/100.md` to `sources/114.md`); every rule below is applied there and checked by `render.py`.

## 1. The unit of work: the passage

al-Zamakhsharī does not comment verse by verse. He quotes a run of verses and then comments on them as one unit. The edition marks each run with a bracketed heading, such as `[سورة فاطر (35) : الآيات 5 الى 7]`, and every run is listed in [`../al-kashshaf-verse-groupings.md`](../al-kashshaf-verse-groupings.md).

- Translate one passage at a time: its verse block, then all of its commentary.
- Never split a passage across verse blocks, and never merge two passages under one block.
- A surah with several passages has one header and then one block per passage, in order.
- Where the groupings file notes an irregular heading (a re-quoted range, a shared verse), keep the printed range and follow the note.

## 2. Layout of a document

1. **Title**, bold, centered: `Sūrat al-Nās (114)`. Use the transliterated name and the surah number. No underline.
2. **Revelation line**, roman, centered: a translation of the edition’s opening line (`مكية، وقيل مدنية، وآياتها 6 [نزلت بعد الفلق]`), always in this form:
   `Meccan; it is also said Medinan. Six verses. [Revealed after al-Falaq (113).]`
   Write the count as a word, and give the earlier surah’s number. The square brackets are the edition’s.
   Where the edition qualifies the status, translate it in the same slot: `Meccan in its first three verses, Medinan in the rest.` (107), `Revealed at Minā during the Farewell Pilgrimage, and so counted Medinan; it is the last sūra to be revealed.` (110). A note the edition adds after the bracket follows it as one more sentence (109, *al-muqashqishatān*).
   A second count goes after the first: `Thirty verses; it is also said twenty-nine.` (89). A note inside the bracket follows the name after a semicolon: `[Revealed after al-ʿAnkabūt (29); it is the last sūra revealed in Mecca.]` (83). Al-ʿAlaq has no earlier sūra, so its bracket is `[It is the first of the Qurʾān to be revealed.]` (96).
3. **Basmala**, roman, centered, in Khalifa’s wording (the verse 0 row of the Qur’an file). Leave it out for al-Fātiḥa, where it is verse 1, and for al-Tawba, which has none.
4. **Passage label**, small gray capitals, centered: `Qurʾān 114:1–6 · al-Kashshāf, vol. 4, pp. 823–824`. The pages run from the heading to the end of the passage’s commentary.
5. **Verse block**, centered: each verse is preceded by its upright number in parentheses, `(1)`, then the verse in italics, all in one flowing paragraph. The English is Rashad Khalifa’s translation, taken unaltered from the Qur’an file, so it keeps his wording (“the people,” “GOD”). Optionally, the Arabic goes above it with verse-end marks ﴿١﴾.
6. **Commentary**, justified, first-line indent, no blank lines between paragraphs, in the order of the Arabic. Nothing is moved, summarized or left out.

Items 1 to 3 appear once, at the start of the surah. A later passage starts at its label.

## 3. Paragraphs

Start a new paragraph at each of these, and only there:

| Where the Arabic… | The paragraph opens with |
|---|---|
| begins on a new verse or a new phrase of the verse (the lemma) | the lemma label, **“*The sneaking*” (al-khannās):** |
| asks فإن قلت | **If you ask:** (the answer قلت follows in the same paragraph as **I say:**) |
| begins a report that opens a new topic (وعن ابن عباس) | **From Ibn ʿAbbās:** |
| closes with the sūra’s virtue ḥadīth | **From the Messenger of God ﷺ:** |
| turns to a new topic (readings, a summary, a prayer) | plain text |

Inside a paragraph, these stay inline and unbolded:

- **A second lemma from the same verse:** “*When it settles*” (*waqab*).
- **A report cited as evidence:** From ʿĀʾisha ﵂: …
- **A follow-up question:** it still gets its own **If you ask:** paragraph. Each فإن قلت is its own paragraph.

## 4. Lemma labels

- The form is **“*English*” (transliteration):**. The English is in bold italics and the quotation marks, transliteration and colon are bold roman.
- Give a label only where the edition prints the vocalized Qurʾān words and the commentary turns to them. A verse word mentioned in passing, inside a sentence, stays inline in italics and quotes.
- The English is Khalifa’s, so the label reads the same as the verse block above it: “*He is the Redeemer*” (innahu kāna tawwāban), “*The great miracle*” (al-āyata l-kubrā). Take his words as they stand, with GOD in capitals and his spellings (Quran, Gehenna, Thamûd, Salsabeel). Only the case of the first letter changes: a label always starts with a capital.
- Every label gives the transliteration of the Arabic it quotes, even when the commentary says no more about the word: (lam yalid), (min sharri mā khalaq). Where Khalifa’s English drifts from the Arabic, the transliteration is what the gloss explains.
- A word Khalifa leaves out keeps a literal label: “*No*” (kallā) where his verse has no “No,” “*There*” (thamma) in 81:21.
- After the colon, continue with the gloss, lowercase unless it starts with a name.

### Qurʾān quotations inside the commentary

Every quotation of the Qurʾān in the commentary uses Khalifa’s English, whether it quotes the verse under discussion, another verse with a reference, or a single word of the verse. This keeps the commentary from reading one verse two ways.

- **Quote his words exactly.** Cut a quotation short rather than reword it, and cut it before an em dash in his text. Adjust only the case of the first letter and the punctuation outside the quotation marks.
- **When the gloss turns on the Arabic,** give the transliteration after the quotation, and the literal English after that where Khalifa’s sense differs: “*Followed by the second blow*” (*tatbaʿuhā l-rādifa*, “the one following after follows it”). With a reference, the reference goes last in the same parentheses: (*fa-lā uqsimu bi-mawāqiʿi l-nujūm*, Q 56:75–76).
- **When Khalifa leaves the word out** or the grammar is about the Arabic form alone, write the transliteration with the literal English and no Khalifa quotation: *Shāhidan ʿalaykum* (“a witness against you”), *yaẓunnu* (“think”).
- **What stays literal:** the Qurʾān as quoted inside a ḥadīth, report or poem; variant readings (Ibn Masʿūd’s codex and the like); and 9:128–129, which Khalifa does not translate.
- **No mention of Khalifa** in the commentary itself. The reader sees his text in the verse block; the commentary simply uses it.

## 5. Typography of the commentary

| Element | Style | Example |
|---|---|---|
| Quoted words of the verse under discussion | italic, in double quotes, Khalifa’s English (§4) | “*Lord of the people*” |
| Qurʾān quoted from elsewhere | italic, in double quotes, Khalifa’s English, then the reference | “*Indeed, your scheming is formidable*” (Q 12:28) |
| Ḥadīth, reports, proverbs, sayings, verse of poetry | italic, in double quotes | “*There is no envy except in two*.” |
| Arabic words discussed as words, readings, terms | italic transliteration | *waswasa*, *tanwīn*, *aḥadu llāh* |
| A technical term after its English | italic, in parentheses | explanatory appositions (*ʿaṭf bayān*) |
| Names of people, places, sūras, books | roman | Sībawayh, Sūrat al-Jinn |
| English loanwords | roman | jinn, ḥadīth, sūra, Qurʾān |
| Words the translator adds | square brackets | [with the final *yāʾ* dropped] |
| Translator’s gloss of a word | roman in parentheses | (“the forgetful”) |

Punctuation:

- **Quotation marks:** curly only, “ ” and ‘ ’, never straight. Use single quotes only inside double ones.
- **Commas and periods:** they go inside a closing quotation mark (American style): “*King of the people*,” then.
- **Dashes:** no em dashes. Use an en dash only in number ranges (112:1–4, pp. 817–819).
- **Square brackets:** these mean the translator added the words. Anything that is in the Arabic is never bracketed. The revelation line is the one exception, because those brackets are the edition’s own.

## 6. God, the Prophet, honorifics

| Arabic | English |
|---|---|
| الله | God (Khalifa’s “GOD” only inside the verse block and the basmala) |
| الله تعالى | God Most High |
| الله عز وجل | God the Mighty and Majestic (as on the site’s al-Kashshāf pages) |
| سبحانه | glorified is He |

Blessings and honorifics after a name are set as single symbols, with a space before them. Formulas about God stay in words.

| Arabic | Symbol | Code point |
|---|---|---|
| صلى الله عليه وسلم | ﷺ | U+FDFA |
| صلى الله عليه وآله وسلم | ﵌ | U+FD4C |
| صلى الله عليه وآله | ﵆ | U+FD46 |
| عليه الصلاة والسلام, صلوات الله عليه | ﵊ | U+FD4A |
| عليه السلام | ﵇ | U+FD47 |
| عليهم السلام | ﵈ | U+FD48 |
| عليهما السلام | ﵉ | U+FD49 |
| عليها السلام | ﵍ | U+FD4D |
| رضي الله عنه | ﵁ | U+FD41 |
| رضي الله عنها | ﵂ | U+FD42 |
| رضي الله عنهم | ﵃ | U+FD43 |
| رضي الله عنهما | ﵄ | U+FD44 |
| رضي الله عنهن | ﵅ | U+FD45 |
| رحمه الله | ﵀ | U+FD40 |
| رحمهم الله | ﵏ | U+FD4F |

- Render a formula only where the edition prints it, and wherever it prints it. Do not add one the edition leaves out (106 has “From ʿUmar:” with no symbol, because the Arabic has none).
- A dual formula stays where the edition puts it, even when it covers two names: “the counsel of Abū Bakr to ʿUmar ﵄” (101), “From Ibn ʿAbbās: ʿUmar ﵄ …” (110).
- When a pronoun stands for the Prophet, the symbol follows the pronoun: “his saying ﵊:”, “he ﵊ used often to say”.
- The symbols are set in Noto Naskh Arabic, which `render.py` applies to them automatically. It has every one of them; Amiri has only ﷺ.
- Capitalize pronouns for God (He, Him, His).
- Use “the Prophet” for النبي and “the Messenger of God” for رسول الله.

## 7. Transliteration

Follow the *IJMES* system: ʿ for ʿayn, ʾ for hamza (none at the start of a word), long vowels ā ī ū, and dotted consonants ḥ ṣ ḍ ṭ ẓ. Assimilate the article in connected speech (*aḥadu llāh*, *saṭaʿa l-furqān*) but write it unassimilated in names and single words (*al-ṣamad*, al-Nās). Do not add case endings unless the point being made is about them.

## 8. Page markers

Mark where each printed page of the edition begins, so the English can be checked against the Arabic. Put `{p|818}` before the first English word that translates the first Arabic word of page 818. The first page of a passage is given by its label, so markers start at its second page. The render shows `|818|` in small gray type. `render.py` fails if a page in the passage has no marker.

## 9. What is not translated

The edition’s footnotes are left out. They hold Ibn Ḥajar’s *takhrīj*, Ibn al-Munayyir’s *Intiṣāf* (قال محمود … قال أحمد) and the glosses marked (ع). Their markers («1») are left out too, so no stray “(3)” appears in the text. If a reader note is ever wanted, see §12.

## 10. Source format

One file per surah, `sources/<n>.md`:

```
surah: 114
title: Sūrat al-Nās (114)
revelation: Meccan; it is also said Medinan. Six verses. [Revealed after al-Falaq (113).]

::: passage 114:1-6 | 4:823-824

It is read *qul aʿūdhu* with the *hamza* dropped …

{Q} Why is it said “*Lord of mankind*,” annexed to them specifically? {A} Because …

{p|824}{L|The sneaking|al-khannās} the one whose habit is to withdraw …

{From|the Messenger of God ﷺ} “*There have been revealed to me …*”

::: heading Al-Zamakhsharī’s closing prayer

{p|825}Praise be to God …
```

- **Paragraphs:** separate them with a blank line. A paragraph may wrap over several lines.
- **Passage line:** `::: passage S:A-B | VOL:FIRST-LAST`. It takes no verse text. The verses are read from the Qur’an file.
- **Tags:** `{L|English|translit}`, `{Q}`, `{A}`, `{From|name}` and `{p|page}`. These set the labels, so their styling never varies.
- **Heading line:** `::: heading Text` sets a centered bold heading for text that belongs to the passage but is not commentary on it, such as the closing prayer and the colophon after 114. It stays inside the passage, so the passage’s page range covers it.
- **Emphasis:** `*italic*` and `**bold**`. Bold is needed only inside tags, so it should be rare.

## 11. Building and checking

```bash
python docs/tafsir/kashshaf-translation/render.py 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114
```

This writes `build/<n>.docx` and `build/<n>.pdf`. Other options:

- `--check` runs the checks only.
- `--arabic` adds the Arabic above each verse block.
- `--quran PATH` points at the Qur’an file. The default is `ws_quran_text_rows_arabic_english_only.json` in Downloads.

The script stops on any of these problems:

- **Title or revelation line:** wrong form, or the verse count disagrees with the Qur’an file.
- **Passage:** not a heading in the groupings file, or it starts on a different page.
- **Characters:** straight quotes, em dashes, «, double spaces, a space before a comma or period, an honorific written out in words (Arabic or English), or no space before a symbol. The honorific check skips Qurʾān quotations, since Khalifa writes “peace be upon” in his own text.
- **Tags:** an opening tag that is not at the start of its paragraph, two opening tags in one paragraph, `{Q}` without `{A}`, or an unknown tag.
- **Emphasis:** unbalanced `*` marks.
- **Page markers:** out of order, outside the passage, or missing for a page.

Brill and Noto Naskh Arabic are embedded in the .docx (obfuscated, as Word does), so the file and the PDF display the same on a machine without the fonts. Noto Naskh sets the honorific symbols; Amiri Quran sets the optional Arabic. Khalifa’s footnote mark ± is removed and his straight quotes are made curly. His wording, including his em dashes, is otherwise left as it is. Al-Tawba 128 to 129 are not in his translation, so their place in the block says so.

A second script lists every Qurʾān quotation that does not match Khalifa’s English (§4):

```bash
python docs/tafsir/kashshaf-translation/verse_quotes.py 72
python docs/tafsir/kashshaf-translation/verse_quotes.py --summary
```

It checks labels against their passage, references against the verse cited, and other quotations against the sūra. A quotation counts as a verse quotation when it shares most of its words with the passage, or when a colon or a transliteration follows it. What it lists after a pass is meant to stay: quotations inside ḥadīth, reports and poems, and words Khalifa leaves out. `apply_quotes.py <sūra> <file>` applies a list of `line: old => new` replacements and reports any that did not match.

The checks can’t catch:

- whether each Qurʾān quotation has its reference;
- whether a paragraph break follows §3;
- whether the honorific symbols match the Arabic (§6).

Read for these against the Arabic before rendering.

## 12. Changes made to the 112–114 drafts

**For consistency with the rules above**

- **Header:** the title is no longer underlined (114), and the revelation line is no longer bold. It now gives the earlier surah’s number in all three, with the period inside the bracket.
- **Basmala:** it now uses Khalifa’s wording to match the verse block under it.
- **Opening tags:** each “If you ask” now has its own paragraph (112 had two in one). Questions are roman, not italic (114).
- **Closing virtue ḥadīth:** each now has its own paragraph, opening **From the Messenger of God ﷺ:** (it was run into the previous paragraph in 113 and 114, and not bold in 112).
- **Lemma labels:** every label now has a transliteration. Added for He, He neither begets, Nor is He begotten, And none is comparable to Him, From the evil of what He created, When he envies, Who whispers, and From the jinn and mankind.
- **113, “Its waqb”:** this was a bold new paragraph caused by a page break. It is folded back into the paragraph on *al-ghāsiq*, where the Arabic has it.
- **Edition footnote markers:** removed from 112 (“his Book (3)”, “aḥad” (4)).
- **Italics:** transliterated terms in parentheses are now italic throughout ((*ḍamīr al-shaʾn*) was roman, (*ẓarf laghw*) italic). *nās*, *al-nāsī*, *īnās* and *bashar* are now italic in 114.
- **Characters:** all quotation marks are curly. The missing space in “Godصلى الله عليه وسلم” and the reversed quotation marks after it are fixed (114).
- **Divine names:** الله تعالى is “God Most High” and عز وجل is “God the Mighty and Majestic” throughout. 113’s closing ḥadīth said “God Almighty” for تعالى.
- **رضى الله عنه:** added after Abū Dharr (114), where the Arabic has it.

**Corrections checked against the Arabic (vol. 4, pp. 817–824)**

- **113, “night is split (yufṭaq)”:** now “split (*yuflaq*) and parted (*yufraq*)”. The Arabic has يفلق عنه ويفرق.
- **113, “sataʿa l-furqān”:** now *saṭaʿa* (سطع).
- **113, *waqūb* and *waqb*:** “Its waqb: its entering eclipse” is now “Its *waqūb*”. The Arabic has ووقوبه, and *waqb* is kept for the snake’s strike (ووقبه).
- **113, “[scheming women, from His saying …]”:** the brackets are removed, because the words are in the Arabic (ويجوز أن يراد بهن النساء الكيادات).
- **113, Abū Tammām:** “Indeed loftiness is beautiful; in the like of it envy” is now “Indeed, lofty rank: envy of the like of it is good”, following the syntax of إنّ العلا حسنٌ في مثلها الحسد.
- **114, *waswās*:** “like zilzāl in the sense of zalzala. … the verbal noun, it is waswās with kasra” is now “like *zalzāl* … the verbal noun, it is *wiswās*, with *kasra*”. The noun has fatḥa like الزَّلزال; the verbal noun has kasra.
- **112, سبحانه:** “God’s essence” is now “the essence of the Maker, glorified is He” (ذات الباري سبحانه).

**Improvements beyond consistency**

- **Verses from the Qur’an file:** verse blocks and the basmala are read from the Qur’an file instead of being typed, so they can’t drift from Khalifa’s text.
- **Passage labels:** each label ties the block to its range and printed pages.
- **Page markers:** these show where each printed page begins.
- **Qurʾān references:** added to cross-quotations: Q 2:199, 2:260, 6:101, 6:112, 9:31, 12:28, 17:78, 54:6, 72:1, 72:6.
- **The line of poetry in 112:** it was set like a quotation from scripture. It is now given in transliteration (*wa-lā dhākiri llāha illā qalīlā*), with its English, because the point is how the *tanwīn* drops.
- **Layout:** Brill type, a fixed line height so ﷺ doesn’t widen its line, and running footers with page numbers.

## 13. Changes made with sūras 100 to 111, and to 113 and 114

**New to the rules**

- **Honorific symbols (§6):** every blessing and honorific the edition prints after a name is now a symbol, for Companions and others as well as the Prophet. 112 to 114 were brought into line: “From ʿĀʾisha ﵂:” and “his saying ﵊:” (113), “From Abū Dharr ﵁:” (114).
- **Revelation line (§2):** a qualified status (107, 110) and a trailing note (109) now have a set place, and `render.py` accepts them.
- **Lemma labels (§4):** labels only where the edition prints the vocalized verse, and Khalifa’s wording only where it renders the same Arabic.
- **Heading line (§10):** used for the closing prayer and the colophon after 114.

**Readings corrected against the Arabic (vol. 4, pp. 786–817)**

These are places where a literal or careless reading of the Arabic would go wrong. Each is settled from the edition’s text and, where it has one, from its gloss marked (ع).

- **100:** the two horses of the oath, not two horsemen; the readings *buḥthira* and *buḥitha*, *baḥthara* and *ḥaṣṣala* in the active, and *ḥaṣala* without doubling; *wattharna*. Q 2:25 and Q 2:180 are referenced.
- **102:** *la-taraʾunna* with *hamza*, and the question about it reads “turning a *wāw* that carries *ḍamma* into a *hamza*”; Abū Mālik “became the meanest of their visitors.”
- **104:** al-Ḥasan “visited a wealthy man [who was ill]” (عاد, not “returned wealthy”); *wa-ʿadadahu*; the reading *humza lumza* is the laughingstock who comes out with outlandish things; “Or he works at raising buildings.”
- **105:** the man of Kināna relieved himself in the church by night (the (ع) gloss on فقعد فيها ليلا); Abraha’s chest “burst open over his heart”; the elephant “was the only one”; the Negus date is “[and that this happened] forty years [before him]; it is also said, twenty-three years,” following the (ع) gloss; the poem’s *ʿadwan* is “tomorrow”; *alam tar* with *sukūn* on the *rāʾ*; *kayfa* is accusative through *faʿala*; *yarmīhim*; the Ibn Muqbil line really has *sijjīnan*; Q 40:25, 105:3, 7:133 and 5:75 are referenced.
- **106:** *immā lā* is “if nothing else”; “*Eat in part of your belly*” is singular for plural; the reading *ruḥla*; Q 90:14–15 is referenced.
- **107:** *rayta* is not attested “because dropping the *hamza* belongs to the imperfect only”; “Is what he does good?” is a question, not an exclamation; al-Rāʿī’s line is read with its gloss (*lammā* negates the past; *tahlīl* is the prayer); Q 17:62 is referenced.
- **108:** the Prophet’s reading is *anṭaynāka*, with *nūn* for *ʿayn*, and the ḥadīth is “*give (anṭū) the middling ones*” (the (ع) gloss on الثبجة); *ṣunbūr* is glossed as a lone man with no heirs; al-ʿĀṣ ibn Wāʾil “had called him *al-abtar*,” not the reverse.
- **109:** the note on *al-muqashqishatān* goes in the header; *mā* forming a verbal noun is “I do not worship as you worship.”
- **110:** “[about it]” is added where the edition’s (ع) gloss says words are missing after فقيل له; the Prophet’s words are “*Go, for you are free*”; Ibn ʿAbbās’s reading *fatḥu llāhi wa-l-naṣr*; Q 3:85 is referenced.
- **111:** *a-shābba am tābba*; *yā ṣabāḥāh* is a cry of alarm; ʿAbdi llāh and ʿAbda llāh for Fulayta’s sons; *Shums* with *ḍamma*; “one who loves to revile Umm Jamīl has sought the favor of the Messenger of God ﷺ with a fine deed”; *mawāhin* are serving women; Q 22:10, 26:214 and 25:23 are referenced.

## 13a. Changes made with sūras 80 to 99

**New to the rules**

- **Revelation line (§2):** a second verse count (80, 89), a note inside the bracket (83) and al-ʿAlaq’s bracket (96) now have a set form, and `render.py` accepts them.
- **Page marker before a question:** `{Q}` must open its paragraph, so when a page begins with فإن قلت the marker goes at the end of the paragraph before it (88, p. 743). When a passage’s commentary begins on a new page, the marker opens the first paragraph (98, p. 782).
- **Glossary terms:** *ḥāl* is “circumstantial clause” even for a single word, *naṣb ʿalā l-shatm* is “accusative as a term of reviling” and *ʿalā l-dhamm* “as a term of censure,” and *istifhām* in the sense of *inkār* is “a question in the sense of denial.” New entries are in §15.

**Honorifics as printed (§6)**

- Gabriel: ﵊ at 81:19 (صلوات الله عليه) and ﵇ at 81:22 and 87:7. The English draft had ﷺ at 87:7.
- ﵌ wherever the edition has وآله (90, twice; 91, the Prophet’s reading).
- Abū Ḥanīfa ﵁ (84, 90), as the edition has it.
- Ibn ʿAbbās takes ﵄ where the edition has رضى الله عنهما (93, 94) and ﵁ where it has the singular (87, 95).
- ʿAmr ibn ʿUbayd ﵀ (89); Moses ﵊ (89, صلوات الله عليه).
- Curses and “may God protect it” (Mecca, 95) stay in words.

**Readings corrected against the Arabic (vol. 4, pp. 700–785)**

- **80:** the lemma reads *ansharahu*; the count line carries the edition’s “it is also said forty-one.”
- **81:** *ʿushārāʾ*; *saʾalat*, *qutilti* and *qutiltu*; *bi-ẓanīn* and *bi-ḍanīn* in the edition’s order; *suʿʿirat* “is read with doubling, for intensity.”
- **82:** the subjects in ʿAlī’s story of his servant follow the Arabic, not the draft.
- **83:** the assimilation is into *thāʾ*, where the edition prints تاء; the bracket note on the last Meccan sūra.
- **84:** Abū Salama ibn ʿAbd al-Asad, the known name, for the edition’s الأشد; the readings *la-tarkabanna*, *la-tarkabunna*, *la-tarkabinna* and *la-yarkabanna*; *mujāwizīn*, *mujāwizan* and *mujāwizatan*.
- **85:** “the king saw him” in the story of the boy; Yaḥyā ibn Yaʿmar’s *fī lūḥin*, *lūḥ* being the air; the edition’s تقديرا taken as “to establish.”
- **86:** doubled *lammā* is *illā* and makes *in* negative; light *lammā* has *mā* extra and *in* lightened from *inna*. *Dāfiq* is relational, like *lābin* and *tāmir*; the four forms *ṣulb*, *ṣalab*, *ṣulub*, *ṣālib*.
- **87:** *fa-lā tansā* as a prohibition with an *alif* added for the verse ending; the (ع) gloss “[in] keeping the revelation.”
- **88:** the edition puts the commentary on verses 2 to 7 under its verse 1 heading, and the passage keeps that order. The second *ḍarīʿ* line is “And [another] said,” since the footnote names Qays ibn ʿAyzāra.
- **89:** ʿAmr ibn ʿUbayd for the edition’s عمر بن عبيد at p. 748. The praise of him and the anti-compulsion argument at 89:24 are translated as printed.
- **90:** in the question on repeating *lā*, the edition prints «إلا»; the sense needs *lā*, and the line is “and what evil deed did he not do.” *Ḥill* is read both ways the edition gives.
- **91:** “hamstringing” for the edition’s الفقر, a misprint of العقر. The passage on “the Qadariyya” is translated as printed; the (ع) gloss says he means the Sunnis.
- **92:** Bishr ibn Abī Khāzim for the edition’s حازم; Abū l-Zubayr is kept as printed.
- **93:** *ʿayyilan* and *ʿadīman* are readings; the story of ʿAbd Allāh ibn Ghālib keeps his *kunya*, Abū Firās.
- **94:** “*farighta*” is Abū l-Sammāl’s reading; the Rāfiḍī and Nāṣibī readings of *fa-nṣab* are translated as printed.
- **96:** the poem on the pen is al-Zamakhsharī’s own (the footnote says so), but the text says “one of them,” and so does the translation.
- **99:** “with the tongue” for the edition’s بالنسيان, a misprint of باللسان.

## 13b. Changes made with sūras 50 to 79

**New to the rules**

- **Second verse counts (§2):** 52, 53, 65, 73, 78 and 79 give two counts. Where the edition’s first count differs from Khalifa’s file (65, 73, 79), the count that matches Khalifa goes first and the other follows as “it is also said.”
- **Exceptions to Meccan or Medinan:** written “Meccan, except verse 48, which is Medinan” (77) or “except verses 10, 11 and 20, which are Medinan” (73). 64’s disputed status is given as the edition states it.
- **Other names of a sūra:** stated in the revelation line (66, al-Taḥrīm; 78, ʿAmma Yatasāʾalūn and al-Nabaʾ). A note after the bracket (67) stays where the edition puts it.
- **Passages without a heading:** 54:8 has no heading of its own in the edition; its commentary stays inside the passage before it.
- **Print gaps:** where the edition skips a page number (51, p. 403; 55, p. 453) no marker is invented.
- **Page marker and comma:** a marker never sits right before a comma; it moves after it (75, p. 665).
- **Glossary:** new entries for the accusative of praise and of specification, abstraction, the doctrine of implication, the *am* that breaks off, the separator pronoun and the emphasizing verbal noun are in §15.

**Honorifics as printed (§6)**

- The angels take ﵈ (55). Gabriel takes ﵊ where the edition has صلوات الله عليه (75).
- ﵌ where the edition has وعلى آله (76).
- ﵉ for Aaron and Moses where the edition has صلوات الله عليهما (66).
- ʿĀʾisha ﵂ (79); the ḥadīth “Whoever fears sets out by night” takes ﵇, as printed (79).
- “Iblīs, God curse him” stays in words (72).

**Readings and wording settled against the Arabic (vol. 4, pp. 393–700)**

- **53:** the al-Hudhayl correction; the *am* at 53:24 is the one that breaks off, with the *hamza* for disowning.
- **59:** “straw” in the line “I fed her straw and cool water,” where the edition prints تينا for تبنا; the reading *khālidāni fīhā* with “in the Fire” as a non-predicative adverbial (*laghw*).
- **66:** the emphasis in the *maghāfīr* story is balanced, and the passage on 66:10 runs over pp. 571–572.
- **77:** “al-Fārijī” is part of a verse fragment, not a narrator.
- **Muʿtazilī passages** are translated as printed: 61 (p. 524), 64 (p. 546), 66 (p. 567), 67 (p. 578), 68 (p. 585), 70 (p. 611), 71 (pp. 618, 620), 72 (p. 632), 74 (pp. 655, 657), 75 (p. 662), 76 (pp. 667, 676), 78 (p. 691) and 79 (p. 699).
- **112:** “*lagw*” corrected to *laghw*, here and in the glossary.

## 13c. Qurʾān quotations aligned with Khalifa (50 to 114)

The commentary used to translate the verse afresh, so a reader met one rendering in the verse block and another in the gloss beneath it (50:2, “*They found it strange*” above, “Rather they wonder” below). Every label, quotation and cross-reference in 50 to 114 now uses Khalifa’s English, under the rule in §4.

- **Scope:** about 2,900 quotations across 65 sūras, including references to verses outside the sūra.
- **Transliteration added** wherever the gloss explains the Arabic that Khalifa renders differently: grammar (the indefinite *nafsun* in 81:14, the *lā* of the oath in 75 and 90, the elatives *al-ashqā* and *al-atqā* in 92), etymology (*ghāshiya*, *ḥāfira*), and his interpretive renderings (74:31, 81:19–23).
- **Kept literal:** the Qurʾān quoted inside ḥadīth and reports, poems, variant readings, and 9:128–129.
- **Capitals:** labels and quotations that open a sentence start with a capital, even where Khalifa’s phrase begins mid-verse.
- **Tools:** `verse_quotes.py` and `apply_quotes.py` (§11); `render.py` no longer flags Khalifa’s “peace be upon” inside a quotation.

## 14. Items that were open, and how they were settled

- **114, page 824, وما أحقه:** translated as “They did not establish it,” closing the argument from *nafar* and *rijāl*. The (ع) gloss reads أحقه as أحققته, “I established it,” and the next clause gives al-Zamakhsharī’s reason for rejecting the view.
- **Closing prayer and colophon (p. 825):** translated after 114 under their own headings. The passage line now reads `114:1-6 | 4:823-825`, with a page marker at 825.
- **Lemma wording:** settled by the rule in §4, which now takes Khalifa’s English for every label and quotation (§13c). 114’s say “the people,” his rendering of *al-nās*.
- **Basmala:** kept in Khalifa’s wording above each sūra, as §2 says.

Nothing is open. The checks in §11 that cannot be automated (references, paragraph breaks, honorifics) were done by reading each sūra against the Arabic.

## 15. Glossary of terms

Use these English forms every time. Add to the list as new terms come up.

| Arabic | English |
|---|---|
| *ʿaṭf bayān* | explanatory apposition |
| *badal* | substitute |
| *ḍamīr al-shaʾn* | pronoun of the matter |
| *ẓarf laghw* | non-predicative adverbial |
| *ḥāl* | circumstantial clause |
| *mafʿūl bihi* | object |
| *mubtadaʾ* / *khabar* | subject / predicate (of a nominal clause) |
| *maṣdariyya* (of *mā*) | forms a verbal noun |
| *mawṣūla* | relative pronoun |
| *istifhām* | interrogative |
| *inkār* | denial |
| *naṣb ʿalā l-dhamm* / *ʿalā l-shatm* | accusative as a term of censure / of reviling |
| *taṣghīr* | diminutive |
| *tanwīn* | *tanwīn* (left in transliteration) |
| *hāʾ al-sakt* | pausal *hāʾ* |
| *taḍmīn* (in poetry) | enjambment |
| *jins* | kind |
| *mustaqbal* / *ḥāl* (of time) | future / present |
| *istithnāʾ munqaṭiʿ* | an exception that stands apart |
| *iltifāt* | turning (to the one addressed) |
| *iʿtirāḍ* | parenthesis |
| *mafʿūl lahu* | object of purpose |
| *taḥdhīr* | accusative of warning |
| *lām al-ibtidāʾ* | *lām* of the subject |
| *muḍāf maḥdhūf* | a left-out annexed word |
| *naṣb ʿalā l-madḥ* | accusative of praise |
| *tamyīz* | accusative of specification |
| *tajrīd* | abstraction |
| *taḍmīn* (in grammar) | the doctrine of implication |
| *am al-munqaṭiʿa* | the *am* that breaks off |
| *ẓarf mustaqarr* | predicative adverbial |
| *faṣl* (pronoun) | separator |
| *maṣdar muʾakkid* | emphasizing verbal noun |

## 16. Suggested next steps

- **Optional endnotes:** add Ibn Ḥajar’s *takhrīj* for each ḥadīth as an endnote, since he often says a report is weak or not found (107, 110: “I did not find it”). Readers would value this, and it would sit outside the translation proper.
- **Site export:** add an HTML output so the same source can feed the site’s al-Kashshāf verse pages, where passages are already filed by these same headings.
- **Longer sūras:** sūras with several passages need no new rules; each passage gets its own `::: passage` line in order.
