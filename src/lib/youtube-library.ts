/* The YouTube page's videos, read from the channel snapshot that
   npm run sync:youtube writes (src/data/site/youtube-meta.json). Build time
   only.

   Thumbnails are YouTube's own frames on i.ytimg.com, as on the front page.
   hqdefault exists for every upload (maxresdefault does not), and its 4:3
   letterbox is cropped to 16:9 by the card's object-fit. */
import youtubeMeta from '../data/site/youtube-meta.json';
import { clockTime } from './home-data-core';

export const CHANNEL_URL = 'https://www.youtube.com/@HadithCritic';

/** The lecture the page opens on; the front page features the same one. */
export const FEATURED_VIDEO = 'HWHjCfaPn_0';

/** Clips and replies run under this; anything longer is a lecture. */
const SHORT_SECONDS = 3 * 60;

export type VideoKind = 'lecture' | 'debate' | 'short';

export const VIDEO_KINDS: { id: VideoKind; label: string }[] = [
  { id: 'lecture', label: 'Lectures' },
  { id: 'debate', label: 'Debates' },
  { id: 'short', label: 'Shorts' },
];

export interface VideoCard {
  id: string;
  title: string;
  kind: VideoKind;
  kindLabel: string;
  href: string;
  thumb: string;
  thumbSmall: string;
  /** The largest frame, for the featured player only. */
  thumbLarge: string;
  iso: string;
  date: string;
  /** Milliseconds since the epoch, for sorting in the page. */
  timestamp: number;
  duration: string;
  views: number;
}

type Video = (typeof youtubeMeta.videos)[number];

const KIND_LABEL: Record<VideoKind, string> = { lecture: 'Lecture', debate: 'Debate', short: 'Short' };

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function videoKind(video: Pick<Video, 'title' | 'durationSeconds'>): VideoKind {
  if (/\(debat/i.test(video.title)) return 'debate';
  return video.durationSeconds < SHORT_SECONDS ? 'short' : 'lecture';
}

function card(video: Video): VideoCard {
  const kind = videoKind(video);
  const frame = (name: string) => `https://i.ytimg.com/vi/${video.id}/${name}.jpg`;
  return {
    id: video.id,
    /* A debate's label already says so; the title drops its "(Debate)". */
    title: kind === 'debate' ? video.title.replace(/\s*\(debate\)\s*$/i, '').trim() : video.title.trim(),
    kind,
    kindLabel: KIND_LABEL[kind],
    href: `https://www.youtube.com/watch?v=${video.id}`,
    thumb: frame('hqdefault'),
    thumbSmall: frame('mqdefault'),
    thumbLarge: frame('maxresdefault'),
    iso: video.publishedAt.slice(0, 10),
    date: formatDate(video.publishedAt),
    timestamp: Date.parse(video.publishedAt),
    duration: clockTime(video.durationSeconds),
    views: video.views,
  };
}

export interface ChannelLibrary {
  featured: VideoCard;
  /** Every published video, newest first. A stream with no recording is left out. */
  videos: VideoCard[];
  counts: Record<VideoKind | 'all', number>;
}

export function channelLibrary(): ChannelLibrary {
  const videos = youtubeMeta.videos
    .filter((video) => video.durationSeconds > 0)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(card);
  const featured = videos.find((video) => video.id === FEATURED_VIDEO);
  if (!featured) throw new Error(`YouTube page: video ${FEATURED_VIDEO} is not in youtube-meta.json. Run npm run sync:youtube.`);
  const count = (kind: VideoKind) => videos.filter((video) => video.kind === kind).length;
  return {
    featured,
    videos,
    counts: { all: videos.length, lecture: count('lecture'), debate: count('debate'), short: count('short') },
  };
}
