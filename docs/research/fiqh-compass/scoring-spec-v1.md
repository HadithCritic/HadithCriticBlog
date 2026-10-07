# Fiqh Compass scoring specification, draft v1

Status: **deterministic prototype specification; not an evaluated or approved instrument**  
Updated: 4 October 2026  
Implementation: `src/lib/fiqh-compass-scoring.js`  
Synthetic checks: `src/lib/tests/fiqh-compass-scoring.test.mjs`

## Scope

The scorer summarizes only a respondent's answers to the question set supplied
to it. It does not assess whether an answer is correct, identify the respondent's
religion or school, verify any source, or assign an answer to a historical
author. Method summaries, agreement with a particular legal case, and historical
profile comparisons are separate outputs.

The live prototype remains at 24 draft items, two per provisional axis. A
96-item editorial candidate bank is available in
`instrument-candidate-bank-v1.json`; Q25-Q96 are not routed into the quiz and
cannot be scored by the public prototype. None of the historical candidate
positions has passed specialist, translation, edition, or rights review.

## Response handling

For a statement item, the response `r` is one of `-2, -1, 0, 1, 2`, and its
editorial direction `d` is `-1` or `1`. The initial weight `w` is one unless a
later reviewed specification explicitly changes it. `unknown`, `not applicable`,
missing values, malformed values, and unrouted items are omitted from both the
numerator and denominator. An unknown is not a neutral answer.

For axis `a`, over active, applicable, numeric items:

```text
mean[a] = sum(w × d × r) / sum(w)
coordinate[a] = 50 + 25 × mean[a]
```

The resulting coordinate ranges from 0 to 100. It is rounded only for display.
If no numeric answer is available, the axis is unavailable, not 50. A centered
mean with answers pulling toward both endpoints is labeled as a mixed response
pattern; neutral answers alone are not labeled mixed. Results show the number
of items scored and the number eligible on that axis.

An item marked inactive is excluded from the axis's eligible-item count. This is
the routing contract for future conditional questions; the current prototype
has no conditional routes.

### Draft routing implementation

`instrument-routing-proposal-v1.json` proposes two categorical, non-scored
gates: source assumptions for report-specific follow-ups and respondent role for
layperson versus qualified-jurist items. `src/lib/fiqh-compass-routing.js`
resolves item metadata against those gate answers. Items without a route stay
active; an absent, unknown, or non-matching answer leaves a conditional item
inactive, and the scorer excludes inactive items from the eligible denominator.
Malformed routes and unknown gate choices fail closed.

This is an isolated M3 implementation contract, not a deployed quiz route.
Candidate items and category wording still need editorial, specialist, bilingual,
and reader review. The function has no access to stored browser answers or
network services; future UI integration must preserve the existing local-only
answer handling and must not let stored answers to inactive items enter scores.

## Comparisons

### Method similarity

Compare respondent and profile coordinates only on jointly covered axes. For
each shared axis, calculate the absolute difference on the 0–100 scale, then
take the unweighted mean across shared axes. A descriptive similarity may be
shown as `100 − mean absolute difference` only when at least eight jointly
covered axes are available. Otherwise return “insufficient evidence for a
ranked match.” The result is a chosen descriptive index, not a probability of
identity or correctness. Profiles with differing coverage must be compared on
the same common axis set or displayed pairwise with coverage.

This function is implemented for synthetic use but is not connected to public
profile ranking. There are no reviewed profile coordinates, so no historical
match is currently eligible for display.

### Ruling agreement

Case answers are compared only for the same reviewed, comparable case item.
Unknown, inapplicable, and missing answers are omitted. Agreement is the share
of exact matching answer categories among comparable items. If none remain,
the result is unavailable. This is not combined with method similarity. No
historical ruling comparison is currently eligible for display because no
candidate position has passed review.

## Deterministic implementation checks

The automated synthetic suite covers:

- no scored answers and unavailable axes;
- reverse-direction correction;
- opposite answers producing a centered but mixed result;
- neutral-only answers;
- conditional items excluded from the denominator;
- malformed or out-of-range answers;
- fewer than eight shared profile axes returning insufficient evidence;
- similarity calculated on the jointly covered axes;
- case-answer agreement separately from method similarity;
- no comparable cases returning no percentage; and
- invalid axis/direction mappings failing closed.

The tests verify arithmetic and guardrails only. They do not establish that an
axis is coherent, independent, readable, or representative, and they are not
psychometric validation.

## Still required before score freeze

- evidence-backed question mappings and removal/revision of items that do not
  measure their proposed construct;
- conditional routing and categorical authority items;
- worked examples including disputed-profile alternatives and sensitivity;
- a coverage-based rule for short versions and missing-data display;
- specialist and bilingual content review;
- the roadmap's comprehension study and later instrument evaluation; and
- an approved versioned release manifest before any public historical matching.
