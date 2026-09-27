import type { Locale } from '@/content';

type EditorialFields = 'name' | 'summary' | 'description' | 'body';
export type LocalizedEntry = { sourceLocale?: Locale; translations?: Partial<Record<Locale, { fields?: Partial<Record<EditorialFields, string>> }>> };

/** Missing or blank translations always fall back to the published original. */
export function localizeItem<T extends LocalizedEntry>(item: T, locale: Locale): T {
  const fields = item.translations?.[locale]?.fields;
  if (!fields || locale === item.sourceLocale) return item;
  const overrides = Object.fromEntries((['name', 'summary', 'description', 'body'] as const)
    .filter((key) => typeof fields[key] === 'string' && fields[key]!.trim().length > 0)
    .map((key) => [key, fields[key]]));
  return { ...item, ...overrides };
}
