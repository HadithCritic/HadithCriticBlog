# Qirāʾāt module: hand-off

Updated 2026-09-30, after the rules layer and the deferred statements were entered. Read this first, then `ROADMAP.md`, `farsh/EXTRACTION.md`, `second-witness/README.md` and `../DECISIONS.md` (D-065 to D-072).
This file says where the work stands, how the workflow runs, and what to do next.

## Standing instructions from the owner

- **Do not use sub agents** (no Agent tool, no Workflow). Extraction and review are done in the main session, one range at a time. Eight agents were tried once; the owner stopped them.
- **Accuracy over speed.** Every unit is read by you against its own sentence. Do not trust an unreviewed parser draft, and do not publish anything the owner has not been told about.
- Commits: conventional commits, no co-author or attribution lines, no em-dashes in committed text or code comments. American English.
- Nothing here is cleared for deployment: the display and data embed Shamela quotations (see `../SOURCE-RIGHTS.md`). Keep it local.
- No authenticity grading anywhere. Labels are ours, the Arabic is the book's.
- Nothing from this session has been committed. `git status` shows the module as untracked or modified.

## What the second continuation added (read this before the older sections)

The build now reports **103 suras, 1,936 positions and 4,849 claims**, plus **142 general rules in 28 chapters with 263 claims** on a new page, `/projects/quran/rules/`. Numbers elsewhere in this file that say 101 suras, 1,833 positions or 3,665 claims are the state before this work.

- **The rules layer (pp. 181 to 281) is entered.** Batches `farsh/rules/batch-5556-rules-p*.json`, written with `scripts/quran/qiraat/rules_kit.py` from generator scripts in `scratch/quran/qiraat/rules/r*.py` (git-ignored; the JSON batches are the record). Each is an item of scope `rule`, filed under sura 0, verified, assembled and built by `build-rules-data.py` into `src/data/qiraat/rules.json`. Pages 268 to 281 (the yāʾāt principles and the dropped yāʾāt) are summary pages recorded as skips (D-075): a check showed every yāʾ and zawāʾid verb in pp. 282 to 620 is inside an item's evidence, and the book's own totals are 214 yāʾāt al-iḍāfa and 122 dropped yāʾāt.
- **The deferred farsh statements are entered.** Al-Bazzī's thirty-one tashdīd places (which gave Sura 92 its first position), the further places of الرياح, and every disputed-branch statement (Hishām, Warsh, Ibn Wardān, Ibn Dhakwān, Shuʿba, Khallād, Qālūn, Qunbul) went into their original reviews (`farsh/reviews/r*.json`, patched by `scratch/quran/qiraat/reviews/patch_*.py`, then re-applied). Two statements set aside for an Iraqi route that names neither al-Dūrī nor al-Sūsī keep that route in the quotation only.
- **Supplement batches** (`farsh/supplement/`, D-076) enter statements that the reviews called "rules layer" but that are about particular words or suras: the verse-ending imāla of ten suras, the opening letters of Sura 19, 20, 26, 27, 28, 36 and 68, the imāla of أعمى and نأى, the ينزل family, the paired questions with their per-place exceptions, المسيطرون, وامنتم and رأى. They are not measured for coverage again.
- **Suras with nothing to extract** now say why (`silent-suras.json`, D-077): 62, 94, 95, 100, 103, 105, 107, 108, 110, 113 and 114.
- **Tooling** (D-073, D-074): a reader entry can carry `narrowed_from` (a transmitter entered from a sentence that names his qāriʾ or a collective term and sets his sibling apart) or `context` (a reader named on an earlier page, for chapters that continue with pronouns). New verification-only name aliases for edition spellings (أبا عمرو, أبوعمرو, أبي جعفر, أبا شعيب, أبي شعيب, للدوري, للسوسي, بن وردان, حمزة من رواية خلف and others) are in `name_table` in `verify-farsh-items.py`, not in the parser table, so unit ids do not drift.
- **Independent witness:** `witness-gap.py` lists al-Mabsūṭ items on verses with no entered position (D-078; output in `second-witness/mabsut-gap.json`, about 85 candidates, mostly routes outside the twenty and spelling or numbering differences). It is a search aid, not a finding.
- **Tests:** `tests/quran.spec.ts` gained a hub test for the silent suras and two tests for the rules page (11 hub, sura and rules tests pass against the dev server with `scratch/qiraat-playwright.config.ts`); contrast passes on the hub and the rules page in both themes; `npm run check` 0 errors.

