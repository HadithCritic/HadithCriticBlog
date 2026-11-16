/**
 * Writes the land outline behind the front page compiler map.
 *
 *   node scripts/site/build-home-map.mjs "<land-110m.json>"
 *
 * The input is Natural Earth's 1:110m land as TopoJSON (world-atlas 2.0.2,
 * land-110m.json, public domain). The script decodes it, cuts it to the frame
 * below, projects it, and
 * writes src/data/site/home-map.json: the frame, the drawing size and one SVG
 * path. The site reads only that file. src/lib/home-data-core.ts projects the
 * region points with the same frame, so points and coastline stay aligned.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const target = path.join(root, 'src/data/site/home-map.json');

/* Degrees of longitude and latitude shown (Egypt to Transoxiana, where every
   compiler in the corpus worked; widen it when a Maghribi or Andalusi
   collection arrives, or the build fails on that point), the latitude whose scale is kept
   true (equirectangular, so east-west is shortened by its cosine), and drawing
   units per degree of latitude. */
const FRAME = { lonMin: 24, lonMax: 70, latMin: 12, latMax: 42, lat0: 32, scale: 14 };

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/site/build-home-map.mjs "<land-110m.json>"');
  process.exit(1);
}

const topology = JSON.parse(fs.readFileSync(source, 'utf8'));
if (topology.type !== 'Topology' || !topology.objects?.land || !topology.transform) {
  throw new Error(`${source} is not a quantized TopoJSON topology with a "land" object.`);
}

/* Arcs are quantized and delta-encoded; turn each into [lon, lat] points. */
const { scale: [kx, ky], translate: [tx, ty] } = topology.transform;
const arcs = topology.arcs.map((arc) => {
  let x = 0;
  let y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * kx + tx, y * ky + ty];
  });
});

/* A ring is a list of arc indexes; ~i is arc i reversed. Each arc after the
   first repeats the last point of the one before, so that point is dropped. */
function ringPoints(indexes) {
  return indexes.flatMap((index, n) => {
    const points = index >= 0 ? arcs[index] : [...arcs[~index]].reverse();
    return n === 0 ? points : points.slice(1);
  });
}

/* Sutherland-Hodgman against each side of the frame. */
function clip(ring) {
  const sides = [
    { inside: ([x]) => x >= FRAME.lonMin, cut: (a, b) => cutAt(a, b, 0, FRAME.lonMin) },
    { inside: ([x]) => x <= FRAME.lonMax, cut: (a, b) => cutAt(a, b, 0, FRAME.lonMax) },
    { inside: ([, y]) => y >= FRAME.latMin, cut: (a, b) => cutAt(a, b, 1, FRAME.latMin) },
    { inside: ([, y]) => y <= FRAME.latMax, cut: (a, b) => cutAt(a, b, 1, FRAME.latMax) },
  ];
  return sides.reduce((points, side) => {
    if (!points.length) return points;
    return points.flatMap((point, i) => {
      const previous = points[(i + points.length - 1) % points.length];
      const here = side.inside(point);
      const before = side.inside(previous);
      if (here && before) return [point];
      if (here) return [side.cut(previous, point), point];
      if (before) return [side.cut(previous, point)];
      return [];
    });
  }, ring);
}

function cutAt(a, b, axis, value) {
  const t = (value - a[axis]) / (b[axis] - a[axis]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

const kLon = Math.cos((FRAME.lat0 * Math.PI) / 180) * FRAME.scale;
const project = ([lon, lat]) => [(lon - FRAME.lonMin) * kLon, (FRAME.latMax - lat) * FRAME.scale];
const round = (value) => Math.round(value * 10) / 10;

/* Consecutive points that round to the same spot add nothing to the path. */
function toPath(ring) {
  const points = ring.map(project).map(([x, y]) => [round(x), round(y)]);
  const kept = points.filter((p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]);
  if (kept.length < 3) return '';
  return `M${kept.map(([x, y]) => `${x} ${y}`).join('L')}Z`;
}

const polygons = topology.objects.land.geometries.flatMap((geometry) => {
  if (geometry.type === 'Polygon') return [geometry.arcs];
  if (geometry.type === 'MultiPolygon') return geometry.arcs;
  return [];
});
const land = polygons
  .flatMap((rings) => rings.map((ring) => toPath(clip(ringPoints(ring)))))
  .filter(Boolean)
  .join('');

if (!land) throw new Error('No land fell inside the frame; check FRAME against the source.');

const output = {
  source: 'Natural Earth 1:110m land (world-atlas 2.0.2), public domain',
  frame: FRAME,
  width: round((FRAME.lonMax - FRAME.lonMin) * kLon),
  height: round((FRAME.latMax - FRAME.latMin) * FRAME.scale),
  land,
};
fs.writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, target)}: ${output.width} x ${output.height}, ${land.length} characters of path.`);
