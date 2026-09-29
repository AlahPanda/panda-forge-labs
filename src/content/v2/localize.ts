import type { Locale } from '@/content';
import type { ContentKind } from './schema';

type Part = { id?: string } & Record<string, unknown>;
export type LocalizedFields = Partial<Record<'name' | 'summary' | 'description' | 'body' | 'installation' | 'changelog' | 'seoTitle' | 'seoDescription' | 'heroEyebrow' | 'heroTitle' | 'heroSubtitle' | 'supportIntro' | 'communityIntro', string>>;
export type StructuredTranslations = Partial<Record<'features' | 'requirements' | 'faq' | 'items' | 'steps' | 'notices' | 'sections' | 'quickLinks' | 'navigation' | 'footer', Record<string, Record<string, string>>>>;
export type LocalizedEntry = {
  sourceLocale?: Locale;
  translations?: Partial<Record<Locale, { state?: 'partial' | 'complete' | 'needs-review'; fields?: LocalizedFields; structured?: StructuredTranslations }>>;
} & Record<string, unknown>;

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const fieldNames = ['name', 'summary', 'description', 'body', 'installation', 'changelog', 'supportIntro', 'communityIntro'] as const;
const partFields: Record<keyof StructuredTranslations, string[]> = {
  features: ['title', 'description'], requirements: ['title', 'description'], faq: ['question', 'answer'],
  items: ['question', 'answer'], steps: ['title', 'body'], notices: ['text'],
  sections: ['title', 'intro', 'ctaLabel'], quickLinks: ['label'], navigation: ['label'], footer: ['label'],
};

/** Only keyed, non-empty translations override the published original. Unkeyed rows stay in their source language. */
export function localizeItem<T extends LocalizedEntry>(item: T, locale: Locale, options: { includeNeedsReview?: boolean } = {}): T {
  if (locale === item.sourceLocale) return item;
  const translation = item.translations?.[locale];
  if (!translation || (translation.state === 'needs-review' && !options.includeNeedsReview)) return item;
  const overrides: Record<string, unknown> = {};
  for (const field of fieldNames) if (hasText(translation.fields?.[field])) overrides[field] = translation.fields[field];
  if (item.seo && typeof item.seo === 'object') {
    const seo = item.seo as Record<string, unknown>;
    overrides.seo = { ...seo,
      ...(hasText(translation.fields?.seoTitle) ? { title: translation.fields.seoTitle } : {}),
      ...(hasText(translation.fields?.seoDescription) ? { description: translation.fields.seoDescription } : {}),
    };
  }
  if (item.hero && typeof item.hero === 'object') {
    const hero = item.hero as Record<string, unknown>;
    overrides.hero = { ...hero,
      ...(hasText(translation.fields?.heroEyebrow) ? { eyebrow: translation.fields.heroEyebrow } : {}),
      ...(hasText(translation.fields?.heroTitle) ? { title: translation.fields.heroTitle } : {}),
      ...(hasText(translation.fields?.heroSubtitle) ? { subtitle: translation.fields.heroSubtitle } : {}),
    };
  }
  for (const [part, fields] of Object.entries(partFields) as [keyof StructuredTranslations, string[]][]) {
    if (!Array.isArray(item[part]) || !translation.structured?.[part]) continue;
    overrides[part] = (item[part] as Part[]).map((row) => {
      const translated = row.id && translation.structured?.[part]?.[row.id];
      if (!translated) return row;
      return { ...row, ...Object.fromEntries(fields.filter((field) => hasText(translated[field])).map((field) => [field, translated[field]])) };
    });
  }
  return { ...item, ...overrides };
}

/** Counts source fields actually present. A declared 'complete' state never fabricates coverage. */
export function localizationStatus(item: LocalizedEntry, kind: ContentKind, locale: Locale) {
  if (item.sourceLocale === locale) return { translated: 1, total: 1, percent: 100, status: 'original' as const };
  const translation = item.translations?.[locale];
  let total = 0;
  let translated = 0;
  const count = (source: unknown, target: unknown) => { if (hasText(source)) { total++; if (hasText(target)) translated++; } };
  for (const key of fieldNames) {
    if (key === 'name' && ['projects', 'releases', 'launchers', 'settings'].includes(kind)) continue;
    count(item[key], translation?.fields?.[key]);
  }
  const seo = item.seo as Record<string, unknown> | undefined;
  count(seo?.title, translation?.fields?.seoTitle);
  count(seo?.description, translation?.fields?.seoDescription);
  const hero = item.hero as Record<string, unknown> | undefined;
  for (const [key, field] of [['eyebrow', 'heroEyebrow'], ['title', 'heroTitle'], ['subtitle', 'heroSubtitle']] as const) count(hero?.[key], translation?.fields?.[field]);
  for (const [part, fields] of Object.entries(partFields) as [keyof StructuredTranslations, string[]][]) {
    if (!Array.isArray(item[part])) continue;
    for (const row of item[part] as Part[]) for (const field of fields) count(row[field], row.id ? translation?.structured?.[part]?.[row.id]?.[field] : undefined);
  }
  const percent = total ? Math.round(translated * 100 / total) : null;
  const status = !total ? 'unavailable' : translation?.state === 'needs-review' ? 'needs-review' : translated === total ? 'complete' : translated ? 'partial' : 'missing';
  return { translated, total, percent, status } as const;
}
