import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addContactToSegment } from '../resend.mjs';

function mockFetchOnce(status, body) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: 'Mocked',
    json: async () => body,
  });
  return () => {
    globalThis.fetch = originalFetch;
  };
}

test('addContactToSegment returns subscribed on success', async () => {
  const restore = mockFetchOnce(200, { object: 'contact', id: 'abc123' });
  try {
    const result = await addContactToSegment('reader@example.com', { apiKey: 'key', segmentId: 'seg1' });
    assert.deepEqual(result, { status: 'subscribed' });
  } finally {
    restore();
  }
});

test('addContactToSegment returns already_subscribed on 409', async () => {
  const restore = mockFetchOnce(409, { message: 'Contact already exists' });
  try {
    const result = await addContactToSegment('reader@example.com', { apiKey: 'key', segmentId: 'seg1' });
    assert.deepEqual(result, { status: 'already_subscribed' });
  } finally {
    restore();
  }
});

test('addContactToSegment throws on an unexpected error', async () => {
  const restore = mockFetchOnce(500, { message: 'Internal error' });
  try {
    await assert.rejects(
      () => addContactToSegment('reader@example.com', { apiKey: 'key', segmentId: 'seg1' }),
      /Resend contact creation failed: Internal error/
    );
  } finally {
    restore();
  }
});

