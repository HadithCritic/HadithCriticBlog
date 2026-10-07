# One-off article codemods

Single-use scripts that were run once against `src/content/articles/` and kept
for provenance. They are **not** part of any build or `npm run validate` chain.

They previously lived inside `src/content/articles/` itself. Astro's content
collection globs only `.md`/`.mdx`, so they never broke a build, but sitting in
the collection, numbered against article filenames, they read as content rather
than tooling. Nothing imports them; moving them here changes no behaviour.

Each targets specific articles by name and assumes the state of the MDX at the
time it was written. Re-running one now is not expected to be meaningful.

## 2026-10-06: articles onto the shared figure vocabulary

Run in this order against the committed articles:

1. `article-figures-to-shared.mjs --write` deletes each article's `<style>`
   block and rewrites its one-off classes onto `.hc-fig` and its parts
   (`src/styles/article.css`, "Figures"). Roles are read from class names,
   from structure where a figure was styled only by descendant selectors, and
   column counts from column heads, cell length and the deleted grid rules.
2. `article-ledgers-to-tables.mjs --write` turns figures that were tables in
   all but name (a head row then equal rows, or column heads then paired
   cells) into `<SourceComparisonTable>`.

One figure was then mapped by hand: the two-lane chain in article 12.
Neither script edits text; the tag-stripped text of every article matched the
previous commit after the run.
