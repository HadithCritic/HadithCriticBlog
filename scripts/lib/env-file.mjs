import { readFileSync } from 'node:fs';

/**
 * Read a value from the environment, falling back to a dotenv-style file.
 *
 * The migration scripts need credentials for two different services, and
 * neither file they live in is committed: Turso's are in `.dev.vars` beside
 * the Worker's, and Cloudflare's are in `../.env.local`, outside the repo.
 *
 * Cloudflare's matter because `wrangler d1 export` otherwise relies on an
 * interactive OAuth session, and that session expires — mid-migration, in
 * practice, which is how this helper came to exist. `CLOUDFLARE_API_TOKEN`
 * and `CLOUDFLARE_ACCOUNT_ID` let wrangler run unattended.
 */
export const fromEnvFile = (name, files) => {
  if (process.env[name]) return process.env[name];
  for (const file of files) {
    try {
      for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
        if (line.trimStart().startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq > 0 && line.slice(0, eq).trim() === name) {
          return line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // Try the next location.
    }
  }
  return undefined;
};

/** Where each project secret is looked for, in order. */
export const TURSO_FILES = ['.dev.vars', '../.env.local', '.env.local'];
export const CLOUDFLARE_FILES = ['../.env.local', '.env.local', '.dev.vars'];
