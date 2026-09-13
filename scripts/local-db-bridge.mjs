#!/usr/bin/env node
/**
 * Lightweight local SQLite bridge for dev mode.
 *
 * Runs on 127.0.0.1:4322 and answers queries against dist-db/silsilah.db.
 * Allows Astro dev server (which runs under workerd where node:sqlite is not
 * exposed) to query the full local SQLite database when Turso reads are
 * quota-limited or offline.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '..', 'dist-db', 'silsilah.db');

let db;
try {
  db = new DatabaseSync(DB_PATH, { open: true, readOnly: true });
  console.log(`[local-db-bridge] Connected to ${DB_PATH}`);
} catch (err) {
  console.error(`[local-db-bridge] Failed to open ${DB_PATH}:`, err.message);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/batch') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { statements } = JSON.parse(body);
        const results = statements.map((s) => {
          try {
            const rows = db.prepare(s.sql).all(...(s.args || []));
            return { results: rows || [] };
          } catch (qErr) {
            console.error('[local-db-bridge] Query error:', qErr.message, s.sql);
            return { results: [], error: qErr.message };
          }
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', db: DB_PATH }));
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = 4322;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[local-db-bridge] Listening on http://127.0.0.1:${PORT}`);
});
