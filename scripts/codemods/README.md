# One-off article codemods

Single-use scripts that were run once against `src/content/articles/` and kept
for provenance. They are **not** part of any build or `npm run validate` chain.

They previously lived inside `src/content/articles/` itself. Astro's content
collection globs only `.md`/`.mdx`, so they never broke a build, but sitting in
the collection, numbered against article filenames, they read as content rather
than tooling. Nothing imports them; moving them here changes no behaviour.

Each targets specific articles by name and assumes the state of the MDX at the
time it was written. Re-running one now is not expected to be meaningful.
