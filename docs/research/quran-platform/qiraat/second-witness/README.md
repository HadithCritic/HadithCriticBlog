# Independent-witness comparison

Updated 2026-09-30. This is a source-reading audit by the main LLM session. All comparisons await human review. No site claims or corroboration marks are generated from it.

`audit-5556-p611-620-vs-36104.json` compares all 43 entered items in Taḥbīr pp. 611-620 with al-Mabsūṭ pp. 469-480. It records 22 agreements, 12 differences, eight partial comparisons and one passage not located in the chapter read. `audit-5556-p381-vs-36104-p216.json` adds two edition-conflict records: Abu Amr's assignment agrees, but the printed description of the rest in Taḥbīr mentions a letter absent from the lemma. The primary quotation has not been rewritten using the other book.

`queue.json` lists 1,783 farsh items still awaiting independent-witness reading, and 23 attention records from the completed comparisons. Attention includes differences, partial comparisons and absence from the passage inspected. It does not mean 23 established historical contradictions.

Each comparison names the durable Taḥbīr item ID, verse, source witnesses, exact normalized evidence and an editorial note stating what was compared. Al-Mabsūṭ evidence was located as an exact substring of its cached page window. Repeated whole-page quotations preserve context for route exceptions; they are not newly reconstructed reading forms.

Continue one source range at a time in the main session. Read the full sentence, including the rest, disagreements and chains. Compare the same place and the same distinction. A shared lemma or verse number only finds a candidate; it cannot establish agreement. Do not turn a qari-specific or early route-specific statement into an assertion about both canonical transmitters without evidence.

The tail audit exposes distinctions worth resolving first: Yaqub versus Ruways at 88:11; Qunbul's retention at 89:9; Yaqub's competing reports for hamza at 90:20 and 104:8; Ibn Amir versus Ibn Dhakwan at 98:6-7; ha realization at 99:7-8; Rawh at 104:2; Hisham and al-Bazzi at 109:6; and the Yaqub and Abu Jafar routes at 112:4. These are preserved as differences or partial comparisons, not corrections to either classical witness.

Qunbul's listed wasl retention and separately reported retention in both states at 89:9 remain unassigned in the structured Taḥbīr item. The duplicate-reader gate cannot express both listing/report basis and overlapping route alternatives there. They are not relabeled disputed to pass the gate. The audit compares the full quotation, including these retained unresolved passages.

Every comparison remains `llm_read_owner_pending`. Full Tier 2, source rights and owner approval are still required before release. Do not deploy.

## Machine comparison and the reading of its differences (D-079)

`compare-auto.json` is the output of `scripts/quran/qiraat/witness-compare.py`: 661 agree, 200 differ, 144 partial, 391 yāʾ lists and 529 not located. It is a first pass on who is grouped with whom, not a finding.

`compare-read.json` holds the 200 `differ` items after reading. Each has a verdict (AG agree on the point compared, DF differ, AS different aspects, WR wrong al-Mabsūṭ item matched, UN not read), a note, the al-Mabsūṭ item number and page, and the exact item text from the cached page (cut at 1,600 characters where longer). Five items also carry an an-Nashr reading with its volume and page, because a third book settles which of the two differs.

Totals: 102 AG, 84 DF, 7 AS, 6 WR, 1 UN. Yaʿqūb (Rawḥ against Ruways) accounts for 42 of the differences and Hishām against Ibn Dhakwān for 17. Each item also records whether the an-Nashr comparison (below) groups the readers as Taḥbīr does, and where an-Nashr says Ibn Mihrān alone reports a reading from Rawḥ (al-Mabsūṭ is his book). Three notes in the file are source discrepancies in the printed Taḥbīr sentence (12:62, 30:50, 41:47). Several al-Mabsūṭ lines look corrupt against an-Nashr and Taḥbīr (20:97, 17:42 to 44, 81:6) and are marked for a page-image check.

Nothing here becomes a site claim. Continue with the 144 partial results, then a sample of the agreements and the not-located items.

`nashr-compare-auto.json` is the output of `scripts/quran/qiraat/nashr-compare.py`: the same test against an-Nashr (796 agree, 104 differ, 91 not located). It is a triage; most differences are the script's (D-082). `compare-read.json` also lists `source_discrepancies`: places where the printed Taḥbīr sentence and an-Nashr or al-Mabsūṭ name different readers (12:62, 24:1, 30:19, 30:50, 41:47, and two where an-Nashr sides with Taḥbīr).
