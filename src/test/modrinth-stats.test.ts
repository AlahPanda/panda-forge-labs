import { describe, expect, it, vi } from 'vitest';
import { fetchModrinthStats, modrinthProjectSlug, MODRINTH_STATS_TTL_MS } from '@/lib/modrinthStats';

describe('official Modrinth metrics boundary', () => {
  it('accepts only the official public modpack URL and uses a bounded cache interval', () => {
    expect(modrinthProjectSlug('https://modrinth.com/modpack/mac-native')).toBe('mac-native');
    expect(modrinthProjectSlug('https://modrinth.com/modpack/mac-native/version/0.3.1')).toBeUndefined();
    expect(modrinthProjectSlug('https://modrinth.com.evil.example/modpack/mac-native')).toBeUndefined();
    expect(modrinthProjectSlug('http://modrinth.com/modpack/mac-native')).toBeUndefined();
    expect(MODRINTH_STATS_TTL_MS).toBe(900_000);
  });

  it('reads only real nonnegative downloads and followers from the API response', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ downloads: 120, followers: 13, irrelevant: 1 }), { status: 200 }));
    expect(await fetchModrinthStats('mac-native', fetcher)).toEqual({ downloads: 120, followers: 13 });
    expect(fetcher).toHaveBeenCalledWith('https://api.modrinth.com/v2/project/mac-native', expect.objectContaining({ headers: { Accept: 'application/json' } }));
  });

  it('rejects unavailable, malformed and untrusted data without manufacturing zero', async () => {
    const failed = vi.fn(async () => new Response('', { status: 503 }));
    await expect(fetchModrinthStats('mac-native', failed)).rejects.toThrow('unavailable');
    await expect(fetchModrinthStats('mac-native', vi.fn(async () => new Response(JSON.stringify({ downloads: -1, followers: 3 }), { status: 200 })))).rejects.toThrow();
    await expect(fetchModrinthStats('mac-native', vi.fn(async () => new Response(JSON.stringify({ downloads: 4 }), { status: 200 })))).rejects.toThrow();
    await expect(fetchModrinthStats('../private', failed)).rejects.toThrow('Invalid');
  });
});
