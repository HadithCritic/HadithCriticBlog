import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { isAllowedHost, isSameOriginMutation, verifyAccessJwt, hasRecentAuthentication } from '../src/auth.mjs';
import { handleRequest, parseArticleFrontmatter } from '../src/worker.mjs';

const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'studio-test-key', alg: 'RS256', use: 'sig' };
const env = {
  STUDIO_ALLOWED_HOST: 'studio.hadithcriticblog.com',
  STUDIO_TEAM_DOMAIN: 'hadithcritic',
  STUDIO_AUD: 'studio-audience-id',
  STUDIO_OWNER_EMAIL: 'owner@example.com',
  STUDIO_OWNER_SUBJECT: 'owner-subject-id'
};
const mockFetch = async () => ({ ok: true, json: async () => ({ keys: [jwk] }) });

function b64url(value) {
  return Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
}

function token(overrides = {}, signatureKey = privateKey) {
  const header = b64url({ alg: 'RS256', typ: 'JWT', kid: 'studio-test-key' });
  const claims = b64url({
    iss: 'https://hadithcritic.cloudflareaccess.com',
    type: 'app',
    aud: ['studio-audience-id'],
    sub: 'owner-subject-id',
    email: 'owner@example.com',
    iat: 1_800_000_000,
    exp: 2_000_000_000,
    ...overrides
  });
  const signingInput = `${header}.${claims}`;
  const signature = sign('RSA-SHA256', Buffer.from(signingInput), signatureKey).toString('base64url');
  return `${signingInput}.${signature}`;
}

test('verifies the signature and exact configured owner identity', async () => {
  const identity = await verifyAccessJwt(token(), env, mockFetch, 1_900_000_000_000);
  assert.deepEqual(identity, { email: 'owner@example.com', subject: 'owner-subject-id' });
});

test('rejects an audience mismatch, expired token, alternate identity, and invalid signature', async () => {
  await assert.rejects(verifyAccessJwt(token({ aud: ['another-app'] }), env, mockFetch, 1_900_000_000_000), /audience/);
  await assert.rejects(verifyAccessJwt(token({ exp: 1_800_000_000 }), env, mockFetch, 1_900_000_000_000), /Expired/);
  await assert.rejects(verifyAccessJwt(token({ email: 'reader@example.com' }), env, mockFetch, 1_900_000_000_000), /not authorized/);
  await assert.rejects(verifyAccessJwt(token({ sub: 'different-subject' }), env, mockFetch, 1_900_000_000_000), /not authorized/);
  await assert.rejects(verifyAccessJwt(token({ iss: 'https://another-team.cloudflareaccess.com' }), env, mockFetch, 1_900_000_000_000), /issuer/);
  const wrongKey = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  await assert.rejects(verifyAccessJwt(token({}, wrongKey), env, mockFetch, 1_900_000_000_000), /signature/);
});

test('rejects missing authentication configuration and malformed tokens', async () => {
  await assert.rejects(verifyAccessJwt('', env, mockFetch), /not configured/);
  await assert.rejects(verifyAccessJwt('not.a.jwt', env, mockFetch), /Malformed/);
});

test('pins hostname and requires same-origin mutation requests', () => {
  const allowed = new Request('https://studio.hadithcriticblog.com/api/draft', { method: 'PUT', headers: { host: 'studio.hadithcriticblog.com', origin: 'https://studio.hadithcriticblog.com' } });
  const wrongHost = new Request('https://attacker.example/api/draft', { method: 'PUT', headers: { host: 'attacker.example', origin: 'https://attacker.example' } });
  const wrongOrigin = new Request('https://studio.hadithcriticblog.com/api/draft', { method: 'PUT', headers: { host: 'studio.hadithcriticblog.com', origin: 'https://attacker.example' } });
  const wrongScheme = new Request('https://studio.hadithcriticblog.com/api/draft', { method: 'PUT', headers: { host: 'studio.hadithcriticblog.com', origin: 'http://studio.hadithcriticblog.com' } });
  assert.equal(isAllowedHost(allowed, env), true);
  assert.equal(isAllowedHost(wrongHost, env), false);
  assert.equal(isSameOriginMutation(allowed), true);
  assert.equal(isSameOriginMutation(wrongOrigin), false);
  assert.equal(isSameOriginMutation(wrongScheme), false);
});

test('rejects requests before serving assets unless host and Access token pass', async () => {
  const makeRequest = (host, header = '') => new Request(`https://${host}/`, { headers: { host, 'cf-access-jwt-assertion': header } });
  const assets = { fetch: async () => new Response('private app') };
  const wrongHostResponse = await handleRequest(makeRequest('wrong.example'), { ...env, ASSETS: assets });
  assert.equal(wrongHostResponse.status, 403);
  for (const path of ['/', '/api/articles', '/article-manifest.json']) {
    const response = await handleRequest(new Request(`https://studio.hadithcriticblog.com${path}`, { headers: { host: 'studio.hadithcriticblog.com' } }), { ...env, ASSETS: assets });
    assert.equal(response.status, 401, `Expected ${path} to require Access authentication.`);
  }
});

test('frontmatter split leaves the article body byte-for-byte unchanged', () => {
  const body = 'Arabic: <Arabic>إِنَّ</Arabic>\r\n\r\nA footnote.[^a]\r\n\r\n[^a]: source\r\n';
  const parsed = parseArticleFrontmatter(`---\r\ntitle: "Study"\r\ndescription: "Careful"\r\n---\r\n\r\n${body}`);
  assert.equal(parsed.metadata.title, 'Study');
  assert.equal(parsed.body, body);
});
test('publication requires recent, cryptographically verified authentication',()=>{
  const now=1_900_000_000_000;
  assert.equal(hasRecentAuthentication(token({iat:1_900_000_000-899}),now),true);
  assert.equal(hasRecentAuthentication(token({iat:1_900_000_000-901}),now),false);
  assert.equal(hasRecentAuthentication(token({iat:undefined}),now),false);
});
