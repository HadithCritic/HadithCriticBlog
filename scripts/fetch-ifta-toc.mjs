/**
 * Acquire the Ifta' Sunnah table-of-contents snapshots. Network only: this
 * saves raw pages and the manifest, and scripts/parse-ifta-toc.mjs turns them
 * into JSON offline.
 *
 * The corpus is the Ifta' Sunnah export, which kept each narration's bab
 * heading but not its kitab. The platform's table of contents is a tree whose
 * node ids share one sequence with the narrations' mainIds, so each
 * collection's top level and one page per top-level node are enough to place
 * every narration.
 *
 * Polite by construction. Every live request, for every collection, goes
 * through one gate: at most --concurrency requests in flight (default 4) and
 * at least --spacing ms between request starts (default 250). A failure that
 * suggests the server is under strain (network error, 408, 429, 5xx or a
 * malformed page) holds the whole gate for the backoff, not just the one
 * request. A valid snapshot already on disk is used as is, with no request
 * and no delay; only missing or invalid snapshots are fetched.
 *
 * Output: data/ifta-toc/raw/<book>-<parent>.html, the response bytes
 * unchanged, and data/ifta-toc/manifest.json with each page's URL, size,
 * sha256 and fetch time, sorted so a run that fetches nothing rewrites it
 * byte for byte.
 *
 * Usage: node scripts/fetch-ifta-toc.mjs [platformBookId ...]
 *   [--concurrency 4] [--spacing 250] [--raw dir] [--manifest file] [--stats file]
 */

import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  BOOK_IDS, MANIFEST, MANIFEST_SCHEMA, RAW_DIR, children, levelUrl, sha256, snapshotName, validSnapshot,
} from './ifta-toc/common.mjs';

const USER_AGENT = 'HadithCritic corpus structure (research, low rate)';
const MAX_ATTEMPTS = 6;
const BACKOFF_MS = 2000;
const BACKOFF_CAP_MS = 60000;

function parseArgs(argv) {
  const options = { concurrency: 4, spacing: 250, raw: RAW_DIR, manifest: MANIFEST, stats: null, books: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const value = argv[i + 1];
      i += 1;
      if (arg === '--concurrency') options.concurrency = Math.max(1, Number(value));
      else if (arg === '--spacing') options.spacing = Math.max(0, Number(value));
      else if (arg === '--raw') options.raw = path.resolve(value);
      else if (arg === '--manifest') options.manifest = path.resolve(value);
      else if (arg === '--stats') options.stats = path.resolve(value);
      else throw new Error(`unknown option ${arg}`);
    } else if (Number(arg)) {
      options.books.push(Number(arg));
    }
  }
  if (!options.books.length) options.books = BOOK_IDS;
  return options;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One gate for every live request in the run: a concurrency cap, a minimum
 * interval between request starts, and a shared hold that a struggling server
 * imposes on everyone.
 */
function createGate({ concurrency, spacing }) {
  let active = 0;
  let lastStart = -Infinity;
  let holdUntil = 0;
  let startChain = Promise.resolve();
  let inFlight = 0;
  let peak = 0;
  const waiters = [];

  const acquire = () => {
    if (active < concurrency) {
      active += 1;
      return Promise.resolve();
    }
    return new Promise((resolve) => waiters.push(resolve));
  };
  // A released slot passes straight to the next waiter, so `active` never
  // drops below the cap while anyone is queued.
  const release = () => {
    const next = waiters.shift();
    if (next) next();
    else active -= 1;
  };
  // Starts are serialized through one chain, so the spacing holds across
  // every collection however many tasks are queued.
  const spaced = () => {
    const turn = startChain.then(async () => {
      const wait = Math.max(lastStart + spacing, holdUntil) - Date.now();
      if (wait > 0) await sleep(wait);
      lastStart = Date.now();
    });
    startChain = turn;
    return turn;
  };

  return {
    async run(task) {
      await acquire();
      try {
        await spaced();
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        try {
          return await task();
        } finally {
          inFlight -= 1;
        }
      } finally {
        release();
      }
    },
    hold(ms) {
      holdUntil = Math.max(holdUntil, Date.now() + ms);
    },
    get peak() {
      return peak;
    },
  };
}

class FetchError extends Error {
  constructor(message, { retryable, retryAfterMs = 0 }) {
    super(message);
    this.retryable = retryable;
    this.retryAfterMs = retryAfterMs;
  }
}

function retryAfter(header) {
  if (!header) return 0;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const at = Date.parse(header);
  return Number.isFinite(at) ? Math.max(0, at - Date.now()) : 0;
}

function writeAtomic(file, bytes) {
  const tmp = `${file}.part`;
  writeFileSync(tmp, bytes);
  renameSync(tmp, file);
}

