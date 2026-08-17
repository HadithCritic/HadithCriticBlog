# Email Notifications via Resend Segments + Broadcasts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers subscribe to email updates and let the site owner send a one-click broadcast whenever an article is ready to announce, using Resend for both subscriber storage and sending.

**Architecture:** Two independent on-demand (`prerender = false`) Astro routes on the existing Cloudflare adapter. Subscribe writes straight to a Resend Segment via its API. Notify is a password-free admin page (protected at the edge by Cloudflare Access, not by app code) that lists articles against a small D1 table tracking which ones have already been broadcast, and a POST route that builds the email and calls Resend's Broadcast API.

**Tech Stack:** Astro 6 (Cloudflare adapter), Cloudflare D1 (existing `silsilah` database), Resend HTTP API (Segments + Broadcasts), Zod, `node --test`.

## Global Constraints

- Manual trigger only — no automatic or scheduled broadcast sending.
- Single opt-in — a submitted email is added to the Resend segment immediately, no confirmation step.
- One broadcast per article, always — never batch several articles into one email.
- The admin route (`/admin/notify`) contains no login/auth code. Production access control is Cloudflare Access, configured against `/admin/*` in the Cloudflare Zero Trust dashboard as a manual, out-of-band step — not part of any task below.
- No resend override — once an article shows as sent in D1, the Send button for it stays disabled. A forced resend is a manual D1 edit, not a UI feature.
- Subscriber identity (emails) lives only in Resend. This codebase never stores subscriber emails. D1 stores only `slug` and `sent_at` for duplicate-send prevention — the spec's `recipient_count` column is dropped because Resend's broadcast APIs don't return a recipient count synchronously (confirmed against current docs; adding it back would require an extra paginated contacts call for no real benefit).
- Bindings and secrets are read via `import { env } from "cloudflare:workers"` in every route — this is the binding-access pattern for `@astrojs/cloudflare@13.7`, not `Astro.locals.runtime.env` (which throws in this version).
- Commit messages: conventional commits, no co-author line, no em-dashes or AI-slop phrasing anywhere in code comments, commit messages, or UI copy.

## Prerequisites (manual, outside this plan — not code tasks)

These must exist before the notify flow can be exercised end-to-end, though every code task below is independently testable without them:

1. A Resend account with a verified sending domain for `hadithcriticblog.com` (or a subdomain), so broadcasts can be sent `from` an address on that domain.
2. A Resend Segment created for blog subscribers, with its ID noted.
3. A Resend API key with contacts + broadcasts permission.
4. After first deploy: a Cloudflare Access application in the Zero Trust dashboard, gating `/admin/notify` and `/api/admin/notify` to the site owner's identity.
5. After first deploy: `RESEND_API_KEY` and `RESEND_SEGMENT_ID` set as Cloudflare Worker secrets (`wrangler secret put RESEND_API_KEY`, `wrangler secret put RESEND_SEGMENT_ID`).

---

### Task 1: Environment and test wiring

**Files:**
- Create: `.dev.vars`
- Modify: `.gitignore`
- Modify: `package.json`

**Interfaces:**
- Produces: `RESEND_API_KEY` and `RESEND_SEGMENT_ID` available as `env.RESEND_API_KEY` / `env.RESEND_SEGMENT_ID` in local dev (used by Task 5 and Task 8).
- Produces: `npm run test:notifications` running every `*.test.mjs` file under `src/lib/`.

- [ ] **Step 1: Create local dev secrets file**

Create `.dev.vars` at the repo root:

```
RESEND_API_KEY=re_placeholder_replace_locally
RESEND_SEGMENT_ID=seg_placeholder_replace_locally
```

- [ ] **Step 2: Keep it out of git**

Add to `.gitignore`, in the "environment variables" section next to `.env`:

```
.dev.vars
```

- [ ] **Step 3: Regenerate Cloudflare Worker types**

Run: `npx wrangler types`

Expected: `worker-configuration.d.ts` regenerates and its `__BaseEnv_Env` interface now includes `RESEND_API_KEY: string;` and `RESEND_SEGMENT_ID: string;` alongside the existing `DB: D1Database;`. If the command can't run in this environment (no wrangler auth available), edit `worker-configuration.d.ts` directly and add those two lines to `__BaseEnv_Env`.

