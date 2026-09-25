import projectsJson from './v2/projects.json';
import launchersJson from './v2/launchers.json';
import articlesJson from './v2/articles.json';
import guidesJson from './v2/guides.json';
import releasesJson from './v2/releases.json';
import faqJson from './v2/faq.json';
import homepageJson from './v2/homepage.json';
import settingsJson from './v2/settings.json';
import { parseItem, type ContentKind, type ProjectV2, type LauncherV2, type ArticleV2, type FAQV2, type HomepageV2, type SiteSettingsV2, type GuideV2 } from './v2/schema';
import { modpacks, articles, faq, site, type Modpack, type Article, type FaqCategory } from './index';
import { launchersForList } from '@/lib/launchers';

// Only checked-in, published collections enter this module. Private drafts live in
// Supabase and must never be imported by the public application.
const sources: Record<ContentKind, unknown> = {
  projects: projectsJson, launchers: launchersJson, articles: articlesJson,
  guides: guidesJson, faq: faqJson, homepage: homepageJson, settings: settingsJson,
  releases: releasesJson,
};

export function validatedPublicItems<T>(kind: ContentKind, input: unknown): T[] {
  if (!input || typeof input !== 'object' || (input as { schemaVersion?: unknown }).schemaVersion !== 2 || !Array.isArray((input as { items?: unknown }).items)) return [];
  const seen = new Set<string>();
  return (input as { items: unknown[] }).items.flatMap((candidate) => {
    try {
      const item = parseItem(kind, candidate);
      // A draft marker on a checked-in record is an editorial mistake: fail closed.
      if ((candidate as { draft?: unknown }).draft !== undefined || seen.has(item.slug)) return [];
      seen.add(item.slug);
      return [item as T];
    } catch { return []; }
  });
}

export type PublicEntry<T, L> = { source: 'v2'; item: T; slug: string } | { source: 'legacy'; item: L; slug: string };
export function resolveEntries<T extends { slug?: string }, L>(v2: T[], legacy: L[], legacySlug: (item: L) => string): PublicEntry<T, L>[] {
  const current = v2.filter((item) => typeof item.slug === 'string').map((item): PublicEntry<T, L> => ({ source: 'v2', item, slug: item.slug! }));
  const slugs = new Set(current.map((entry) => entry.slug));
  return [...current, ...legacy.filter((item) => !slugs.has(legacySlug(item))).map((item): PublicEntry<T, L> => ({ source: 'legacy', item, slug: legacySlug(item) }))];
}

export const publicProjects = () => resolveEntries(validatedPublicItems<ProjectV2>('projects', sources.projects), modpacks, (m) => m.slug);
export const publicProject = (slug: string) => publicProjects().find((entry) => entry.slug === slug);
export const publicLaunchers = () => resolveEntries(validatedPublicItems<LauncherV2>('launchers', sources.launchers), launchersForList(), (l) => l.id);
export const publicLauncher = (slug: string) => publicLaunchers().find((entry) => entry.slug === slug);
export const publicArticles = () => resolveEntries(validatedPublicItems<ArticleV2>('articles', sources.articles), articles.filter((a) => !a.draft), (a) => a.slug);
export const publicArticle = (slug: string) => publicArticles().find((entry) => entry.slug === slug);
export const publicFaq = (): PublicEntry<FAQV2, FaqCategory>[] => resolveEntries(validatedPublicItems<FAQV2>('faq', sources.faq), faq, (cat) => cat.id);
export const publicGuides = (): GuideV2[] => validatedPublicItems<GuideV2>('guides', sources.guides);
export const publicHomepage = (): HomepageV2 | undefined => validatedPublicItems<HomepageV2>('homepage', sources.homepage)[0];
export const publicSettings = (): SiteSettingsV2 | undefined => validatedPublicItems<SiteSettingsV2>('settings', sources.settings)[0];
export const publicSiteDescription = () => publicSettings()?.description || site.description;
export const publicContactEmail = () => publicSettings()?.contactEmail || site.contactEmail;
export const publicFeaturedProjects = () => {
  const entries = publicProjects();
  const ordered = publicHomepage()?.featuredProjectSlugs;
  return ordered ? ordered.flatMap((slug) => entries.filter((entry) => entry.slug === slug)) : entries.filter((entry) => entry.source === 'v2' ? entry.slug === 'mac-native' || entry.slug === 'crafttoons' : (entry.item as Modpack).featured);
};
export const publicFeaturedArticles = () => {
  const entries = publicArticles();
  const ordered = publicHomepage()?.featuredArticleSlugs;
  return ordered ? ordered.flatMap((slug) => entries.filter((entry) => entry.slug === slug)) : entries.filter((entry) => entry.source === 'legacy' && (entry.item as Article).featured);
};
