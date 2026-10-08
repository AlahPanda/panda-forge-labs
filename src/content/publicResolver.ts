import projectsJson from './v2/projects.json';
import launchersJson from './v2/launchers.json';
import articlesJson from './v2/articles.json';
import guidesJson from './v2/guides.json';
import releasesJson from './v2/releases.json';
import faqJson from './v2/faq.json';
import homepageJson from './v2/homepage.json';
import settingsJson from './v2/settings.json';
import { type ContentKind, type ProjectV2, type LauncherV2, type ArticleV2, type FAQV2, type HomepageV2, type SiteSettingsV2, type GuideV2, type ReleaseV2 } from './v2/schema';
import { modpacks, faq, site, type Modpack, type FaqCategory } from './index';
import { validatedPublicItems } from './v2/publication';
export { validatedPublicItems } from './v2/publication';
import { launchersForList } from '@/lib/launchers';

// Only checked-in, published collections enter this module. Private drafts live in
// Supabase and must never be imported by the public application.
const sources: Record<ContentKind, unknown> = {
  projects: projectsJson, launchers: launchersJson, articles: articlesJson,
  guides: guidesJson, faq: faqJson, homepage: homepageJson, settings: settingsJson,
  releases: releasesJson,
};

export type PublicEntry<T, L> = { source: 'v2'; item: T; slug: string } | { source: 'legacy'; item: L; slug: string };
export function resolveEntries<T extends { slug?: string }, L>(v2: T[], legacy: L[], legacySlug: (item: L) => string): PublicEntry<T, L>[] {
  const current = v2.filter((item) => typeof item.slug === 'string').map((item): PublicEntry<T, L> => ({ source: 'v2', item, slug: item.slug! }));
  const slugs = new Set(current.map((entry) => entry.slug));
  return [...current, ...legacy.filter((item) => !slugs.has(legacySlug(item))).map((item): PublicEntry<T, L> => ({ source: 'legacy', item, slug: legacySlug(item) }))];
}

// The legacy `Soon` record is retained for migration history but is not public.
export const publicProjects = () => resolveEntries(validatedPublicItems<ProjectV2>('projects', sources.projects), modpacks.filter((m) => m.slug !== 'Soon'), (m) => m.slug);
export const publicProject = (slug: string) => publicProjects().find((entry) => entry.slug === slug);
export const publicReleasesFor = (project: ProjectV2): ReleaseV2[] => {
  if (project.status === 'internal-prototype') return [];
  const published = validatedPublicItems<ReleaseV2>('releases', sources.releases);
  // CMS project order is the editorial order. Never guess maturity or freshness
  // from a version string (including prerelease versions).
  return [...new Set(project.releaseSlugs)].flatMap((slug) => published.filter((release) => release.slug === slug && release.projectSlug === project.slug));
};
export const publicLaunchers = () => resolveEntries(validatedPublicItems<LauncherV2>('launchers', sources.launchers), launchersForList(), (l) => l.id);
export const publicLauncher = (slug: string) => publicLaunchers().find((entry) => entry.slug === slug);
export const publicArticles = (): Array<{ source: 'v2'; item: ArticleV2; slug: string }> => validatedPublicItems<ArticleV2>('articles', sources.articles).map((item) => ({ source: 'v2', item, slug: item.slug }));
export const publicArticle = (slug: string) => publicArticles().find((entry) => entry.slug === slug);
export const publicFaq = (): PublicEntry<FAQV2, FaqCategory>[] => resolveEntries(validatedPublicItems<FAQV2>('faq', sources.faq), faq, (cat) => cat.id);
export const publicGuides = (): GuideV2[] => validatedPublicItems<GuideV2>('guides', sources.guides);
export const publicGuide = (slug: string): GuideV2 | undefined => publicGuides().find((guide) => guide.slug === slug);
export const publicHomepage = (): HomepageV2 | undefined => validatedPublicItems<HomepageV2>('homepage', sources.homepage)[0];
export const publicSettings = (): SiteSettingsV2 | undefined => validatedPublicItems<SiteSettingsV2>('settings', sources.settings)[0];
export const publicSiteDescription = () => publicSettings()?.description || site.description;
export const publicContactEmail = () => publicSettings()?.contactEmail || site.contactEmail;
export const publicFeaturedProjects = () => {
  const entries = publicProjects();
  const ordered = publicHomepage()?.featuredProjectSlugs;
  return ordered ? ordered.flatMap((slug) => entries.filter((entry) => entry.slug === slug)) : entries.filter((entry) => entry.source === 'v2' ? entry.slug === 'mac-native' || entry.slug === 'crafttoons' : (entry.item as Modpack).featured);
};
