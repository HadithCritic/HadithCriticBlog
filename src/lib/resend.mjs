const RESEND_API_BASE = 'https://api.resend.com';
const NEW_ARTICLE_FROM_ADDRESS = 'HadithCritic <updates@hadithcriticblog.com>';

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

/**
 * @param {{ subject: string, html: string, text: string }} content
 * @param {{ apiKey: string, segmentId: string }} config
 * @returns {Promise<{ broadcastId: string }>}
 */
export async function sendArticleBroadcast(content, config) {
  const response = await fetch(`${RESEND_API_BASE}/broadcasts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      segment_id: config.segmentId,
      from: NEW_ARTICLE_FROM_ADDRESS,
      subject: content.subject,
      html: content.html,
      text: content.text,
      send: true,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Resend broadcast send failed: ${body.message ?? response.statusText}`);
  }

  const body = await response.json();
  return { broadcastId: body.id };
}
