# M1 human review protocol

Status: **protocol prepared; no participants or reviewers have been recruited**.  
Prepared: 4 October 2026.  
Purpose: make the roadmap's specialist/bilingual review and 5–8-reader question-comprehension checks executable without treating either as completed.

This protocol's current item worksheet covers the original M1 prototype Q01–Q24.
The separate M3 candidate bank now contains Q01–Q96. Before asking readers to
review M3 wording, editors must select and revise a reduced instrument, then
update the session materials and status counts. Do not report candidate-bank
drafting as reader comprehension review.

## 1. Review workstreams

Keep the two kinds of review separate:

1. **Source and content review:** specialists assess attribution, legal scope, reasoning, contrary evidence, Arabic wording, English translation, edition/locator correspondence, and source-use rights. One reviewer should not be presented as representing an entire tradition. Record qualifications and disagreements rather than forcing consensus.
2. **Question comprehension:** 5–8 readers from the intended audience explain what each draft item means. This is a formative wording exercise, not psychometric validation, a vote on doctrine, or a measurement of participants' religious commitments.

An LLM can help flag inconsistencies and prepare drafts. It cannot fill a human reviewer field, conduct participant sessions, clear rights, or turn candidate evidence into an approved position.

## 2. Question-comprehension sessions

### Participants and administration

- Recruit 5–8 adult readers who resemble the intended general-reader audience. Record only a participant code and broad, optional familiarity with fiqh terminology; do not ask for sect/school identity or personal religious answers.
- Obtain informed consent for note-taking. Explain that the questions and historical interpretations are provisional and that the exercise is about wording, not the participant's beliefs or religious competence.
- Conduct a 45–60 minute moderated session. A participant may skip an item or stop at any time. Do not offer a preferred interpretation before eliciting theirs.
- Show all 24 draft questions in a varied order. Record each response against Q01–Q24. With fewer than 5 participants, or if any item is not reviewed by at least 5 people, the comprehension gate remains open.
- Do not retain audio or video by default. Keep de-identified notes in restricted project storage; publish only aggregated wording findings.

### Script for each item

1. “In your own words, what is this statement asking or claiming?”
2. “What do you think [key term] means here?” (Use only if the reader did not explain it.)
3. “What assumptions or situation did you picture?”
4. “Could two people agree about the principle but answer differently because they imagined different cases?”
5. “Do the response options let you express uncertainty or that the item does not apply? What would you choose if neither fits?”
6. “Which words, if any, felt unclear, double-barrelled, leading, or too technical?”

Do not ask for the reader's own doctrinal choice as study data. If a reader volunteers one, redirect to the interpretation task and do not enter that belief in the worksheet.

### Record and code

For each participant × item, record: participant code; question ID and wording version; paraphrase; assumed case/role; terms understood differently from the editorial intent; issue type; severity; suggested wording; moderator note. Avoid names, contact details, sect labels, or substantive belief answers in the analysis file.

Use these issue codes:

- `clear`: paraphrase preserves the intended claim and scope;
- `term`: a key term has a materially different interpretation;
- `scope`: reader assumes a broader/narrower legal domain or role;
- `double_barrelled`: reader identifies more than one claim;
- `leading_or_loaded`: wording suggests a preferred answer;
- `response_gap`: available options do not let the reader express the intended response;
- `other`: describe without forcing a category.

Flag an item for revision if **two or more of five readers** misunderstand its central claim, if any reader identifies a material ambiguity that changes the implied case, or if an answer option forces a belief the item does not ask about. These are conservative editing triggers, not statistical thresholds. Record both the original and revised wording and retest any materially changed item with at least five readers before claiming the comprehension gate is met.

### Completion record

The study is complete only when every version of every retained draft item has at least five participant records, each flagged issue has a documented disposition, changes have been retested where material, and a findings memo reports methods, sample limits, item-level outcomes, revisions, and remaining ambiguity. Do not describe this small exercise as validation or reliability testing.

## 3. Specialist, attribution, and bilingual review

Generate the restricted packets with:

```powershell
python scripts/fiqh-compass/build_review_packets.py `
  --db scratch/fiqh-compass/fiqh-compass-research.sqlite `
  --assessments docs/research/fiqh-compass/pilot-assessments-v1.json `
  --out scratch/fiqh-compass/review-packets
```

Each packet is a review aid, not a public source edition. Reviewers should check the complete local context, not only the extracted segment. The packet includes available digital locators and preserves unresolved work/edition identity; these are not substitutes for checking a scan or a named edition. Confirm the quoted text is eligible for the reviewer's access before sharing it. The generated folder is private/ignored and must not be committed, uploaded, or published until source-use terms have been assessed.

For each candidate position, ask reviewers to record separately:

1. **Text and voice:** Does the passage say what the candidate claim says? Is the relevant wording authored by the named author, quoted from someone else, attributed by a later source, or unclear?
2. **Case and scope:** What exact facts, domain, conditions, and exceptions govern the passage? What does it not establish?
3. **Reasoning:** What reason does the author give? Is it distinct from the result, and does the cited passage actually state it?
4. **Translation:** Does the English preserve qualifications, modality, technical terms, and voice? Identify alternate renderings and unresolved terms.
5. **Counterevidence:** Is there nearby, internal, chronological, or later evidence that qualifies or contradicts this formulation? Distinguish authorial development from later school doctrine.
6. **Bibliography and rights:** Can the work and edition be identified? Does a scan or reliable edition confirm text and locator? What reuse/quotation conditions apply? Mark unknown where not established.

Use `supported`, `supported_with_qualification`, `contradicted`, or `unable_to_assess` for the candidate claim; use a separate finding for translation and edition/rights. Capture reviewer role/competence, source consulted, review date, rationale, proposed correction, and unresolved disagreement. Do not record a name in a public export without the reviewer's consent. A single review does not imply community-wide representation.

## 4. Gate accounting

This protocol and its generated packets are preparatory artifacts only. The current state remains: **0/24 items comprehension-checked; 0 specialist approvals claimed; 0 bilingual approvals claimed; rights uncleared; edition/scan collation incomplete.** Update these counts only from actual, recorded human work. M1 must remain open until its roadmap acceptance checks have direct evidence.

## Current paired instrument packet

The exact English strings and provisional Arabic drafts for the current 12 axes, 24 questions, and seven response choices are in the restricted, ignored file `scratch/fiqh-compass/instrument-bilingual-review-packet-v1.json`. The packet records per-item review fields and is not for publication. At preparation, bilingual human reviews and approved translations remain 0; do not change those counts until actual review is documented.
