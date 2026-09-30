# Extracting word-by-word readings from Taḥbīr at-Taysīr

You are turning printed sentences of an Arabic book into structured records.
You do not write Arabic yourself. You point at text that is already on the page,
and a script cuts the exact words out. The script then refuses anything that is
not on the page, so your job is to choose what to point at and to assign readers
correctly. Nothing you write is displayed as the book's words unless it was cut
from the page.

Book: Ibn al-Jazarī, *Taḥbīr at-Taysīr fī l-qirāʾāt al-ʿashr* (Shamela 5556).
Word-by-word section ("farsh"): pages 282 to 620, one sura after another. The
book lists, for a word, which of the ten readers read it which way. Square
brackets `[ ]` mark Ibn al-Jazarī's additions to al-Dānī's text and are part of
the text. "قلت" ("I say") introduces an addition by the author.

## Read the pages

```bash
python scripts/quran/qiraat/show-pages.py --book 5556 --from 284 --to 287
```

Everything you point at must be copied from this output (no diacritics, single
spaces, brackets and punctuation exactly as shown).

## The output file

One JSON file per batch, path given in your task. Top level:

```json
{"schema": "qiraat-farsh-batch/0.1", "book_id": "5556",
 "pages": {"volume": "1", "from": "284", "to": "287"},
 "items": [ ... ], "skipped": [ ... ]}
```

Because the text is Arabic and repetitive, write a small Python script that
builds the JSON, with helper functions for repeated shapes, and run it. Do not
hand-type a large JSON file.

### An item (one word, one statement about it)

```json
{"id": "t284-01", "page": "284", "page_end": "285",
 "lemma": "وما يخادعون", "verse": "2:9", "scope": "here",
 "ev": ["قرأ الحرميان", "والباقون بغير ألف مع فتح الياء والدال."],
 "forms": [
   {"desc": ["بالألف مع", "وكسر الدال"], "short": "yukhādiʿūn",
    "readers": [["g", "haramiyan", "الحرميان"], ["a", "abu_amr", "أبو عمرو"]]},
   {"desc": "بغير ألف مع فتح الياء والدال", "short": "yakhdaʿūn", "rest": "والباقون"}
 ]}
```

