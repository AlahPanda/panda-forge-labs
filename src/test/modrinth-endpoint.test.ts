import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/modrinth';
import cron from '../../api/sync-modrinth';
import { SNAPSHOT_TTL_MS, type Snapshot } from '@/lib/modrinthSnapshot';
import { parseModrinthPublication } from '@/lib/modrinthProject';
import configuration from '../../vercel.json';

const project = { id: 'verified-id', slug: 'mac-native', title: 'Mac Native', description: 'Official', project_type: 'modpack', status: 'approved', downloads: 40, followers: 7, gallery: [] };
const version = (number: string) => ({ id: 'release-' + number, project_id: project.id, version_number: number, version_type: 'beta', date_published: '2026-09-29T20:02:31Z', game_versions: ['1.21.11'], loaders: ['fabric'], status: 'listed', files: [{ filename: number + '.mrpack', url: 'https://cdn.modrinth.com/data/pack/file.mrpack', primary: true }] });
function response() {
  return { statusCode: 0, setHeader: vi.fn(), body: undefined as unknown, end(text: string) { this.body = JSON.parse(text); } };
}
function transport(stored: Snapshot | null) {
  vi.stubEnv('SUPABASE_URL', 'https://store.test'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'server-test-only');
  const fetcher = vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
    const url = String(input);
    if (url.includes('/rest/v1/')) {
      if (options?.method === 'POST') { stored = JSON.parse(String(options.body)).snapshot; return new Response(null, { status: 204 }); }
      return new Response(JSON.stringify(stored ? [{ snapshot: stored }] : []));
    }
    return new Response(JSON.stringify(url.endsWith('/version') ? [version('0.6.0')] : project));
  });
  vi.stubGlobal('fetch', fetcher);
  return { fetcher, stored: () => stored };
}
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('actual release endpoint and scheduled refresh', () => {
  it('keeps API paths outside SPA fallback and explicitly passes the project slug', () => {
    expect(configuration.rewrites[0]).toEqual({ source: '/api/modrinth/:slug', destination: '/api/modrinth?slug=:slug' });
    const pattern = new RegExp('^' + configuration.rewrites.find((route) => route.destination === '/')!.source + '$');
    expect(pattern.test('/modpacks/mac-native')).toBe(true);
    expect(pattern.test('/api/modrinth/mac-native')).toBe(false);
    expect(pattern.test('/api/sync-modrinth')).toBe(false);
  });
  it('refreshes expired persistent state through the public handler without an editorial change', async () => {
    const old = { fetchedAt: new Date(Date.now() - SNAPSHOT_TTL_MS - 1).toISOString(), project: parseModrinthPublication(project, [version('0.3.1')]) };
    const store = transport(old); const res = response();
    await handler({ method: 'GET', query: { slug: 'mac-native' } } as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ stale: false, persistence: 'available', snapshot: { project: { release: { version: '0.6.0' } } } });
    expect(store.stored()?.project.release.version).toBe('0.6.0');
  });
  it('rejects unauthenticated cron requests without touching storage or upstream', async () => {
    vi.stubEnv('CRON_SECRET', 'test-cron'); const store = transport(null); const res = response();
    await cron({ method: 'GET', headers: {} } as never, res as never);
    expect(res.statusCode).toBe(401); expect(store.fetcher).not.toHaveBeenCalled();
  });
  it('authorized cron bypasses a fresh TTL and reports persisted release diagnostics', async () => {
    vi.stubEnv('CRON_SECRET', 'test-cron');
    transport({ fetchedAt: new Date().toISOString(), project: parseModrinthPublication(project, [version('0.3.1')]) });
    const res = response(); await cron({ method: 'GET', headers: { authorization: 'Bearer test-cron' } } as never, res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({ refreshed: 1, projects: [{ version: '0.6.0', stale: false, persistence: 'available' }] });
  });
});