### Added after the first pass of this continuation

- **A `permitted` basis (D-081)** for alternatives the book allows: the six ways of beginning الأولى at 53:50 (p. 568) and the sukūn of the ʿayn in نعما at 2:271 (p. 314). Permitted entries never remove a reader from "the rest"; the page lists them with the reports.
- **`identified_by` on a reader (D-081)** for names the Taḥbīr edition misprints or leaves bare. The verifier finds a quotation from an-Nashr on the named page and checks that it names the reader. Used for المكي (36:62), وعمرو (40:26), وأبو عمر (41:50), أبو ذكر (72:19), أبو عمر عن اليزيدي (2:128, 2:260, 41:29) and the report of al-Naqqāsh from al-Akhfash (30:19). The pronoun-only Ruways at 4:36 now uses a context reader. Unresolved spans are down from 22 to 5, all with a stated reason.
- **Second-level rules and sub-features** in `farsh/supplement/batch-5556-supplement-second-level-rules.json` and `...-sub-features.json`: زكرياء before a hamza, أمهاتكم (four places), the doubling of the zāy in ينزل at 16:2 and the hamza realization in أأعجمي at 41:44.
- **Witness comparison (D-079, D-080):** `second-witness/compare-read.json` holds the 200 hand-read differences from al-Mabsūṭ, with source discrepancies in the printed Taḥbīr sentence (12:62, 30:19, 30:50, 41:47, 24:1) and two places where an-Nashr sides with Taḥbīr. `nashr-compare.py` runs the same test against an-Nashr (796 agree, 104 differ, 91 not located; D-082); reading its differences found the misprint ابن كثبر at 6:145, now fixed. an-Nashr is not extracted as claims: it treats the same words (D-080).
- **Reports** on the sura page now name the transmitter when the entry is not for the whole qāriʾ (Nāfiʿ (Qālūn)).

- **Four books on the positions (D-083, D-084):** claims per book are Taḥbīr 4,175, an-Nashr 886 (438 items), al-Mabsūṭ 662 (383 items) and Ibn Mujāhid's Sabʿa 222 (146 items). 1,326 positions have one book, 381 two, 183 three, 42 four and 4 five (the al-Fātiḥa pilot). The drafters are `draft-nashr-items.py`, `draft-mabsut-items.py` and `draft-saba-items.py`; batches are in `farsh/nashr`, `farsh/mabsut` and `farsh/saba`. The Taysīr is not extracted because Taḥbīr contains it.
- **an-Nashr as a second book (D-083):** 441 positions carry claims from an-Nashr (`farsh/nashr/batch-22642-agree.json`, drafted by `draft-nashr-items.py` and verified). Only items that agree with Taḥbīr and read completely by rule are entered; the other 355 agreeing items (routes, several places, exceptions) and every difference stay in `second-witness/`. Reading more of them, one by one, is the next Tier-1 step for this book.

- **Routes (D-085, D-086):** `second-witness/route-detail.json` holds 1,888 passages no claim can carry; the 341 that name a narrator below the twenty and belong to a position are shown on the sura pages as quoted `route_notes` (built into `sura-NNN.json` by `build-display-data.py`, rendered in `SuraQiraat.astro`). The route layer that reads the forms per narrator is in place for the passages that state one in so many words (D-087): 448 entries on 193 positions in `qiraat/routes/routes-*.json`, authored with `routes_kit.py` and checked by `verify-routes.py`, shown as "Routes read below the transmitters". The rest of the route detail (form unstated, several places, exceptions, antecedent outside the excerpt) stays in `route-detail.json`.

