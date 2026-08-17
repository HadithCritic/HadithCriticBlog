export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';
import { env } from 'cloudflare:workers';
import { getEntry } from 'astro:content';
import { buildNewArticleEmail } from '../../../lib/email-templates/new-article.mjs';
import { sendArticleBroadcast } from '../../../lib/resend.mjs';

const notifySchema = z.object({
  slug: z.string().min(1),
  token: z.string().min(1),
});

export const POST: APIRoute = async ({ request, site }) => {
  const body = await request.json().catch(() => null);
  const parsed = notifySchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ success: false, error: 'A valid article slug is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (parsed.data.token !== env.ADMIN_NOTIFY_TOKEN) {
    return new Response('Not found', { status: 404 });
  }

  const { slug } = parsed.data;

  const alreadySent = await env.DB.prepare('SELECT slug FROM article_notifications WHERE slug = ?')
    .bind(slug)
    .first();

  if (alreadySent) {
    return new Response(JSON.stringify({ success: false, error: 'This article has already been sent.' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const entry = await getEntry('articles', slug);

  if (!entry) {
    return new Response(JSON.stringify({ success: false, error: 'Article not found.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const canonicalUrl = new URL(`/blogs/${entry.id}`, site).href;
  const content = buildNewArticleEmail({
    title: entry.data.title,
    description: entry.data.description,
    thumbnail: entry.data.thumbnail ? new URL(entry.data.thumbnail, site).href : undefined,
    canonicalUrl,
  });

  try {
    await sendArticleBroadcast(content, {
      apiKey: env.RESEND_API_KEY,
      segmentId: env.RESEND_SEGMENT_ID,
    });
  } catch (error) {
    console.error('Broadcast send failed', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to send the broadcast.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await env.DB.prepare('INSERT INTO article_notifications (slug, sent_at) VALUES (?, ?)')
      .bind(slug, new Date().toISOString())
      .run();
  } catch (error) {
    console.error('Recording sent notification failed after a successful send', error);
    return new Response(
      JSON.stringify({
        success: true,
        warning: 'The email sent, but this app failed to record it as sent. Check article_notifications in D1 before trying again.',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
