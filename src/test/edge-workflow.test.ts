import { beforeEach, describe, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { allowedAdminOrigins, originAllowed } from '../../supabase/functions/admin-cms/origins';

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
      GITHUB_TOKEN: 'server-only', GITHUB_REPO: 'AlahPanda/panda-forge-labs', GITHUB_BRANCH: 'v2/full-redesign',
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
      if (method === 'PUT') return response({ content: { sha: 'b'.repeat(40), html_url: 'https://github.example/file' }, commit: {sha:'d'.repeat(40),html_url:'https://github.example/commit'} });
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
  it('accepts only exact, explicitly configured HTTPS Preview origins', () => {
    const allowed = allowedAdminOrigins('https://preview.example, https://deployment.example', undefined);
    expect(allowed).toEqual(['https://preview.example','https://deployment.example']);
    expect(originAllowed('https://deployment.example', allowed!)).toBe(true);
    expect(originAllowed('https://other.example', allowed!)).toBe(false);
    for (const input of ['*','https://*.vercel.app','http://preview.example','https://preview.example/path','https://preview.example/','https://preview.example, *']) expect(allowedAdminOrigins(input,undefined)).toBeNull();
  });
  it('serves a second allowed origin with its own exact CORS header and refuses other origins', async () => {
    vi.resetModules();
    vi.stubGlobal('Deno', { env: { get: (key: string) => ({ ADMIN_ORIGINS: 'https://preview.example,https://deployment.example', ADMIN_JWT_SECRET: 'test-secret', ADMIN_PASSWORD:'test-password' } as Record<string,string>)[key] }, serve: (fn: Handler) => { handler = fn; } });
    await import('../../supabase/functions/admin-cms/index.ts');
    const options = await handler(new Request('https://supabase.example/functions/v1/admin-cms/login', {method:'OPTIONS',headers:{Origin:'https://deployment.example'}}));
    expect(options.headers.get('Access-Control-Allow-Origin')).toBe('https://deployment.example');
    expect(options.headers.get('Vary')).toBe('Origin');
    const accepted = await handler(new Request('https://supabase.example/functions/v1/admin-cms/login', {method:'POST',headers:{Origin:'https://deployment.example','Content-Type':'application/json'},body:JSON.stringify({password:'test-password'})}));
    expect(accepted.status).toBe(200);
    expect(accepted.headers.get('Access-Control-Allow-Origin')).toBe('https://deployment.example');
    const refused = await handler(new Request('https://supabase.example/functions/v1/admin-cms/login', {method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({password:'test-password'})}));
    expect(refused.status).toBe(403);
    expect(refused.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(await refused.json()).toEqual({error:'Forbidden origin',receivedOrigin:'https://other.example',expectedOrigins:['https://preview.example','https://deployment.example']});
    const missing = await handler(new Request('https://supabase.example/functions/v1/admin-cms/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'test-password'})}));
    expect(missing.status).toBe(403);
    expect(missing.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
  it('rejects a foreign origin before processing login', async () => {
    const r = await handler(new Request('https://supabase.example/functions/v1/admin-cms/login', {method:'POST',headers:{Origin:'https://ephemeral.example','Content-Type':'application/json'},body:JSON.stringify({password:'test-password'})}));
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({error:'Forbidden origin',receivedOrigin:'https://ephemeral.example',expectedOrigins:['https://preview.example']});
    expect(requests).toHaveLength(0);
  });
  it('fails closed when the owner password is absent instead of using a default', async () => {
    vi.resetModules();
    vi.stubGlobal('Deno', { env: { get: (key: string) => key === 'ADMIN_PASSWORD' ? undefined : ({ ADMIN_ORIGIN: 'https://preview.example', ADMIN_JWT_SECRET: 'test-secret' } as Record<string, string>)[key] }, serve: (fn: Handler) => { handler = fn; } });
    await import('../../supabase/functions/admin-cms/index.ts');
    const result = await post('login', { password: 'anything' });
    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Server not configured' });
    expect(requests).toHaveLength(0);
  });

  it('accepts only the configured server-side password', async () => {
    const denied = await post('login', { password: 'wrong' });
    expect(denied.status).toBe(401);
    const accepted = await post('login', { password: 'test-password' });
    expect(accepted.status).toBe(200);
    expect(typeof (await accepted.json()).token).toBe('string');
    expect(requests).toHaveLength(0);
  });
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
    expect(payload.branch).toBe('v2/full-redesign');
    expect(await published.json()).toMatchObject({branch:'v2/full-redesign',commitSha:'d'.repeat(40),commitUrl:'https://github.example/commit'});
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
