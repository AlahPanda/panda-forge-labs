import { readFileSync } from 'node:fs';
import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { canonicalUrl, PUBLIC_SITE_ORIGIN, publicSite } from '@/lib/publicSite';
import { publicLaunchers, publicProjects, publicReleasesFor } from '@/content/publicResolver';
import { launchersForList } from '@/lib/launchers';
import Seo from '@/components/Seo';
import App from '@/App';

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Offline test'); }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });

describe('public production identity', () => {
  it('pins canonical identity independently of deployment hosts and tracking parameters', async () => {
    expect(window.location.origin).not.toBe(PUBLIC_SITE_ORIGIN);
    expect(canonicalUrl('https://deployment.vercel.app/news/example?utm_source=x#top')).toBe(PUBLIC_SITE_ORIGIN + '/news/example');
    render(<HelmetProvider><Seo title="Preview" url="https://deployment.vercel.app/modpacks/mac-native?tracking=x"/></HelmetProvider>);
    await waitFor(() => expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', PUBLIC_SITE_ORIGIN + '/modpacks/mac-native'));
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute('content', PUBLIC_SITE_ORIGIN + publicSite.image);
  });

  it.each([
    ['/legal/privacy', '/legal/privacy'], ['/legal/terms', '/legal/terms'],
    ['/legal?kind=privacy', '/legal/privacy'], ['/legal?kind=terms', '/legal/terms'],
  ])('renders %s with the distinct preferred legal URL', async (from, to) => {
    window.history.replaceState({}, '', from);
    render(<App/>);
    await waitFor(() => expect(window.location.pathname).toBe(to));
    await waitFor(() => expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', PUBLIC_SITE_ORIGIN + to));
    expect(document.querySelector('article')?.textContent).toContain(to.endsWith('privacy') ? 'Data we handle' : 'Accounts and licensing');
  });

  it('keeps static metadata, existing brand asset and discovery on the same public origin', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain(publicSite.title.replace('&', '&amp;'));
    expect(html).toContain(publicSite.description);
    expect(html).toContain(PUBLIC_SITE_ORIGIN + publicSite.image);
    expect(readFileSync('public' + publicSite.image).length).toBeGreaterThan(0);
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    expect(sitemap).toContain(PUBLIC_SITE_ORIGIN + '/legal/privacy');
    expect(sitemap).toContain(PUBLIC_SITE_ORIGIN + '/legal/terms');
    expect(sitemap).not.toMatch(/legal\?|\/admin|\/draft|preview\.test/);
    for (const loc of sitemap.matchAll(/<loc>(.*?)<\/loc>/g)) expect(loc[1].startsWith(PUBLIC_SITE_ORIGIN + '/')).toBe(true);
    expect(readFileSync('public/robots.txt', 'utf8')).toContain('Disallow: /admin');
  });
});

describe('public external destinations', () => {
  it('has no shortener downloads in published project/launcher data or legacy fallback', () => {
    const urls: string[] = [];
    for (const entry of publicLaunchers()) {
      urls.push(...(entry.item.downloads || []).map((download) => download.url));
      if (entry.source === 'v2') urls.push(...(entry.item.officialLinks || []).map((link) => link.url));
    }
    for (const entry of publicProjects()) if (entry.source === 'v2') {
      urls.push(...(entry.item.distribution || []).flatMap((d) => d.url ? [d.url] : []));
      for (const release of publicReleasesFor(entry.item)) urls.push(...(release.distribution || []).flatMap((d) => d.url ? [d.url] : []));
    }
    urls.push(...launchersForList().flatMap((launcher) => launcher.downloads.map((d) => d.url)));
    expect(urls.length).toBeGreaterThan(10);
    for (const url of urls) {
      const parsed = new URL(url);
      expect(parsed.protocol).toBe('https:');
      expect(parsed.hostname).not.toMatch(/(^|\.)(ouo\.io|bit\.ly|tinyurl\.com|t\.co)$/);
    }
  });

  it.each(['/', '/modpacks', '/modpacks/mac-native', '/launchers', '/launchers/astralrinth', '/news', '/guides', '/faq', '/about', '/support'])('preserves safe external link semantics on %s', async (path) => {
    window.history.replaceState({}, '', path);
    render(<App/>);
    await waitFor(() => expect(document.querySelector('main')).not.toBeNull());
    const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')];
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.href).not.toMatch(/https?:\/\/(?:[^/]+\.)?ouo\.io\//);
      if (link.target === '_blank') {
        expect(link.rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
      }
    }
  });
});
