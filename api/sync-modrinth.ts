import type { IncomingMessage, ServerResponse } from 'node:http';
import { connectedProjects, respond, syncProject } from './_modrinth.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return respond(res, 405, { error: 'method_not_allowed' });
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return respond(res, 401, { error: 'unauthorized' });
  const projects = connectedProjects();
  const results = await Promise.allSettled(projects.map((project) => syncProject(project.slug, true)));
  const healthy = results.every((result) => result.status === 'fulfilled' && !result.value.stale && result.value.persistence === 'available');
  return respond(res, healthy ? 200 : 503, {
    projects: results.map((result, index) => result.status === 'fulfilled' ? { slug: projects[index].slug, version: result.value.snapshot.project.release.version, fetchedAt: result.value.snapshot.fetchedAt, stale: result.value.stale, persistence: result.value.persistence, ...result.value.diagnostics } : { slug: projects[index].slug, failureStage: 'upstream', error: 'refresh_failed' }),
    connected: results.length, refreshed: results.filter((result) => result.status === 'fulfilled' && !result.value.stale).length,
    stale: results.filter((result) => result.status === 'fulfilled' && result.value.stale).length,
    failed: results.filter((result) => result.status === 'rejected').length,
  });
}
