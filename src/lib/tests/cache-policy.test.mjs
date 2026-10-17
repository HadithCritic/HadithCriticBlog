import { test } from 'node:test';
import assert from 'node:assert/strict';
import CachePolicy from 'http-cache-semantics';

const request = { url: 'https://example.test/image', method: 'GET', headers: {} };
const prohibited = [
  { 'cache-control': 'max-age=3600', 'set-cookie': 'session=private' },
  { 'cache-control': 'max-age=0, proxy-revalidate' },
  { 'cache-control': 'no-cache, stale-while-revalidate=999999' },
  { 'cache-control': 'no-store' },
  { 'cache-control': 'private, max-age=3600' },
  { 'cache-control': 'public, max-age=3600', vary: '*' }
];

test('client max-stale cannot revive a cache entry with reuse prohibited', () => {
  for (const headers of prohibited) {
    const policy = new CachePolicy(request, { status: 200, headers }, { shared: true });
    for (const directive of ['max-stale', 'max-stale=999999']) {
      const incoming = { ...request, headers: { 'cache-control': directive } };
      assert.equal(policy.satisfiesWithoutRevalidation(incoming), false, JSON.stringify(headers));
      const result = policy.evaluateRequest(incoming);
      assert.equal(result.response, undefined);
      assert.equal(result.revalidation.synchronous, true);
    }
  }
});

test('serialized and revalidated policies retain the reuse prohibition', () => {
  const headers = { 'cache-control': 'max-age=3600', 'set-cookie': 'session=private', etag: '"v1"' };
  const policy = new CachePolicy(request, { status: 200, headers });
  const restored = CachePolicy.fromObject(policy.toObject());
  const refreshed = policy.revalidatedPolicy(request, { status: 304, headers: { etag: '"v1"' } }).policy;
  const incoming = { ...request, headers: { 'cache-control': 'max-stale=999999' } };
  assert.equal(restored.satisfiesWithoutRevalidation(incoming), false);
  assert.equal(refreshed.satisfiesWithoutRevalidation(incoming), false);
});

test('ordinary expired public responses still honor max-stale', () => {
  const policy = new CachePolicy(request, { status: 200, headers: { 'cache-control': 'public, max-age=0' } });
  assert.equal(policy.satisfiesWithoutRevalidation({ ...request, headers: { 'cache-control': 'max-stale=999999' } }), true);
});

test('private caches and explicitly public cookie responses remain usable', () => {
  const headers = { 'cache-control': 'max-age=3600', 'set-cookie': 'session=private' };
  const personal = new CachePolicy(request, { status: 200, headers }, { shared: false });
  const publicPolicy = new CachePolicy(request, { status: 200, headers: { ...headers, 'cache-control': 'public, max-age=3600' } });
  assert.equal(personal.satisfiesWithoutRevalidation(request), true);
  assert.equal(publicPolicy.satisfiesWithoutRevalidation(request), true);
});

test('Connection and Vary tokens retain trimming without backtracking over whitespace', () => {
  const padding = ' '.repeat(100_000);
  const headers = {
    'cache-control': 'public, max-age=3600',
    connection: ` x-hop ${padding}x, x-other `,
    'x-other': 'remove',
    vary: ` x-selected ${padding}x, x-other `
  };
  const policy = new CachePolicy(request, { status: 200, headers });
  assert.equal(policy.responseHeaders()['x-other'], undefined);
  assert.equal(policy.satisfiesWithoutRevalidation(request), true);
  assert.equal(policy.satisfiesWithoutRevalidation({ ...request, headers: { 'x-other': 'different' } }), false);
});