### Still open after this work

- The Iraqi route for يرضه لكم (39:7, a route outside the twenty, left in the quotation) and the five remaining unresolved spans (Qunbul at 89:9, whose listed and reported forms overlap; and three in the rules chapters, a pronoun for Ḥamza, a promise of later rules and a split name).
- Independent-witness reading: `witness-compare.py` compared all matched items to al-Mabsūṭ and the 200 flagged differences were read by hand (`second-witness/compare-read.json`, D-079): 102 agree, 84 differ (mostly Rawḥ against Ruways, and Hishām against Ibn Dhakwān), 14 are other. Three source discrepancies in the printed Taḥbīr sentence (12:62 al-Kisāʾī, 30:50 Ḥamza, 41:47 Ḥafṣ) are recorded with an-Nashr's wording and not edited. Still unread: 144 partial results, 529 not located, a sample of the agreements. Nothing from al-Mabsūṭ is in the site claims.
- Everything above is an LLM read-through. Owner review and the rights decision on the embedded quotations are still the release gates. Nothing is committed.

## The project in one paragraph

`/projects/quran/` is a qirāʾāt display: for each word of the Qur'an where the ten readers differ, it shows which of the twenty transmitters read what, with the classical book and page for each claim. The main source is Ibn al-Jazarī, *Taḥbīr at-Taysīr* (Shamela book 5556), whose word-by-word section (the "farsh", pages 282 to 620) states readings as sentences of the form "readers (word) form, wal-bāqūn other form". Sura 1 is a hand-made five-book pilot. The rest is extracted from the farsh, checked by scripts, and rendered by Astro pages under `src/pages/projects/quran/`.

## Where the extraction stands

Farsh pages 282 to 620. Every unit that starts on a page belongs to that page's batch.

| Pages | How it was made | Batch file |
|---|---|---|
| 282 to 287 | hand extraction (earlier session) | `farsh/batch-5556-p282-283.json`, `p284-287.json` |
| 288 to 302 | reviewed (parser draft, read and corrected) | `farsh/reviewed/batch-5556-p288-292.json`, `p293-302.json` |
| 303 to 307 | hand extraction by an agent, verified, not read by the owner | `farsh/batch-5556-p303-307.json` |
| 308 to 430 | reviewed | `farsh/reviewed/batch-5556-p308-319.json` ... `p416-430.json` |
| 431 to 620 | reviewed in the main LLM session: 923 units, 1,026 items | `farsh/reviewed/batch-5556-p431-445.json` ... `p611-620.json` |

Each reviewed range has two durable files: the review (`farsh/reviews/rA-B.json`, my decisions) and the batch (`farsh/reviewed/batch-5556-pA-B.json`, rebuilt from the review by `apply-farsh-review.py`, plus a `.checked.json` written by the verifier). The Python generators that wrote the review files are in `scratch/quran/qiraat/reviews/rA_B.py` (ignored by git; the JSON reviews are the record).

Do not use: `scratch/quran/qiraat/held/` (unreviewed agent batches, superseded), and `farsh/parsed/` (parser output for calibration; not read by the build).

The complete build now passes through page 620: 27 batches, 1,828 farsh items and 3,614 farsh claims; with Sura 1's pilot, 101 suras, 1,833 positions and 3,665 claims. All 339 pages are accounted for, with zero verifier errors and zero coverage gaps. The farsh anchors are 1,682 agree, 77 weak, 69 none and zero moved. Page coverage includes explicit omissions, so exhaustive Tier 1 content is not yet complete.

The continuation added 13 reviewed ranges, with 131 explicit dropped units and 13 unresolved spans in seven items. Read the durable review reasons rather than interpreting 100% page coverage as every word or route being represented. Every site claim remains proposed; LLM reading is not owner approval. The older p303-307 agent batch retains its earlier review limitation.

