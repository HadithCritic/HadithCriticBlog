export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { subscribeSchema } from '../../lib/subscribe-schema.mjs';
import { addContactToSegment } from '../../lib/resend.mjs';
import { clientKey, isAllowedOrigin, isHoneypotFilled } from '../../lib/subscribe-guard.mjs';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  if (!isAllowedOrigin(request.headers.get('Origin'), request.url)) {
    return json({ success: false, error: 'Subscribe from the site itself.' }, 403);
  }

  if (env.SUBSCRIBE_LIMITER) {
    const { success } = await env.SUBSCRIBE_LIMITER.limit({ key: clientKey(request.headers) });
    if (!success) {
      return json({ success: false, error: 'Too many attempts. Please wait a minute and try again.' }, 429);
    }
  }

  const body = await request.json().catch(() => null);

  // A filled honeypot gets the same answer a person would, so a bot learns
  // nothing from the response, but nothing is sent to Resend.
  if (isHoneypotFilled(body)) return json({ success: true }, 200);

  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return json({ success: false, error: 'Enter a valid email address.' }, 400);
  }

  try {
    await addContactToSegment(parsed.data.email, {
      apiKey: env.RESEND_API_KEY,
      segmentId: env.RESEND_SEGMENT_ID,
    });

    return json({ success: true }, 200);
  } catch (error) {
    console.error('Subscribe failed', error);
    return json({ success: false, error: 'Something went wrong. Please try again.' }, 502);
  }
};
