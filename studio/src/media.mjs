const MAX_BYTES = 8 * 1024 * 1024;
export function imageType(bytes) {
  if (bytes.length < 16 || bytes.length > MAX_BYTES) throw new Error('Image must be between 16 bytes and 8 MB.');
  if ([137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return ['image/png', 'png'];
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['image/jpeg', 'jpg'];
  const ascii = (a,b) => new TextDecoder().decode(bytes.slice(a,b));
  if (ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP') return ['image/webp', 'webp'];
  throw new Error('Only PNG, JPEG and WebP images are accepted; SVG and HTML are forbidden.');
}
export async function uploadMedia(request, env, identity) {
  if (!env.STUDIO_MEDIA) return { error: 'Private R2 media binding is not configured.', status: 503 };
  const alt = request.headers.get('x-image-alt');
  if (!alt || alt.length > 2000) return { error: 'Alt text is required (maximum 2000 characters).', status: 422 };
  const parent = request.headers.get('x-image-parent') || null;
  const width = request.headers.has('x-image-width') ? Number(request.headers.get('x-image-width')) : null;
  if (width !== null && (!Number.isSafeInteger(width) || width < 1 || width > 1536)) return { error:'Invalid image width.',status:422 };
  if (parent) {
    const main = await env.STUDIO_DB.prepare('SELECT id FROM media WHERE id=? AND parent_id IS NULL AND deleted_at IS NULL').bind(parent).first();
    if (!main || width === null) return { error:'Variant needs an active parent image and width.',status:422 };
  }
  const reader = request.body?.getReader();
  if (!reader) return { error: 'Image bytes are required.', status: 400 };
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > MAX_BYTES) { await reader.cancel(); return { error: 'Image exceeds 8 MB.', status: 413 }; }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let mime, extension;
  try { [mime, extension] = imageType(bytes); } catch (error) { return { error: error.message, status: 422 }; }
  const id = crypto.randomUUID(), key = `private/${id}.${extension}`, path = `/images/studio/${id}.${extension}`, now = new Date().toISOString();
  await env.STUDIO_MEDIA.put(key, bytes, { httpMetadata: { contentType: mime } });
  try {
    await env.STUDIO_DB.batch([
      env.STUDIO_DB.prepare('INSERT INTO media(id,path,object_key,mime,bytes,alt,created_at,parent_id,width) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,path,key,mime,size,decodeURIComponent(alt),now,parent,width),
      env.STUDIO_DB.prepare('INSERT INTO studio_audit(action,path,actor,created_at,detail) VALUES(?,?,?,?,?)').bind('media.upload',path,identity.subject,now,`bytes=${size}`)
    ]);
  } catch (error) { await env.STUDIO_MEDIA.delete(key); throw error; }
  return { id, path, preview: `/api/media/${id}`, alt: decodeURIComponent(alt),width,parent };
}
export async function removeMedia(id, env, identity) {
  const media = await env.STUDIO_DB.prepare('SELECT * FROM media WHERE id=? AND deleted_at IS NULL').bind(id).first();
  if (!media) return { error: 'Image not found.', status: 404 };
  const child = await env.STUDIO_DB.prepare('SELECT id FROM media WHERE parent_id=? AND deleted_at IS NULL LIMIT 1').bind(id).first();
  if (child) return { error:'Archive active variants before archiving their parent.',status:409 };
  // Historical revisions and pending publication snapshots also keep references alive.
  const used = await env.STUDIO_DB.prepare(`SELECT path FROM drafts WHERE instr(source,?)>0
    UNION SELECT path FROM draft_revisions WHERE instr(source,?)>0
    UNION SELECT path FROM publication_jobs WHERE instr(source,?)>0 LIMIT 1`).bind(media.path,media.path,media.path).first();
  if (used) return { error: 'Image is referenced by a draft, revision, or publication. It cannot be removed.', status: 409 };
  const now = new Date().toISOString();
  await env.STUDIO_DB.batch([
    env.STUDIO_DB.prepare('UPDATE media SET deleted_at=? WHERE id=?').bind(now,id),
    env.STUDIO_DB.prepare('INSERT INTO studio_audit(action,path,actor,created_at,detail) VALUES(?,?,?,?,?)').bind('media.archive',media.path,identity.subject,now,'reversible; bytes retained')
  ]);
  return { archived: true };
}
