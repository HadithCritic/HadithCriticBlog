# Studio local implementation status — 2026-10-12

This continues the existing `drafts` foundation. No deployment, public repository
write, production setting change or legacy migration was performed. All 90
article SHA-256 values match the original inventory. The public corpus path and
`@emnapi/core` / `@emnapi/runtime` are unchanged.

## Reviewable stages

| Stage | Locally implemented | Acceptance still open |
| --- | --- | --- |
| Preservation/security | Immutable public blob reads; YAML field-range edits and exact body/separator retention; JWT/host/Origin checks; bounded inputs/rate limit; atomic nonce-bound revisions/audits | Live Access/MFA/alternative-origin and recovery verification |
| New visual authoring | Separate vanilla Tiptap package; explicit registry; prose/research forms; tables/node/edge fields; deterministic MDX; stable footnotes; undo, outline, block movement; private AST/source revisions | Advanced dragging/nesting/graphical controls and legacy adapters |
| Private preview | Protected safe registry render, public article CSS, width/theme controls and footnote popovers; actual Astro synthetic fixture | Isolated full Astro rendering endpoint; full diagram/corpus presentation fidelity |
| Media | Private R2 API/library; signature/size/alt checks; crop; WebP variants; responsive body images; thumbnail selection; reference guards and archive/restore | Durable batch/orphan reconciliation, focal-point UI, pagination, cross-surface responsive artwork resolution |
| Publication/revisions | Disabled server App adapter; immutable prepare/confirm; recent auth; SHA/version checks; atomic article/media Git commit; non-force update; retry reconciliation; cancel/history/CI status; unpublish/rollback | Verified App/branch rules; required CI/promotion/deployment integration and live verification; isolated validation for legacy publication |

The local visual proof of concept creates a new article entirely through UI:
heading/prose, exact Arabic HadithBlock, editable comparison table, stable
footnote/citation and private thumbnail. It saves and reopens structured drafts.
The separate synthetic Astro fixture verifies component rendering and named
slots. These local results do not establish production Access/deployment safety.

## Validation

- `npm run check`: pass, 0 errors / 0 warnings, 11 existing informational hints.
  The first default-heap attempt exhausted memory. The successful run used
  `NODE_OPTIONS=--max-old-space-size=8192`; generated Studio assets and its separate
  node_modules are excluded from root type checking.
- `npm run test:design`: pass, with existing warnings left intact.
- `npm run lint:footnotes`: pass.
- `npm run build`: pass, including 11,799 manifest-declared Quran hardlinks and
  Pagefind indexing 2,410 pages. An initial Windows hardlink `EPERM` was transient;
  direct retry and the subsequent full build succeeded. No corpus/build workaround
  or research edit was needed.
- `npm run studio:test`: **36 passing tests** covering JWT/endpoint denial,
  Origin/host mismatch, payload limits, AST/source agreement, forbidden legacy
  conversion, SQLite create/update races, archive history, footnotes, Unicode/
  formatting, media guards, stale publication rejection, unpublish/rollback and
  lost-request/response reconciliation. Browser assets contain no server secret
  identifiers, App token endpoint, private-key marker or server-module imports.
- `npm run studio:test:render`: pass against current Astro components, named
  table/QuranPassage slots, Arabic, diagrams and GFM footnote backlinks.
- `npm run studio:test:browser`: pass with synthetic data and no live writes.
  Visual reopen, note popover, private cropped media/variant/thumbnail, reviewed
  save-conflict resolution, CRLF legacy preservation and rich new authoring.
- `npm run studio:test:preservation`: pass. Articles 82/86/89 keep source hashes,
  heading IDs, link counts, footnotes and diagrams. Studio assets/synthetic drafts
  are absent from checked public output. Full rendered hashes remain untouched
  in the original fixture file; structural checks avoid volatile asset hashes.
- `npm run studio:validate`: browser build, tests and Wrangler **dry-run** pass;
  publication disabled and placeholder D1 ID retained.
- Both migrations applied through Wrangler **locally** to a fresh
  `scratch/studio-validation-final` store. No remote migration was run.

## Review pass, 2026-10-12

A second review of the existing work, judged against use rather than against
the earlier checklist. What was measured, what changed and why:

