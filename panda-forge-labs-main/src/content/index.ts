import siteData from '@/content/site.json';
import modpacksData from '@/content/modpacks.json';
import newsData from '@/content/news.json';
import faqData from '@/content/faq.json';
import i18nData from '@/content/i18n.json';
import reviewsData from '@/content/reviews.json';

export type Locale = 'en' | 'pt-PT' | 'pt-BR' | 'es';
export const LOCALES: Locale[] = ['en', 'pt-PT', 'pt-BR', 'es'];
export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  'pt-PT': 'Português (PT)',
  'pt-BR': 'Português (BR)',
  es: 'Español',
};

export interface DownloadLinks {
  modrinth?: string;
  curseforge?: string;
  github?: string;
  mirror?: string;
}

export type LayoutType = 'performance' | 'immersion' | 'standard';

export interface Feature {
  title: string;
  description: string;
  /** lucide-react icon name */
  icon?: string;
}

export interface Modpack {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  version: string;
  mcVersion: string;
  loader: string;
  modCount: number;
  tags: string[];
  accent: string;
  featured: boolean;
  trending: boolean;
  downloads: string;
  rating: number;
  layoutType: LayoutType;
  /** Square cover (1:1). */
  image?: string;
  downloadLinks: DownloadLinks;
  benchmarks: { label: string; vanilla: number; fabulous?: number; modded: number }[];
  features: Feature[];
  specs: { minRam: string; recommendedRam: string; javaVersion: string; size: string };
  installGuide: string;
  changelog: { version: string; date: string; notes: string }[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  modpackSlug: string | null;
  author: string;
  publishedAt: string;
  readMinutes: number;
  featured: boolean;
  draft: boolean;
  tags: string[];
  /** 16:9 hero image. */
  image?: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: { q: string; a: string }[];
}

export interface Review {
  id: string;
  modpackSlug: string;
  author: string;
  rating: number;
  body: string;
  publishedAt: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  discordUrl: string;
  githubUrl: string;
  supportUrl: string;
  contactEmail: string;
  social: { twitter: string; youtube: string; twitch: string };
  stats: { downloads: string; modpacks: string; members: string; buildsShipped: string };
  ads: { adsenseEnabled: boolean; adsenseClient: string; showSupportButton: boolean };
  popups: { discordOnDownload: boolean; newsletterDelaySec: number };
}

export const site = siteData.site as SiteConfig;
export const modpacks = (modpacksData.modpacks as Modpack[]).slice();
export const articles = (newsData.articles as Article[]).slice();
export const faq = faqData.categories as FaqCategory[];
export const reviews = (reviewsData.reviews as Review[]).slice();
export const i18n = i18nData as Record<Locale, Record<string, string>>;

export const getModpack = (slug: string) => modpacks.find((m) => m.slug === slug);
export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);
export const featuredModpacks = () => modpacks.filter((m) => m.featured);
export const featuredArticles = () => articles.filter((a) => a.featured && !a.draft);
export const publishedArticles = () => articles.filter((a) => !a.draft);
export const reviewsFor = (slug: string) => reviews.filter((r) => r.modpackSlug === slug);
