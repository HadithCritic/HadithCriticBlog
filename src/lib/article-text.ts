/**
 * Small text helpers for the article components: measuring a passage so a
 * plate can choose a display or a reading setting, and formatting the
 * figures a media card prints. Pure functions, used at build time.
 */

import { htmlText } from './html-text.mjs';

const SPACE = /\s+/g;

/** Visible characters in a run of HTML, with whitespace collapsed. */
export function plainLength(html: string): number {
  return htmlText(html, ' ').replace(SPACE, ' ').trim().length;
}

/** 1812 as "30:12", 3725 as "1:02:05". */
export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return '';
  const whole = Math.round(seconds);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = String(whole % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** 2725 as "2.7K views", 14000 as "14K views". */
export function formatViews(views: number | undefined): string {
  if (views === undefined || !Number.isFinite(views) || views < 0) return '';
  const short = (value: number, unit: string) => `${Number(value.toFixed(value < 10 ? 1 : 0))}${unit}`;
  const label = views >= 1e6 ? short(views / 1e6, 'M') : views >= 1e3 ? short(views / 1e3, 'K') : String(views);
  return `${label} ${views === 1 ? 'view' : 'views'}`;
}

/** X ids carry their creation time: milliseconds since X's epoch, shifted left 22 bits. */
const X_EPOCH = 1288834974657n;

/** The posting date of an X status URL, as X prints it ("Feb 17, 2024"). */
export function postDateFromUrl(url: string): string {
  const id = /\/status(?:es)?\/(\d{10,20})/.exec(url)?.[1];
  if (!id) return '';
  const date = new Date(Number((BigInt(id) >> 22n) + X_EPOCH));
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Qur'anic pause and annotation marks (U+06D6 to U+06ED) that stand alone between words. */
const PAUSE_MARK = /^[ۖ-ۭ]+$/;

/** A verse split into words for display, each pause mark kept with the word before it. */
export function quranWords(verse: string): string[] {
  return verse
    .split(SPACE)
    .filter(Boolean)
    .reduce<string[]>((words, token) => {
      if (PAUSE_MARK.test(token) && words.length) {
        return [...words.slice(0, -1), `${words[words.length - 1]} ${token}`];
      }
      return [...words, token];
    }, []);
}

const ARABIC_LETTER = /[ء-يٱ-ۓ]/g;
const LATIN_LETTER = /[A-Za-z]/g;

/** True when a run of text is Arabic, allowing punctuation and digits but no Latin words. */
export function isArabicOnly(text: string): boolean {
  const arabic = text.match(ARABIC_LETTER)?.length ?? 0;
  const latin = text.match(LATIN_LETTER)?.length ?? 0;
  return arabic > 0 && latin === 0;
}
