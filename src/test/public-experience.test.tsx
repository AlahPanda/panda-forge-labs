import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { HomeExperience, ProjectsExperience, ProjectDetailExperience, LaunchersExperience, LauncherDetailExperience, NewsExperience, ArticleExperience, GuidesExperience, FaqExperience, AboutExperience, SupportExperience, MissingExperience } from '@/pages/PublicExperience';
import { publicArticles } from '@/content/publicResolver';

afterEach(() => { cleanup(); localStorage.removeItem('apl.theme'); });

function publicRoute(path: string, route: string, page: React.ReactElement) {
  return render(<HelmetProvider><ThemeProvider><I18nProvider><MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={page}/></Routes></MemoryRouter></I18nProvider></ThemeProvider></HelmetProvider>);
}

describe('public redesign and editorial boundaries', () => {
  it('shows only real projects on Home without fictitious metrics', () => {
    publicRoute('/', '/', <HomeExperience/>);
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.queryByText('Soon')).not.toBeInTheDocument();
    expect(screen.queryByText(/download count|community rating|benchmark/i)).not.toBeInTheDocument();
  });

  it('keeps the CraftToons URL a versionless teaser', () => {
    publicRoute('/modpacks/crafttoons', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.getByText('In Development', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByText(/download|release|benchmark|review/i)).not.toBeInTheDocument();
  });

  it('keeps the verified Mac Native release and official destination', () => {
    publicRoute('/modpacks/mac-native', '/modpacks/:slug', <ProjectDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(screen.getByText(/v0\.3\.1/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Official modrinth release/i })).toHaveAttribute('href', 'https://modrinth.com/modpack/mac-native/version/0.3.1');
    expect(screen.getByRole('link', { name: /Download 0\.3\.1 on Modrinth/i })).toHaveAttribute('href', 'https://modrinth.com/modpack/mac-native/version/0.3.1');
    for (const heading of ['Mac Native on Mac', 'What Mac Native focuses on', 'Before you install', 'Installation', 'Published releases', 'Mac Native FAQ', 'Help and other projects']) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
    expect(screen.queryByText(/412 MB|8 GB|1\.4\.2|community rating|592 FPS/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Screenshots' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Known issues' })).not.toBeInTheDocument();
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
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
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

  it('provides useful empty states for News, Guides and FAQ', () => {
    const cases = [
      ['/news', <NewsExperience/>, 'No articles published yet'],
      ['/guides', <GuidesExperience/>, 'No guides published yet'],
      ['/faq', <FaqExperience/>, 'No answers published yet'],
    ] as const;
    for (const [path, page, title] of cases) {
      const { unmount } = publicRoute(path, path, page);
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      unmount();
    }
  });

  it('filters the projects collection without adding Soon', () => {
    publicRoute('/projects', '/projects', <ProjectsExperience/>);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search projects' }), { target: { value: 'toons' } });
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mac Native' })).not.toBeInTheDocument();
    expect(screen.queryByText('Soon')).not.toBeInTheDocument();
  });

  it('keeps main routes and the owner CMS entry discoverable', () => {
    publicRoute('/', '/', <HomeExperience/>);
    for (const path of ['/projects','/modpacks','/launchers','/guides','/news','/about','/faq','/support','/modpacks/mac-native','/modpacks/crafttoons','/admin']) {
      expect(screen.getAllByRole('link').some((link) => link.getAttribute('href') === path)).toBe(true);
    }
    cleanup();
    for (const [path, view, title] of [['/about', <AboutExperience/>, 'About AlahPanda Labs'], ['/support', <SupportExperience/>, 'Support'], ['/missing', <MissingExperience/>, 'Page not found']] as const) {
      const { unmount } = publicRoute(path, path, view);
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      unmount();
    }
  });
});
