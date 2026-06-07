export interface StructuredDataOptions {
  /** ISO 8601 timestamp injected at build time; used as dateModified. */
  buildDate: string
}

type JsonLdNode = Record<string, unknown>

interface SquishGraph {
  '@context': string
  '@graph': JsonLdNode[]
}

const SITE_URL = 'https://squish.icjia.app'

const ID = {
  organization: `${SITE_URL}/#organization`,
  author: `${SITE_URL}/#author`,
  website: `${SITE_URL}/#website`,
  webpage: `${SITE_URL}/#webpage`,
  webapp: `${SITE_URL}/#webapp`,
}

/** First public commit — the site's published date. */
const DATE_PUBLISHED = '2026-02-04'

/**
 * Build the schema.org JSON-LD `@graph` for Squish.
 *
 * Pure and framework-free so it can be unit-tested directly; the page wires the
 * result into `<head>` via `useHead`. `dateModified` is driven by the build
 * timestamp so freshness stays accurate on every deploy without manual edits.
 */
export function buildSquishGraph({ buildDate }: StructuredDataOptions): SquishGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ID.organization,
        'name': 'Illinois Criminal Justice Information Authority',
        'alternateName': 'ICJIA',
        'url': 'https://icjia.illinois.gov/',
      },
      {
        '@type': 'Person',
        '@id': ID.author,
        'name': 'cschweda',
        'url': 'https://github.com/cschweda',
      },
      {
        '@type': 'WebSite',
        '@id': ID.website,
        'name': 'Squish',
        'description':
          'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview.',
        'url': `${SITE_URL}/`,
        'inLanguage': 'en',
        'publisher': { '@id': ID.organization },
      },
      {
        '@type': 'WebPage',
        '@id': ID.webpage,
        'name': 'Squish - Image Compression for Writers and Developers',
        'description':
          'Privacy-focused image compression for writers and developers. Compress images instantly in your browser with real-time preview. No uploads required.',
        'url': `${SITE_URL}/`,
        'inLanguage': 'en',
        'isPartOf': { '@id': ID.website },
        'about': { '@id': ID.webapp },
        'primaryImageOfPage': `${SITE_URL}/og-image.png`,
        'datePublished': DATE_PUBLISHED,
        'dateModified': buildDate,
        'author': { '@id': ID.author },
        'publisher': { '@id': ID.organization },
      },
      {
        '@type': 'WebApplication',
        '@id': ID.webapp,
        'name': 'Squish',
        'description':
          'Privacy-focused image compression for writers and developers. Compress PNG, JPEG, and WebP images instantly in your browser with a live side-by-side comparison slider. No uploads — all processing happens locally on your device.',
        'url': `${SITE_URL}/`,
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'Any',
        'browserRequirements': 'Requires JavaScript and a modern web browser.',
        'inLanguage': 'en',
        'isAccessibleForFree': true,
        'softwareVersion': '1.4.0',
        'license': 'https://opensource.org/licenses/MIT',
        'datePublished': DATE_PUBLISHED,
        'dateModified': buildDate,
        'author': { '@id': ID.author },
        'creator': { '@id': ID.author },
        'publisher': { '@id': ID.organization },
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'featureList': [
          'Client-side image compression for PNG, JPEG, and WebP',
          'Live before/after comparison slider',
          'Zoom (100–800%) and pan for pixel-level inspection',
          'Adjustable quality with color-coded guidance',
          'Batch processing with individual or bulk download',
          'No uploads — images never leave your device',
        ],
        'sameAs': 'https://github.com/ICJIA/icjia-squish-2026',
      },
    ],
  }
}
