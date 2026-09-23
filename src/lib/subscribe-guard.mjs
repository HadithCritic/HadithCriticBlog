/**
 * Checks that stand between /api/subscribe and the Resend audience.
 *
 * The endpoint used to accept any well-formed address from anyone, so a script
 * could fill the audience with addresses that never asked to be there, and each
 * of those people would then be mailed. These are the cheap layers: the request
 * must come from the site's own pages, a hidden field a person never sees must
 * be empty, and the caller's IP is rate limited (see src/pages/api/subscribe.ts).
 * None of them confirms that the address belongs to the person submitting it;
 * only a confirmation email does that.
 */

/**
 * The form posts with `fetch` from the site's own origin, and a browser always
 * sends `Origin` on a POST. A missing or foreign Origin is not the form.
 *
 * @param {string | null} origin
 * @param {string} requestUrl
 * @returns {boolean}
 */
export function isAllowedOrigin(origin, requestUrl) {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

/**
 * `website` is rendered as a hidden input. A person cannot fill it; a bot that
 * fills every field it finds does.
 *
 * @param {unknown} body
 * @returns {boolean}
 */
export function isHoneypotFilled(body) {
  if (!body || typeof body !== 'object') return false;
  const value = /** @type {Record<string, unknown>} */ (body).website;
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {Headers} headers
 * @returns {string}
 */
export function clientKey(headers) {
  return headers.get('CF-Connecting-IP') || 'unknown';
}
