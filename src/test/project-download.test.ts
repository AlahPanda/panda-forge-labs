import { describe, expect, it } from 'vitest';
import { officialModrinthProjectUrl } from '@/lib/projectDownload';

describe('published official project download destination', () => {
  it('uses the active project destination for any project without a resolver', () => {
    for (const slug of ['mac-native','future-pack']) {
      expect(officialModrinthProjectUrl({distribution:[{provider:'modrinth',state:'active',url:`https://modrinth.com/modpack/${slug}`}]})).toBe(`https://modrinth.com/modpack/${slug}`);
    }
  });
  it('does not invent a destination or accept inactive, external or release URLs', () => {
    expect(officialModrinthProjectUrl({})).toBeUndefined();
    expect(officialModrinthProjectUrl({distribution:[{provider:'modrinth',state:'paused',url:'https://modrinth.com/modpack/example'}]})).toBeUndefined();
    for (const url of ['/api/download/example','http://modrinth.com/modpack/example','https://modrinth.com.evil.example/modpack/example','https://modrinth.com/modpack/example/version/latest']) {
      expect(officialModrinthProjectUrl({distribution:[{provider:'modrinth',state:'active',url}]})).toBeUndefined();
    }
  });
});
