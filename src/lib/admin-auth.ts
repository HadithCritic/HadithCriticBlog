/**
 * Shared gate for the admin notify surfaces.
 *
 * Both the page (`/admin/notify?token=…`) and the route it posts to compared the
 * supplied token with `!==`. That returns as soon as two bytes differ, so the
 * time it takes leaks how long a correct prefix was, which is enough, over
 * many requests, to recover the token a character at a time. `timingSafeEqual`
 * compares every byte regardless, so the answer takes the same time either way.
 *
 * Workers exposes WebCrypto's `timingSafeEqual` on `crypto.subtle`. Lengths are
 * compared first because the primitive requires equal-length buffers; a length
 * mismatch is not a secret worth protecting.
 */

const encoder = new TextEncoder();

export function isValidAdminToken(supplied: unknown, expected: string | undefined): boolean {
  // An unset secret must never authenticate, or a misconfigured deployment
  // would accept an empty token.
  if (!expected || typeof supplied !== 'string' || supplied.length === 0) return false;

  const a = encoder.encode(supplied);
  const b = encoder.encode(expected);
  if (a.byteLength !== b.byteLength) return false;

  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (x: ArrayBufferView, y: ArrayBufferView) => boolean;
  };

  return subtle.timingSafeEqual ? subtle.timingSafeEqual(a, b) : constantTimeEqual(a, b);
}

/** Portable fallback for runtimes without `crypto.subtle.timingSafeEqual`. */
function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}
