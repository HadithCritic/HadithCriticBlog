import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addContactToSegment, sendArticleBroadcast } from '../resend.mjs';

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

test('sendArticleBroadcast returns the broadcast id on success', async () => {
  const restore = mockFetchOnce(200, { object: 'broadcast', id: 'broadcast-1' });
  try {
    const result = await sendArticleBroadcast(
      { subject: 'New post', html: '<p>hi</p>', text: 'hi' },
      { apiKey: 'key', segmentId: 'seg1' }
    );
    assert.deepEqual(result, { broadcastId: 'broadcast-1' });
  } finally {
    restore();
  }
});

test('sendArticleBroadcast throws on failure', async () => {
  const restore = mockFetchOnce(400, { message: 'Invalid segment' });
  try {
    await assert.rejects(
      () =>
        sendArticleBroadcast(
          { subject: 'New post', html: '<p>hi</p>', text: 'hi' },
          { apiKey: 'key', segmentId: 'seg1' }
        ),
      /Resend broadcast send failed: Invalid segment/
    );
  } finally {
    restore();
  }
});
