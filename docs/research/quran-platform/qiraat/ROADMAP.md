# Qirāʾāt module: state, roadmap, and what "complete" means

Dated 2026-09-30. Decisions are recorded in `../DECISIONS.md`; this file is the plan.

## Where we are

| Area | Today |
|---|---|
| Coverage | All 339 farsh pages accounted for; 103 suras with data, 1,930 positions, 3,927 claims, including the five-book Sura 1 pilot. The other 11 suras have no position because the books say there is no difference in them (or only a rule or an outside report) |
| Rules | Pages 181 to 281 entered as 142 rules in 28 chapters (263 claims) at `/projects/quran/rules/`; pages 268 to 281 are summaries of lists entered place by place |
| Authoring | Frozen parser drafts, source reading in the main session, durable review decisions; no sub agents |
| Verification | Zero quotation errors and coverage gaps; 1,682 agreeing, 77 weak and 69 absent word anchors; zero moved anchors |
| Site | `/projects/quran/`, data-driven sura and part pages, `/projects/quran/transmission/`; source Arabic replaces placeholder labels |
| Transmission | 126 people, 219 links, one book (an-Nashr), stops at the 20 transmitters |
| Review | LLM source read-through, human approval pending; every al-Mabsūṭ difference read (200) and an-Nashr compared by machine (D-079, D-082); the 144 partial and 91+ unlocated results remain |
| Rights | Embedded Shamela quotations are not cleared for deployment |

What the source survey found (checked against the cached Taḥbīr, book 5556):

- Taḥbīr states its own collective terms on p. 104: al-Ḥaramiyyān are Nāfiʿ and Ibn Kathīr; al-Kūfiyyūn are ʿĀṣim, Ḥamza, al-Kisāʾī and Khalaf. Those and "the rest" are the only group names it uses in the word-by-word section (92, 71 and 32 occurrences).
- Layout: Fātiḥa with the first rules (p. 186), general rules (pp. 187 to 281), then word-by-word readings sura by sura from Baqara (p. 282, "bāb dhikr farsh al-ḥurūf") to al-Ikhlāṣ (p. 620). The inclusive farsh range has 339 pages.
- Readings are stated as sentences of the form "readers, (word), form; the rest, other form". Each sentence is one extractable unit and its evidence is a substring of one page.
- Some items say "wherever it occurs" (ḥaythu waqaʿa) or point back ("mentioned in al-Baqara"). Those are one item with a scope, not many.

## What complete means

Three tiers. Each is a stopping point that is honest about what it claims.

**Tier 1, coverage.** Every sura from 1 to 114 has every word-by-word item Taḥbīr states, for all ten readers (twenty transmitters), as data that passes these gates:

1. The evidence is an exact substring of the cited page.
2. Every reader span, form span and "the rest" span sits inside the evidence.
3. Group names resolve only through the book's own definitions.
4. Each item is anchored to a verse of the Cairo text by mechanical matching of the quoted word, and disagreements between the extractor's verse and the match are listed, not resolved silently.
5. Every position resolves all twenty transmitters to a reading, or says nothing is stated for that one.

The site shows a per-sura page for all 114, a verse index, reader focus, and a coverage page that states the counts. Everything is labeled machine-extracted and unreviewed.

**Tier 2, corroboration.** Independent books are extracted for the same positions: Ibn Mihrān's al-Mabsūṭ (ten readers, by sura) and Ibn Mujāhid's as-Sabʿa (seven). The site marks each position corroborated, in disagreement, or single-witness. Taḥbīr is al-Dānī's Taysīr plus Ibn al-Jazarī's bracketed additions, so Taysīr is not a second witness for it. The marks say "another book states the same", not "verified".

**Tier 3, review and release.** A reviewer queue, sampling statistics, a rights decision on the embedded quotations, and a decision on deployment. Nothing ships publicly before this tier.

Out of scope until asked: manuscripts (Corpus Coranicum), any grading or ranking of readings, and vocalized re-typesetting of a reading (the book describes forms in words; the module reproduces the description).

## Phases

| # | Phase | Output | Gate to leave |
|---|---|---|---|
| 0 | This plan; group terms cited from the book | `ROADMAP.md`, `authorities.json` groups | Groups carry a verified quotation |
| 1 | Generalize the pipeline by sura | items format, verifier, aligner, converter, display builder take a sura | Sura 1 rebuilds identically from the new path |
| 2 | Pilot Baqara opening pages | Passed: 40 items read against their evidence in the earlier main session | Mechanical gate passed; human release approval still separate |
| 3 | Scale Taḥbīr | All pages through 620 read/accounted for; main-session review, explicit omissions and unresolved terms | Zero verifier errors and gaps; zero moved anchors; exhaustive Tier 1 content still pending deferred rules and route exceptions |
| 4 | Site at scale | Data-driven hub, suras, verse indexes and parts; source Arabic labels | Sura tests and contrast pass; check and scratch build pass; repository design audit has existing failures outside this module |
| 5 | General rules layer | Done as a first pass: the uṣūl as `rule` items by chapter, and the rule-like statements set aside inside the farsh entered as supplement batches | Same gates; separate page; the yāʾāt and dropped-yāʾ summaries are checked against the place-by-place entries |
| 6 | Second witness | Started: al-Mabsūṭ tail chapter and an earlier edition conflict; durable audit and queue in `second-witness/` | 200 machine-flagged differences read (`second-witness/compare-read.json`); read the 144 partial results, a sample of agreements and the not-located items, then review route-sensitive differences before publishing corroboration counts |
| 7 | Review and release | queue, sample audit, rights ruling | Owner sign-off |

Transmission-diagram extension (al-Dānī, al-Shāṭibī, Ibn al-Jazarī's routes) is a separate track and waits for the owner's decision.

Page coverage is complete and the rules layer is entered; the permitted ways of beginning a word, the second-level rules and 17 of the 22 unresolved spans are now in (D-081). Five unresolved spans remain, each with a stated reason, and Tier 2 is not finished. Recorded omissions must be resolved or explicitly scoped out before claiming every farsh item has been entered. The 13 suras without data are not declarations that those suras have no reading differences. The independent-witness audit has not been promoted into site claims. Its first pass (pp. 611-620) records 22 agreements, 14 differences or edition conflicts, eight partial comparisons and one passage not located; the whole-farsh comparison with al-Mabsūṭ and an-Nashr is in `second-witness/`.

## Risks stated up front

- The gate proves the book says the sentence, not that the extractor assigned readers to forms correctly. That is why a sample is checked by hand at each phase and why Tier 2 exists.
- Anchoring a quoted word to a verse can be wrong when a word repeats in a sura. The aligner uses the book's order as a constraint, and every disagreement is reported.
- Labels such as short English glosses are our apparatus, not the book's words. They are marked as such and never replace the Arabic.
