import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminApi, adminAuth } from '../lib/adminApi';

beforeEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('CMS browser transport', () => {
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
