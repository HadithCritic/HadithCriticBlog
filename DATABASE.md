# Data and database architecture

## Public hadith corpus

The public hadith and narrator data is not served from a SQL database. It is a versioned SQLite corpus published as immutable chunks to the Cloudflare R2 bucket `hadithcritic-corpus`. The bucket's custom domain is `data.hadithcriticblog.com`. The browser fetches byte ranges from that host and queries the SQLite file locally.

The deployed version is selected by `src/data/corpus-meta.json`. Publishing a new corpus and deploying the blog are separate operations:

1. Build and verify a version from the master SQLite database with `npm run build:corpus`.
2. Publish that version with `npm run publish:corpus`.
3. Commit the updated corpus metadata when the site should use that release. A push to `main` deploys the site against the committed version.

Published versions are immutable so an existing deployment or reader can continue using its version while a newer one is released. Keep prior R2 versions for rollback.

The master database is deliberately excluded from Git. The build scripts expect it at `dist-db/silsilah.db` unless `CORPUS_MASTER_DB` overrides that path. That file was not present in the current checkout during this cleanup. Locate and back up the canonical master before attempting a corpus rebuild; the R2 releases are published artifacts, not a substitute for the editable source database.

## Other site data

The `hcb` Worker has no database binding. Public subscription signup sends contacts to Resend and uses the Worker rate limiter. The admin-only article-announcement page/API has been removed, so there is no database-backed notification ledger in the current app.

## Historical resources

The corpus previously lived in Cloudflare D1 and then Turso. Those hosted SQL systems are not part of the current public read path. The D1 database and Turso credentials/database may still exist outside this repository; confirm backups and account ownership before deleting them. SQL files under `migrations/` are historical schemas and are not run by builds or deployments.