The full anchor audit also corrected six prior relocations in p284-287, p371-385, p386-400 and p416-430. Corrected verse hints are 12:96, 12:98 and 14:2; source-located variants at 2:74, 7:172 and 9:100 remain without word IDs. Do not regenerate the earlier review JSON from stale scratch generators: the JSON is the durable record.

Labels are done (D-071): the verifier fills missing and `form N` labels from the first four words of the source description, for compact and canonical items. Existing authored labels remain. Arabic labels and Arabic fragments in notes have language markup. The build wrapper now forwards `--outDir` and uses that directory for release hardlinks and Pagefind, so `npm run build -- --outDir dist-check` actually preserves the owner's `dist`.

Independent-witness checking has started, not finished. `second-witness/` has 45 comparisons: 22 agreements, 14 differences or edition conflicts, eight partial and one not located. Its queue lists 1,783 unchecked items plus 23 attention records. No comparison has been promoted into site claims. Continue here, not at page 431.

## The tools

All in `scripts/quran/qiraat/` unless stated.

- `farsh_parser.py`, `farsh_items.py`: a rule-based reader of the farsh. It cuts the section into units (a reader list, the lemma in parentheses, the form, "wal-bāqūn"), places each lemma at a verse by matching the Cairo text, and flags anything it will not decide. **Frozen**: do not change the parser logic. Unit ids are offsets in the joined text (`u123456`), and any change to the parser or to the name table (`authorities.json`) can move them. See "Traps".
- `review-farsh.py --from A --to B [--width N] [--only clean|exceptions]`: prints one block per unit: id, page, flags, the sentence, each lemma with its verse and the Cairo words it matched, and who reads what. This is what you read.
- `review_kit.py`: helpers for writing a review (`Review`, `item`, `form`, `A`, `G`, `first_verse`).
- `apply-farsh-review.py REVIEW.json --out BATCH.json`: merges the review into a batch. An unflagged unit not named in the review is confirmed as drafted. A flagged unit not named is skipped as "unreviewed" and listed, so nothing unread gets through.
- `verify-farsh-items.py --batch BATCH.json [--write]`: the gate. Checks that every quoted span is an exact substring of the cited page, readers and groups resolve, the lemma is found in the Cairo text, and every stretch of 25 letters or more is either in an item or in `skipped`. Must report `errors 0 gaps 0`.
- `build-qiraat.py`: runs everything: verifies every batch (top folder and subfolders), assembles per-sura claims, resolves "the rest", builds `src/data/qiraat/sura-NNN.json` and `index.json`. The complete run takes several minutes on this machine.
- `calibrate-farsh-parser.py`: compares the parser with hand batches. Only needed if someone revisits the parser.

## The workflow for one range (about 12 to 15 pages, 50 to 75 units)

1. **Print.** `python scripts/quran/qiraat/review-farsh.py --from 431 --to 445 --width 220`. The first run takes about 25 seconds (it parses the whole section).
2. **Read every unit against its sentence.** For an `ok` unit: check the readers of each form, the "rest", the lemma, and the verse against the matched Cairo words shown. For a flagged unit: decide accept, replace, or drop. Look at the raw text when a unit looks like a fragment:
   ```python
   from farsh_items import Farsh, load_authorities   # with sys.path including scripts/quran/qiraat
   f = Farsh(load_authorities()); print(f.text[int('123456'):int('123456')+900])   # from a unit id
   ```
   or `python scripts/quran/qiraat/show-pages.py --book 5556 --from 431 --to 432`.
3. **Write the review** as `scratch/quran/qiraat/reviews/r431_445.py`, copying the shape of `r416_430.py`, and run it (it saves `farsh/reviews/r431-445.json`):
   - `r.accept(ids)`: a flagged unit whose draft is right.
   - `r.replace(id, item(...), ...)`: your items in place of the draft. Use this for any wrong verse, any missing reader, any statement the parser split.
   - `r.drop(reason, ids)`: fragments, tails of a previous statement, and rules that are not about one word.
   - Unnamed `ok` units are confirmed as drafted.
