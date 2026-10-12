# HadithCritic Studio

Studio is an independent Worker, private D1 editorial store and optional
private R2 media store. It is excluded from the public Astro build. The default
config rejects authentication until the owner supplies Access settings and
**disables all GitHub publication operations**. `drafts` and `draft: true` are
never private storage.

## Deployment state, 2026-10-12

Provisioned at the owner's request:

- D1 `hadithcritic-studio-private`, with both migrations applied remotely.
- R2 `hadithcritic-studio-media`, private: no r2.dev URL and no custom domain.
- Worker `hadithcritic-studio` on the custom domain `studio.hadithcriticblog.com`.
  `workers.dev` and preview URLs are off.
- Cloudflare Access application "HadithCritic Studio" over the whole hostname,
  with one reusable policy allowing the owner email only, a 12-hour session,
  an HTTP-only cookie and a binding cookie.
- Worker secrets `STUDIO_TEAM_DOMAIN`, `STUDIO_AUD` and `STUDIO_OWNER_EMAIL`.
  They are secrets rather than vars so this public file names no account
  identity. `STUDIO_OWNER_SUBJECT` was set from the Access users API after the
  owner's first sign-in; without it every request fails closed. A refused
  request logs its fixed reason (`wrangler tail hadithcritic-studio`), never a
  token or claim value.

Checked from outside with no session: `/`, `/api/articles`, static assets and a
request carrying a forged `cf-access-jwt-assertion` all redirect to the Access
login, and the `workers.dev` address answers 404.

Not done, and why:

- Publication is on. The private GitHub App `hadithcritic-studio` is installed
  on this repository only, with contents write, checks read and metadata read.
  Its id, installation id, repository id and PKCS#8 key are Worker secrets; the
  key's local copy is in the ignored `local-archive/`. Studio commits to
  `drafts` (`STUDIO_PUBLISH_BRANCH`), which refuses force pushes and deletion,
  and the site goes live when `drafts` is merged into `main`. Studio's own
  client minted an installation token and read the `drafts` head before this
  was enabled. Each publication still needs a prepared job, a review and a
  typed confirmation in Studio.
- Two-factor sign-in is on. Google (a dedicated OAuth client, PKCE on) is the
  only login method for Studio, and the owner policy requires it. Access then
  asks for its own second factor (authenticator app, platform biometrics or a
  security key) every 12 hours. Google's two-step setting cannot be checked by
  Access, which is why the second factor is Access's. Independent MFA is
  enabled for the organization but required only by Studio. The App Launcher,
  where authenticators are enrolled, shares the owner policy. To recover from a
  lost authenticator, delete it through the Access users API and enroll again.
- No edge rate-limit rule. The zone is on the Free plan and its one rate-limit
  slot holds the leaked-credential check. Studio's own D1 limit still applies.

Deploy with `npm run studio:deploy`. It builds, runs the tests, uploads a
version and deploys that version. A plain `wrangler deploy` also reconciles
routes, which needs zone route access the account token does not have, so it
reports an error after uploading. The custom domain was attached through the
Workers Domains API and persists across version deploys.

## Implemented locally

- Source/metadata editor, search, autosave, diff, private duplication, versioned
  archive/restore, offline warnings and immutable private revision history.
  Compare-and-swap saves tie revisions/audits to the winning save nonce.
- Saves never wait on GitHub. The public source is read once, when a path is
  first saved privately or when the owner rebases onto a reviewed SHA. Later
  saves and autosaves touch only D1. The article list caches the public tree
  for 60 seconds per Worker instance, and reads it with the GitHub App's
  installation token when publishing is configured. Anonymous reads share
  GitHub's 60-an-hour limit with other Workers on the same address. If the
  read still fails, the Newsletter tab matches articles against the manifest
  built at deploy time.
- Manual saves always record a revision. Autosaves record one only when the
  path has no revision from the last 10 minutes, so history stays readable.
- New documents: vanilla Tiptap with H2–H6, bold/italic, code, links,
  superscript, Arabic RTL, nested quotations/lists, heading outline, block
  insertion/movement/deletion and undo/redo.
- Explicit registry derived from current Astro props: HadithBlock, QuranVerse,
  QuranPassage, BibleVerse, QuoteBlock, Arabic, ClaimBox, VerdictBox, ContextNote,
  Source, Bibliography, SourceComparisonTable, IsnadDiagram, VariantTree,
  YouTubeEmbed. Tables and diagram nodes/edges use editable fields, not raw JSON.
