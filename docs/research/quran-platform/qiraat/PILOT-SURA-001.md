# Qirāʾāt pilot: Sura 1

Dated 2026-09-29. Scope and rationale: D-065 in [DECISIONS.md](../DECISIONS.md).

The pilot asks one question: can readings of the ten qirāʾāt (twenty riwāyāt)
be recovered from the local Shamela texts in a form that is verifiable,
attributable to a page, and comparable across books? Sura 1 was chosen because
it is short, its differences are well known, and Ibn Mujāhid, ad-Dānī, Ibn
Mihrān and Ibn al-Jazarī all treat it.

## What was built

| File | Purpose |
|---|---|
| `source-roles.json` → `sources.json` | 60 registered books with role, reader set and scope; bibliographic fields copied from the Shamela index CSV by `build-source-registry.py`, never typed. |
| `authorities.json` | The ten qāriʾs and twenty riwāyāt, Arabic match strings as they appear in the texts. Regions are the owner's and are unverified. |
| `claims/sura-001.json` | 51 reading claims: reader, value, exact evidence span, page. |
| `claims/sura-001.verified.json` | The same claims after verification, with the raw slice (the book's own diacritics) and the located page. |
| `pilot-sura-001-matrix.md` | Generated comparison: five features by twenty riwāyāt by five witnesses. |

Scripts are in `scripts/quran/qiraat/`: `build-source-registry.py`,
`cache-shamela-pages.py`, `segment-ibn-mujahid.py`,
`verify-qiraat-claims.py`, `build-display-data.py`. The page cache is under
ignored `scratch/`.

The display on `/projects/quran/` (a collation matrix plus position cards) reads `src/data/quran-qiraat-sura-001.json`,
which `build-display-data.py` writes from the verifier's outputs. To rebuild
after editing claims (paths set through `SHAMELA_PARQUET` and
`SHAMELA_INDEX_CSV`, or the flags):

```bash
python scripts/quran/qiraat/build-source-registry.py
python scripts/quran/qiraat/cache-shamela-pages.py --ids 5556 5527 36104 5530 22642
python scripts/quran/qiraat/verify-qiraat-claims.py --strict --write
python scripts/quran/qiraat/build-display-data.py
```

The display file embeds short quotations from Shamela editions. Keep it local
until the rights review in `SOURCE-RIGHTS.md` is done.

## What is automatic and what is not

- **Automatic:** registry building; page caching; segmentation of Ibn
  Mujāhid; verification; resolution of qāriʾ-level claims and "the rest";
  the comparison tables.
- **Authored:** the 51 claims themselves. They were written by reading the
  passages, then checked mechanically. The verifier proves that each quoted
  span exists in the cited page. It does not prove the reading was understood
  correctly, so every claim stays `proposed` until a person reviews it.

## Results

**Segmentation.** Ibn Mujāhid's book (5530) splits into 106 sura sections and
1,245 numbered items. Every item has a quoted form. 1,222 carry a verse number
printed by the book; those were not checked. The book's own numbering skips
five numbers (for example item 19 in Al-Anʿām) and contains stray digits such
as cross-references like "al-Māʾida 22 -"; the segmenter accepts forward jumps
of up to three, reports every gap, and lists strays instead of ending the
section. Sura 1 has four items, and only the first prints a verse number, so
the anchors for items 2 to 4 were assigned against the Cairo text and remain
candidates.

**Verification.** 51 of 51 claims verify. Two failed on the first run because
their evidence sat on page 112, not 111; the verifier caught it, and nothing
was corrected by hand beyond the citation.

**Agreement across witnesses** (per riwāya, listed readings only):

| Feature | Agree | Agree, other reports exist | Differ |
|---|---|---|---|
| 1:4 mālik / malik | 18 | 2 | 0 |
| 1:6 al-ṣirāṭ | 15 | 3 | 2 |
| 1:7 ṣirāṭ | 15 | 3 | 2 |
| 1:7 hāʾ of ʿalayhim | 20 | 0 | 0 |
| 1:7 ghayri | witness count too low to compare (Ibn Mujāhid only) | | |

## What the comparison shows

1. **The mainstream split is stable.** For 1:4, all five books put ʿĀṣim,
   al-Kisāʾī, Yaʿqūb and Khalaf al-ʿĀshir on the long form and the other six
   qāriʾs on the short one. The Mabsūṭ adds a report that al-Kisāʾī read both.
2. **Disagreement sits where the tradition itself is divided.** The two
   riwāyāt that differ on ṣirāṭ are Khallād and Qunbul. an-Nashr explains
   both. For Khallād it lists four options (the first occurrence only, the two
   Fātiḥa occurrences, the definite form throughout the Qurʾān, or none at the
   first) and assigns them to named books and routes. The Mabsūṭ's "Umm
   al-Kitāb only" matches one option; at-Taysīr and Taḥbīr match another. So
   the difference is real and belongs in the data as a dispute, not as an
   extraction error. The Khallād row at 1:7 rests partly on my reading of "Umm
   al-Kitāb" as covering both verses (noted in the claim).
3. **A witness can record a reading and reject it.** The Mabsūṭ notes a sīn
   attribution to Ibn Kathīr and calls it a mistake. The schema keeps this as
   `basis: rejected` so it does not read as an attestation.
4. **Reports are not readings.** Ibn Mujāhid gives four different reports for
   Abū ʿAmr (sīn, ṣād, pure zāy, ishmām) through named students, while all
   four ten-reader books give ṣād. Ibn Mujāhid alone reports a nasb reading of
   ghayri for Ibn Kathīr through al-Khalīl. Each witness must stay
   attributable, or reports from outside the twenty riwāyāt would merge into
   them.
5. **Naming needs rules.** The bare name Khalaf means Ḥamza's transmitter in
   a seven-reader book and Khalaf al-ʿĀshir in a ten-reader one; al-Dūrī is
   the name of a transmitter under two qāriʾs. The pilot resolved these by book
   scope or an explicit "ʿan Ḥamza". Expanding a qāriʾ-level claim to both
   riwāyāt also loses chain detail (the Mabsūṭ's al-Kisāʾī report runs through
   al-Dūrī specifically).

## A finding about Arabic script

The Shamela editions are vocalized to very different degrees. Marks per 100
Arabic letters:

| Book | Marks per 100 letters |
|---|---|
| an-Nashr (22642) | 82.5 |
| Ṭayyiba matn (7795) | 80.6 |
| ad-Durra (7749) | 77.2 |
| ash-Shāṭibiyya (7754) | 73.7 |
| Taḥbīr at-Taysīr (5556) | 38.8 |
| Ibn Mujāhid, as-Sabʿa (5530) | 37.5 |
| at-Taysīr (5527) | 33.9 |
| al-Kāmil (36957) | 16.5 |
| al-Mabsūṭ (36104) | 16.4 |
| Irshād (1283) | 9.5 |
| Itḥāf (10010) | 2.1 |
| Jāmiʿ al-bayān (37649) | 1.1 |

In the middle group the quoted form often lacks the very vowel that makes it a
variant. The raw text of Ibn Mujāhid's ghayri passage writes the quoted form
without its distinguishing vowel, and the value is recoverable only from the
prose after it. So the words that describe the reading ("with alif", "with a
ḍamma on the hāʾ", "ishmām") carry the data. Vocalized Arabic for a variant
can come directly from an-Nashr and the three poems, but for the others it
would be a derived layer, which must be labeled as such.

## Independent review

A separate code review of the four scripts found defects, all fixed and
re-tested:

- The first segmenter matched only headings with a pair of zero-width
  characters, so it saw 44 of the 106 sections (915 items instead of 1,245),
  and it stopped a section at the first missing number.
- The raw slice stored for six claims dropped the diacritics of the last
  letter. It is now extended and checked to normalize back to the evidence.
- Empty evidence, an inverted page window, an ambiguous page label (an-Nashr
  reuses page numbers across two volumes) and a second "the rest" claim now
  fail instead of passing quietly. Cached page hashes are checked on load and
  recorded in every verified claim.

## Limits

- Rule-based differences (ṣilat mīm al-jamʿ, idghām) are not word-level
  variants. They depend on context, and Sura 1's fourth item and the sections
  after it are mostly of this kind. They need a rule layer, not a value per
  word.
- an-Nashr's sentence on Qunbul leaves its object unstated in this edition.
  The claim records `disputed` and no second value.
- The claim schema is not yet proven against a long or irregular sura.

## Next steps

1. Have a person review the 51 claims, starting with those flagged in `note`.
2. Choose whether to extend with a second sura of a different shape (for
   example one with many farsh items) before automating extraction.
3. Design the rule layer for uṣūl features.
4. Parse Taḥbīr at-Taysīr, whose formula is uniform, with the verifier as the
   gate, and use the other books as cross-checks.