| Finding | Evidence | Change |
| --- | --- | --- |
| Every save read GitHub twice (tree and blob) before writing to D1. The unauthenticated API allows 60 requests an hour per IP, and Workers share egress addresses, so autosave could start failing on someone else's traffic. | Harness counter: 6 GitHub calls across 3 autosaves. | The public source is read on a path's first private save and on an explicit rebase only. Measured after: 0 calls across 3 autosaves. A first save still fails closed (502) when GitHub is unavailable. The list tree is cached 60 s. |
| Each autosave wrote an immutable revision, so history filled with near-identical entries. | 4 history rows for one short session. | Manual saves always checkpoint; autosaves checkpoint at most once per 10 minutes per path. Measured after: 1 row. Audits still record every save. |
| The serializer wrote punctuation as numeric entities (`&#42;`), which made the source hard to read and review. Escaping alone would not have been safe: GFM autolinks `www.` and email text after parsing, regardless of escapes. | The Astro render turned an escaped `www.example.org` into a link. | Backslash escapes for punctuation, MDX string expressions for URL and email runs, and escaped line-start list and setext markers. `test-render.mjs` asserts the rendered paragraph equals the input string exactly. |
| The block menu showed component names, inserted only at the end of the document, and footnotes needed a typed ID. | Manual use in the harness. | Grouped plain names; insertion after the focused block, splitting prose at the cursor; a Footnote button with automatic `nN` IDs. Custom IDs remain for reuse. |
| The light reader preview was unreadable and the interface did not resemble the site. | Screenshots. | Dark redesign using public artwork; light preview tokens; Arabic fields right-to-left in Noto Naskh Arabic; required fields marked for assistive technology. |
| A `.field:last-of-type` rule dropped the margin from the last label in every wrapper, misaligning the date pair by 7 px. | Computed styles. | Rule removed. |

Not changed, and recorded instead:
- The public site's smartypants curls straight quotes and turns `--` into a dash
  in every article. That is a site-wide choice outside Studio's scope.
- Studio now loads IBM Plex Sans and Noto Naskh Arabic from Google Fonts, as the
  public site does, and the CSP allows those two origins. No font files for
  these families exist in the repository to self-host.
- `npm run studio:dev` cannot authenticate locally without real Access values;
  the browser test's loopback proxy remains the way to exercise the UI.

Validation after this pass: `studio:build`, `studio:test` (36), `studio:test:render`,
`studio:test:browser` (no console errors), `studio:test:preservation` and
`studio:validate` (dry run) pass; root `check` 0 errors, `test:design`,
`lint:footnotes` and `build` pass.

## Review and operation

- `studio/src/model.mjs`, `registry.mjs`, `editor.mjs`: validated document model,
  deterministic serializer, safe presentation render and visual controls.
- `studio/src/store.mjs`, `worker.mjs`, `auth.mjs`: private persistence and
  authorization, protected resources, payload/Origin/host controls.
- `studio/src/media.mjs`, `publication.mjs`: private assets, server-only Git
  boundary, immutable jobs and recovery states.
- `studio/migrations/0002_authoring_media_publications.sql`: additive private
  editorial schema; unrelated to the public corpus database.
- `studio/tests/` and `studio/scripts/`: security/API/serialization/concurrency
  suite, synthetic browser proxy, Astro fixture, preservation and asset build.
- `studio/README.md`: owner editing instructions, setup and limitations.

Run `npm ci --prefix studio` and `npm run studio:build` to generate ignored
browser JS/CSS/fonts. The build does not copy environment files or server
modules. Screenshot: `output/studio/visual-editor.png`, containing only synthetic
test data. Root package scripts expose the checks; tsconfig excludes generated
Studio assets/dependencies. Unrelated blog-page/style/design changes present
during this work were left intact.

## Configuration blockers versus remaining code

**Owner configuration:** private D1/R2, Access issuer/audience/stable owner/MFA,
verified hostname, narrowly scoped GitHub App and secret, actual production/
publication branch discovery and required protections. Publication must remain
disabled until these are configured and tested. A public `drafts` branch or MDX
draft flag cannot replace private storage.

**Remaining code:** isolated full Astro preview and legacy source-validation
service; production promotion/deployment/live-verification integration; advanced
authoring controls; durable media orphan reconciliation and public responsive
artwork centralization. The whole product is not presented as complete merely
because local tests pass. Legacy source editing never requires conversion.

## Newsletter, analytics, health and activity (2026-10-12)

Deployed as version d996a313. Server modules `newsletter.mjs`, `analytics.mjs`,
`health.mjs` and `dashboard.mjs`, with unit and route tests in
`tests/dashboard.test.mjs`, and the browser flow extended to send a synthetic
newsletter, check the preview keeps its inline styles under the CSP, and check
every tab at 390px for horizontal overflow. Live checks on 2026-10-12: analytics
answered in 1.2 s (7 days) and 1.6 s (365 days); health found the site, corpus
and sending domain healthy, and CI failing on both main and drafts
(`tests/corpus.spec.ts` collection pager), which is outside Studio.

