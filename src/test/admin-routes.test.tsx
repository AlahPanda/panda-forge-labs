import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
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

afterEach(() => { cleanup(); vi.restoreAllMocks(); sessionStorage.clear(); });

function adminRoute(path: string) {
  return render(<HelmetProvider><ThemeProvider><I18nProvider><MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/admin/editor" element={<AdminGate><AdminEditor /></AdminGate>} />
  </Routes></MemoryRouter></I18nProvider></ThemeProvider></HelmetProvider>);
}

function stubContent() {
  vi.spyOn(adminApi, 'me').mockResolvedValue({ ok: true });
  vi.spyOn(adminApi, 'read').mockImplementation(async (path) => ({ sha: 'verified-sha', content: path.includes('/v2/') ? JSON.stringify({schemaVersion:2,items:[]}) : JSON.stringify(path.includes('modpacks') ? {modpacks:[]} : path.includes('news') ? {articles:[]} : path.includes('faq') ? {categories:[]} : path.includes('reviews') ? {reviews:[]} : {site:{}}) }));
  vi.spyOn(adminApi, 'status').mockResolvedValue({ repo:'AlahPanda/panda-forge-labs', branch:'v2/full-redesign', draftStorageConfigured:true, deployHookConfigured:false });
  vi.spyOn(adminApi, 'draftList').mockResolvedValue({ drafts:[] });
}

describe('owner CMS routes', () => {
  it('edits optional V2 translations in the existing private draft workflow and previews their fallback', async () => {
    const item = projectSchema.parse({ slug: 'mac-native', name: 'Mac Native', summary: 'Resumo original', sourceLocale: 'pt-PT', status: 'beta', releaseSlugs: [] });
    vi.spyOn(adminApi, 'read').mockResolvedValue({ sha: 'verified-sha', content: JSON.stringify({ schemaVersion: 2, items: [item] }) });
    vi.spyOn(adminApi, 'draftList').mockResolvedValue({ drafts: [] });
    const save = vi.spyOn(adminApi, 'draftSave').mockImplementation(async (_kind, _slug, content) => ({ draft: { content, base_sha: 'verified-sha', revision: 1 } }));
    render(<V2Workspace kind="projects"/>);
    fireEvent.click(await screen.findByRole('button', { name: 'Mac Native' }));
    fireEvent.change(screen.getAllByLabelText('Translated name')[1], { target: { value: 'English display name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
    fireEvent.change(screen.getByLabelText('Preview language'), { target: { value: 'en' } });
    const preview = screen.getByRole('article', { name: 'Content preview' });
    expect(within(preview).getByRole('heading', { name: 'English display name' })).toBeInTheDocument();
    expect(within(preview).getByText('Resumo original')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save private draft' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith('projects', 'mac-native', expect.objectContaining({ translations: expect.objectContaining({ en: expect.objectContaining({ state: 'partial', fields: expect.objectContaining({ name: 'English display name' }) }) }) }), 'verified-sha', null));
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
    expect(await screen.findByRole('heading', { name: 'Lab Dashboard' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'projects' }));
    expect(await screen.findByText(/Published in Git · 0/)).toBeInTheDocument();
    expect(adminApi.read).toHaveBeenCalledWith('src/content/v2/projects.json');
  });

  it('signs in at /admin and sends the owner to /admin/editor', async () => {
    stubContent();
    vi.spyOn(adminApi, 'login').mockResolvedValue({ token:'new-session' });
    adminRoute('/admin');
    fireEvent.change(screen.getByLabelText(/password|palavra-passe/i), { target: { value:'a-test-password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in|entrar/i }));
    expect(await screen.findByRole('heading', { name: 'Lab Dashboard' })).toBeInTheDocument();
    expect(adminAuth.getToken()).toBe('new-session');
  });

  it('rechecks a saved session on /admin and exposes login after expiry', async () => {
    adminAuth.setToken('expired-session');
    vi.spyOn(adminApi, 'me').mockImplementation(async () => { adminAuth.clear(); throw new Error('Unauthorized'); });
    adminRoute('/admin');
    await waitFor(() => expect(screen.getByLabelText(/password|palavra-passe/i)).toBeInTheDocument());
    expect(adminAuth.getToken()).toBeNull();
  });

  it('loads the code split owner route on direct navigation while retaining the guard', async () => {
    window.history.replaceState({}, '', '/admin/editor');
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<App/>);
    expect(await screen.findByLabelText(/password|palavra-passe/i)).toBeInTheDocument();
    expect(scroll).toHaveBeenCalled();
    window.history.replaceState({}, '', '/');
  });
});
