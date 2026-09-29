import type { IncomingMessage, ServerResponse } from 'node:http';
import { connectedProject, syncProject } from '../_modrinth';

export function officialReleaseDestination(projectSlug: string, proposed?: string): string {
  const fallback = `https://modrinth.com/modpack/${encodeURIComponent(projectSlug)}`;
  if (!proposed) return fallback;
  try {
    const parsed = new URL(proposed);
    if (parsed.protocol === 'https:' && parsed.hostname === 'modrinth.com' && !parsed.port && !parsed.username && !parsed.password && parsed.pathname.startsWith(`/modpack/${encodeURIComponent(projectSlug)}/version/`) && !parsed.search && !parsed.hash) return parsed.href;
  } catch { /* use the official project */ }
  return fallback;
}

export default async function handler(req: IncomingMessage & { query?: { slug?: string } }, res: ServerResponse) {
  if (req.method !== 'GET') { res.statusCode = 405; return res.end(); }
  const slug = req.query?.slug || '';
  const project = connectedProject(slug);
  if (!project?.upstream) { res.statusCode = 404; return res.end(); }
  let destination = officialReleaseDestination(project.upstream.projectSlug);
  try { destination = officialReleaseDestination(project.upstream.projectSlug, (await syncProject(slug)).snapshot.project.release.url); } catch { /* the official project remains reachable */ }
  res.statusCode = 302;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Location', destination);
  res.end();
}
