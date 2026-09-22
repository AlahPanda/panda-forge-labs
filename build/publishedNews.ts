import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Builds only published articles into the public JavaScript bundle. */
export function publishedNews(source: string) {
  const parsed = JSON.parse(source) as { articles: Array<{ draft: boolean }> };
  if (!Array.isArray(parsed.articles) || parsed.articles.some((a) => typeof a.draft !== 'boolean')) {
    throw new Error('Invalid article publication state');
  }
  return { articles: parsed.articles.filter((article) => !article.draft) };
}

export function publishedNewsPlugin() {
  const id = '\0virtual:published-news';
  const file = resolve(process.cwd(), 'src/content/news.json');
  return {
    name: 'published-news',
    resolveId(source: string) { if (source === 'virtual:published-news') return id; },
    load(source: string) {
      if (source !== id) return;
      this.addWatchFile(file);
      return `export default ${JSON.stringify(publishedNews(readFileSync(file, 'utf8')))};`;
    },
  };
}
