import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminApi, adminAuth, classifyAdminError, isPreviewOrigin } from '../lib/adminApi';
import { isPreviewReady, rememberPreviewCommit, pendingPreviewCommit } from '../lib/previewDeployment';

beforeEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('CMS browser transport', () => {
  it('rejects a different origin before sending a password or token', async () => {
    vi.stubEnv('VITE_PREVIEW_ORIGIN', 'https://different-preview.test');
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    expect(isPreviewOrigin()).toBe(false);
    await expect(adminApi.login('test-password')).rejects.toMatchObject({ code: 'origin' });
    expect(fetchMock).not.toHaveBeenCalled();
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
