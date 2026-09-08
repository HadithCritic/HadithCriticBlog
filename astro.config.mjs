// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import { rehypeTableWrap } from './src/lib/rehype-table-wrap.mjs';

const useRemoteBindings = process.env.CF_REMOTE_BINDINGS === 'true';

// https://astro.build/config
// Static by default (blog articles + Pagefind stay prerendered). Silsilah search/browse
// routes opt into on-demand rendering with `export const prerender = false` and read D1.
// GFM (tables, footnotes) is declared once, on `markdown.processor`. MDX inherits it
// from there, which is what replaced the old arrangement of passing remarkPlugins to
// both `mdx({...})` and `markdown`. `remarkPlugins` on the integration is deprecated
// and slated for removal, and duplicating it was only ever a workaround for MDX not
// picking up the shared config.
export default defineConfig({
  site: 'https://hadithcriticblog.com',
  adapter: cloudflare({
    configPath: './wrangler.jsonc',
    remoteBindings: useRemoteBindings,
    prerenderEnvironment: 'node'
  }),
  integrations: [
    mdx(),
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
    processor: unified({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeTableWrap]
    })
  }
});