- Custom deterministic MDX serializer and stable footnote atoms/definitions.
  Missing, duplicate, unused, empty and nested definitions block saving.
  Literal punctuation is backslash-escaped, and URL or email runs are written
  as MDX string expressions (`{"www.example.org"}`), because GFM autolinks text
  after parsing and an escape does not stop it. Arabic and transliteration are
  never normalized. The real Astro build returns the exact input text.
- Authenticated registry previews with copied public article CSS/Source Serif
  fonts, width/theme controls, note popovers and repeated-reference backlinks.
  The Worker never executes arbitrary MDX.
- Private PNG/JPEG/WebP uploads, mandatory alt text, signature/size validation,
  centered crop, maximum 1536px output, automatic 720px/160px WebP variants,
  responsive body images, thumbnail selection, audited media archive/restore.
  Referenced images cannot be archived; bytes remain recoverable. Private image
  routes require the same authorization as drafts. R2 has no public URL.
- Disabled-by-default publication prepare/confirm, scoped server-side GitHub
  App tokens, saved immutable snapshots, typed path/head confirmation, 15-minute
  authentication freshness, non-force Git updates, stale draft/head/blob checks,
  private job history and check-run status. Article and referenced media use
  one commit; lost responses reconcile the persisted commit identity.
- Unpublish and rollback from verified public article Git history preserve paths
  and historical commits. Rollback is limited to the last 100 article commits
  on the configured branch. Unpublish does not make old public history private.

**All 90 legacy articles remain source-only.** No conversion or round trip is
performed. Metadata edits replace only the selected YAML field and retain the
article body and original separator bytes. Public sources are read by immutable
Git blob SHA. Structured drafts store both AST and source; the API rejects
mismatches and unauthorized legacy visual conversions.

## Interface

Studio is dark and follows the house style: deep black and warm charcoal
grounds, antique gold hairline frames with an inset second rule and the
footer's gilt corner on each corner, near-square edges, and a lozenge rule
under each heading. Headings are Cormorant Garamond, labels tracked IBM Plex
capitals, and the figures read first sit on a parchment plate using the inks
audited for `.hc-parchment`. Each tab's header carries an engraving from the
public site, masked into the black ground. The corners are data-URI SVGs, which
the CSP's `img-src data:` already allows. The overview shows counts,
drafts to continue, publication setup state and published articles with their
artwork. The block menu uses plain names grouped as Writing, Sources, Figures
and Media; the stored type names are unchanged. A block is inserted after the
block holding the cursor, splitting a text section at the cursor. Each text
toolbar has a Footnote button that assigns the next free `nN` ID and opens an
empty note. Arabic fields are `lang="ar"` and right-to-left. The preview can
switch between the dark and light reader.

`npm run studio:build` copies already-public artwork into ignored output: the
brand mark, five editorial engravings for the tab headers, each article's 160px and 720px thumbnails
(about 10 MB) and the images the article stylesheets reference. No draft or
private image is copied.

The Content Security Policy allows `fonts.googleapis.com` styles and
`fonts.gstatic.com` fonts, the same source the public site uses for IBM Plex
Sans, Source Serif 4, Cormorant Garamond and Noto Naskh Arabic. Those font
requests leave the Access boundary; they carry no draft content. Self-hosting
the families would remove that.

## Tabs

The sidebar holds five tabs, each addressed by the URL hash so a reload keeps
its place: Writing (`#/`), Newsletter, Analytics, Site health and Activity.
Switching tabs hides the writing view without closing the editor, so an open
draft keeps its unsaved state and autosave. The article finder appears only on
Writing. Routes live in `src/dashboard.mjs`; the client views are
`public/dashboard.js` and `public/views/`.

**Newsletter** sends through Resend to the segment in
`STUDIO_RESEND_SEGMENT_ID`, from `HadithCritic <updates@hadithcriticblog.com>`,
in the same layout as the earlier hand-sent announcements. Choose one to five
studies from the public site's `article-catalog.json`. Each one is read from
`main` and its front matter title, description and thumbnail are escaped, never
rewritten; braces are encoded so Resend cannot read article text as template
syntax. The preview is a sandboxed frame of the exact HTML. A send requires:
every study answering 200 on the public site, sign-in within 15 minutes, a
fresh preview of the current inputs, and the typed phrase `SEND TO <n>` naming
the current subscriber count. Sends can be scheduled up to 30 days ahead and
cancelled while scheduled. A test goes only to the owner's Access email. Every
send and cancellation is written to `studio_audit`, which is how the picker
marks studies already announced.

