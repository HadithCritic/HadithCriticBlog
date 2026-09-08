/**
 * The article taxonomy, in one place.
 *
 * The four categories were previously implicit: they existed as an enum in the
 * content schema and as directory names, but had no pages of their own. A topic
 * with no hub is a topic search engines and answer engines cannot see as a
 * topic, so each one now has a landing page collecting its studies.
 *
 * `slug` matches the content directory name; `blurb` is the page description and
 * is written to stand alone as an answer to "what does this site say about X".
 */

export interface Category {
  name: string;
  slug: string;
  blurb: string;
  /** Entity names for schema `about`. Helps engines place the topic. */
  about: string[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Origins & Early History',
    slug: 'origins-early-history',
    blurb:
      'Source-critical studies of how the earliest Islamic reports were formed, circulated and recorded, covering the first two centuries of transmission, the emergence of written compilations, and the historical context in which prophetic traditions took shape.',
    about: ['Early Islamic history', 'Historiography', 'Oral tradition', 'Sirah literature']
  },
  {
    name: 'Transmission & Narrators',
    slug: 'transmission-narrators',
    blurb:
      "Isnad criticism and rijal analysis: how individual transmitters were graded, where chains break down, and what isnad-cum-matn analysis reveals about the origin of specific reports. Includes case studies of named narrators and the classical science of 'ilm al-rijal itself.",
    about: ["'Ilm al-rijal", 'Isnad', 'Hadith transmission', 'Isnad-cum-matn analysis']
  },
  {
    name: 'Theology & Epistemology',
    slug: 'theology-epistemology',
    blurb:
      'What hadith literature can and cannot establish as knowledge. Studies on the epistemic status of solitary reports, the Quranic standard for verification, the relationship between scripture and tradition, and the theological consequences of accepting reports on authority.',
    about: ['Islamic theology', 'Epistemology', 'Quranic studies', 'Usul al-fiqh']
  },
  {
    name: 'Prophecies & Eschatology',
    slug: 'prophecies-eschatology',
    blurb:
      'Examination of predictive traditions and end-times material: apocalyptic reports, Mahdi traditions, and prophecies whose transmission history places their formation after the events they claim to foretell.',
    about: ['Islamic eschatology', 'Mahdi', 'Apocalyptic literature', 'Prophecy']
  }
];

const BY_NAME = new Map(CATEGORIES.map((c) => [c.name, c]));
const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export const categoryByName = (name: string): Category | undefined => BY_NAME.get(name);
export const categoryBySlug = (slug: string): Category | undefined => BY_SLUG.get(slug);
export const categorySlug = (name: string): string => BY_NAME.get(name)?.slug ?? '';
