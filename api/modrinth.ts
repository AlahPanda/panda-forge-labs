import type { IncomingMessage, ServerResponse } from 'node:http';
import { connectedProject, isGet, respond, syncProject } from './_modrinth.js';

export default async function handler(req: IncomingMessage & { query?: { slug?: string } }, res: ServerResponse) {
  if (!isGet(req, res)) return;
  const slug = req.query?.slug || '';
  if (!connectedProject(slug)) return respond(res, 404, { error: 'not_connected' });
  try { return respond(res, 200, await syncProject(slug)); }
  catch { return respond(res, 503, { error: 'upstream_unavailable' }); }
}
