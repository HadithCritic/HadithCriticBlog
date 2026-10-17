/**
 * Which immutable Quran releases the site can actually reach.
 *
 * Every pipeline run publishes a complete release, and older releases stay on
 * disk for provenance. Shipping all of them put every historical snapshot into
 * each deployment. A release is reachable when site code or a public file names
 * it (directly or through a constant), or when a reachable release's own files
 * point into it. `previousRelease` in release.json and the release notes record
 * lineage only and are not followed, or every release ever published would
 * count as reachable.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '.astro', '.cjs', '.css', '.html', '.js', '.json', '.md', '.mdx',
  '.mjs', '.ts', '.tsx', '.txt', '.xml', '.yaml', '.yml'
]);

/** Host configuration files with no extension that can still name a release path. */
const TEXT_FILENAMES = new Set(['_headers', '_redirects']);

const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git']);

/** Prose provenance inside a release; each one names the release before it. */
const LINEAGE_FILES = new Set(['release-notes.md']);

/** Published release ids. Staging trees start with a dot and are never shipped. */
export function listReleaseIds(releasesRoot) {
  let entries;
  try {
    entries = readdirSync(releasesRoot, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
}

function isText(name) {
  return TEXT_FILENAMES.has(name) || TEXT_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function* textFiles(directory, skip) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name) || skip.has(path.resolve(child))) continue;
      yield* textFiles(child, skip);
    } else if (entry.isFile() && isText(entry.name)) {
      yield child;
    }
  }
}

function idMatcher(ids) {
  const escaped = [...ids]
    .sort((a, b) => b.length - a.length)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Bounded on both sides so v0.5.2-cc-x never matches inside v0.5.20-cc-x. A
  // trailing period continues an id only when more id characters follow it, so
  // an id that ends a sentence still counts.
  return new RegExp(`(?<![\\w.-])(?:${escaped.join('|')})(?![\\w-]|\\.[\\w-])`, 'g');
}

function releaseFileText(file) {
  const text = readFileSync(file, 'utf8');
  if (path.basename(file) !== 'release.json') return text;
  try {
    const { previousRelease: _lineage, ...manifest } = JSON.parse(text);
    return JSON.stringify(manifest);
  } catch {
    return text;
  }
}

/**
 * @param {object} options
 * @param {string} options.releasesRoot  public/data/quran/releases
 * @param {string[]} options.roots       Trees whose text files can name a release.
 * @returns {Set<string>} Reachable release ids.
 */
export function referencedReleases({ releasesRoot, roots }) {
  const ids = listReleaseIds(releasesRoot);
  const reachable = new Set();
  if (ids.length === 0) return reachable;

  const matcher = idMatcher(ids);
  const collect = (text, queue) => {
    for (const [id] of text.matchAll(matcher)) {
      if (!reachable.has(id)) {
        reachable.add(id);
        queue?.push(id);
      }
    }
  };

  const skip = new Set([path.resolve(releasesRoot)]);
  for (const root of roots) {
    for (const file of textFiles(root, skip)) collect(readFileSync(file, 'utf8'));
  }

  const queue = [...reachable];
  while (queue.length > 0) {
    const releaseDirectory = path.join(releasesRoot, queue.pop());
    for (const file of textFiles(releaseDirectory, new Set())) {
      if (LINEAGE_FILES.has(path.basename(file))) continue;
      collect(releaseFileText(file), queue);
    }
  }
  return reachable;
}
