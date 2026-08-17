import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subscribeSchema } from '../subscribe-schema.mjs';

test('accepts a valid email', () => {
  const result = subscribeSchema.safeParse({ email: 'reader@example.com' });
  assert.equal(result.success, true);
});

test('rejects a malformed email', () => {
  const result = subscribeSchema.safeParse({ email: 'not-an-email' });
  assert.equal(result.success, false);
});

test('rejects a missing email field', () => {
  const result = subscribeSchema.safeParse({});
  assert.equal(result.success, false);
});
