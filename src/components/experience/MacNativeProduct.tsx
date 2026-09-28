import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, Download, Laptop, BookOpen, LifeBuoy, ChevronLeft, ChevronRight, Leaf, Monitor, Package, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { publicProject } from '@/content/publicResolver';
import type { ProjectV2, ReleaseV2 } from '@/content/v2/schema';
import { useI18n } from '@/lib/i18n';
import { useModrinthStats } from '@/lib/modrinthStats';
import { localizeItem } from '@/content/v2/localize';

function Gallery({ images, title }: { images: { url: string; alt: string; caption?: string }[]; title: string }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const count = images.length;
  const mediaKey = images.map((image) => image.url).join('|');
  useEffect(() => {
    if (count < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 4500);
    return () => window.clearInterval(timer);
  }, [count, paused]);
  useEffect(() => setIndex(0), [mediaKey]);
  if (!count) return <div className="mac-gallery mac-gallery-illustration" role="img" aria-label={t('mac.illustration')}><span>{title}</span><small>{t('mac.illustration')}</small></div>;
  const active = images[index];
  const move = (direction: number) => setIndex((current) => (current + direction + count) % count);
  return <div className="mac-gallery" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} onTouchStart={(event) => { touch.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { if (touch.current !== null) { const delta = (event.changedTouches[0]?.clientX ?? touch.current) - touch.current; if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1); } touch.current = null; }}>
    <img key={active.url} src={active.url} alt={active.alt} loading="lazy" decoding="async" />
    <div className="mac-gallery-caption"><span>{t('mac.screenshots')} · {index + 1}/{count}</span>{active.caption && <strong>{active.caption}</strong>}</div>
    {count > 1 && <div className="mac-gallery-controls"><div className="mac-gallery-dots" role="group" aria-label={t('mac.screenshots')}>{images.map((image, position) => <button key={image.url} type="button" aria-label={`${t('mac.screenshots')} ${position + 1}`} aria-current={position === index ? 'true' : undefined} onClick={() => setIndex(position)} />)}</div><div className="mac-gallery-arrows"><button type="button" aria-label={t('mac.previous')} onClick={() => move(-1)}><ChevronLeft size={20}/></button><button type="button" aria-label={t('mac.next')} onClick={() => move(1)}><ChevronRight size={20}/></button></div></div>}
  </div>;
}

