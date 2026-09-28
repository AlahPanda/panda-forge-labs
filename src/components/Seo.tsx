import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Dynamic metadata via react-helmet-async — works for OG/Twitter previews. */
export default function Seo({ title, description, image, url, type = 'website', noindex = false, jsonLd }: Props) {
  const desc = description ?? '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const fullUrl = url ?? (origin ? new URL(pathname, origin).href : '');
  const img = image && origin ? new URL(image, origin).href : undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      {desc && <meta name="description" content={desc} />}
      {fullUrl && <link rel="canonical" href={fullUrl} />}
      {noindex && <meta name="robots" content="noindex,follow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {desc && <meta property="og:description" content={desc} />}
      {fullUrl && <meta property="og:url" content={fullUrl} />}
      {img && <meta property="og:image" content={img} />}

      {/* Twitter */}
      <meta name="twitter:card" content={img ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      {desc && <meta name="twitter:description" content={desc} />}
      {img && <meta name="twitter:image" content={img} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>}
    </Helmet>
  );
}
