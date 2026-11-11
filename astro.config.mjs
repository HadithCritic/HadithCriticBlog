// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';
import { rehypeTableWrap } from './src/lib/rehype-table-wrap.mjs';
import { devSitemapServer } from './scripts/lib/dev-sitemap-server.mjs';
import { slashRedirects } from './scripts/lib/slash-redirects.mjs';

const useRemoteBindings = process.env.CF_REMOTE_BINDINGS === 'true';

/** Where Vite's dependency scanner looks for imports, in every environment. */
const DEP_SCAN_ENTRIES = ['src/**/*.{astro,ts,tsx,js,mjs}'];

// https://astro.build/config
// Static throughout; only the subscribe endpoint runs on demand.
// GFM (tables, footnotes) is declared once, on `markdown.processor`. MDX inherits it
// from there, which is what replaced the old arrangement of passing remarkPlugins to
// both `mdx({...})` and `markdown`. `remarkPlugins` on the integration is deprecated
// and slated for removal, and duplicating it was only ever a workaround for MDX not
// picking up the shared config.
export default defineConfig({
  site: 'https://hadithcriticblog.com',
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
    {
      name: 'hadithcritic:vite-cache-isolation',
      hooks: {
        'astro:config:setup': ({ command, updateConfig }) => {
          // A running dev server must not reuse optimized Astro runtime modules
          // rewritten by a production build or type check in another process.
          updateConfig({ vite: { cacheDir: command === 'dev'
            ? './node_modules/.vite-hc-dev'
            : './node_modules/.vite-hc-build' } });
        }
      }
    },
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/api/')
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
    plugins: [devSitemapServer()],
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
      // The same trees, kept out of the file watcher.
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
          '**/.hallmark/**'
        ]
      }
    }
  }
});
