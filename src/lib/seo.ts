/**
 * Shared SEO constants and JSON-LD builders.
 *
 * Everything here emits a single connected `@graph` per page rather than a pile
 * of standalone snippets. The `@id` cross-references are the point: answer
 * engines resolve entities (this Organization, this WebSite, this Person) across
 * pages, and a graph tells them the article, its author and its publisher are
 * the same entities they saw elsewhere on the site. Disconnected snippets do not.
 */

export const SITE = {
  url: 'https://hadithcriticblog.com',
  name: 'HadithCritic',
  tagline: 'Verification Over Reputation',
  description:
    'Independent historical criticism of hadith literature: isnad analysis, transmission history, manuscript evidence, and source-level study of early Islamic reports.',
  logo: '/images/brand/hc-logo-transparent-512.png',
  lang: 'en',
  social: [
    'https://x.com/HadithCritic',
    'https://www.youtube.com/@HadithCritic',
    'https://github.com/HadithCritic/HadithCriticBlog'
  ]
} as const;

/** Stable @id anchors so every page points at the same entity nodes. */
export const ID = {
  org: `${SITE.url}/#organization`,
  site: `${SITE.url}/#website`,
  author: `${SITE.url}/#author`
} as const;

const abs = (path: string) => new URL(path, SITE.url).href;

export type Graph = Record<string, unknown>;

/**
 * The publisher entity. `sameAs` is what lets an engine connect this site to the
 * YouTube channel and X account as one identity rather than three unrelated
 * sources.
 */
export function organization(): Graph {
  return {
    '@type': 'Organization',
    '@id': ID.org,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE.url}/#logo`,
      url: abs(SITE.logo),
      contentUrl: abs(SITE.logo),
      caption: SITE.name
    },
    image: { '@id': `${SITE.url}/#logo` },
    sameAs: [...SITE.social],
    knowsAbout: [
      'Hadith studies',
      'Isnad criticism',
      "'Ilm al-rijal",
      'Early Islamic history',
      'Quranic studies',
      'Historical criticism',
      'Manuscript transmission'
    ]
  };
}

export function website(): Graph {
  return {
    '@type': 'WebSite',
    '@id': ID.site,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    publisher: { '@id': ID.org },
    inLanguage: SITE.lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/blogs?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function author(name: string): Graph {
  const isHouse = name === SITE.name;
  return {
    '@type': 'Person',
    '@id': isHouse ? ID.author : `${SITE.url}/#author-${encodeURIComponent(name)}`,
    name,
    ...(isHouse ? { url: SITE.url, sameAs: [...SITE.social] } : {}),
    ...(isHouse ? { affiliation: { '@id': ID.org } } : {})
  };
}

export interface Crumb {
  name: string;
  url: string;
}

export function breadcrumbs(trail: Crumb[], pageUrl: string): Graph {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.url)
    }))
  };
}

export function webPage(opts: {
  url: string;
  title: string;
  description: string;
  hasBreadcrumb?: boolean;
  datePublished?: string;
  dateModified?: string;
}): Graph {
  return {
    '@type': 'WebPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': ID.site },
    inLanguage: SITE.lang,
    ...(opts.hasBreadcrumb ? { breadcrumb: { '@id': `${opts.url}#breadcrumb` } } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {})
  };
}

/**
 * ScholarlyArticle rather than BlogPosting: this is source-critical research with
 * citations, and the type signals that to anything reading the graph.
 */
export function scholarlyArticle(opts: {
  url: string;
  title: string;
  description: string;
  authorName: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  section?: string;
  keywords?: string[];
  wordCount?: number;
  about?: string[];
}): Graph {
  return {
    '@type': 'ScholarlyArticle',
    '@id': `${opts.url}#article`,
    isPartOf: { '@id': `${opts.url}#webpage` },
    mainEntityOfPage: { '@id': `${opts.url}#webpage` },
    headline: opts.title,
    name: opts.title,
    description: opts.description,
    url: opts.url,
    author: { '@id': author(opts.authorName)['@id'] as string },
    publisher: { '@id': ID.org },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    inLanguage: SITE.lang,
    isAccessibleForFree: true,
    ...(opts.image ? { image: abs(opts.image) } : {}),
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.keywords?.length ? { keywords: opts.keywords.join(', ') } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    ...(opts.about?.length
      ? { about: opts.about.map((t) => ({ '@type': 'Thing', name: t })) }
      : {})
  };
}

