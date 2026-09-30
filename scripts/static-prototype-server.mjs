import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = path.join(root, 'dist-db/static-prototype');
const htmlPath = path.join(root, 'scripts/static-corpus-prototype.html');
const port = Number(process.env.STATIC_CORPUS_PROTOTYPE_PORT) || 4323;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"status":"ok"}');
    return;
  }
  if (req.method !== 'GET') {
    res.writeHead(405).end('GET only');
    return;
  }

  let target;
  if (url.pathname === '/' || url.pathname === '/index.html') target = htmlPath;
  else if (url.pathname.startsWith('/data/')) {
    const relative = decodeURIComponent(url.pathname.slice('/data/'.length));
    target = path.resolve(dataRoot, relative);
    if (!target.startsWith(`${dataRoot}${path.sep}`)) {
      res.writeHead(400).end('Invalid path');
      return;
    }
  } else {
    res.writeHead(404).end('Not found');
    return;
  }

  try {
    const body = await readFile(target);
    const compressed = target.endsWith('.gz');
    const contentType = target.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8';
    res.writeHead(200, {
      'Content-Type': contentType,
      ...(compressed ? { 'Content-Encoding': 'gzip' } : {}),
      'Cache-Control': compressed ? 'public, max-age=31536000, immutable' : 'no-store',
      'Content-Length': body.byteLength
    }).end(body);
    console.log(`${req.method} ${url.pathname} ${body.byteLength} bytes${compressed ? ' (gzip)' : ''}`);
  } catch {
    res.writeHead(404).end('Prototype data not found. Run npm run prototype:corpus first.');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Static corpus prototype: http://127.0.0.1:${port}/`);
  console.log('Generate its sample files with `npm run prototype:corpus`.');
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
