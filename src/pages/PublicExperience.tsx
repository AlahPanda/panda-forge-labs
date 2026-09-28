import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Box, Compass, ExternalLink, Heart, Leaf, MessageCircle, Newspaper, Download, Users, Map, Laptop } from 'lucide-react';
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
import { localizeItem } from '@/content/v2/localize';
import { useModrinthStats } from '@/lib/modrinthStats';

const cardGrid = 'experience-grid experience-grid-projects';
const approvedArticles = (): ArticleV2[] => publicArticles().flatMap((entry) => entry.source === 'v2' ? [entry.item] : []);

function ProjectRelation({ slug }: { slug?: string }) {
  const project = slug ? publicProject(slug) : undefined;
  const { locale } = useI18n();
  return project?.source === 'v2' ? <Link className="experience-text-link" to={'/modpacks/' + project.slug}>{localizeItem(project.item, locale).name} <ArrowRight size={16}/></Link> : null;
}

export function HomeExperience() {
  const { t, locale } = useI18n();
  const config = publicHomepage();
  const settings = publicSettings();
  const featured = publicFeaturedProjects().filter((entry) => entry.source === 'v2');
  const lead = featured.find((entry) => entry.slug === (config?.hero?.primaryProjectSlug || 'mac-native') && entry.item.status !== 'internal-prototype');
  const others = featured.filter((entry) => entry.slug !== lead?.slug);
  const articles = approvedArticles().slice(0, 3);
  const guides = publicGuides().slice(0, 2);
  const mac = publicProject('mac-native');
  const macUrl = mac?.source === 'v2' ? mac.item.distribution?.find((provider) => provider.provider === 'modrinth' && provider.state === 'active')?.url : undefined;
  const { data: stats } = useModrinthStats(macUrl);
  return <SiteLayout>
    <Seo title="AlahPanda Labs" description={(settings && localizeItem(settings, locale).description) || config?.hero?.subtitle || t('home.heroSub')}/>
    {/* Candidate brand line only; CMS hero copy always takes precedence. */}
    <PageHero landscape eyebrow={config?.hero?.eyebrow || t('home.eyebrow')} title={config?.hero?.title || 'AlahPanda Labs'} description={config?.hero?.subtitle || t('home.heroSub')}>
      <Link className="experience-button experience-button-primary" to="/modpacks">{t('home.cta.explore')} <ArrowRight size={18}/></Link>
      <Link className="experience-button experience-button-soft" to="/about">{t('nav.about')} <ArrowRight size={18}/></Link>
    </PageHero>
    {config?.notices?.filter((notice) => notice.visible).map((notice) => <div key={notice.id} className="container experience-notice">{notice.link ? <a href={notice.link} target="_blank" rel="noopener noreferrer">{notice.text}</a> : notice.text}</div>)}
    <div className="container experience-home-body">
      <nav className="experience-quick-nav" aria-label={t('ui.siteExplore')}>{destinations.map(({path,label,Icon}) => <Link key={path} to={path}><span className="experience-quick-icon"><Icon size={23} aria-hidden="true"/></span><span>{t('nav.' + label.toLowerCase())}</span><ArrowRight size={15} aria-hidden="true"/></Link>)}
        <a href={site.discordUrl} target="_blank" rel="noopener noreferrer"><span className="experience-quick-icon"><MessageCircle size={23}/></span><span>{t('ui.community')}</span><ExternalLink size={15}/></a>
      </nav>
      {config?.sections?.find((section) => section.id === 'featured-projects')?.visible !== false && <section className="experience-section">
        <SectionTitle title={t('home.journey')} to="/modpacks" link={t('home.cta.explore')} icon={Compass}/>
        {lead && <div className="experience-home-feature"><div className="experience-home-feature-copy"><span className="experience-kicker">{t('home.featuredMac')}</span><p>{localizeItem(lead.item, locale).summary}</p><div className="experience-card-actions"><Link to={'/modpacks/' + lead.slug} className="experience-button experience-button-primary">{t('ui.explore')} <ArrowRight size={17}/></Link>{publicReleasesFor(lead.item)[0]?.distribution?.filter((provider) => provider.state === 'active' && provider.url).slice(0,1).map((provider) => <a key={provider.provider} href={provider.url} className="experience-button experience-button-soft" target="_blank" rel="noopener noreferrer">{t('modpack.download')} · {provider.provider} <ExternalLink size={16}/></a>)}</div></div><ProjectCard entry={lead}/></div>}
        {others.length > 0 && <div className="experience-home-other"><h2>{t('home.more')}</h2><div className={cardGrid}>{others.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div></div>}
      </section>}
      <section className="experience-section experience-paths"><SectionTitle title={t('home.paths')} icon={Compass}/><div className="experience-grid experience-grid-resources">
        <Link className="experience-card experience-resource" to="/modpacks"><Compass size={30}/><h3>{t('nav.modpacks')}</h3><p>{t('home.heroSub')}</p><span className="experience-text-link">{t('home.cta.explore')} <ArrowRight size={16}/></span></Link>
        <Link className="experience-card experience-resource" to="/launchers"><Box size={30}/><h3>{t('nav.launchers')}</h3><p>{t('home.launchersExplain')}</p><span className="experience-text-link">{t('mac.launchers')} <ArrowRight size={16}/></span></Link>
        <Link className="experience-card experience-resource" to="/guides"><BookOpen size={30}/><h3>{t('nav.guides')}</h3><p>{t('home.guidesEmpty')}</p><span className="experience-text-link">{t('nav.guides')} <ArrowRight size={16}/></span></Link>
        <Link className="experience-card experience-resource" to="/news"><Newspaper size={30}/><h3>{t('nav.news')}</h3><p>{t('home.newsExplain')}</p><span className="experience-text-link">{t('nav.news')} <ArrowRight size={16}/></span></Link>
      </div></section>
      {config?.sections?.find((section) => section.id === 'latest-news')?.visible !== false && <section className="experience-section"><SectionTitle title={t('home.latest')} to="/news" icon={Newspaper}/><div className="experience-editorial-row">{articles.length ? <div className="experience-grid experience-grid-news">{articles.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div> : <div className="experience-card experience-editorial-wait"><Newspaper size={30}/><div><h3>{t('home.articlesEmpty')}</h3><p>{t('home.articlesExplain')}</p></div><Link className="experience-text-link" to="/news">{t('nav.news')} <ArrowRight size={16}/></Link></div>}<aside className="experience-editorial-aside"><h3>{t('ui.exploreSection')}</h3><Link to="/modpacks/mac-native">Mac Native <ArrowRight size={16}/></Link><Link to="/launchers">{t('nav.launchers')} <ArrowRight size={16}/></Link><Link to="/guides">{t('nav.guides')} <ArrowRight size={16}/></Link></aside></div></section>}
      {guides.length > 0 && <section className="experience-section"><SectionTitle title={t('home.resources')} to="/guides" icon={BookOpen}/><div className="experience-grid experience-grid-resources">{guides.map((guide) => <GuideCard key={guide.slug} guide={guide}/>)}</div></section>}
      <section className="experience-home-closer" aria-label={t('ui.exploreSection')}><Link to="/guides"><BookOpen size={26}/><strong>{t('nav.guides')}</strong><span>{t('home.guidesEmpty')}</span></Link><Link to="/about"><Compass size={26}/><strong>{t('nav.about')}</strong><span>{t('footer.tagline')}</span></Link><Link to="/faq"><MessageCircle size={26}/><strong>FAQ</strong><span>{t('home.faqExplain')}</span></Link>{stats && <a href={macUrl} target="_blank" rel="noopener noreferrer"><Download size={26}/><strong>{new Intl.NumberFormat(locale).format(stats.downloads)}</strong><span>{t('mac.totalDownloads')} · Modrinth</span></a>}</section>
      <section className="experience-section experience-community"><div><span className="experience-kicker"><Leaf size={17}/> AlahPanda Labs</span><h2>{t('footer.tagline')}</h2><div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/support">{t('nav.support')} <ArrowRight size={17}/></Link><a className="experience-button experience-button-primary" href={site.discordUrl} target="_blank" rel="noopener noreferrer">{t('nav.discord')} <ExternalLink size={17}/></a></div></div><Compass size={118} aria-hidden="true"/></section>
    </div>
  </SiteLayout>;
}

export function ProjectsExperience() {
  const { t } = useI18n();
  const entries = publicProjects().filter((entry) => entry.source === 'v2');
  const [filter, setFilter] = useState<'all' | 'available' | 'development'>('all');
  const shown = entries.filter((entry) => filter === 'all' || (filter === 'development' ? entry.item.status === 'internal-prototype' || entry.item.status === 'development' : entry.item.status !== 'internal-prototype' && entry.item.status !== 'development'));
  const mac = entries.find((entry) => entry.slug === 'mac-native');
  const macUrl = mac?.item.distribution?.find((provider) => provider.provider === 'modrinth' && provider.state === 'active')?.url;
  const { data: stats } = useModrinthStats(macUrl);
  const title = t('nav.modpacks');
  return <SiteLayout><Seo title={title + ' — AlahPanda Labs'} description={t('ui.modpacksIntro')}/>
    <PageHero landscape scene="projects" title={title} eyebrow={t('ui.exploreSection')} description={t('ui.modpacksIntro')}><Link className="experience-button experience-button-primary" to="/modpacks/mac-native">Mac Native <ArrowRight size={16}/></Link></PageHero>
    <section className="container experience-section experience-catalog"><SectionTitle title={t('home.journey')} icon={Compass}/>
      <div className="experience-filter-row" role="group" aria-label={t('ui.filterProjects')}>{(['all','available','development'] as const).map((value) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{t('ui.filter.' + value)}</button>)}</div>
      <div className="experience-catalog-columns"><div>{shown.length ? <div className={cardGrid}>{shown.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div> : <EmptyCollection title={t('project.noMatch')} description={t('ui.noModpacks')}/>}</div>
        <aside className="experience-catalog-aside"><h2>{t('ui.onYourWay')}</h2><p>{t('home.launchersExplain')}</p><Link to="/launchers"><Box size={19}/>{t('nav.launchers')} <ArrowRight size={16}/></Link><Link to="/modpacks/mac-native#installation"><BookOpen size={19}/>{t('project.installation')} <ArrowRight size={16}/></Link><Link to="/support"><MessageCircle size={19}/>{t('nav.support')} <ArrowRight size={16}/></Link>{stats && <div className="experience-source-stat"><strong>{new Intl.NumberFormat().format(stats.downloads)}</strong><span>{t('mac.totalDownloads')} · Modrinth</span></div>}</aside>
      </div>
    </section>
  </SiteLayout>;
}

export function ProjectDetailExperience() {
  const { t, locale } = useI18n();
  const { slug } = useParams();
  const entry = slug ? publicProject(slug) : undefined;
  if (!entry || entry.source !== 'v2') return <MissingExperience title={t('ui.modpackNotFound')} to="/modpacks"/>;
  const project: ProjectV2 = localizeItem(entry.item, locale);
  const teaser = project.status === 'internal-prototype';
  const releases = teaser ? [] : publicReleasesFor(project);
  if (project.slug === 'mac-native' && !teaser) return <MacNativeProduct project={project} releases={releases}/>;
  const image = project.media?.find((medium) => medium.kind === 'image');
  const primary = project.distribution?.find((provider) => provider.state === 'active' && provider.priority === 'primary' && provider.url);
  return <SiteLayout><Seo title={(project.seo?.title || project.name) + ' — AlahPanda Labs'} description={project.seo?.description || project.summary || project.name} image={project.seo?.image || image?.url} noindex={project.seo?.noindex}/>
    <section className="experience-detail-hero"><div className="container"><Link className="experience-back" to="/modpacks"><ArrowLeft size={16}/> {t('nav.modpacks')}</Link><div className="experience-detail-intro"><div><ProjectStatusBadge status={project.status}/><h1>{project.name}</h1>{project.summary && <p>{project.summary}</p>}
      {!teaser && <div className="experience-tags">{[...(project.compatibility?.minecraft || []), ...(project.compatibility?.loaders || []), ...(project.compatibility?.platforms || [])].map((tag) => <span key={tag}>{tag}</span>)}</div>}
      {primary?.url && !teaser && <a className="experience-button experience-button-primary" href={primary.url} target="_blank" rel="noopener noreferrer">{t('ui.officialPage', { provider: primary.provider })} <ExternalLink size={17}/></a>}
      </div>{(teaser || image) && <div className={'experience-detail-emblem ' + (teaser ? 'experience-visual-prototype' : 'experience-card-visual-project')}>{image ? <img src={image.url} alt={image.alt || ''} width="680" height="440"/> : <Compass size={100} aria-hidden="true"/>}</div>}</div></div></section>
    <div className="container experience-detail-body">
      {teaser ? <section className="experience-content-panel experience-teaser-story"><h2>{t('project.inDevelopment')}</h2>{project.description ? <RichMarkdown markdown={project.description}/> : <p>{t('project.teaser')}</p>}<div className="experience-card-actions"><Link className="experience-button experience-button-soft" to="/modpacks">{t('project.all')} <ArrowRight size={16}/></Link><Link className="experience-button experience-button-soft" to="/news">{t('nav.news')} <ArrowRight size={16}/></Link></div></section> : <>
        {project.description && <section className="experience-content-panel"><h2>{t('project.overview')}</h2><RichMarkdown markdown={project.description}/></section>}
        {project.features?.length ? <section className="experience-section"><SectionTitle title={t('project.features')}/><div className="experience-grid experience-grid-resources">{project.features.map((feature) => <article className="experience-card experience-resource" key={feature.title}><Leaf size={23}/><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</article>)}</div></section> : null}
        {releases.length > 0 && <section className="experience-section"><SectionTitle title={t('project.releases')}/><div className="experience-grid experience-grid-resources">{releases.map((release) => <article className="experience-card experience-release" key={release.slug}><span className="experience-kicker">{t('status.' + release.channel)}</span><h3>{release.name}</h3><p className="experience-meta">v{release.version}</p>{release.changelog && <RichMarkdown markdown={release.changelog}/>}<div className="experience-card-actions">{release.distribution?.filter((provider) => provider.state === 'active' && provider.url).map((provider) => <a key={provider.provider} className="experience-button experience-button-primary" href={provider.url} target="_blank" rel="noopener noreferrer">{t('ui.officialRelease', { provider: provider.provider })} <ExternalLink size={16}/></a>)}</div></article>)}</div></section>}
        {project.installation && <section className="experience-content-panel"><h2>{t('project.installation')}</h2><RichMarkdown markdown={project.installation}/></section>}
      </>}
      <Link className="experience-back" to="/modpacks"><ArrowLeft size={16}/> {t('project.all')}</Link>
    </div>
  </SiteLayout>;
}

export function LaunchersExperience() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'official' | 'review'>('all');
  const launchers = publicLaunchers();
  const filtered = launchers.filter((entry) => { const item = entry.source === 'v2' ? localizeItem(entry.item, locale) : entry.item; return (filter === 'all' || (filter === 'official' ? entry.source === 'v2' && !!entry.item.officialLinks?.length : entry.source === 'legacy' || !entry.item.officialLinks?.length)) && (item.name + ' ' + (entry.source === 'v2' ? item.summary || '' : '')).toLowerCase().includes(query.trim().toLowerCase()); });
  return <SiteLayout><Seo title={t('nav.launchers') + ' — AlahPanda Labs'} description={t('ui.launcherDescription')}/>
    <PageHero title={t('nav.launchers')} tone="launchers" icon={Compass} eyebrow={t('ui.startingPoints')} description={t('ui.launcherIntro')}><Link className="experience-button experience-button-primary" to="/modpacks/mac-native#installation">{t('project.installation')} <ArrowRight size={16}/></Link><div className="experience-hero-equipment" aria-hidden="true"><Laptop size={94}/><Map size={72}/><Box size={48}/></div></PageHero>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={t('ui.browseLaunchers')} icon={Box}/><SearchField id="launcher-search" value={query} onChange={setQuery} placeholder={t('ui.searchLaunchers')}/></div>
      <div className="experience-filter-row" role="group" aria-label={t('ui.filterLaunchers')}>{(['all','official','review'] as const).map((value) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{t('ui.filter.' + value)}</button>)}</div>
      <div className="experience-catalog-columns"><div>{filtered.length ? <div className="experience-grid experience-grid-launchers">{filtered.map((entry) => <LauncherCard key={entry.slug} entry={entry}/>)}</div> : <EmptyCollection title={t('ui.noLaunchers')} description={t('ui.tryAgain')}/>}</div><aside className="experience-catalog-aside"><h2>{t('ui.onYourWay')}</h2><p>{t('ui.launcherIntro')}</p><Link to="/modpacks/mac-native#installation"><BookOpen size={19}/>{t('project.installation')} <ArrowRight size={16}/></Link><Link to="/modpacks"><Compass size={19}/>{t('nav.modpacks')} <ArrowRight size={16}/></Link><Link to="/support"><MessageCircle size={19}/>{t('nav.support')} <ArrowRight size={16}/></Link></aside></div>
    </section></SiteLayout>;
}

export function LauncherDetailExperience() {
  const { t, locale } = useI18n();
  const { slug } = useParams();
  const entry = slug ? publicLauncher(slug) : undefined;
  if (!entry) return <MissingExperience title={t('ui.launcherNotFound')} to="/launchers"/>;
  if (entry.source === 'legacy') return <SiteLayout><Seo title={entry.item.name + ' — AlahPanda Labs'} description={t('ui.noReview')}/><PageHero eyebrow={t('nav.launchers')} title={entry.item.name} description={t('ui.noReview')}/><section className="container experience-section"><EmptyCollection title={t('ui.reviewPending')} description={t('ui.reviewExplainer')} to="/launchers" link={t('ui.reviewedLaunchers')}/></section></SiteLayout>;
  const item = localizeItem(entry.item, locale);
  return <SiteLayout><Seo title={(item.seo?.title || item.name) + ' — AlahPanda Labs'} description={item.seo?.description || item.summary || item.name} image={item.seo?.image || item.media?.find((media) => media.kind === 'image')?.url} noindex={item.seo?.noindex}/>
    <PageHero eyebrow={t('nav.launchers')} title={item.name} description={item.summary}><Link className="experience-button experience-button-soft" to="/launchers"><ArrowLeft size={17}/>{t('ui.allLaunchers')}</Link></PageHero>
    <div className="container experience-detail-body experience-detail-columns"><article className="experience-content-panel"><h2>{t('ui.aboutProject', { name: item.name })}</h2>{item.description ? <RichMarkdown markdown={item.description}/> : <p>{t('ui.further')}</p>}
      {item.features?.length ? <div className="experience-section">{item.features.map((feature) => <div key={feature.title} className="experience-feature"><Leaf size={20}/><div><h3>{feature.title}</h3>{feature.description && <p>{feature.description}</p>}</div></div>)}</div> : null}
      {item.installation && <section className="experience-section"><h2>{t('project.installation')}</h2><RichMarkdown markdown={item.installation}/></section>}</article>
      <aside className="experience-content-panel"><h2>{t('ui.officialLinks')}</h2>{item.officialLinks?.map((link) => <a key={link.url} className="experience-button experience-button-primary" href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={17}/></a>)}
        {item.platforms.length > 0 && <div className="experience-section"><h3>{t('ui.platforms')}</h3><p>{item.platforms.join(' · ')}</p></div>}
      </aside></div><div className="container experience-card-actions experience-next-links"><Link to="/modpacks/mac-native" className="experience-button experience-button-soft">Mac Native <ArrowRight size={16}/></Link><Link to="/support" className="experience-button experience-button-soft">{t('nav.support')} <ArrowRight size={16}/></Link></div>
  </SiteLayout>;
}

export function NewsExperience() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const articles = approvedArticles();
  const categories = [...new Set(articles.map((article) => article.category).filter((value): value is string => !!value))];
  const filtered = articles.filter((source) => { const item = localizeItem(source, locale); return (category === 'all' || source.category === category) && (item.name + ' ' + (item.summary || '') + ' ' + (item.category || '')).toLowerCase().includes(query.trim().toLowerCase()); });
  return <SiteLayout><Seo title={t('nav.news') + ' — AlahPanda Labs'} description={t('ui.newsDescription')}/>
    <PageHero landscape scene="news" title={t('nav.news')} eyebrow={t('ui.stories')} description={t('ui.newsIntro')}><Link className="experience-button experience-button-soft" to="/modpacks">{t('nav.modpacks')} <ArrowRight size={16}/></Link></PageHero>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={t('ui.latestArticles')} icon={Newspaper}/><SearchField id="news-search" value={query} onChange={setQuery} placeholder={t('ui.searchArticles')}/></div>
      {categories.length > 0 && <div className="experience-filter-row" role="group" aria-label={t('ui.filterArticles')}><button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{t('ui.filter.all')}</button>{categories.map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div>}
      <div className="experience-catalog-columns"><div>{filtered.length ? <div className="experience-grid experience-grid-news">{filtered.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div> : <div className="experience-card experience-editorial-wait"><Newspaper size={32}/><div><h2>{query || category !== 'all' ? t('ui.noArticles') : t('ui.noArticle')}</h2><p>{query || category !== 'all' ? t('ui.tryAgain') : t('ui.newsEmpty')}</p></div></div>}</div><aside className="experience-catalog-aside"><h2>{t('ui.exploreSection')}</h2>{categories.map((name) => <button type="button" key={name} onClick={() => setCategory(name)}>{name} <ArrowRight size={16}/></button>)}<Link to="/modpacks/mac-native"><Compass size={19}/>Mac Native <ArrowRight size={16}/></Link><Link to="/guides"><BookOpen size={19}/>{t('nav.guides')} <ArrowRight size={16}/></Link><a href={site.discordUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={19}/>{t('ui.community')} <ExternalLink size={16}/></a></aside></div>
    </section></SiteLayout>;
}

export function ArticleExperience() {
  const { t, locale } = useI18n();
  const { slug } = useParams();
  const entry = slug ? publicArticles().find((article) => article.slug === slug) : undefined;
  if (!entry) return <MissingExperience title={t('ui.articleNotFound')} to="/news"/>;
  if (entry.source === 'legacy') return <SiteLayout><Seo title={t('ui.articleUnderReview') + ' — AlahPanda Labs'} description={t('ui.articleReview')}/><PageHero eyebrow={t('nav.news')} title={t('ui.articleUnderReview')} description={t('ui.articleReview')}/><section className="container experience-section"><EmptyCollection title={t('ui.reviewPending')} description={t('ui.reviewOthers')} to="/news" link={t('ui.allNews')}/></section></SiteLayout>;
  const article: ArticleV2 = localizeItem(entry.item, locale);
  const image = article.media?.find((media) => media.kind === 'image');
  const related = approvedArticles().filter((item) => item.slug !== article.slug && item.projectSlug && item.projectSlug === article.projectSlug).slice(0, 3);
  return <SiteLayout><Seo title={(article.seo?.title || article.name) + ' — AlahPanda Labs'} description={article.seo?.description || article.summary || article.name} image={article.seo?.image || image?.url} noindex={article.seo?.noindex} type="article"/>
    <article className="container experience-article-detail"><Link className="experience-back" to="/news"><ArrowLeft size={16}/> {t('nav.news')}</Link><span className="experience-kicker">{[article.category, article.publishedAt?.slice(0,10)].filter(Boolean).join(' · ') || t('ui.article')}</span>
      <h1>{article.name}</h1>{article.summary && <p className="experience-lead">{article.summary}</p>}{image && <img className="experience-article-cover" src={image.url} alt={image.alt || ''} width="1000" height="560"/>}
      <div className="experience-content-panel experience-reading"><RichMarkdown markdown={article.body}/></div>{article.author && <p className="experience-meta">{t('ui.byAuthor', { author: article.author })}</p>}<div className="experience-card-actions experience-next-links"><ProjectRelation slug={article.projectSlug}/><Link to="/news" className="experience-text-link">{t('ui.allNews')} <ArrowRight size={16}/></Link></div>{related.length > 0 && <section className="experience-section"><SectionTitle title={t('ui.relatedArticles')}/><div className="experience-grid experience-grid-news">{related.map((item) => <ArticleCard key={item.slug} item={item}/>)}</div></section>}</article>
  </SiteLayout>;
}

export function GuidesExperience() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  const guides = publicGuides();
  const filtered = guides.filter((source) => { const guide = localizeItem(source, locale); return (guide.name + ' ' + (guide.summary || '')).toLowerCase().includes(query.trim().toLowerCase()); });
  return <SiteLayout><Seo title={t('nav.guides') + ' — AlahPanda Labs'} description={t('ui.guideDescription')}/><PageHero title={t('nav.guides')} tone="guides" icon={BookOpen} eyebrow={t('ui.resources')} description={t('ui.guidesIntro')}/>
    <section className="container experience-section experience-catalog"><div className="experience-catalog-toolbar"><SectionTitle title={t('ui.browseGuides')} icon={BookOpen}/><SearchField id="guide-search" value={query} onChange={setQuery} placeholder={t('ui.searchGuides')}/></div>
      {filtered.length ? <div className="experience-grid experience-grid-resources">{filtered.map((guide) => <GuideCard key={guide.slug} guide={guide}/>)}</div> : <EmptyCollection title={query ? t('ui.noGuides') : t('ui.noGuide')} description={query ? t('ui.tryAgain') : t('ui.guideEmpty')}/>}
    </section></SiteLayout>;
}

export function GuideDetailExperience() {
  const { t, locale } = useI18n();
  const { slug } = useParams();
  const sourceGuide = slug ? publicGuide(slug) : undefined;
  const guide = sourceGuide ? localizeItem(sourceGuide, locale) : undefined;
  if (!guide) return <MissingExperience title={t('ui.guideNotFound')} to="/guides"/>;
  const related = publicGuides().filter((item) => item.slug !== guide.slug && item.projectSlug && item.projectSlug === guide.projectSlug).slice(0, 3);
  const image = guide.media?.find((media) => media.kind === 'image');
  return <SiteLayout><Seo title={(guide.seo?.title || guide.name) + ' — AlahPanda Labs'} description={guide.seo?.description || guide.summary || guide.name} image={guide.seo?.image || image?.url} noindex={guide.seo?.noindex} type="article"/>
    <article className="container experience-article-detail"><Link className="experience-back" to="/guides"><ArrowLeft size={16}/> {t('nav.guides')}</Link><span className="experience-kicker"><BookOpen size={17}/> {t('ui.guide')}{guide.level && ` · ${t('ui.level.' + guide.level)}`}{guide.updatedAt && ` · ${guide.updatedAt.slice(0,10)}`}</span><h1>{guide.name}</h1>{guide.summary && <p className="experience-lead">{guide.summary}</p>}{image && <img className="experience-article-cover" src={image.url} alt={image.alt || ''} loading="lazy"/>}
      <div className="experience-content-panel experience-reading"><RichMarkdown markdown={guide.body || ''}/>{guide.steps?.map((step) => <section key={step.title} className="experience-section"><h2>{step.title}</h2><RichMarkdown markdown={step.body}/></section>)}</div><div className="experience-card-actions experience-next-links"><ProjectRelation slug={guide.projectSlug}/>{guide.launcherSlug && publicLauncher(guide.launcherSlug)?.source === 'v2' && <Link to={'/launchers/' + guide.launcherSlug} className="experience-text-link">{t('nav.launchers')} <ArrowRight size={16}/></Link>}<Link to="/support" className="experience-text-link">{t('nav.support')} <ArrowRight size={16}/></Link></div>{related.length > 0 && <section className="experience-section"><SectionTitle title={t('ui.relatedGuides')}/><div className="experience-grid experience-grid-resources">{related.map((item) => <GuideCard key={item.slug} guide={item}/>)}</div></section>}</article>
  </SiteLayout>;
}

export function FaqExperience() {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState('');
  // The legacy FAQ awaits editorial review; only published V2 groups enter search.
  const faq = publicFaq().flatMap((entry) => entry.source === 'v2' ? [localizeItem(entry.item, locale)] : []);
  const groups = faq.map((group) => ({ group, items: group.items.filter((item) => (item.question + ' ' + item.answer).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) })).filter(({ items }) => items.length);
  return <SiteLayout><Seo title="FAQ — AlahPanda Labs" description={t('ui.faqDescription')}/><PageHero title="FAQ" tone="quiet" icon={MessageCircle} eyebrow={t('ui.help')} description={t('ui.faqIntro')}/>
    <section className="container experience-section">
      {faq.length > 0 && <SearchField id="faq-search" value={query} onChange={setQuery} placeholder={t('ui.searchFaq')}/>}
      {groups.length ? groups.map(({group,items}) => <div className="experience-faq-group" key={group.slug}><SectionTitle title={group.name}/><ProjectRelation slug={group.projectSlug}/>{items.map((item) => <details id={`faq-${group.slug}-${item.id || group.items.indexOf(item) + 1}`} key={item.id || item.question} className="experience-faq-item"><summary>{item.question}</summary><div className="experience-faq-answer"><RichMarkdown markdown={item.answer}/></div></details>)}</div>) : <EmptyCollection title={faq.length ? t('ui.noMatch') : t('faq.empty')} description={faq.length ? t('ui.tryAgain') : t('faq.pending')} to="/support" link={t('nav.support')}/>}
      <div className="experience-card-actions experience-next-links"><Link to="/modpacks/mac-native#questions" className="experience-text-link">Mac Native FAQ <ArrowRight size={16}/></Link><Link to="/support" className="experience-text-link">{t('nav.support')} <ArrowRight size={16}/></Link></div>
    </section>
  </SiteLayout>;
}

export function AboutExperience() {
  const { t, locale } = useI18n();
  const projects = publicProjects().filter((entry) => entry.source === 'v2');
  const settings = publicSettings();
  const description = (settings && localizeItem(settings, locale).description) || t('footer.tagline');
  return <SiteLayout><Seo title={t('nav.about') + ' — AlahPanda Labs'} description={description}/>
    <PageHero title={t('ui.aboutTitle')} tone="about" icon={Heart} eyebrow={t('ui.ourPlace')} description={description}/>
    <div className="container experience-detail-body"><section className="experience-content-panel experience-reading"><h2>{t('home.journey')}</h2><p>{t('footer.tagline')}</p><p>{t('ui.projectIntro')}</p></section><section className="experience-section"><SectionTitle title={t('home.featured')} to="/modpacks"/>{projects.length > 0 && <div className={cardGrid}>{projects.map((entry) => <ProjectCard key={entry.slug} entry={entry}/>)}</div>}</section><div className="experience-card-actions experience-next-links"><Link to="/modpacks" className="experience-button experience-button-primary">{t('home.cta.explore')} <ArrowRight size={16}/></Link><Link to="/support" className="experience-button experience-button-soft">{t('nav.support')} <ArrowRight size={16}/></Link><a className="experience-button experience-button-soft" href={site.discordUrl} target="_blank" rel="noopener noreferrer">{t('ui.community')} <ExternalLink size={16}/></a></div></div>
  </SiteLayout>;
}

export function SupportExperience() {
  const { t } = useI18n();
  const mac = publicProject('mac-native');
  return <SiteLayout><Seo title={t('nav.support') + ' — AlahPanda Labs'} description={t('ui.supportDescription')}/><PageHero title={t('nav.support')} eyebrow={t('ui.findWay')} description={t('support.help')}/>
    <div className="container experience-detail-body"><section className="experience-grid experience-grid-resources" aria-label={t('support.help')}>
      {mac?.source === 'v2' && mac.item.installation && <Link className="experience-card experience-resource" to="/modpacks/mac-native#installation"><BookOpen size={28}/><h2>{t('support.install')}</h2><p>{t('support.installInfo')}</p><span className="experience-text-link">{t('project.installation')} <ArrowRight size={16}/></span></Link>}
      <Link className="experience-card experience-resource" to="/launchers"><Box size={28}/><h2>{t('nav.launchers')}</h2><p>{t('home.launchersExplain')}</p><span className="experience-text-link">{t('mac.launchers')} <ArrowRight size={16}/></span></Link>
      <Link className="experience-card experience-resource" to="/guides"><BookOpen size={28}/><h2>{t('support.guides')}</h2><p>{t('home.guidesEmpty')}</p><span className="experience-text-link">{t('nav.guides')} <ArrowRight size={16}/></span></Link>
      <Link className="experience-card experience-resource" to="/faq"><MessageCircle size={28}/><h2>FAQ</h2><p>{t('ui.faqIntro')}</p><span className="experience-text-link">FAQ <ArrowRight size={16}/></span></Link>
      {mac?.source === 'v2' && !!mac.item.faq?.length && <Link className="experience-card experience-resource" to="/modpacks/mac-native#questions"><MessageCircle size={28}/><h2>{t('support.question')}</h2><p>{t('support.questionInfo')}</p><span className="experience-text-link">Mac Native FAQ <ArrowRight size={16}/></span></Link>}
      <a className="experience-card experience-resource" href={site.discordUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={28}/><h2>{t('support.community')}</h2><p>{t('home.supportExplain')}</p><span className="experience-text-link">Discord <ExternalLink size={16}/></span></a>
    </section>{site.ads.showSupportButton && <div className="experience-card-actions experience-next-links"><a className="experience-button experience-button-soft" href={site.supportUrl} target="_blank" rel="noopener noreferrer">Ko-fi <ExternalLink size={16}/></a></div>}</div>
  </SiteLayout>;
}

export function MissingExperience({ title, to = '/' }: { title?: string; to?: string }) {
  const { t } = useI18n();
  title ??= t('ui.notFound');
  return <SiteLayout><Seo title={title + ' — AlahPanda Labs'}/><div className="container experience-missing"><Compass size={54} aria-hidden="true"/><span className="experience-kicker">404 · {t('ui.anotherPath')}</span><h1>{title}</h1><p>{t('ui.noPublished')}</p><Link to={to} className="experience-button experience-button-primary"><ArrowLeft size={16}/> {to === '/' ? t('ui.backHome') : t('ui.backCollection')}</Link></div></SiteLayout>;
}
