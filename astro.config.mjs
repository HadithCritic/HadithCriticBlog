// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import { rehypeTableWrap } from './src/lib/rehype-table-wrap.mjs';
import { corpusDevServer } from './scripts/lib/corpus-dev-server.mjs';
import { slashRedirects } from './scripts/lib/slash-redirects.mjs';

const useRemoteBindings = process.env.CF_REMOTE_BINDINGS === 'true';

/** Where Vite's dependency scanner looks for imports, in every environment. */
const DEP_SCAN_ENTRIES = ['src/**/*.{astro,ts,tsx,js,mjs}'];

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
  // Production builds use a manifest-filtered public asset staging tree so
  // unlisted files in immutable Quran releases cannot leak into the deploy.
  // Dev remains pointed at the normal public/ directory.
  publicDir: process.env.ASTRO_PUBLIC_DIR || './public',
  server: {
    host: true
  },
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
    }),
    slashRedirects()
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeTableWrap]
    })
  },
  vite: {
    // Large research JSON needs only default imports. This pair also enables
    // Vite's SSR JSON fast path, avoiding a JavaScript AST for every data field.
    json: { stringify: true, namedExports: false },
    // The 1.6 GB static corpus is not in public/, because publicDir is copied
    // wholesale into dist/ on every build. It happened once, by way of a
    // `--target public` publish that no longer exists, and produced a 1.7 GB
    // deploy of bytes the site reads from R2. In development the corpus is
    // served from dist-db/builds/ by this plugin, with the range support
    // sql.js-httpvfs requires; production reads it from R2. See
    // docs/static-corpus.md.
    plugins: [corpusDevServer()],
    optimizeDeps: {
      entries: DEP_SCAN_ENTRIES,
      exclude: ['astro:content']
    },
    // Astro gives its `astro` and `prerender` environments no scan entries, and
    // Vite's fallback is every **/*.html under the project root. The root holds
    // review builds (dist-*, scratch/) running to ~180,000 files, so the scan
    // outlived the module runner's 60s startup limit, the server died before it
    // wrote a dependency cache, and every start began the scan again. Pinning
    // the entries to src/ makes the scan proportional to the source.
    environments: {
      // The logger Astro injects is found only after the first request, which
      // re-bundled and reloaded mid-start. Foreground runs use the console
      // logger, the detached `astro dev` daemon the JSON one.
      ssr: { optimizeDeps: { include: ['astro/logger/console', 'astro/logger/json'] } },
      astro: { optimizeDeps: { entries: DEP_SCAN_ENTRIES } },
      prerender: { optimizeDeps: { entries: DEP_SCAN_ENTRIES } }
    },
    server: {
      // The same trees, kept out of the file watcher. public/data/quran is
      // 12,000 immutable release files that never change under a dev session.
      watch: {
        ignored: [
          '**/dist/**',
          '**/dist-*/**',
          '**/local-archive/**',
          '**/scratch/**',
          '**/output/**',
          '**/tmp/**',
          '**/test-results/**',
          '**/playwright-report/**',
          '**/.hallmark/**',
          '**/public/data/quran/**'
        ]
      }
    }
  }
});
