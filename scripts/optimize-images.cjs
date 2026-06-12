/*
  Convert heavyweight PNG assets to WebP.
  - blog_thumbnails: max 1200px wide, q78
  - book_covers:     max 700px wide,  q80
  - hero/banner art: max 2000px wide, q80
  Writes .webp next to the original. Originals are removed afterwards by the caller
  once references are updated.

  Run: node scripts/optimize-images.cjs
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUB = path.join(__dirname, '..', 'public');

const TARGETS = [
  { dir: 'images/blog_thumbnails', width: 1200, quality: 78 },
  { dir: 'images/book_covers', width: 700, quality: 80 },
  { dir: 'images', width: 2000, quality: 80, only: ['asset1.png', 'asset2.png', 'HC.png'] },
  { dir: '.', width: 2000, quality: 78, only: ['footerasset.png'] }
];

(async () => {
  let before = 0;
  let after = 0;
  for (const t of TARGETS) {
    const dir = path.join(PUB, t.dir);
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith('.png'))
      .filter((f) => !t.only || t.only.includes(f));
    for (const f of files) {
      const src = path.join(dir, f);
      const out = src.replace(/\.png$/i, '.webp');
      const stat = fs.statSync(src);
      before += stat.size;
      await sharp(src)
        .resize({ width: t.width, withoutEnlargement: true })
        .webp({ quality: t.quality })
        .toFile(out);
      const outStat = fs.statSync(out);
      after += outStat.size;
      console.log(
        path.join(t.dir, f).padEnd(52),
        (stat.size / 1024 / 1024).toFixed(2) + 'MB ->',
        (outStat.size / 1024).toFixed(0) + 'KB'
      );
    }
  }
  console.log(
    'total:',
    (before / 1024 / 1024).toFixed(1) + 'MB ->',
    (after / 1024 / 1024).toFixed(1) + 'MB'
  );
})();
