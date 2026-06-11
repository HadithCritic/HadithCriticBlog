import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import sharp from 'sharp';

import { ensureBlogMakerDirs, getProjectPaths, safeJoin } from './paths.mjs';
import { emptyDoc, GENERIC_THUMB, normalizeSlug, serializeDraftToMdx, slugify, validateDraft } from './serializer.mjs';

const DEFAULT_CATEGORIES = ['History', 'Prophecies', 'Theology', 'Philosophy', 'Blog'];
const IMAGE_LIMIT = '32mb';
const VALID_ID = /^[a-zA-Z0-9_-]+$/;

export function createApp(options = {}) {
  const paths = getProjectPaths(options.root);
  const apiOrigin = options.apiOrigin || 'http://127.0.0.1:8787';
  const astroOrigin = options.astroOrigin || 'http://127.0.0.1:4321';
  const editorOrigin = options.editorOrigin || 'http://127.0.0.1:5173';
  const app = express();
  const ready = ensureBlogMakerDirs(paths);

  app.use(express.json({ limit: IMAGE_LIMIT }));
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', editorOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  app.use('/api/uploads', async (req, res, next) => {
    await ready;
    express.static(paths.uploadsDir, {
      etag: false,
      lastModified: false,
      setHeaders(response) {
        response.setHeader('Cache-Control', 'no-store');
      },
    })(req, res, next);
  });

  app.get('/api/health', async (_req, res) => {
    await ready;
    res.json({ ok: true });
  });

  app.get('/api/config', async (_req, res) => {
    await ready;
    const categories = await readCategories(paths);
    res.json({
      categories,
      defaults: {
        author: 'HadithCritic',
        category: categories[0] || 'Blog',
        thumbnail: GENERIC_THUMB,
      },
      astroOrigin,
      apiOrigin,
    });
  });

  app.get('/api/drafts', async (_req, res) => {
    await ready;
    const drafts = await listDrafts(paths);
    res.json({ drafts: drafts.map(summarizeDraft) });
  });

  app.post('/api/drafts', async (req, res) => {
    await ready;
    const now = new Date().toISOString();
    const seed = req.body ?? {};
    const title = seed.meta?.title || 'Untitled Article';
    const draft = normalizeDraft({
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      meta: {
        title,
        slug: normalizeSlug(seed.meta?.slug || title),
        description: seed.meta?.description || '',
        date: seed.meta?.date || now,
        category: seed.meta?.category || 'Blog',
        tags: seed.meta?.tags || [],
        thumbnail: seed.meta?.thumbnail || GENERIC_THUMB,
        heroAlt: seed.meta?.heroAlt || '',
        readingTime: seed.meta?.readingTime || '10 min read',
        author: seed.meta?.author || 'HadithCritic',
      },
      content: seed.content || emptyDoc(),
    });

    await writeDraft(paths, draft);
    res.status(201).json({ draft });
  });

  app.get('/api/drafts/:id', async (req, res) => {
    await ready;
    const draft = await readDraft(paths, req.params.id);
    if (!draft) return res.sendStatus(404);
    return res.json({ draft });
  });

  app.put('/api/drafts/:id', async (req, res) => {
    await ready;
    const existing = await readDraft(paths, req.params.id);
    if (!existing) return res.sendStatus(404);

    const draft = normalizeDraft({
      ...existing,
      ...req.body,
      id: req.params.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      meta: {
        ...existing.meta,
        ...(req.body?.meta ?? {}),
      },
      content: req.body?.content ?? existing.content,
    });

    await writeDraft(paths, draft);
    return res.json({ draft });
  });

  app.delete('/api/drafts/:id', async (req, res) => {
    await ready;
    const id = assertDraftId(req.params.id);
    await fs.rm(draftFile(paths, id), { force: true });
    await fs.rm(safeJoin(paths.uploadsDir, id), { recursive: true, force: true });
    return res.json({ ok: true });
  });

  app.post('/api/drafts/:id/duplicate', async (req, res) => {
    await ready;
    const source = await readDraft(paths, req.params.id);
    if (!source) return res.sendStatus(404);

    const now = new Date().toISOString();
    const copy = normalizeDraft({
      ...source,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      meta: {
        ...source.meta,
        title: `${source.meta.title || 'Untitled Article'} Copy`,
        slug: await uniqueSlug(paths, `${source.meta.slug || source.meta.title || 'untitled'}-copy`),
      },
    });

    await writeDraft(paths, copy);
    return res.status(201).json({ draft: copy });
  });

  app.post('/api/drafts/:id/assets', async (req, res) => {
    await ready;
    const draft = await readDraft(paths, req.params.id);
    if (!draft) return res.sendStatus(404);

    const asset = await saveAsset(paths, req.params.id, req.body);
    return res.status(201).json({ asset });
  });

  app.post('/api/drafts/:id/preview', async (req, res) => {
    await ready;
    const draft = await readDraft(paths, req.params.id);
    if (!draft) return res.sendStatus(404);

    const validation = validateDraft(draft);
    if (!validation.ok) return res.status(400).json({ errors: validation.errors });

    const previewSlug = `_preview-${validation.slug}`;
    const serialized = serializeDraftToMdx(
      {
        ...draft,
        meta: {
          ...draft.meta,
          slug: previewSlug,
        },
      },
      {
        preview: true,
        draft: true,
        thumbnailResolver: (src) => resolvePreviewAsset(src, apiOrigin),
        assetResolver: (src) => resolvePreviewAsset(src, apiOrigin),
      }
    );

    const target = safeJoin(paths.articlesDir, `${previewSlug}.mdx`);
    await fs.writeFile(target, serialized.mdx, 'utf8');

    return res.json({
      slug: previewSlug,
      file: target,
      url: `${astroOrigin}/blogs/${previewSlug}`,
    });
  });

  app.post('/api/drafts/:id/publish', async (req, res) => {
    await ready;
    const draft = await readDraft(paths, req.params.id);
    if (!draft) return res.sendStatus(404);

    const validation = validateDraft(draft);
    if (!validation.ok) return res.status(400).json({ errors: validation.errors });

    const slug = validation.slug;
    const articlePath = safeJoin(paths.articlesDir, `${slug}.mdx`);
    const exists = await fileExists(articlePath);

    if (exists && !req.body?.overwrite) {
      return res.status(409).json({ errors: [`Article "${slug}" already exists.`] });
    }

    const publishDraft = await materializePublishedAssets(paths, draft, slug);
    publishDraft.meta.slug = slug;

    const serialized = serializeDraftToMdx(publishDraft);
    await fs.writeFile(articlePath, serialized.mdx, 'utf8');
    await fs.rm(safeJoin(paths.articlesDir, `_preview-${slug}.mdx`), { force: true });

    return res.json({
      slug,
      file: articlePath,
      url: `/blogs/${slug}`,
    });
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ errors: [error.message || 'Unexpected blog maker error.'] });
  });

  return app;
}