- [ ] **Step 4: Add the test script**

In `package.json`, add a new script next to `test:blog-maker`:

```json
"test:notifications": "node --test src/lib/tests/*.test.mjs src/lib/email-templates/tests/*.test.mjs",
```

And add it into the `validate` chain so it runs alongside the existing checks:

```json
"validate": "npm run lint:footnotes && npm run test:notifications && npm run check && npm run test:design && npm run build",
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json
git commit -m "chore: add env wiring and test script for email notifications"
```

(`.dev.vars` is gitignored and won't be staged — confirm with `git status` that it doesn't appear.)

---

### Task 2: D1 migration for send tracking

**Files:**
- Create: `migrations/0001_create_article_notifications.sql` (or the next available number if `migrations/` already has entries)

**Interfaces:**
- Produces: table `article_notifications (slug TEXT PRIMARY KEY, sent_at TEXT NOT NULL)` in the `silsilah` D1 database — consumed by Task 7 (read) and Task 8 (read + write).

- [ ] **Step 1: Generate the migration file**

Run: `npx wrangler d1 migrations create silsilah create_article_notifications`

Expected: creates `migrations/0001_create_article_notifications.sql` (wrangler picks the number).

- [ ] **Step 2: Write the migration**

Replace the generated file's contents with:

```sql
CREATE TABLE IF NOT EXISTS article_notifications (
  slug TEXT PRIMARY KEY,
  sent_at TEXT NOT NULL
);
```

- [ ] **Step 3: Apply it locally**

Run: `npx wrangler d1 migrations apply silsilah --local`

Expected: output confirms one migration applied, and `article_notifications` exists in the local D1 simulation.

- [ ] **Step 4: Commit**

```bash
git add migrations/0001_create_article_notifications.sql
git commit -m "feat: add article_notifications D1 table"
```

Note: applying this migration to the **remote** production database (`npx wrangler d1 migrations apply silsilah --remote`) is a deploy-time action against shared infrastructure — run it yourself when you're ready to deploy, it is not part of this plan.

---

### Task 3: Resend API client

**Files:**
- Create: `src/lib/resend.mjs`
- Test: `src/lib/tests/resend.test.mjs`

**Interfaces:**
- Produces: `addContactToSegment(email: string, config: { apiKey: string, segmentId: string }): Promise<{ status: 'subscribed' | 'already_subscribed' }>` — consumed by Task 5.
- Produces: `sendArticleBroadcast(content: { subject: string, html: string, text: string }, config: { apiKey: string, segmentId: string }): Promise<{ broadcastId: string }>` — consumed by Task 8.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/tests/resend.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addContactToSegment, sendArticleBroadcast } from '../resend.mjs';

function mockFetchOnce(status, body) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Mocked',
    json: async () => body,
  });
  return () => {
    globalThis.fetch = originalFetch;
  };
}

test('addContactToSegment returns subscribed on success', async () => {
  const restore = mockFetchOnce(200, { object: 'contact', id: 'abc123' });
  try {
    const result = await addContactToSegment('reader@example.com', { apiKey: 'key', segmentId: 'seg1' });
    assert.deepEqual(result, { status: 'subscribed' });
  } finally {
    restore();
  }
});

test('addContactToSegment returns already_subscribed on 409', async () => {
  const restore = mockFetchOnce(409, { message: 'Contact already exists' });
  try {
    const result = await addContactToSegment('reader@example.com', { apiKey: 'key', segmentId: 'seg1' });
    assert.deepEqual(result, { status: 'already_subscribed' });
  } finally {
    restore();
  }
});

test('addContactToSegment throws on an unexpected error', async () => {
  const restore = mockFetchOnce(500, { message: 'Internal error' });
  try {
    await assert.rejects(
      () => addContactToSegment('reader@example.com', { apiKey: 'key', segmentId: 'seg1' }),
      /Resend contact creation failed: Internal error/
    );
  } finally {
    restore();
  }
});

test('sendArticleBroadcast returns the broadcast id on success', async () => {
  const restore = mockFetchOnce(200, { object: 'broadcast', id: 'broadcast-1' });
  try {
    const result = await sendArticleBroadcast(
      { subject: 'New post', html: '<p>hi</p>', text: 'hi' },
      { apiKey: 'key', segmentId: 'seg1' }
    );
    assert.deepEqual(result, { broadcastId: 'broadcast-1' });
  } finally {
    restore();
  }
});

