import type { ProjectV2 } from '@/content/v2/schema';

// Public download CTAs use an owner-published official project destination.
// Release automation and its server resolver are independent of this link.
export function officialModrinthProjectUrl(project: Pick<ProjectV2, 'distribution'>): string | undefined {
  for (const provider of project.distribution || []) {
    if (provider.provider !== 'modrinth' || provider.state !== 'active' || !provider.url) continue;
    try {
      const url = new URL(provider.url);
      if (url.protocol === 'https:' && url.hostname === 'modrinth.com' && !url.port && !url.username && !url.password && !url.search && !url.hash && /^\/modpack\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return url.href;
    } catch { /* An invalid entry does not become a public download destination. */ }
  }
  return undefined;
}
