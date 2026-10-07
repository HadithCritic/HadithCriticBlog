import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Turn the host's temporary trailing-slash redirect into a permanent one.
 *
 * Every prerendered page is written as <path>/index.html, and Cloudflare's
 * static assets answer a request for <path> with a 307 to <path>/. A 307 tells
 * a search engine the move is temporary, so the slashless URL keeps competing
 * with the real one instead of consolidating into it. Nothing in the asset
 * configuration changes that status.
 *
 * `_redirects` is applied before that normalization, so a rule per page
 * (`/academia /academia/ 301`) wins. A splat cannot do it: `/blogs/*
 * /blogs/:splat/ 301` also matches the slashed URL and redirects it to itself.
 * Both were checked against `astro preview`, which runs the same asset
 * handling as production.
 *
 * Cloudflare allows 2,000 static rules and 100 dynamic ones. One exact rule
 * per page fit while the site had about 540 pages; the prerendered collection
 * and Qur'an pages took it to 2,400, and the deploy was refused. Pages that
 * share a shape are now covered by one placeholder rule per family, such as
 * `/hadith/collection/:a/:b/:c /hadith/collection/:a/:b/:c/ 301`. Cloudflare
 * compiles each placeholder to `[^/]+` anchored at both ends, so the rule
 * matches only the slashless URL and never the slashed one.
 *
 * Redirects run before the Worker and before asset lookup, so a family keeps
 * exact rules when its pattern would also match any other file in the output
 * or any on-demand route. Small families keep exact rules too. The limits are
 * checked here, so an overflow fails the build instead of the deploy.
 */

const MAX_STATIC_RULES = 2000;
const MAX_DYNAMIC_RULES = 100;
/** Families smaller than this keep one exact rule per page. */
const MIN_FAMILY_SIZE = 5;
/** Leading segments kept literal in a family pattern. */
const LITERAL_SEGMENTS = 2;
/** Deepest path probed when an on-demand route has a rest parameter. */
const MAX_PROBE_DEPTH = 8;

const PLACEHOLDER_NAMES = 'abcdefghijklmnopqrstuvwxyz';

/** A line in `_redirects` is dynamic when its source has a splat or placeholder. */
const isDynamicSource = (source) => source.includes('*') || /:[A-Za-z]/.test(source);

