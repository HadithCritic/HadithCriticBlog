import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const articleCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    updated: z.date().optional(),
    author: z.string().default('HadithCritic'),
    tags: z.array(z.string()).default([]),
    category: z.string(),
    thumbnail: z.string().optional(),
    heroAlt: z.string().optional(),
    readingTime: z.string().optional(),
    draft: z.boolean().default(false),
    preview: z.boolean().default(false),
  }),
});

export const collections = {
  'articles': articleCollection,
};
