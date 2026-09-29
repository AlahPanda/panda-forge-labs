import { z } from 'zod';

export const localeSchema = z.enum(['pt-PT', 'pt-BR', 'en', 'es']);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens').max(100);
const text = z.string().max(30_000);
const shortText = z.string().max(400);
const url = z.string().url().refine((value) => /^https?:\/\//.test(value), 'Use an HTTP(S) URL');
const supporterUrl = z.string().url().refine((value) => { const parsed = new URL(value); return parsed.protocol === 'https:' && !parsed.username && !parsed.password; }, 'Use an HTTPS URL without credentials');
// Public, checked-in artwork can be served from this site's own brand directory.
// Other media still require an absolute HTTP(S) URL; no arbitrary local paths.
const mediaUrl = z.union([url, z.string().regex(/^\/brand\/[a-z0-9-]+\.webp$/)]);
const media = z.object({ url: mediaUrl, alt: shortText.optional(), caption: shortText.optional(), kind: z.enum(['image', 'video']).default('image') }).strict();
const seo = z.object({ title: shortText.optional(), description: shortText.optional(), image: url.optional(), noindex: z.boolean().optional() }).strict();
const localizedText = z.object({
  name: shortText.optional(), summary: shortText.optional(), description: text.optional(), body: text.optional(),
  installation: text.optional(), changelog: text.optional(), seoTitle: shortText.optional(), seoDescription: shortText.optional(),
  heroEyebrow: shortText.optional(), heroTitle: shortText.optional(), heroSubtitle: shortText.optional(),
  supportIntro: text.optional(), communityIntro: text.optional(),
}).strict();
const translatedParts = z.object({
  features: z.record(slugSchema, z.object({ title: shortText.optional(), description: text.optional() }).strict()).optional(),
  requirements: z.record(slugSchema, z.object({ title: shortText.optional(), description: text.optional() }).strict()).optional(),
  faq: z.record(slugSchema, z.object({ question: shortText.optional(), answer: text.optional() }).strict()).optional(),
  items: z.record(slugSchema, z.object({ question: shortText.optional(), answer: text.optional() }).strict()).optional(),
  steps: z.record(slugSchema, z.object({ title: shortText.optional(), body: text.optional() }).strict()).optional(),
  notices: z.record(slugSchema, z.object({ text: shortText.optional() }).strict()).optional(),
  sections: z.record(slugSchema, z.object({ title: shortText.optional(), intro: text.optional(), ctaLabel: shortText.optional() }).strict()).optional(),
  quickLinks: z.record(slugSchema, z.object({ label: shortText.optional() }).strict()).optional(),
  navigation: z.record(slugSchema, z.object({ label: shortText.optional() }).strict()).optional(),
  footer: z.record(slugSchema, z.object({ label: shortText.optional() }).strict()).optional(),
}).strict();
const translation = z.object({ state: z.enum(['partial', 'complete', 'needs-review']), fields: localizedText, structured: translatedParts.optional() }).strict();
const translations = z.object({ 'pt-PT': translation.optional(), 'pt-BR': translation.optional(), en: translation.optional(), es: translation.optional() }).strict();
const base = z.object({
  slug: slugSchema, name: z.string().min(1).max(200),
  sourceLocale: localeSchema.default('pt-PT'), translations: translations.default({}),
  summary: shortText.optional(), description: text.optional(), seo: seo.optional(),
}).strict();
const feature = z.object({ id: slugSchema.optional(), title: shortText, description: text.optional(), icon: shortText.optional() }).strict();
const faqItem = z.object({ id: slugSchema.optional(), question: shortText, answer: text }).strict();
const compatibility = z.object({ minecraft: z.array(shortText).optional(), loaders: z.array(shortText).optional(), platforms: z.array(shortText).optional(), environment: z.enum(['client', 'server', 'both']).optional() }).strict();
const source = z.object({ label: shortText, url, checkedAt: z.string().datetime().optional() }).strict();

export const projectStatusSchema = z.enum(['internal-prototype', 'development', 'alpha', 'beta', 'stable', 'archived']);
export const distributionSchema = z.object({
  provider: slugSchema, state: z.enum(['active', 'paused', 'outdated']),
  priority: z.enum(['primary', 'secondary']).optional(), url: url.optional(), note: shortText.optional(),
}).strict();
export const projectSchema = base.extend({
  status: projectStatusSchema, releaseSlugs: z.array(slugSchema).default([]),
  pageTemplate: z.enum(['premium', 'basic']).optional(),
  premiumCopy: z.enum(['mac', 'generic']).optional(),
  heroArtwork: z.object({ day: mediaUrl, night: mediaUrl, dayMobile: mediaUrl.optional(), nightMobile: mediaUrl.optional() }).strict().optional(),
  upstream: z.object({ provider: z.literal('modrinth'), projectId: z.string().regex(/^[a-zA-Z0-9_-]{3,64}$/).optional(), projectSlug: z.string().regex(/^[a-zA-Z0-9_-]{3,64}$/) }).strict().optional(),
  supporterDownload: z.object({ enabled: z.boolean(), url: supporterUrl.optional(), label: shortText.optional(), message: shortText.optional() }).strict().optional(),
  media: z.array(media).optional(), features: z.array(feature).optional(),
  compatibility: compatibility.optional(),
  requirements: z.array(feature).optional(), installation: text.optional(), recommendations: z.array(shortText).optional(),
  knownIssues: z.array(shortText).optional(),
  distribution: z.array(distributionSchema).optional(),
  benchmarks: z.array(z.object({ label: shortText, value: z.number().finite(), unit: shortText, methodology: text.optional(), source: url.optional() }).strict()).optional(),
  faq: z.array(faqItem).optional(), roadmap: z.array(z.object({ title: shortText, state: z.enum(['planned', 'in-progress', 'done']) }).strict()).optional(),
}).strict();
export const releaseSchema = base.extend({
  projectSlug: slugSchema, version: shortText, channel: z.enum(['alpha', 'beta', 'stable']),
  releasedAt: z.string().datetime().optional(), changelog: text.optional(),
  compatibility: compatibility.optional(),
  distribution: z.array(distributionSchema).optional(),
}).strict();
export const launcherSchema = base.extend({
  platforms: z.array(shortText).default([]), media: z.array(media).optional(),
  features: z.array(feature).optional(), pros: z.array(shortText).optional(), cons: z.array(shortText).optional(),
  easeOfUse: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  installation: text.optional(), compatibility: z.array(shortText).optional(),
  recommendations: z.array(shortText).optional(), officialLinks: z.array(z.object({ label: shortText, url }).strict()).optional(),
  developer: shortText.optional(), currentVersion: shortText.optional(), lastVerified: z.string().datetime().optional(),
  license: shortText.optional(), sourceCodeUrl: url.optional(), architectures: z.array(shortText).optional(),
  supportedLoaders: z.array(shortText).optional(), modpackProviders: z.array(shortText).optional(),
  instanceManagement: text.optional(), javaManagement: text.optional(), accountSupport: text.optional(),
  requirements: z.array(shortText).optional(), knownLimitations: z.array(shortText).optional(),
  downloads: z.array(z.object({ label: shortText, platform: shortText, url }).strict()).optional(),
  sources: z.array(source).optional(), featured: z.boolean().optional(),
}).strict();
export const articleSchema = base.extend({
  body: text, category: shortText.optional(), projectSlug: slugSchema.optional(),
  author: shortText.optional(), publishedAt: z.string().datetime().optional(), modifiedAt: z.string().datetime().optional(), media: z.array(media).optional(),
  sources: z.array(source).optional(), relatedArticleSlugs: z.array(slugSchema).optional(), tags: z.array(shortText).optional(),
}).strict();
export const guideSchema = base.extend({
  body: text, projectSlug: slugSchema.optional(), launcherSlug: slugSchema.optional(),
  level: z.enum(['beginner', 'technical']).optional(), updatedAt: z.string().datetime().optional(),
  media: z.array(media).optional(), steps: z.array(z.object({ id: slugSchema.optional(), title: shortText, body: text }).strict()).optional(),
  sources: z.array(source).optional(), requirements: z.array(shortText).optional(), estimatedMinutes: z.number().int().positive().optional(),
}).strict();
export const faqSchema = base.extend({ projectSlug: slugSchema.optional(), items: z.array(faqItem).default([]) }).strict();
export const homepageSchema = base.extend({
  hero: z.object({ eyebrow: shortText.optional(), title: shortText.optional(), subtitle: shortText.optional(), primaryProjectSlug: slugSchema.optional() }).strict().optional(),
  featuredProjectSlugs: z.array(slugSchema).optional(), featuredArticleSlugs: z.array(slugSchema).optional(),
  notices: z.array(z.object({ id: slugSchema, text: shortText, visible: z.boolean(), link: url.optional() }).strict()).optional(),
  sections: z.array(z.object({ id: slugSchema, visible: z.boolean(), title: shortText.optional(), intro: text.optional(), ctaLabel: shortText.optional() }).strict()).optional(),
  quickLinks: z.array(z.object({ id: slugSchema, label: shortText, path: z.string().startsWith('/').max(200) }).strict()).optional(),
}).strict();
export const siteSettingsSchema = base.extend({
  defaultSupporterDownload: z.object({ enabled: z.boolean(), url: supporterUrl.optional(), label: shortText.optional(), message: shortText.optional() }).strict().optional(),
  navigation: z.array(z.object({ id: slugSchema.optional(), label: shortText, path: z.string().startsWith('/').max(200) }).strict()).optional(),
  footer: z.array(z.object({ id: slugSchema.optional(), label: shortText, url }).strict()).optional(),
  contactEmail: z.string().email().optional(),
  supportUrl: url.optional(),
  supportIntro: text.optional(), communityIntro: text.optional(),
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
  const parsed = collectionSchemas[kind].parse(item) as ValidatedItem;
  for (const part of ['features', 'requirements', 'faq', 'items', 'steps', 'notices', 'sections', 'quickLinks', 'navigation', 'footer']) {
    const rows = parsed[part];
    if (!Array.isArray(rows)) continue;
    const ids = rows.flatMap((row: { id?: string }) => row.id ? [row.id] : []);
    if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${part} ID in ${kind}/${parsed.slug}`);
  }
  return parsed;
}
export function parseCollection(kind: ContentKind, input: unknown): { schemaVersion: 2; items: ValidatedItem[] } {
  const wrapper = z.object({ schemaVersion: z.literal(2), items: z.array(collectionSchemas[kind]) }).strict();
  const result = wrapper.parse(input);
  const slugs = result.items.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error(`Duplicate ${kind} slug`);
  const hasText = (value: unknown): boolean => typeof value === 'string'
    ? value.trim().length > 0
    : !!value && typeof value === 'object' && Object.values(value).some(hasText);
  for (const item of result.items) {
    for (const [locale, translation] of Object.entries(item.translations)) {
      if (translation?.state === 'needs-review' && (hasText(translation.fields) || hasText(translation.structured))) {
        throw new Error(`Unreviewed ${locale} text must stay in a private draft: ${kind}/${item.slug}`);
      }
    }
  }
  return { schemaVersion: 2, items: result.items.map((item) => parseItem(kind, item)) };
}