// All factual details come from the published V2 project/release or the official Modrinth API.
export function MacNativeProduct({ project: sourceProject, releases }: { project: ProjectV2; releases: ReleaseV2[] }) {
  const { t, locale } = useI18n();
  const project = localizeItem(sourceProject, locale);
  const release = releases[0];
  const releaseProvider = release?.distribution?.find((entry) => entry.state === 'active' && entry.url);
  const releaseUrl = releaseProvider?.url;
  const projectUrl = project.distribution?.find((entry) => entry.provider === 'modrinth' && entry.state === 'active' && entry.url)?.url;
  const { data: official } = useModrinthStats(projectUrl);
  const publishedCompatibility = { ...project.compatibility, ...release?.compatibility };
  const compatibility = [
    { label: 'Minecraft', value: publishedCompatibility?.minecraft?.join(' · ') },
    { label: t('mac.loader'), value: publishedCompatibility?.loaders?.join(' · ') },
    { label: t('mac.platform'), value: publishedCompatibility?.platforms?.join(' · ') },
  ].filter((item) => item.value);
  const gallery = [
    ...(project.media?.filter((item) => item.kind === 'image').map((item) => ({ url: item.url, alt: item.alt || project.name, caption: item.caption })) || []),
    ...(official?.gallery || []),
  ].filter((image, position, all) => all.findIndex((other) => other.url === image.url) === position);
  const related = publicProject('crafttoons');
  const download = releaseUrl || projectUrl;
  return <SiteLayout>
    <Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || gallery[0]?.url} noindex={project.seo?.noindex}/>
    <section className="experience-detail-hero experience-product-hero mac-hero has-art">
      <HeroLandscape scene="mac"/>
      <div className="container mac-hero-content">
        <Link className="experience-back" to="/modpacks">{t('nav.modpacks')} <ArrowRight size={15}/> {project.name}</Link>
        <div className="mac-hero-copy"><div className="mac-heading"><span className="mac-product-icon" aria-hidden="true">{official?.iconUrl ? <img src={official.iconUrl} alt=""/> : <Package size={38}/>}</span><div><div className="mac-title-row"><h1>{project.name}</h1><ProjectStatusBadge status={project.status}/></div><p className="mac-headline">{t('mac.headline')}</p></div></div>
          {project.summary && <p className="mac-summary">{project.summary}</p>}
          <div className="mac-pills" aria-label={t('mac.publishedDetails')}>{release && <span><Package size={16}/> {release.version}</span>}{compatibility.map(({label,value}) => <span key={label}>{label === 'Minecraft' ? <Package size={16}/> : label === t('mac.platform') ? <Laptop size={16}/> : <Monitor size={16}/>} {label === 'Minecraft' ? `${label} ${value}` : value}</span>)}</div>
          <div className="experience-hero-actions">{download && <a className="experience-button experience-button-primary" href={download} target="_blank" rel="noopener noreferrer"><Download size={18}/> {t('mac.download')} {release?.version} {t('mac.on')} Modrinth <ArrowRight size={17}/></a>}<a className="experience-button experience-button-soft" href="#inside"><BookOpen size={17}/> {t('mac.whatsInside')}</a></div>
        </div>
      </div>
    </section>
    <div className="container mac-product-body">
      <section id="inside" className="mac-benefits" aria-labelledby="mac-benefits-title"><div className="mac-benefits-heading"><Leaf size={32} aria-hidden="true"/><div><h2 id="mac-benefits-title">{t('mac.onMac')}</h2>{project.description && <RichMarkdown markdown={project.description}/>}</div></div><div className="mac-benefit-cards">{project.features?.map((feature, index) => { const Icon = [Leaf, Monitor, Play][index % 3]; return <article className="mac-benefit" key={feature.title}><span className="mac-benefit-icon"><Icon size={24}/></span><div><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</div></article>; })}</div></section>
      <div className="mac-product-main"><Gallery images={gallery} title={project.name}/><div className="mac-product-side">
        {release && <section id="releases" className="mac-release-panel"><div className="mac-panel-heading"><h2><Package size={18}/> {t('mac.latestRelease')}</h2>{projectUrl && <a href={projectUrl + '/versions'} target="_blank" rel="noopener noreferrer">{t('mac.allReleases')} <ArrowRight size={16}/></a>}</div><div className="mac-release-main"><span className="mac-release-icon" aria-hidden="true">{official?.iconUrl ? <img src={official.iconUrl} alt=""/> : <Package size={30}/>}</span><div><div className="mac-release-version"><strong>{release.version}</strong><ProjectStatusBadge status={project.status}/></div><p>{compatibility.map(({value}) => value).join(' · ')}</p>{release.changelog && <div className="mac-release-note"><RichMarkdown markdown={release.changelog}/></div>}</div></div><div className="mac-release-actions">{releaseUrl && <a className="experience-button experience-button-primary" href={releaseUrl} target="_blank" rel="noopener noreferrer">{t('mac.officialRelease')} · Modrinth <ExternalLink size={16}/></a>}{projectUrl && <a className="experience-text-link" href={projectUrl} target="_blank" rel="noopener noreferrer">{t('mac.source')} <ArrowRight size={16}/></a>}</div>{official && <p className="mac-live-stats">{new Intl.NumberFormat(locale).format(official.downloads)} {t('mac.totalDownloads')} · {new Intl.NumberFormat(locale).format(official.followers)} {t('mac.followers')}</p>}</section>}
        {project.installation && <section id="installation" className="mac-steps-panel"><div className="mac-panel-heading"><h2><BookOpen size={18}/> {t('mac.howItWorks')}</h2><a href="#mac-install-detail">{t('mac.details')} <ArrowRight size={16}/></a></div><div className="mac-steps">{(['download','install','play'] as const).map((step, index) => <div key={step}><span>{index + 1}</span><strong>{t('mac.step.' + step)}</strong><p>{t('mac.step.' + step + 'Info')}</p></div>)}</div></section>}
      </div></div>
      <section className="mac-help-banner"><LifeBuoy size={35}/><div><h2>{t('mac.help')}</h2><p>{t('mac.helpInfo')}</p></div><div className="experience-card-actions">{project.installation && <a className="experience-button experience-button-soft" href="#mac-install-detail">{t('mac.details')} <ArrowRight size={16}/></a>}<Link className="experience-button experience-button-soft" to="/support">{t('nav.support')} <ArrowRight size={16}/></Link></div></section>
      <div className="mac-deeper-content">{project.installation && <details id="mac-install-detail" className="mac-deeper-panel"><summary>{t('project.installation')}</summary><RichMarkdown markdown={project.installation}/><Link to="/launchers" className="experience-text-link">{t('mac.launchers')} <ArrowRight size={16}/></Link></details>}
        {(compatibility.length > 0 || project.requirements?.length) && <details className="mac-deeper-panel"><summary>{t('mac.compatibility')}</summary><dl className="experience-product-specs">{compatibility.map(({label,value}) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{project.requirements?.map((item) => <div key={item.title}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>)}</details>}
        {release?.changelog && <details className="mac-deeper-panel"><summary>{t('mac.publishedReleases')}</summary><RichMarkdown markdown={release.changelog}/>{releaseUrl && <a className="experience-text-link" href={releaseUrl} target="_blank" rel="noopener noreferrer">{t('mac.officialRelease')} <ExternalLink size={16}/></a>}</details>}
        {project.knownIssues?.length ? <details className="mac-deeper-panel"><summary>{t('mac.knownIssues')}</summary><ul>{project.knownIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></details> : null}
        {project.faq?.length ? <details id="questions" className="mac-deeper-panel"><summary>Mac Native FAQ</summary>{project.faq.map((item) => <div key={item.question}><h3>{item.question}</h3><RichMarkdown markdown={item.answer}/></div>)}</details> : null}
      </div>
      {related?.source === 'v2' && <p className="mac-related"><Link to="/modpacks/crafttoons">{t('mac.more')} <ArrowRight size={16}/></Link></p>}
    </div>
  </SiteLayout>;
}
