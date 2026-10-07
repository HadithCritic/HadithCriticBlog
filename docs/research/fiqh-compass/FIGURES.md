# Historical figures in the quiz

The quiz compares a reader's axis coordinates with historical figures, in the
manner of the Mizan model (https://mizan-12-axes.netlify.app/): a figure is
placed on a dimension only where a source records a view, and every placement
names its source.

## Files

| Path | What |
|---|---|
| `scripts/fiqh-compass/run-placement-queries.py` | Searches the Shamela corpus for each figure and axis (`placement-queries*.json`), writing hits with excerpts to `scratch/fiqh-compass/placement-hits*.json` (local, ignored). |
| `data/fiqh-compass/figure-placements.json` | The authored placements: figure, axis, position (-1 to 1), kind, book, serial, volume, page, an English statement and the Arabic quote. |
| `scripts/fiqh-compass/build-figures.py` | Checks every quote against the saved excerpt for its serial and writes `src/data/fiqh-compass-figures.json`. A quote not found stops the build. |
| `src/lib/fiqh-compass-figures.js` | The comparison. Similarity is `compareMethodProfile`'s index (100 minus the mean distance on the 0 to 100 scale), on the dimensions both sides share. |
| `src/lib/fiqh-compass-figures-view.js` | The results section and the per-dimension "Where figures stand" lists. |

## Rules for a placement

- The passage states the view. A search hit that only names the figure, or an
  editor's summary of a chapter that does not give the view, is not used.
- `kind` says whose words they are: `own` (the figure's work), `report`
  (another author reports it; `by` names that author), or `editor` (a modern
  editor's introduction quotes it).
- `quote_ar` is the source's own characters. Shamela often stores shadda before
  the vowel it carries; the build matches canonically equivalent text and
  writes back the source's order, so the quote stays verbatim.
- `statement_en` is HadithCritic's one-line description of what the passage
  shows, not a translation.

## Ranking

Figures need at least two dimensions in common with the reader to be compared.
The rank pulls a figure compared on few dimensions toward the middle
(`50 + (similarity - 50) * n / (n + 2)`), so two shared dimensions cannot
outrank nine. The displayed number is the unadjusted similarity. Stability is a
leave-one-out check: how many times the closest figure stays closest when one
shared dimension is dropped.

## Status

57 placements for 20 figures, from 18 works. The readings were made with
machine assistance and have not been reviewed by a specialist, which the quiz
and profiles page say. The gated evidence layer
(`src/data/fiqh-compass-evidence.ts`, `evidence-publication-contract-v1.md`)
is separate and still empty.

## Rebuild

```bash
python scripts/fiqh-compass/build-figures.py
npm run test:fiqh-figures
```
