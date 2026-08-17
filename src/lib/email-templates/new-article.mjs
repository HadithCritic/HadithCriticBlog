/**
 * @param {{ title: string, description: string, thumbnail?: string, canonicalUrl: string }} article
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildNewArticleEmail(article) {
  const subject = `New on HadithCritic: ${article.title}`;

  const thumbnailHtml = article.thumbnail
    ? `<img src="${article.thumbnail}" alt="${article.title}" width="600" style="width:100%;max-width:600px;height:auto;display:block;margin-bottom:16px;" />`
    : '';

  const html = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  ${thumbnailHtml}
  <h1 style="font-size:22px;line-height:1.3;margin:0 0 12px;">${article.title}</h1>
  <p style="font-size:16px;line-height:1.6;color:#3a3a3a;margin:0 0 20px;">${article.description}</p>
  <a href="${article.canonicalUrl}" style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:4px;font-size:14px;">Read the article</a>
  <p style="font-size:12px;color:#8a8a8a;margin-top:32px;">You're receiving this because you subscribed at HadithCritic. {{{RESEND_UNSUBSCRIBE_URL}}}</p>
</div>`.trim();

  const text = `${article.title}\n\n${article.description}\n\nRead the article: ${article.canonicalUrl}\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`;

  return { subject, html, text };
}
