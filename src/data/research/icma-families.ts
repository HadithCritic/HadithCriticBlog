export type IcmaFamily = 'chronology' | 'polemics' | 'geography' | 'legal' | 'source-reconstruction' | 'variants' | 'network';

interface FamilyStyle {
  label: string;
  bg: string;
  ink: string;
  accent: string;
}

/* Fixed jacket colors per research family, the same in both themes like the
   resources tiles. Every ink and accent pair clears WCAG AA on its ground. */
export const FAMILIES: Record<IcmaFamily, FamilyStyle> = {
  polemics: { label: 'Polemics', bg: '#6b1f30', ink: '#fdf1f2', accent: '#f5b8c2' },
  geography: { label: 'Sacred Geography', bg: '#1f5140', ink: '#eff8f2', accent: '#b0dcc0' },
  chronology: { label: 'Chronology', bg: '#0b4f6c', ink: '#f2fafd', accent: '#a6dcf0' },
  legal: { label: 'Legal & Penal', bg: '#1e3670', ink: '#eff2fc', accent: '#b4c6f5' },
  'source-reconstruction': { label: 'Reconstruction', bg: '#a3401c', ink: '#fff7f1', accent: '#ffd6bd' },
  variants: { label: 'Textual Variants', bg: '#51306b', ink: '#f7f0fc', accent: '#dcc0f2' },
  network: { label: 'Transmission Network', bg: '#e6dcc6', ink: '#1a1715', accent: '#6a3f12' }
};

/* Research family of each ICMA study, keyed by slug. */
export const studyFamily: Record<string, IcmaFamily> = {
  '2-white-minaret-hadith-jesus-damascus': 'geography',
  '3-origins-mahdi-hadith-ibn-al-zubayr': 'chronology',
  '5-debunking-the-hadith-prophecy-of-bedouins-building-tall-buildings': 'network',
  '8-the-first-revelation-story-a-zubayrid-call-narrative': 'source-reconstruction',
  '15-the-hasanid-mahdi-a-mahdi-fabricated-by-asim-teacher-of-quran-reciter-hafs': 'polemics',
  '16-the-kaysanite-mahdi-the-obscure-3rd-son-of-ali': 'polemics',
  '21-hadith-the-prophet-was-bewitched-by-a-jew': 'variants',
  '22-the-abbasid-mahdi-the-black-banners-abu-abbas-al-saffah': 'polemics',
  '24-fabricated-hadith-prophecy-the-fire-from-hijaz-the-eruption-of-641-ad': 'chronology',
  '25-fabricated-hadith-prophecy-the-siege-of-baghdad': 'geography',
  '27-fabricated-hadith-prophecy-return-to-green-arabia': 'chronology',
  '28-fabricated-hadith-prophecy-the-killing-of-umar-the-afflictions': 'polemics',
  '29-fabricated-prophecy-the-prophecied-return-of-dhul-khalasa': 'geography',
  '32-fabricated-hadith-prophecy-hold-on-to-these-6-things-that-will-occur-in-the-future': 'chronology',
  '33-fabricated-hadith-prophecy-the-thirty-year-reign': 'polemics',
  '35-fabricated-hadith-prophecy-the-conquest-of-constantinople': 'geography',
  '43-hudhayfah-ibn-al-yaman-the-false-story-of-the-keeper-of-secrets': 'source-reconstruction',
  '45-the-origin-of-islamic-apostasy-the-slave-of-ibn-abbas': 'legal',
  '50-how-masruq-wrote-a-hadith-against-the-mourners-of-husayn': 'polemics',
  '55-the-myth-of-the-ten-promised-paradise-hadith': 'polemics',
  '64-whitewashing-al-zuhri-and-why-it-fails': 'source-reconstruction',
  '69-how-the-legal-islamic-class-invented-their-own-divine-reward': 'legal',
  '72-more-on-the-fabricated-baghdad-hadith-prophecy': 'network',
  '73-green-arabia-hadith-sunnah-com-translation-change-fabrication': 'variants',
  '77-faces-like-hammered-shields-the-turks-hadith-clusters': 'geography',
  '78-the-scroll-and-the-sword-the-polemical-use-of-alis-authority': 'polemics',
  '80-the-kharijite-and-the-beast': 'legal',
};
