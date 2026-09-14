import { connect, type Connection } from '@tursodatabase/serverless';
import { env } from 'cloudflare:workers';

/**
 * The site's small operational database, on Turso.
 *
 * What is left here is the article notification ledger — which articles have
 * been announced to subscribers, written by the admin route and read by
 * nothing else. It is a handful of rows and a few queries a month.
 *
 * **The corpus is not here any more.** The 1.6 GB hadith and rijāl corpus is
 * published as a static, versioned SQLite file and read in the reader's
 * browser over HTTP range requests; see src/lib/corpus-client.ts and
 * docs/static-corpus.md. Nothing under /hadith or /narrators imports this
 * module, and nothing should start: a page that needs corpus data has a
 * client-side path to it, and adding a query here would put a metered database
 * back in front of public reads, which is the exact failure the migration
 * removed. See DATABASE.md for the history.
 *
 * `@tursodatabase/serverless` is the package Turso documents for Cloudflare
 * Workers: it speaks only `fetch`, with no native dependencies.
 *
 * This wraps it in D1's own call shape — `prepare(sql).bind(...).all()` and
 * `batch([...])` — which is the shape the remaining call sites were written
 * against. It keeps the backend swappable from one file.
 */

/**
 * Run one operation on a connection of its own, and close it afterwards.
 *
 * Both halves of that are load-bearing, and each was learned by getting it
 * wrong.
 *
 * **Why not one connection cached per isolate.** `Connection` owns an
 * `AsyncLock` that serializes operations on it, and module scope is shared by
 * every request an isolate handles. A promise queued by one request then gets
 * resolved inside a later one, and the runtime cancels the continuation —
 * "a promise was resolved or rejected from a different request context than
 * the one it was created in" — leaving the waiting request with no response at
 * all. Sequential traffic never shows it; two overlapping requests do.
 *
 * **Why it must be closed.** Every pipeline response carries a `baton`, which
 * is a stream the server holds open for that session. A connection per
 * operation that is never closed leaks one per query, and once enough are
 * outstanding Turso stops answering and the Worker hangs instead — which is
 * strictly worse than the problem it was meant to fix. `close()` is a single
 * request, about 50 ms, and it is only sent when a baton was actually issued.
 *
 * So the cost of correctness here is one extra round trip per operation. That
 * is also why `batch()` matters more than it looks: a page that asks four
 * questions in one batch pays this once, not four times.
 */
const withConnection = async <T>(run: (conn: Connection) => Promise<T>): Promise<T> => {
  const url = env?.TURSO_DATABASE_URL || (typeof process !== 'undefined' ? process.env?.TURSO_DATABASE_URL : undefined);
  if (!url) throw new Error('TURSO_DATABASE_URL is not set');
  const authToken = env?.TURSO_AUTH_TOKEN || (typeof process !== 'undefined' ? process.env?.TURSO_AUTH_TOKEN : undefined);
  const conn = connect({ url, authToken });
  try {
    return await run(conn);
  } finally {
    // Never allowed to mask the query's own error, and never worth failing a
    // rendered page over: an unclosed stream expires on the server by itself.
    await conn.close().catch(() => {});
  }
};

/** D1's `all()` envelope, so callers keep reading `.results`. */
export interface QueryResult<T = Record<string, unknown>> {
  results: T[];
  success: true;
}

/**
 * A prepared statement — SQL plus its arguments and nothing else.
 *
 * Deliberately not the SDK's `prepare()`, which is async and costs a round
 * trip. Holding the pair lets `batch()` take statements unexecuted, the way
 * D1's does, and sends each query in exactly one request.
 */
export class Statement {
  constructor(
    readonly sql: string,
    readonly args: unknown[] = []
  ) {}

  /** Positional `?` parameters, in order. Returns a new statement. */
  bind(...args: unknown[]): Statement {
    return new Statement(this.sql, args);
  }

  async all<T = Record<string, unknown>>(): Promise<QueryResult<T>> {
    const rows = await withConnection((conn) => conn.all(this.sql, ...this.args));
    return { results: rows as T[], success: true };
  }

  /** First row, or null when nothing matched — D1's contract, not `undefined`. */
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const row = await withConnection((conn) => conn.get(this.sql, ...this.args));
    return (row as T | undefined) ?? null;
  }

  async run(): Promise<QueryResult> {
    await withConnection((conn) => conn.run(this.sql, ...this.args));
    return { results: [], success: true };
  }
}

export const db = {
  prepare: (sql: string) => new Statement(sql),

  /**
   * Run several statements in one round trip, results in order.
   *
   * The round trip is the point on Turso: every query is an HTTPS call to
   * aws-us-east-1, so two questions asked separately cost twice the latency of
   * two asked together.
   *
   * `deferred` rather than `read` or `write` because the same helper carries
   * the read-only batches and the one that writes a notification; deferred
   * takes whichever lock the statements turn out to need. Like D1's `batch()`
   * this is one transaction — if a statement fails, none applied.
   */
  batch: async <T = Record<string, unknown>>(
    statements: Statement[]
  ): Promise<QueryResult<T>[]> => {
    const results = await withConnection((conn) =>
      conn.batch(
        statements.map((s) => ({ sql: s.sql, args: s.args })),
        'deferred'
      )
    );
    return (results as { rows: unknown[] }[]).map((r) => ({
      results: (r.rows || []) as T[],
      success: true
    }));
  }
};

