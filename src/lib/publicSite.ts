import configuration from '@/config/publicSite.json';

export const publicSite = configuration;
export const PUBLIC_SITE_ORIGIN = publicSite.origin;

/** Deployment hostnames and tracking parameters never define public identity. */
export function canonicalUrl(path = '/'): string {
  const parsed = new URL(path, PUBLIC_SITE_ORIGIN);
  let pathname = parsed.pathname;
  if (pathname === '/legal') pathname = parsed.searchParams.get('kind') === 'terms' ? '/legal/terms' : '/legal/privacy';
  if (pathname === '/projects') pathname = '/modpacks';
  return PUBLIC_SITE_ORIGIN + pathname;
}

export function publicAssetUrl(path: string): string {
  return new URL(path, PUBLIC_SITE_ORIGIN).href;
}

export function homepageStructuredData(): Record<string, unknown>[] {
  return [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'AlahPanda Labs', url: canonicalUrl('/') },
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'AlahPanda Labs', url: canonicalUrl('/') },
  ];
}
