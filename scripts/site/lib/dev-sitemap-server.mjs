import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * @astrojs/sitemap writes its XML files at build time, so the local Astro
 * server otherwise answers the site's sitemap link with a 404. In dev, serve
 * the latest generated sitemap files and rewrite their canonical origin to
 * the local host. This plugin is serve-only and does not affect production.
 */
export function devSitemapServer() {
  return {
    name: 'hadithcritic-dev-sitemap',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        let pathname;
        try {
          pathname = new URL(request.url ?? '/', 'http://vite.local').pathname;
        } catch {
          next();
          return;
        }

        if (!/^\/sitemap-(?:index|0)\.xml$/.test(pathname)) {
          next();
          return;
        }

        try {
          const file = path.resolve(server.config.root, 'dist', 'client', pathname.slice(1));
          const xml = await readFile(file, 'utf8');
          const host = request.headers.host ?? '127.0.0.1:4321';
          const origin = `${request.socket.encrypted ? 'https' : 'http'}://${host}`;
          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/xml; charset=utf-8');
          response.setHeader('Cache-Control', 'no-store');
          response.end(xml.replaceAll('https://hadithcriticblog.com', origin));
        } catch {
          next();
        }
      });
    }
  };
}