/** The same regular expression Cloudflare builds for a path-only source. */
function sourceRegExp(source) {
  const escaped = source
    .split('*')
    .map((part) => part.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('(?<splat>.*)');
  return new RegExp('^' + escaped.replace(/:([A-Za-z]\w*)/g, '(?<$1>[^/]+)') + '$');
}

/** Paths an on-demand route answers, with each parameter filled by a probe. */
function probePaths(route) {
  let paths = [''];
  for (const segment of route.segments) {
    if (segment.some((part) => part.spread)) {
      const next = [];
      for (const prefix of paths) {
        for (let depth = 0; depth <= MAX_PROBE_DEPTH; depth += 1) {
          next.push(prefix + '/probe'.repeat(depth));
        }
      }
      paths = next;
    } else {
      const text = segment.map((part) => (part.dynamic ? 'probe' : part.content)).join('');
      paths = paths.map((prefix) => `${prefix}/${text}`);
    }
  }
  return paths.map((probe) => probe || '/');
}

function familyKey(page) {
  const segments = page.slice(1).split('/');
  const literal = Math.min(LITERAL_SEGMENTS, segments.length - 1);
  const placeholders = segments
    .slice(literal)
    .map((_, index) => `:${PLACEHOLDER_NAMES[index]}`);
  return '/' + [...segments.slice(0, literal).map(encodeURI), ...placeholders].join('/');
}

export function slashRedirects() {
  let onDemandProbes = [];

  return {
    name: 'hadithcritic:slash-redirects',
    hooks: {
      'astro:routes:resolved': ({ routes }) => {
        onDemandProbes = routes
          .filter((route) => !route.isPrerendered)
          .flatMap((route) => probePaths(route).map((probe) => ({ probe, route: route.pattern })));
      },
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = [];
        const otherFiles = [];

        const walk = (folder) => {
          for (const name of readdirSync(folder)) {
            const full = path.join(folder, name);
            const url = '/' + path.relative(root, full).split(path.sep).join('/');
            if (statSync(full).isDirectory()) walk(full);
            else if (name === 'index.html' && folder !== root) pages.push(path.posix.dirname(url));
            else otherFiles.push(encodeURI(url));
          }
        };
        walk(root);

        const families = new Map();
        for (const page of pages.sort()) {
          const key = familyKey(page);
          if (!families.has(key)) families.set(key, []);
          families.get(key).push(page);
        }

        const redirectsPath = path.join(root, '_redirects');
        let existing = '';
        try {
          existing = readFileSync(redirectsPath, 'utf8');
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
        const lines = existing.split(/\r?\n/);
        const sources = lines
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith('#'))
          .map((line) => line.split(/\s+/)[0]);
        // Cloudflare rejects a repeated source, so a page already covered by a
        // hand-written rule gets no generated one.
        const existingSources = new Set(sources);

        const staticRules = [];
        const dynamicRules = [];
        for (const [pattern, members] of families) {
          const regExp = sourceRegExp(pattern);
          // A pattern needs a literal first segment; `/:a` would catch every
          // top-level file the build or Pagefind writes later.
          const collidesWith = pattern.startsWith('/:') ? 'every top-level path'
            : otherFiles.find((file) => regExp.test(file))
              ?? onDemandProbes.find(({ probe }) => regExp.test(probe))?.route;
          if (members.length >= MIN_FAMILY_SIZE && !collidesWith) {
            dynamicRules.push(`${pattern} ${pattern}/ 301`);
          } else {
            if (members.length >= MIN_FAMILY_SIZE) {
              logger.info(`Kept ${members.length} exact rules for ${pattern}: the pattern also matches ${collidesWith}`);
            }
            for (const page of members) {
              if (!existingSources.has(encodeURI(page))) staticRules.push(`${encodeURI(page)} ${encodeURI(page)}/ 301`);
            }
          }
        }

        // Cloudflare counts every line after the first dynamic rule as dynamic,
        // so the generated static rules go before any dynamic rule already in
        // the file and the generated dynamic rules go last.
        const firstDynamic = lines.findIndex((line) => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('#') && isDynamicSource(trimmed.split(/\s+/)[0]);
        });
        const splitAt = firstDynamic === -1 ? lines.length : firstDynamic;

        const staticCount = sources.filter((source) => !isDynamicSource(source)).length + staticRules.length;
        const dynamicCount = sources.filter(isDynamicSource).length + dynamicRules.length;
        if (staticCount > MAX_STATIC_RULES || dynamicCount > MAX_DYNAMIC_RULES) {
          throw new Error(
            `_redirects would hold ${staticCount} static rules (limit ${MAX_STATIC_RULES}) and ` +
            `${dynamicCount} dynamic rules (limit ${MAX_DYNAMIC_RULES}); Cloudflare would refuse the deploy.`
          );
        }

        const header = '# Generated by scripts/lib/slash-redirects.mjs: 301 each page to its trailing-slash URL.';
        const output = [
          ...lines.slice(0, splitAt),
          '',
          `${header} Exact rules.`,
          ...staticRules,
          ...lines.slice(splitAt),
          '',
          `${header} One rule per family of same-shape pages.`,
          ...dynamicRules,
          ''
        ];
        writeFileSync(redirectsPath, output.join('\n'));
        logger.info(
          `Covered ${pages.length} pages with ${staticRules.length} exact and ${dynamicRules.length} family ` +
          `redirects; _redirects holds ${staticCount}/${MAX_STATIC_RULES} static and ` +
          `${dynamicCount}/${MAX_DYNAMIC_RULES} dynamic rules`
        );
      }
    }
  };
}
