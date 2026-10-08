import type { IncomingMessage, ServerResponse } from 'node:http';
import projects from '../src/content/v2/projects.json' with { type: 'json' };
import { parseCollection, type ProjectV2 } from '../src/content/v2/schema.js';
import { resolveSnapshot, type Snapshot, type SnapshotStore } from '../src/lib/modrinthSnapshot.js';

const published = parseCollection('projects', projects).items as ProjectV2[];
export function connectedProject(slug: string): ProjectV2 | undefined {
  return published.find((item) => item.slug === slug && item.upstream?.provider === 'modrinth' && item.status !== 'internal-prototype');
}
export const connectedProjects = () => published.filter((item) => connectedProject(item.slug));

async function snapshotRequest(url: string, options: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

export function snapshotStore(): SnapshotStore | null {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  const endpoint = `${base.replace(/\/$/, '')}/rest/v1/modrinth_snapshots`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  return {
    async read(slug) {
      const response = await snapshotRequest(`${endpoint}?project_slug=eq.${encodeURIComponent(slug)}&select=snapshot`, { headers, cache: 'no-store' });
      if (!response.ok) throw new Error('Snapshot read failed');
      const rows = await response.json() as { snapshot: Snapshot }[];
      return rows[0]?.snapshot || null;
    },
    async write(slug, snapshot) {
      const response = await snapshotRequest(`${endpoint}?on_conflict=project_slug`, {
        method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ project_slug: slug, project_id: snapshot.project.id, snapshot, fetched_at: snapshot.fetchedAt }),
      });
      if (!response.ok) throw new Error('Snapshot write failed');
    },
  };
}
export async function syncProject(slug: string, force = false) {
  const project = connectedProject(slug);
  if (!project?.upstream?.projectSlug) throw new Error('Project is not connected');
  const result = await resolveSnapshot({ projectSlug: project.upstream.projectSlug, projectId: project.upstream.projectId }, snapshotStore(), force);
  console.info('modrinth_sync', { slug, force, version: result.snapshot.project.release.version, fetchedAt: result.snapshot.fetchedAt, stale: result.stale, persistence: result.persistence, ...result.diagnostics });
  return result;
}
export function respond(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}
export function isGet(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') return true;
  respond(res, 405, { error: 'method_not_allowed' }); return false;
}
