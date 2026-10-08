import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adminApi, adminAuth, classifyAdminError } from '../lib/adminApi';
import { adminConfiguration } from '../lib/adminConfiguration';
import { isPreviewReady, rememberPreviewCommit, pendingPreviewCommit } from '../lib/previewDeployment';

beforeEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

afterEach(() => vi.unstubAllEnvs());

describe('CMS browser transport', () => {
  it('lets the Edge decide when the current Preview differs from the preferred alias', async () => {
    vi.stubEnv('VITE_PREVIEW_ORIGIN', 'https://different-preview.test');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'test-session' }) });
    vi.stubGlobal('fetch', fetchMock);
    expect(await adminApi.login('test-password')).toEqual({ token: 'test-session' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
  it('classifies API failures independently', () => {
    expect(classifyAdminError(403,'Forbidden origin','login',false)).toBe('origin');
    expect(classifyAdminError(401,'Invalid password','login',false)).toBe('invalid-password');
    expect(classifyAdminError(500,'Server not configured','login',false)).toBe('missing-config');
    expect(classifyAdminError(401,'Unauthorized','me',true)).toBe('session-invalid');
    expect(classifyAdminError(503,'GitHub access is unavailable','read',true)).toBe('github-config');
  });
  it('reports network failure separately without exposing credentials', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(adminApi.login('secret-test')).rejects.toMatchObject({ code: 'network' });
  });
  it('waits for a matching Preview build SHA rather than treating a commit as deployed', async () => {
    const commit = { sha:'a'.repeat(40), branch:'v2/full-redesign', kind:'faq', slug:'general' };
    rememberPreviewCommit(commit);
    expect(pendingPreviewCommit()).toEqual(commit);
    const fetchMock = vi.fn().mockResolvedValue({ok:true,headers:new Headers({'content-type':'application/json'}),json:async()=>({branch:'v2/full-redesign',sha:'b'.repeat(40)})});
    vi.stubGlobal('fetch',fetchMock);
    expect(await isPreviewReady(commit)).toBe(false);
    fetchMock.mockResolvedValue({ok:true,headers:new Headers({'content-type':'application/json'}),json:async()=>({branch:'v2/full-redesign',sha:commit.sha})});
    expect(await isPreviewReady(commit)).toBe(true);
  });
  it('can verify the current Preview build when the optional preferred alias is absent', async () => {
    vi.stubEnv('VITE_PREVIEW_ORIGIN', '');
    const commit = { sha:'a'.repeat(40), branch:'v2/full-redesign', kind:'faq', slug:'general' };
    const fetchMock = vi.fn().mockResolvedValue({ok:true,headers:new Headers({'content-type':'application/json'}),json:async()=>({branch:commit.branch,sha:commit.sha})});
    vi.stubGlobal('fetch',fetchMock);
    expect(await isPreviewReady(commit)).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(`${window.location.origin}/preview-build.json`,{cache:'no-store'});
    vi.unstubAllEnvs();
  });
  it('sends writes only to the authenticated Edge Function', async () => {
    adminAuth.setToken('session-jwt');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, sha: 'new', url: 'https://example.test' }) });
    vi.stubGlobal('fetch', fetchMock);
    await adminApi.save('src/content/news.json', '{"articles":[]}', 'old', 'update');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/functions/v1/admin-cms/save');
    expect(url).not.toContain('api.github.com');
    expect(options.headers.Authorization).toBe('Bearer session-jwt');
    expect(JSON.parse(options.body)).toMatchObject({ sha: 'old', path: 'src/content/news.json' });
  });
  it('refuses writes without a session and clears an expired token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) });
    vi.stubGlobal('fetch', fetchMock);
    await expect(adminApi.redeploy()).rejects.toThrow('Not authenticated');
    expect(fetchMock).not.toHaveBeenCalled();
    adminAuth.setToken('expired');
    await expect(adminApi.me()).rejects.toThrow('Unauthorized');
    expect(adminAuth.getToken()).toBeNull();
  });
});


describe('CMS public configuration', () => {
  it('fails explicitly before login network calls if VITE configuration is absent', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', ''); vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(adminApi.login('invalid-test')).rejects.toMatchObject({ code: 'missing-config' });
    expect(adminConfiguration().status).toEqual({ VITE_SUPABASE_URL: 'missing', VITE_SUPABASE_PUBLISHABLE_KEY: 'missing' });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('normalizes a valid trailing slash and reaches the configured Edge; bad credentials still fail', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://intended.supabase.co/'); vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'public-test-key');
    const request = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => ({ ok: false, status: 401, json: async () => ({ error: 'Invalid password' }) })); vi.stubGlobal('fetch', request);
    await expect(adminApi.login('invalid-test')).rejects.toMatchObject({ code: 'invalid-password' });
    expect(request.mock.calls[0][0]).toBe('https://intended.supabase.co/functions/v1/admin-cms/login');
  });
  it('rejects insecure or credential-bearing configuration', () => {
    for (const url of ['http://project.supabase.co', 'https://user:pass@project.supabase.co', 'https://project.supabase.co/other']) expect(adminConfiguration(url, 'public-key').ready).toBe(false);
  });
});
