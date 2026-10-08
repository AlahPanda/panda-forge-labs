import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { discoveryDocuments } from '../../build/discovery';
import { createNewsHandler } from '../../api/news';
import { newsDocument, type NewsIndex } from '../../server/newsDocument';
import { validatedPublicItems } from '../content/v2/publication';
import articles from '../content/v2/articles.json';
import removed from '../content/removedNews.json';
import identity from '../config/publicSite.json';

const documents = discoveryDocuments({ articles });
const index = JSON.parse(documents['news-index.json']) as NewsIndex;
const template = readFileSync('index.html', 'utf8');
let server: Server;
let origin: string;
beforeAll(async () => {
  server = createServer(createNewsHandler(() => ({ index, template })));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test server');
  origin = `http://127.0.0.1:${address.port}`;
});
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); });

describe('article HTTP and discovery policy', () => {
  it.each(removed)('returns a real HTTP 410 for removed slug %s', async (slug) => {
    const result = await fetch(origin + '/news/' + slug);
    expect(result.status).toBe(410);
    expect(result.headers.get('x-robots-tag')).toBe('noindex, follow');
    expect(await result.text()).not.toContain('Article under review');
    expect(documents['sitemap.xml']).not.toContain('/news/' + slug);
    expect(documents['rss.xml']).not.toContain('/news/' + slug);
  });
  it('returns 404, not a soft-404, for an unknown article, including HEAD', async () => {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(origin + '/news/no-such-article', { method });
      expect(response.status).toBe(404);
      expect(response.headers.get('x-robots-tag')).toContain('noindex');
      if (method === 'HEAD') expect(await response.text()).toBe('');
    }
  });
  it.each(articles.items)('serves indexable HTTP metadata and feed entry for $slug', async (article) => {
    const response = await fetch(origin + '/news/' + article.slug);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-robots-tag')).toBe('index, follow');
    const html = await response.text();
    expect(html).toContain(identity.origin + '/news/' + article.slug);
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('"@type":"Article"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('noindex');
    expect(documents['sitemap.xml']).toContain(identity.origin + '/news/' + article.slug);
    expect(documents['rss.xml']).toContain(identity.origin + '/news/' + article.slug);
  });
  it('defaults published articles to indexable but respects explicit noindex', () => {
    const publicItem = { slug: 'public-item', name: 'Public', body: 'Content', publishedAt: '2026-09-28T00:00:00Z' };
    const hidden = { ...publicItem, slug: 'hidden-item', seo: { noindex: true } };
    const output = discoveryDocuments({ articles: { schemaVersion: 2, items: [publicItem, hidden] } });
    expect(output['sitemap.xml']).toContain('/news/public-item');
    expect(output['rss.xml']).toContain('/news/public-item');
    expect(output['sitemap.xml']).not.toContain('/news/hidden-item');
    expect(output['rss.xml']).not.toContain('/news/hidden-item');
    expect(newsDocument(hidden.slug, JSON.parse(output['news-index.json']), template).robots).toContain('noindex');
  });
  it('excludes drafts, invalid and unreviewed translations from every public output', () => {
    const item = { slug: 'private-item', name: 'Private', body: 'Private text' };
    for (const candidate of [{ ...item, draft: true }, { ...item, draft: false }, { ...item, body: 123 }, { ...item, translations: { es: { state: 'needs-review', fields: { body: 'Private translation' } } } }]) {
      const collection = { schemaVersion: 2, items: [candidate] };
      expect(validatedPublicItems('articles', collection)).toEqual([]);
      const output = discoveryDocuments({ articles: collection });
      for (const document of Object.values(output)) expect(document).not.toContain('private-item');
    }
  });
  it('preserves theme, entrypoint and independent favicon declarations without duplicating metadata', () => {
    const document = newsDocument(articles.items[0].slug, index, template).html;
    expect(document).toContain('/favicon.ico');
    expect(document).toContain('savedTheme');
    expect(document).toContain('/src/main.tsx');
    expect(document.match(/<title/g)).toHaveLength(1);
    expect(document.match(/rel="canonical"/g)).toHaveLength(1);
    expect(document.match(/name="robots"/g)).toHaveLength(1);
  });
  it('escapes metadata and embedded JSON instead of injecting executable markup', () => {
    const item = { slug: 'unsafe-text', name: '</title><script>alert(1)</script>', sourceLocale: 'en' };
    const html = newsDocument(item.slug, { [item.slug]: item }, template).html;
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('\\u003c/title>');
  });
  it('rejects malformed identities, forbids POST and fails closed if build artifacts are unavailable', async () => {
    expect((await fetch(origin + '/news/__proto__')).status).toBe(404);
    expect((await fetch(origin + '/news/a%3Cb')).status).toBe(404);
    expect((await fetch(origin + '/news/unknown', { method: 'POST' })).status).toBe(405);
    const broken = createServer(createNewsHandler(() => { throw new Error('Missing build'); }));
    await new Promise<void>((resolve) => broken.listen(0, '127.0.0.1', resolve));
    try {
      const address = broken.address();
      if (!address || typeof address === 'string') throw new Error('No server');
      const response = await fetch(`http://127.0.0.1:${address.port}/news/example`);
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('no-store');
    } finally { await new Promise<void>((resolve) => broken.close(() => resolve())); }
  });
  it('does not resurrect removed identities via accidental V2 publication', () => {
    const output = discoveryDocuments({ articles: { schemaVersion: 2, items: [{ slug: removed[0], name: 'Accidental reuse', body: 'text' }] } });
    expect(output['news-index.json']).toBe('{}');
    expect(output['sitemap.xml']).not.toContain(removed[0]);
    expect(output['rss.xml']).not.toContain(removed[0]);
  });
  it('keeps Vercel article handling before the SPA fallback and packages the generated index', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
    expect(config.rewrites[0]).toEqual({ source: '/news/:slug', destination: '/api/news?slug=:slug' });
    expect(config.functions['api/news.ts'].includeFiles).toBe('dist/{index.html,news-index.json}');
  });
});
