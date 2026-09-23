/**
 * Whether a hadith or narrator id exists in the corpus the site is built for.
 *
 * Read by the /hadith/[id] and /narrators/[id] shells so that an id with no
 * record answers 404 instead of an indexable 200. The data is a bitset written
 * by scripts/build-corpus-ids.mjs; see that file for why a bitset.
 *
 * The answer is `undefined` when the bitset was cut from a different corpus
 * version than src/data/corpus-meta.json names. That happens with a stale file
 * and, deliberately, under the e2e fixture, which swaps corpus-meta.json but
 * not this file. The shells treat `undefined` as "unknown" and keep the old
 * behavior, so a mismatch can never 404 a real record.
 */

import ids from '../data/corpus-ids.json';
import meta from '../data/corpus-meta.json';

type Kind = 'hadith' | 'narrators';

const decoded: Partial<Record<Kind, Uint8Array>> = {};

function bits(kind: Kind): Uint8Array {
  const cached = decoded[kind];
  if (cached) return cached;
  const binary = atob(ids[kind].bits);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  decoded[kind] = bytes;
  return bytes;
}

export function corpusHas(kind: Kind, id: number): boolean | undefined {
  if (ids.corpusVersion !== meta.corpusVersion) return undefined;
  if (!Number.isInteger(id) || id < 0 || id > ids[kind].max) return false;
  return (bits(kind)[id >> 3] & (1 << (id & 7))) !== 0;
}
