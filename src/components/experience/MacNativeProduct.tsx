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

// A product page driven by published V2 fields. Missing editorial fields do not
// produce an empty panel or inherit unverified values from the legacy modpack.
export function MacNativeProduct({ project, releases }: { project: ProjectV2; releases: ReleaseV2[] }) {
  const release = releases[0];
  const releaseUrl = release?.distribution?.find((entry) => entry.state === 'active' && entry.url)?.url;
  const projectUrl = project.distribution?.find((entry) => entry.state === 'active' && entry.url)?.url;
  const media = project.media?.filter((item) => item.kind === 'image') || [];
  const compatibility = [
    { label: 'Minecraft', value: project.compatibility?.minecraft?.join(' · ') },
    { label: 'Mod loader', value: project.compatibility?.loaders?.join(' · ') },
    { label: 'Platform', value: project.compatibility?.platforms?.join(' · ') },
  ].filter((item) => item.value);
  const related = publicProject('crafttoons');
  return <SiteLayout>
    <Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || media[0]?.url} />
    <section className="experience-detail-hero experience-product-hero has-art">
      <HeroLandscape scene="mac" />
      <div className="container">
        <Link className="experience-back" to="/projects"><ArrowLeft size={16} /> Projects</Link>
        <div className="experience-detail-intro"><div><ProjectStatusBadge status={project.status} /><h1>{project.name}</h1>{project.summary && <p>{project.summary}</p>}
          <div className="experience-hero-actions">
            {releaseUrl && <a className="experience-button experience-button-primary" href={releaseUrl} target="_blank" rel="noopener noreferrer"><Download size={18} /> Download {release.version} on Modrinth</a>}
            {projectUrl && <a className="experience-button experience-button-soft" href={projectUrl} target="_blank" rel="noopener noreferrer">Official Modrinth project <ExternalLink size={17} /></a>}
          </div>
        </div></div>
      </div>
    </section>
    <div className="container experience-product-body">
      <div className="experience-product-facts" aria-label="Published Mac Native details">
        <div><span>Project status</span><strong><ProjectStatusBadge status={project.status} /></strong></div>
        {release && <div><span>Published release</span><strong>v{release.version} · {release.channel}</strong></div>}
        {compatibility.map(({ label, value }) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        {project.compatibility?.environment && <div><span>Environment</span><strong>{project.compatibility.environment === 'client' ? 'Client-side' : project.compatibility.environment === 'server' ? 'Server-side' : 'Client and server'}</strong></div>}
      </div>
      {project.description && <section className="experience-product-section experience-product-intro"><div><span className="experience-kicker"><Laptop size={17} /> The experience</span><h2>Mac Native on Mac</h2></div><RichMarkdown markdown={project.description} /></section>}
      {project.features?.length ? <section className="experience-product-section"><SectionTitle title="What Mac Native focuses on" icon={Laptop}/><div className="experience-grid experience-grid-resources">{project.features.map((feature) => <article className="experience-card experience-resource" key={feature.title}><Laptop size={25} aria-hidden="true"/><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</article>)}</div></section> : null}
      {(compatibility.length > 0 || project.requirements?.length) && <section className="experience-product-section experience-product-split"><div><span className="experience-kicker">Compatibility</span><h2>Before you install</h2><p>Use the published Minecraft version and loader for this release. Hardware and memory recommendations are shown only when confirmed.</p></div><div className="experience-content-panel"><dl className="experience-product-specs">{compatibility.map(({ label, value }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{project.requirements?.map((item) => <div className="experience-product-requirement" key={item.title}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div>)}</div></section>}
      {project.installation && <section className="experience-product-section experience-product-split"><div><span className="experience-kicker"><BookOpen size={17}/> Getting started</span><h2>Installation</h2><Link className="experience-text-link" to="/launchers">Explore launchers <ArrowRight size={16}/></Link></div><div className="experience-content-panel experience-reading"><RichMarkdown markdown={project.installation}/></div></section>}
      {media.length > 0 && <section className="experience-product-section"><SectionTitle title="Screenshots"/><div className="experience-product-media">{media.map((item) => <figure key={item.url}><img src={item.url} alt={item.alt || ''} loading="lazy"/>{item.caption && <figcaption>{item.caption}</figcaption>}</figure>)}</div></section>}
      {releases.length > 0 && <section className="experience-product-section"><SectionTitle title="Published releases"/><div className="experience-grid experience-grid-resources">{releases.map((item) => <article className="experience-card experience-release experience-release-detail" key={item.slug}><span className="experience-kicker">{item.channel}</span><h3>{item.name}</h3>{item.changelog && <RichMarkdown markdown={item.changelog}/>}<div className="experience-card-actions">{item.distribution?.filter((provider) => provider.state === 'active' && provider.url).map((provider) => <a key={provider.provider} className="experience-button experience-button-soft" href={provider.url} target="_blank" rel="noopener noreferrer">Official {provider.provider} release <ExternalLink size={16}/></a>)}</div></article>)}</div>{projectUrl && <a className="experience-text-link experience-product-source" href={projectUrl} target="_blank" rel="noopener noreferrer">Full mod list and release history on Modrinth <ExternalLink size={16}/></a>}</section>}
      {project.knownIssues?.length ? <section className="experience-product-section experience-content-panel"><h2>Known issues</h2><ul className="experience-product-list">{project.knownIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul></section> : null}
      {project.faq?.length ? <section className="experience-product-section"><SectionTitle title="Mac Native FAQ"/><div className="experience-faq-group">{project.faq.map((item) => <details className="experience-faq-item" key={item.question}><summary>{item.question}</summary><div className="experience-faq-answer"><RichMarkdown markdown={item.answer}/></div></details>)}</div></section> : null}
      <section className="experience-product-section experience-product-end"><div><span className="experience-kicker"><LifeBuoy size={17}/> More to explore</span><h2>Help and other projects</h2><div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/support">Support <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/projects">All projects <ArrowRight size={16}/></Link></div></div>{related?.source === 'v2' && <ProjectCard entry={related}/>}</section>
    </div>
  </SiteLayout>;
}
