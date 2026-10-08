import { describe, expect, it,  } from 'vitest';
import { validatedPublicItems } from '../content/v2/publication';
import { canSave, validateClaims, validateContent } from '../../supabase/functions/admin-cms/policy';
import { renderMarkdown, safeMarkdownUrl } from '../components/RichMarkdown';
import DOMPurify from 'dompurify';

const news = 'src/content/news.json';

describe('publication security', () => {
  it('requires an admin subject and an unexpired token', () => {
    expect(validateClaims({ sub: 'admin', iat: 100, exp: 200 }, 150)).toBe(true);
    expect(validateClaims({ sub: 'user', iat: 100, exp: 200 }, 150)).toBe(false);
    expect(validateClaims({ sub: 'admin', iat: 100, exp: 150 }, 150)).toBe(false);
    expect(validateClaims({ sub: 'admin' }, 150)).toBe(false);
  });
  it('rejects unauthorized paths, malformed JSON and stale revisions', () => {
    expect(validateContent('src/App.tsx', '{}')).toBe('Invalid path');
    expect(validateContent('src/content/v2/articles.json', 'not json')).toBe('Content is not valid JSON');
    expect(validateContent(news, JSON.stringify({ articles: [] }))).toBe('Invalid path');
    expect(validateContent('src/content/v2/articles.json', JSON.stringify({ schemaVersion: 2, items: [{ slug: 'private', name: 'Private', body: 'Private', draft: true }] }))).toBe('Invalid articles collection');
    expect(canSave('old', 'new')).toBe(false);
    expect(canSave('same', 'same')).toBe(true);
  });
  it('strips drafts from the public data at build time', () => {
    const published = { slug: 'public', name: 'Public', body: 'Own text' };
    expect(validatedPublicItems<{ slug: string }>('articles', { schemaVersion: 2, items: [published, { ...published, slug: 'private', draft: true }] }).map((item) => item.slug)).toEqual(['public']);
  });
  it('does not render unsafe links, image URLs or attributes', () => {
    expect(safeMarkdownUrl('javascript:alert(1)')).toBeNull();
    const html = DOMPurify.sanitize(renderMarkdown('[x](javascript:alert(1)) ![x](javascript:alert(1))\n```x" onmouseover="alert(1)\ncode\n```'), { ADD_ATTR: ['data-lang'] });
    expect(html).not.toContain('javascript:');
    const container = document.createElement('div');
    container.innerHTML = html;
    expect(container.querySelector('code')?.getAttribute('onmouseover')).toBeNull();
    expect(html).toContain('<code');
  });
});
