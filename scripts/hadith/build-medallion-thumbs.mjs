/**
 * Writes a small copy of every compiler medallion for places that show many at
 * once (the front page band). The originals in public/images/hadith/medallions/
 * are 224px and stay the source; the copies go to medallions-128/ under the
 * same names. Files that are already newer than their original are skipped.
 *
 *   node scripts/hadith/build-medallion-thumbs.mjs
 *
 * Rerun after adding or replacing a medallion. src/lib/hadith-art.ts resolves
 * the copies and fails the build when one is missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = path.join(root, 'public/images/hadith/medallions');
const targetDir = path.join(root, 'public/images/hadith/medallions-128');
const SIZE = 128;

fs.mkdirSync(targetDir, { recursive: true });

const files = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.webp'));
let written = 0;
for (const name of files) {
  const source = path.join(sourceDir, name);
  const target = path.join(targetDir, name);
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) continue;
  await sharp(source).resize(SIZE, SIZE, { fit: 'cover' }).webp({ quality: 80 }).toFile(target);
  written += 1;
}

const orphans = fs.readdirSync(targetDir).filter((name) => !files.includes(name));
for (const name of orphans) fs.rmSync(path.join(targetDir, name));

console.log(`${files.length} medallions, ${written} copies written, ${orphans.length} stale copies removed.`);
