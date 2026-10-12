/** Autosaves within this window update the draft without adding a revision. */
export const CHECKPOINT_INTERVAL_MS = 10 * 60 * 1000;

/**
 * D1 batches are transactions. A save nonce ties snapshots to the winning CAS.
 * Every save is audited, but an autosave (`checkpoint: false`) records a
 * revision only when the draft has none from the last ten minutes, so history
 * holds deliberate saves and periodic checkpoints rather than every pause.
 */
export async function persistDraft(db, payload, actor, nowMs = Date.now()) {
  const version = payload.expectedVersion + 1, now = new Date(nowMs).toISOString(), id = crypto.randomUUID();
  const checkpoint = payload.checkpoint !== false || payload.archived !== undefined;
  const cutoff = new Date(nowMs - CHECKPOINT_INTERVAL_MS).toISOString();
  const doc = payload.document ? JSON.stringify(payload.document) : null;
  const results = await db.batch([
    db.prepare(`INSERT INTO drafts (path, source, version, base_sha, updated_at, updated_by, editor_json, save_id)
      SELECT ?, ?, 1, ?, ?, ?, ?, ? WHERE ? = 0
      ON CONFLICT(path) DO NOTHING RETURNING version`).bind(payload.path, payload.source, payload.baseSha || '', now, actor, doc, id, payload.expectedVersion === 0 ? 0 : 1),
    // Updating never creates a missing draft, even with a forged expected version.
    db.prepare(`UPDATE drafts SET source=?, version=version+1, base_sha=?, updated_at=?, updated_by=?, editor_json=?, save_id=?,
      archived_at=CASE WHEN ? THEN ? ELSE archived_at END
      WHERE path=? AND version=? AND ? > 0 RETURNING version`).bind(payload.source, payload.baseSha || '', now, actor, doc, id, payload.archived === undefined ? 0 : 1, payload.archived ? now : null, payload.path, payload.expectedVersion, payload.expectedVersion),
    db.prepare(`INSERT INTO draft_revisions(path,version,source,base_sha,created_at,created_by,editor_json,archived_at)
      SELECT path,version,source,base_sha,updated_at,updated_by,editor_json,archived_at FROM drafts WHERE path=? AND save_id=?
      AND (? OR NOT EXISTS (SELECT 1 FROM draft_revisions WHERE path=? AND created_at > ?))`).bind(payload.path, id, checkpoint ? 1 : 0, payload.path, cutoff),
    db.prepare(`INSERT INTO studio_audit(action,path,actor,created_at,detail)
      SELECT ?,path,updated_by,updated_at,? FROM drafts WHERE path=? AND save_id=?`).bind(payload.archived === undefined ? 'draft.save' : payload.archived ? 'draft.archive' : 'draft.restore', `version=${version}`, payload.path, id)
  ]);
  if (!results[0]?.results?.length && !results[1]?.results?.length) return null;
  return { path: payload.path, version, updatedAt: now, baseSha: payload.baseSha || '', revision: (results[2]?.meta?.changes ?? 0) > 0 };
}
export const MUTATIONS_PER_MINUTE = 50;
export async function mutationAllowed(db, actor, now = Date.now()) {
  const window = Math.floor(now / 60000);
  const result = await db.prepare(`INSERT INTO mutation_limits(actor,window,requests) VALUES(?,?,1)
    ON CONFLICT(actor) DO UPDATE SET window=excluded.window,
    requests=CASE WHEN mutation_limits.window=excluded.window THEN mutation_limits.requests+1 ELSE 1 END
    RETURNING requests`).bind(actor, window).first();
  return result.requests <= MUTATIONS_PER_MINUTE;
}