function createAcquirer(options, gate, stats, previous) {
  const entries = new Map();

  const record = (bookId, parentId, bytes, fetched) => {
    entries.set(`${bookId}-${parentId}`, {
      book: bookId,
      parent: parentId,
      url: levelUrl(bookId, parentId),
      file: `raw/${snapshotName(bookId, parentId)}`,
      bytes: bytes.length,
      sha256: sha256(bytes),
      fetched,
    });
  };

  async function attempt(url, bookId) {
    stats.requests += 1;
    let response;
    try {
      response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    } catch (error) {
      throw new FetchError(`network: ${error.cause?.code || error.message}`, { retryable: true });
    }
    if (!response.ok) {
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      throw new FetchError(`HTTP ${response.status}`, { retryable, retryAfterMs: retryAfter(response.headers.get('retry-after')) });
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const html = bytes.toString('utf8');
    if (!validSnapshot(html, bookId)) throw new FetchError('incomplete or unexpected page', { retryable: true });
    return { bytes, html };
  }

  async function live(bookId, parentId) {
    const url = levelUrl(bookId, parentId);
    for (let n = 1; ; n += 1) {
      try {
        return await gate.run(() => attempt(url, bookId));
      } catch (error) {
        if (!error.retryable || n === MAX_ATTEMPTS) throw new Error(`${url}: ${error.message} (attempt ${n})`);
        stats.retries += 1;
        const backoff = Math.min(BACKOFF_CAP_MS, Math.max(error.retryAfterMs, BACKOFF_MS * 2 ** (n - 1)));
        gate.hold(backoff);
      }
    }
  }

  /** A level page: the snapshot on disk when it is valid, otherwise a live fetch. */
  async function page(bookId, parentId) {
    const file = path.join(options.raw, snapshotName(bookId, parentId));
    if (existsSync(file)) {
      const bytes = readFileSync(file);
      const html = bytes.toString('utf8');
      if (validSnapshot(html, bookId)) {
        stats.cacheHits += 1;
        const known = previous.get(`${bookId}-${parentId}`);
        const fetched = known && known.sha256 === sha256(bytes) ? known.fetched : statSync(file).mtime.toISOString().slice(0, 19) + 'Z';
        record(bookId, parentId, bytes, fetched);
        return html;
      }
      stats.invalidReplaced += 1;
    }
    const { bytes, html } = await live(bookId, parentId);
    writeAtomic(file, bytes);
    stats.fetched += 1;
    record(bookId, parentId, bytes, new Date().toISOString().slice(0, 19) + 'Z');
    return html;
  }

  async function acquireBook(bookId) {
    const top = await page(bookId, 0);
    const groups = children(top, bookId, 0).filter((group) => !group.leaf);
    const results = await Promise.allSettled(groups.map((group) => page(bookId, group.id)));
    const failed = results.filter((r) => r.status === 'rejected');
    for (const failure of failed) stats.failures.push(failure.reason.message);
    console.log(`book ${bookId}: ${groups.length + 1} pages, ${failed.length} failed`);
  }

  return { entries, acquireBook };
}

function loadManifest(file) {
  if (!existsSync(file)) return new Map();
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  return new Map(manifest.pages.map((entry) => [`${entry.book}-${entry.parent}`, entry]));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  mkdirSync(options.raw, { recursive: true });
  mkdirSync(path.dirname(options.manifest), { recursive: true });
  const previous = loadManifest(options.manifest);
  const stats = { requests: 0, fetched: 0, cacheHits: 0, invalidReplaced: 0, retries: 0, failures: [] };
  const gate = createGate(options);
  const { entries, acquireBook } = createAcquirer(options, gate, stats, previous);

  const started = Date.now();
  const books = await Promise.allSettled(options.books.map((bookId) => acquireBook(bookId)));
  for (const result of books) if (result.status === 'rejected') stats.failures.push(result.reason.message);
  const elapsedMs = Date.now() - started;

  // Pages from collections outside this run are kept; pages seen in it are replaced.
  const merged = new Map([...previous, ...entries]);
  const pages = [...merged.values()].sort((a, b) => a.book - b.book || a.parent - b.parent);
  writeAtomic(options.manifest, `${JSON.stringify({ schemaVersion: MANIFEST_SCHEMA, source: 'https://sunna.alifta.gov.sa', pages }, null, 1)}\n`);

  const summary = {
    approach: `pool c=${options.concurrency} spacing=${options.spacing}ms`,
    books: options.books.length,
    pages: entries.size,
    requests: stats.requests,
    fetched: stats.fetched,
    cacheHits: stats.cacheHits,
    invalidReplaced: stats.invalidReplaced,
    retries: stats.retries,
    failures: stats.failures.length,
    peakInFlight: gate.peak,
    elapsedMs,
  };
  console.log(JSON.stringify(summary));
  for (const failure of stats.failures) console.error(`failed: ${failure}`);
  if (options.stats) writeFileSync(options.stats, `${JSON.stringify({ ...summary, failureDetail: stats.failures }, null, 1)}\n`);
  process.exitCode = stats.failures.length ? 1 : 0;
}

await main();
