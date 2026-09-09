export const prerender = false;

import type { APIRoute } from 'astro';
import { db } from '../../lib/db';

/**
 * Filter options for the narrator register, with counts.
 *
 * The old browse page derived these by iterating the 5.2 MB index in the
 * browser on every load. They are properties of the dataset, not of the current
 * query, so they change only when the register is reseeded — hence the long
 * cache lifetime.
 *
 * Read from the stored tables rather than aggregated per call. These four
 * aggregates scanned all 20,915 named narrators every time, about 84,000 rows
 * for an answer that is identical between reseeds, and the `max-age` only ever
 * spared a repeat visit from the same browser. Refreshed by
 * scripts/refresh-stats.mjs.
 */
export const GET: APIRoute = async () => {
  try {
    const [facets, stored] = await db.batch([
      db.prepare('SELECT kind, value, n FROM narrator_facet ORDER BY kind, ord'),
      db.prepare(
        `SELECT key, value FROM corpus_stat
          WHERE key IN ('narrator_named', 'narrator_graded', 'narrator_dated')`
      )
    ]);

    const chips = (facets.results || []) as unknown as { kind: string; value: string; n: number }[];
    const of = (kind: string, cast: (v: string) => string | number = (v) => v) =>
      chips.filter((c) => c.kind === kind).map((c) => ({ value: cast(c.value), n: Number(c.n) }));

    const totals = new Map(
      (stored.results as { key: string; value: number }[] | undefined)?.map((r) => [
        r.key,
        Number(r.value)
      ]) || []
    );

    return new Response(
      JSON.stringify({
        generations: of('generation'),
        grades: of('grade'),
        // Numeric in the old response, and the client compares it as a number.
        centuries: of('century', Number),
        totals: {
          all_narrators: totals.get('narrator_named') ?? 0,
          graded: totals.get('narrator_graded') ?? 0,
          dated: totals.get('narrator_dated') ?? 0
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400'
        }
      }
    );
  } catch (error) {
    console.error('Narrator facets failed', error);
    return new Response(JSON.stringify({ error: 'Narrator facets failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
};
