import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Read an optional ignored release asset while retaining its authored type. */
export function readQuranReleaseJson<T>(url: URL, fallback: T): T {
  const path = fileURLToPath(url);
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}
