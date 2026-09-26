import { useState } from 'react';
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
import { MacNativeProduct } from '@/components/experience/MacNativeProduct';

const cardGrid = 'experience-grid experience-grid-projects';
const approvedArticles = (): ArticleV2[] => publicArticles().flatMap((entry) => entry.source === 'v2' ? [entry.item] : []);

function ProjectRelation({ slug }: { slug?: string }) {
  const project = slug ? publicProject(slug) : undefined;
  return project?.source === 'v2' ? <Link className="experience-text-link" to={'/modpacks/' + project.slug}>{project.item.name} <ArrowRight size={16}/></Link> : null;
}

export function HomeExperience() {
  const { t } = useI18n();
  const config = publicHomepage();
  const featured = publicFeaturedProjects().filter((entry) => entry.source === 'v2');
  const lead = featured.find((entry) => entry.slug === (config?.hero?.primaryProjectSlug || 'mac-native') && entry.item.status !== 'internal-prototype');
  const others = featured.filter((entry) => entry.slug !== lead?.slug);
  const articles = approvedArticles().slice(0, 3);
  const guides = publicGuides().slice(0, 2);
  return <SiteLayout>
    <Seo title="AlahPanda Labs" description={publicSettings()?.description || config?.hero?.subtitle || t('home.heroSub')}/>
    {/* Candidate brand line only; CMS hero copy always takes precedence. */}
    <PageHero landscape eyebrow={config?.hero?.eyebrow || t('home.eyebrow')} title={config?.hero?.title || 'AlahPanda Labs'} description={config?.hero?.subtitle || "You've seen this world before. Just not like this."}>
      <Link className="experience-button experience-button-primary" to="/projects">{t('home.cta.explore')} <ArrowRight size={18}/></Link>
      <Link className="experience-button experience-button-soft" to="/about">{t('nav.about')} <ArrowRight size={18}/></Link>
    </PageHero>
    {config?.notices?.filter((notice) => notice.visible).map((notice) => <div key={notice.id} className="container experience-notice">{notice.link ? <a href={notice.link} target="_blank" rel="noopener noreferrer">{notice.text}</a> : notice.text}</div>)}
    <div className="container experience-home-body">
      <nav className="experience-quick-nav" aria-label="Explore the site">{destinations.map(({path,label,Icon}) => <Link key={path} to={path}><span className="experience-quick-icon"><Icon size={23} aria-hidden="true"/></span><span>{t('nav.' + label.toLowerCase())}</span><ArrowRight size={15} aria-hidden="true"/></Link>)}
        <a href={site.discordUrl} target="_blank" rel="noopener noreferrer"><span className="experience-quick-icon"><MessageCircle size={23}/></span><span>{t('ui.community')}</span><ExternalLink size={15}/></a>
      </nav>
      {config?.sections?.find((section) => section.id === 'featured-projects')?.visible !== false && <section className="experience-section">
        <SectionTitle title={t('home.journey')} to="/projects" link={t('home.cta.explore')} icon={Compass}/>
        {lead && <div className="experience-home-feature"><div className="experience-home-feature-copy"><span className="experience-kicker">{t('home.featuredMac')}</span><p>{lead.item.summary}</p><div className="experience-card-actions"><Link to={'/modpacks/' + lead.slug} className="experience-button experience-button-primary">{t('ui.explore')} <ArrowRight size={17}/></Link>{publicReleasesFor(lead.item)[0]?.distribution?.filter((provider) => provider.state === 'active' && provider.url).slice(0,1).map((provider) => <a key={provider.provider} href={provider.url} className="experience-button experience-button-soft" target="_blank" rel="noopener noreferrer">{t('modpack.download')} · {provider.provider} <ExternalLink size={16}/></a>)}</div></div><ProjectCard entry={lead}/></div>}
        {others.length > 0 && <div className="experience-home-other"><h2>{t('home.more')}</h2><div className={cardGrid}>{others.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div></div>}
      </section>}
      <section className="experience-section"><SectionTitle title={t('home.paths')} icon={Compass}/><div className="experience-grid experience-grid-resources">
        <Link className="experience-card experience-resource" to="/projects"><Compass size={30}/><h3>{t('nav.projects')}</h3><p>{t('home.heroSub')}</p><span className="experience-text-link">{t('home.cta.explore')} <ArrowRight size={16}/></span></Link>
        <Link className="experience-card experience-resource" to="/launchers"><Box size={30}/><h3>{t('nav.launchers')}</h3><p>{t('home.launchersExplain')}</p><span className="experience-text-link">{t('mac.launchers')} <ArrowRight size={16}/></span></Link>
        <Link className="experience-card experience-resource" to="/guides"><BookOpen size={30}/><h3>{t('nav.guides')}</h3><p>{t('home.guidesEmpty')}</p><span className="experience-text-link">{t('nav.guides')} <ArrowRight size={16}/></span></Link>
        <Link className="experience-card experience-resource" to="/news"><Newspaper size={30}/><h3>{t('nav.news')}</h3><p>{t('home.newsExplain')}</p><span className="experience-text-link">{t('nav.news')} <ArrowRight size={16}/></span></Link>
      </div></section>
      {config?.sections?.find((section) => section.id === 'latest-news')?.visible !== false && <section className="experience-section"><SectionTitle title={t('home.latest')} to="/news" icon={Newspaper}/>{articles.length ? <div className="experience-grid experience-grid-news">{articles.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div> : <EmptyCollection title={t('home.articlesEmpty')} description={t('home.articlesExplain')} to="/news" link={t('nav.news')}/>}</section>}
      {guides.length > 0 && <section className="experience-section"><SectionTitle title={t('home.resources')} to="/guides" icon={BookOpen}/><div className="experience-grid experience-grid-resources">{guides.map((guide) => <GuideCard key={guide.slug} guide={guide}/>)}</div></section>}
      <section className="experience-section experience-community"><div><span className="experience-kicker"><Leaf size={17}/> AlahPanda Labs</span><h2>{t('footer.tagline')}</h2><div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/support">{t('nav.support')} <ArrowRight size={17}/></Link><a className="experience-button experience-button-primary" href={site.discordUrl} target="_blank" rel="noopener noreferrer">{t('nav.discord')} <ExternalLink size={17}/></a></div></div><Compass size={118} aria-hidden="true"/></section>
    </div>
  </SiteLayout>;
}

export function ProjectsExperience({ modpacks = false }: { modpacks?: boolean }) {
  const { t } = useI18n();
  const entries = publicProjects().filter((entry) => entry.source === 'v2');
  const title = modpacks ? t('nav.modpacks') : t('nav.projects');
  return <SiteLayout><Seo title={title + ' — AlahPanda Labs'} description="Explore projects created by AlahPanda."/>
    <PageHero landscape scene="projects" title={title} eyebrow={t('ui.exploreSection')} description={t('ui.projectIntro')}/>
    <section className="container experience-section experience-catalog"><SectionTitle title={t('home.journey')} icon={Compass}/>
      {entries.length ? <div className={cardGrid}>{entries.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div> : <EmptyCollection title={t('project.noMatch')} description={t('home.articlesExplain')}/>}
      <div className="experience-card-actions experience-next-links"><Link to="/launchers" className="experience-button experience-button-soft">{t('nav.launchers')} <ArrowRight size={16}/></Link><Link to="/support" className="experience-button experience-button-soft">{t('nav.support')} <ArrowRight size={16}/></Link></div>
    </section>
  </SiteLayout>;
}

export function ProjectDetailExperience() {
  const { t } = useI18n();
  const { slug } = useParams();
  const entry = slug ? publicProject(slug) : undefined;
  if (!entry || entry.source !== 'v2') return <MissingExperience title="Project not found" to="/projects"/>;
  const project: ProjectV2 = entry.item;
  const teaser = project.status === 'internal-prototype';
  const releases = teaser ? [] : publicReleasesFor(project);
  if (project.slug === 'mac-native' && !teaser) return <MacNativeProduct project={project} releases={releases}/>;
  const image = project.media?.find((medium) => medium.kind === 'image');
  const primary = project.distribution?.find((provider) => provider.state === 'active' && provider.priority === 'primary' && provider.url);
  return <SiteLayout><Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || image?.url} noindex={project.seo?.noindex}/>
    <section className="experience-detail-hero"><div className="container"><Link className="experience-back" to="/projects"><ArrowLeft size={16}/> {t('nav.projects')}</Link><div className="experience-detail-intro"><div><ProjectStatusBadge status={project.status}/><h1>{project.name}</h1>{project.summary && <p>{project.summary}</p>}
      {!teaser && <div className="experience-tags">{[...(project.compatibility?.minecraft || []), ...(project.compatibility?.loaders || []), ...(project.compatibility?.platforms || [])].map((tag) => <span key={tag}>{tag}</span>)}</div>}
      {primary?.url && !teaser && <a className="experience-button experience-button-primary" href={primary.url} target="_blank" rel="noopener noreferrer">Official {primary.provider} page <ExternalLink size={17}/></a>}
      </div>{(teaser || image) && <div className={'experience-detail-emblem ' + (teaser ? 'experience-visual-prototype' : 'experience-card-visual-project')}>{image ? <img src={image.url} alt={image.alt || ''} width="680" height="440"/> : <Compass size={100} aria-hidden="true"/>}</div>}</div></div></section>
    <div className="container experience-detail-body">
      {teaser ? <section className="experience-content-panel experience-teaser-story"><h2>{t('project.inDevelopment')}</h2>{project.description ? <RichMarkdown markdown={project.description}/> : <p>{t('project.teaser')}</p>}<div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/projects">{t('project.all')} <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/news">{t('nav.news')} <ArrowRight size={16}/></Link></div></section> : <>
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
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const launchers = publicLaunchers();
  const filtered = launchers.filter((entry) => (entry.item.name + ' ' + (entry.source === 'v2' ? entry.item.summary || '' : '')).toLowerCase().includes(query.trim().toLowerCase()));
  return <SiteLayout><Seo title="Launchers — AlahPanda Labs" description="Explore launchers with reviewed official links."/>
    <PageHero title="Launchers" tone="launchers" icon={Compass} eyebrow="Starting points" description={t('ui.launcherIntro')}/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={t('ui.browseLaunchers')} icon={Box}/><SearchField id="launcher-search" value={query} onChange={setQuery} placeholder={t('ui.searchLaunchers')}/></div>
      {filtered.length ? <div className="experience-grid experience-grid-launchers">{filtered.map((entry) => <LauncherCard key={entry.slug} entry={entry}/>)}</div> : <EmptyCollection title={t('ui.noLaunchers')} description={t('ui.tryAgain')}/>}
    </section><div className="container experience-card-actions experience-next-links"><Link to="/modpacks/mac-native#installation" className="experience-button experience-button-soft">Mac Native · {t('project.installation')} <ArrowRight size={16}/></Link><Link to="/support" className="experience-button experience-button-soft">{t('nav.support')} <ArrowRight size={16}/></Link></div></SiteLayout>;
}

export function LauncherDetailExperience() {
  const { t } = useI18n();
  const { slug } = useParams();
  const entry = slug ? publicLauncher(slug) : undefined;
  if (!entry) return <MissingExperience title="Launcher not found" to="/launchers"/>;
  if (entry.source === 'legacy') return <SiteLayout><Seo title={entry.item.name + ' — AlahPanda Labs'} description="This launcher is awaiting editorial review."/><PageHero eyebrow="Launcher" title={entry.item.name} description={t('ui.noReview')}/><section className="container experience-section"><EmptyCollection title={t('ui.reviewPending')} description="We are checking this launcher's information before presenting it here." to="/launchers" link="Browse reviewed launchers"/></section></SiteLayout>;
  const item = entry.item;
  return <SiteLayout><Seo title={(item.seo?.title || item.name) + ' — AlahPanda Labs'} description={item.seo?.description || item.summary || item.name} image={item.seo?.image || item.media?.find((media) => media.kind === 'image')?.url} noindex={item.seo?.noindex}/>
    <PageHero eyebrow="Launcher" title={item.name} description={item.summary}><Link className="experience-button experience-button-soft" to="/launchers"><ArrowLeft size={17}/>{t('ui.allLaunchers')}</Link></PageHero>
    <div className="container experience-detail-body experience-detail-columns"><article className="experience-content-panel"><h2>{t('ui.about')} {item.name}</h2>{item.description ? <RichMarkdown markdown={item.description}/> : <p>{t('ui.further')}</p>}
      {item.features?.length ? <div className="experience-section">{item.features.map((feature) => <div key={feature.title} className="experience-feature"><Leaf size={20}/><div><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</div></div>)}</div> : null}
      {item.installation && <section className="experience-section"><h2>Installation</h2><RichMarkdown markdown={item.installation}/></section>}</article>
      <aside className="experience-content-panel"><h2>{t('ui.officialLinks')}</h2>{item.officialLinks?.map((link) => <a key={link.url} className="experience-button experience-button-primary" href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={17}/></a>)}
        {item.platforms.length > 0 && <div className="experience-section"><h3>{t('ui.platforms')}</h3><p>{item.platforms.join(' · ')}</p></div>}
      </aside></div><div className="container experience-card-actions experience-next-links"><Link to="/modpacks/mac-native" className="experience-button experience-button-soft">Mac Native <ArrowRight size={16}/></Link><Link to="/support" className="experience-button experience-button-soft">{t('nav.support')} <ArrowRight size={16}/></Link></div>
  </SiteLayout>;
}

export function NewsExperience() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const articles = approvedArticles();
  const filtered = articles.filter((item) => (item.name + ' ' + (item.summary || '') + ' ' + (item.category || '')).toLowerCase().includes(query.trim().toLowerCase()));
  return <SiteLayout><Seo title="News — AlahPanda Labs" description="Published news and articles from AlahPanda Labs."/>
    <PageHero landscape scene="news" title="News" eyebrow="Stories" description={t('ui.newsIntro')}/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={t('ui.latestArticles')} icon={Newspaper}/><SearchField id="news-search" value={query} onChange={setQuery} placeholder={t('ui.searchArticles')}/></div>
      {filtered.length ? <div className="experience-grid experience-grid-news">{filtered.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div> : <EmptyCollection title={query ? t('ui.noArticles') : t('ui.noArticle')} description={query ? t('ui.tryAgain') : t('ui.newsEmpty')}/>}
    </section></SiteLayout>;
}

export function ArticleExperience() {
  const { t } = useI18n();
  const { slug } = useParams();
  const entry = slug ? publicArticles().find((article) => article.slug === slug) : undefined;
  if (!entry) return <MissingExperience title="Article not found" to="/news"/>;
  if (entry.source === 'legacy') return <SiteLayout><Seo title="Article under review — AlahPanda Labs" description="This article is awaiting editorial review."/><PageHero eyebrow="News" title={t('ui.articleUnderReview')} description={t('ui.articleReview')}/><section className="container experience-section"><EmptyCollection title={t('ui.reviewPending')} description="Explore other published content while this article is reviewed." to="/news" link="All news"/></section></SiteLayout>;
  const article: ArticleV2 = entry.item;
  const image = article.media?.find((media) => media.kind === 'image');
  const related = approvedArticles().filter((item) => item.slug !== article.slug && item.projectSlug && item.projectSlug === article.projectSlug).slice(0, 3);
  return <SiteLayout><Seo title={(article.seo?.title || article.name) + ' — AlahPanda Labs'} description={article.seo?.description || article.summary || article.name} image={article.seo?.image || image?.url} noindex={article.seo?.noindex} type="article"/>
    <article className="container experience-article-detail"><Link className="experience-back" to="/news"><ArrowLeft size={16}/> News</Link><span className="experience-kicker">{[article.category, article.publishedAt?.slice(0,10)].filter(Boolean).join(' · ') || 'Article'}</span>
      <h1>{article.name}</h1>{article.summary && <p className="experience-lead">{article.summary}</p>}{image && <img className="experience-article-cover" src={image.url} alt={image.alt || ''} width="1000" height="560"/>}
      <div className="experience-content-panel experience-reading"><RichMarkdown markdown={article.body}/></div>{article.author && <p className="experience-meta">By {article.author}</p>}<div className="experience-card-actions experience-next-links"><ProjectRelation slug={article.projectSlug}/><Link to="/news" className="experience-text-link">{t('ui.allNews')} <ArrowRight size={16}/></Link></div>{related.length > 0 && <section className="experience-section"><SectionTitle title={t('ui.relatedArticles')}/><div className="experience-grid experience-grid-news">{related.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div></section>}</article>
  </SiteLayout>;
}

export function GuidesExperience() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const guides = publicGuides();
  const filtered = guides.filter((guide) => (guide.name + ' ' + (guide.summary || '')).toLowerCase().includes(query.trim().toLowerCase()));
  return <SiteLayout><Seo title="Guides — AlahPanda Labs" description="Published guides from AlahPanda Labs."/><PageHero title="Guides" tone="guides" icon={BookOpen} eyebrow="Resources" description={t('ui.guidesIntro')}/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={t('ui.browseGuides')} icon={BookOpen}/><SearchField id="guide-search" value={query} onChange={setQuery} placeholder={t('ui.searchGuides')}/></div>
      {filtered.length ? <div className="experience-grid experience-grid-resources">{filtered.map((guide) => <GuideCard key={guide.slug} guide={guide}/>)}</div> : <EmptyCollection title={query ? t('ui.noGuides') : t('ui.noGuide')} description={query ? t('ui.tryAgain') : t('ui.guideEmpty')}/>}
    </section></SiteLayout>;
}

export function GuideDetailExperience() {
  const { t } = useI18n();
  const { slug } = useParams();
  const guide = slug ? publicGuide(slug) : undefined;
  if (!guide) return <MissingExperience title="Guide not found" to="/guides"/>;
  const related = publicGuides().filter((item) => item.slug !== guide.slug && item.projectSlug && item.projectSlug === guide.projectSlug).slice(0, 3);
  const image = guide.media?.find((media) => media.kind === 'image');
  return <SiteLayout><Seo title={(guide.seo?.title || guide.name) + ' — AlahPanda Labs'} description={guide.seo?.description || guide.summary || guide.name} image={guide.seo?.image || image?.url} noindex={guide.seo?.noindex} type="article"/>
    <article className="container experience-article-detail"><Link className="experience-back" to="/guides"><ArrowLeft size={16}/> Guides</Link><span className="experience-kicker"><BookOpen size={17}/> Guide{guide.level && ` · ${guide.level}`}{guide.updatedAt && ` · ${guide.updatedAt.slice(0,10)}`}</span><h1>{guide.name}</h1>{guide.summary && <p className="experience-lead">{guide.summary}</p>}{image && <img className="experience-article-cover" src={image.url} alt={image.alt || ''} loading="lazy"/>}
      <div className="experience-content-panel experience-reading"><RichMarkdown markdown={guide.body || ''}/>{guide.steps?.map((step) => <section key={step.title} className="experience-section"><h2>{step.title}</h2><RichMarkdown markdown={step.body}/></section>)}</div><div className="experience-card-actions experience-next-links"><ProjectRelation slug={guide.projectSlug}/>{guide.launcherSlug && publicLauncher(guide.launcherSlug)?.source === 'v2' && <Link to={'/launchers/' + guide.launcherSlug} className="experience-text-link">{t('nav.launchers')} <ArrowRight size={16}/></Link>}<Link to="/support" className="experience-text-link">{t('nav.support')} <ArrowRight size={16}/></Link></div>{related.length > 0 && <section className="experience-section"><SectionTitle title={t('ui.relatedGuides')}/><div className="experience-grid experience-grid-resources">{related.map((item) => <GuideCard key={item.slug} guide={item}/>)}</div></section>}</article>
  </SiteLayout>;
}

export function FaqExperience() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  // The legacy FAQ awaits editorial review; only published V2 groups enter search.
  const faq = publicFaq().flatMap((entry) => entry.source === 'v2' ? [entry.item] : []);
  const groups = faq.map((group) => ({ group, items: group.items.filter((item) => (item.question + ' ' + item.answer).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) })).filter(({ items }) => items.length);
  return <SiteLayout><Seo title="FAQ — AlahPanda Labs" description="Questions and answers from AlahPanda Labs."/><PageHero title="FAQ" tone="quiet" icon={MessageCircle} eyebrow="Help" description="Answers to published questions will appear here."/>
    <section className="container experience-section">
      {faq.length > 0 && <SearchField id="faq-search" value={query} onChange={setQuery} placeholder={t('ui.searchFaq')}/>}
      {groups.length ? groups.map(({group,items}) => <div className="experience-faq-group" key={group.slug}><SectionTitle title={group.name}/><ProjectRelation slug={group.projectSlug}/>{items.map((item) => <details id={`faq-${group.slug}-${item.id || group.items.indexOf(item) + 1}`} key={item.id || item.question} className="experience-faq-item"><summary>{item.question}</summary><div className="experience-faq-answer"><RichMarkdown markdown={item.answer}/></div></details>)}</div>) : <EmptyCollection title={faq.length ? t('ui.noMatch') : t('faq.empty')} description={faq.length ? t('ui.tryAgain') : t('faq.pending')} to="/support" link={t('nav.support')}/>}
      <div className="experience-card-actions experience-next-links"><Link to="/modpacks/mac-native#questions" className="experience-text-link">Mac Native FAQ <ArrowRight size={16}/></Link><Link to="/support" className="experience-text-link">{t('nav.support')} <ArrowRight size={16}/></Link></div>
    </section>
  </SiteLayout>;
}

export function AboutExperience() {
  const { t } = useI18n();
  const projects = publicProjects().filter((entry) => entry.source === 'v2');
  return <SiteLayout><Seo title="About — AlahPanda Labs" description={publicSettings()?.description || site.description}/>
    <PageHero title="About AlahPanda Labs" tone="about" icon={Heart} eyebrow="Our place" description={publicSettings()?.description || site.description}/>
    <div className="container experience-detail-body"><section className="experience-content-panel experience-reading"><h2>{t('home.journey')}</h2><p>{site.tagline}</p><p>{t('ui.projectIntro')}</p></section><section className="experience-section"><SectionTitle title={t('home.featured')} to="/projects"/>{projects.length > 0 && <div className={cardGrid}>{projects.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div>}</section><div className="experience-card-actions experience-next-links"><Link to="/projects" className="experience-button experience-button-primary">{t('home.cta.explore')} <ArrowRight size={16}/></Link><Link to="/support" className="experience-button experience-button-soft">{t('nav.support')} <ArrowRight size={16}/></Link><a className="experience-button experience-button-soft" href={site.discordUrl} target="_blank" rel="noopener noreferrer">{t('ui.community')} <ExternalLink size={16}/></a></div></div>
  </SiteLayout>;
}

export function SupportExperience() {
  const { t } = useI18n();
  const mac = publicProject('mac-native');
  return <SiteLayout><Seo title="Support — AlahPanda Labs" description="Find installation help, guides, questions and community links for AlahPanda Labs."/><PageHero title="Support" eyebrow="Find your way" description={t('support.help')}/>
    <div className="container experience-detail-body"><section className="experience-grid experience-grid-resources" aria-label={t('support.help')}>
      {mac?.source === 'v2' && mac.item.installation && <Link className="experience-card experience-resource" to="/modpacks/mac-native#installation"><BookOpen size={28}/><h2>{t('support.install')}</h2><p>{t('support.installInfo')}</p><span className="experience-text-link">{t('project.installation')} <ArrowRight size={16}/></span></Link>}
      <Link className="experience-card experience-resource" to="/launchers"><Box size={28}/><h2>{t('nav.launchers')}</h2><p>{t('home.launchersExplain')}</p><span className="experience-text-link">{t('mac.launchers')} <ArrowRight size={16}/></span></Link>
      <Link className="experience-card experience-resource" to="/guides"><BookOpen size={28}/><h2>{t('support.guides')}</h2><p>{t('home.guidesEmpty')}</p><span className="experience-text-link">{t('nav.guides')} <ArrowRight size={16}/></span></Link>
      <Link className="experience-card experience-resource" to="/faq"><MessageCircle size={28}/><h2>FAQ</h2><p>{t('faq.pending')}</p><span className="experience-text-link">FAQ <ArrowRight size={16}/></span></Link>
      {mac?.source === 'v2' && !!mac.item.faq?.length && <Link className="experience-card experience-resource" to="/modpacks/mac-native#questions"><MessageCircle size={28}/><h2>{t('support.question')}</h2><p>{t('support.questionInfo')}</p><span className="experience-text-link">Mac Native FAQ <ArrowRight size={16}/></span></Link>}
      <a className="experience-card experience-resource" href={site.discordUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={28}/><h2>{t('support.community')}</h2><p>{t('home.supportExplain')}</p><span className="experience-text-link">Discord <ExternalLink size={16}/></span></a>
    </section>{site.ads.showSupportButton && <div className="experience-card-actions experience-next-links"><a className="experience-button experience-button-soft" href={site.supportUrl} target="_blank" rel="noopener noreferrer">Ko-fi <ExternalLink size={16}/></a></div>}</div>
  </SiteLayout>;
}

export function MissingExperience({ title, to = '/' }: { title?: string; to?: string }) {
  const { t } = useI18n();
  title ??= t('ui.notFound');
  return <SiteLayout><Seo title={title + ' — AlahPanda Labs'}/><div className="container experience-missing"><Compass size={54} aria-hidden="true"/><span className="experience-kicker">404 · A different path</span><h1>{title}</h1><p>{t('ui.noPublished')}</p><Link to={to} className="experience-button experience-button-primary"><ArrowLeft size={16}/> {to === '/' ? t('ui.backHome') : t('ui.backCollection')}</Link></div></SiteLayout>;
}
