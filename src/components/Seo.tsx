import { Helmet } from 'react-helmet-async';
import { canonicalUrl, publicAssetUrl, publicSite } from '@/lib/publicSite';

interface Props {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Runtime metadata; index.html supplies a static crawler baseline. */
export default function Seo({ title, description, image, url, type = 'website', noindex = false, jsonLd }: Props) {
  const desc = description ?? '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const fullUrl = canonicalUrl(url ?? pathname);
  const img = publicAssetUrl(image || publicSite.image);

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
