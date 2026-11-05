// Measures where the drawing begins in each editorial engraving.
//
// The engravings were made to sit under text, so most carry a blank parchment
// band down their left side (20 to 35 percent of the width). The article
// header crops that band away, and needs to know how wide it is. A column
// counts as blank while its brightness barely varies from top to bottom.
//
// Writes src/data/blog-artwork-crop.json: { "<src>": <fraction of width> }.
// Run after adding artwork: node scripts/measure-artwork-crop.mjs
import fs from 'node:fs';
import sharp from 'sharp';
import { blogArtwork } from '../src/data/blog-artwork.ts';

const OUT = 'src/data/blog-artwork-crop.json';
const SAMPLE_WIDTH = 160;
const SAMPLE_HEIGHT = 107;
const BLANK_DEVIATION = 14;
/** The parchment fade runs a little past the first drawn column; crop past it. */
const INSET = 0.03;

async function drawingStart(file) {
  const { data } = await sharp(file)
    .greyscale()
    .resize(SAMPLE_WIDTH, SAMPLE_HEIGHT, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let x = 0; x < SAMPLE_WIDTH; x++) {
    const column = Array.from({ length: SAMPLE_HEIGHT }, (_, y) => data[y * SAMPLE_WIDTH + x]);
    const mean = column.reduce((sum, value) => sum + value, 0) / SAMPLE_HEIGHT;
    const deviation = Math.sqrt(column.reduce((sum, value) => sum + (value - mean) ** 2, 0) / SAMPLE_HEIGHT);
    if (deviation >= BLANK_DEVIATION) return x / SAMPLE_WIDTH;
  }
  return 0;
}

const sources = [...new Set(Object.values(blogArtwork).map((art) => art.src))].sort();
const crops = {};
for (const src of sources) {
  const file = `public${src}`;
  if (!fs.existsSync(file)) throw new Error(`Missing artwork file: ${file}`);
  const start = await drawingStart(file);
  crops[src] = start > 0 ? Number((start + INSET).toFixed(2)) : 0;
}

fs.writeFileSync(OUT, `${JSON.stringify(crops, null, 2)}\n`);
console.log(`Measured ${sources.length} engravings into ${OUT}`);
