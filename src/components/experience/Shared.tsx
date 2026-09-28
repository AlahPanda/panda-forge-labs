import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Box, Compass, Leaf, Newspaper, Rocket, Search, type LucideIcon } from 'lucide-react';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import type { ProjectV2, LauncherV2, ArticleV2, GuideV2 } from '@/content/v2/schema';
import type { PublicEntry } from '@/content/publicResolver';
import type { Modpack } from '@/content';
import type { LauncherItem } from '@/lib/launchers';
import { publicReleasesFor } from '@/content/publicResolver';
import { useI18n } from '@/lib/i18n';
import { localizeItem } from '@/content/v2/localize';
import SmartImage from '@/components/SmartImage';

export const destinations: { path: string; label: string; Icon: LucideIcon }[] = [
  { path: '/modpacks', label: 'Modpacks', Icon: Leaf },
  { path: '/launchers', label: 'Launchers', Icon: Box },
  { path: '/guides', label: 'Guides', Icon: BookOpen },
  { path: '/news', label: 'News', Icon: Newspaper },
];

export function PageHero({ title, description, eyebrow, children, landscape = false, scene = 'home', tone = 'default', icon: Icon = Leaf }: { title: string; description?: string; eyebrow?: string; children?: React.ReactNode; landscape?: boolean; scene?: 'home' | 'mac' | 'news' | 'projects' | 'launchers' | 'faq' | 'about' | 'guides'; tone?: 'default' | 'launchers' | 'guides' | 'about' | 'quiet'; icon?: LucideIcon }) {
  return <section className={'experience-hero ' + (landscape ? `experience-hero-art experience-scene-${scene}` : `experience-hero-plain experience-tone-${tone}`)}>
    {landscape && <HeroLandscape scene={scene} />}
    <div className="container experience-hero-inner">
      <div className="experience-hero-copy">
        {eyebrow && <div className="experience-kicker experience-hero-reveal"><Icon size={16} aria-hidden="true" /> {eyebrow}</div>}
        <h1 className="experience-hero-reveal">{title}</h1>
        {description && <p className="experience-hero-reveal">{description}</p>}
        {children && <div className="experience-hero-actions experience-hero-reveal">{children}</div>}
      </div>
    </div>
  </section>;
}

export function SectionTitle({ title, to, link, icon: Icon = Leaf }: { title: string; to?: string; link?: string; icon?: LucideIcon }) {
  const { t } = useI18n();
  return <div className="experience-section-heading reveal"><div className="experience-section-heading-title"><Icon size={23} aria-hidden="true" /><h2>{title}</h2></div>
    {to && <Link to={to} className="experience-text-link">{link || t('ui.viewAll')} <ArrowRight size={17} aria-hidden="true" /></Link>}
  </div>;
}

