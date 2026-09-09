import { readFileSync } from 'node:fs';
import { connect } from '@tursodatabase/serverless';

/**
 * The Turso connection the maintenance scripts share.
 *
 * The same SDK the Worker uses (src/lib/db.ts). It is `fetch`-only, which Node
 * has had since 18, so there is no reason to carry a second client library for
 * scripts and no risk of the two disagreeing about types or SQL.
 *
 * Credentials come from the environment first and `.dev.vars` second, so a
 * script runs the same way in CI and on a laptop with nothing exported. That
 * file is gitignored and holds the same two values the Worker gets from
 * `wrangler secret`.
 */
const fromDevVars = (name) => {
  try {
    for (const line of readFileSync('.dev.vars', 'utf8').split(/\r?\n/)) {
      const eq = line.indexOf('=');
      if (eq > 0 && line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
    }
  } catch {
    // No .dev.vars is fine as long as the environment carries the values.
  }
  return undefined;
};

const need = (name) => {
  const value = process.env[name] || fromDevVars(name);
  if (!value) {
    throw new Error(
      `${name} is not set. Export it, or put it in .dev.vars beside TURSO_DATABASE_URL.`
    );
  }
  return value;
};

export const tursoConnect = () =>
  connect({ url: need('TURSO_DATABASE_URL'), authToken: need('TURSO_AUTH_TOKEN') });

/** The host, for log lines that should say where they just wrote. */
export const tursoTarget = () => need('TURSO_DATABASE_URL').replace(/^libsql:\/\//, '');

/**
 * Split a .sql file into individual statements.
 *
 * Needed because the SDK rejects multi-statement SQL outright ("SQL string
 * contains more than one statement") and there is no `executeMultiple`. A
 * naive `split(';')` is wrong on these files: migration 0003 declares an FTS5
 * virtual table whose options are quoted strings, and every migration is
 * heavily commented, so a `;` inside a string or a `--` comment must not end a
 * statement. This tracks those three states and nothing else, which is all
 * SQLite's own dialect needs here.
 */
export function splitStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null; // "'" or '"' while inside a literal or quoted identifier
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      current += char;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        current += '*/';
        i += 1;
        continue;
      }
      current += char;
      continue;
    }
    if (quote) {
      current += char;
      // '' inside a literal is an escaped quote, not the end of one.
      if (char === quote && next === quote) {
        current += next;
        i += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }
    if (char === '-' && next === '-') {
      lineComment = true;
      current += '--';
      i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      current += '/*';
      i += 1;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === ';') {
      statements.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  statements.push(current);

  // Drop anything that is only whitespace and comments — a trailing block of
  // explanation is not a statement, and the SDK errors on an empty one.
  return statements
    .map((s) => s.trim())
    .filter((s) => s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim().length > 0);
}