/** Serialize a set of nodes as one connected graph document. */
export function graph(nodes: Graph[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}

/**
 * A topic hub. `mainEntity` as an ItemList is what lets an engine read the page
 * as "here is the full set of studies on this topic" rather than as a list of
 * links it has to infer meaning from.
 */
export function collectionPage(opts: {
  url: string;
  title: string;
  description: string;
  about?: string[];
  items: { name: string; url: string }[];
}): Graph {
  return {
    '@type': 'CollectionPage',
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': ID.site },
    inLanguage: SITE.lang,
    breadcrumb: { '@id': `${opts.url}#breadcrumb` },
    ...(opts.about?.length
      ? { about: opts.about.map((t) => ({ '@type': 'Thing', name: t })) }
      : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: abs(it.url)
      }))
    }
  };
}

/**
 * A classical hadith transmitter as a schema.org Person.
 *
 * This is the highest-value markup on the site. The rijal corpus is 20,915
 * biographical entries that exist nowhere else in queryable form, and an answer
 * engine asked "who was X and was he considered reliable" can only use them if
 * it can tell the page is about a person and which person that is. Names,
 * dates, places and the reliability verdict are all disambiguation signals.
 */
export function person(opts: {
  url: string;
  nameEn: string;
  nameAr?: string;
  fullName?: string;
  kunya?: string;
  description: string;
  deathYearCE?: string;
  deathPlace?: string;
  places?: string[];
  generation?: string;
  id: number;
}): Graph {
  const alternates = [opts.nameAr, opts.fullName, opts.kunya].filter(
    (n): n is string => Boolean(n) && n !== opts.nameEn
  );

  return {
    '@type': 'Person',
    '@id': `${opts.url}#person`,
    name: opts.nameEn || opts.nameAr,
    ...(alternates.length ? { alternateName: alternates } : {}),
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: { '@id': `${opts.url}#webpage` },
    identifier: String(opts.id),
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Hadith transmitter'
    },
    knowsAbout: 'Hadith transmission',
    // Hijri dates do not map onto ISO 8601, so only the Gregorian equivalent is
    // emitted. Omitting is better than emitting a date an engine will misread.
    ...(opts.deathYearCE && /^\d{1,4}$/.test(opts.deathYearCE)
      ? { deathDate: opts.deathYearCE.padStart(4, '0') }
      : {}),
    ...(opts.deathPlace ? { deathPlace: { '@type': 'Place', name: opts.deathPlace } } : {}),
    ...(opts.places?.length
      ? { homeLocation: opts.places.map((p) => ({ '@type': 'Place', name: p })) }
      : {}),
    ...(opts.generation ? { disambiguatingDescription: opts.generation } : {})
  };
}

/** WebPage node whose subject is a single entity, linked via mainEntity. */
export function entityPage(opts: {
  url: string;
  title: string;
  description: string;
  entityId: string;
}): Graph {
  return {
    '@type': ['WebPage', 'ProfilePage'],
    '@id': `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    isPartOf: { '@id': ID.site },
    inLanguage: SITE.lang,
    breadcrumb: { '@id': `${opts.url}#breadcrumb` },
    mainEntity: { '@id': opts.entityId },
    about: { '@id': opts.entityId }
  };
}

// --- rijal sitemap ---------------------------------------------------------

export const NARRATOR_SITEMAP_PAGE_SIZE = 10000;

/**
 * Which narrators are worth submitting to a search engine.
 *
 * Substance means at least one recorded critical statement or at least one
 * attributed hadith. Placeholder entries for unidentified transmitters are
 * excluded outright.
 */
export const narratorSitemapWhere = 'unnamed = 0 AND (statement_count > 0 OR hadith_count > 0)';
