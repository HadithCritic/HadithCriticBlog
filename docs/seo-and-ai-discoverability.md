# SEO and AI Discoverability

How this site is set up to be found, indexed, retrieved and cited, by search
engines and by AI answer engines.

Last reviewed: 2026-09-07

---

## 1. The blocking issue (action required outside this repo)

**Cloudflare is returning HTTP 403 to every AI crawler at the edge.** This is a
zone setting, not a repository setting, and nothing in this codebase can
override it.

Measured against production on 2026-09-07:

| User-agent | Response |
| --- | --- |
| `GPTBot` | **403** |
| `ClaudeBot` | **403** |
| `OAI-SearchBot` | **403** |
| `PerplexityBot` | **403** |
| `Claude-User` | **403** |
| `Googlebot` | 200 |
| ordinary browser | 200 |

The 403 body is `Your request was blocked.`

This blocks the retrieval bots as well as the training bots. `OAI-SearchBot` is
how ChatGPT Search reaches a page in order to cite it; `Claude-User` is how
Claude fetches a page when a user asks about it. While this rule is in place the
site cannot appear in ChatGPT, Claude or Perplexity answers at all, regardless
of how good its markup is.

Cloudflare was also serving a **managed robots.txt** declaring
`Content-Signal: search=yes,ai-train=no,use=reference` with `Disallow: /` for
eight AI user-agents. Cloudflare only generates that file when the origin has
none, so `public/robots.txt` supersedes it on the next deploy. **The 403 rule is
separate and must be turned off in the dashboard.**

To fix: Cloudflare dashboard, under AI Crawl Control (formerly AI Audit) and
Security -> Bots, allow the crawlers listed in `public/robots.txt`.

Verify afterwards:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -A "OAI-SearchBot/1.0" https://hadithcriticblog.com/
```

---

## 2. What robots.txt does and does not do

`public/robots.txt` states the policy: everything is allowed, including training,
minus API routes, the admin page, and two large orphaned data directories that
would otherwise consume crawl budget for nothing.

It is worth being precise about what this file buys, because it is easy to
overstate:

- It declares both sitemaps. This is the main practical benefit.
- It keeps crawlers off `/data/` and `/rijal-data/` (62 MB of JSON that no
  runtime code reads) and off `/search-index.json` (2.6 MB).
- It records the policy in a durable, reviewable place.

It does **not** grant access that was previously denied, because before this
change the site had no robots.txt and everything was permitted by default. And
robots.txt is advisory: it cannot undo the 403 above.

### Google-Extended is not a Search control

`Google-Extended` governs Gemini grounding and Vertex AI. Disallowing it removes
the site from Gemini's grounded answers and does nothing for AI Overviews, which
follow ordinary `Googlebot`. It is set to `Allow` deliberately.

---

## 3. Structured data

`src/lib/seo.ts` emits one connected `@graph` per page rather than a set of
standalone snippets. The `@id` cross-references are the point: they let an engine
resolve that the Organization on an article page is the same Organization it saw
on the homepage.

Node layout:

| Node | `@id` | Emitted on |
| --- | --- | --- |
| `Organization` | `/#organization` | every page |
| `WebSite` | `/#website` | every page |
| `WebPage` | `{url}#webpage` | every page (unless overridden) |
| `BreadcrumbList` | `{url}#breadcrumb` | pages passing `crumbs` |
| `Person` (author) | `/#author` | articles |
| `ScholarlyArticle` | `{url}#article` | articles |
| `CollectionPage` + `ItemList` | `{url}#webpage` | category hubs |
| `ProfilePage` + `Person` | `{url}#person` | narrator dossiers |

A page supplying its own `#webpage` node suppresses the default one, so hubs and
dossiers do not end up with two nodes under one `@id`.

`ScholarlyArticle` is used rather than `BlogPosting` because these are
source-critical studies with citations, and the type communicates that.

### Narrator dossiers are the highest-value markup here

