import { Helmet } from 'react-helmet-async';

interface Props {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

/** Dynamic metadata via react-helmet-async — works for OG/Twitter previews. */
export default function Seo({ title, description, image, url, type = 'website' }: Props) {
  const desc = description ?? '';
  const fullUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const img = image ?? `${typeof window !== 'undefined' ? window.location.origin : ''}/placeholder.svg`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={img} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
