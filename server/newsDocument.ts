import removed from '../src/content/removedNews.json' with { type: 'json' };
import identity from '../src/config/publicSite.json' with { type: 'json' };

export interface NewsMetadata {
  slug: string; name: string; summary?: string; sourceLocale: string; author?: string;
  publishedAt?: string; modifiedAt?: string; image?: string;
  seo?: { title?: string; description?: string; noindex?: boolean };
}
export type NewsIndex = Record<string, NewsMetadata>;
const gone = new Set<string>(removed);
const escape = (value: string) => value.replace(/[&<>"']/g, (letter) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[letter]!);
const serialize = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

/** Kept server-side: removed slugs are HTTP tombstones, not an editorial library. */
export function newsDocument(slug: string, index: NewsIndex, template: string) {
  const article = Object.prototype.hasOwnProperty.call(index, slug) ? index[slug] : undefined;
  const status = gone.has(slug) ? 410 : article ? 200 : 404;
  const current = status === 200 ? article : undefined;
  const noindex = !current || current.seo?.noindex === true;
  const title = (current?.seo?.title || current?.name || (status === 410 ? 'Article removed' : 'Article not found')) + ' — AlahPanda Labs';
  const description = current?.seo?.description || current?.summary || current?.name || 'This article is not available.';
  const canonical = new URL('/news/' + encodeURIComponent(slug), identity.origin).href;
  const image = new URL(current?.image || '/brand/overlook-day.webp', identity.origin).href;
  const robots = noindex ? 'noindex, follow' : 'index, follow';
  const schema = current ? [{
    '@context': 'https://schema.org', '@type': 'Article', headline: current.name,
    description, mainEntityOfPage: canonical, image, inLanguage: current.sourceLocale,
    ...(current.author ? { author: { '@type': 'Person', name: current.author } } : {}),
    ...(current.publishedAt ? { datePublished: current.publishedAt } : {}),
    ...(current.modifiedAt ? { dateModified: current.modifiedAt } : {}),
  }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: identity.origin + '/' },
    { '@type': 'ListItem', position: 2, name: 'News', item: identity.origin + '/news' },
    { '@type': 'ListItem', position: 3, name: current.name, item: canonical },
  ] }] : [];
  // Replace only Helmet-managed identity tags. Theme initializer, entry assets and
  // favicon declarations (including the independent browser-icons PR) stay intact.
  const head = `<title data-rh="true">${escape(title)}</title>
<meta data-rh="true" name="description" content="${escape(description)}" />
<meta data-rh="true" name="robots" content="${robots}" />
<link data-rh="true" rel="canonical" href="${escape(canonical)}" />
<meta data-rh="true" property="og:type" content="${current ? 'article' : 'website'}" />
<meta data-rh="true" property="og:title" content="${escape(title)}" />
<meta data-rh="true" property="og:description" content="${escape(description)}" />
<meta data-rh="true" property="og:url" content="${escape(canonical)}" />
<meta data-rh="true" property="og:image" content="${escape(image)}" />
<meta data-rh="true" name="twitter:card" content="summary_large_image" />
<meta data-rh="true" name="twitter:title" content="${escape(title)}" />
<meta data-rh="true" name="twitter:description" content="${escape(description)}" />
<meta data-rh="true" name="twitter:image" content="${escape(image)}" />
<script data-rh="true" type="application/ld+json">${serialize(schema)}</script>`;
  const html = template
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<(?:meta|link)\b(?=[^>]*\bdata-rh="true")[^>]*>/gi, '')
    .replace(/<script\b(?=[^>]*\bdata-rh="true")[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace('</head>', head + '\n</head>');
  return { status, robots, html };
}
