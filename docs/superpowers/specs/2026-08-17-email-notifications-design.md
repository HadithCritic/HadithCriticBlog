# Email Notifications via Resend Audiences + Broadcasts

## Summary

Readers can subscribe to be emailed whenever a new article is published. Subscriber
storage and sending both live in Resend (Audiences + Broadcasts); this codebase only
adds the subscribe form, an admin page to trigger a send, and a small D1 table to
track which articles have already been notified about.

## Context

Articles are MDX files in the `articles` content collection, published by committing
them and letting the Cloudflare build pipeline deploy the static site. There is no
server-side "publish" event to hook a notification into — publishing is a git
action, not a database write. The site already has one D1 database (`silsilah`,
binding `DB`) used by other on-demand routes, and the Astro Cloudflare adapter
already supports per-route `prerender = false` for those routes.

Cloudflare's own Email Service is explicitly scoped to transactional mail, not
bulk/newsletter sending, so it is not used here. Resend Audiences + Broadcasts
covers both subscriber list management and campaign sending in one API.

## Decisions

- **Trigger:** Manual. After deploying new article(s), the site owner visits an
  admin page and sends the broadcast themselves. No automatic diffing of deploys,
  no scheduled digest.
- **Opt-in:** Single opt-in. A submitted email is added to the Resend audience
  immediately; no confirmation email step.
- **Placement:** The subscribe form appears at the end of every article and in the
  site-wide footer.
- **Broadcast scope:** One broadcast per article, always — even when several
  articles are published in the same batch, each gets its own email.
- **Trigger UX:** A protected admin route (`/admin/notify`), not a local CLI
  script — usable from any device.
- **Admin auth:** Cloudflare Access, configured at the edge (Zero Trust dashboard)
  against the `/admin/*` path. The application code does not implement login;
  it only assumes Access has already gated the request in production, and skips
  that assumption in local dev so the page remains clickable during development.
- **Duplicate-send protection:** A D1 table records which articles have already
  been notified about. The admin page disables sending for articles already
  marked sent. There is no resend override in this first version.

## Architecture & Data Flow

**Subscribe flow**

```
SubscribeForm (article footer / site footer)
  -> POST /api/subscribe
  -> validate email (Zod)
  -> Resend: add contact to RESEND_AUDIENCE_ID
  -> success/duplicate both render as "subscribed"
```

Resend owns the subscriber list. This app never stores subscriber emails itself.

**Notify flow**

```
/admin/notify (behind Cloudflare Access)
  -> getCollection('articles') left-joined against D1 article_notifications
  -> render list with sent/not-sent state
  -> operator picks one unsent article, clicks Send, confirms
  -> POST /api/admin/notify { slug }
  -> build { subject, html, text } from that article's frontmatter
  -> Resend: create + send broadcast to RESEND_AUDIENCE_ID
  -> on success: INSERT INTO article_notifications (slug, sent_at, recipient_count)
  -> on send failure: nothing written, safe to retry
  -> on D1 write failure after a successful send: response says so explicitly,
     since a blind retry at that point risks a duplicate send
```

## Components & Files

**Subscriber-facing**

- `src/components/SubscribeForm.astro` — one component, `variant: "article" | "footer"`
  prop for styling only. Client-side `fetch` to `/api/subscribe`, inline
  success/error state, no page reload.
- `src/pages/api/subscribe.ts` — `export const prerender = false`. Validates the
  email with Zod, calls `addContact()`. Treats an "already subscribed" response
  from Resend as success.
- Edits: [src/pages/blogs/[...id].astro](../../../src/pages/blogs/%5B...id%5D.astro)
  gets `<SubscribeForm variant="article" />` after the `article-footer` block.
  [src/components/SiteFooter.astro](../../../src/components/SiteFooter.astro) gets
  `<SubscribeForm variant="footer" />` inside `hcFooter__panel`.

**Admin-facing**

- `src/pages/admin/notify.astro` — `prerender = false`. Lists every article from
  `getCollection('articles')` alongside its D1 sent state. Send button per
  unsent article, with a confirmation step before the request fires.
- `src/pages/api/admin/notify.ts` — `prerender = false`. Takes `{ slug }`, loads
  that article's frontmatter, builds the email via the template function, calls
  `sendBroadcast()`, then records the `article_notifications` row.

**Shared**

- `src/lib/resend.ts` — `addContact(email: string)`, `sendBroadcast(payload)`.
  Keeps all Resend HTTP calls in one place.
- `src/lib/email-templates/new-article.ts` — pure function: article frontmatter
  in, `{ subject, html, text }` out. Plain inline-styled HTML, no React Email
  dependency (the site's React usage is confined to the separate blog-maker
  tool, not the Astro SSR side). Resend appends the unsubscribe footer
  automatically for audience broadcasts.
- `migrations/00xx_article_notifications.sql` — new D1 table:
  `article_notifications (slug TEXT PRIMARY KEY, sent_at TEXT, recipient_count INTEGER)`,
  added to the existing `silsilah` database.
- Env vars: `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` as Cloudflare secrets, mirrored
  in `.dev.vars` for local development.

## Error Handling

- Malformed email submitted to `/api/subscribe`: 400 with a friendly message.
- Resend API failure on subscribe (rate limit, network): caught, logged
  server-side, generic "something went wrong" returned to the user. No upstream
  error text is exposed.
- Resend reports the contact already exists: treated as success.
- `/admin/notify` Send button is disabled for articles already marked sent in D1.
  No override control in this version; a forced resend would be a direct D1 edit.
- Broadcast send succeeds but the D1 insert fails: the API response says so
  explicitly rather than reporting plain success, flagging that the article
  needs a manual D1 check before it is safe to try again.
- Broadcast send itself fails: nothing is written to D1, so retrying is always
  safe.

## Testing

- Unit tests (`node --test`, matching the existing `test:blog-maker` pattern) for:
  - the email-validation schema (accepts valid, rejects malformed addresses)
  - the email-template builder (given article frontmatter, produces the expected
    subject/html/text)
  - Resend HTTP calls are mocked; these tests do not hit the real API.
- Manual verification in a browser preview:
  - submit the subscribe form from both placements, confirm the contact appears
    in the Resend audience dashboard
  - trigger one real broadcast against a test article and confirm the email
    arrives, renders correctly, and the unsubscribe link works
- Cloudflare Access cannot be exercised in local dev. The admin route only
  enforces the Access assumption outside `import.meta.env.DEV`, so the page can
  be built and clicked through locally. Real enforcement is verified after
  deploy, once the Access application is configured in the Zero Trust dashboard.

## Out of Scope

- Automatic or scheduled triggering of broadcasts.
- Double opt-in / confirmation emails.
- Multi-article digest broadcasts.
- A resend/override control for already-notified articles.
- Any subscriber data storage in this codebase or in D1 — subscriber identity
  lives entirely in Resend.
