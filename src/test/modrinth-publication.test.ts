import { describe, expect, it, vi } from 'vitest';
import { parseModrinthPublication, parseModrinthReference } from '@/lib/modrinthProject';
import { resolveSnapshot, SNAPSHOT_TTL_MS, type Snapshot, type SnapshotStore } from '@/lib/modrinthSnapshot';
import { supporterUrl, resolveSupporterConfiguration } from '@/components/experience/SupporterDownload';
import { connectedProject } from '../../api/_modrinth';
import { duplicateModrinthConnection } from '@/lib/projectConnections';
import { officialReleaseDestination } from '../../api/download/[slug]';

const project = { id:'A1b2C3d4', slug:'mac-native', title:'Mac Native', description:'Official description', project_type:'modpack', status:'approved', icon_url:null, downloads:147, followers:23, gallery:Array.from({length:10},(_,i)=>({url:`https://cdn.modrinth.com/data/a/${i}.png`, title:`Image ${i}`})) };
const version = (number:string, date:string) => ({ id:`release-${number}`, project_id:project.id, version_number:number, version_type:'beta', date_published:date, game_versions:['1.21.11'], loaders:['fabric'], changelog:`Release ${number}`, files:[{filename:`${number}.mrpack`,url:'https://cdn.modrinth.com/data/a/file.mrpack',primary:true}],status:'listed' });
const versions = [version('0.3.1','2026-01-01T00:00:00Z'),version('0.6.0','2026-09-29T00:00:00Z')];
const fetcher = vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).endsWith('/version') ? versions : project), { status:200 }));

describe('official Modrinth publication', () => {
  it('accepts only the official project URL or an ID/slug', () => {
    expect(parseModrinthReference('https://modrinth.com/modpack/mac-native')).toBe('mac-native');
    expect(parseModrinthReference('A1b2C3d4')).toBe('A1b2C3d4');
    for (const bad of ['http://modrinth.com/modpack/mac-native','https://evil.example/modpack/mac-native','https://modrinth.com/modpack/mac-native?next=evil','https://modrinth.com/mod/mac-native']) expect(() => parseModrinthReference(bad)).toThrow();
  });
  it('selects the newest published release and all ten gallery images, without inventing counts', () => {
    const result = parseModrinthPublication(project, versions);
    expect(result.release.version).toBe('0.6.0');
    expect(result.release.url).toBe('https://modrinth.com/modpack/mac-native/version/release-0.6.0');
    expect(result.release.minecraft).toEqual(['1.21.11']);
    expect(result.gallery).toHaveLength(10);
    expect(result.downloads).toBe(147);
    expect(() => parseModrinthPublication({...project,downloads:undefined},versions)).toThrow();
    expect(() => parseModrinthPublication({...project,gallery:[{url:'https://evil.example/a.png'}]},versions)).toThrow();
  });
  it('retains last-known-good when upstream fails or returns conflicting identity', async () => {
    let saved: Snapshot | null = null;
    const store: SnapshotStore = { read:async()=>saved, write:async(_,next)=>{saved=next;} };
    const initial = await resolveSnapshot({projectSlug:'mac-native',projectId:project.id},store,false,fetcher as unknown as typeof fetch,1000000000000);
    expect(initial.snapshot.project.release.version).toBe('0.6.0');
    const fail = vi.fn(async()=>new Response('offline',{status:503}));
    const stale = await resolveSnapshot({projectSlug:'mac-native',projectId:project.id},store,false,fail as unknown as typeof fetch,1000000000000 + SNAPSHOT_TTL_MS + 1);
    expect(stale.stale).toBe(true);
    expect(stale.snapshot.project.release.version).toBe('0.6.0');
    expect(stale.snapshot.project.downloads).toBe(147);
    expect(stale.snapshot.project.followers).toBe(23);
    expect(saved?.project.downloads).toBe(147);
    expect(saved?.project.followers).toBe(23);
    expect(saved?.project.release.version).toBe('0.6.0');
    await expect(resolveSnapshot({projectSlug:'mac-native',projectId:'other'},store,true,fail as unknown as typeof fetch)).rejects.toThrow();
  });
  it('uses only connected, published V2 projects and no arbitrary CMS draft', () => {
    expect(connectedProject('mac-native')?.upstream?.provider).toBe('modrinth');
    expect(connectedProject('crafttoons')).toBeUndefined();
    expect(connectedProject('made-up')).toBeUndefined();
  });
  it('refuses duplicate upstream IDs even with a different local slug',()=>{
    const existing=[{upstream:{provider:'modrinth',projectId:'same-id',projectSlug:'old-slug'}}];
    expect(duplicateModrinthConnection({provider:'modrinth',projectId:'same-id',projectSlug:'new-slug'},existing)).toBe(true);
    expect(duplicateModrinthConnection({provider:'modrinth',projectId:'different-id',projectSlug:'new-slug'},existing)).toBe(false);
  });
  it('never forces the supporter destination', () => {
    expect(supporterUrl({enabled:false,url:'https://example.org'})).toBeUndefined();
    expect(supporterUrl({enabled:true,url:'http://example.org'})).toBeUndefined();
    expect(supporterUrl({enabled:true,url:'https://example.org'})).toBe('https://example.org/');
    expect(resolveSupporterConfiguration(undefined,{enabled:true,url:'https://global.example'} )?.url).toBe('https://global.example');
    expect(resolveSupporterConfiguration({enabled:false},{enabled:true,url:'https://global.example'} )?.enabled).toBe(false);
    expect(resolveSupporterConfiguration({enabled:true,url:'https://project.example'},{enabled:true,url:'https://global.example'} )?.url).toBe('https://project.example');
  });
  it('keeps the download resolver on this project’s official Modrinth release',()=>{
    expect(officialReleaseDestination('mac-native','https://modrinth.com/modpack/mac-native/version/new-id')).toBe('https://modrinth.com/modpack/mac-native/version/new-id');
    for(const bad of ['https://evil.example/modpack/mac-native/version/id','https://modrinth.com.evil.example/modpack/mac-native/version/id','http://modrinth.com/modpack/mac-native/version/id','https://modrinth.com/modpack/other/version/id']) expect(officialReleaseDestination('mac-native',bad)).toBe('https://modrinth.com/modpack/mac-native');
  });
});