**Analytics** reads Cloudflare's GraphQL API with a separate read-only token
(`STUDIO_CF_ANALYTICS_TOKEN`; Analytics Read on the zone and account) for zone
`STUDIO_CF_ZONE_ID`. One query per view returns daily totals, most-read studies,
top pages, countries, corpus range reads and verified crawlers, cached for five
minutes. On the free plan daily totals reach back a year, while per-path detail
covers at most 30 days (`httpRequestsAdaptiveGroups`), and there is no referrer
data. These are edge counts: they exclude verified crawlers but include
unidentified bots. The site promises no tracking script, so none is added.

**Site health** runs now against production: the home page, the live corpus
version (manifest, then a range read that must answer 206 with a SQLite
header), drafts against main with CI on both, and the Resend sending domain.
The branch check lists what drafts holds that main lacks.

**Activity** lists the audit log, newest first, filterable by kind.

The CSP allows inline style attributes and images from
`hadithcriticblog.com`, because the srcdoc preview frame inherits the page's
policy and email HTML is styled inline. Scripts stay `'self'` only, and the
frame is sandboxed with no permissions.

## Editing

1. Choose New private draft and insert prose/research blocks. Existing articles
   open in source mode. Category edits keep the existing file path fixed.
2. Insert a footnote at a prose cursor with the Footnote button, or type a
   custom ID under the notes to reuse one. Reusing an ID adds a reference to its
   existing definition. Then enter the exact citation.
3. Use Image library to upload/crop, insert an image or choose a thumbnail.
   Private images/variants are copied into public Git only upon publication.
4. Save waits for server confirmation. A conflict retains the losing editor
   text. Compare current/private/public sources in the conflict dialog, merge
   deliberately, and explicitly choose a reviewed version/SHA as the base.
5. History loads a snapshot; saving makes a new revision. Private archive/restore
   never changes the public article. Duplicate creates a private independent copy.
6. Once publication is configured, prepare a saved version, review every byte,
   type the exact path and confirm. Reuse the same job after an uncertain response.
   Cancel an unused prepared job before preparing another. A commit is not a
   verified live deployment.

## Before deployment

1. Create a **separate private D1 database** for editorial drafts and apply
   both migrations in `migrations/`.
2. Replace `database_id` in `wrangler.toml` with that database's ID. Do not use
   a corpus database or a public corpus bucket for editorial data.
3. Create a Cloudflare Access self-hosted application for the entire
   `studio.hadithcriticblog.com` hostname. Use a deny-by-default policy with
   one exact owner identity, and require the identity provider's MFA. Disable
   every alternate Worker, preview, and `workers.dev` route.
4. Set these Worker variables to values from that Access application:
   - `STUDIO_TEAM_DOMAIN`: the team slug before `.cloudflareaccess.com`.
   - `STUDIO_AUD`: the application's exact audience tag.
   - `STUDIO_OWNER_EMAIL`: the one allowed email, matching Access exactly.
   - `STUDIO_OWNER_SUBJECT`: the stable `sub` claim from a verified Access JWT.
5. Check that the Studio hostname's DNS and route point to this Worker. Confirm
   the Access application covers the hostname and every asset/API URL before
   enabling the route. The application itself rejects any other Host header,
   verifies the Access JWT signature/issuer/audience/expiry/email/subject on
   every request, and checks same-origin headers for mutations.
   Add an edge rate-limit rule for `/api/*` as a defense against request floods.
6. Choose `STUDIO_SOURCE_REF` deliberately. The committed default is `drafts`,
   which is a **public Git branch** and is only a read-only source for the
   editor. It is not private storage or the confirmed production branch.
7. Run `npm run studio:inventory` and review
   `docs/studio/article-inventory.md`, then deploy with the Cloudflare CLI from
   this directory using the configured account. Never deploy from an untrusted
   pull request. `workers_dev` and preview URLs are disabled in the config.
8. Add a separate private R2 binding named `STUDIO_MEDIA`. Do not enable
   `r2.dev` or a public domain. Example, after creating the private bucket:

   ```toml
   [[r2_buckets]]
   binding = "STUDIO_MEDIA"
   bucket_name = "OWNER_CREATED_PRIVATE_STUDIO_BUCKET"
   ```

