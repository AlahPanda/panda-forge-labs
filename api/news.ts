import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { newsDocument, type NewsIndex } from '../server/newsDocument.js';

type Request = IncomingMessage & { query?: { slug?: string | string[] } };
let assets: { index: NewsIndex; template: string } | undefined;
export function createNewsHandler(load: () => { index: NewsIndex; template: string }) {
  return (request: Request, response: ServerResponse) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD'); response.statusCode = 405; response.end(); return;
    }
    const supplied = request.query?.slug ?? new URL(request.url || '/', 'https://local.invalid').pathname.split('/')[2];
    let slug: string;
    try { slug = typeof supplied === 'string' ? decodeURIComponent(supplied) : ''; } catch { slug = ''; }
    // Do not allow query arrays, paths, prototypes or HTML into the route identity.
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) slug = 'invalid-article-url';
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, must-revalidate');
    try {
      const { index, template } = load();
      const document = newsDocument(slug, index, template);
      response.statusCode = document.status;
      response.setHeader('X-Robots-Tag', document.robots);
      response.end(request.method === 'HEAD' ? undefined : document.html);
    } catch {
      // A broken deployment must not turn every absent article into an indexable 200.
      response.statusCode = 503;
      response.setHeader('Cache-Control', 'no-store');
      response.setHeader('X-Robots-Tag', 'noindex, follow');
      response.end(request.method === 'HEAD' ? undefined : 'Article service unavailable');
    }
  };
}
export default createNewsHandler(() => {
  assets ??= {
    index: JSON.parse(readFileSync(join(process.cwd(), 'dist/news-index.json'), 'utf8')) as NewsIndex,
    template: readFileSync(join(process.cwd(), 'dist/index.html'), 'utf8'),
  };
  return assets;
});
