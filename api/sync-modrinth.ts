import type { IncomingMessage, ServerResponse } from 'node:http';
import { connectedProjects, respond, syncProject } from './_modrinth';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') return respond(res, 405, { error: 'method_not_allowed' });
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) return respond(res, 401, { error: 'unauthorized' });
  const results = await Promise.allSettled(connectedProjects().map((project) => syncProject(project.slug, true)));
  return respond(res, results.every((result) => result.status === 'fulfilled') ? 200 : 503, {
    connected: results.length, refreshed: results.filter((result) => result.status === 'fulfilled' && !result.value.stale).length,
    stale: results.filter((result) => result.status === 'fulfilled' && result.value.stale).length,
    failed: results.filter((result) => result.status === 'rejected').length,
  });
}
