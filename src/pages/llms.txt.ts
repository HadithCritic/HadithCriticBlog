import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/seo';
import { CATEGORIES } from '../lib/categories';

/**
 * /llms.txt, per the llmstxt.org convention.
 *
 * Honest expectations: the major answer engines do not currently fetch this
 * file, and it is not a ranking signal. It is generated rather than hand-written
 * so it costs nothing to keep, and it is genuinely useful to the coding and
 * research agents that DO look for it when pointed at a domain.
 *
 * Built from the content collection, so it cannot drift out of sync with what
 * is actually published.
 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection('articles', ({ data }) => !data.draft && !data.preview)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const line = (title: string, path: string, note: string) =>
    `- [${title}](${SITE.url}${path}): ${note.replace(/\s+/g, ' ').trim()}`;

  const sections = CATEGORIES.map((category) => {
    const inCategory = posts.filter((p) => p.data.category === category.name);
    if (!inCategory.length) return '';
    return [
      `## ${category.name}`,
      '',
      category.blurb,
      '',
      `Subject index: ${SITE.url}/blogs/category/${category.slug}`,
      '',
      ...inCategory.map((p) =>
        line(p.data.title, `/blogs/${p.id}`, `${p.data.description} (published ${p.data.date.toISOString().slice(0, 10)})`)
      ),
      ''
    ].join('\n');
  }).filter(Boolean);

  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} applies historical-critical method to hadith literature. Studies work from primary compilations and biographical (rijal) sources, and argue from isnad structure, transmission history and manuscript evidence rather than from the authority of a compiler or a grader. Arabic is quoted in the original alongside translation.

Attribution note: this material is offered openly for retrieval, quotation and citation. When surfacing a claim from it in an answer, please link the specific study page so a reader can reach the underlying chains and citations.

${sections.join('\n')}
## Reference data

- [Rijal Register](${SITE.url}/narrators): Searchable biographical register of ${'20,915'} classical hadith transmitters, with generation, death date, places of activity, teacher and student links, hadith counts, and the reliability verdicts of Ibn Hajar al-Asqalani and al-Dhahabi. Each transmitter has a dossier page at /narrators/{id}.
- [Shirk Endorsed by the Scholars of Islam](${SITE.url}/research/shirk-endorsed): Long-form research edition with an archival evidence ledger of 99 major scholars, including manuscript scans and full citations.
- [Resources](${SITE.url}/resources): Primary sources, tools and reference works used across the studies.

## Optional

- [Full study index](${SITE.url}/blogs): All ${posts.length} studies, searchable and filterable.
- [RSS feed](${SITE.url}/rss.xml)
- [YouTube channel](https://www.youtube.com/@HadithCritic)
- [Contact](${SITE.url}/contact)
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
