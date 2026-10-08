import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { detectBrowserLocale, I18nProvider, useI18n } from '@/lib/i18n';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { localizeItem } from '@/content/v2/localize';
import { guideSchema, projectSchema, parseCollection } from '@/content/v2/schema';
import guides from '@/content/v2/guides.json';
import projects from '@/content/v2/projects.json';
import { readFileSync } from 'node:fs';

function Language() {
  const { locale, preference, setLocale, setPreference } = useI18n();
  return <><output>{preference}:{locale}</output><button onClick={() => setLocale('en')}>English</button><button onClick={() => setPreference('system')}>System</button></>;
}
function Theme() {
  const { preference, theme, setPreference } = useTheme();
  return <><output>{preference}:{theme}</output>{(['system','light','dark'] as const).map(value => <button key={value} onClick={() => setPreference(value)}>{value}</button>)}</>;
}
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function browser(language: string) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue([language]);
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
}
describe('browser language preferences', () => {
  it.each([['en-US','en'],['pt-PT','pt-PT'],['pt-BR','pt-BR'],['es-ES','es'],['de-CH','en']])('defaults %s to %s', (input, expected) => {
    browser(input); render(<I18nProvider><Language/></I18nProvider>);
    expect(screen.getByText('system:'+expected)).toBeInTheDocument();
    expect(localStorage.getItem('apl.locale')).toBeNull();
  });
  it('uses the first supported navigator.languages entry before language', () => {
    expect(detectBrowserLocale(['de-CH','es-ES','pt-BR'],'en')).toBe('es');
    expect(detectBrowserLocale([], 'pt')).toBe('pt-PT');
  });
  it('preserves explicit choices and clears System override', () => {
    browser('pt-PT'); localStorage.setItem('apl.locale','es'); render(<I18nProvider><Language/></I18nProvider>);
    expect(screen.getByText('es:es')).toBeInTheDocument();
    fireEvent.click(screen.getByText('English')); expect(screen.getByText('en:en')).toBeInTheDocument();
    expect(localStorage.getItem('apl.locale')).toBe('en');
    fireEvent.click(screen.getByText('System')); expect(screen.getByText('system:pt-PT')).toBeInTheDocument();
    expect(localStorage.getItem('apl.locale')).toBeNull();
  });
  it('reacts to browser language changes only when System is selected', () => {
    browser('en'); render(<I18nProvider><Language/></I18nProvider>);
    browser('es'); act(() => window.dispatchEvent(new Event('languagechange')));
    expect(screen.getByText('system:es')).toBeInTheDocument();
    fireEvent.click(screen.getByText('English'));
    browser('pt-BR'); act(() => window.dispatchEvent(new Event('languagechange')));
    expect(screen.getByText('en:en')).toBeInTheDocument();
  });
});
describe('theme preferences', () => {
  it.each([false,true])('resolves System with dark=%s and follows OS changes', dark => {
    const media = { matches: dark, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    vi.stubGlobal('matchMedia', () => media);
    render(<ThemeProvider><Theme/></ThemeProvider>);
    expect(screen.getByText('system:'+(dark?'dark':'light'))).toBeInTheDocument();
    expect(localStorage.getItem('apl.theme')).toBeNull();
    media.matches = !dark; act(() => media.addEventListener.mock.calls[0][1]());
    expect(screen.getByText('system:'+(!dark?'dark':'light'))).toBeInTheDocument();
  });
  it.each(['light','dark'])('preserves explicit %s and removes it on System', value => {
    localStorage.setItem('apl.theme',value); render(<ThemeProvider><Theme/></ThemeProvider>);
    expect(screen.getByText(value+':'+value)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'system'})); expect(localStorage.getItem('apl.theme')).toBeNull();
    fireEvent.click(screen.getByRole('button',{name:value})); expect(localStorage.getItem('apl.theme')).toBe(value);
  });
});
describe('0.9.x guide and editorial localization', () => {
  it('validates both collections without dropping entries', () => {
    expect(parseCollection('guides',guides).items).toHaveLength(guides.items.length);
    expect(parseCollection('projects',projects).items).toHaveLength(projects.items.length);
  });
  it.each(['en','pt-PT','pt-BR','es'] as const)('has generation, VSync, Java and shader guidance in %s', locale => {
    const guide = localizeItem(guideSchema.parse(guides.items[0]),locale);
    expect(guide.body).toContain('0.9.x'); expect(guide.body).toContain('VSync'); expect(guide.body).toContain('Beryl'); expect(guide.body).toContain('Custom Java arguments');
    expect(guide.body).not.toMatch(/0\.3\.1|0\.9\.1|-Xmx|-XX:/);
    expect(guide.body!.split('## ').length).toBeGreaterThanOrEqual(11);
  });
  it('English project content does not unnecessarily retain Portuguese copy', () => {
    const project = localizeItem(projectSchema.parse(projects.items[0]),'en');
    expect(project.summary).toContain('Minecraft modpack for macOS');
    expect(project.installation).toContain('Open the official');
    expect(project.faq[0].question).toBe('Which Macs does it address?');
  });
  it('selector binds language and theme preference, not their resolved values', () => {
    const source = readFileSync('src/components/layout/SiteHeader.tsx','utf8');
    expect(source).toContain('value={languagePreference}'); expect(source).toContain('value={preference}');
  });
});
