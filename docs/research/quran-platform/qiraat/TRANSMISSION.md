# Transmission of the readings

Dated 2026-09-29. Scope and rationale: D-068 in [DECISIONS.md](../DECISIONS.md).

The page at `/projects/quran/transmission/` draws the chains by which the ten
readers and their twenty transmitters are said to have received the reading,
from the Prophet down. Every link is a sentence in Ibn al-Jazari's an-Nashr
(Shamela 22642). The diagram records what that book says; it makes no claim
about whether it is right.

## Pipeline

| Step | Script | Output |
|---|---|---|
| Extract | four reading groups, run as separate extractions | `scratch/quran/qiraat/transmission/agent-A..D.json` (ignored) |
| Verify | `verify-transmission-edges.py` | each link's evidence must be an exact substring of the cited page; both name spans must sit inside it; no cycles |
| Merge | `merge-transmission.py` | `transmission/edges.json`: one link per (student, teacher) pair, every witnessing passage kept |
| Lay out | `build-transmission-data.py` | `src/data/quran-transmission.json`: positions, drawn paths, lineages |

```bash
python scripts/quran/qiraat/merge-transmission.py
python scripts/quran/qiraat/build-transmission-data.py
```

Extraction groups: Nafi and Abu Jafar; Ibn Kathir and Abu Amr; Asim, Hamza and
Khalaf; Ibn Amir, al-Kisai and Yaqub.

## What was found

- 126 people and 219 links, backed by 232 passages.
- 204 links are stated as reading on the teacher. 15 are drawn dashed because
  the sentence is hedged ("it is said", "possible") or the book says something
  other than reading: hearing, transmitting letters only, or being a companion.
  The two links from Warsh and Qalun to Nafi were overridden to firm: the
  hedge in their sentence concerns Nafi's kunya only.
- All 30 readers and transmitters reach the Prophet through the links.
- The longest chain has ten steps from the Prophet.

## Limits and choices to check

- **One book.** Other books may give other teachers.
- **Identifications across entries** are the extraction's, and each is noted on
  the link. Examples: "Abd Allah b. Kathir" in Abu Amr's entry is matched with
  the reader Ibn Kathir; "Abu Bakr" with Shuba and "al-Warraq" with Ishaq, by
  context. A reviewer should confirm these.
- **Two names for one person.** The book presents Khalaf as Hamza's transmitter
  and as a reader in his own right, and al-Duri under Abu Amr and al-Kisai.
  They are kept as separate people, as the book presents them.
- **Kisai's line** to the Prophet is joined from other readers' entries because
  his own entry says "his chain has preceded".
- **Abu al-Aswad** appears twice: bare "Abu al-Aswad" in Ibn Kathir's and Abu
  Amr's entries, and "Abu al-Aswad al-Daylami" in Hamza's. They are not merged
  because the text names them differently.
- **Roles.** Only the Prophet, the ten readers and the twenty transmitters are
  labelled on the diagram. Nobody else is called a companion or successor
  there, because the book does not label everyone.
- **A statement about soundness.** One link carries the book's own remark that
  a chain is of the highest soundness. It is shown only as an attributed
  quotation in that link's note, never as a badge or a color.
