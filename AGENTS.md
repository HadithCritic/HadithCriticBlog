# Agent notes

Before changing UI, read [DESIGN.md](DESIGN.md). Preserve research content exactly. Run `npm run check`, `npm run test:design`, and `npm run build` before finishing.

Before touching a query, read [DATABASE.md](DATABASE.md). The corpus is on Turso and reads are metered per row, so a `COUNT(*)` over `hadith` costs 276,347 of them; totals that are already stored must not be recounted. Reach the database through `src/lib/db.ts`, never a client directly.
