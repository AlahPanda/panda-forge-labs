import { ArrowLeft, ArrowRight, BookOpen, Box, Download, ExternalLink, Heart, Laptop, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import type { LauncherV2 } from '@/content/v2/schema';
import { useI18n } from '@/lib/i18n';
import { localizeItem } from '@/content/v2/localize';
import { site } from '@/content';
import SupportCallout from './SupportCallout';

export default function LauncherProduct({ source }: { source: LauncherV2 }) {
  const { locale, t } = useI18n();
  const item = localizeItem(source, locale);
  const facts = [
    ['Version', item.currentVersion], [t('ui.platforms'), item.platforms.join(' · ')],
    [t('launcher.developer'), item.developer], [t('launcher.license'), item.license],
    [t('launcher.verified'), item.lastVerified?.slice(0,10)],
  ].filter(([,value]) => value);
  return <SiteLayout><Seo title={(item.seo?.title || item.name) + ' — AlahPanda Labs'} description={item.seo?.description || item.summary || item.name} image={item.seo?.image || item.media?.find((media) => media.kind === 'image')?.url} noindex={item.seo?.noindex}/>
    <header className={'launcher-detail-hero launcher-tone-' + item.slug}><div className="container"><Link className="experience-back" to="/launchers"><ArrowLeft size={16}/>{t('ui.allLaunchers')}</Link><div className="launcher-detail-hero-inner"><div><span className="experience-kicker">{item.featured ? t('launcher.ourPick') : t('nav.launchers')}</span><h1>{item.name}</h1>{item.summary && <p>{item.summary}</p>}<div className="experience-card-actions"><a className="experience-button experience-button-primary" href={item.officialLinks?.find((link) => /release|download/i.test(link.label))?.url || item.officialLinks?.[0]?.url} target="_blank" rel="noopener noreferrer"><Download size={18}/>{t('launcher.officialDownload')} <ExternalLink size={16}/></a><a className="experience-button experience-button-soft" href="#launcher-about">{t('ui.details')} <ArrowRight size={16}/></a></div></div><div className="launcher-detail-mark" aria-hidden="true"><Box size={100}/></div></div></div></header>
    <div className="container launcher-product-body"><div className="launcher-facts">{facts.map(([label,value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className="launcher-content-columns"><main><section id="launcher-about" className="experience-content-panel"><h2>{t('ui.aboutProject',{name:item.name})}</h2>{item.description ? <RichMarkdown markdown={item.description}/> : item.summary && <p>{item.summary}</p>}{item.featured && <p className="launcher-editorial"><Heart size={17}/>{t('launcher.editorialPick')}</p>}</section>
        {!!item.features?.length && <section className="experience-content-panel"><h2>{t('project.features')}</h2><div className="launcher-feature-grid">{item.features.map((feature) => <div key={feature.title}><ShieldCheck size={21}/><h3>{feature.title}</h3><p>{feature.description}</p></div>)}</div></section>}
        {item.installation && <section className="experience-content-panel"><h2>{t('project.installation')}</h2><RichMarkdown markdown={item.installation}/></section>}
        {(item.instanceManagement || item.javaManagement || item.modpackProviders?.length || item.supportedLoaders?.length) && <section className="experience-content-panel"><h2>{t('launcher.technical')}</h2><dl className="launcher-technical">{item.instanceManagement && <div><dt>{t('launcher.instances')}</dt><dd>{item.instanceManagement}</dd></div>}{item.javaManagement && <div><dt>Java</dt><dd>{item.javaManagement}</dd></div>}{!!item.modpackProviders?.length && <div><dt>{t('launcher.providers')}</dt><dd>{item.modpackProviders.join(' · ')}</dd></div>}{!!item.supportedLoaders?.length && <div><dt>Loaders</dt><dd>{item.supportedLoaders.join(' · ')}</dd></div>}</dl></section>}
        {item.media?.length ? <section className="experience-content-panel"><h2>{t('mac.screenshots')}</h2><div className="launcher-media-grid">{item.media.filter((media) => media.kind === 'image').map((media) => <figure key={media.url}><img src={media.url} alt={media.alt || ''} loading="lazy"/>{media.caption && <figcaption>{media.caption}</figcaption>}</figure>)}</div></section> : null}
      </main><aside className="launcher-detail-aside"><section className="experience-content-panel"><h2>{t('launcher.officialDownload')}</h2>{item.downloads?.length ? <div className="launcher-download-list">{item.downloads.map((download) => <a key={download.url} href={download.url} target="_blank" rel="noopener noreferrer"><Download size={17}/><span>{download.label}<small>{download.platform}</small></span><ExternalLink size={15}/></a>)}</div> : <p>{t('launcher.chooseOfficial')}</p>}{item.officialLinks?.map((link) => <a key={link.url} className="experience-text-link" href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ExternalLink size={15}/></a>)}</section>
        {item.knownLimitations?.length ? <section className="experience-content-panel"><h2>{t('launcher.limitations')}</h2><ul>{item.knownLimitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></section> : null}
        <section className="experience-content-panel"><h2>{t('launcher.sources')}</h2>{item.sources?.map((source) => <a key={source.url} className="experience-text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}<ExternalLink size={15}/></a>)}{item.lastVerified && <p className="experience-meta">{t('launcher.verified')}: {item.lastVerified.slice(0,10)}</p>}</section>
        <section className="experience-content-panel"><BookOpen size={23}/><h2>{t('ui.exploreSection')}</h2><Link className="experience-text-link" to="/modpacks">{t('nav.modpacks')} <ArrowRight size={16}/></Link><Link className="experience-text-link" to="/guides">{t('nav.guides')} <ArrowRight size={16}/></Link><a className="experience-text-link" href={site.discordUrl} target="_blank" rel="noopener noreferrer">Discord <ExternalLink size={16}/></a></section>
      </aside></div><SupportCallout/><p className="launcher-disclaimer">{t('launcher.licenseNote')}</p></div>
  </SiteLayout>;
}
