/* Small text helpers shared by the history pages and their scripts. */

/** Lower case with diacritics and the ʿayn and hamza marks removed, so a
    search for "abd allah" finds ʿAbd Allāh. */
export function foldText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯʿʾʼ’']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** "12 min", "1 h 35 min". */
export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const rounded = Math.round(minutes / 5) * 5;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}
