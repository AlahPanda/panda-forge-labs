import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import type { ProjectV2 } from '@/content/v2/schema';
import type { SnapshotResult } from './modrinthSnapshot';

const cdn = z.string().url().refine((value) => new URL(value).hostname === 'cdn.modrinth.com' && new URL(value).protocol === 'https:');
const publication = z.object({
  snapshot: z.object({
    fetchedAt: z.string().datetime(), project: z.object({
      id: z.string(), slug: z.string(), name: z.string(), summary: z.string(), downloads: z.number().int().nonnegative(), followers: z.number().int().nonnegative(),
      iconUrl: cdn.optional(), gallery: z.array(z.object({ url: cdn, alt: z.string(), caption: z.string().optional() })),
      projectUrl: z.string().url(),
      release: z.object({ id: z.string(), version: z.string(), channel: z.enum(['alpha','beta','stable']), publishedAt: z.string().datetime(), minecraft: z.array(z.string()), loaders: z.array(z.string()), changelog: z.string().optional(), url: z.string().url(), files: z.array(z.object({filename:z.string(),url:cdn,primary:z.boolean()})) }),
    }),
  }), stale: z.boolean(), persistence: z.enum(['available','unavailable']),
});
export async function fetchProjectPublication(slug: string): Promise<SnapshotResult> {
  const response = await fetch(`/api/modrinth/${encodeURIComponent(slug)}`);
  if (!response.ok) throw new Error('Upstream unavailable');
  return publication.parse(await response.json()) as SnapshotResult;
}
export function useProjectPublication(project?: ProjectV2) {
  return useQuery({
    queryKey: ['project-publication', project?.slug],
    queryFn: () => fetchProjectPublication(project!.slug),
    enabled: project?.upstream?.provider === 'modrinth',
    staleTime: 15 * 60_000, retry: false,
  });
}
