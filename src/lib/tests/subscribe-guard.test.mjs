import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin, isHoneypotFilled, clientKey } from '../subscribe-guard.mjs';

const SITE = 'https://hadithcriticblog.com/api/subscribe';

test('accepts a request from the site itself', () => {
  assert.equal(isAllowedOrigin('https://hadithcriticblog.com', SITE), true);
});

test('rejects a request posted from another origin', () => {
  assert.equal(isAllowedOrigin('https://evil.example', SITE), false);
});

test('rejects a request with no Origin header', () => {
  // Browsers always send Origin on a cross-site or same-site POST from fetch;
  // a missing header is a script, not the form.
  assert.equal(isAllowedOrigin(null, SITE), false);
});

test('accepts the local dev server posting to itself', () => {
  assert.equal(isAllowedOrigin('http://127.0.0.1:4321', 'http://127.0.0.1:4321/api/subscribe'), true);
});

test('rejects a malformed Origin header', () => {
  assert.equal(isAllowedOrigin('not a url', SITE), false);
});

test('treats an empty or absent honeypot as a person', () => {
  assert.equal(isHoneypotFilled({ email: 'a@b.co' }), false);
  assert.equal(isHoneypotFilled({ email: 'a@b.co', website: '' }), false);
});

test('treats a filled honeypot as a bot', () => {
  assert.equal(isHoneypotFilled({ email: 'a@b.co', website: 'http://spam.example' }), true);
});

test('ignores a honeypot on a body that is not an object', () => {
  assert.equal(isHoneypotFilled(null), false);
  assert.equal(isHoneypotFilled('website=x'), false);
});

test('keys the rate limit on the connecting IP', () => {
  const headers = new Headers({ 'CF-Connecting-IP': '203.0.113.7' });
  assert.equal(clientKey(headers), '203.0.113.7');
});

test('falls back to one shared key when the IP is unknown', () => {
  assert.equal(clientKey(new Headers()), 'unknown');
});
