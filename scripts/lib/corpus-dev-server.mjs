/**
 * Serve the built corpus to `astro dev`, with real HTTP range support.
 *
 * The corpus is 1.6 GB. Putting it in `public/` would work, and would then be
 * copied into `dist/` on every single build, so it lives in `dist-db/builds/`
 * and is published to the deploy output by scripts/publish-corpus.mjs instead.
 * This plugin is what makes `/data/corpus/...` resolve during development, from
 * exactly the bytes that will be published.
 *
 * The range handling itself is in ./corpus-range.mjs, shared with the
 * standalone server the end-to-end tests use, because a second implementation
 * of byte serving is a second chance to get it subtly wrong.
 */

import { BUILDS_DIR } from './corpus-dist.mjs';
import { serveCorpusFile } from './corpus-range.mjs';

export function corpusDevServer() {
  return {
    name: 'hadithcritic:corpus-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!serveCorpusFile(BUILDS_DIR, req, res)) next();
      });
    }
  };
}
