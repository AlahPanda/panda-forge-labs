import { z } from 'zod';

export const localeSchema = z.enum(['pt-PT', 'pt-BR', 'en', 'es']);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens').max(100);
const text = z.string().max(30_000);
const shortText = z.string().max(400);
const url = z.string().url().refine((value) => /^https?:\/\//.test(value), 'Use an HTTP(S) URL');
const media = z.object({ url, alt: shortText.optional(), caption: shortText.optional(), kind: z.enum(['image', 'video']).default('image') }).strict();
const seo = z.object({ title: shortText.optional(), description: shortText.optional(), image: url.optional(), noindex: z.boolean().optional() }).strict();
const localizedText = z.object({ name: shortText.optional(), summary: shortText.optional(), description: text.optional(), body: text.optional() }).strict();
const translation = z.object({ state: z.enum(['partial', 'complete']), fields: localizedText }).strict();
const translations = z.object({ 'pt-PT': translation.optional(), 'pt-BR': translation.optional(), en: translation.optional(), es: translation.optional() }).strict();
const base = z.object({
  slug: slugSchema, name: z.string().min(1).max(200),
  sourceLocale: localeSchema.default('pt-PT'), translations: translations.default({}),
  summary: shortText.optional(), description: text.optional(), seo: seo.optional(),
}).strict();
const feature = z.object({ title: shortText, description: text.optional(), icon: shortText.optional() }).strict();
const faqItem = z.object({ question: shortText, answer: text }).strict();

export const projectStatusSchema = z.enum(['internal-prototype', 'development', 'alpha', 'beta', 'stable', 'archived']);
export const distributionSchema = z.object({
  provider: slugSchema, state: z.enum(['active', 'paused', 'outdated']),
  priority: z.enum(['primary', 'secondary']).optional(), url: url.optional(), note: shortText.optional(),
}).strict();
export const projectSchema = base.extend({
  status: projectStatusSchema, releaseSlugs: z.array(slugSchema).default([]),
  media: z.array(media).optional(), features: z.array(feature).optional(),
  compatibility: z.object({ minecraft: z.array(shortText).optional(), loaders: z.array(shortText).optional(), platforms: z.array(shortText).optional() }).strict().optional(),
  requirements: z.array(feature).optional(), installation: text.optional(), recommendations: z.array(shortText).optional(),
  distribution: z.array(distributionSchema).optional(),
  benchmarks: z.array(z.object({ label: shortText, value: z.number().finite(), unit: shortText, methodology: text.optional(), source: url.optional() }).strict()).optional(),
  faq: z.array(faqItem).optional(), roadmap: z.array(z.object({ title: shortText, state: z.enum(['planned', 'in-progress', 'done']) }).strict()).optional(),
}).strict();
export const releaseSchema = base.extend({
  projectSlug: slugSchema, version: shortText, channel: z.enum(['alpha', 'beta', 'stable']),
  releasedAt: z.string().datetime().optional(), changelog: text.optional(),
  distribution: z.array(distributionSchema).optional(),
}).strict();
export const launcherSchema = base.extend({
  platforms: z.array(shortText).default([]), media: z.array(media).optional(),
  features: z.array(feature).optional(), pros: z.array(shortText).optional(), cons: z.array(shortText).optional(),
  easeOfUse: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  installation: text.optional(), compatibility: z.array(shortText).optional(),
  recommendations: z.array(shortText).optional(), officialLinks: z.array(z.object({ label: shortText, url }).strict()).optional(),
}).strict();
export const articleSchema = base.extend({
  body: text, category: shortText.optional(), projectSlug: slugSchema.optional(),
  author: shortText.optional(), publishedAt: z.string().datetime().optional(), media: z.array(media).optional(),
}).strict();
export const guideSchema = base.extend({
  body: text, projectSlug: slugSchema.optional(), launcherSlug: slugSchema.optional(),
  level: z.enum(['beginner', 'technical']).optional(), steps: z.array(z.object({ title: shortText, body: text }).strict()).optional(),
}).strict();
export const faqSchema = base.extend({ projectSlug: slugSchema.optional(), items: z.array(faqItem).default([]) }).strict();
export const homepageSchema = base.extend({
  hero: z.object({ eyebrow: shortText.optional(), title: shortText.optional(), subtitle: shortText.optional(), primaryProjectSlug: slugSchema.optional() }).strict().optional(),
  featuredProjectSlugs: z.array(slugSchema).optional(), featuredArticleSlugs: z.array(slugSchema).optional(),
  notices: z.array(z.object({ id: slugSchema, text: shortText, visible: z.boolean(), link: url.optional() }).strict()).optional(),
  sections: z.array(z.object({ id: slugSchema, visible: z.boolean() }).strict()).optional(),
}).strict();
export const siteSettingsSchema = base.extend({
  navigation: z.array(z.object({ label: shortText, path: z.string().startsWith('/').max(200) }).strict()).optional(),
  footer: z.array(z.object({ label: shortText, url }).strict()).optional(),
  contactEmail: z.string().email().optional(),
}).strict();

export const collectionSchemas = {
  projects: projectSchema, releases: releaseSchema, launchers: launcherSchema, articles: articleSchema,
  guides: guideSchema, faq: faqSchema, homepage: homepageSchema, settings: siteSettingsSchema,
} as const;
export type ContentKind = keyof typeof collectionSchemas;
export type ProjectV2 = z.infer<typeof projectSchema>;
export type ReleaseV2 = z.infer<typeof releaseSchema>;
export type LauncherV2 = z.infer<typeof launcherSchema>;
export type ArticleV2 = z.infer<typeof articleSchema>;
export type GuideV2 = z.infer<typeof guideSchema>;
export type FAQV2 = z.infer<typeof faqSchema>;
export type HomepageV2 = z.infer<typeof homepageSchema>;
export type SiteSettingsV2 = z.infer<typeof siteSettingsSchema>;
export const CONTENT_KINDS = Object.keys(collectionSchemas) as ContentKind[];
export const collectionPath = (kind: ContentKind) => `src/content/v2/${kind}.json`;

export type ValidatedItem = { slug: string; name: string } & Record<string, unknown>;

export function parseItem(kind: ContentKind, item: unknown): ValidatedItem {
  // The union API keeps runtime validation in one shared module used by browser and Edge Function.
  return collectionSchemas[kind].parse(item) as ValidatedItem;
}
export function parseCollection(kind: ContentKind, input: unknown): { schemaVersion: 2; items: ValidatedItem[] } {
  const wrapper = z.object({ schemaVersion: z.literal(2), items: z.array(collectionSchemas[kind]) }).strict();
  const result = wrapper.parse(input);
  const slugs = result.items.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error(`Duplicate ${kind} slug`);
  return result as { schemaVersion: 2; items: ValidatedItem[] };
}