function normalizeDraft(draft) {
  const meta = draft.meta ?? {};
  return {
    id: assertDraftId(draft.id),
    createdAt: draft.createdAt || new Date().toISOString(),
    updatedAt: draft.updatedAt || new Date().toISOString(),
    meta: {
      title: meta.title || 'Untitled Article',
      slug: normalizeSlug(meta.slug || meta.title),
      description: meta.description || '',
      date: meta.date || new Date().toISOString(),
      category: meta.category || 'Blog',
      tags: Array.isArray(meta.tags)
        ? meta.tags
        : String(meta.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      thumbnail: meta.thumbnail || GENERIC_THUMB,
      heroAlt: meta.heroAlt || '',
      readingTime: meta.readingTime || '',
      author: meta.author || 'HadithCritic',
    },
    content: draft.content || emptyDoc(),
  };
}

function summarizeDraft(draft) {
  return {
    id: draft.id,
    title: draft.meta.title,
    slug: draft.meta.slug,
    category: draft.meta.category,
    updatedAt: draft.updatedAt,
    createdAt: draft.createdAt,
  };
}

function assertDraftId(id) {
  if (!VALID_ID.test(String(id || ''))) throw new Error('Invalid draft id.');
  return String(id);
}

function draftFile(paths, id) {
  return safeJoin(paths.draftsDir, `${assertDraftId(id)}.json`);
}

async function readDraft(paths, id) {
  try {
    const raw = await fs.readFile(draftFile(paths, id), 'utf8');
    return normalizeDraft(JSON.parse(raw));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeDraft(paths, draft) {
  await fs.writeFile(draftFile(paths, draft.id), `${JSON.stringify(normalizeDraft(draft), null, 2)}\n`, 'utf8');
}

async function listDrafts(paths) {
  const files = await fs.readdir(paths.draftsDir).catch(() => []);
  const drafts = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map((file) => readDraft(paths, path.basename(file, '.json')))
  );

  return drafts
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf());
}

async function readCategories(paths) {
  const found = new Set(DEFAULT_CATEGORIES);
  const files = await fs.readdir(paths.articlesDir).catch(() => []);

  await Promise.all(
    files
      .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
      .map(async (file) => {
        const raw = await fs.readFile(safeJoin(paths.articlesDir, file), 'utf8').catch(() => '');
        const match = raw.match(/^\s*category:\s*["']?([^"'\r\n]+)["']?/m);
        if (match?.[1]) found.add(match[1].trim());
      })
  );

  return [...found].sort((a, b) => a.localeCompare(b));
}

async function uniqueSlug(paths, seed) {
  const base = normalizeSlug(seed);
  let candidate = base;
  let index = 2;

  while (await fileExists(safeJoin(paths.articlesDir, `${candidate}.mdx`))) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

async function saveAsset(paths, draftId, body) {
  const id = assertDraftId(draftId);
  const match = String(body?.dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Upload must be a base64 data URL.');

  const mime = match[1];
  if (!mime.startsWith('image/')) throw new Error('Only image uploads are supported.');

  const buffer = Buffer.from(match[2], 'base64');
  const safeName = slugify(path.basename(body.fileName || 'image', path.extname(body.fileName || ''))) || 'image';
  const assetName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeName}.webp`;
  const uploadDir = safeJoin(paths.uploadsDir, id);
  const target = safeJoin(uploadDir, assetName);

  await fs.mkdir(uploadDir, { recursive: true });

  const pipeline = sharp(buffer).rotate();
  if (body.purpose === 'thumbnail') {
    pipeline.resize(1600, 900, { fit: 'cover' });
  } else {
    pipeline.resize({ width: 1600, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: 84 }).toFile(target);

  return {
    fileName: assetName,
    src: `/api/uploads/${id}/${assetName}`,
    originalName: body.fileName || 'image',
    purpose: body.purpose || 'image',
  };
}

function parseUploadSrc(src) {
  if (!src) return null;

  let pathname = String(src);
  try {
    if (/^https?:\/\//.test(pathname)) pathname = new URL(pathname).pathname;
  } catch {
    return null;
  }

  const marker = '/api/uploads/';
  if (!pathname.startsWith(marker)) return null;

  const segments = pathname.slice(marker.length).split('/').filter(Boolean);
  if (segments.length !== 2) return null;

  return {
    draftId: decodeURIComponent(segments[0]),
    fileName: decodeURIComponent(segments[1]),
  };
}

function resolvePreviewAsset(src, apiOrigin) {
  const upload = parseUploadSrc(src);
  if (!upload) return src;
  return `${apiOrigin}/api/uploads/${encodeURIComponent(upload.draftId)}/${encodeURIComponent(upload.fileName)}`;
}

async function materializePublishedAssets(paths, draft, slug) {
  const next = structuredClone(draft);
  const copied = new Map();

  const toPublicPath = async (src) => {
    const upload = parseUploadSrc(src);
    if (!upload) return src;
    if (upload.draftId !== draft.id) throw new Error('Cannot publish an upload from another draft.');
    if (copied.has(src)) return copied.get(src);

    const source = safeJoin(paths.uploadsDir, upload.draftId, upload.fileName);
    const targetDir = safeJoin(paths.publicImagesDir, 'blog-maker', slug);
    const target = safeJoin(targetDir, upload.fileName);
    const publicPath = `/images/blog-maker/${slug}/${upload.fileName}`;

    await fs.mkdir(targetDir, { recursive: true });
    await fs.copyFile(source, target);
    copied.set(src, publicPath);
    return publicPath;
  };

  next.meta.thumbnail = await toPublicPath(next.meta.thumbnail || GENERIC_THUMB);
  await replaceImageSources(next.content, toPublicPath);

  return next;
}

async function replaceImageSources(node, replacer) {
  if (!node) return;
  if (node.type === 'image' && node.attrs?.src) {
    node.attrs.src = await replacer(node.attrs.src);
  }

  for (const child of node.content ?? []) {
    await replaceImageSources(child, replacer);
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
