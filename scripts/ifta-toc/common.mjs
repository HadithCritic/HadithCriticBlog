/**
 * What the Ifta' Sunnah table-of-contents fetcher and parser share: where
 * snapshots live, what a valid snapshot looks like, and how a level page is
 * read. Nothing here touches the network.
 */

import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { htmlText } from '../../src/lib/html-text.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const TOC_DIR = path.join(ROOT, 'data', 'ifta-toc');
export const RAW_DIR = path.join(TOC_DIR, 'raw');
export const MANIFEST = path.join(TOC_DIR, 'manifest.json');
export const BASE = 'https://sunna.alifta.gov.sa';
export const BOOK_IDS = Array.from({ length: 33 }, (_, i) => i + 1);
export const MANIFEST_SCHEMA = 'ifta-toc-manifest/1.0.0';

export const levelUrl = (bookId, parentId) =>
  `${BASE}/BookToc/ViewBookTocLevel?BookId=${bookId}&ParentId=${parentId}&IsLeaf=False`;

export const snapshotName = (bookId, parentId) => `${bookId}-${parentId}.html`;

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

/**
 * A snapshot is valid when it is a complete level page for this book: the
 * document closes, the book's header link is present, and it links into the
 * book's tree. A truncated write or a platform error page fails one of these.
 */
export function validSnapshot(html, bookId) {
  return (
    typeof html === 'string' &&
    html.length > 2000 &&
    /<\/html>\s*$/i.test(html) &&
    html.includes('id="mainTitle"') &&
    html.includes(`ViewBookTocLevel?BookId=${bookId}&`)
  );
}

const decode = (text) => htmlText(text).replace(/\s+/g, ' ').trim();

/** The children listed on a level page: its links that go one level down, in page order. */
export function children(html, bookId, parentId) {
  const nodes = [];
  const seen = new Set();
  const link = /<a[^>]+href="\/BookToc\/ViewBookTocLevel\?BookId=(\d+)&(?:amp;)?ParentId=(\d+)&(?:amp;)?IsLeaf=(True|False)"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of html.matchAll(link)) {
    const [, book, id, leaf, inner] = m;
    if (Number(book) !== bookId || Number(id) === parentId || seen.has(id)) continue;
    seen.add(id);
    nodes.push({ id: Number(id), leaf: leaf === 'True', title: decode(inner) });
  }
  return nodes;
}

export function bookTitle(html) {
  const m = html.match(/href="\\BookToc\\ViewBookTocLevel\?BookId=\d+&(?:amp;)?ParentId=0&(?:amp;)?IsLeaf=False"[^>]*>([\s\S]*?)<\/a>/i);
  return m ? decode(m[1]) : null;
}
