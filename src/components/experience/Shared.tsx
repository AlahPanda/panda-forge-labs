import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Box, Compass, Leaf, Newspaper, Rocket, Search, type LucideIcon } from 'lucide-react';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import type { ProjectV2, LauncherV2, ArticleV2, GuideV2 } from '@/content/v2/schema';
import type { PublicEntry, } from '@/content/publicResolver';
import type { Modpack } from '@/content';
import { publicReleasesFor } from '@/content/publicResolver';

export const destinations: { path: string; label: string; Icon: LucideIcon }[] = [
  { path: '/projects', label: 'Projects', Icon: Compass },
  { path: '/modpacks', label: 'Modpacks', Icon: Leaf },
  { path: '/launchers', label: 'Launchers', Icon: Box },
  { path: '/guides', label: 'Guides', Icon: BookOpen },
  { path: '/news', label: 'News', Icon: Newspaper },
];

export function PageHero({ title, description, eyebrow, children, landscape = false, scene = 'home' }: { title: string; description?: string; eyebrow?: string; children?: React.ReactNode; landscape?: boolean; scene?: 'home' | 'mac' | 'news' | 'projects' }) {
  return <section className={'experience-hero ' + (landscape ? 'experience-hero-art' : 'experience-hero-plain')}>
    {landscape && <HeroLandscape scene={scene} />}
    <div className="container experience-hero-inner">
      <div className="experience-hero-copy">
        {eyebrow && <div className="experience-kicker"><Leaf size={16} aria-hidden="true" /> {eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children && <div className="experience-hero-actions">{children}</div>}
      </div>
    </div>
  </section>;
}

export function SectionTitle({ title, to, link, icon: Icon = Leaf }: { title: string; to?: string; link?: string; icon?: LucideIcon }) {
  return <div className="experience-section-heading"><div className="experience-section-heading-title"><Icon size={23} aria-hidden="true" /><h2>{title}</h2></div>
    {to && <Link to={to} className="experience-text-link">{link || 'View all'} <ArrowRight size={17} aria-hidden="true" /></Link>}
  </div>;
}

export function SearchField({ value, onChange, placeholder, id }: { value: string; onChange: (value: string) => void; placeholder: string; id: string }) {
  return <label className="experience-search"><Search size={19} aria-hidden="true" /><span className="sr-only">{placeholder}</span><input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export function EmptyCollection({ title, description, to, link }: { title: string; description: string; to?: string; link?: string }) {
  return <div className="experience-empty"><Leaf size={34} aria-hidden="true" /><h2>{title}</h2><p>{description}</p>{to && <Link className="experience-button experience-button-soft" to={to}>{link || 'Explore'} <ArrowRight size={16} /></Link>}</div>;
}

export function ProjectCard({ entry }: { entry: PublicEntry<ProjectV2, Modpack> }) {
  if (entry.source === 'legacy') return <Link className="experience-card experience-project-card" to={'/modpacks/' + entry.slug}>
    <div className="experience-card-visual experience-card-visual-project"><Compass size={46} aria-hidden="true" /></div>
    <div className="experience-card-body"><h3>{entry.item.name}</h3><p>{entry.item.summary}</p><span className="experience-text-link">Explore <ArrowRight size={16}/></span></div></Link>;
  const project = entry.item;
  const teaser = project.status === 'internal-prototype';
  const image = project.media?.find((media) => media.kind === 'image');
  const releases = teaser ? [] : publicReleasesFor(project);
  return <Link className="experience-card experience-project-card" to={'/modpacks/' + entry.slug}>
    <div className={'experience-card-visual experience-card-visual-project ' + (teaser ? 'experience-visual-prototype' : 'experience-visual-native')}>
      {image ? <img src={image.url} alt={image.alt || ''} loading="lazy" width="640" height="360" /> : <div className="experience-visual-monogram" aria-hidden="true">{teaser ? <Compass size={52} /> : <Rocket size={52} />}</div>}
    </div>
    <div className="experience-card-body"><ProjectStatusBadge status={project.status}/><h3>{project.name}</h3>
      {project.summary && <p>{project.summary}</p>}
      {!teaser && releases[0] && <span className="experience-meta">v{releases[0].version} · {releases[0].channel}</span>}
      <span className="experience-text-link">Explore project <ArrowRight size={16} aria-hidden="true" /></span>
    </div>
  </Link>;
}

export function LauncherCard({ item }: { item: LauncherV2 }) {
  return <article className="experience-card experience-launcher-card"><div className="experience-launcher-icon"><Box size={30} aria-hidden="true"/></div><div className="experience-card-body">
    <h2>{item.name}</h2>{item.summary && <p>{item.summary}</p>}
    {item.platforms.length > 0 && <p className="experience-meta">{item.platforms.join(' · ')}</p>}
    <div className="experience-card-actions"><Link to={'/launchers/' + item.slug} className="experience-button experience-button-soft">Details <ArrowRight size={16} /></Link>
      {item.officialLinks?.[0] && <a className="experience-button experience-button-primary" href={item.officialLinks[0].url} target="_blank" rel="noopener noreferrer">Official site <ArrowRight size={16}/></a>}</div>
  </div></article>;
}

export function ArticleCard({ item }: { item: ArticleV2 }) {
  const image = item.media?.find((media) => media.kind === 'image')?.url;
  return <Link to={'/news/' + item.slug} className="experience-card experience-article-card">
    {image ? <img className="experience-article-image" src={image} alt="" loading="lazy" width="560" height="320" /> : <div className="experience-article-image experience-image-fallback"><Newspaper size={44} aria-hidden="true"/></div>}
    <div className="experience-card-body"><span className="experience-meta">{[item.category, item.publishedAt?.slice(0,10)].filter(Boolean).join(' · ')}</span><h3>{item.name}</h3>{item.summary && <p>{item.summary}</p>}<span className="experience-text-link">Read article <ArrowRight size={16} /></span></div>
  </Link>;
}

export function GuideCard({ guide }: { guide: GuideV2 }) {
  return <Link className="experience-card experience-guide-card" to={'/guides/' + guide.slug}><div className="experience-guide-icon"><BookOpen size={26} /></div><div className="experience-card-body"><h3>{guide.name}</h3>{guide.summary && <p>{guide.summary}</p>}<span className="experience-text-link">Read guide <ArrowRight size={16}/></span></div></Link>;
}
