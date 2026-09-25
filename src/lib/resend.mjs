const RESEND_API_BASE = 'https://api.resend.com';

/**
 * @param {string} email
 * @param {{ apiKey: string, segmentId: string }} config
 * @returns {Promise<{ status: 'subscribed' | 'already_subscribed' }>}
 */
export async function addContactToSegment(email, config) {
  const response = await fetch(`${RESEND_API_BASE}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, segments: [{ id: config.segmentId }] }),
  });

  if (response.ok) {
    return { status: 'subscribed' };
  }

  // Resend has no documented response shape for a duplicate email; 409 is
  // the conventional conflict status and is treated as an idempotent subscribe.
  if (response.status === 409) {
    return { status: 'already_subscribed' };
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(`Resend contact creation failed: ${body.message ?? response.statusText}`);
}