9. Verify the actual production branch/service/hostname. Install a GitHub App
   only on this repository with Contents write and Checks read. Set server-only
   `STUDIO_GITHUB_APP_ID`, `STUDIO_GITHUB_INSTALLATION_ID`,
   `STUDIO_GITHUB_REPOSITORY_ID`, and secret `STUDIO_GITHUB_PRIVATE_KEY` (PKCS#8
   PEM). Never place these in client code, command arguments or untrusted CI.
10. Choose `STUDIO_PUBLISH_BRANCH` explicitly; prefer an owner-controlled
    publication branch, required CI and separately protected production promotion.
    Verify branch rules, narrowly restrict App bypass, deny force updates and
    isolate fork CI from credentials. Only then set
    `STUDIO_BRANCH_PROTECTION_VERIFIED = "true"` and
    `STUDIO_PUBLISH_ENABLED = "true"`. Flags do not substitute for real rules.

All mutations additionally have a private D1-backed limit of 50 per minute for
the owner. Autosave paces itself well under that and, if refused, retries after
20 seconds rather than stopping.
Public-write requests require an Access token issued within 15 minutes. Live
Access/MFA, alternative-origin and recovery-policy checks remain owner tasks.

The Access issuer and audience values are mandatory. With either unset, an
Access token cannot be verified and all requests fail closed. The deploy
configuration also intentionally contains a placeholder D1 ID until the owner
creates the private store.

## Local checks

```sh
npm ci --prefix studio
npm run studio:build
npm run studio:test
npm run studio:test:render
npm run studio:test:browser
npm run studio:validate
npm run check
npm run test:design
npm run lint:footnotes
npm run build
npm run studio:test:preservation
```

Studio dependencies/lockfile are isolated from the public app. Generated
browser JS/CSS/fonts are ignored by Git and built before local validation.
The build enumerates public styles/fonts and bundles only editor code; it never
copies environment files or server modules. Root type checking excludes these
generated assets and Studio node_modules.

`studio:validate` includes Wrangler **dry-run**, not deployment.
`studio:test:render` builds synthetic MDX in `scratch/studio-render` against the
actual Astro components and checks named slots, Unicode, tables and footnotes.
`studio:test:browser` uses a loopback-only test proxy, generated RSA key, synthetic
documents, in-memory SQLite/R2 and mocked GitHub. It exercises the real JWT
verifier, new authoring/reopen, notes, cropped media/variants and legacy CRLF
preservation. It is never deployed. Screenshot: `output/studio/visual-editor.png`.

Validate migrations in a fresh local directory without touching an existing
editorial store:

```sh
node node_modules/wrangler/bin/wrangler.js d1 migrations apply hadithcritic-studio-private --local --config studio/wrangler.toml --persist-to scratch/studio-validation
```

Do not refresh checksum/render baselines just to make preservation tests pass.

## Remaining implementation and verification

- Protected full Astro preview service: registry previews are approximate.
  QuranVerse shows a reference, rather than inventing corpus wording; diagrams
  preview as structured text. The synthetic Astro test validates serialization
  but is not a deployed private render endpoint. Legacy source **publication**
  remains blocked until isolated source validation/review exists; source editing
  and private revision restore already work. No legacy migration adapter exists.
- Production promotion/live verification: Git commits and CI status are supported;
  automated required-check acceptance, merge/promotion, Cloudflare deployment,
  live URL verification and deployment rollback need a verified integration.
- Advanced editing: pointer dragging, richer component nesting, graphical diagram
  layout/import/export, SEO/OG preview, editable slug/redirect workflows and
  scheduling remain work. Fixed paths prevent silent URL changes.
- The public site runs smartypants: straight quotes become curly and `--`
  becomes a dash in every article. The Studio preview does not imitate this,
  and the serializer does not change it.
- Media: crop is centered; no focal-point picker. Variant batches use separate
  private uploads, so interrupted batches may retain unused assets safely.
  Durable batch/orphan reconciliation and large-library pagination remain work.
  Thumbnail uses existing public schema/fallbacks; cross-surface responsive artwork
  centralization is not yet implemented. Physical purge is intentionally absent.
- D1/R2 IDs, owner Access application/MFA, live negative security tests, GitHub App,
  branch protections, publication branch and deployed hostname are **unconfigured
  and unverified**. End-to-end production acceptance gates remain open.

See `../docs/studio/implementation-status.md` for validation results. The public
corpus query path and its browser-side SQLite architecture are untouched.
