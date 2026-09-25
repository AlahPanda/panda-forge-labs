import { describe, it, expect } from 'vitest';
import { publicProject, publicProjects, publicLauncher, publicArticle, publicGuides, publicHomepage, validatedPublicItems, resolveEntries } from '@/content/publicResolver';

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
    expect(project.item.summary).toBeUndefined();
    expect('version' in project.item).toBe(false);
    expect(publicProjects().find((item) => item.slug === 'Soon')?.source).toBe('legacy');
  });

  it('keeps legacy routes for launchers and articles pending editorial migration', () => {
    expect(publicLauncher('prism')?.source).toBe('legacy');
    expect(publicArticle('missing')).toBeUndefined();
    expect(publicGuides()).toEqual([]);
    expect(publicHomepage()).toBeUndefined();
  });
});
