/* The front page YouTube figures, read from the channel snapshot that
   npm run sync:youtube writes (src/data/site/youtube-meta.json): the
   channel's own counts, one featured lecture and the newest lectures after
   it. Build time only. */
import youtubeMeta from '../data/site/youtube-meta.json';
import { clockTime, requireCount } from './home-data-core';
import { FEATURED_VIDEO } from './youtube-library';

/* The lecture the section opens on, the same one the YouTube page features.
   The rail beside it is the newest lectures, so it follows the channel
   without an edit here. */
const FEATURED_LECTURE = FEATURED_VIDEO;
const RAIL_LENGTH = 3;
/** Videos shorter than this are clips and replies, not lectures. */
const MIN_LECTURE_SECONDS = 5 * 60;

export interface LectureFigure {
  id: string;
  title: string;
  thumb: string;
  /** A 320px frame for the rail. */
  thumbSmall: string;
  href: string;
  iso: string;
  date: string;
  duration: string;
  views: number;
}

export interface YoutubeFigure {
  subscribers: number;
  views: number;
  videos: number;
  /** When the snapshot was taken, for the line under the counts. */
  asOf: { iso: string; date: string };
  featured: LectureFigure;
  rail: LectureFigure[];
}

type Video = (typeof youtubeMeta.videos)[number];

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function lecture(video: Video): LectureFigure {
  return {
    id: video.id,
    title: video.title,
    thumb: `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`,
    thumbSmall: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
    href: `https://www.youtube.com/watch?v=${video.id}`,
    iso: video.publishedAt.slice(0, 10),
    date: formatDate(video.publishedAt),
    duration: clockTime(video.durationSeconds),
    views: video.views,
  };
}

export function youtubeFigure(): YoutubeFigure {
  const { channel, videos, fetchedAt } = youtubeMeta;
  const featured = videos.find((video) => video.id === FEATURED_LECTURE);
  if (!featured) throw new Error(`Front page: lecture ${FEATURED_LECTURE} is not in youtube-meta.json. Run npm run sync:youtube.`);
  const rail = videos
    .filter((video) => video.id !== FEATURED_LECTURE && video.durationSeconds >= MIN_LECTURE_SECONDS)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, RAIL_LENGTH);
  if (rail.length < RAIL_LENGTH) throw new Error(`Front page: fewer than ${RAIL_LENGTH} lectures besides the featured one.`);
  return {
    subscribers: requireCount('YouTube subscribers', channel.subscribers),
    views: requireCount('YouTube views', channel.views),
    videos: requireCount('YouTube videos', channel.videos),
    asOf: { iso: fetchedAt.slice(0, 10), date: formatDate(fetchedAt) },
    featured: lecture(featured),
    rail: rail.map(lecture),
  };
}
