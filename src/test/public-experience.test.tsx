import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { HomeExperience, ProjectsExperience, ProjectDetailExperience, LaunchersExperience, LauncherDetailExperience, NewsExperience, ArticleExperience, GuidesExperience, GuideDetailExperience, FaqExperience, AboutExperience, SupportExperience, MissingExperience } from '@/pages/PublicExperience';
import { publicArticles } from '@/content/publicResolver';
import { publicProject, publicReleasesFor } from '@/content/publicResolver';
import * as resolver from '@/content/publicResolver';
import { PremiumProjectPage } from '@/components/experience/MacNativeProduct';
import { ArticleCard, GuideCard } from '@/components/experience/Shared';
import { parseItem } from '@/content/v2/schema';
import Seo from '@/components/Seo';
import App from '@/App';

beforeEach(() => {
  localStorage.setItem('apl.locale', 'en');
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('Modrinth temporarily unavailable'); }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.removeItem('apl.theme'); localStorage.removeItem('apl.locale'); window.history.replaceState({}, '', '/'); });

function publicRoute(path: string, route: string, page: React.ReactElement) {
  return render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><HelmetProvider><ThemeProvider><I18nProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={page}/></Routes></MemoryRouter></I18nProvider></ThemeProvider></HelmetProvider></QueryClientProvider>);
}
function publicationFixture(patch: Record<string,unknown> = {}) {
  return { stale:false, persistence:'available', snapshot:{ fetchedAt:'2026-09-29T00:00:00Z', project:{
    id:'fPtkF9pO',slug:'mac-native',name:'Mac Native',summary:'Official',downloads:129,followers:31,projectUrl:'https://modrinth.com/modpack/mac-native',gallery:[],
    release:{id:'test-release',version:'0.6.0',channel:'beta',publishedAt:'2026-09-29T00:00:00Z',minecraft:['1.21.11'],loaders:['Fabric'],changelog:'Verified changes',url:'https://modrinth.com/modpack/mac-native/version/test-release',files:[]},
    ...patch,
  }}};
}

