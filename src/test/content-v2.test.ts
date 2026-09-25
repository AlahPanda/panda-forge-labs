import { describe, expect, it } from 'vitest';
import projects from '../content/v2/projects.json';
import { collectionPath, parseCollection, parseItem, projectSchema, distributionSchema, type ContentKind } from '../content/v2/schema';
import { validateContent } from '../../supabase/functions/admin-cms/policy';

const kinds: ContentKind[] = ['projects', 'releases', 'launchers', 'articles', 'guides', 'faq', 'homepage', 'settings'];
const base = { slug: 'new-project', name: 'New Project', sourceLocale: 'pt-PT', translations: {} };

describe('Content Model V2', () => {
  it('accepts all eight versioned collections and the factual project classification', async () => {
    for (const kind of kinds) {
      const file = await import(`../content/v2/${kind}.json`);
      expect(parseCollection(kind, file.default).schemaVersion).toBe(2);
      expect(validateContent(collectionPath(kind), JSON.stringify(file.default))).toBeNull();
    }
    const current = parseCollection('projects', projects).items;
    expect(current.map((project) => [project.slug, project.status])).toEqual([
      ['mac-native', 'beta'], ['crafttoons', 'internal-prototype'],
    ]);
    expect(current.map((project) => project.releaseSlugs)).toEqual([['mac-native-0-3-1'], []]);
  });
  it('allows a prototype without public version, downloads, or translations', () => {
    const project = projectSchema.parse({ ...base, status: 'internal-prototype' });
    expect(project.releaseSlugs).toEqual([]);
    expect(project.translations).toEqual({});
    expect('version' in project).toBe(false);
  });
  it('keeps project state distinct from a release channel and allows paused providers', () => {
    expect(parseItem('projects', { ...base, status: 'stable', distribution: [{ provider: 'curseforge', state: 'paused', priority: 'secondary' }] }).status).toBe('stable');
    expect(parseItem('releases', { ...base, projectSlug: 'new-project', version: '0.1.0', channel: 'alpha' }).channel).toBe('alpha');
    expect(distributionSchema.safeParse({ provider: 'curseforge', state: 'active', url: 'javascript:alert(1)' }).success).toBe(false);
  });
  it('supports absent and partial translations without fabricating text', () => {
    const item = projectSchema.parse({ ...base, status: 'beta', translations: { en: { state: 'partial', fields: { name: 'Example' } } } });
    expect(item.translations.en?.fields.description).toBeUndefined();
    expect(item.translations.es).toBeUndefined();
  });
  it('rejects duplicates and arbitrary CSS/code fields', () => {
    expect(() => parseCollection('projects', { schemaVersion: 2, items: [{ ...base, status: 'beta' }, { ...base, status: 'stable' }] })).toThrow('Duplicate');
    expect(projectSchema.safeParse({ ...base, status: 'beta', css: 'body{display:none}' }).success).toBe(false);
  });
});
