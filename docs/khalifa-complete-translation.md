# Complete Khalīfa translation run

Started 2026-10-15, at the user's explicit request to translate the whole book
through Codex. The user explicitly authorized additional Codex worker sessions.

## Scope and source

- Source: `Desktop/tarikh/Arabic sources/03 - History of Khalifa ibn Khayyat - Khalifa ibn Khayyat.md`.
- Ketab 5305, edition identified in the preserved source header.
- 432 supplied text pages, printed labels 49 through 480.
- The accompanying 628-page PDF is a scan/reference witness. This task translates
  the supplied 432-page text export, not an unverified reconstruction of omitted
  front matter or all scanned image pages.
- Exact source SHA-256:
  `477ac29faf387ec4afef1961bc0c02ab3c93d4f137e4661e8c82c37894951e08`.
- Full job: `translation-workspace-v1/jobs/khalifa-complete-codex-v1/`.
  It contains every full prepared page, independent of the earlier excerpt pilot.

## Method

The installed Codex CLI is authenticated through the existing ChatGPT login.
The user's configured model and reasoning preference are preserved. No API key,
new paid provider, credit purchase or account reset is used.

After a four-page acceptance batch, three workers process batches of up to eight
consecutive pages. Workers receive the source text directly and return structured
JSON; they are instructed to perform no tool calls, file inspection or delegation.
They run with a read-only sandbox. Unrelated configured MCP integrations are
disabled only in each translation invocation, leaving user configuration intact.
This avoids irrelevant startup overhead and tool context.

The source's exact Arabic, page locators, chain links, lists, numbers, divergent
accounts and quotation boundaries must remain represented. Neighboring context
helps interpret page continuations without moving words between pages. Corrupt
or uncertain readings are recorded separately. The frozen glossary/prompt and
request hashes retain the provenance of the run.

Each batch's raw answer, prompt, schema, events, completion code and usage receipt
are saved. The complete list of expected IDs and individual translation fields
are validated before accepting pages. Results are saved atomically per page.
Resume skips completed pages. Unfinished attempts require inspection rather
than silently launching duplicate sessions. Batch-level token usage is counted
once, not copied into every page as though each incurred the whole batch cost.

## Commands

```powershell
$tarikhWorkspace = 'C:/Users/Jonathan/Desktop/tarikh/Translations/translation-workspace-v1'
python scripts/tarikh/codex_runner.py --workspace $tarikhWorkspace --job khalifa-complete-codex-v1 --workers 3 --batch-pages 8 --disable-mcp node_repl --disable-mcp animotion --disable-mcp paper --disable-mcp deepgram_docs --disable-mcp deepgram
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace export --job khalifa-complete-codex-v1
```

Progress is recorded in `progress.json` and the local controller log
`scratch/khalifa-codex-full-run-remaining.log`. The controller holds
`.codex-running` while active. Do not launch a second controller or remove its
lock while the recorded process is alive.

## Deliverables and review boundary

The final `export/` contains aligned `bilingual.json`, a browser review file
`review.html`, sequential `english.md`, and `review-queue.csv`.
The word “complete” describes coverage of the supplied text, not human scholarly
approval. Every translation remains a machine draft. A full coverage audit,
source hashes, output checks, usage summary and sampled quality review must be
recorded before reporting completion. The website is not automatically updated
or published by this translation run.

## Source-comparison pass

During the first pass, a glossary check exposed an omitted Abū Bakr reference,
and a spot check found a greater/older distinction mistranslated. This justified
a fresh Codex comparison pass over every supplied page, beyond the original
plan for samples alone. `codex_review.py` sends Arabic and initial English in
consecutive groups, asks for material errors rather than stylistic rewrites,
and records exact Arabic evidence and unique English edit anchors.

Validated edits are applied only to a separate `machine-reviewed.json` view.
The raw per-page checkpoints remain immutable. Invalid source quotes, ambiguous
anchors, empty replacements and suspiciously large edits are retained as
unresolved proposals, not silently applied. The export verifies each revision's
source and original-English hashes before using it. This is automated review,
not a claim of independent human approval.