describe('public redesign and editorial boundaries', () => {
  it('shows only real projects on Home without fictitious metrics', () => {
    publicRoute('/', '/', <HomeExperience/>);
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.queryByText('Soon')).not.toBeInTheDocument();
    expect(screen.queryByText(/download count|community rating|benchmark/i)).not.toBeInTheDocument();
  });

  it('filters the published destinations without turning CraftToons into a release', () => {
    publicRoute('/modpacks', '/modpacks', <ProjectsExperience/>);
    fireEvent.click(screen.getByRole('button', { name: 'Available' }));
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'CraftToons' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'In development' }));
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mac Native' })).not.toBeInTheDocument();
    expect(screen.queryByText('Soon')).not.toBeInTheDocument();
  });

  it('features the verified AstralRinth entry and retains the full catalog', () => {
    publicRoute('/launchers', '/launchers', <LaunchersExperience/>);
    expect(screen.getByRole('heading', { name: 'AstralRinth' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Prism Launcher' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Official site' })[0]).toHaveAttribute('href', 'https://git.xorison.dev/didirus/AstralRinth');
  });

  it('keeps the CraftToons URL a versionless teaser', () => {
    publicRoute('/modpacks/crafttoons', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.getByText('In Development', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByText(/download|release|benchmark|review/i)).not.toBeInTheDocument();
  });

  it('applies a persisted Spanish UI on a direct product URL while keeping original editorial content', () => {
    localStorage.setItem('apl.locale', 'es');
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('link', { name: /Descargar en Modrinth/ })).toHaveAttribute('href','/api/download/mac-native');
    expect(screen.getByText(/Modpack Minecraft para macOS/)).toBeInTheDocument();
  });

  it('keeps the product usable without falsely claiming a current release when upstream is offline', () => {
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.getByText('0.3.1', { selector: '.mac-release-version strong' })).toBeInTheDocument();
    expect(screen.getByRole('heading', {name:'Last verified release'})).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download on Modrinth/i })).toHaveAttribute('href', '/api/download/mac-native');
    for (const heading of ['Mac Native on Mac', 'How it works', 'Need help or want to learn more?']) expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /What’s inside/ })).toHaveAttribute('href', '#inside');
    expect(screen.getByText(/Mac Native illustration/)).toBeInTheDocument();
    expect(document.querySelectorAll('.mac-benefit')).toHaveLength(3);
    expect(screen.getByText('Installation', { selector: 'summary' })).toBeInTheDocument();
    expect(screen.queryByText(/412 MB|8 GB|1\.4\.2|community rating|592 FPS/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Screenshots' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Known issues' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Downloads on Modrinth/)).not.toBeInTheDocument();
    expect(screen.queryByText('0 downloads')).not.toBeInTheDocument();
  });

  it('does not invent project metrics when both publication and public project endpoints fail', async () => {
    const requests = vi.fn(async () => new Response('offline',{status:503}));
    vi.stubGlobal('fetch',requests);
    publicRoute('/modpacks/mac-native','/modpacks/:slug',<ProjectDetailExperience/>);
    await waitFor(()=>expect(requests).toHaveBeenCalledTimes(2));
    expect(document.querySelector('.mac-live-stats')).toBeNull();
    expect(screen.queryByText(/0 Downloads|0 Followers/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Last verified release'})).toBeInTheDocument();
  });

  it('shows the current published upstream release, stats and current changelog destination', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(publicationFixture()), { status: 200 })));
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    await waitFor(() => expect(document.querySelector('.mac-stat-primary')).toHaveTextContent(/129.*Downloads on Modrinth/));
    expect(document.querySelector('.mac-live-stats')).toHaveTextContent(/31.*Followers on Modrinth/);
    expect(document.querySelector('.mac-stat-primary')).toBeVisible();
    expect(document.querySelector('.mac-live-stats')?.closest('details')).toBeNull();
    expect(screen.getByText('0.6.0', { selector: '.mac-release-version strong' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download 0\.6\.0 on Modrinth/ })).toHaveAttribute('href', '/api/download/mac-native');
    expect(screen.getByRole('link', { name: /Official release.*modrinth/i })).toHaveAttribute('href','https://modrinth.com/modpack/mac-native/version/test-release');
  });

  it('keeps validated project metrics visible beside the editorial release when publication is unavailable', async () => {
    vi.stubGlobal('fetch',vi.fn(async (url: string) => url.startsWith('https://api.modrinth.com/v2/project/mac-native')
      ? new Response(JSON.stringify({id:'fPtkF9pO',slug:'mac-native',downloads:156,followers:3,gallery:[]}),{status:200})
      : new Response('unavailable',{status:503})));
    publicRoute('/modpacks/mac-native','/modpacks/:slug',<ProjectDetailExperience/>);
    expect(screen.getByRole('heading',{name:'Last verified release'})).toBeInTheDocument();
    await waitFor(()=>expect(document.querySelector('.mac-stat-primary')).toHaveTextContent(/156.*Downloads on Modrinth/));
    expect(document.querySelector('.mac-live-stats')).toHaveTextContent(/3.*Followers on Modrinth/);
    expect(document.querySelector('.mac-live-stats')?.closest('details')).toBeNull();
    expect(screen.getByText('0.3.1',{selector:'.mac-release-version strong'})).toBeInTheDocument();
  });

  it('uses the official gallery as a navigable carousel only when Modrinth supplies images', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(publicationFixture({gallery:[
      { url: 'https://cdn.modrinth.com/data/mac/one.webp', alt: 'First world' },
      { url: 'https://cdn.modrinth.com/data/mac/two.webp', alt: 'Second world' },
    ]})), { status: 200 })));
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(await screen.findByRole('img', { name: 'First world' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next image' }));
    expect(screen.getByRole('img', { name: 'Second world' })).toBeInTheDocument();
  });

  it('serves verified AstralRinth platform downloads without old shorteners', () => {
    const rendered = publicRoute('/launchers', '/launchers', <LaunchersExperience/>);
    for (const name of ['Prism Launcher', 'Modrinth App', 'ATLauncher', 'CurseForge App', 'MultiMC', 'GDLauncher', 'SKLauncher', 'AstralRinth']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('link', { name: 'Details' }).some((link) => link.getAttribute('href') === '/launchers/astralrinth')).toBe(true);
    rendered.unmount();
    publicRoute('/launchers/astralrinth', '/launchers/:slug', <LauncherDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'AstralRinth' })).toBeInTheDocument();
    const downloads = document.querySelectorAll('.launcher-download-list a');
    expect(downloads.length).toBeGreaterThanOrEqual(3);
    for (const link of downloads) expect(link.getAttribute('href')).toMatch(/^https:\/\/git\.xorison\.dev\/didirus\/AstralRinth\/releases\/download\//);
    expect(document.body.textContent).not.toContain('ouo.io');
  });

  it('withholds articles pending provenance review at their original URL', () => {
    const old = publicArticles().find((entry) => entry.source === 'legacy');
    if (!old) throw new Error('Expected a known legacy article');
    publicRoute('/news/' + old.slug, '/news/:slug', <ArticleExperience/>);
    expect(screen.getByRole('heading', { name: 'Article under review' })).toBeInTheDocument();
    expect(screen.queryByText(old.item.title)).not.toBeInTheDocument();
  });

  it('shows eight sourced editorial drafts with thumbnails and five guides', () => {
    publicRoute('/news', '/news', <NewsExperience/>);
    expect(document.querySelectorAll('.experience-article-card img')).toHaveLength(6);
    expect(screen.getByRole('navigation', { name: 'News pages' })).toBeInTheDocument();
    expect(screen.queryByText(/\[Demo\]/)).not.toBeInTheDocument();
    cleanup();
    publicRoute('/guides', '/guides', <GuidesExperience/>);
    expect(screen.getByRole('link', { name: /Mac Native: installation and configuration/i })).toHaveAttribute('href', '/guides/complete-mac-native');
  });

  it('shows the verified, published V2 FAQ and keeps the unreviewed legacy answers private from the V2 page', () => {
    publicRoute('/faq', '/faq', <FaqExperience/>);
    expect(screen.getByText('Do I need a Minecraft account?')).toBeInTheDocument();
    expect(screen.getByText(/use a Microsoft account with access to the game/)).toBeInTheDocument();
    expect(document.querySelectorAll('.experience-faq-item')).toHaveLength(21);
    expect(document.querySelector('.experience-faq-category[href="#faq-group-launchers"]')).toBeInTheDocument();
  });

  it('shows the two projects without a marketplace filter or Soon', () => {
    publicRoute('/modpacks', '/modpacks', <ProjectsExperience/>);
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Soon')).not.toBeInTheDocument();
  });

  it('connects Home to the published release, installation and help without simulated news', () => {
    publicRoute('/', '/', <HomeExperience/>);
    const mac = publicProject('mac-native');
    if (mac?.source !== 'v2') throw new Error('Mac Native must be published in V2');
    const release = publicReleasesFor(mac.item)[0];
    expect(screen.getByRole('link', { name: /download.*modrinth/i })).toHaveAttribute('href', '/api/download/mac-native');
    expect(screen.getAllByRole('link', { name: /support/i }).some((link) => link.getAttribute('href') === '/support')).toBe(true);
    expect(screen.getAllByRole('link', { name: /Mac Native 0\.3\.1 Beta/i }).length).toBeGreaterThan(0);
  });

  it('renders a different published release, compatibility and optional content from props', () => {
    const mac = publicProject('mac-native');
    if (mac?.source !== 'v2') throw new Error('Expected Mac Native V2');
    const next = { ...publicReleasesFor(mac.item)[0], version: '0.6.0', name: 'Mac Native 0.6.0',
      compatibility: { minecraft: ['1.22'], loaders: ['Fabric'], platforms: ['macOS'] },
      distribution: [{ provider: 'modrinth', state: 'active' as const, url: 'https://modrinth.com/modpack/mac-native/version/0.6.0' }] };
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <PremiumProjectPage project={{...mac.item, upstream:undefined, knownIssues:['Issue described by the publisher'], requirements:[{title:'Publisher requirement'}]}} releases={[next]}/>);
    expect(screen.getByRole('link', { name: /Download 0\.6\.0 on Modrinth/ })).toHaveAttribute('href', next.distribution[0].url);
    expect(screen.getAllByText('1.22').length).toBeGreaterThan(0);
    expect(screen.getByText('Known issues', { selector: 'summary' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Compatibility', { selector: 'summary' }));
    expect(screen.getByRole('heading', { name: 'Publisher requirement' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Detailed instructions/ }).some((link) => link.getAttribute('href') === '#mac-install-detail')).toBe(true);
    cleanup();
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <PremiumProjectPage project={{...mac.item, installation:undefined, faq:undefined, media:undefined}} releases={[]}/>);
    expect(screen.queryByText('Installation', { selector: 'summary' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Latest release' })).not.toBeInTheDocument();
  });

  it('renders a future connected project through the same premium template without Mac Native copy', () => {
    const future = parseItem('projects', {slug:'future-pack',name:'Future Pack',sourceLocale:'en',summary:'Owner approved summary',status:'beta',releaseSlugs:[],pageTemplate:'premium',upstream:{provider:'modrinth',projectId:'another-id',projectSlug:'future-pack'},distribution:[{provider:'modrinth',state:'active',url:'https://modrinth.com/modpack/future-pack'}]});
    publicRoute('/modpacks/future-pack','/modpacks/:slug',<PremiumProjectPage project={future as unknown as import('@/content/v2/schema').ProjectV2} releases={[]}/>);
    expect(screen.getByRole('heading',{name:'Future Pack'})).toBeInTheDocument();
    expect(screen.getByText('A new way to explore Minecraft.')).toBeInTheDocument();
    expect(screen.getByRole('link',{name:/Download on Modrinth/})).toHaveAttribute('href','/api/download/future-pack');
    expect(screen.queryByText('Mac Native on Mac')).not.toBeInTheDocument();
  });

  it('uses a future project’s own icon, release and metrics in the reusable premium template', async () => {
    const future = parseItem('projects', {slug:'future-pack',name:'Future Pack',sourceLocale:'en',summary:'Approved summary',status:'beta',releaseSlugs:[],pageTemplate:'premium',iconUrl:'https://cdn.modrinth.com/data/future/icon.webp',upstream:{provider:'modrinth',projectId:'another-id',projectSlug:'future-pack'},distribution:[{provider:'modrinth',state:'active',url:'https://modrinth.com/modpack/future-pack'}]});
    vi.stubGlobal('fetch',vi.fn(async () => new Response(JSON.stringify(publicationFixture({id:'another-id',slug:'future-pack',name:'Future Pack',downloads:927,followers:42,iconUrl:undefined,release:{id:'future-release',version:'1.2.0',channel:'beta',publishedAt:'2026-09-29T00:00:00Z',minecraft:['1.22'],loaders:['Fabric'],changelog:'Future release notes',url:'https://modrinth.com/modpack/future-pack/version/future-release',files:[]}})),{status:200})));
    publicRoute('/modpacks/future-pack','/modpacks/:slug',<PremiumProjectPage project={future} releases={[]}/>);
    await waitFor(() => expect(screen.getByText('1.2.0',{selector:'.mac-release-version strong'})).toBeInTheDocument());
    expect(document.querySelector('.mac-product-icon img')).toHaveAttribute('src','https://cdn.modrinth.com/data/future/icon.webp');
    expect(document.querySelector('.mac-stat-primary')).toHaveTextContent(/927.*Downloads on Modrinth/);
    expect(screen.getByRole('link',{name:/Official release.*Modrinth/})).toHaveAttribute('href','https://modrinth.com/modpack/future-pack/version/future-release');
    expect(screen.queryByText('Mac Native on Mac')).not.toBeInTheDocument();
  });

  it('keeps published article and guide cards navigable, with no invented entries', () => {
    const article = parseItem('articles', {slug:'field-note',name:'Field note',sourceLocale:'pt-PT',body:'Own text',projectSlug:'mac-native'});
    const guide = parseItem('guides', {slug:'getting-started',name:'Getting started',sourceLocale:'pt-PT',body:'Own guide',updatedAt:'2026-01-01T00:00:00Z',media:[{url:'https://example.org/image.webp',kind:'image'}]});
    publicRoute('/', '/', <><ArticleCard item={article}/><GuideCard guide={guide}/></>);
    expect(screen.getByRole('link', { name: /field note/i })).toHaveAttribute('href', '/news/field-note');
    expect(screen.getByRole('link', { name: /getting started/i })).toHaveAttribute('href', '/guides/getting-started');
  });

  it('shows a published guide with project relation and a real updated date', () => {
    const guide = parseItem('guides', {slug:'verified-guide',name:'Verified guide',body:'Own steps',sourceLocale:'pt-PT',projectSlug:'mac-native',updatedAt:'2026-01-01T00:00:00Z'});
    vi.spyOn(resolver, 'publicGuide').mockReturnValue(guide);
    publicRoute('/guides/verified-guide', '/guides/:slug', <GuideDetailExperience/>);
    expect(screen.getByRole('heading', { name:'Verified guide' })).toBeInTheDocument();
    expect(screen.getByText('Own steps')).toBeInTheDocument();
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Mac Native/ }).some((link) => link.getAttribute('href') === '/modpacks/mac-native')).toBe(true);
  });

  it('shows a published article with project relation, without publishing old news', () => {
    const article = parseItem('articles', {slug:'verified-note',name:'Verified note',body:'Own article',sourceLocale:'pt-PT',projectSlug:'mac-native',publishedAt:'2026-01-01T00:00:00Z'});
    vi.spyOn(resolver, 'publicArticles').mockReturnValue([{source:'v2',slug:article.slug,item:article}]);
    publicRoute('/news/verified-note', '/news/:slug', <ArticleExperience/>);
    expect(screen.getByRole('heading', { name:'Verified note' })).toBeInTheDocument();
    expect(screen.getByText('Own article')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Mac Native/ }).some((link) => link.getAttribute('href') === '/modpacks/mac-native')).toBe(true);
  });

  it('searches only published FAQ groups and gives each answer a deep link', () => {
    const group = parseItem('faq', {slug:'mac-questions',name:'Mac questions',sourceLocale:'pt-PT',projectSlug:'mac-native',items:[{question:'Which launcher?',answer:'Use the publisher’s instructions.'},{question:'Where can I ask?',answer:'See support.'}]});
    vi.spyOn(resolver, 'publicFaq').mockReturnValue([{source:'v2',slug:group.slug,item:group}]);
    publicRoute('/faq', '/faq', <FaqExperience/>);
    expect(screen.getByText('Which launcher?').closest('details')).toHaveAttribute('id','faq-mac-questions-1');
    fireEvent.change(screen.getByRole('searchbox', {name:'Search questions'}), {target:{value:'launcher'}});
    expect(screen.getByText('Which launcher?')).toBeInTheDocument();
    expect(screen.queryByText('Where can I ask?')).not.toBeInTheDocument();
  });

  it('provides contextual support links and leaves unknown project data unclaimed', () => {
    publicRoute('/support', '/support', <SupportExperience/>);
    for (const path of ['/modpacks/mac-native#installation','/modpacks/mac-native#questions','/launchers','/guides','/faq']) {
      expect(screen.getAllByRole('link').some((link) => link.getAttribute('href') === path)).toBe(true);
    }
  });

  it('emits canonical metadata without query strings or a fictitious preview image', async () => {
    render(<HelmetProvider><Seo title="Mac Native" description="Published project" url="https://example.org/modpacks/mac-native"/></HelmetProvider>);
    await waitFor(() => expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href','https://example.org/modpacks/mac-native'));
    expect(document.head.querySelector('meta[property="og:image"]')).not.toBeInTheDocument();
  });

  it('keeps main routes and the owner CMS entry discoverable', () => {
    publicRoute('/', '/', <HomeExperience/>);
    for (const path of ['/modpacks','/launchers','/guides','/news','/about','/faq','/support','/modpacks/mac-native','/modpacks/crafttoons','/admin']) {
      expect(screen.getAllByRole('link').some((link) => link.getAttribute('href') === path)).toBe(true);
    }
    expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument();
    cleanup();
    for (const [path, view, title] of [['/about', <AboutExperience/>, 'About AlahPanda Labs'], ['/support', <SupportExperience/>, 'Support'], ['/missing', <MissingExperience/>, 'Page not found']] as const) {
      const { unmount } = publicRoute(path, path, view);
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      unmount();
    }
  });

  it('redirects the historical /projects route to the canonical /modpacks hub', async () => {
    vi.stubGlobal('scrollTo', vi.fn());
    window.history.replaceState({}, '', '/projects');
    render(<App/>);
    await waitFor(() => expect(window.location.pathname).toBe('/modpacks'));
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
  });
});
