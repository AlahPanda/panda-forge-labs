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
