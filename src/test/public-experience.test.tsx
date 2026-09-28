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
import { MacNativeProduct } from '@/components/experience/MacNativeProduct';
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

  it('separates official launcher links from a legacy entry under review', () => {
    publicRoute('/launchers', '/launchers', <LaunchersExperience/>);
    fireEvent.click(screen.getByRole('button', { name: 'Official links' }));
    expect(screen.getByRole('heading', { name: 'Prism Launcher' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'AstralRinth' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Under review' }));
    expect(screen.getByRole('heading', { name: 'AstralRinth' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Prism Launcher' })).not.toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: /Descargar 0\.3\.1 en Modrinth/ })).toBeInTheDocument();
    expect(screen.getByText(/Modpack Minecraft para macOS/)).toBeInTheDocument();
  });

  it('keeps the verified Mac Native release and official destination', () => {
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.getByText(/v0\.3\.1/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Official release.*modrinth/i })).toHaveAttribute('href', 'https://modrinth.com/modpack/mac-native/version/0.3.1');
    expect(screen.getByRole('link', { name: /Download 0\.3\.1 on Modrinth/i })).toHaveAttribute('href', 'https://modrinth.com/modpack/mac-native/version/0.3.1');
    for (const heading of ['Mac Native on Mac', 'What Mac Native focuses on', 'Before you install', 'Installation', 'Published releases', 'Mac Native FAQ', 'Help and other projects']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.queryByText(/412 MB|8 GB|1\.4\.2|community rating|592 FPS/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Screenshots' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Known issues' })).not.toBeInTheDocument();
    expect(screen.queryByText('Downloads on Modrinth')).not.toBeInTheDocument();
    expect(screen.queryByText('0 downloads')).not.toBeInTheDocument();
  });

  it('shows only API supplied Modrinth downloads and followers without replacing the V2 release', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ downloads: 129, followers: 31 }), { status: 200 })));
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    await waitFor(() => expect(screen.getByText('129')).toBeInTheDocument());
    expect(screen.getByText('31')).toBeInTheDocument();
    expect(screen.getByText('Downloads on Modrinth')).toBeInTheDocument();
    expect(screen.getByText(/v0\.3\.1/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download 0\.3\.1 on Modrinth/ })).toHaveAttribute('href', 'https://modrinth.com/modpack/mac-native/version/0.3.1');
  });

  it('lists historical launchers safely and migrates verified SKLauncher fields', () => {
    const rendered = publicRoute('/launchers', '/launchers', <LaunchersExperience/>);
    for (const name of ['Prism Launcher', 'Modrinth App', 'ATLauncher', 'CurseForge App', 'MultiMC', 'GDLauncher', 'SKLauncher', 'AstralRinth']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: /view status/i })).toHaveAttribute('href', '/launchers/astralrinth');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search launchers' }), { target: { value: 'Prism' } });
    expect(screen.getByRole('heading', { name: 'Prism Launcher' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'MultiMC' })).not.toBeInTheDocument();
    rendered.unmount();
    publicRoute('/launchers/astralrinth', '/launchers/:slug', <LauncherDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'AstralRinth' })).toBeInTheDocument();
    for (const label of ['Windows (.exe)', 'macOS (ARM/M1/M2)', 'Linux (.deb)', 'Linux (.rpm)', 'Linux (.AppImage)']) {
      expect(screen.getByRole('link', { name: new RegExp(label.replace(/[().]/g, '\\$&')) })).toHaveAttribute('href', expect.stringMatching(/^https:\/\/ouo\.io\//));
    }
    expect(screen.getByText(/não foram verificados de forma independente|have not been independently verified/i)).toBeInTheDocument();
    cleanup();
    publicRoute('/launchers/sklauncher', '/launchers/:slug', <LauncherDetailExperience/>);
    expect(screen.getByRole('link', { name: 'Official SKLauncher website' })).toHaveAttribute('href', 'https://skmedix.pl/');
    expect(screen.getByText(/Windows · Linux · macOS/)).toBeInTheDocument();
  });

  it('withholds articles pending provenance review at their original URL', () => {
    const old = publicArticles().find((entry) => entry.source === 'legacy');
    if (!old) throw new Error('Expected a known legacy article');
    publicRoute('/news/' + old.slug, '/news/:slug', <ArticleExperience/>);
    expect(screen.getByRole('heading', { name: 'Article under review' })).toBeInTheDocument();
    expect(screen.queryByText(old.item.title)).not.toBeInTheDocument();
  });

  it('shows eight labelled editorial demos with thumbnails and keeps Guides empty', () => {
    publicRoute('/news', '/news', <NewsExperience/>);
    expect(screen.getAllByRole('link', { name: /\[Demo\]/i })).toHaveLength(8);
    expect(document.querySelectorAll('.experience-article-card img')).toHaveLength(8);
    cleanup();
    publicRoute('/guides', '/guides', <GuidesExperience/>);
    expect(screen.getByRole('heading', { name: 'No guides published yet' })).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: /download.*modrinth/i })).toHaveAttribute('href', release.distribution?.[0]?.url);
    expect(screen.getAllByRole('link', { name: /support/i }).some((link) => link.getAttribute('href') === '/support')).toBe(true);
    expect(screen.getAllByRole('link', { name: /\[Demo\]/i }).length).toBeGreaterThan(0);
  });

  it('renders a different published release, compatibility and optional content from props', () => {
    const mac = publicProject('mac-native');
    if (mac?.source !== 'v2') throw new Error('Expected Mac Native V2');
    const next = { ...publicReleasesFor(mac.item)[0], version: '0.6.0', name: 'Mac Native 0.6.0',
      compatibility: { minecraft: ['1.22'], loaders: ['Fabric'], platforms: ['macOS'] },
      distribution: [{ provider: 'modrinth', state: 'active' as const, url: 'https://modrinth.com/modpack/mac-native/version/0.6.0' }] };
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <MacNativeProduct project={{...mac.item, knownIssues:['Issue described by the publisher'], requirements:[{title:'Publisher requirement'}]}} releases={[next]}/>);
    expect(screen.getByRole('link', { name: /Download 0\.6\.0 on Modrinth/ })).toHaveAttribute('href', next.distribution[0].url);
    expect(screen.getAllByText('1.22').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Known issues' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Publisher requirement' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Installation/ })).toHaveAttribute('href', '#installation');
    cleanup();
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <MacNativeProduct project={{...mac.item, installation:undefined, faq:undefined, media:undefined}} releases={[]}/>);
    expect(screen.queryByRole('heading', { name: 'Installation' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Published releases' })).not.toBeInTheDocument();
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
