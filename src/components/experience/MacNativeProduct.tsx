import { ArrowRight, ExternalLink, Laptop, BookOpen, LifeBuoy, Leaf, Monitor, Package, Play, Download, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { publicProject } from '@/content/publicResolver';
import type { ProjectV2, ReleaseV2 } from '@/content/v2/schema';
import { useI18n } from '@/lib/i18n';
import { useProjectPublication } from '@/lib/useProjectPublication';
import { localizeItem } from '@/content/v2/localize';
import { ProjectGallery } from './ProjectGallery';
import { SupporterDownload, resolveSupporterConfiguration } from './SupporterDownload';
import { publicSettings } from '@/content/publicResolver';

// All factual details come from the published V2 project/release or the official Modrinth API.
export function PremiumProjectPage({ project: sourceProject, releases }: { project: ProjectV2; releases: ReleaseV2[] }) {
  const { t, locale } = useI18n();
  const project = localizeItem(sourceProject, locale);
  const copy = project.premiumCopy === 'mac' ? 'mac' : 'premium';
  const upstream = useProjectPublication(sourceProject);
  const official = upstream.data?.snapshot.project;
  const current = official?.release;
  // The editorial release is historical when an upstream connection is offline.
  // It preserves the product panel without claiming to be the current Modrinth version.
  const release = current ? { ...releases[0], slug: current.id, name: `${project.name} ${current.version}`, sourceLocale: project.sourceLocale, translations: {}, projectSlug: project.slug, version: current.version, channel: current.channel, releasedAt: current.publishedAt, changelog: current.changelog, compatibility: { minecraft: current.minecraft, loaders: current.loaders, platforms: project.compatibility?.platforms } } as ReleaseV2 : releases[0];
  const historicalRelease = !!project.upstream && !current && !!release;
  const iconUrl = official?.iconUrl || project.iconUrl;
  const releaseProvider = release?.distribution?.find((entry) => entry.state === 'active' && entry.url);
  const releaseUrl = current?.url || releaseProvider?.url;
  const projectUrl = project.distribution?.find((entry) => entry.provider === 'modrinth' && entry.state === 'active' && entry.url)?.url;
  const publishedCompatibility = { ...project.compatibility, ...release?.compatibility };
  const compatibility = [
    { label: 'Minecraft', value: publishedCompatibility?.minecraft?.join(' · ') },
    { label: t('mac.loader'), value: publishedCompatibility?.loaders?.join(' · ') },
    { label: t('mac.platform'), value: publishedCompatibility?.platforms?.join(' · ') },
  ].filter((item) => item.value);
  const localGallery = [
    ...(project.media?.filter((item) => item.kind === 'image').map((item) => ({ url: item.url, alt: item.alt || project.name, caption: item.caption })) || []),
  ];
  const gallery = official?.gallery.length ? official.gallery : localGallery;
  const related = publicProject('crafttoons');
  const download = project.upstream ? `/api/download/${encodeURIComponent(project.slug)}` : (releaseUrl || projectUrl);
  const supporter = resolveSupporterConfiguration(project.supporterDownload, publicSettings()?.defaultSupporterDownload);
  return <SiteLayout>
    <Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || gallery[0]?.url} noindex={project.seo?.noindex}/>
    <section className="experience-detail-hero experience-product-hero mac-hero has-art">
      <HeroLandscape scene={copy === 'mac' ? 'mac' : 'projects'} artwork={project.heroArtwork?.day && project.heroArtwork?.night ? {day:project.heroArtwork.day,night:project.heroArtwork.night,dayMobile:project.heroArtwork.dayMobile,nightMobile:project.heroArtwork.nightMobile} : undefined}/>
      <div className="container mac-hero-content">
        <Link className="experience-back" to="/modpacks">{t('nav.modpacks')} <ArrowRight size={15}/> {project.name}</Link>
        <div className="mac-hero-copy"><div className="mac-heading"><span className="mac-product-icon" aria-hidden="true">{iconUrl ? <img src={iconUrl} alt=""/> : <span className="mac-icon-initials">{project.name.slice(0,2).toUpperCase()}</span>}</span><div><div className="mac-title-row"><h1>{project.name}</h1><ProjectStatusBadge status={project.status}/></div><p className="mac-headline">{t(copy + '.headline')}</p></div></div>
          {project.summary && <p className="mac-summary">{project.summary}</p>}
          <div className="mac-pills" aria-label={t('mac.publishedDetails')}>{release && <span><Package size={16}/> {release.version}{historicalRelease ? ` · ${t('premium.lastVerified')}` : ''}</span>}{compatibility.map(({label,value}) => <span key={label}>{label === 'Minecraft' ? <Package size={16}/> : label === t('mac.platform') ? <Laptop size={16}/> : <Monitor size={16}/>} {label === 'Minecraft' ? `${label} ${value}` : value}</span>)}</div>
          <div className="experience-hero-actions">{download && <SupporterDownload normalUrl={download} configuration={supporter} label={`${t('mac.download')} ${!historicalRelease ? release?.version || '' : ''} ${t('mac.on')} Modrinth`.replace(/\s+/g,' ').trim()}/>}<a className="experience-button experience-button-soft" href="#inside"><BookOpen size={17}/> {t('mac.whatsInside')}</a></div>
        </div>
      </div>
    </section>
    <div className="container mac-product-body">
      <section id="inside" className="mac-benefits" aria-labelledby="mac-benefits-title"><div className="mac-benefits-heading"><Leaf size={32} aria-hidden="true"/><div><h2 id="mac-benefits-title">{t(copy + '.onMac')}</h2>{project.description && <RichMarkdown markdown={project.description}/>}</div></div><div className="mac-benefit-cards">{project.features?.map((feature, index) => { const Icon = [Leaf, Monitor, Play][index % 3]; return <article className="mac-benefit" key={feature.title}><span className="mac-benefit-icon"><Icon size={24}/></span><div><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</div></article>; })}</div></section>
      <div className="mac-product-main"><ProjectGallery images={gallery} title={project.name} fallback={copy === 'mac' ? 'mac' : 'projects'}/><div className="mac-product-side">
        {release && <section id="releases" className="mac-release-panel"><div className="mac-panel-heading"><h2><Package size={18}/> {historicalRelease ? t('premium.lastVerifiedRelease') : t('mac.latestRelease')}</h2>{projectUrl && <a href={projectUrl + '/versions'} target="_blank" rel="noopener noreferrer">{t('mac.allReleases')} <ArrowRight size={16}/></a>}</div><div className="mac-release-main"><span className="mac-release-icon" aria-hidden="true">{iconUrl ? <img src={iconUrl} alt=""/> : <span className="mac-icon-initials">{project.name.slice(0,2).toUpperCase()}</span>}</span><div><div className="mac-release-version"><strong>{release.version}</strong><ProjectStatusBadge status={project.status}/></div><p>{compatibility.map(({value}) => value).join(' · ')}</p>{release.releasedAt && <p>{new Intl.DateTimeFormat(locale, {dateStyle:'medium'}).format(new Date(release.releasedAt))} · {release.channel}</p>}{release.changelog && <div className="mac-release-note"><RichMarkdown markdown={release.changelog}/></div>}</div></div>{official && <div className="mac-live-stats" aria-label={t('premium.modrinthStats')}><span className="mac-stat-primary" title={`${new Intl.NumberFormat(locale).format(official.downloads)} ${t('mac.totalDownloads')}`}><Download size={18}/><strong>{new Intl.NumberFormat(locale,{notation:'compact',maximumFractionDigits:1}).format(official.downloads)}</strong><small>{t('mac.totalDownloads')}</small></span><span title={`${new Intl.NumberFormat(locale).format(official.followers)} ${t('mac.followers')}`}><Users size={17}/><strong>{new Intl.NumberFormat(locale,{notation:'compact',maximumFractionDigits:1}).format(official.followers)}</strong><small>{t('mac.followers')}</small></span></div>}<div className="mac-release-actions">{releaseUrl && <a className="experience-button experience-button-primary" href={releaseUrl} target="_blank" rel="noopener noreferrer">{t('mac.officialRelease')} · Modrinth <ExternalLink size={16}/></a>}{projectUrl && <a className="experience-text-link" href={projectUrl} target="_blank" rel="noopener noreferrer">{t('mac.source')} <ArrowRight size={16}/></a>}</div></section>}
        {project.installation && <section id="installation" className="mac-steps-panel"><div className="mac-panel-heading"><h2><BookOpen size={18}/> {t('mac.howItWorks')}</h2><a href="#mac-install-detail">{t('mac.details')} <ArrowRight size={16}/></a></div><div className="mac-steps">{(['download','install','play'] as const).map((step, index) => <div key={step}><span>{index + 1}</span><strong>{t(copy + '.step.' + step)}</strong><p>{t(copy + '.step.' + step + 'Info')}</p></div>)}</div></section>}
      </div></div>
      <section className="mac-help-banner"><LifeBuoy size={35}/><div><h2>{t(copy + '.help')}</h2><p>{t(copy + '.helpInfo')}</p></div><div className="experience-card-actions">{project.installation && <a className="experience-button experience-button-soft" href="#mac-install-detail">{t('mac.details')} <ArrowRight size={16}/></a>}<Link className="experience-button experience-button-soft" to="/support">{t('nav.support')} <ArrowRight size={16}/></Link></div></section>
      <div className="mac-deeper-content">{project.installation && <details id="mac-install-detail" className="mac-deeper-panel"><summary>{t('project.installation')}</summary><RichMarkdown markdown={project.installation}/><Link to="/launchers" className="experience-text-link">{t('mac.launchers')} <ArrowRight size={16}/></Link></details>}
        {(compatibility.length > 0 || project.requirements?.length) && <details className="mac-deeper-panel"><summary>{t('mac.compatibility')}</summary><dl className="experience-product-specs">{compatibility.map(({label,value}) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{project.requirements?.map((item) => <div key={item.title}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>)}</details>}
        {(release || releases.length > 0) && <details className="mac-deeper-panel"><summary>{t('mac.publishedReleases')}</summary>{release && <div><h3>{release.version}{historicalRelease ? ` · ${t('premium.lastVerified')}` : ''}</h3>{release.changelog && <RichMarkdown markdown={release.changelog}/ >}{releaseUrl && <a className="experience-text-link" href={releaseUrl} target="_blank" rel="noopener noreferrer">{t('mac.officialRelease')} <ExternalLink size={16}/></a>}</div>}{releases.filter((item) => item.slug !== release?.slug && item.version !== release?.version).map((item) => <div key={item.slug}><h3>{item.version}</h3>{item.changelog && <RichMarkdown markdown={item.changelog}/ >}{item.distribution?.find((provider) => provider.state === 'active' && provider.url)?.url && <a className="experience-text-link" href={item.distribution.find((provider) => provider.state === 'active' && provider.url)!.url} target="_blank" rel="noopener noreferrer">{t('mac.officialRelease')} <ExternalLink size={16}/></a>}</div>)}</details>}
        {project.knownIssues?.length ? <details className="mac-deeper-panel"><summary>{t('mac.knownIssues')}</summary><ul>{project.knownIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></details> : null}
        {project.faq?.length ? <details id="questions" className="mac-deeper-panel"><summary>{project.name} FAQ</summary>{project.faq.map((item) => <div key={item.question}><h3>{item.question}</h3><RichMarkdown markdown={item.answer}/></div>)}</details> : null}
      </div>
      {related?.source === 'v2' && <p className="mac-related"><Link to="/modpacks/crafttoons">{t('mac.more')} <ArrowRight size={16}/></Link></p>}
    </div>
  </SiteLayout>;
}
