# Futūḥ al-Buldān continuation

User request: preserve the updated supplied English translation through report
535 and finish the remaining Arabic text. Work started 15 October 2026.

## Inputs and boundary

- Arabic: `C:/Users/Jonathan/Desktop/tarikh/Arabic sources/02 - Conquests of the Lands (Futuh al-Buldan) - al-Baladhuri.md`.
- Earlier English (superseded): `C:/Users/Jonathan/Downloads/Futuh_al_Buldan_English_Through_525.md`.
- Current English: `C:/Users/Jonathan/Downloads/Futuh_al_Buldan_English_Through_535.md`.
- Active workspace: `C:/Users/Jonathan/Desktop/tarikh/Translations/translation-workspace-v1`.
- Job: `baladhuri-continuation-536-end-codex-v1`.

The new Arabic file matches the previously prepared original byte for byte.
The updated English prefix extends through report 535, printed p. 215. The
continuation begins at Arabic report 536 at character offset 328014, midway
through source block 284 on downloaded page label 253. That unit is clipped at
the report marker; blocks 285–609 follow through the closing colophon. The
active job has 326 units. 251 unchanged source blocks were reused as raw
Codex drafts from the earlier job; 75 units needed new translation.
Downloaded labels repeat; sequence IDs establish coverage.

Existing English report markers use several formats. A scan accepting those
formats found no Arabic report number absent from the supplied English prefix.
This is a numbering check, not an independent translation-quality review.
Report 13 is already explicitly noted as absent in the source. Existing
numbering irregularities and translator choices remain unchanged.

## Execution and preservation

Codex CLI workers use the signed-in account. Initial batches used the configured
gpt-6.1-sol model. The user explicitly selected gpt-6-luna for the remaining
translation and Arabic comparison after the first run reached its usage limit.
A recorded model switch preserves completed drafts and does not alter global
Codex configuration.
No translation API key is used. Requests freeze exact Arabic, offsets, hashes,
adjacent context, and instructions. Results checkpoint individually and resume
without repeating saved translations. The continuation prompt retains report
numbers, compact transmission chains, scholarly transliteration, poetry,
source notes, repetitions and OCR uncertainties.

`continuation-provenance.json` records the original English byte checksum and
the Arabic boundary. `scripts/tarikh/finish_continuation.py` requires every
remaining prepared unit and an unchanged prefix before assembling the finished
English draft. The original download remains untouched. The bilingual export
covers only the new continuation; it does not imply the earlier English has
been newly aligned or reviewed. Nothing is published automatically.

## Resume

```powershell
$translationWorkspace = 'C:/Users/Jonathan/Desktop/tarikh/Translations/translation-workspace-v1'
python scripts/tarikh/codex_runner.py --workspace $translationWorkspace --job baladhuri-continuation-536-end-codex-v1 --workers 3 --model gpt-6-luna --batch-pages 8 --disable-mcp node_repl --disable-mcp animotion --disable-mcp paper --disable-mcp deepgram_docs --disable-mcp deepgram
python scripts/tarikh/codex_review.py --workspace $translationWorkspace --job baladhuri-continuation-536-end-codex-v1 --workers 3 --model gpt-6-luna --batch-pages 12 --disable-mcp node_repl --disable-mcp animotion --disable-mcp paper --disable-mcp deepgram_docs --disable-mcp deepgram
python scripts/tarikh/finish_continuation.py --workspace $translationWorkspace --job baladhuri-continuation-536-end-codex-v1 --output 'C:/Users/Jonathan/Desktop/tarikh/Translations/Futuh al-Buldan - Complete Codex Draft'
```

Coverage is established by source hashes, exact character spans, ordered unit
IDs, and complete checkpoints. Automated source comparison and heuristics do
not constitute human scholarly review.
