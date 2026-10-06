import { parseCollection, type ContentKind } from './schema';
import removedNews from '../removedNews.json';
const retiredArticleSlugs = new Set<string>(removedNews);

export function validatedPublicItems<T>(kind: ContentKind, input: unknown): T[] {
  if (!input || typeof input !== 'object' || (input as { schemaVersion?: unknown }).schemaVersion !== 2 || !Array.isArray((input as { items?: unknown }).items)) return [];
  const seen = new Set<string>();
  return (input as { items: unknown[] }).items.flatMap((candidate) => {
    try {
      const item = parseCollection(kind, { schemaVersion: 2, items: [candidate] }).items[0];
      // A draft marker on a checked-in record is an editorial mistake: fail closed.
      if ((candidate as { draft?: unknown }).draft !== undefined || seen.has(item.slug) || (kind === 'articles' && retiredArticleSlugs.has(item.slug))) return [];
      seen.add(item.slug);
      return [item as T];
    } catch { return []; }
  });
}
