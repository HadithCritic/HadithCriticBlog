/**
 * Identity for the two corpus shells, read from the address bar.
 *
 * /hadith/<id>/ and /narrators/<id>/ are served by one prerendered page each,
 * /hadith/shell/ and /narrators/shell/, through a 200 rewrite in `_redirects`
 * (see scripts/lib/shell-rewrites.mjs). The rewrite is applied by Cloudflare's
 * static asset layer, so these pages never invoke the Worker. The page cannot
 * know its id when it is built, so everything that used to be rendered per id
 * on the server is set here instead: the id itself, the title, the canonical
 * address, and the robots verdict for an id the corpus does not hold.
 */

export type ShellKind = 'hadith' | 'narrators';

/**
 * The record id in the current address, or `null` when the address does not
 * name one (including a direct visit to the shell page itself).
 */
export function shellId(kind: ShellKind, pathname = location.pathname): number | null {
  const match = new RegExp(`^/${kind}/(\\d+)/?$`).exec(pathname);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) ? id : null;
}

function setMeta(selector: string, attribute: string, value: string): void {
  document.querySelectorAll(selector).forEach((node) => node.setAttribute(attribute, value));
}

/**
 * Title and canonical address for the record this page is showing. The shell
 * ships with no canonical link, because a fixed one would point every record
 * at the shell; the link is created here once the id is known.
 */
export function setShellIdentity(title: string, path: string): void {
  document.title = title;
  setMeta('meta[property="og:title"], meta[name="twitter:title"]', 'content', title);

  const url = new URL(path, location.origin).href;
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
  setMeta('meta[property="og:url"]', 'content', url);
}

/**
 * Keep an address out of the index. A static asset cannot answer 404 for an
 * id it has never seen, so a missing record is a 200 that says noindex once
 * the corpus has been asked.
 */
export function markNotIndexable(): void {
  setMeta('meta[name="robots"]', 'content', 'noindex, nofollow');
  document.querySelector('link[rel="canonical"]')?.remove();
}
