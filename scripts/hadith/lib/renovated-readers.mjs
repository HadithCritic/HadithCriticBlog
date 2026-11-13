/*
 * Collections whose page is a redesigned single-page reader (src/data/hadith/pages/<slug>/reader.html),
 * imported by scripts/hadith/import-reader-renovations.mjs. The chapter builder and the JSON export leave them
 * alone: their page is no longer generated from publication-source.json, which is kept as the source record.
 */
export const RENOVATED = new Set([
  'fada-il-makka',
  'juz-sufyan-ibn-uyayna',
  'kitab-al-hajj-al-majishun',
  'kitab-al-qadar-ibn-wahb',
  'ahadith-muntakhaba-maghazi-musa-ibn-uqba',
  'majlis-fawaid-al-layth-ibn-sad',
  'nuskhat-waki-an-al-amash',
  'nuskhat-al-zubayr-ibn-adi',
  'ashara-ahadith-al-layth-ibn-sad',
]);

/*
 * Collections that are one run of narrations with no chapters of their own. Each is one page with every
 * narration in its index, built by scripts/hadith/build-single-page-readers.mjs in the form of the Ṣaḥīfat Hammām
 * reader. A collection with chapters is not listed here and keeps its chapter pages.
 */
export const SINGLE_PAGE = new Set([
  'ahadith-yazid-ibn-abi-habib',
  'hadith-mujaa-ibn-al-zubayr',
  'mashyakhat-ibn-tahman',
  'nuskhat-ibrahim-ibn-sad',
  'al-dua-ibn-fudayl',
  'hadith-abi-al-yaman',
  'kitab-al-fitan-hanbal-ibn-ishaq',
  'kitab-al-zuhd-abu-hatim-al-razi',
  'muwatta-ibn-wahb',
]);
