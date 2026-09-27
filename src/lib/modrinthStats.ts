import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// Only an official published Modrinth project URL may supply a slug.
export function modrinthProjectSlug(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'modrinth.com') return undefined;
    const match = /^\/modpack\/([a-zA-Z0-9_-]+)\/?$/.exec(parsed.pathname);
    return match?.[1];
  } catch { return undefined; }
}

const responseSchema = z.object({
  downloads: z.number().int().nonnegative().safe(),
  followers: z.number().int().nonnegative().safe(),
});

export type ModrinthStats = z.infer<typeof responseSchema>;
export const MODRINTH_STATS_TTL_MS = 15 * 60_000;

export async function fetchModrinthStats(slug: string, fetcher: typeof fetch = fetch): Promise<ModrinthStats> {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) throw new Error('Invalid Modrinth project slug');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetcher(`https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Modrinth stats unavailable');
    return responseSchema.parse(await response.json());
  } finally { clearTimeout(timeout); }
}

// React Query deduplicates simultaneous visits and retains data between route changes.
// Failure does not block editorial content or the published download link.
export function useModrinthStats(projectUrl?: string) {
  const slug = modrinthProjectSlug(projectUrl);
  return useQuery({
    queryKey: ['modrinth-public-stats', slug],
    queryFn: () => fetchModrinthStats(slug!),
    enabled: !!slug,
    staleTime: MODRINTH_STATS_TTL_MS,
    gcTime: 60 * 60_000,
    retry: false,
  });
}
