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
 */
export const GET: APIRoute = async () => {
  try {
    const [generations, grades, centuries, totals] = await db.batch([
      db.prepare(
        `SELECT generation AS value, COUNT(*) AS n FROM narrator
          WHERE unnamed = 0 AND generation <> '' GROUP BY generation ORDER BY n DESC`
      ),
      db.prepare(
        `SELECT grade AS value, COUNT(*) AS n FROM narrator
          WHERE unnamed = 0 AND grade <> '' GROUP BY grade ORDER BY n DESC`
      ),
      db.prepare(
        `SELECT ((death_hijri - 1) / 100) + 1 AS value, COUNT(*) AS n FROM narrator
          WHERE unnamed = 0 AND death_hijri IS NOT NULL GROUP BY value ORDER BY value`
      ),
      db.prepare(
        `SELECT COUNT(*) AS all_narrators,
                SUM(CASE WHEN critic_count > 0 THEN 1 ELSE 0 END) AS graded,
                SUM(CASE WHEN death_hijri IS NOT NULL THEN 1 ELSE 0 END) AS dated
           FROM narrator WHERE unnamed = 0`
      )
    ]);

    return new Response(
      JSON.stringify({
        generations: generations.results,
        grades: grades.results,
        centuries: centuries.results,
        totals: totals.results?.[0] ?? {}
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
