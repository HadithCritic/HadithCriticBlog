// Aggregate traffic from Cloudflare's edge logs, read with a read-only token.
// The site runs no tracking script, so these are server-side counts: they
// include unverified bots and cannot attribute visits to people.
const RANGES = new Set([7, 30, 90, 365]);
// Free plan: adaptive datasets cover 30 days per query and 31 days back;
// daily rollups cover a year.
const DETAIL_MAX_DAYS = 30;
const SITE_HOSTS = ['hadithcriticblog.com', 'www.hadithcriticblog.com'];
const CORPUS_HOST = 'data.hadithcriticblog.com';
const CACHE_MS = 5 * 60_000;
const cache = new Map();

export function analyticsConfigured(env) {
  return !!env.STUDIO_CF_ANALYTICS_TOKEN && !!env.STUDIO_CF_ZONE_ID;
}

export function clearAnalyticsCache() { cache.clear(); }

export function parseRange(value) {
  const days = Number(value || 30);
  if (!RANGES.has(days)) throw Object.assign(new Error('Choose 7, 30, 90 or 365 days.'), { status: 400 });
  return days;
}

const QUERY = `query($zone:String!,$since:Time!,$until:Time!,$sinceDay:Date!,$untilDay:Date!,$site:[String!],$corpus:String!){viewer{zones(filter:{zoneTag:$zone}){
daily:httpRequests1dGroups(limit:400,filter:{date_geq:$sinceDay,date_leq:$untilDay},orderBy:[date_ASC]){dimensions{date} sum{requests pageViews cachedRequests bytes} uniq{uniques}}
articles:httpRequestsAdaptiveGroups(limit:25,filter:{datetime_geq:$since,datetime_lt:$until,clientRequestHTTPHost_in:$site,clientRequestPath_like:"/blogs/%/%",edgeResponseStatus:200,edgeResponseContentTypeName:"html",verifiedBotCategory:""},orderBy:[sum_visits_DESC]){count sum{visits} dimensions{clientRequestPath}}
pages:httpRequestsAdaptiveGroups(limit:12,filter:{datetime_geq:$since,datetime_lt:$until,clientRequestHTTPHost_in:$site,edgeResponseStatus:200,edgeResponseContentTypeName:"html",verifiedBotCategory:""},orderBy:[sum_visits_DESC]){count sum{visits} dimensions{clientRequestPath}}
countries:httpRequestsAdaptiveGroups(limit:10,filter:{datetime_geq:$since,datetime_lt:$until,clientRequestHTTPHost_in:$site,edgeResponseContentTypeName:"html",verifiedBotCategory:""},orderBy:[sum_visits_DESC]){sum{visits} dimensions{clientCountryName}}
corpus:httpRequestsAdaptiveGroups(limit:1,filter:{datetime_geq:$since,datetime_lt:$until,clientRequestHTTPHost:$corpus}){count sum{edgeResponseBytes}}
bots:httpRequestsAdaptiveGroups(limit:8,filter:{datetime_geq:$since,datetime_lt:$until,clientRequestHTTPHost_in:$site,verifiedBotCategory_neq:""},orderBy:[count_DESC]){count dimensions{verifiedBotCategory}}
}}}`;

export function normalizeAnalytics(zone, days, detailDays, generatedAt) {
  const daily = (zone.daily || []).map(row => ({
    date: row.dimensions.date, pageViews: row.sum.pageViews, uniques: row.uniq.uniques,
    requests: row.sum.requests, cached: row.sum.cachedRequests, bytes: row.sum.bytes
  }));
  const sum = key => daily.reduce((total, row) => total + (row[key] || 0), 0);
  const requests = sum('requests');
  const paths = rows => (rows || []).map(row => ({ path: row.dimensions.clientRequestPath, visits: row.sum.visits, views: row.count }));
  return {
    days, detailDays, generatedAt,
    totals: {
      pageViews: sum('pageViews'), requests, bytes: sum('bytes'),
      averageDailyUniques: daily.length ? Math.round(sum('uniques') / daily.length) : 0,
      cachedShare: requests ? sum('cached') / requests : 0
    },
    daily,
    articles: paths(zone.articles),
    pages: paths(zone.pages),
    countries: (zone.countries || []).map(row => ({ country: row.dimensions.clientCountryName, visits: row.sum.visits })),
    corpus: { requests: zone.corpus?.[0]?.count || 0, bytes: zone.corpus?.[0]?.sum?.edgeResponseBytes || 0 },
    bots: (zone.bots || []).map(row => ({ category: row.dimensions.verifiedBotCategory, requests: row.count }))
  };
}

export async function getAnalytics(env, days, fetchImpl = fetch, now = Date.now()) {
  const cached = cache.get(days);
  if (cached && now - cached.at < CACHE_MS) return { ...cached.data, cached: true };
  const detailDays = Math.min(days, DETAIL_MAX_DAYS);
  const until = new Date(now);
  const variables = {
    zone: env.STUDIO_CF_ZONE_ID,
    since: new Date(now - detailDays * 864e5).toISOString(),
    until: until.toISOString(),
    sinceDay: new Date(now - (days - 1) * 864e5).toISOString().slice(0, 10),
    untilDay: until.toISOString().slice(0, 10),
    site: SITE_HOSTS,
    corpus: CORPUS_HOST
  };
  const response = await fetchImpl('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STUDIO_CF_ANALYTICS_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.errors?.length) {
    throw Object.assign(new Error(`Cloudflare analytics failed (${response.status})${body.errors?.[0]?.message ? `: ${body.errors[0].message}` : ''}.`), { status: 502 });
  }
  const zone = body.data?.viewer?.zones?.[0];
  if (!zone) throw Object.assign(new Error('Cloudflare returned no data for the zone.'), { status: 502 });
  const data = normalizeAnalytics(zone, days, detailDays, until.toISOString());
  cache.set(days, { at: now, data });
  return data;
}