test('sendArticleBroadcast throws on failure', async () => {
  const restore = mockFetchOnce(400, { message: 'Invalid segment' });
  try {
    await assert.rejects(
      () =>
        sendArticleBroadcast(
          { subject: 'New post', html: '<p>hi</p>', text: 'hi' },
          { apiKey: 'key', segmentId: 'seg1' }
        ),
      /Resend broadcast send failed: Invalid segment/
    );
  } finally {
    restore();
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/lib/tests/resend.test.mjs`
Expected: FAIL — `src/lib/resend.mjs` does not exist yet.

- [ ] **Step 3: Write the implementation**

Create `src/lib/resend.mjs`:

```js
const RESEND_API_BASE = 'https://api.resend.com';
const NEW_ARTICLE_FROM_ADDRESS = 'HadithCritic <updates@hadithcriticblog.com>';

/**
 * @param {string} email
 * @param {{ apiKey: string, segmentId: string }} config
 * @returns {Promise<{ status: 'subscribed' | 'already_subscribed' }>}
 */
export async function addContactToSegment(email, config) {
  const response = await fetch(`${RESEND_API_BASE}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, segments: [{ id: config.segmentId }] }),
  });

  if (response.ok) {
    return { status: 'subscribed' };
  }

  // Resend has no documented response shape for a duplicate email; 409 is
  // the conventional conflict status and is treated as an idempotent subscribe.
  if (response.status === 409) {
    return { status: 'already_subscribed' };
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(`Resend contact creation failed: ${body.message ?? response.statusText}`);
}

/**
 * @param {{ subject: string, html: string, text: string }} content
 * @param {{ apiKey: string, segmentId: string }} config
 * @returns {Promise<{ broadcastId: string }>}
 */
export async function sendArticleBroadcast(content, config) {
  const response = await fetch(`${RESEND_API_BASE}/broadcasts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      segment_id: config.segmentId,
      from: NEW_ARTICLE_FROM_ADDRESS,
      subject: content.subject,
      html: content.html,
      text: content.text,
      send: true,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Resend broadcast send failed: ${body.message ?? response.statusText}`);
  }

  const body = await response.json();
  return { broadcastId: body.id };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/lib/tests/resend.test.mjs`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/resend.mjs src/lib/tests/resend.test.mjs
git commit -m "feat: add Resend API client for segments and broadcasts"
```

---

### Task 4: New-article email template

**Files:**
- Create: `src/lib/email-templates/new-article.mjs`
- Test: `src/lib/email-templates/tests/new-article.test.mjs`

**Interfaces:**
- Produces: `buildNewArticleEmail(article: { title: string, description: string, thumbnail?: string, canonicalUrl: string }): { subject: string, html: string, text: string }` — consumed by Task 8.

- [ ] **Step 1: Write the failing tests**

Create `src/lib/email-templates/tests/new-article.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNewArticleEmail } from '../new-article.mjs';

test('builds the subject from the article title', () => {
  const result = buildNewArticleEmail({
    title: 'The People of the Canyon',
    description: 'A case for the Valley of Hinnom.',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-the-people-of-the-canyon',
  });
  assert.equal(result.subject, 'New on HadithCritic: The People of the Canyon');
});

test('includes the thumbnail image when provided', () => {
  const result = buildNewArticleEmail({
    title: 'Title',
    description: 'Description',
    thumbnail: 'https://hadithcriticblog.com/images/blog_thumbnails/tn.81.webp',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x',
  });
  assert.match(result.html, /<img src="https:\/\/hadithcriticblog\.com\/images\/blog_thumbnails\/tn\.81\.webp"/);
});

test('omits the thumbnail image when not provided', () => {
  const result = buildNewArticleEmail({
    title: 'Title',
    description: 'Description',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x',
  });
  assert.doesNotMatch(result.html, /<img/);
});

test('includes the Resend unsubscribe template variable in html and text', () => {
  const result = buildNewArticleEmail({
    title: 'Title',
    description: 'Description',
    canonicalUrl: 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x',
  });
  assert.match(result.html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.match(result.text, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
});

test('includes the canonical link in html and text', () => {
  const url = 'https://hadithcriticblog.com/blogs/theology-epistemology/81-x';
  const result = buildNewArticleEmail({ title: 'Title', description: 'Description', canonicalUrl: url });
  assert.ok(result.html.includes(url));
  assert.ok(result.text.includes(url));
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test src/lib/email-templates/tests/new-article.test.mjs`
Expected: FAIL — `src/lib/email-templates/new-article.mjs` does not exist yet.

- [ ] **Step 3: Write the implementation**

Create `src/lib/email-templates/new-article.mjs`:

```js
/**
 * @param {{ title: string, description: string, thumbnail?: string, canonicalUrl: string }} article
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildNewArticleEmail(article) {
  const subject = `New on HadithCritic: ${article.title}`;

  const thumbnailHtml = article.thumbnail
    ? `<img src="${article.thumbnail}" alt="${article.title}" width="600" style="width:100%;max-width:600px;height:auto;display:block;margin-bottom:16px;" />`
    : '';

  const html = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  ${thumbnailHtml}
  <h1 style="font-size:22px;line-height:1.3;margin:0 0 12px;">${article.title}</h1>
  <p style="font-size:16px;line-height:1.6;color:#3a3a3a;margin:0 0 20px;">${article.description}</p>
  <a href="${article.canonicalUrl}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:4px;font-size:14px;">Read the article</a>
  <p style="font-size:12px;color:#8a8a8a;margin-top:32px;">You're receiving this because you subscribed at HadithCritic. {{{RESEND_UNSUBSCRIBE_URL}}}</p>
</div>`.trim();

  const text = `${article.title}\n\n${article.description}\n\nRead the article: ${article.canonicalUrl}\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;

  return { subject, html, text };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test src/lib/email-templates/tests/new-article.test.mjs`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/email-templates/new-article.mjs src/lib/email-templates/tests/new-article.test.mjs
git commit -m "feat: add new-article email template builder"
```

---

### Task 5: Subscribe API route

**Files:**
- Create: `src/lib/subscribe-schema.mjs`
- Test: `src/lib/tests/subscribe-schema.test.mjs`
- Create: `src/pages/api/subscribe.ts`
- Modify: `package.json` (add `zod` as a direct dependency)

**Interfaces:**
- Consumes: `addContactToSegment` from `src/lib/resend.mjs` (Task 3).
- Produces: `subscribeSchema` (a Zod schema validating `{ email: string }`) — consumed by `src/pages/api/subscribe.ts` in this task.
- Produces: `POST /api/subscribe` — consumed by `SubscribeForm.astro` (Task 6). Request body `{ email: string }`. Response `{ success: true }` (200) or `{ success: false, error: string }` (400 invalid email, 502 upstream failure).

- [ ] **Step 1: Add zod as a direct dependency**

`zod` is currently only a transitive dependency of Astro. Make it explicit:

Run: `npm install zod@^4.4.3`

- [ ] **Step 2: Write the failing schema tests**

Create `src/lib/tests/subscribe-schema.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subscribeSchema } from '../subscribe-schema.mjs';

test('accepts a valid email', () => {
  const result = subscribeSchema.safeParse({ email: 'reader@example.com' });
  assert.equal(result.success, true);
});

test('rejects a malformed email', () => {
  const result = subscribeSchema.safeParse({ email: 'not-an-email' });
  assert.equal(result.success, false);
});

test('rejects a missing email field', () => {
  const result = subscribeSchema.safeParse({});
  assert.equal(result.success, false);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `node --test src/lib/tests/subscribe-schema.test.mjs`
Expected: FAIL — `src/lib/subscribe-schema.mjs` does not exist yet.

- [ ] **Step 4: Write the schema**

Create `src/lib/subscribe-schema.mjs`:

```js
import { z } from 'zod';

export const subscribeSchema = z.object({
  email: z.string().email(),
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test src/lib/tests/subscribe-schema.test.mjs`
Expected: PASS, 3 tests.

- [ ] **Step 6: Write the API route**

Create `src/pages/api/subscribe.ts`:

```ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { subscribeSchema } from '../../lib/subscribe-schema.mjs';
import { addContactToSegment } from '../../lib/resend.mjs';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ success: false, error: 'Enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await addContactToSegment(parsed.data.email, {
      apiKey: env.RESEND_API_KEY,
      segmentId: env.RESEND_SEGMENT_ID,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Subscribe failed', error);
    return new Response(JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/subscribe-schema.mjs src/lib/tests/subscribe-schema.test.mjs src/pages/api/subscribe.ts
git commit -m "feat: add subscribe API route"
```

---

### Task 6: Subscribe form component and placement

**Files:**
- Create: `src/components/SubscribeForm.astro`
- Modify: `src/pages/blogs/[...id].astro` (add the form after the article footer)
- Modify: `src/components/SiteFooter.astro` (add the form after the footer panel)

**Interfaces:**
- Consumes: `POST /api/subscribe` (Task 5).
- Produces: `<SubscribeForm variant="article" | "footer" />` — consumed by the two placement edits in this task.

- [ ] **Step 1: Create the component**

Create `src/components/SubscribeForm.astro`:

```astro
---
interface Props {
  variant: 'article' | 'footer';
}

const { variant } = Astro.props;
---

<div class:list={['subscribe-form', `subscribe-form--${variant}`]} data-subscribe-form>
  <div class="subscribe-form__copy">
    <h3>Get new studies by email</h3>
    <p>One email whenever a new piece publishes. No spam, unsubscribe anytime.</p>
  </div>
  <form class="subscribe-form__form" data-subscribe-form-el>
    <label for={`subscribe-email-${variant}`} class="sr-only">Email address</label>
    <input
      type="email"
      id={`subscribe-email-${variant}`}
      name="email"
      placeholder="you@example.com"
      required
      autocomplete="email"
    />
    <button type="submit">Subscribe</button>
  </form>
  <p class="subscribe-form__status" data-subscribe-form-status role="status" aria-live="polite"></p>
</div>

<script>
  document.querySelectorAll('[data-subscribe-form]').forEach((container) => {
    const form = container.querySelector('[data-subscribe-form-el]');
    const status = container.querySelector('[data-subscribe-form-status]');
    if (!(form instanceof HTMLFormElement) || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = new FormData(form).get('email');
      if (typeof email !== 'string' || !email) return;

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
      status.textContent = '';

      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const result = await response.json();

        if (result.success) {
          status.textContent = "You're subscribed. Look out for the next one.";
          form.reset();
        } else {
          status.textContent = result.error || 'Something went wrong. Please try again.';
        }
      } catch {
        status.textContent = 'Something went wrong. Please try again.';
      } finally {
        if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
      }
    });
  });
</script>

<style>
  .subscribe-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.75rem 2rem;
    border: 1px solid var(--hc-rule);
    background: color-mix(in srgb, var(--hc-surface-2) 60%, transparent);
  }

  .subscribe-form__copy h3 {
    margin: 0 0 0.35rem;
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 600;
  }

  .subscribe-form__copy p {
    margin: 0;
    color: var(--hc-text-secondary);
    font-family: var(--font-ui);
    font-size: 0.88rem;
    max-width: 40ch;
  }

  .subscribe-form__form {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .subscribe-form__form input {
    min-width: 15rem;
    padding: 0.6rem 0.85rem;
    border: 1px solid var(--hc-rule);
    background: transparent;
    color: inherit;
    font-family: var(--font-ui);
    font-size: 0.9rem;
  }

  .subscribe-form__form button {
    padding: 0.6rem 1.1rem;
    border: 1px solid var(--hc-gold-dim);
    background: rgba(216, 177, 102, 0.12);
    color: var(--hc-gold);
    font-family: var(--font-ui);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: background 180ms ease, border-color 180ms ease;
  }

  .subscribe-form__form button:hover {
    background: rgba(216, 177, 102, 0.2);
    border-color: var(--hc-gold);
  }

  .subscribe-form__form button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .subscribe-form__status {
    flex-basis: 100%;
    margin: 0;
    font-family: var(--font-ui);
    font-size: 0.82rem;
    color: var(--hc-gold-dim);
  }

  .subscribe-form--footer {
    border-color: rgba(216, 177, 102, 0.26);
    background: rgba(242, 235, 220, 0.05);
  }

  .subscribe-form--footer .subscribe-form__copy h3,
  .subscribe-form--footer .subscribe-form__copy p {
    color: var(--hc-fixed-parchment, #F2EBDC);
  }

  .subscribe-form--footer .subscribe-form__copy p {
    opacity: 0.78;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .subscribe-form {
      flex-direction: column;
      align-items: flex-start;
    }

    .subscribe-form__form {
      width: 100%;
    }

    .subscribe-form__form input {
      flex: 1 1 auto;
      min-width: 0;
    }
  }
</style>
```

- [ ] **Step 2: Place it at the end of every article**

In `src/pages/blogs/[...id].astro`, add the import next to the other component imports at the top of the frontmatter:

```astro
import SubscribeForm from '../../components/SubscribeForm.astro';
```

Then find this existing block near the end of the template:

```astro
    </div>
  </footer>

<style>
  .article-footer {
```

Change it to:

```astro
    </div>
  </footer>

  <SubscribeForm variant="article" />

<style>
  .article-footer {
```

- [ ] **Step 3: Place it in the site-wide footer**

In `src/components/SiteFooter.astro`, add the import in the frontmatter (the `---` block at the top, alongside the `Props` interface):

```astro
import SubscribeForm from './SubscribeForm.astro';
```

Then find this existing block (the end of `.hcFooter__meta` and `.hcFooter__panel`):

```astro
      </div>
    </div>
  </div>
</footer>
```

Change it to:

```astro
      </div>
    </div>

    <SubscribeForm variant="footer" />
  </div>
</footer>
```

(The first three lines close `.hcFooter__meta`, `.hcFooter__panel`, then the new `SubscribeForm` sits as a sibling of `.hcFooter__panel`, still inside `.hcFooter__content`, before that closes too — this keeps it out of the `brand`/`links`/`meta` grid areas entirely.)

- [ ] **Step 4: Manually verify**

Start the dev server and check both placements: submit a real email on an article page and in the footer, confirm the status message renders, and confirm (via the Resend dashboard) that the contact was added to the segment.

- [ ] **Step 5: Commit**

```bash
git add src/components/SubscribeForm.astro src/pages/blogs/\[...id\].astro src/components/SiteFooter.astro
git commit -m "feat: add subscribe form to articles and site footer"
```

---

### Task 7: Admin notify list page

**Files:**
- Create: `src/pages/admin/notify.astro`

**Interfaces:**
- Consumes: `article_notifications` table (Task 2).
- Produces: the page that posts `{ slug }` to `POST /api/admin/notify` (Task 8).

- [ ] **Step 1: Write the page**

Create `src/pages/admin/notify.astro`:

```astro
---
export const prerender = false;

import { getCollection } from 'astro:content';
import { env } from 'cloudflare:workers';

const posts = await getCollection('articles', ({ data }) => !data.draft && !data.preview);
const sorted = [...posts].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

const { results: sentRows } = await env.DB.prepare('SELECT slug, sent_at FROM article_notifications').all();
const sentBySlug = new Map(sentRows.map((row) => [row.slug, row.sent_at]));
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Notify subscribers</title>
    <meta name="robots" content="noindex, nofollow" />
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #ddd; }
      button { padding: 0.35rem 0.9rem; cursor: pointer; }
      #notify-status { margin-top: 1rem; font-weight: 600; }
    </style>
  </head>
  <body>
    <main>
      <h1>Notify subscribers</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Published</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((post) => {
            const sentAt = sentBySlug.get(post.id);
            return (
              <tr>
                <td>{post.data.title}</td>
                <td>{new Date(post.data.date).toLocaleDateString('en-US')}</td>
                <td>{sentAt ? `Sent ${new Date(sentAt).toLocaleString('en-US')}` : 'Not sent'}</td>
                <td>
                  {!sentAt && (
                    <form data-notify-form data-slug={post.id}>
                      <button type="submit">Send</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p id="notify-status" role="status" aria-live="polite"></p>
    </main>

    <script>
      document.querySelectorAll('[data-notify-form]').forEach((form) => {
        if (!(form instanceof HTMLFormElement)) return;
        const slug = form.dataset.slug;

        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          if (!confirm(`Send the new-article email for "${slug}" to all subscribers?`)) return;

          const button = form.querySelector('button');
          if (button instanceof HTMLButtonElement) button.disabled = true;

          const status = document.getElementById('notify-status');

          try {
            const response = await fetch('/api/admin/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug }),
            });
            const result = await response.json();

            if (result.success) {
              if (status) status.textContent = result.warning ? `Sent, but: ${result.warning}` : `Sent for ${slug}.`;
              window.location.reload();
            } else {
              if (status) status.textContent = result.error || 'Send failed.';
              if (button instanceof HTMLButtonElement) button.disabled = false;
            }
          } catch {
            if (status) status.textContent = 'Send failed.';
            if (button instanceof HTMLButtonElement) button.disabled = false;
          }
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Manually verify**

Start the dev server, visit `/admin/notify`, and confirm every published article is listed with a "Not sent" status and a Send button (the page is unauthenticated in local dev — that's expected; production access control is Cloudflare Access, set up separately).

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/notify.astro
git commit -m "feat: add admin notify list page"
```

---

### Task 8: Admin notify send route

**Files:**
- Create: `src/pages/api/admin/notify.ts`

**Interfaces:**
- Consumes: `buildNewArticleEmail` (Task 4), `sendArticleBroadcast` (Task 3), `article_notifications` table (Task 2).
- Produces: `POST /api/admin/notify` — consumed by `admin/notify.astro` (Task 7). Request body `{ slug: string }`. Response `{ success: true }` or `{ success: true, warning: string }` (send succeeded, D1 write failed) or `{ success: false, error: string }` (400 invalid slug, 404 article not found, 409 already sent, 502 send failed).

- [ ] **Step 1: Write the route**

Create `src/pages/api/admin/notify.ts`:

```ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { env } from 'cloudflare:workers';
import { getEntry } from 'astro:content';
import { buildNewArticleEmail } from '../../../lib/email-templates/new-article.mjs';
import { sendArticleBroadcast } from '../../../lib/resend.mjs';

const notifySchema = z.object({
  slug: z.string().min(1),
});

export const POST: APIRoute = async ({ request, site }) => {
  const body = await request.json().catch(() => null);
  const parsed = notifySchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ success: false, error: 'A valid article slug is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug } = parsed.data;

  const alreadySent = await env.DB.prepare('SELECT slug FROM article_notifications WHERE slug = ?')
    .bind(slug)
    .first();

  if (alreadySent) {
    return new Response(JSON.stringify({ success: false, error: 'This article has already been sent.' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const entry = await getEntry('articles', slug);

  if (!entry) {
    return new Response(JSON.stringify({ success: false, error: 'Article not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const canonicalUrl = new URL(`/blogs/${entry.id}`, site).href;
  const content = buildNewArticleEmail({
    title: entry.data.title,
    description: entry.data.description,
    thumbnail: entry.data.thumbnail ? new URL(entry.data.thumbnail, site).href : undefined,
    canonicalUrl,
  });

  try {
    await sendArticleBroadcast(content, {
      apiKey: env.RESEND_API_KEY,
      segmentId: env.RESEND_SEGMENT_ID,
    });
  } catch (error) {
    console.error('Broadcast send failed', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to send the broadcast.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await env.DB.prepare('INSERT INTO article_notifications (slug, sent_at) VALUES (?, ?)')
      .bind(slug, new Date().toISOString())
      .run();
  } catch (error) {
    console.error('Recording sent notification failed after a successful send', error);
    return new Response(
      JSON.stringify({
        success: true,
        warning: 'The email sent, but this app failed to record it as sent. Check article_notifications in D1 before trying again.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

- [ ] **Step 2: Manually verify end-to-end**

With real Resend credentials in `.dev.vars` and a real segment containing a test address you control: click Send on one article from `/admin/notify`, confirm the email arrives with the correct title/description/thumbnail/link, confirm the unsubscribe link works, and confirm the article now shows "Sent" on the list page and its Send button is gone. Click-reload and confirm a second send attempt is not offered.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/admin/notify.ts
git commit -m "feat: add admin notify send route"
```

---

## Deployment Notes (not part of the tasks above)

- Set the real secrets on the deployed Worker: `wrangler secret put RESEND_API_KEY` and `wrangler secret put RESEND_SEGMENT_ID`.
- Apply the D1 migration to production: `npx wrangler d1 migrations apply silsilah --remote`.
- Configure the Cloudflare Access application for `/admin/*` in the Zero Trust dashboard before relying on it for protection.