```powershell
python scripts/tarikh/codex_review.py --workspace $tarikhWorkspace --job khalifa-complete-codex-v1 --workers 3 --batch-pages 12 --disable-mcp node_repl --disable-mcp animotion --disable-mcp paper --disable-mcp deepgram_docs --disable-mcp deepgram
python scripts/tarikh/audit_translation.py --workspace $tarikhWorkspace --job khalifa-complete-codex-v1 --require-complete
```

## Working checklist

- [x] Preserve and audit all original text.
- [x] Freeze a full job with all 432 complete page units.
- [x] Verify local Codex authentication and structured output on four pages.
- [x] Test worker batching, exact ID validation, receipt accounting and resume.
- [x] Start the remaining full-book translation with three workers.
- [x] Translate all 432 supplied text pages.
- [x] Compare all 432 pages with Arabic in a separate Codex pass.
- [x] Audit coverage, source preservation and machine-review flags.
- [x] Inspect samples across the finished book and generated review files.
- [x] Export the complete English and bilingual editions with draft status.
- [x] Run repository checks and record final evidence.

## Completion evidence

Completed 2026-10-15. Coverage is 432/432, with unique IDs and printed labels
49 through 480. Source bytes still match the SHA-256 above. All 432 final
passages record a Codex source-comparison pass and retain machine-draft status.
The finished book folder is
`C:/Users/Jonathan/Desktop/tarikh/Translations/Khalifa - Complete Codex Draft/`.

The final English view includes 96 accepted corrections. Seven proposals remain
unapplied for manual review, alongside specific source-reading uncertainties.
Some numeric flags merely reflect Arabic number words translated into English
digits; flags are not verified-error counts. No human scholarly review or
accuracy percentage is claimed.

The primary Codex agent inspected proposed edits and source contexts, rejecting
unsupported caliph genealogies, reversed death-list attributions, invented
command over a tribe, unnecessary date labels and stylistic preferences.
It recorded decisions on 41 pages. It also corrected omitted references,
birth statements, ages, military frontier terminology, numbers and the
interpretation of Wartanīs as a person's name. A review's page attribution was
recovered only when verbatim Arabic and a unique English anchor matched exactly
one page. Every proposed/raw response remains available in the workspace.

One translation batch returned its final row twice with identical data. The
controller stopped, the exact duplicate was verified and removed from the
accepted view, and the batch was recovered without another model call.
Conflicting duplicates and missing IDs still fail validation.

Validation:

- 26 Python tests passed, including exact source coverage, repeated page labels,
  translation checkpoint/resume, budget guards, immutable drafts, review evidence,
  primary decisions, cross-page edit recovery and safe bilingual export.
- `npm run check`: 340 files, zero errors/warnings, 13 existing hints.
- `npm run test:design`: passed, 295 files; existing unrelated article warnings.
- `npm run build`: passed, including Pagefind indexing of 2,407 pages.
- Final browser checks: 432 Arabic/English pairs, all RTL attributes and draft
  statuses, exact endpoints, no page errors or overflow at 1440 and 390 pixels,
  without JavaScript. Desktop opening and mobile closing screenshots were viewed.
- Earlier unrelated changes, shared navigation/footer and research edits match
  their preserved baseline. No public page or corpus release was changed.
- Deliverable file checksums are recorded in the finished book folder.

Local evidence: `scratch/khalifa-complete-{check,design,build,coverage,browser}.log`,
`scratch/tarikh-complete-tests.log`, final screenshots, and the job's
`coverage-audit.json`, `machine-reviewed.json` and `primary-review-decisions.json`.

There were 55 translation batch receipts and 36 source-comparison receipts.
Recorded CLI usage was 1,561,981 input / 342,204 output tokens for translation,
and 1,420,937 input / 121,917 output tokens for comparison. Reported output
includes reasoning tokens where the CLI reports them. These counts include
Codex session context, exclude the primary agent's analysis in this chat, and
are not a separately billed API dollar estimate. No API key, new provider,
account reset or credit purchase was used.

The noninteractive structured-output approach was checked against
[official OpenAI documentation](https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex).
