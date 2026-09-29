import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminGate from '@/pages/admin/AdminGate';
import AdminEditor from '@/pages/admin/AdminEditor';
import { adminApi, adminAuth } from '@/lib/adminApi';
import App from '@/App';
import V2Workspace from '@/pages/admin/V2Workspace';
import { projectSchema } from '@/content/v2/schema';

beforeEach(() => localStorage.setItem('apl.locale', 'en'));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear(); localStorage.removeItem('apl.locale'); });

function adminRoute(path: string) {
  return render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><HelmetProvider><ThemeProvider><I18nProvider><MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/admin/editor/*" element={<AdminGate><AdminEditor /></AdminGate>} />
  </Routes></MemoryRouter></I18nProvider></ThemeProvider></HelmetProvider></QueryClientProvider>);
}

function stubContent() {
  vi.spyOn(adminApi, 'me').mockResolvedValue({ ok: true });
  vi.spyOn(adminApi, 'read').mockImplementation(async (path) => ({ sha: 'verified-sha', content: path.includes('/v2/') ? JSON.stringify({schemaVersion:2,items:[]}) : JSON.stringify(path.includes('modpacks') ? {modpacks:[]} : path.includes('news') ? {articles:[]} : path.includes('faq') ? {categories:[]} : path.includes('reviews') ? {reviews:[]} : {site:{}}) }));
  vi.spyOn(adminApi, 'status').mockResolvedValue({ repo:'AlahPanda/panda-forge-labs', branch:'v2/full-redesign', githubAccess:true, draftStorageConfigured:true, deployHookConfigured:false });
  vi.spyOn(adminApi, 'draftList').mockResolvedValue({ drafts:[] });
}

describe('owner CMS routes', () => {
  it('validates a new Modrinth project, previews facts and saves through the existing private draft API', async () => {
    vi.spyOn(adminApi,'read').mockResolvedValue({sha:'verified-sha',content:JSON.stringify({schemaVersion:2,items:[]})});
    vi.spyOn(adminApi,'draftList').mockResolvedValue({drafts:[]});
    vi.spyOn(adminApi,'modrinthLookup').mockResolvedValue({project:{id:'new-id',slug:'new-pack',name:'New Pack',summary:'Publisher summary',downloads:4,followers:2,gallery:[],projectUrl:'https://modrinth.com/modpack/new-pack',release:{id:'release-id',version:'1.0.0',channel:'stable',publishedAt:'2026-09-29T00:00:00Z',minecraft:['1.21.11'],loaders:['fabric'],changelog:'Published',url:'https://modrinth.com/modpack/new-pack/version/release-id',files:[]}}});
    const save=vi.spyOn(adminApi,'draftSave').mockImplementation(async (_kind,_slug,content)=>({draft:{content,base_sha:'verified-sha',revision:1}}));
    render(<I18nProvider><MemoryRouter><V2Workspace kind="projects" publishAllowed/></MemoryRouter></I18nProvider>);
    fireEvent.change(await screen.findByLabelText('Official URL or slug'),{target:{value:'https://modrinth.com/modpack/new-pack'}});
    fireEvent.click(screen.getByRole('button',{name:'Check official publication'}));
    expect(await screen.findByText(/new-pack · 1.0.0/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Review as private draft'}));
    expect(screen.getByLabelText('Project page template')).toHaveValue('premium');
    fireEvent.click(screen.getByRole('button',{name:'Save private draft'}));
    await waitFor(()=>expect(save).toHaveBeenCalledWith('projects','new-pack',expect.objectContaining({upstream:{provider:'modrinth',projectId:'new-id',projectSlug:'new-pack'},pageTemplate:'premium'}),'verified-sha',null));
  });
  it('creates a new article through the V2 private draft workflow', async () => {
    vi.spyOn(adminApi, 'read').mockResolvedValue({ sha: 'verified-sha', content: JSON.stringify({schemaVersion:2,items:[]}) });
    vi.spyOn(adminApi, 'draftList').mockResolvedValue({drafts:[]});
    const save = vi.spyOn(adminApi, 'draftSave').mockImplementation(async (_kind,_slug,content) => ({draft:{content,base_sha:'verified-sha',revision:1}}));
    render(<I18nProvider><MemoryRouter initialEntries={['/admin/editor/articles']}><V2Workspace kind="articles" publishAllowed/></MemoryRouter></I18nProvider>);
    fireEvent.click(await screen.findByRole('button',{name:'New private draft'}));
    expect(screen.getByText('New draft',{selector:'span'})).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Name'),{target:{value:'Owner article'}});
    fireEvent.change(screen.getByLabelText('Slug'),{target:{value:'owner-article'}});
    fireEvent.change(screen.getByLabelText('Body (Markdown)'),{target:{value:'Owner authored text'}});
    fireEvent.click(screen.getByRole('button',{name:'Save private draft'}));
    await waitFor(() => expect(save).toHaveBeenCalledWith('articles','owner-article',expect.objectContaining({body:'Owner authored text'}),'verified-sha',null));
  });

  it('includes private pending translations in the locale review queue', async () => {
    adminAuth.setToken('test-session'); stubContent();
    const faq = {slug:'general',name:'General',sourceLocale:'en',items:[{id:'account',question:'An account?',answer:'Official answer'}],translations:{es:{state:'needs-review',fields:{},structured:{items:{account:{answer:'Pendiente de revisión'}}}}}};
    vi.mocked(adminApi.draftList).mockResolvedValue({drafts:[{kind:'faq',slug:'general',revision:1,updated_at:'2026-09-27T12:00:00Z'}]});
    vi.spyOn(adminApi,'draftRead').mockResolvedValue({draft:{content:faq,base_sha:'verified-sha',revision:1}});
    adminRoute('/admin/editor/locales');
    expect(await screen.findByRole('heading',{name:'Translations'})).toBeInTheDocument();
    fireEvent.change(within(screen.getByRole('main')).getByLabelText('Language'),{target:{value:'es'}});
    fireEvent.change(within(screen.getByRole('main')).getByLabelText('Filter by status'),{target:{value:'needs-review'}});
    const row = (await screen.findByText('General')).closest('tr');
    expect(row).not.toBeNull();
    expect(within(row!).getByText('Needs review')).toBeInTheDocument();
    expect(within(row!).getByText(/Private draft/)).toBeInTheDocument();
    expect(within(row!).getByRole('link',{name:'Edit'})).toHaveAttribute('href','/admin/editor/faq?entry=general&locale=es');
  });

  it('edits optional V2 translations in the existing private draft workflow and previews their fallback', async () => {
    const item = projectSchema.parse({ slug: 'mac-native', name: 'Mac Native', summary: 'Resumo original', sourceLocale: 'pt-PT', status: 'beta', releaseSlugs: [] });
    vi.spyOn(adminApi, 'read').mockResolvedValue({ sha: 'verified-sha', content: JSON.stringify({ schemaVersion: 2, items: [item] }) });
    vi.spyOn(adminApi, 'draftList').mockResolvedValue({ drafts: [] });
    const save = vi.spyOn(adminApi, 'draftSave').mockImplementation(async (_kind, _slug, content) => ({ draft: { content, base_sha: 'verified-sha', revision: 1 } }));
    render(<I18nProvider><MemoryRouter><V2Workspace kind="projects"/></MemoryRouter></I18nProvider>);
    fireEvent.click(await screen.findByRole('button', { name: /Mac Native.*mac-native/ }));
    fireEvent.click(screen.getByRole('tab', { name: 'Translations' }));
    fireEvent.change(screen.getByLabelText('Short description · en'), { target: { value: 'English summary' } });
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    fireEvent.change(screen.getByLabelText('Preview language'), { target: { value: 'en' } });
    const preview = screen.getByRole('article', { name: 'Private preview' });
    expect(within(preview).getByRole('heading', { name: 'Mac Native' })).toBeInTheDocument();
    expect(within(preview).getByText('English summary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save private draft' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith('projects', 'mac-native', expect.objectContaining({ translations: expect.objectContaining({ en: expect.objectContaining({ state: 'partial', fields: expect.objectContaining({ summary: 'English summary' }) }) }) }), 'verified-sha', null));
  });
  it('redirects a direct unauthenticated editor visit to the existing login', async () => {
    const check = vi.spyOn(adminApi, 'me');
    adminRoute('/admin/editor');
    expect(await screen.findByLabelText(/password|palavra-passe/i)).toBeInTheDocument();
    expect(check).not.toHaveBeenCalled();
  });

  it('verifies an existing session before mounting the CMS and loads V2 content', async () => {
    adminAuth.setToken('existing-session');
    stubContent();
    adminRoute('/admin/editor');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('complementary', { name: 'Owner Control Panel' })).getByRole('link', { name: 'Modpacks' }));
    expect(await screen.findByText(/Published entries · 0/)).toBeInTheDocument();
    expect(adminApi.read).toHaveBeenCalledWith('src/content/v2/projects.json');
    expect(vi.mocked(adminApi.read).mock.calls.every(([file]) => file.includes('/v2/'))).toBe(true);
  });

  it('signs in at /admin and sends the owner to /admin/editor', async () => {
    stubContent();
    vi.spyOn(adminApi, 'login').mockResolvedValue({ token:'new-session' });
    adminRoute('/admin');
    fireEvent.change(screen.getByLabelText(/password|palavra-passe/i), { target: { value:'a-test-password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in|entrar/i }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(adminAuth.getToken()).toBe('new-session');
  });

  it('does not disable the owner login on a different explicitly Edge-authorized Preview alias', async () => {
    vi.stubEnv('VITE_PREVIEW_ORIGIN', 'https://preferred-preview.test');
    stubContent();
    const login = vi.spyOn(adminApi, 'login').mockResolvedValue({ token:'authorized-preview-session' });
    adminRoute('/admin');
    const submit = screen.getByRole('button', { name: /sign in|entrar/i });
    expect(submit).toBeEnabled();
    fireEvent.change(screen.getByLabelText(/password|palavra-passe/i), { target: { value:'test-password' } });
    fireEvent.click(submit);
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('test-password');
    vi.unstubAllEnvs();
  });

  it('rechecks a saved session on /admin and exposes login after expiry', async () => {
    adminAuth.setToken('expired-session');
    vi.spyOn(adminApi, 'me').mockImplementation(async () => { adminAuth.clear(); throw new Error('Unauthorized'); });
    adminRoute('/admin');
    await waitFor(() => expect(screen.getByLabelText(/password|palavra-passe/i)).toBeInTheDocument());
    expect(adminAuth.getToken()).toBeNull();
  });

  it('loads the code split owner route on direct navigation while retaining the guard', async () => {
    window.history.replaceState({}, '', '/admin/editor/faq');
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App/>);
    expect(await screen.findByLabelText(/password|palavra-passe/i)).toBeInTheDocument();
    expect(scroll).toHaveBeenCalled();
    window.history.replaceState({}, '', '/');
  });

  it('protects a direct deep link to the FAQ editor', async () => {
    const read = vi.spyOn(adminApi, 'read');
    adminRoute('/admin/editor/faq?entry=general');
    expect(await screen.findByLabelText(/password|palavra-passe/i)).toBeInTheDocument();
    expect(read).not.toHaveBeenCalled();
  });

  it('opens the private FAQ editor from its dedicated URL and never loads historical files', async () => {
    adminAuth.setToken('test-session');
    stubContent();
    const faq = {slug:'general',name:'General',sourceLocale:'en',items:[{id:'account',question:'A question?',answer:'An answer.'}]};
    vi.mocked(adminApi.read).mockImplementation(async (file) => ({sha:'faq-sha',content:JSON.stringify({schemaVersion:2,items:file.endsWith('faq.json')?[faq]:[]})}));
    adminRoute('/admin/editor/faq?entry=general');
    expect(await screen.findByRole('heading',{name:'General'})).toBeInTheDocument();
    expect(screen.getByRole('tab',{name:'Main content'})).toBeInTheDocument();
    expect(vi.mocked(adminApi.read).mock.calls.every(([file])=>file.includes('/v2/'))).toBe(true);
  });

  it('keeps the historical view read only and isolated from Content V2 publishing', async () => {
    adminAuth.setToken('test-session'); stubContent();
    const write = vi.spyOn(adminApi,'save');
    adminRoute('/admin/editor/advanced/legacy');
    expect(await screen.findByText(/Historical content. Not currently used/)).toBeInTheDocument();
    await waitFor(() => expect(adminApi.read).toHaveBeenCalledWith('src/content/faq.json'));
    expect(write).not.toHaveBeenCalled();
    expect(screen.queryByRole('button',{name:/Save|Publish/i})).not.toBeInTheDocument();
  });

  it('shows unknown system status when no deployment API is available', async () => {
    adminAuth.setToken('test-session'); stubContent();
    vi.mocked(adminApi.status).mockRejectedValue(new Error('Unavailable'));
    adminRoute('/admin/editor/deployments');
    expect(await screen.findByRole('heading',{name:'Deployments'})).toBeInTheDocument();
    expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0);
    expect(screen.queryByText('12 min ago')).not.toBeInTheDocument();
  });

  it('opens and closes the keyboard accessible sidebar on tablet', async () => {
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches:true,addEventListener:(_event:string,listener:()=>void)=>listeners.add(listener),removeEventListener:(_event:string,listener:()=>void)=>listeners.delete(listener)})));
    adminAuth.setToken('test-session'); stubContent();
    adminRoute('/admin/editor');
    expect(await screen.findByRole('heading',{name:'Dashboard'})).toBeInTheDocument();
    expect(screen.queryByRole('complementary',{name:'Owner Control Panel'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Open menu'}));
    expect(screen.getByRole('complementary',{name:'Owner Control Panel'})).toBeInTheDocument();
    fireEvent.keyDown(document,{key:'Escape'});
    expect(screen.queryByRole('complementary',{name:'Owner Control Panel'})).not.toBeInTheDocument();
  });
});
