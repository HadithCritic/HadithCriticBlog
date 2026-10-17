/** Decorative subjects only; never used to alter source headings or corpus data. */
export function collectionArtwork(title: string): string {
  const name = title.toLowerCase();
  if (/purification|ablution|طهارة|وضوء/.test(name)) return 'purification';
  if (/prayer|mosque|صلاة/.test(name)) return 'prayer';
  if (/zakat|charity|زكاة/.test(name)) return 'zakat';
  if (/lost property|لقطة/.test(name)) return 'property';
  if (/pilgrimage|hajj|حج|مناسك/.test(name)) return 'pilgrimage';
  if (/marriage|divorce|نكاح|طلاق/.test(name)) return 'family';
  if (/fasting|food|drink|صوم|صيام/.test(name)) return 'fasting';
  if (/jihad|expedition|battle|جهاد|مغازي/.test(name)) return 'expeditions';
  return 'manuscript';
}
