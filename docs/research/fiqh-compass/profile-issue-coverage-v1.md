# Profile × issue coverage matrix

Generated from the private Fiqh Compass SQLite store by `scripts/fiqh-compass/export_profile_issue_coverage.py`.

This export contains metadata and counts only; it does not include Arabic passages or translations. It is an inventory of current database links, not a scholarly review, a coverage claim, or authorization to score.

- Profiles: 8
- Issues: 20
- Profile × issue cells: 160
- Position epistemic states as stored: candidate=28
- No cell state in this export grants score eligibility.
- Coverage CSV: `profile-issue-coverage-v1.csv`

## Cell-state counts

| State | Cells | Meaning |
|---|---:|---|
| `profile_position_candidates_unreviewed` | 23 | A profile-position link exists; review status and attribution remain as stored, and no score is implied. |
| `source_linked_passages_only_unreviewed` | 73 | At least one linked source has passage rows for the issue, but no profile-position link exists. Retrieval is not relevance review. |
| `no_source_linked_candidate_in_current_store` | 64 | No current source-linked position or passage candidate was found for that cell; this is not proof of absence. |

## Field interpretation

Position candidate counts, attribution types, domains, evidence links, translation-segment states, source identity/edition/rights states, profile period/tradition, and issue dossier state are exported separately. Source-linked passage counts include only records attached to that profile's currently linked source IDs and issue ID. Counts must not be summed as independent evidence without deduplication.

A cell marked as lacking a current candidate is an acquisition/retrieval prompt. A cell with candidates still requires source and edition identification, complete-context review, attribution analysis, bilingual review, rights determination, and documented specialist evaluation before any historical comparison can be published.
