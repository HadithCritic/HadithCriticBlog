const encoder = new TextEncoder();
const JWKS_CACHE = new Map();

function decodeSegment(segment) {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) throw new Error('Malformed Access token.');
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

function decodeJson(segment) {
  try { return JSON.parse(new TextDecoder().decode(decodeSegment(segment))); }
  catch { throw new Error('Malformed Access token.'); }
}

/** Verify a Cloudflare Access RS256 token and the configured single owner. */
export async function verifyAccessJwt(token, env, fetchImpl = fetch, now = Date.now()) {
  if (!token || token.length > 16384 || !env.STUDIO_TEAM_DOMAIN || !env.STUDIO_AUD || !env.STUDIO_OWNER_EMAIL || !env.STUDIO_OWNER_SUBJECT) {
    throw new Error('Studio authentication is not configured.');
  }

  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed Access token.');
  const header = decodeJson(parts[0]);
  const claims = decodeJson(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Unsupported Access token.');

  const teamDomain = env.STUDIO_TEAM_DOMAIN.replace(/\/$/, '');
  const issuer = `https://${teamDomain}.cloudflareaccess.com`;
  if (claims.iss !== issuer) throw new Error('Invalid Access issuer.');
  if (claims.type !== 'app') throw new Error('Invalid Access token type.');
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audience.includes(env.STUDIO_AUD)) throw new Error('Invalid Access audience.');
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds) throw new Error('Expired Access token.');
  if (Number.isFinite(claims.iat) && claims.iat > nowSeconds + 30) throw new Error('Access token is not active.');
  if (Number.isFinite(claims.nbf) && claims.nbf > nowSeconds + 30) throw new Error('Access token is not active.');
  if (claims.email !== env.STUDIO_OWNER_EMAIL || claims.sub !== env.STUDIO_OWNER_SUBJECT) {
    throw new Error('This identity is not authorized for Studio.');
  }

  async function loadJwks() {
    const response = await fetchImpl(`${issuer}/cdn-cgi/access/certs`, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('Could not verify the Access signing key.');
    const keys = (await response.json()).keys;
    if (!Array.isArray(keys)) throw new Error('Could not verify the Access signing key.');
    const jwks = { keys, expiresAt: now + 5 * 60 * 1000 };
    JWKS_CACHE.set(issuer, jwks);
    return jwks;
  }
  let jwks = JWKS_CACHE.get(issuer);
  if (!jwks || jwks.expiresAt <= now) jwks = await loadJwks();
  let jwk = jwks.keys.find((key) => key.kid === header.kid && key.kty === 'RSA');
  if (!jwk) {
    jwks = await loadJwks();
    jwk = jwks.keys.find((key) => key.kid === header.kid && key.kty === 'RSA');
    if (!jwk) throw new Error('Unknown Access signing key.');
  }
  const publicKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', publicKey, decodeSegment(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) throw new Error('Invalid Access token signature.');
  return { email: claims.email, subject: claims.sub };
}

// Call only after full cryptographic verification of the same token.
export function hasRecentAuthentication(token, now = Date.now()) {
  const claims = decodeJson(token.split('.')[1]);
  return Number.isFinite(claims.iat) && claims.iat >= Math.floor(now / 1000) - 900;
}

export function isAllowedHost(request, env) {
  const allowed = env.STUDIO_ALLOWED_HOST;
  const url = new URL(request.url);
  return typeof allowed === 'string' && url.protocol === 'https:' && url.host.toLowerCase() === allowed.toLowerCase() && request.headers.get('host')?.toLowerCase() === allowed.toLowerCase();
}

export function isSameOriginMutation(request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return true;
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
