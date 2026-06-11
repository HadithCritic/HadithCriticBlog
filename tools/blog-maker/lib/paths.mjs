import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const libDir = path.dirname(fileURLToPath(import.meta.url));

export const DEFAULT_PROJECT_ROOT = path.resolve(libDir, '../../..');

export function getProjectPaths(root = DEFAULT_PROJECT_ROOT) {
  const projectRoot = path.resolve(root);
  const blogMakerRoot = path.join(projectRoot, '.blog-maker');

  return {
    projectRoot,
    blogMakerRoot,
    draftsDir: path.join(blogMakerRoot, 'drafts'),
    uploadsDir: path.join(blogMakerRoot, 'uploads'),
    articlesDir: path.join(projectRoot, 'src', 'content', 'articles'),
    publicImagesDir: path.join(projectRoot, 'public', 'images'),
  };
}

export async function ensureBlogMakerDirs(paths) {
  await Promise.all([
    fs.mkdir(paths.draftsDir, { recursive: true }),
    fs.mkdir(paths.uploadsDir, { recursive: true }),
    fs.mkdir(paths.articlesDir, { recursive: true }),
    fs.mkdir(paths.publicImagesDir, { recursive: true }),
  ]);
}

export function assertInside(baseDir, targetPath) {
  const base = path.resolve(baseDir);
  const target = path.resolve(targetPath);
  const relative = path.relative(base, target);

  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return target;
  }

  throw new Error(`Refusing to access path outside ${base}`);
}

export function safeJoin(baseDir, ...segments) {
  return assertInside(baseDir, path.join(baseDir, ...segments));
}