- `page`, `page_end`: the page label(s) where the evidence is (page_end only if it runs onto the next page). Use the number shown as `=== PAGE n ===`.
- `ev`: the evidence. A snippet, or `[start, end]`: the first words and the last words. The script takes everything from the start snippet to the end snippet. The start snippet must occur **once** in those pages, so lengthen it if the script says it is ambiguous. Evidence is one contiguous passage that contains the lemma, every reader named for this word, and every form. Include the author's "قلت" additions about the same word if they follow it.
- `lemma`: the word as printed in the book (with the book's spelling, for example `جىء`), a snippet from inside the evidence. One word, or words that stand together in the Qur'an. If the book lists several words in one sentence (`قيل وغيض وجىء`), write **one item per word**, all with the same `ev`, each with its own `verse`.
- `verse`: `sura:verse` of the word's first occurrence that fits, from your knowledge of the Qur'an. The script checks it against the Qur'an text and reports disagreements; a wrong guess is not fatal but is listed.
- `scope`: `here` (this place), `wherever` (the book says حيث وقع or similar: every occurrence), `listed` (the book enumerates several places).
- `forms`: one per distinct reading given. `desc`: the book's description of that reading, as a snippet from the evidence. `short`: an existing English or transliterated apparatus label may be retained. Missing labels and `form N` placeholders become the first four words of the exact Arabic description at verification (D-071). Do not invent new English glosses or use labels that grade or rank a reading.
- `anchor_at_hint`: optional plain-English review reason for keeping the source-specified verse when a variant matches an unrelated occurrence in the Cairo text. The verifier marks it weak and leaves it without word IDs (D-072). Use it only after reading the source locator; repair a wrong verse hint instead of protecting it.
- `readers` in a form: `["a", authority_id, snippet]` or `["g", group_id, snippet]`; snippet is the words naming them, cut from the evidence. Add a fourth element `"disputed"` when the book says the reader has a dispute about it (بخلاف عنه): the reading is then recorded as disputed, not as his firm reading.
- `rest` in a form: the snippet for "the rest" (والباقون, وباقي العشرة, وغيرهم): every reader of the ten that is not named anywhere in this item's evidence. Use it only when the book gives the rest a reading. A form has readers or `rest`, not both.
- `unresolved`: `[{"span": snippet, "reason": "..."}]` for a reader term you cannot assign (see below).
- `note`: optional, plain English, for anything odd about this item. Do not paraphrase the book.

### Skipped

Every stretch of the pages that is not in an item goes in `skipped`, with the snippet and a reason (`section heading`, `cross-reference to another chapter`, `general rule, no single word`, `remark by the author`, `reader outside the ten`). The script measures coverage and lists every stretch of 25 or more letters that neither an item nor a skipped entry accounts for. Your batch is not finished until the gap list is empty.

```json
{"id": "s284-1", "page": "284", "ev": ["(باب", "البقرة)"], "why": "section heading"}
```

## Page boundaries

Sentences run across pages. The batch that owns an item is the one where the item **starts**.

- If the top of your first page continues a sentence that began on the page before yours, skip that fragment with the reason `continuation, handled by the previous batch`. You may read the page before yours for context.
- If a sentence that starts on your last page continues onto the next page, take all of it: set `page_end` to the next page. The script reads that page for you.
- Your batch header `pages` covers only your own range; coverage is measured on it.

## Who the readers are

Use these ids. Do not use any other.

Qāriʾ (naming him means both his transmitters):
`nafi`, `abu_jafar`, `abu_amr`, `yaqub`, `asim`, `hamza`, `khalaf_ashir`, `kisai`, `ibn_amir`, `ibn_kathir`

Transmitter (naming him means only him):
`warsh`, `qalun` (Nāfiʿ); `ibn_wardan`, `ibn_jammaz` (Abū Jaʿfar); `duri_abu_amr`, `susi` (Abū ʿAmr); `ruways`, `rawh` (Yaʿqūb); `shuba`, `hafs` (ʿĀṣim); `khalaf_hamza`, `khallad` (Ḥamza); `ishaq`, `idris` (Khalaf al-ʿĀshir); `abu_harith`, `duri_kisai` (al-Kisāʾī); `hisham`, `ibn_dhakwan` (Ibn ʿĀmir); `bazzi`, `qunbul` (Ibn Kathīr)

Groups the book defines (use `["g", id, snippet]`):
`haramiyan` (Nāfiʿ, Ibn Kathīr), `kufiyun` (ʿĀṣim, Ḥamza, al-Kisāʾī, Khalaf al-ʿĀshir), `madaniyan` (Abū Jaʿfar, Nāfiʿ)

Rules that matter:

1. Bare `خلف` among the readers is `khalaf_ashir` (the reader). Only `خلف عن حمزة` (the span must include both words, brackets allowed between) is `khalaf_hamza`.
2. Bare `الدوري` is ambiguous. Use `duri_abu_amr` only when the span carries `عمرو` (for example `الدوري عن أبي عمرو`) and `duri_kisai` only when it carries `الكسائي`. Otherwise put the span in `unresolved`.
3. Writing the name of a qāriʾ (`نافع`, `الكسائي`, `عاصم`) means both his transmitters. The book names a transmitter only where the two differ. Never write a qāriʾ id for a span that names only a transmitter, for example `رويس` is `ruways`, not `yaqub`; `ورش` is `warsh`, not `nafi`. The script refuses this.
4. Any collective term other than the three groups above (`المكيان`, `البصريان`, `الشامي` when it stands for a group, `الأخوان`, and so on) goes in `unresolved` with a reason. Do not guess members. **An item with an unresolved term cannot also have a `rest`**: move the "the rest" phrase into `unresolved` as well, with the reason that the rest cannot be computed.
5. A reader named in a bracketed or "قلت" addition to the same statement counts as named: he is excluded from "the rest".
6. "Agreed with them" (وافقهم, وافقه) attaches the named reader to the form of the reader(s) just before it. Put him in that form.
7. If a reader is named for two different forms of the same word (بخلاف عنه, "with both", two routes), add `"disputed"` to his entry in each form. The script accepts a reader in two forms only when both entries are `disputed`. Do not split one word into two items to avoid this.
8. A statement about a word that also names a reader outside the ten (Ibn Muḥayṣin, al-Ḥasan, al-Aʿmash, al-Yazīdī and so on): keep the ten in the item; the outsider is ignored (leave it inside the evidence, no entry).

## Check your work

```bash
python scripts/quran/qiraat/verify-farsh-items.py --batch PATH_TO_YOUR_BATCH.json --write
```

Repeat until the line says `errors 0  gaps 0`. Read every error. When it lists `anchor attention`, check those items: a lemma that could not be found in the sura's text, or a verse that was moved, usually means a wrong `verse`, a lemma that is a list of words (split it), or a word the book spells differently from the Qur'an. Fix what you can; leave a note on any you cannot.

The script cannot check that you assigned the readers to the right form. Before you finish, reread ten of your items against the page and correct any mistake.

## Report back

Reply with: the batch path, counts (items, skipped, anchor statuses), and a short list of anything ambiguous, any pattern the brief does not cover, and any reader term you left unresolved. Do not edit any file except your batch file and your generator script under `scratch/`.
