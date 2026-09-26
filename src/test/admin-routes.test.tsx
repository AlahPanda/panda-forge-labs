import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminGate from '@/pages/admin/AdminGate';
import AdminEditor from '@/pages/admin/AdminEditor';
import { adminApi, adminAuth } from '@/lib/adminApi';

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
});
