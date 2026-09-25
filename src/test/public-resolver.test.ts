import { describe, it, expect } from 'vitest';
import { publicProject, publicProjects, publicReleasesFor, publicLauncher, publicLaunchers, publicArticles, publicFaq, publicSettings, publicArticle, publicGuides, publicGuide, publicHomepage, validatedPublicItems, resolveEntries } from '@/content/publicResolver';

describe('public Content V2 resolution', () => {
  const v2 = { slug: 'known', name: 'Reviewed' };
  const legacy = [{ slug: 'known', name: 'Old' }, { slug: 'legacy-only', name: 'Still available' }];

  it('prefers V2 by slug and retains the legacy fallback and URL', () => {
    expect(resolveEntries([v2], legacy, (item) => item.slug)).toEqual([
      { source: 'v2', item: v2, slug: 'known' },
      { source: 'legacy', item: legacy[1], slug: 'legacy-only' },
    ]);
  });

  it('rejects drafts and invalid V2 without displacing valid legacy entries', () => {
    const draft = { ...v2, status: 'beta', draft: true };
    const invalid = { ...v2, status: 'imaginary' };
    for (const input of [draft, invalid]) {
      const candidates = validatedPublicItems('projects', { schemaVersion: 2, items: [input] });
      expect(resolveEntries(candidates, legacy, (item) => item.slug)[0].source).toBe('legacy');
    }
    expect(validatedPublicItems('articles', { schemaVersion: 2, items: [{ slug: 'private', name: 'Private', body: 'text', draft: true }] })).toEqual([]);
  });

  it('exposes CraftToons only as a versionless, release-free prototype', () => {
    const project = publicProject('crafttoons');
    expect(project?.source).toBe('v2');
    if (project?.source !== 'v2') throw new Error('Expected checked-in V2 project');
    expect(project.item.status).toBe('internal-prototype');
    expect(project.item.releaseSlugs).toEqual([]);
    expect(project.item.distribution).toBeUndefined();
    expect(project.item.benchmarks).toBeUndefined();
    expect(project.item.summary).toBe('Um novo projeto de Minecraft está em desenvolvimento.');
    expect(publicReleasesFor(project.item)).toEqual([]);
    expect('version' in project.item).toBe(false);
    expect(publicProjects().some((item) => item.slug === 'Soon')).toBe(false);
    expect(publicProject('Soon')).toBeUndefined();
  });

  it('uses the verified Modrinth release in V2, without legacy metrics', () => {
    const project = publicProject('mac-native');
    expect(project?.source).toBe('v2');
    if (project?.source !== 'v2') throw new Error('Expected checked-in V2 project');
    expect(project.item.status).toBe('beta');
    expect(project.item.compatibility?.minecraft).toEqual(['1.21.11']);
    expect(project.item.compatibility?.loaders).toEqual(['Fabric']);
    expect(publicReleasesFor(project.item).map((release) => [release.version, release.channel, release.distribution?.[0]?.url])).toEqual([['0.3.1', 'beta', 'https://modrinth.com/modpack/mac-native/version/0.3.1']]);
    for (const field of ['downloads', 'rating', 'benchmarks', 'reviews']) expect(field in project.item).toBe(false);
    expect(publicProject('mac-native')?.slug).toBe('mac-native');
  });

  it('serves only published, valid guides and a safe empty collection', () => {
    expect(publicGuides()).toEqual([]);
    expect(publicGuide('missing')).toBeUndefined();
    const entries = validatedPublicItems<{ slug: string }>('guides', { schemaVersion: 2, items: [
      { slug: 'starting-out', name: 'Starting out', sourceLocale: 'pt-PT', body: 'Step one' },
      { slug: 'private-guide', name: 'Private', body: 'Private', draft: true },
    ] });
    expect(entries.map((item) => item.slug)).toEqual(['starting-out']);
    expect(`/guides/${entries[0].slug}`).toBe('/guides/starting-out');
  });

  it('keeps legacy routes for launchers and articles pending editorial migration', () => {
    const migrated = ['prism', 'modrinth-app', 'atlauncher', 'curseforge-app', 'multimc', 'gdlauncher'];
    for (const slug of migrated) {
      const entry = publicLauncher(slug);
      expect(entry?.source).toBe('v2');
      expect(entry?.slug).toBe(slug);
      if (entry?.source === 'v2') {
        expect(entry.item.officialLinks?.[0]?.url).toMatch(/^https:\/\//);
        expect('communityRating' in entry.item).toBe(false);
        expect(entry.item.recommendations).toBeUndefined();
      }
    }
    expect(publicLaunchers().filter((entry) => entry.source === 'legacy').map((entry) => entry.slug).sort()).toEqual(['astralrinth', 'sklauncher']);
    expect(publicSettings()?.name).toBe('AlahPanda Labs');
    expect(publicSettings()?.contactEmail).toBeUndefined();
    expect(publicFaq().filter((entry) => entry.source === 'legacy').map((entry) => entry.slug)).toEqual(['general', 'performance', 'support']);
    expect(publicArticles().filter((entry) => entry.source === 'legacy')).toHaveLength(5);
    expect(publicArticle('missing')).toBeUndefined();
    expect(publicGuides()).toEqual([]);
    expect(publicHomepage()?.sections).toEqual([{ id: 'metrics', visible: false }]);
  });
});