describe('release refresh recovery', () => {
  const connection = { projectSlug: 'mac-native', projectId: project.id };
  const now = Date.parse('2026-10-06T12:00:00Z');
  const old = (): Snapshot => ({ fetchedAt: new Date(now - SNAPSHOT_TTL_MS - 1).toISOString(), project: parseModrinthPublication(project, [versions[0]]) });
  it('orders releases by publication date, not by lexical or semantic version', () => {
    const future = version('0.10.0', '2026-10-07T00:00:00Z');
    expect(parseModrinthPublication(project, [...versions, future]).release.version).toBe('0.10.0');
    expect(parseModrinthPublication(project, [version('9.0.0', '2026-01-01T00:00:00Z'), future]).release.version).toBe('0.10.0');
  });
  it('refreshes an expired snapshot and a future release without any editorial releaseSlug', async () => {
    const write = vi.fn();
    const result = await resolveSnapshot(connection, { read: async () => old(), write }, false, fetcher as typeof fetch, now);
    expect(result.snapshot.project.release.version).toBe('0.6.0');
    expect(write).toHaveBeenCalledOnce();
    const futureFetcher = vi.fn(async (url) => new Response(JSON.stringify(String(url).endsWith('/version') ? [version('0.7.0', '2026-10-07T00:00:00Z')] : project)));
    expect((await resolveSnapshot(connection, null, false, futureFetcher as typeof fetch, now)).snapshot.project.release.version).toBe('0.7.0');
  });
  it('survives a snapshot read failure and resumes persistence on a successful write', async () => {
    const write = vi.fn();
    const result = await resolveSnapshot(connection, { read: async () => { throw new Error('store offline'); }, write }, false, fetcher as typeof fetch, now);
    expect(result).toMatchObject({ stale: false, persistence: 'available', diagnostics: { failureStage: 'snapshot-read' } });
    expect(result.snapshot.project.release.version).toBe('0.6.0');
    expect(write).toHaveBeenCalledOnce();
  });
  it('returns fresh release even when persistence is absent or write fails', async () => {
    for (const store of [null, { read: async () => old(), write: async () => { throw new Error('write unavailable'); } }]) {
      const result = await resolveSnapshot(connection, store, false, fetcher as typeof fetch, now);
      expect(result).toMatchObject({ stale: false, persistence: 'unavailable' });
      expect(result.snapshot.project.release.version).toBe('0.6.0');
    }
  });
  it('never overwrites LKG with malformed upstream', async () => {
    const write = vi.fn();
    const badFetcher = vi.fn(async () => new Response(JSON.stringify({ invalid: true })));
    const result = await resolveSnapshot(connection, { read: async () => old(), write }, true, badFetcher as typeof fetch, now);
    expect(result).toMatchObject({ stale: true, diagnostics: { failureStage: 'upstream' } });
    expect(result.snapshot.project.release.version).toBe('0.3.1');
    expect(write).not.toHaveBeenCalled();
  });
  it('force bypasses TTL while ordinary reads reuse a fresh validated snapshot', async () => {
    const snapshot = { ...old(), fetchedAt: new Date(now).toISOString() };
    const upstream = vi.fn(fetcher);
    const store = { read: async () => snapshot, write: vi.fn() };
    expect((await resolveSnapshot(connection, store, false, upstream as typeof fetch, now)).snapshot.project.release.version).toBe('0.3.1');
    expect(upstream).not.toHaveBeenCalled();
    expect((await resolveSnapshot(connection, store, true, upstream as typeof fetch, now)).snapshot.project.release.version).toBe('0.6.0');
  });
  it('rejects stored project substitution even when the snapshot timestamp is fresh', async () => {
    const changed = { ...old(), fetchedAt: new Date(now).toISOString() }; changed.project.slug = 'another-project';
    const badFetcher = vi.fn(async () => new Response('', { status: 503 }));
    await expect(resolveSnapshot(connection, { read: async () => changed, write: vi.fn() }, false, badFetcher as typeof fetch, now)).rejects.toThrow();
  });
});


describe('0.9.x latest publication stays automatic', () => {
  it('0.9.1 and a later 0.9.2 supersede older releases by publication date', () => {
    const first = version('0.9.1', '2026-10-08T00:20:17Z');
    const next = version('0.9.2', '2026-10-09T00:00:00Z');
    expect(parseModrinthPublication(project, [...versions, first]).release.version).toBe('0.9.1');
    expect(parseModrinthPublication(project, [first, ...versions, next]).release.version).toBe('0.9.2');
  });
});
