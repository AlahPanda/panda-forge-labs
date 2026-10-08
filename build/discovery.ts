import type { Plugin } from 'vite';
import projects from '../src/content/v2/projects.json';
import launchers from '../src/content/v2/launchers.json';
import articles from '../src/content/v2/articles.json';
import guides from '../src/content/v2/guides.json';
import { validatedPublicItems } from '../src/content/v2/publication';
import { type ArticleV2, type ContentKind } from '../src/content/v2/schema';
import identity from '../src/config/publicSite.json';

export const escapeXml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (letter) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[letter]!);
const url = (path: string) => new URL(path, identity.origin).href;
type Discoverable = { slug: string; seo?: { noindex?: boolean }; status?: string };
export function discoveryDocuments(collections: Record<string, unknown>) {
  const routes = ['/', '/modpacks', '/launchers', '/news', '/guides', '/faq', '/about', '/support', '/legal/privacy', '/legal/terms'];
  for (const [kind, prefix] of [['projects', 'modpacks'], ['launchers', 'launchers'], ['articles', 'news'], ['guides', 'guides']]) {
    for (const item of validatedPublicItems<Discoverable>(kind as ContentKind, collections[kind])) {
      if (!item.seo?.noindex && !(kind === 'projects' && item.status === 'internal-prototype')) routes.push(`/${prefix}/${item.slug}`);
    }
  }
  const published = validatedPublicItems<ArticleV2>('articles', collections.articles);
  const feed = published.filter((item) => !item.seo?.noindex && item.publishedAt);
  // Only validated public metadata is included. Never import the private draft store.
  const newsIndex = Object.fromEntries(published.map((item) => [item.slug, {
    slug: item.slug, name: item.name, summary: item.summary, sourceLocale: item.sourceLocale,
    author: item.author, publishedAt: item.publishedAt, modifiedAt: item.modifiedAt,
    seo: item.seo, image: item.seo?.image || item.media?.find((media) => media.kind === 'image')?.url,
  }]));
  return {
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((path) => `  <url><loc>${escapeXml(url(path))}</loc></url>`).join('\n')}\n</urlset>\n`,
    'rss.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>AlahPanda Labs News</title><link>${escapeXml(url('/news'))}</link><description>Published AlahPanda Labs editorial updates</description><language>en</language>${feed.map((article) => `<item><title>${escapeXml(article.name)}</title><link>${escapeXml(url('/news/' + article.slug))}</link><guid isPermaLink="true">${escapeXml(url('/news/' + article.slug))}</guid><description>${escapeXml(article.summary)}</description><pubDate>${new Date(article.publishedAt!).toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`,
    'robots.txt': `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${url('/sitemap.xml')}\n`,
    'news-index.json': JSON.stringify(newsIndex),
  };
}
export function discoveryPlugin(): Plugin {
  return {
    name: 'validated-public-discovery', apply: 'build',
    generateBundle() {
      for (const [fileName, source] of Object.entries(discoveryDocuments({ projects, launchers, articles, guides }))) {
        this.emitFile({ type: 'asset', fileName, source });
      }
    },
  };
}
