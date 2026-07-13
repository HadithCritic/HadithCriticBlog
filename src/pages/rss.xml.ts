import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('articles', ({ data }) => !data.draft && !data.preview))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: 'HadithCritic',
    description: 'Historical criticism, Quranic scholarship, and source-level analysis of hadith traditions.',
    site: context.site ?? 'https://hadithcriticblog.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blogs/${post.id}`,
      categories: [post.data.category, ...post.data.tags]
    }))
  });
};