4. **Apply and verify:**
   ```bash
   R=docs/research/quran-platform/qiraat/farsh
   python scripts/quran/qiraat/apply-farsh-review.py $R/reviews/r431-445.json --out $R/reviewed/batch-5556-p431-445.json
   python scripts/quran/qiraat/verify-farsh-items.py --batch $R/reviewed/batch-5556-p431-445.json --write
   ```
   Fix until `errors 0 gaps 0` and `0 unreviewed`. Anchor lines ("weak", "none") are informational.
5. Continue with the next range until page 620.

### The item format (`review_kit.item`)

`item(page, ev, lemma, verse, forms, scope="here", page_end=None, note=None, unresolved=None)`

- `ev`: a snippet, or `[start, end]`. The tool cuts the exact text from the start snippet to the end snippet inside the pages named by `page`/`page_end`. The start snippet must be unique in that window. **If the end of the sentence is on the next page, set `page_end`.** Errors "snippet not found" are almost always this, or a snippet that is not literal (see below).
- `lemma`: a substring of the evidence. `verse`: `"sura:verse"`; `None` fills the first exact occurrence in the Qur'an (right for words given "wherever").
- `scope`: `here`, `wherever` (ḥaythu waqaʿa, kayfa waqaʿa), or `listed` (several places named).
- `form(desc, readers, rest=None, basis=None)`: `desc` must be literal text from the evidence (a string, or a `[start, end]` pair). `readers` is a list of `A(id, snippet[, basis])` or `G(group_id, snippet)`. `rest` is the snippet for "wal-bāqūn" (or "kulluhum", "al-bāqūn").
- Reader ids and rules: see `farsh/EXTRACTION.md`. A qāriʾ id means both his transmitters; a transmitter id only him. Bare "khalaf" is `khalaf_ashir`. Groups: `haramiyan`, `kufiyun`, `madaniyan`.
- A reader may appear in two forms only when both entries carry basis `"disputed"`. A form has readers or `rest`, not both. An item with `unresolved` cannot also have a `rest`.
- Basis values: `listing` (default), `report` (through a named student), `rejected`, `disputed`.

## How to decide, and the traps found so far

Each of these was a real error found in the parser's drafts or in blind audits (about 1 silent error per 25 to 30 "clean" units before review).

