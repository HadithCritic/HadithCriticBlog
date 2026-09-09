# Agent notes

Before changing UI, read [DESIGN.md](DESIGN.md). Preserve research content exactly. Run `npm run check`, `npm run test:design`, and `npm run build` before finishing.

`@emnapi/core` and `@emnapi/runtime` are in `dependencies` but nothing imports them. They are there so the lockfile keeps them: `@img/sharp-wasm32` needs them, and `npm install` on Windows prunes them from `package-lock.json`, after which `npm ci` on Linux CI fails with "can only install packages when your package.json and package-lock.json are in sync". Declaring them directly is what stops that recurring. Do not remove them without checking CI on Linux.

Before touching a query, read [DATABASE.md](DATABASE.md). The corpus is on Turso and reads are metered per row, so a `COUNT(*)` over `hadith` costs 276,347 of them; totals that are already stored must not be recounted. Reach the database through `src/lib/db.ts`, never a client directly.
