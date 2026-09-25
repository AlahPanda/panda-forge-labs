import { beforeEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';

type Handler = (request: Request) => Promise<Response>;
let handler: Handler;
let requests: Array<{ url: string; method: string; body?: string }>;
let stored: Record<string, unknown> | null;
const sha = 'a'.repeat(40);
const item = { slug: 'example', name: 'Example', sourceLocale: 'pt-PT', translations: {}, status: 'development', releaseSlugs: [] };
const collection = { schemaVersion: 2, items: [] };
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

beforeEach(async () => {
  vi.resetModules();
  requests = []; stored = null;
  vi.stubGlobal('crypto', webcrypto);
  vi.stubGlobal('Deno', {
    env: { get: (key: string) => ({ ADMIN_ORIGIN: 'https://preview.example', ADMIN_PASSWORD: 'test-password', ADMIN_JWT_SECRET: 'test-secret',
      GITHUB_TOKEN: 'server-only', GITHUB_REPO: 'AlahPanda/panda-forge-labs', GITHUB_BRANCH: 'v2/security-foundation',
      SUPABASE_URL: 'https://supabase.example', SUPABASE_SERVICE_ROLE_KEY: 'private-key' } as Record<string, string>)[key] },
    serve: (fn: Handler) => { handler = fn; },
  });
  vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method || 'GET';
    requests.push({ url, method, body: typeof init?.body === 'string' ? init.body : undefined });
    if (url.includes('/rest/v1/cms_drafts')) {
      if (method === 'GET') return response(stored ? [stored] : []);
      if (method === 'POST') { stored = { ...(JSON.parse(String(init?.body)) as object), revision: 1 }; return response([stored], 201); }
      if (method === 'DELETE') { const old = stored; stored = null; return response(old ? [old] : []); }
    }
    if (url.endsWith('/user')) return response({ login: 'owner' });
    if (url.endsWith('/repos/AlahPanda/panda-forge-labs')) return response({});
    if (url.includes('/contents/src/content/v2/projects.json')) {
      if (method === 'PUT') return response({ content: { sha: 'b'.repeat(40), html_url: 'https://github.example/commit' } });
      return response({ sha, content: btoa(JSON.stringify(collection)) });
    }
    throw new Error(`Unexpected request ${method} ${url}`);
  }));
  await import('../../supabase/functions/admin-cms/index.ts');
});

const post = (action: string, body: unknown, token?: string) => handler(new Request(`https://supabase.example/functions/v1/admin-cms/${action}`, {
  method: 'POST', headers: { Origin: 'https://preview.example', 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
}));
const login = async () => ((await (await post('login', { password: 'test-password' })).json()) as { token: string }).token;

describe('authenticated draft → publish route', () => {
  it('rejects unauthenticated writes before accessing storage', async () => {
    expect((await post('draft-save', { kind: 'projects', slug: 'example', item })).status).toBe(401);
    expect(requests).toHaveLength(0);
  });
  it('stores a draft privately, then publishes only the validated item to the configured branch', async () => {
    const token = await login();
    const draft = await post('draft-save', { kind: 'projects', slug: 'example', item, baseSha: sha, revision: null }, token);
    expect(draft.status).toBe(200);
    expect(requests.filter((r) => r.method === 'PUT')).toHaveLength(0);
    expect(requests.some((r) => r.url.includes('/rest/v1/cms_drafts') && r.method === 'POST')).toBe(true);
    const published = await post('draft-publish', { kind: 'projects', slug: 'example', revision: 1 }, token);
    expect(published.status).toBe(200);
    const put = requests.find((r) => r.method === 'PUT');
    expect(put).toBeDefined();
    const payload = JSON.parse(put?.body || '{}');
    expect(payload.branch).toBe('v2/security-foundation');
    expect(JSON.parse(atob(payload.content)).items).toMatchObject([{ slug: 'example', status: 'development' }]);
    expect(requests.some((r) => r.url.includes('/rest/v1/cms_drafts') && r.method === 'DELETE')).toBe(true);
  });
  it('rejects a draft based on an outdated Git SHA', async () => {
    const token = await login();
    stored = { kind: 'projects', slug: 'example', content: item, base_sha: 'c'.repeat(40), revision: 1 };
    const result = await post('draft-publish', { kind: 'projects', slug: 'example', revision: 1 }, token);
    expect(result.status).toBe(409);
    expect(requests.some((r) => r.method === 'PUT')).toBe(false);
  });
});
