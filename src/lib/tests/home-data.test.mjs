/**
 * The front page prints figures read from the site's data. These checks cover
 * the arithmetic it relies on, and that a missing or broken figure stops the
 * build instead of printing as zero or NaN.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clockTime, countBy, dodge, firstByKey, formatCount, excerpt, hijriYearStartCE, htmlText, latestByKey, median, ordinal, projectPoint, requireCount, sharesOf, sum, timeAxis } from '../home-data-core.ts';

test('formatCount groups thousands the way the site prints them', () => {
  assert.equal(formatCount(13684), '13,684');
  assert.equal(formatCount(0), '0');
});

test('requireCount passes whole, non-negative numbers through', () => {
  assert.equal(requireCount('narrations', 8828), 8828);
  assert.equal(requireCount('studies', 0), 0);
});

test('requireCount rejects anything that is not a whole count', () => {
  for (const bad of [undefined, null, Number.NaN, -1, 2.5, '12', Infinity]) {
    assert.throws(() => requireCount('narrations', bad), /narrations/);
  }
});

test('sum adds counts and treats an empty list as zero', () => {
  assert.equal(sum([2, 3, 5]), 10);
  assert.equal(sum([]), 0);
});

test('sharesOf scales each value against the largest', () => {
  assert.deepEqual(sharesOf([50, 100, 25]), [0.5, 1, 0.25]);
});

test('sharesOf returns zeros when every value is zero', () => {
  assert.deepEqual(sharesOf([0, 0]), [0, 0]);
});

test('countBy keeps the given order and reports empty keys as zero', () => {
  const items = [{ c: 'b' }, { c: 'a' }, { c: 'b' }];
  assert.deepEqual(countBy(items, (item) => item.c, ['a', 'b', 'c']), [
    { key: 'a', count: 1 },
    { key: 'b', count: 2 },
    { key: 'c', count: 0 },
  ]);
});

test('countBy fails on a key outside the given order', () => {
  assert.throws(() => countBy([{ c: 'z' }], (item) => item.c, ['a']), /z/);
});

test('countBy does not change the list it is given', () => {
  const items = Object.freeze([Object.freeze({ c: 'a' })]);
  assert.doesNotThrow(() => countBy(items, (item) => item.c, ['a']));
});

test('firstByKey keeps the first item for each key, in order', () => {
  const items = [{ k: 'x', n: 1 }, { k: 'y', n: 2 }, { k: 'x', n: 3 }];
  assert.deepEqual(firstByKey(items, (item) => item.k), [{ k: 'x', n: 1 }, { k: 'y', n: 2 }]);
});

test('firstByKey skips items without a key', () => {
  const items = [{ k: null }, { k: 'a' }];
  assert.deepEqual(firstByKey(items, (item) => item.k), [{ k: 'a' }]);
});

const FRAME = { lonMin: -11, lonMax: 72, latMin: 11, latMax: 45, lat0: 32, scale: 10 };

test('projectPoint puts the frame corners at the corners, as percentages', () => {
  assert.deepEqual(projectPoint(-11, 45, FRAME), { x: 0, y: 0 });
  assert.deepEqual(projectPoint(72, 11, FRAME), { x: 100, y: 100 });
});

test('projectPoint places a point in between by longitude and latitude', () => {
  const { x, y } = projectPoint(30.5, 28, FRAME);
  assert.equal(x, 50);
  assert.equal(y, 50);
});

test('projectPoint fails on a point outside the frame', () => {
  assert.throws(() => projectPoint(80, 30, FRAME), /outside/);
});

test('hijriYearStartCE gives the common-era year each hijri year begins in', () => {
  assert.equal(hijriYearStartCE(1), 622);
  assert.equal(hijriYearStartCE(200), 815);
  assert.equal(hijriYearStartCE(240), 854);
  assert.equal(hijriYearStartCE(300), 912);
  assert.equal(hijriYearStartCE(320), 932);
});

test('dodge leaves points that are far enough apart where they are', () => {
  assert.deepEqual(dodge([10, 40, 80], 5), [10, 40, 80]);
});

test('dodge spreads points that are too close, keeping their order and middle', () => {
  const spread = dodge([50, 50, 51], 4);
  assert.equal(spread.length, 3);
  assert.ok(spread[1] - spread[0] >= 4 - 1e-9 && spread[2] - spread[1] >= 4 - 1e-9);
  assert.ok(Math.abs((spread[0] + spread[2]) / 2 - 50.33) < 0.5);
});

test('dodge keeps each point in its original slot when given them out of order', () => {
  const spread = dodge([60, 20, 60], 4);
  assert.equal(spread[1], 20);
  assert.ok(Math.abs(spread[0] - spread[2]) >= 4 - 1e-9);
});

test('dodge stays inside the bounds it is given', () => {
  const spread = dodge([0, 0, 100, 100], 5, 0, 100);
  assert.ok(Math.min(...spread) >= 0 && Math.max(...spread) <= 100);
});

test('timeAxis runs from the step below the first year to the step past the last', () => {
  const axis = timeAxis([207, 245, 310], 20);
  assert.equal(axis.start, 200);
  assert.equal(axis.end, 320);
  assert.deepEqual(axis.ticks.map((tick) => tick.ah), [200, 220, 240, 260, 280, 300, 320]);
  assert.deepEqual(axis.ticks.map((tick) => tick.ce), [815, 835, 854, 873, 893, 912, 932]);
  assert.equal(axis.ticks[0].x, 0);
  assert.equal(axis.ticks.at(-1).x, 100);
  assert.equal(axis.at(260), 50);
});

test('timeAxis leaves room after a year that falls on a step', () => {
  assert.equal(timeAxis([200, 300], 20).end, 320);
});

test('timeAxis refuses an empty list', () => {
  assert.throws(() => timeAxis([], 20), /no years/);
});

test('htmlText drops tags and decodes the entities the editions use', () => {
  assert.equal(htmlText('<span>seven</span> <b>long</b>&nbsp;suras, &quot;the first&quot; &amp; Qur&#39;an'), 'seven long suras, "the first" & Qur\'an');
});

test('excerpt keeps a short text whole and only tidies its spaces', () => {
  assert.equal(excerpt('  They are the seven\n long suras.  ', 200), 'They are the seven long suras.');
});

test('excerpt ends at the last full sentence when one fits', () => {
  const text = 'The people differed about the seven. Some said they are the long suras, and others said otherwise.';
  assert.equal(excerpt(text, 60), 'The people differed about the seven.');
});

test('excerpt cuts at a word with an ellipsis when no sentence fits', () => {
  const cut = excerpt('seven verses, and they are al-Fātiḥa; or seven sūras, and they are the long ones', 40);
  assert.ok(cut.length <= 41, cut);
  assert.ok(cut.endsWith('…'), cut);
  assert.ok(!/\s…$/.test(cut), cut);
  assert.ok(!/[,;]…$/.test(cut), cut);
});

test('htmlText closes the gap a removed tag leaves before punctuation', () => {
  assert.equal(htmlText('the seven long suras <span class="source-ref">(verse 87)</span>.'.replace(/<span[^>]*>[^<]*<\/span>/, '')), 'the seven long suras.');
});

test('ordinal names the generations the way the register does', () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12].map(ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th']);
});

test('median takes the middle value, or the mean of the middle two', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([]), null);
});

test('latestByKey keeps each key\'s first items in the given order, with its total', () => {
  const posts = [
    { id: 'a', cat: 'x' }, { id: 'b', cat: 'y' }, { id: 'c', cat: 'x' }, { id: 'd', cat: 'x' },
  ];
  const groups = latestByKey(posts, (post) => post.cat, ['y', 'x', 'z'], 2);
  assert.deepEqual(groups.map((g) => [g.key, g.total, g.items.map((p) => p.id)]), [
    ['y', 1, ['b']],
    ['x', 3, ['a', 'c']],
    ['z', 0, []],
  ]);
});

test('latestByKey refuses an item whose key is not in the order', () => {
  assert.throws(() => latestByKey([{ cat: 'q' }], (post) => post.cat, ['x'], 2), /"q"/);
});

test('clockTime writes minutes and seconds, and hours when there are any', () => {
  assert.equal(clockTime(1691), '28:11');
  assert.equal(clockTime(60), '1:00');
  assert.equal(clockTime(5566), '1:32:46');
});
