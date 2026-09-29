import { z } from 'zod';

const https = z.string().url().refine((value) => new URL(value).protocol === 'https:');
const cdn = https.refine((value) => new URL(value).hostname === 'cdn.modrinth.com');
const projectInput = z.object({
  id: z.string().min(3), slug: z.string().min(1), title: z.string().min(1), description: z.string(),
  project_type: z.literal('modpack'), status: z.literal('approved'),
  icon_url: cdn.nullish(), downloads: z.number().int().nonnegative(), followers: z.number().int().nonnegative(),
  gallery: z.array(z.object({ url: cdn, title: z.string().nullish(), description: z.string().nullish() }).passthrough()),
}).passthrough();
const versionInput = z.object({
  id: z.string().min(3), project_id: z.string().min(3), version_number: z.string().min(1),
  version_type: z.enum(['alpha','beta','release']), date_published: z.string().datetime({ offset: true }),
  game_versions: z.array(z.string()), loaders: z.array(z.string()), changelog: z.string().nullish(),
  files: z.array(z.object({ filename: z.string().min(1), url: cdn, primary: z.boolean() }).passthrough()),
  status: z.string().optional(),
}).passthrough();
export type UpstreamProject = {
  id: string; slug: string; name: string; summary: string; iconUrl?: string;
  downloads: number; followers: number; gallery: { url: string; alt: string; caption?: string }[];
  projectUrl: string; release: {
    id: string; version: string; channel: 'alpha' | 'beta' | 'stable'; publishedAt: string;
    minecraft: string[]; loaders: string[]; changelog?: string; url: string;
    files: { filename: string; url: string; primary: boolean }[];
  };
};

export function parseModrinthReference(reference: string): string {
  const trimmed = reference.trim();
  if (/^[a-zA-Z0-9_-]{3,64}$/.test(trimmed)) return trimmed;
  const url = new URL(trimmed);
  if (url.protocol !== 'https:' || url.hostname !== 'modrinth.com' || url.port || url.search || url.hash) throw new Error('Use an official Modrinth project URL');
  const match = /^\/modpack\/([a-zA-Z0-9_-]{3,64})\/?$/.exec(url.pathname);
  if (!match) throw new Error('Use a Modrinth modpack URL');
  return match[1];
}

export function parseModrinthPublication(rawProject: unknown, rawVersions: unknown): UpstreamProject {
  const project = projectInput.parse(rawProject);
  if (!Array.isArray(rawVersions)) throw new Error('Invalid versions response');
  const versions = rawVersions.map((candidate) => versionInput.parse(candidate))
    .filter((version) => version.project_id === project.id && (version.status === undefined || version.status === 'listed'));
  if (!versions.length) throw new Error('No public release available');
  versions.sort((a,b) => Date.parse(b.date_published) - Date.parse(a.date_published));
  const latest = versions[0];
  if (!Number.isFinite(Date.parse(latest.date_published)) || !latest.files.length) throw new Error('Release is incomplete');
  return {
    id: project.id, slug: project.slug, name: project.title, summary: project.description,
    iconUrl: project.icon_url || undefined, downloads: project.downloads, followers: project.followers,
    gallery: project.gallery.map((image) => ({ url: image.url, alt: image.title || project.title, caption: image.description || undefined })),
    projectUrl: `https://modrinth.com/modpack/${encodeURIComponent(project.slug)}`,
    release: { id: latest.id, version: latest.version_number, channel: latest.version_type === 'release' ? 'stable' : latest.version_type,
      publishedAt: latest.date_published, minecraft: latest.game_versions, loaders: latest.loaders,
      changelog: latest.changelog || undefined,
      url: `https://modrinth.com/modpack/${encodeURIComponent(project.slug)}/version/${encodeURIComponent(latest.id)}`,
      files: latest.files.map(({filename,url,primary}) => ({filename,url,primary})),
    },
  };
}

export async function fetchModrinthPublication(reference: string, fetcher: typeof fetch = fetch): Promise<UpstreamProject> {
  const slug = parseModrinthReference(reference);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const endpoint = `https://api.modrinth.com/v2/project/${encodeURIComponent(slug)}`;
    const headers = { Accept: 'application/json', 'User-Agent': 'AlahPandaLabs/2 (public project sync)' };
    const [project, versions] = await Promise.all([
      fetcher(endpoint, { headers, signal: controller.signal }),
      fetcher(endpoint + '/version', { headers, signal: controller.signal }),
    ]);
    if (!project.ok || !versions.ok) throw new Error('Modrinth unavailable');
    return parseModrinthPublication(await project.json(), await versions.json());
  } finally { clearTimeout(timer); }
}