- **The verse is the point of the reading.** The book often prints the variant, not the Cairo word. A lemma matched at the wrong verse is the commonest defect. Check the matched Cairo words. Examples: `(يحشرهم ثم يقول)` is 6:22 (Cairo has نحشرهم), `(ثم لم يكن)` is 6:23, `(أو لمستم النساء)` is 4:43.
- **"Locator" parentheses.** In `(A) بعده (B) form`, B only says where A is; the item is A alone. Same for "after the hundredth verse", "the second one", "at its end" (في آخرها): the place is what the words say, not the first occurrence.
- **"Here and in X" (هنا وفي X).** One reading at several places. Enter `scope="listed"` with a note, and add an item per place when the readers differ by place (for example: Kisāʾī agrees only in two of six places of فيكون; Ruways agrees only in Maryam and the first place in Ghāfir).
- **Different readers at different places in one sentence.** Never share one form list across places. Enter one item per place with the readers that apply.
- **The rest can be displaced.** "Wal-bāqūn" may come after an author's remark ("qultu"), after a full stop, or at the end of several statements. A statement that ends without a rest and is followed by a remark or another statement is suspect: read on.
- **Exceptions.** "ما خلا X", "إلا X", "غير X", "حاشا (Y)" remove X or Y from the statement. Words in an excepted parenthesis take no item.
- **Agreement (وافقهم, تابعه).** The reader joins the form of the readers just before it, but often only at some places. Enter per place.
- **A reader named for another word in the same passage** must not fall into "the rest" of this word by default. If the book gives him his own form, add it.
- **Disputes (بخلاف عنه).** Put the reader in the form with basis `"disputed"`. If the dispute sits inside a qāriʾ's name (Ibn ʿĀmir with a dispute about Hishām, Nāfiʿ with a dispute about Warsh) the model cannot state it faithfully: drop with that reason.
- **Reports through a chain** ("روى الشطوي عن ابن وردان", "عن أبي ربيعة عن البزي"): the named transmitter with basis `"report"`.
- **Edition misprints** occur: بعقوب (يعقوب), قلون (قالون), أبن (ابن), الكوفييون. The first three are registered as name variants in `authorities.json`; a misspelled group name is accepted for groups because the verifier checks membership only.
- **Rules are not per-word statements.** The imāla of رأى, hamzat al-waṣl, the double question (أئذا أئنا), the ishmām of ṣād, the ينزل family: drop with reason "belongs to the rules layer". A later phase (ROADMAP phase 5) will enter them.
- **Long lists** (al-Bazzī's thirty-one tashdīd places) and chains of transmission: drop with a reason. They are tracked in the review files' `drop` reasons.
- **Do not paraphrase.** Descriptions and spans are exact text. Our English is only in `note`.

## Traps in the tools

- **Unit ids drift** when the name table (`authorities.json`) or the parser changes: two fragments can merge into one unit with a new id. After any such edit, re-run `apply-farsh-review.py` for every existing review; it reports "units not in pages" or "unreviewed" if an id moved. Fix the review key and re-apply. The name table edits made so far (variants: unhamzated forms, أبو شعيب, أبي بكر, and the four misprints above) are already reflected in the existing reviews.
- `verify-farsh-items.py` treats a one-letter difference at the stated verse as agreement, but not when a lemma contains a word of two letters or fewer ("weak" anchor). Such items are still placed in the sura; they are just not tied to a Cairo word. Accept them.
- A `moved` result must be read against the source locator. The final audit found exact and loose matches at unrelated occurrences. Correct wrong hints; for a verified source location absent in Cairo, use `anchor_at_hint` with an explicit reason and retain no word IDs. Never protect an unchecked hint.
- The verifier has two verification-only name aliases: accusative `أبا جعفر` on p. 432 and the edition's transposed `أبو وعمرو` on p. 469. They are intentionally absent from the parser name table, so durable unit IDs do not drift.
- Bash on Windows rewrites a bare `/` argument; the scripts here do not take routes, but the contrast script does (`MSYS_NO_PATHCONV=1`).
- Do not run more than one heavy Python check at once; each loads the corpus (about 25 seconds).
- The Browser pane screenshots poorly on scroll-reveal pages; use Playwright scripts (`scratch/shots/`).

## After the last range (page 620): status and continuing work

1. Run the whole build and read its output for failures:
   ```bash
   python scripts/quran/qiraat/build-qiraat.py
   ```
2. Site checks (dev server on 4321 is the owner's; use it or build with `--outDir dist-check` and delete it after):
   ```bash
   npm run check
   node scripts/design-audit.mjs
   npx playwright test tests/quran.spec.ts -g "sura|hub"
   MSYS_NO_PATHCONV=1 node scripts/check-contrast.mjs --route /projects/quran/sura/2/
   ```
   (`check-contrast.mjs` takes one `--route`; run it for the hub, sura 2, one of its parts, and a few more.) `tests/quran.spec.ts` computes parts from `src/lib/qiraat-parts.ts`; sura 2 will have many parts now.

   Latest checks: `npm run check` and the scratch production build passed; eight hub/sura tests passed against the owner's dev server, and 35 routes passed a 320/390 px text-node and layout smoke check. Contrast passed in both themes for the hub, sura 2, sura 2 part 1, sura 72 and sura 112. `npm run test:design` failed with 32 existing errors outside the module. The normal Playwright configuration rejects a dev server, so the local display tests used a scratch configuration with `webServer` disabled; do not mistake these for production corpus tests. Remove `dist-check` before the final Astro check so generated worker bundles do not flood diagnostics with hints.

   The final `dist-check` output is still present: automatic approval review rejected the cleanup command with "blocked by policy". Its built hub counts, labels and Pagefind output were checked. The final Astro check still checks the whole project; hint output is suppressed to avoid printing generated worker bundles.
3. **Display labels: done.** Missing and placeholder labels use literal Arabic source excerpts. Do not invent English glosses.
4. **Documentation: updated.** D-070 to D-072, `../PROGRESS.md` and `ROADMAP.md` distinguish LLM reading, mechanical verification, page coverage and pending human review.
5. **Coverage numbers for the hub: checked.** `index.json` accounts for all 339 pages. The hub caption states that recorded omissions and deferred rules are included.
6. **Second witness (ROADMAP tier 2): continue the queue.** Al-Mabsūṭ (book 36104) is organized by sura and prints verse numbers. Compare its reader-to-form assignments directly with Taḥbīr's for each unchecked item in `second-witness/queue.json`. Read its complete routes and exceptions; do not map an early route name automatically to one of the twenty later canonical transmitters. Its final chapter is already read, with 43 comparisons, and p. 216 supplies two earlier edition-conflict comparisons. Disagreements and incomplete comparisons stay in the attention queue. Complete this before any release.
7. **Owner review and rights** (ROADMAP tier 3): nothing is cleared for release.

## Quick health check at the start of the next session

```bash
cd C:/Users/Jonathan/Desktop/HadithCriticBlog
git status --short | head -30
R=docs/research/quran-platform/qiraat/farsh
for f in $R/reviewed/batch-*.json; do case $f in *.checked.json) ;; *) python scripts/quran/qiraat/verify-farsh-items.py --batch $f | head -1;; esac; done
python scripts/quran/qiraat/show-pages.py --book 36104 --from 126 --to 127
```

Every reviewed batch should report `errors 0 gaps 0`. Continue with the independent-witness queue and the deferred rules/route exceptions; no source-page extraction range remains unstarted.

## Files changed or added in this stretch (for the commit)

- New: `scripts/quran/qiraat/farsh_parser.py`, `farsh_items.py`, `parse-farsh.py`, `review-farsh.py`, `apply-farsh-review.py`, `review_kit.py`, `calibrate-farsh-parser.py`; `src/lib/qiraat-parts.ts`, `src/lib/qiraat-suras.ts`; `src/pages/projects/quran/sura/[n]/index.astro` and `[n]/part/[p].astro` (the single `[n].astro` was removed); `farsh/reviews/*.json`, `farsh/reviewed/*.json`.
- Changed: `src/components/qiraat/SuraQiraat.astro` (parts, overview, arrow glyphs removed), `tests/quran.spec.ts` (parts tests), `scripts/quran/qiraat/verify-farsh-items.py` (near match at the stated verse), `build-qiraat.py` and `assemble-farsh.py` (scan subfolders), `authorities.json` (name variants), `../DECISIONS.md` (D-069), `../PROGRESS.md`.
- Suggested commits (conventional): `feat: split long qirāʾāt suras into part pages`, `feat: add rule-based drafting and review tools for the farsh`, `feat: add reviewed farsh batches for pages 288 to 430`, `docs: qirāʾāt hand-off`. No co-author lines.

The 2026-09-30 continuation adds reviews/batches for pp. 431-620, the independent-witness audit and queue, the source-label and reviewed-anchor behavior in the verifier, language markup in `SuraQiraat.astro`, the hub coverage caption, output-directory support in `scripts/build-site.mjs`, regenerated claims/display data and the current docs. It also corrects durable authoring records for the older anchor defects listed above. Those changes are still uncommitted, alongside the pre-existing workspace changes.
