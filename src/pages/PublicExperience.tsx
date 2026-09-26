import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Box, Compass, ExternalLink, Heart, Leaf, MessageCircle, Newspaper } from 'lucide-react';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import { site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { publicArticles, publicFeaturedProjects, publicGuide, publicGuides, publicHomepage, publicLauncher, publicLaunchers, publicProject, publicProjects, publicReleasesFor, publicSettings, publicFaq } from '@/content/publicResolver';
import type { ArticleV2, ProjectV2 } from '@/content/v2/schema';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';
import { PageHero, SectionTitle, SearchField, EmptyCollection, ProjectCard, LauncherCard, ArticleCard, GuideCard, destinations } from '@/components/experience/Shared';

const cardGrid = 'experience-grid experience-grid-projects';
const approvedArticles = (): ArticleV2[] => publicArticles().flatMap((entry) => entry.source === 'v2' ? [entry.item] : []);

export function HomeExperience() {
  const { t } = useI18n();
  const config = publicHomepage();
  const projects = publicFeaturedProjects().filter((entry) => entry.source === 'v2');
  const articles = approvedArticles().slice(0, 3);
  const guides = publicGuides().slice(0, 2);
  return <SiteLayout>
    <Seo title="AlahPanda Labs" description={publicSettings()?.description || config?.hero?.subtitle || t('home.heroSub')}/>
    <PageHero landscape eyebrow={config?.hero?.eyebrow || t('home.eyebrow')} title={config?.hero?.title || 'AlahPanda Labs'} description={config?.hero?.subtitle || t('home.heroSub')}>
      <Link className="experience-button experience-button-primary" to="/projects">{t('home.cta.explore')} <ArrowRight size={18}/></Link>
      <Link className="experience-button experience-button-soft" to="/about">{t('nav.about')} <ArrowRight size={18}/></Link>
    </PageHero>
    {config?.notices?.filter((notice) => notice.visible).map((notice) => <div key={notice.id} className="container experience-notice">{notice.link ? <a href={notice.link} target="_blank" rel="noopener noreferrer">{notice.text}</a> : notice.text}</div>)}
    <div className="container experience-home-body">
      <nav className="experience-quick-nav" aria-label="Explore the site">{destinations.map(({path,label,Icon}) => <Link key={path} to={path}><span className="experience-quick-icon"><Icon size={23} aria-hidden="true"/></span><span>{label}</span><ArrowRight size={15} aria-hidden="true"/></Link>)}
        <a href={site.discordUrl} target="_blank" rel="noopener noreferrer"><span className="experience-quick-icon"><MessageCircle size={23}/></span><span>Community</span><ExternalLink size={15}/></a>
      </nav>
      {config?.sections?.find((s) => s.id === 'featured-projects')?.visible !== false && <section className="experience-section"><SectionTitle title={t('home.featured')} to="/projects" link="View all projects" icon={Compass}/><div className={cardGrid}>{projects.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div></section>}
      {config?.sections?.find((s) => s.id === 'latest-news')?.visible !== false && <section className="experience-section"><SectionTitle title={t('home.latest')} to="/news" icon={Newspaper}/>{articles.length ? <div className="experience-grid experience-grid-news">{articles.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div> : <EmptyCollection title="No published articles yet" description="New stories will appear here after editorial review." to="/news" link="News"/>}</section>}
      <section className="experience-section"><SectionTitle title="Resources" to="/guides" icon={BookOpen}/><div className="experience-grid experience-grid-resources"><Link className="experience-card experience-resource" to="/launchers"><Box size={30}/><h3>Launchers</h3><p>Explore reviewed official launcher links.</p><span className="experience-text-link">Browse launchers <ArrowRight size={16}/></span></Link>
        {guides.length ? guides.map((guide) => <GuideCard key={guide.slug} guide={guide}/>) : <Link className="experience-card experience-resource" to="/guides"><BookOpen size={30}/><h3>Guides</h3><p>Published guides will be available here.</p><span className="experience-text-link">Visit guides <ArrowRight size={16}/></span></Link>}
        <Link className="experience-card experience-resource" to="/faq"><MessageCircle size={30}/><h3>FAQ</h3><p>Questions and answers when published.</p><span className="experience-text-link">Visit FAQ <ArrowRight size={16}/></span></Link>
      </div></section>
      <section className="experience-section experience-community"><div><span className="experience-kicker"><Leaf size={17}/> AlahPanda Labs</span><h2>{t('footer.tagline')}</h2><div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/about">About <ArrowRight size={17}/></Link><a className="experience-button experience-button-primary" href={site.discordUrl} target="_blank" rel="noopener noreferrer">{t('nav.discord')} <ExternalLink size={17}/></a></div></div><Compass size={118} aria-hidden="true"/></section>
    </div>
  </SiteLayout>;
}

export function ProjectsExperience({ modpacks = false }: { modpacks?: boolean }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const entries = publicProjects().filter((entry) => entry.source === 'v2');
  const filtered = useMemo(() => entries.filter((entry) => (entry.item.name + ' ' + (entry.item.summary || '')).toLowerCase().includes(query.trim().toLowerCase())), [entries, query]);
  const title = modpacks ? t('nav.modpacks') : 'Projects';
  return <SiteLayout><Seo title={title + ' — AlahPanda Labs'} description="Explore projects created by AlahPanda."/>
    <PageHero landscape scene="projects" title={title} eyebrow="Explore" description="Explore the projects and experiences created by AlahPanda."/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={modpacks ? t('nav.modpacks') : 'Explore projects'} icon={Compass}/><SearchField id="project-search" value={query} onChange={setQuery} placeholder={'Search ' + title.toLowerCase()}/></div>
      {filtered.length ? <div className={cardGrid}>{filtered.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div> : <EmptyCollection title="No matching projects" description="Try another search term."/>}
    </section>
  </SiteLayout>;
}

export function ProjectDetailExperience() {
  const { slug } = useParams();
  const entry = slug ? publicProject(slug) : undefined;
  if (!entry || entry.source !== 'v2') return <MissingExperience title="Project not found" to="/projects"/>;
  const project: ProjectV2 = entry.item;
  const teaser = project.status === 'internal-prototype';
  const releases = teaser ? [] : publicReleasesFor(project);
  const image = project.media?.find((medium) => medium.kind === 'image');
  const primary = project.distribution?.find((provider) => provider.state === 'active' && provider.priority === 'primary' && provider.url);
  return <SiteLayout><Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || image?.url}/>
    <section className={'experience-detail-hero' + (teaser ? '' : ' has-art')}>{!teaser && <HeroLandscape scene="mac"/>}<div className="container"><Link className="experience-back" to="/projects"><ArrowLeft size={16}/> Projects</Link><div className="experience-detail-intro"><div><ProjectStatusBadge status={project.status}/><h1>{project.name}</h1>{project.summary && <p>{project.summary}</p>}
      {!teaser && <div className="experience-tags">{[...(project.compatibility?.minecraft || []), ...(project.compatibility?.loaders || []), ...(project.compatibility?.platforms || [])].map((tag) => <span key={tag}>{tag}</span>)}</div>}
      {primary?.url && !teaser && <a className="experience-button experience-button-primary" href={primary.url} target="_blank" rel="noopener noreferrer">Official {primary.provider} page <ExternalLink size={17}/></a>}
      </div>{teaser && <div className="experience-detail-emblem experience-visual-prototype">{image ? <img src={image.url} alt={image.alt || project.name} width="680" height="440"/> : <Compass size={100} aria-hidden="true"/>}</div>}</div></div></section>
    <div className="container experience-detail-body">
      {teaser ? <section className="experience-content-panel"><h2>In Development</h2><p>A new project is in development. More information will be shared when it is ready.</p></section> : <>
        {project.description && <section className="experience-content-panel"><h2>Overview</h2><RichMarkdown markdown={project.description}/></section>}
        {project.features?.length ? <section className="experience-section"><SectionTitle title="Features"/><div className="experience-grid experience-grid-resources">{project.features.map((feature) => <article className="experience-card experience-resource" key={feature.title}><Leaf size={23}/><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</article>)}</div></section> : null}
        {releases.length > 0 && <section className="experience-section"><SectionTitle title="Official releases"/><div className="experience-grid experience-grid-resources">{releases.map((release) => <article className="experience-card experience-release" key={release.slug}><span className="experience-kicker">{release.channel}</span><h3>{release.name}</h3><p className="experience-meta">v{release.version}</p>{release.changelog && <RichMarkdown markdown={release.changelog}/>}<div className="experience-card-actions">{release.distribution?.filter((provider) => provider.state === 'active' && provider.url).map((provider) => <a key={provider.provider} className="experience-button experience-button-primary" href={provider.url} target="_blank" rel="noopener noreferrer">Official {provider.provider} release <ExternalLink size={16}/></a>)}</div></article>)}</div></section>}
        {project.installation && <section className="experience-content-panel"><h2>Installation</h2><RichMarkdown markdown={project.installation}/></section>}
      </>}
      <Link className="experience-back" to="/projects"><ArrowLeft size={16}/> All projects</Link>
    </div>
  </SiteLayout>;
}

export function LaunchersExperience() {
  const [query, setQuery] = useState('');
  const launchers = publicLaunchers().filter((entry) => entry.source === 'v2');
  const filtered = launchers.filter((entry) => (entry.item.name + ' ' + (entry.item.summary || '')).toLowerCase().includes(query.trim().toLowerCase()));
  return <SiteLayout><Seo title="Launchers — AlahPanda Labs" description="Explore launchers with reviewed official links."/>
    <PageHero title="Launchers" eyebrow="Starting points" description="Different ways to launch Minecraft. Explore verified official destinations and available details."/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title="Browse launchers" icon={Box}/><SearchField id="launcher-search" value={query} onChange={setQuery} placeholder="Search launchers"/></div>
      {filtered.length ? <div className="experience-grid experience-grid-launchers">{filtered.map((entry) => <LauncherCard key={entry.slug} item={entry.item}/>)}</div> : <EmptyCollection title="No matching launchers" description="Try another search term."/>}
    </section></SiteLayout>;
}

export function LauncherDetailExperience() {
  const { slug } = useParams();
  const entry = slug ? publicLauncher(slug) : undefined;
  if (!entry) return <MissingExperience title="Launcher not found" to="/launchers"/>;
  if (entry.source === 'legacy') return <SiteLayout><Seo title={entry.item.name + ' — AlahPanda Labs'} description="This launcher is awaiting editorial review."/><PageHero eyebrow="Launcher" title={entry.item.name} description="This entry is awaiting editorial review. Details and download links are unavailable until verified."/><section className="container experience-section"><EmptyCollection title="Editorial review pending" description="We are checking this launcher's information before presenting it here." to="/launchers" link="Browse reviewed launchers"/></section></SiteLayout>;
  const item = entry.item;
  return <SiteLayout><Seo title={(item.seo?.title || item.name) + ' — AlahPanda Labs'} description={item.seo?.description || item.summary || item.name}/>
    <PageHero eyebrow="Launcher" title={item.name} description={item.summary}><Link className="experience-button experience-button-soft" to="/launchers"><ArrowLeft size={17}/> All launchers</Link></PageHero>
    <div className="container experience-detail-body experience-detail-columns"><article className="experience-content-panel"><h2>About {item.name}</h2>{item.description ? <RichMarkdown markdown={item.description}/> : <p>Further details have not been published yet.</p>}
      {item.features?.length ? <div className="experience-section">{item.features.map((feature) => <div key={feature.title} className="experience-feature"><Leaf size={20}/><div><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</div></div>)}</div> : null}
      {item.installation && <section className="experience-section"><h2>Installation</h2><RichMarkdown markdown={item.installation}/></section>}</article>
      <aside className="experience-content-panel"><h2>Official links</h2>{item.officialLinks?.map((link) => <a key={link.url} className="experience-button experience-button-primary" href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={17}/></a>)}
        {item.platforms.length > 0 && <div className="experience-section"><h3>Platforms</h3><p>{item.platforms.join(' · ')}</p></div>}
      </aside></div>
  </SiteLayout>;
}

export function NewsExperience() {
  const [query, setQuery] = useState('');
  const articles = approvedArticles();
  const filtered = articles.filter((item) => (item.name + ' ' + (item.summary || '') + ' ' + (item.category || '')).toLowerCase().includes(query.trim().toLowerCase()));
  return <SiteLayout><Seo title="News — AlahPanda Labs" description="Published news and articles from AlahPanda Labs."/>
    <PageHero landscape scene="news" title="News" eyebrow="Stories" description="Updates and stories from AlahPanda Labs, once published and reviewed."/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title="Latest articles" icon={Newspaper}/><SearchField id="news-search" value={query} onChange={setQuery} placeholder="Search articles"/></div>
      {filtered.length ? <div className="experience-grid experience-grid-news">{filtered.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div> : <EmptyCollection title={query ? 'No matching articles' : 'No articles published yet'} description={query ? 'Try another search term.' : 'Published stories will appear here after editorial review.'}/>}
    </section></SiteLayout>;
}

export function ArticleExperience() {
  const { slug } = useParams();
  const entry = slug ? publicArticles().find((article) => article.slug === slug) : undefined;
  if (!entry) return <MissingExperience title="Article not found" to="/news"/>;
  if (entry.source === 'legacy') return <SiteLayout><Seo title="Article under review — AlahPanda Labs" description="This article is awaiting editorial review."/><PageHero eyebrow="News" title="Article under review" description="This article is temporarily unavailable while we verify its content and provenance."/><section className="container experience-section"><EmptyCollection title="Editorial review pending" description="Explore other published content while this article is reviewed." to="/news" link="All news"/></section></SiteLayout>;
  const article: ArticleV2 = entry.item;
  const image = article.media?.find((media) => media.kind === 'image');
  return <SiteLayout><Seo title={(article.seo?.title || article.name) + ' — AlahPanda Labs'} description={article.seo?.description || article.summary || article.name} image={article.seo?.image || image?.url} type="article"/>
    <article className="container experience-article-detail"><Link className="experience-back" to="/news"><ArrowLeft size={16}/> News</Link><span className="experience-kicker">{[article.category, article.publishedAt?.slice(0,10)].filter(Boolean).join(' · ') || 'Article'}</span>
      <h1>{article.name}</h1>{article.summary && <p className="experience-lead">{article.summary}</p>}{image && <img className="experience-article-cover" src={image.url} alt={image.alt || ''} width="1000" height="560"/>}
      <div className="experience-content-panel experience-reading"><RichMarkdown markdown={article.body}/></div>{article.author && <p className="experience-meta">By {article.author}</p>}</article>
  </SiteLayout>;
}

export function GuidesExperience() {
  const [query, setQuery] = useState('');
  const guides = publicGuides();
  const filtered = guides.filter((guide) => (guide.name + ' ' + (guide.summary || '')).toLowerCase().includes(query.trim().toLowerCase()));
  return <SiteLayout><Seo title="Guides — AlahPanda Labs" description="Published guides from AlahPanda Labs."/><PageHero title="Guides" eyebrow="Resources" description="Find published guides and learn at your own pace."/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title="Browse guides" icon={BookOpen}/><SearchField id="guide-search" value={query} onChange={setQuery} placeholder="Search guides"/></div>
      {filtered.length ? <div className="experience-grid experience-grid-resources">{filtered.map((guide) => <GuideCard key={guide.slug} guide={guide}/>)}</div> : <EmptyCollection title={query ? 'No matching guides' : 'No guides published yet'} description={query ? 'Try another search term.' : 'Guides will appear here when they are published.'}/>}
    </section></SiteLayout>;
}

export function GuideDetailExperience() {
  const { slug } = useParams();
  const guide = slug ? publicGuide(slug) : undefined;
  if (!guide) return <MissingExperience title="Guide not found" to="/guides"/>;
  return <SiteLayout><Seo title={(guide.seo?.title || guide.name) + ' — AlahPanda Labs'} description={guide.seo?.description || guide.summary || guide.name} type="article"/>
    <article className="container experience-article-detail"><Link className="experience-back" to="/guides"><ArrowLeft size={16}/> Guides</Link><span className="experience-kicker"><BookOpen size={17}/> Guide</span><h1>{guide.name}</h1>{guide.summary && <p className="experience-lead">{guide.summary}</p>}
      <div className="experience-content-panel experience-reading"><RichMarkdown markdown={guide.body || ''}/>{guide.steps?.map((step) => <section key={step.title} className="experience-section"><h2>{step.title}</h2><RichMarkdown markdown={step.body}/></section>)}</div></article>
  </SiteLayout>;
}

export function FaqExperience() {
  // The legacy FAQ awaits editorial review; never present its technical claims as verified.
  const faq = publicFaq().filter((entry) => entry.source === 'v2');
  return <SiteLayout><Seo title="FAQ — AlahPanda Labs" description="Questions and answers from AlahPanda Labs."/><PageHero title="FAQ" eyebrow="Help" description="Answers to published questions will appear here."/>
    <section className="container experience-section">{faq.length ? faq.map((entry) => entry.source === 'v2' && <div className="experience-faq-group" key={entry.slug}><SectionTitle title={entry.item.name}/>{entry.item.items.map((item) => <details key={item.question} className="experience-faq-item"><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>) : <EmptyCollection title="No answers published yet" description="This section is waiting for editorial review." to="/about" link="Contact and community"/>}</section>
  </SiteLayout>;
}

export function AboutExperience() {
  return <SiteLayout><Seo title="About — AlahPanda Labs" description={publicSettings()?.description || site.description}/>
    <PageHero title="About AlahPanda Labs" eyebrow="Our place" description={publicSettings()?.description || site.description}/>
    <div className="container experience-detail-body"><section className="experience-content-panel experience-reading"><h2>Projects and experiences</h2><p>{site.tagline}</p><p>Explore the projects available here, find official launcher links and follow published updates.</p><div className="experience-card-actions"><Link to="/projects" className="experience-button experience-button-primary">Explore projects <ArrowRight size={16}/></Link><a className="experience-button experience-button-soft" href={site.discordUrl} target="_blank" rel="noopener noreferrer">Community <ExternalLink size={16}/></a></div></section></div>
  </SiteLayout>;
}

export function SupportExperience() {
  return <SiteLayout><Seo title="Support — AlahPanda Labs" description="Official ways to support AlahPanda Labs."/><PageHero title="Support" eyebrow="Community" description="Find the official AlahPanda Labs community and support links."/>
    <div className="container experience-detail-body experience-grid experience-grid-resources"><a className="experience-card experience-resource" href={site.discordUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={28}/><h2>Discord</h2><p>Join the community.</p><span className="experience-text-link">Visit Discord <ExternalLink size={16}/></span></a>
      {site.ads.showSupportButton && <a className="experience-card experience-resource" href={site.supportUrl} target="_blank" rel="noopener noreferrer"><Heart size={28}/><h2>Ko-fi</h2><p>Visit the official support page.</p><span className="experience-text-link">Visit Ko-fi <ExternalLink size={16}/></span></a>}</div>
  </SiteLayout>;
}

export function MissingExperience({ title = 'Page not found', to = '/' }: { title?: string; to?: string }) {
  return <SiteLayout><Seo title={title + ' — AlahPanda Labs'}/><div className="container experience-missing"><Compass size={54} aria-hidden="true"/><span className="experience-kicker">404 · A different path</span><h1>{title}</h1><p>There is nothing published at this address.</p><Link to={to} className="experience-button experience-button-primary"><ArrowLeft size={16}/> {to === '/' ? 'Back home' : 'Back to collection'}</Link></div></SiteLayout>;
}
