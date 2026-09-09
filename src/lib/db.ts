import { connect, type Connection } from '@tursodatabase/serverless';
import { env } from 'cloudflare:workers';

/**
 * The corpus database, on Turso.
 *
 * Why not D1: the corpus is 1.74 GB and D1 allows 500 MB per database on the
 * free plan, which refused writes outright and left the FTS index rebuild
 * stuck. Turso's free plan allows 5 GB and 500M row reads a month. See
 * DATABASE.md.
 *
 * `@tursodatabase/serverless` is the package Turso documents for Cloudflare
 * Workers: it speaks only `fetch`, with no native dependencies. The older
 * `@libsql/client` also works, but Turso now points new code here, and its
 * WebSocket transports are the ones being retired.
 *
 * This wraps it in D1's own call shape — `prepare(sql).bind(...).all()` and
 * `batch([...])` — rather than rewriting forty-eight call sites. That is a
 * deliberate trade. The interface is not better than the SDK's; it is the one
 * the pages are already written against, and a mechanical port of that many
 * queries is where a transcription bug hides. The shim is small enough to read
 * in one sitting, and it keeps the backend swappable from one file.
 *
 * What the move costs: Turso's embedded replicas need a filesystem and a
 * long-lived process, so they are unavailable on Workers. Every query is an
 * HTTPS round trip to aws-us-east-1 instead of a call inside Cloudflare's
 * network. That is why the row-read budgeting in src/lib/corpus-count.ts and
 * the edge cache in src/lib/edge-cache.ts matter more here than they did on
 * D1, not less: they now save latency as well as quota.
 */

/**
 * A connection per operation, deliberately not one cached per isolate.
 *
 * Caching one looks obviously right — the connection holds no socket, it is an
 * HTTP caller — and it is wrong. `Connection` owns an `AsyncLock` that
 * serializes operations on it, and module scope is shared by every request an
 * isolate handles. So a promise queued by one request gets resolved inside a
 * later one, and the Workers runtime cancels the continuation:
 *
 *   A promise was resolved or rejected from a different request context than
 *   the one it was created in ... Continuations for that request are unlikely
 *   to run safely and have been canceled.
 *
 * The request waiting on that lock then never gets a response — it hangs until
 * the runtime kills it. Sequential requests never show it, which is exactly
 * what makes it worth a comment: it appears under concurrency, as an
 * intermittent hang rather than an error.
 *
 * `connect()` performs no I/O, so a fresh one costs an object. With one
 * operation per connection the lock has nothing to queue, and nothing crosses
 * a request boundary. Interactive transactions would need a persistent
 * connection; nothing here uses them — `batch()` is one request that is
 * already atomic.
 */
const getConnection = (): Connection => {
  const url = env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is not set');
  return connect({ url, authToken: env.TURSO_AUTH_TOKEN });
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
    const rows = await getConnection().all(this.sql, ...this.args);
    return { results: rows as T[], success: true };
  }

  /** First row, or null when nothing matched — D1's contract, not `undefined`. */
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const row = await getConnection().get(this.sql, ...this.args);
    return (row as T | undefined) ?? null;
  }

  async run(): Promise<QueryResult> {
    await getConnection().run(this.sql, ...this.args);
    return { results: [], success: true };
  }
}

export const db = {
  prepare: (sql: string) => new Statement(sql),

  /**
   * Run several statements in one round trip, results in order.
   *
   * That round trip is the point on Turso: the narration page asks four
   * questions at once, and four separate requests to aws-us-east-1 would be
   * four times the latency.
   *
   * `deferred` rather than `read` or `write` because the same helper carries
   * the read-only page batches and the one that writes a notification;
   * deferred takes whichever lock the statements turn out to need. Like D1's
   * `batch()` this is one transaction — if a statement fails, none applied.
   */
  batch: async <T = Record<string, unknown>>(
    statements: Statement[]
  ): Promise<QueryResult<T>[]> => {
    const results = await getConnection().batch(
      statements.map((s) => ({ sql: s.sql, args: s.args })),
      'deferred'
    );
    return (results as { rows: unknown[] }[]).map((r) => ({
      results: (r.rows || []) as T[],
      success: true
    }));
  }
};
