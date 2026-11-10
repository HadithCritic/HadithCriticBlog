/*
 * Shared narrator-register resolver for the compilation reader builders.
 * The corpus database is opened read-only; the generated pages stay static.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const normAr = (value = '') => String(value).normalize('NFKD')
  .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
  .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
  .replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim().replace(/\s+/g, ' ');
export const normEn = (value = '') => String(value).normalize('NFKD')
  .replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\bb\.?\s*/g, ' ibn ').replace(/[^a-z0-9]+/g, ' ')
  .trim().replace(/\s+/g, ' ');

const toSetMap = (rows, key, id) => {
  const map = new Map();
  for (const row of rows) {
    const k = key(row);
    if (!k) continue;
    const set = map.get(k) ?? new Set();
    set.add(row[id]);
    map.set(k, set);
  }
  return map;
};

const formKey = node => `${node.en || ''}\u0000${node.ar || ''}`;

export function openNarratorResolver() {
  const version = JSON.parse(fs.readFileSync('src/data/corpus-meta.json', 'utf8')).corpusVersion;
  const dbPath = path.resolve('dist-db/builds', version, 'hadith.db');
  if (!fs.existsSync(dbPath)) throw new Error(`Read-only corpus build not found: ${dbPath}`);
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const aliasMap = toSetMap(db.prepare('SELECT narrator_id,surface_norm FROM narrator_alias').all(), row => normAr(row.surface_norm), 'narrator_id');
  const narratorRows = db.prepare('SELECT id,name_en,name_ar,hadith_count FROM narrator').all();
  const hadithCountOf = new Map(narratorRows.map(row => [row.id, row.hadith_count ?? 0]));
  const narratorIds = new Set(narratorRows.map(row => row.id));
  const arNameMap = toSetMap(narratorRows, row => normAr(row.name_ar), 'id');
  const enNameMap = toSetMap(narratorRows, row => normEn(row.name_en), 'id');

  function narratorCandidates(node) {
    if (node.narrator_id != null) {
      const id = Number(node.narrator_id);
      if (!Number.isInteger(id) || !narratorIds.has(id)) throw new Error(`Unknown narrator ID ${node.narrator_id}`);
      return new Set([id]);
    }
    const ar = normAr(node.ar);
    const arIds = new Set([...(aliasMap.get(ar) ?? []), ...(arNameMap.get(ar) ?? [])]);
    const enIds = enNameMap.get(normEn(node.en)) ?? new Set();
    if (arIds.size && enIds.size) {
      const shared = [...arIds].filter(id => enIds.has(id));
      if (shared.length) return new Set(shared);
      if (arIds.size === 1) return arIds;
      if (enIds.size === 1) return enIds;
      return new Set([...arIds, ...enIds]);
    }
    return arIds.size ? arIds : enIds;
  }

  const adjacent = new Set(db.prepare(`SELECT DISTINCT a.narrator_id AS a,b.narrator_id AS b
    FROM hadith_chain a JOIN hadith_chain b
    ON a.hadith_id=b.hadith_id AND a.path_idx=b.path_idx AND b.pos=a.pos+1
    WHERE a.narrator_id IS NOT NULL AND b.narrator_id IS NOT NULL`).all()
    .map(row => `${row.a}:${row.b}`));
  const hasAdjacent = (a, b) => adjacent.has(`${a}:${b}`);

  function resolveNarratorChains(source) {
    const occurrences = new Map();
    for (const record of source.records) for (const chain of record.chains ?? []) {
      // The source stores chains from the compiler-facing narrator back toward
      // the Companion. Rijal transmission paths in the corpus run the other way.
      const nodes = [...chain].reverse();
      const domains = nodes.map(narratorCandidates);
      for (let pass = 0; pass < nodes.length; pass += 1) {
        let changed = false;
        for (let i = 0; i < domains.length - 1; i += 1) {
          const left = domains[i], right = domains[i + 1];
          if (!left.size || !right.size) continue;
          const links = [...left].some(a => [...right].some(b => hasAdjacent(a, b)));
          if (!links) continue;
          const nextLeft = new Set([...left].filter(a => [...right].some(b => hasAdjacent(a, b))));
          const nextRight = new Set([...right].filter(b => [...left].some(a => hasAdjacent(a, b))));
          if (nextLeft.size !== left.size) { domains[i] = nextLeft; changed = true; }
          if (nextRight.size !== right.size) { domains[i + 1] = nextRight; changed = true; }
        }
        if (!changed) break;
      }
      for (let i = 0; i < nodes.length; i += 1) {
        if (nodes[i].narrator_id_scope === 'occurrence') continue;
        if (domains[i].size !== 1) continue;
        const key = formKey(nodes[i]);
        const set = occurrences.get(key) ?? new Set();
        set.add([...domains[i]][0]);
        occurrences.set(key, set);
      }
    }
    return occurrences;
  }

  /** Sets node._narratorId on every resolvable chain node of source.records. */
  function linkNarratorIds(source) {
    const contextualLinks = resolveNarratorChains(source);
    for (const record of source.records) for (const chain of record.chains ?? []) for (const node of chain) {
      const candidates = narratorCandidates(node);
      const contextual = contextualLinks.get(formKey(node));
      if (candidates.size === 1) node._narratorId = [...candidates][0];
      else if (contextual?.size === 1) node._narratorId = [...contextual][0];
    }
    const confirmedByForm = new Map();
    for (const record of source.records) for (const chain of record.chains ?? []) for (const node of chain) {
      if (!node._narratorId || node.narrator_id_scope === 'occurrence') continue;
      const ids = confirmedByForm.get(formKey(node)) ?? new Set();
      ids.add(node._narratorId);
      confirmedByForm.set(formKey(node), ids);
    }
    for (const record of source.records) for (const chain of record.chains ?? []) for (const node of chain) {
      const ids = confirmedByForm.get(formKey(node));
      if (!node._narratorId && ids?.size === 1) node._narratorId = [...ids][0];
    }
  }

  /** Builds the narrator-link-audit.json payload plus summary counts. */
  function buildAudit(source, sourceLabel) {
    const uniqueForms = new Map();
    const unresolvedOccurrences = [];
    const linkedFormKeys = new Set();
    const unresolvedFormKeys = new Set();
    let linkedOccurrences = 0, totalOccurrences = 0;
    for (const record of source.records) for (const chain of record.chains ?? []) for (const [position, node] of chain.entries()) {
      const key = formKey(node);
      totalOccurrences += 1;
      if (!uniqueForms.has(key)) uniqueForms.set(key, { en: node.en || '', ar: node.ar || '', narrator_id: node._narratorId ?? null });
      if (node._narratorId) { linkedFormKeys.add(key); linkedOccurrences += 1; }
      else {
        unresolvedFormKeys.add(key);
        unresolvedOccurrences.push({ record_id: record.id, name_en: node.en || '', name_ar: node.ar || '', previous: chain[position - 1]?.en || null, next: chain[position + 1]?.en || null });
      }
    }
    const unresolvedForms = [...unresolvedFormKeys].map(key => ({ ...uniqueForms.get(key), narrator_id: null }));
    const partialForms = [...unresolvedFormKeys].filter(key => linkedFormKeys.has(key)).map(key => uniqueForms.get(key));
    return {
      audit: { source: sourceLabel, corpus_version: version, unique_source_forms: uniqueForms.size, linked_forms: linkedFormKeys.size, partially_linked_forms: partialForms, unresolved_forms: unresolvedForms, unresolved_occurrences: unresolvedOccurrences },
      linkedForms: linkedFormKeys.size, totalForms: uniqueForms.size, linkedOccurrences, totalOccurrences,
    };
  }

  return { version, linkNarratorIds, buildAudit, narratorCandidates, hasNarrator: id => narratorIds.has(Number(id)),
    hadithCount: id => hadithCountOf.get(Number(id)) ?? 0, close: () => db.close() };
}
