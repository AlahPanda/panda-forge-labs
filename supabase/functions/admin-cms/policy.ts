import { CONTENT_KINDS, collectionPath, parseCollection, parseItem, type ContentKind } from '../../../src/content/v2/schema.ts';

export { CONTENT_KINDS, collectionPath, parseCollection, parseItem };
export type { ContentKind };
export function isContentKind(value: unknown): value is ContentKind {
  return typeof value === 'string' && CONTENT_KINDS.includes(value as ContentKind);
}

export const ALLOWED_PATHS = new Set([
  'src/content/site.json', 'src/content/modpacks.json', 'src/content/news.json',
  'src/content/faq.json', 'src/content/i18n.json', 'src/content/reviews.json',
  ...CONTENT_KINDS.map(collectionPath),
]);

const ROOT_KEYS: Record<string, string> = {
  'src/content/site.json': 'site', 'src/content/modpacks.json': 'modpacks',
  'src/content/news.json': 'articles', 'src/content/faq.json': 'categories',
  'src/content/reviews.json': 'reviews',
};

export function validateContent(path: string, content: unknown): string | null {
  if (!ALLOWED_PATHS.has(path)) return 'Invalid path';
  if (typeof content !== 'string' || content.length > 1_000_000) return 'Invalid content';
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { return 'Content is not valid JSON'; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 'Invalid content shape';
  const kind = CONTENT_KINDS.find((candidate) => collectionPath(candidate) === path);
  if (kind) {
    try { parseCollection(kind, parsed); return null; }
    catch { return `Invalid ${kind} collection`; }
  }
  const obj = parsed as Record<string, unknown>;
  const root = ROOT_KEYS[path];
  if (root && (root === 'site' ? (!obj.site || typeof obj.site !== 'object' || Array.isArray(obj.site)) : !Array.isArray(obj[root]))) {
    return 'Invalid content shape';
  }
  // Legacy public news must never receive private drafts. Existing published entries remain untouched.
  if (path === 'src/content/news.json' && (obj.articles as unknown[]).some((a) =>
    !a || typeof a !== 'object' || typeof (a as { slug?: unknown }).slug !== 'string' ||
    (a as { draft?: unknown }).draft !== false)) return 'Drafts cannot be saved to public GitHub';
  return null;
}

export function validateClaims(payload: Record<string, unknown>, now = Math.floor(Date.now() / 1000)): boolean {
  return payload.sub === 'admin' && typeof payload.exp === 'number' && payload.exp > now &&
    typeof payload.iat === 'number' && payload.iat <= now;
}

export function canSave(expectedSha: unknown, currentSha: unknown): boolean {
  return typeof expectedSha === 'string' && expectedSha.length > 0 && expectedSha === currentSha;
}
