# van Putten's at-Taysīr in the Qirāʾāt module

Marijn van Putten, *al-Dānī's al-Taysīr fī al-Qirāʾāt al-Sabʿ: A Translation
with Linguistic Commentary* (Open Book Publishers, 2026), CC BY-NC 4.0. It
translates Pretzl's 1930 edition, whose pages Shamela book 5527 reproduces, so
its page breaks line up with the module's Taysīr citations.

His English is an attributed scholarly reading, shown English-first beside the
Arabic. It is never evidence for a claim: every claim rests on its Arabic span.

## Where every statement is shown

`scripts/quran/qiraat/parse-van-putten.py` writes
`src/data/qiraat/van-putten-taysir.json`: 1,250 entries (104 in the general
principles, 1,146 in the sura-by-sura section), 579 translator's notes linked.

| Statements | Shown on |
|---|---|
| 104 general principles (uṣūl), including F.115 on the takbīr | `/projects/quran/taysir/`, in the book's order |
| 1,028 on a verse the module has a position for | the sura page, at that verse's first position |
| 45 on a verse with no position yet | the sura page, "More from al-Dānī's at-Taysīr" |
| 69 closing lists of a sura (its yāʾs, numbered without verses) and its "no disagreement" notes | the same section |
| 4 for suras with no positions (62, 94, 100, 113) | the Qirāʾāt index, under "Suras with no word-level position" |

Parser fixes made on the way, each checked by diffing the output: headings
that wrap onto a second line are joined (they had been cut, with the rest
starting the text); headings that only introduce sub-sections are kept (U.2,
U.4 and its seven reader headings, U.11, U.12); verse ranges and lists at the
start of a line ("13‒14:", "25, 26:") open a statement on the first verse
(15 statements had been merged into their neighbours); footnote numbers set
in a heading, or sharing a span with a Pretzl page mark, become references
instead of digits glued to the text.

## Cross-check

`scripts/quran/qiraat/crosscheck-van-putten.py` writes
`docs/research/qiraat/van-putten-crosscheck.json`. Of the module's 1,183
positions with a Taysīr claim:

| | Positions |
|---|---|
| He translates a statement on the verse, on the cited page (within one page) | 708 |
| The claim cites the sura's closing yāʾ list | 151 |
| The claim cites a page of the general principles | 4 |
| The claim cites an earlier page that carries a statement, as a rule stated once would (not word-checked) | 320 |
| Statement on the verse, but the claim cites a later page | 0 |
| No statement on the verse and none on the cited page | 0 |

407 verses he translates have no Taysīr claim in the module: those are the
Taysīr items still to enter as claims (45 of them have no position at all).

## Still open

These need the Arabic read item by item, under the module's own workflow
(`HANDOFF.md`), and owner or specialist review. They are not resolved by the
work above.

- The 407 translated verses without a Taysīr claim (above).
- The 320 "earlier page" matches: confirm each cites the statement for its word.
- al-Mabsūṭ: 144 partial, 529 not located, 391 yāʾ-list results unread.
- an-Nashr: 355 agreeing items with routes, several places or exceptions; 104 differences; 91 not located.
- as-Sabʿa passages outside mapped positions.
- Five unresolved spans in Taḥbīr (Qunbul at 89:9, and three in the rules chapters) and the Iraqi route at 39:7.
