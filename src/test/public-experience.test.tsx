import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import { HomeExperience, ProjectsExperience, ProjectDetailExperience, LaunchersExperience, LauncherDetailExperience, NewsExperience, ArticleExperience, GuidesExperience, FaqExperience } from '@/pages/PublicExperience';
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
    expect(screen.getByText('v0.3.1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Official modrinth release/i })).toHaveAttribute('href', 'https://modrinth.com/modpack/mac-native/version/0.3.1');
  });

  it('filters reviewed launchers and retains a safe holding page on an old slug', () => {
    const rendered = publicRoute('/launchers', '/launchers', <LaunchersExperience/>);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search launchers' }), { target: { value: 'Prism' } });
    expect(screen.getByRole('heading', { name: 'Prism Launcher' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'MultiMC' })).not.toBeInTheDocument();
    rendered.unmount();
    publicRoute('/launchers/astralrinth', '/launchers/:slug', <LauncherDetailExperience/>);
    expect(screen.getByRole('heading', { name: 'AstralRinth' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
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
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search projects' }), { target: { value: 'craft' } });
    expect(screen.getByRole('heading', { name: 'CraftToons' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mac Native' })).not.toBeInTheDocument();
    expect(screen.queryByText('Soon')).not.toBeInTheDocument();
  });
});
