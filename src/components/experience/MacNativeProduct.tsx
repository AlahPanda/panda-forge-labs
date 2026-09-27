import { ArrowLeft, ArrowRight, ExternalLink, Download, Laptop, BookOpen, LifeBuoy } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { ProjectCard, SectionTitle } from './Shared';
import { publicProject } from '@/content/publicResolver';
import type { ProjectV2, ReleaseV2 } from '@/content/v2/schema';
import { useI18n } from '@/lib/i18n';
import { useModrinthStats } from '@/lib/modrinthStats';
import { localizeItem } from '@/content/v2/localize';

// A product page driven by published V2 fields. Missing editorial fields do not
// produce an empty panel or inherit unverified values from the legacy modpack.
export function MacNativeProduct({ project: sourceProject, releases }: { project: ProjectV2; releases: ReleaseV2[] }) {
  const { t, locale } = useI18n();
  const project = localizeItem(sourceProject, locale);
  const release = releases[0];
  const releaseProvider = release?.distribution?.find((entry) => entry.state === 'active' && entry.url);
  const releaseUrl = releaseProvider?.url;
  const projectUrl = project.distribution?.find((entry) => entry.provider === 'modrinth' && entry.state === 'active' && entry.url)?.url;
  const { data: publicStats } = useModrinthStats(projectUrl);
  const media = project.media?.filter((item) => item.kind === 'image') || [];
  const publishedCompatibility = { ...project.compatibility, ...release?.compatibility };
  const compatibility = [
    { label: 'Minecraft', value: publishedCompatibility?.minecraft?.join(' · ') },
    { label: t('mac.loader'), value: publishedCompatibility?.loaders?.join(' · ') },
    { label: t('mac.platform'), value: publishedCompatibility?.platforms?.join(' · ') },
  ].filter((item) => item.value);
  const related = publicProject('crafttoons');
  return <SiteLayout>
    <Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || media[0]?.url} noindex={project.seo?.noindex} />
    <section className="experience-detail-hero experience-product-hero has-art">
      <HeroLandscape scene="mac" />
      <div className="container">
        <Link className="experience-back" to="/modpacks"><ArrowLeft size={16} /> {t('nav.modpacks')}</Link>
        <div className="experience-detail-intro"><div><ProjectStatusBadge status={project.status} /><h1>{project.name}</h1>{project.summary && <p>{project.summary}</p>}
          <div className="experience-hero-actions">
            {releaseUrl && <a className="experience-button experience-button-primary" href={releaseUrl} target="_blank" rel="noopener noreferrer"><Download size={18} /> {t('mac.download')} {release.version} {t('mac.on')} {releaseProvider.provider === 'modrinth' ? 'Modrinth' : releaseProvider.provider}</a>}
            {projectUrl && <a className="experience-button experience-button-soft" href={projectUrl} target="_blank" rel="noopener noreferrer">{t('mac.officialProject')} <ExternalLink size={17} /></a>}
            {project.installation && <a className="experience-button experience-button-soft" href="#installation">{t('project.installation')} <ArrowRight size={17}/></a>}
          </div>
        </div></div>
      </div>
    </section>
    <div className="container experience-product-body">
      <div className="experience-product-facts" aria-label={t('mac.publishedDetails')}>
        <div><span>{t('mac.projectStatus')}</span><strong><ProjectStatusBadge status={project.status} /></strong></div>
        {release && <div><span>{t('mac.release')}</span><strong>v{release.version} · {t('status.' + release.channel)}</strong></div>}
        {compatibility.map(({ label, value }) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        {publishedCompatibility?.environment && <div><span>{t('mac.environment')}</span><strong>{publishedCompatibility.environment === 'client' ? t('mac.client') : publishedCompatibility.environment === 'server' ? t('mac.server') : t('mac.both')}</strong></div>}
        {publicStats && <><div><span>{t('mac.totalDownloads')}</span><strong>{new Intl.NumberFormat(locale).format(publicStats.downloads)}</strong></div><div><span>{t('mac.followers')}</span><strong>{new Intl.NumberFormat(locale).format(publicStats.followers)}</strong></div></>}
      </div>
      {project.description && <section className="experience-product-section experience-product-intro"><div><span className="experience-kicker"><Laptop size={17} /> {t('mac.experience')}</span><h2>{t('mac.onMac')}</h2></div><RichMarkdown markdown={project.description} /></section>}
      {project.features?.length ? <section className="experience-product-section"><SectionTitle title={t('mac.focus')} icon={Laptop}/><div className="experience-grid experience-grid-resources">{project.features.map((feature) => <article className="experience-card experience-resource" key={feature.title}><Laptop size={25} aria-hidden="true"/><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</article>)}</div></section> : null}
      {(compatibility.length > 0 || project.requirements?.length) && <section className="experience-product-section experience-product-split"><div><span className="experience-kicker">{t('mac.compatibility')}</span><h2>{t('mac.before')}</h2><p>{t('mac.beforeInfo')}</p></div><div className="experience-content-panel"><dl className="experience-product-specs">{compatibility.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{project.requirements?.map((item) => <div className="experience-product-requirement" key={item.title}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>)}</div></section>}
      {project.installation && <section id="installation" className="experience-product-section experience-product-split"><div><span className="experience-kicker"><BookOpen size={17}/> {t('mac.gettingStarted')}</span><h2>{t('project.installation')}</h2><Link className="experience-text-link" to="/launchers">{t('mac.launchers')} <ArrowRight size={16}/></Link></div><div className="experience-content-panel experience-reading"><RichMarkdown markdown={project.installation}/></div></section>}
      {media.length > 0 && <section className="experience-product-section"><SectionTitle title={t('mac.screenshots')}/><div className="experience-product-media">{media.map((item) => <figure key={item.url}><img src={item.url} alt={item.alt || ''} loading="lazy"/>{item.caption && <figcaption>{item.caption}</figcaption>}</figure>)}</div></section>}
      {releases.length > 0 && <section id="releases" className="experience-product-section"><SectionTitle title={t('mac.publishedReleases')}/><div className="experience-grid experience-grid-resources">{releases.map((item) => <article className="experience-card experience-release experience-release-detail" key={item.slug}><span className="experience-kicker">{t('status.' + item.channel)}{item.releasedAt && ` · ${item.releasedAt.slice(0,10)}`}</span><h3>{item.name}</h3>{item.changelog && <RichMarkdown markdown={item.changelog}/>}<div className="experience-card-actions">{item.distribution?.filter((provider) => provider.state === 'active' && provider.url).map((provider) => <a key={provider.provider} className="experience-button experience-button-soft" href={provider.url} target="_blank" rel="noopener noreferrer">{t('mac.officialRelease')} · {provider.provider} <ExternalLink size={16}/></a>)}</div></article>)}</div>{projectUrl && <a className="experience-text-link experience-product-source" href={projectUrl} target="_blank" rel="noopener noreferrer">{t('mac.source')} <ExternalLink size={16}/></a>}</section>}
      {project.knownIssues?.length ? <section className="experience-product-section experience-content-panel"><h2>{t('mac.knownIssues')}</h2><ul className="experience-product-list">{project.knownIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></section> : null}
      {project.faq?.length ? <section id="questions" className="experience-product-section"><SectionTitle title="Mac Native FAQ"/><div className="experience-faq-group">{project.faq.map((item) => <details className="experience-faq-item" key={item.question}><summary>{item.question}</summary><div className="experience-faq-answer"><RichMarkdown markdown={item.answer}/></div></details>)}</div></section> : null}
      <section className="experience-product-section experience-product-end"><div><span className="experience-kicker"><LifeBuoy size={17}/> {t('mac.more')}</span><h2>{t('mac.help')}</h2><div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/support">{t('nav.support')} <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/guides">{t('nav.guides')} <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/launchers">{t('nav.launchers')} <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/news">{t('nav.news')} <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/modpacks">{t('project.all')} <ArrowRight size={16}/></Link></div></div>{related?.source === 'v2' && <ProjectCard entry={related}/>}</section>
    </div>
  </SiteLayout>;
}
