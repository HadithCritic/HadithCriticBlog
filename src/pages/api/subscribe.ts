export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { subscribeSchema } from '../../lib/subscribe-schema.mjs';
import { addContactToSegment } from '../../lib/resend.mjs';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ success: false, error: 'Enter a valid email address.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await addContactToSegment(parsed.data.email, {
      apiKey: env.RESEND_API_KEY,
      segmentId: env.RESEND_SEGMENT_ID,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Subscribe failed', error);
    return new Response(JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