export function SearchField({ value, onChange, placeholder, id }: { value: string; onChange: (value: string) => void; placeholder: string; id: string }) {
  return <label className="experience-search"><Search size={19} aria-hidden="true" /><span className="sr-only">{placeholder}</span><input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export function EmptyCollection({ title, description, to, link }: { title: string; description: string; to?: string; link?: string }) {
  const { t } = useI18n();
  return <div className="experience-empty"><Leaf size={34} aria-hidden="true" /><h2>{title}</h2><p>{description}</p>{to && <Link className="experience-button experience-button-soft" to={to}>{link || t('ui.explore')} <ArrowRight size={16} /></Link>}</div>;
}

export function ProjectCard({ entry }: { entry: PublicEntry<ProjectV2, Modpack> }) {
  const { t, locale } = useI18n();
  if (entry.source === 'legacy') return <Link className="experience-card experience-project-card reveal" to={'/modpacks/' + entry.slug}>
    <div className="experience-card-visual experience-card-visual-project"><Compass size={46} aria-hidden="true" /></div>
    <div className="experience-card-body"><h3>{entry.item.name}</h3><p>{entry.item.summary}</p><span className="experience-text-link">{t('ui.explore')} <ArrowRight size={16}/></span></div></Link>;
  const project = localizeItem(entry.item, locale);
  const teaser = project.status === 'internal-prototype';
  const image = project.media?.find((media) => media.kind === 'image');
  const releases = teaser ? [] : publicReleasesFor(project);
  return <Link className="experience-card experience-project-card reveal" to={'/modpacks/' + entry.slug}>
    <div className={'experience-card-visual experience-card-visual-project ' + (teaser ? 'experience-visual-prototype' : project.slug === 'mac-native' ? 'experience-visual-native' : '')}>
      {image ? <img src={image.url} alt={image.alt || ''} loading="lazy" width="640" height="360" /> : teaser ? <div className="experience-visual-monogram" aria-hidden="true"><Compass size={52} /></div> : project.slug !== 'mac-native' ? <div className="experience-visual-monogram" aria-hidden="true"><Rocket size={52} /></div> : null}
    </div>
    <div className="experience-card-body"><ProjectStatusBadge status={project.status}/><h3>{project.name}</h3>
      {project.summary && <p>{project.summary}</p>}
      {!teaser && <div className="experience-project-meta">{releases[0] && <span className="experience-meta">v{releases[0].version} · {t('status.' + releases[0].channel)}</span>}{project.compatibility?.minecraft?.map((version) => <span className="experience-meta" key={version}>Minecraft {version}</span>)}{project.compatibility?.platforms?.map((platform) => <span className="experience-meta" key={platform}>{platform}</span>)}</div>}
      <span className="experience-text-link">{t('ui.explore')} <ArrowRight size={16} aria-hidden="true" /></span>
    </div>
  </Link>;
}

export function LauncherCard({ entry }: { entry: PublicEntry<LauncherV2, LauncherItem> }) {
  const { t, locale } = useI18n();
  if (entry.source === 'legacy') return <article className="experience-card experience-launcher-card reveal"><div className="experience-launcher-icon"><Box size={30} aria-hidden="true"/></div><div className="experience-card-body"><h2>{entry.item.name}</h2><p>{entry.slug === 'astralrinth' ? t('ui.astralSummary') : t('ui.pendingLauncher')}</p>{entry.slug === 'astralrinth' && <p className="experience-meta">macOS · Windows · Linux</p>}<span className="experience-meta">{t('ui.review')}</span><div className="experience-card-actions"><Link to={'/launchers/' + entry.slug} className="experience-button experience-button-soft">{t('ui.viewStatus')} <ArrowRight size={16}/></Link></div></div></article>;
  const item = localizeItem(entry.item, locale);
  return <article className={'experience-card experience-launcher-card reveal launcher-tone-' + item.slug + (item.featured ? ' experience-launcher-featured' : '')}><div className="experience-card-visual experience-launcher-visual" aria-hidden="true"><Box size={48}/></div><div className="experience-launcher-icon" aria-hidden="true"><Box size={26}/></div><div className="experience-card-body">
    {item.featured && <span className="experience-launcher-verified">{t('launcher.ourPick')}</span>}
    <h2>{item.name}</h2>{item.summary && <p>{item.summary}</p>}
    {item.platforms.length > 0 && <p className="experience-meta">{item.platforms.join(' · ')}</p>}{item.currentVersion && <p className="experience-meta">v{item.currentVersion}</p>}
    {item.officialLinks?.length > 0 && <span className="experience-launcher-verified">{t('ui.officialLinks')}</span>}
    <div className="experience-card-actions"><Link to={'/launchers/' + item.slug} className="experience-button experience-button-soft">{t('ui.details')} <ArrowRight size={16} /></Link>
      {item.officialLinks?.[0] && <a className="experience-button experience-button-primary" href={item.officialLinks[0].url} target="_blank" rel="noopener noreferrer">{t('ui.official')} <ArrowRight size={16}/></a>}</div>
  </div></article>;
}

export function ArticleCard({ item: source }: { item: ArticleV2 }) {
  const { t, locale } = useI18n();
  const item = localizeItem(source, locale);
  const image = item.media?.find((media) => media.kind === 'image')?.url;
  return <Link to={'/news/' + item.slug} className="experience-card experience-article-card reveal">
    {image ? <SmartImage className="experience-article-image" src={image} alt="" aspect="aspect-video" rounded="rounded-none" width="560" height="320" /> : <div className="experience-article-image experience-image-fallback"><Newspaper size={44} aria-hidden="true"/></div>}
    <div className="experience-card-body"><span className="experience-meta">{[item.category, item.publishedAt?.slice(0,10)].filter(Boolean).join(' · ')}</span><h3>{item.name}</h3>{item.summary && <p>{item.summary}</p>}<span className="experience-text-link">{t('ui.readArticle')} <ArrowRight size={16} /></span></div>
  </Link>;
}

export function GuideCard({ guide: source }: { guide: GuideV2 }) {
  const { t, locale } = useI18n();
  const guide = localizeItem(source, locale);
  return <Link className="experience-card experience-guide-card" to={'/guides/' + guide.slug}><div className="experience-guide-icon"><BookOpen size={26} /></div><div className="experience-card-body"><h3>{guide.name}</h3>{guide.summary && <p>{guide.summary}</p>}<span className="experience-text-link">{t('ui.readGuide')} <ArrowRight size={16}/></span></div></Link>;
}
