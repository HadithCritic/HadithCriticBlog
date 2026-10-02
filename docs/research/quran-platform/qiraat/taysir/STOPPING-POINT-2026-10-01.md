# Qirāʾāt project stopping point — 2026-10-01

## Current status

The source-by-source goal is paused at a verified checkpoint, not complete.
The active source is al-Dānī's *at-Taysīr* (Shamela book 5527), vol. 1. Its
farsh pages 72–168 have checked batches for all 97 pages in that range. The
next farsh page to inspect is p. 169. This book still has relevant uṣūl
material on pp. 19–71, later farsh on pp. 169–226, and end matter on pp.
226–228; earlier page ledgers also contain unresolved passages. Page coverage
does not mean the book is exhausted.

The latest batch, pp. 167–168, contains 26 reading items and eight tracked
passages. Its verifier reports zero errors, zero coverage gaps, 24 agreeing
anchors and two source-located readings without direct Cairo-word anchors.
The complete Qirāʾāt build passes. The generated index currently reports 103
suras, 2,110 positions and 8,270 farsh claims; the rules index reports 168
rules in 41 chapters with 322 claims.

## What the latest pages record

| Source passage | Recorded distinction | Project record |
| --- | --- | --- |
| 26:217 `فتوكل` | Nāfiʿ and Ibn ʿĀmir with fāʾ; the remainder with wāw | `d167-01`, supplements `u205244-r1` |
| Al-Shuʿarāʾ yāʾ inventory | 13 explicit locations, including five `إن أجري إلا` occurrences; each retains the source's named readers | `d167-02`–`d167-14` |
| 27:7, 27:21, 27:22 | Tanwīn at `بشهاب`; Ibn Kathīr's two-nūn form; ʿĀṣim's fatḥa at `فمكث` | `d167-15`–`d167-17` |
| 27:22 and 34:15 `سبإ` | Three source forms: fatḥ without tanwīn, Qunbul's sukūn on intention to stop, and the remainder with kasra and tanwīn | `d167-18`–`d167-19` |
| 27:25–28 | Kisāʾī's `ألا يسجدوا` stop/start procedure; Hafṣ/al-Kisāʾī tāʾ form; three `فألقه` hāʾ routes | `d168-01`–`d168-03` |
| 27:49, 27:62, 27:66 | Hamza/al-Kisāʾī paired tāʾ forms; Abū ʿAmr/Hishām yāʾ; Ibn Kathīr/Abū ʿAmr hamza separation | `d168-04`–`d168-07` |

Three contrasts remain explicitly unresolved on p. 168: the positive reader set
for the hamza forms at 27:44, 38:33 and 48:29; the positive reader set for
`أنا دمرناهم` at 27:51; and the positive reader set for `خير أما يشركون` at
27:59. Their reading differences are preserved in the skipped-passage ledger;
no reader set is inferred. The source's local forward-name pattern and its
`قد ذكر` pointers explain these decisions. Two items have no direct Cairo-word
anchor because the source's variant spelling differs from the Cairo text; the
source citation itself gives their locations at 27:21 and 27:49.

## Files to continue from

- Book-specific method and attribution rules: [`EXTRACTION.md`](EXTRACTION.md)
- Page-by-page dispositions and unresolved passages: [`COVERAGE.md`](COVERAGE.md)
- Latest authored extraction: [`batch-5527-p167-168.json`](../farsh/taysir/batch-5527-p167-168.json)
- Latest verifier output: [`batch-5527-p167-168.checked.json`](../farsh/taysir/batch-5527-p167-168.checked.json)
- Current overall module handoff: [`../HANDOFF.md`](../HANDOFF.md)

Each source batch and its `.checked.json` file stays together under
`farsh/taysir/`. The Qirāʾāt build regenerates the related claim and display
data under `qiraat/claims/` and `src/data/qiraat/`. Keep generated outputs with
their authoring batches for the eventual review and push; do not clean or
reset the shared working tree, which contains other ongoing changes.

## Resume procedure

1. Read `HANDOFF.md`, this file, `EXTRACTION.md`, and the last rows of
   `COVERAGE.md` before editing.
2. Inspect at-Taysīr's own source text at p. 169 with
   `python scripts/quran/qiraat/show-pages.py --book 5527 --from 169 --to 169`.
   Continue investigating source order, cross-references, and attribution
   boundaries before assigning readers.
3. Check the existing feature/claim at each verse and add source-specific
   assertions by merging or supplementing the existing position. Preserve
   at-Taysīr's quoted wording, named readers/transmitters and printed page.
4. Record every page passage as incorporated, out of scope with a reason, or
   unresolved. Run `verify-farsh-items.py --batch <new batch> --write`; fix all
   errors and gaps before updating the coverage ledger.
5. Rebuild with `python scripts/quran/qiraat/build-qiraat.py --skip-verify-batches`
   after each checked batch or suitable batch group, and update the handoff
   counts from the successful build.
6. Audit all relevant at-Taysīr material, including its earlier unresolved
   spans and uṣūl/end matter, before marking book 5527 exhausted. Then verify
   the ledgers for Taḥbīr at-Taysīr (5556), an-Nashr (22642), al-Mabsūṭ
   (36104), and as-Sabʿa (5530). Do not begin the queued next five until the
   full first-five block is exhausted.

## First-five / next-five boundary

Finish and review these five before switching sources: Taḥbīr at-Taysīr
(5556), an-Nashr (22642), al-Mabsūṭ (36104), as-Sabʿa (5530), and at-Taysīr
(5527). The queued next five are al-Tajrīd (1273), Jāmiʿ al-Bayān (37649),
Irshād al-Mubtadī (1283), al-Kanz (29864), and al-Durra al-Muḍiyya (7749).
For every book, first document how that book organizes its readings, sources,
routes and verse references; do not impose another book's extraction scheme.

Nothing is committed, staged as a release, or pushed by this checkpoint. The
files are organized locally for review and a later scoped commit.
