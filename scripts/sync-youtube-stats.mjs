#!/usr/bin/env node
/**
 * Refresh src/data/youtube-meta.json from the YouTube Data API.
 *
 * The site is static, so the /youtube page never calls the API. It reads this
 * committed snapshot, the same way corpus totals come from corpus-meta.json.
 * Run this when you want the subscriber count, view counts or a new upload to
 * appear, then commit the JSON:
 *
 *   npm run sync:youtube
 *
 * Needs YOUTUBE_API_KEY (or YOUTUBE_API_3) in .env. The key travels in a
 * header, never in a URL, so it cannot leak into an error message or a log.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'src', 'data', 'youtube-meta.json');
const HANDLE = '@HadithCritic';

try {
  process.loadEnvFile(path.join(root, '.env'));
} catch {
  // No .env file: fall through to whatever is already in the environment.
}

const key = process.env.YOUTUBE_API_KEY ?? process.env.YOUTUBE_API_3;
if (!key) {
  console.error('Set YOUTUBE_API_KEY (or YOUTUBE_API_3) in .env, then run this again.');
  process.exit(1);
}

async function api(endpoint, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const response = await fetch(url, { headers: { 'x-goog-api-key': key } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`YouTube API ${response.status}: ${body.error?.message ?? 'request failed'}`);
  }
  return body;
}

/** PT1H2M3S to whole seconds. Live streams report P0D, which is 0. */
function seconds(iso) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!match) return 0;
  const [h, m, s] = match.slice(1).map((part) => Number(part ?? 0));
  return h * 3600 + m * 60 + s;
}

const channelResponse = await api('channels', {
  part: 'statistics,contentDetails',
  forHandle: HANDLE
});
const channel = channelResponse.items?.[0];
if (!channel) throw new Error(`No channel found for ${HANDLE}`);

const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
if (!uploadsId) throw new Error('The channel response has no uploads playlist');

const ids = [];
let pageToken;
do {
  const page = await api('playlistItems', {
    part: 'contentDetails',
    playlistId: uploadsId,
    maxResults: '50',
    ...(pageToken ? { pageToken } : {})
  });
  ids.push(...(page.items ?? []).map((item) => item.contentDetails.videoId));
  pageToken = page.nextPageToken;
} while (pageToken);

const videos = [];
for (let start = 0; start < ids.length; start += 50) {
  const batch = await api('videos', {
    part: 'snippet,contentDetails,statistics',
    id: ids.slice(start, start + 50).join(',')
  });
  for (const item of batch.items ?? []) {
    videos.push({
      id: item.id,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      durationSeconds: seconds(item.contentDetails.duration),
      views: Number(item.statistics?.viewCount ?? 0)
    });
  }
}
videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const stats = channel.statistics;
const snapshot = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  channel: {
    handle: HANDLE,
    subscribers: Number(stats.subscriberCount),
    views: Number(stats.viewCount),
    videos: Number(stats.videoCount)
  },
  videos
};

writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `Wrote ${path.relative(root, OUT)}: ${snapshot.channel.subscribers} subscribers, ` +
    `${snapshot.channel.views} views, ${videos.length} videos (${snapshot.fetchedAt}).`
);
