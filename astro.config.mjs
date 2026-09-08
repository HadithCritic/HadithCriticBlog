// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import remarkGfm from 'remark-gfm';

const useRemoteBindings = process.env.CF_REMOTE_BINDINGS === 'true';

// https://astro.build/config
// Static by default (blog articles + Pagefind stay prerendered). Silsilah search/browse
// routes opt into on-demand rendering with `export const prerender = false` and read D1.
// remarkGfm is registered both on the mdx() integration and the shared markdown config:
// MDX's own compiler does not reliably inherit GFM tables/footnotes from the shared
// config alone, so it needs the plugin directly.
export default defineConfig({
  site: 'https://hadithcriticblog.com',
  adapter: cloudflare({
    configPath: './wrangler.jsonc',
    remoteBindings: useRemoteBindings,
    prerenderEnvironment: 'node'
  }),
  integrations: [
    mdx({ remarkPlugins: [remarkGfm] }),
    // Only prerendered routes reach this sitemap. The on-demand rijal register
    // is published separately via /sitemap-narrators.xml, which both are
    // declared in robots.txt.
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/narrators/compare') &&
        !page.includes('/api/')
    })
  ],
  markdown: {
    remarkPlugins: [remarkGfm]
  }
});