The rijal register is 20,915 biographical entries that do not exist in queryable
form anywhere else. Marked up as `Person` with names, alternate names, death
date and place, occupation and generation, they answer exactly the kind of
question an answer engine gets asked ("who was X, was he considered reliable").
Hijri dates are not emitted as `deathDate` because they do not map onto ISO 8601;
only the Gregorian equivalent is.

---

## 4. Sitemaps

Two, both declared in robots.txt:

- `/sitemap-index.xml` from `@astrojs/sitemap`, covering prerendered routes.
  Filtered to exclude `/admin`, `/narrators/compare` and `/api/`.
- `/sitemap-narrators.xml`, a hand-rolled index over the on-demand rijal
  register, paginated at 10,000 URLs per child.

The second exists because `@astrojs/sitemap` only emits prerendered routes, so
the entire narrator register was invisible to crawlers.

**18,924 of 20,915 narrators are submitted.** The excluded 1,991 have neither a
recorded critical statement nor an attributed hadith; submitting bare stubs
invites a thin-content assessment that would dampen crawling of the whole
section. They remain reachable and indexable by link.

Both routes degrade to an empty but valid sitemap if the database is
unreachable. A broken
sitemap teaches crawlers to stop asking; an empty one is a truthful "nothing to
list yet".

---

## 5. Snippet directives

`BaseLayout` emits:

```
index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1
```

Search and AI answer surfaces truncate aggressively by default. `max-snippet:-1`
permits a full-length extract, which is what an answer engine needs in order to
quote an argument rather than the first sentence of it.

---

## 6. Topic hubs

`/blogs/category/{slug}` for each of the four subjects, generated from
`src/lib/categories.ts`.

The site already filtered by category on `/blogs`, but a client-side filter is
not a crawlable address and accumulates no topical authority. Each hub is a
stable URL that states what the subject is, in a self-contained paragraph
written to stand alone as an answer, and lists every study in it.

Hubs are linked from `/blogs` ("Browse by subject") and from each other, so they
are not orphans.

---

## 7. llms.txt

`/llms.txt` is generated from the content collection, so it cannot drift.

Honest expectations: the major answer engines do not fetch it. Roughly 97% of
domains publishing one received zero requests for it, Google has said it does
not support it, and no major provider uses it as a production signal. It is here
because it is free to maintain and genuinely useful to the coding and research
agents that do look for it. It is not a ranking lever and should not be treated
as one.

---

## 8. Known outstanding issues

### Article URLs contain filesystem artifacts

Current: `/blogs/origins-early-history/18-ʿilm-al-rijal-علم-الرجال-a-case-study-of-this-flawed-science/`

These carry the numeric file prefix, the category directory, and raw Arabic that
percent-encodes into very long URLs. Ugly URLs are a minor ranking factor but a
real problem for sharing and citation.

### All 74 entries in `public/_redirects` point at 404s

Verified against both the local build and production. Every redirect target is a
clean slug of the form `/blogs/apostasy-hadith-ikrima-transmission-critique/`,
which is not a URL this site produces. The redirects were written against a
flat-slug scheme that the current glob-loader routing does not implement.

Effect: every old indexed URL now 301s to a dead page, so any accumulated link
equity and any external link to those URLs is lost.

Automated remapping was attempted and rejected: only 55 of 74 matched with
useful confidence, and the low-confidence matches were clearly wrong (one old
slug about Caedmon matched an article about the splitting of the moon). Some old
slugs may have no surviving article at all. This needs a human pass.

Fixing both together means adding an explicit `slug` to article frontmatter and
routing on it, then rewriting `_redirects` from the old URLs to the new slugs.
That is a URL migration for 81 published articles and should be a deliberate,
separate piece of work.

### 62 MB of orphaned data in `public/`

`public/data/narrators/` (61 MB, 471 files) and `public/rijal-data/` (1.6 MB) are
read by no runtime code since the D1 migration. They are excluded in robots.txt,
but they are still deployed. Moving generation output to `data/generated/` would
remove them from the deploy entirely.
