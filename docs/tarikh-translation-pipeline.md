# Tārīkh translation pipeline

Implemented 2026-10-15. The source texts and generated translations remain local;
this pipeline does not change the public reader, corpus, or project availability.

The complete 432-page Khalīfa export has subsequently been translated and
source-compared through Codex. See `docs/khalifa-complete-translation.md` for
the completed run, primary review decisions, deliverables and limitations.

## First pilot

The persistent workspace is
`C:/Users/Jonathan/Desktop/tarikh/Translations/translation-workspace-v1/`.
It contains exact copies and checksums of the three original Markdown files,
page records, passage records, frozen jobs, results, and bilingual review exports.
The user's original Markdown and PDF files are untouched.

| Source | Page blocks | Prepared units | Arabic text tokens, o200k_base |
| --- | ---: | ---: | ---: |
| al-Ṭabarī | 3,305 | 3,305 | 2,539,277 |
| al-Balādhurī | 609 | 609 | 245,776 |
| Khalīfa ibn Khayyāṭ | 432 | 432 | 333,779 |

These are exact counts for the named encoding and extracted text, not a claim
about another model's tokenizer or billed input. Full-book requests add prompt,
glossary, ID and adjacent-context tokens. Diacritics are preserved, not removed
for savings. Source matching ignores diacritics without altering the source.

The initial pilot has 25 translated passages across Khalīfa, including the
first and last pages, plus a separate verse passage. They were translated in
the current Codex session and imported with that provenance, not sent through
an unidentified external API. Exact API model identity, billed tokens and
per-model price are unavailable for these session-produced drafts. All 26 are
**unreviewed machine drafts**, with specific uncertainties retained.

Local review files:

- `jobs/khalifa-codex-pilot-v2/export/review.html` and `bilingual.json`.
- `jobs/khalifa-poetry-pilot-v1/export/review.html` and `bilingual.json`.

`complete: true` in an export means all requested passages in that job are
present. It never means the book is fully translated or academically reviewed.
The pilot's `kind: pilot` remains explicit in the export.

The pilot exposed malformed genealogies, uncertain chain wording, irregular
names, dates, and page-spanning reports. These are flagged for scan comparison,
not silently corrected. Candidate detection is heuristic: an initial poetry
rule incorrectly matched al-Ashʿarī and adjurations. It was corrected and tested;
the original frozen pilot is preserved, and a real verse passage was added in
a separate job. Candidate labels do not establish literary genre.

## Design

This is a small original Python implementation, with no copied third-party code
and no additions to site dependencies. `tiktoken` is the counting dependency.
The existing book-translation projects informed the choice of resumable jobs
and filtered glossaries; a generic book UI was not needed for a static archive.

- Original bytes, edition metadata and printed page labels are retained.
  IDs use book plus page sequence; repeated printed labels cannot overwrite
  one another. No volume boundaries are invented from numbering resets.
- Exact Unicode offsets and SHA-256 checksums link each passage to its source.
  The audit re-parses every original and verifies complete non-whitespace
  coverage, stored offsets, unique IDs and token limits.
- Neighboring paragraphs on a page are bundled up to 1,400 source tokens.
  Longer paragraphs split at word boundaries and are marked partial.
  Page boundaries can themselves interrupt reports; this is not a scholarly
  reconstruction of report boundaries. Context supplies up to 100 tokens on
  either side. Pilot excerpts prefer complete paragraphs up to 500 tokens.
- Only matching glossary entries enter a request. A short fixed prompt
  preserves chains, competing accounts, numbers, quotations and uncertainty.
  The seed glossary is provisional and needs expansion and expert review.
- Each job freezes prompt, glossary, source hash, exact requests and encoding.
  Create separate jobs for model comparisons and revisions. Preparation refuses
  to overwrite a changed source/configuration in an existing workspace.
- Results are saved after each completed request. Existing results are immutable.
  The runner uses a lock and does not retry network or malformed-output failures
  automatically. Raw successful HTTP responses are saved before validation.
- JSON is validated for exact IDs, English text and uncertainty arrays.
  Numeric-token differences and unusual length ratios are review flags, not
  automatic corrections or proof of accuracy. Number words and name identity
  still require review. No LLM self-rating or automatic approval is claimed.
- Local HTML and static JSON exports align the Arabic and English and retain
  source references, provenance, uncertainty and draft status. No deployment,
  server database, browser API key, or published availability change occurs.

## Commands

Run from the repository root in PowerShell. Python 3.10+ is required.

```powershell
python -m pip install -r scripts/tarikh/requirements.txt
$tarikhWorkspace = 'C:/Users/Jonathan/Desktop/tarikh/Translations/translation-workspace-v1'
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace prepare --source-dir 'C:/Users/Jonathan/Desktop/tarikh/Arabic sources'
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace audit
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace pilot --book khalifa-ibn-khayyat --job benchmark-model-a --count 25
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace run --job benchmark-model-a --dry-run
```

The default pilot samples across the book and attempts to include difficult
text types. Use repeated `--unit-id` arguments to select known passages for a
controlled test. Use `full` instead of `pilot` to prepare every unit for a book;
this does not execute any translation.

To compare an API model against the completed Codex pilot with exactly the
same frozen requests, including its original context and glossary, fork it:

```powershell
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace fork --from-job khalifa-codex-pilot-v2 --job api-candidate-a
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace run --job api-candidate-a --dry-run
```

The fork copies only inputs, leaving results empty. Sampling improvements made
after the original pilot therefore cannot accidentally change the comparison.

The runner accepts an explicitly chosen Chat Completions-compatible provider
supporting `response_format: json_object` and `max_tokens`. Compatibility is
model-specific; test one request before a larger run. It does not choose a
provider, model or paid account automatically.

```powershell
# Set TARIKH_API_KEY securely in the shell environment, never in chat or Git.
# Replace both placeholders with the configured provider and model.
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace run --job benchmark-model-a --base-url 'https://YOUR-PROVIDER/v1' --model 'YOUR-MODEL' --limit 1 --max-input-tokens 5000
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace export --job benchmark-model-a
```

Loopback HTTP is allowed for an explicitly chosen local model server. Remote
endpoints require HTTPS and an environment key. `--key-env` chooses an existing
environment variable without printing its value. Nothing scans other accounts
or credential stores. No cloud translation key was available at setup time.

`--input-rate` and `--output-rate` accept operator-verified USD per million token
rates. `--max-cost` refuses a run whose estimated maximum output plus input and
10% framing reserve exceeds the chosen planning budget. This is an estimate
guard, **not a provider-enforced dollar cap**: tokenizer differences, provider
framing, reasoning tokens and pricing rules may differ. Start with one request,
inspect recorded `usage` and the provider's billing, then establish the book
budget. The default output ceiling is 3,500 tokens per request. Truncated output
is saved as an attempt and is not accepted as a finished translation.

An existing unsaved attempt blocks automatic re-execution to avoid duplicate
charges. Inspect its `attempts/*.json` file and recover valid text through
`import`. If no valid text is recoverable, prepare a new, explicitly named job
for the retry and reconcile provider usage first. A network failure may have
incurred a charge even if no response arrived. An abandoned `.running` lock must
only be removed after verifying its recorded process has stopped.

External/Codex translations can be imported without any network access:

```json
[
  {
    "request_id": "the request's exact id",
    "response": {
      "translations": [
        {"id": "the same exact id", "english": "Translation", "uncertainties": []}
      ]
    }
  }
]
```

```powershell
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace import --job benchmark-model-a --file 'PATH-TO-IMPORT.json' --provider 'Actual provider' --model 'Actual model or explicit unknown'
python scripts/tarikh/pipeline.py --workspace $tarikhWorkspace export --job benchmark-model-a
python -m unittest discover -s scripts/tarikh -p 'test_*.py' -v
```

## Accuracy gate before scaling

An Arabic-competent reviewer should correct the shared pilot and record errors
by category: omission/addition, attribution/chain, names, chronology, terminology,
verse and corrupted source. Save the corrected text separately as the reference;
do not silently replace immutable drafts. Run candidate API models against the
same frozen source passages and glossary, compare correction effort and actual
billed usage, and select the cheapest acceptable candidate. A second model's
agreement alone is not a scholarly review.

Only after that benchmark should whole books run. Review riskier passages and
sample the remainder. Hosting should retain source locators and explicit draft
status, with review status promoted only through a real editorial process.
No cheapest model, accuracy percentage, or final book price has been established
by this first implementation.

## Verification

- 13 Python tests passed, including page-number resets, exact Arabic spans,
  oversized paragraphs, deterministic sampling, strict output IDs, numeric
  review flags, HTTP checkpoint/resume, budget refusal, immutable results,
  input-only benchmark forks and unsaved-attempt retry prevention.
- All three original files match their prepared copies byte for byte. Full
  source audits passed for offsets, hashes, coverage, IDs and token budgets.
- The 26 draft passages were rendered at 1440 and 390 pixels without JavaScript.
  Arabic RTL, English alignment, verse display and overflow checks passed; the
  mobile review screenshot was visually inspected.
- `npm run check`: 340 files, zero errors/warnings, 13 existing hints.
- `npm run test:design`: passed, 295 files; existing unrelated article warnings.
- `npm run build`: passed, including Pagefind (2,407 pages indexed).
- Logs and screenshots are local under `scratch/tarikh-*`. Public site code,
  corpus releases, article content and existing unrelated changes were untouched.

The setup left three superseded generated directories/jobs in place because
automatic approval review rejected recursive cleanup under policy. The local
`TRANSLATION-START-HERE.md` points to the completed pilot, and `api-candidate-a`
is the input-only comparison fork awaiting a configured provider. Superseded
jobs do not contribute translations to those exports.

Repository references examined:
[TranslateBooksWithLLMs](https://github.com/hydropix/TranslateBooksWithLLMs), its
[filtered glossary documentation](https://github.com/hydropix/TranslateBooksWithLLMs/blob/main/docs/GLOSSARY.md),
and [BabelDOC](https://github.com/funstory-ai/BabelDOC).
