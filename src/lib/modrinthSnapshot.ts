import { fetchModrinthPublication, type UpstreamProject } from './modrinthProject';

export const SNAPSHOT_TTL_MS = 15 * 60_000;
export type Snapshot = { project: UpstreamProject; fetchedAt: string };
export type SnapshotStore = { read(slug: string): Promise<Snapshot | null>; write(slug: string, snapshot: Snapshot): Promise<void> };
export type SnapshotResult = { snapshot: Snapshot; stale: boolean; persistence: 'available' | 'unavailable' };

// A failed response never replaces a good snapshot. A publication is checked against
// the connected project identity before persisting to prevent project substitution.
export async function resolveSnapshot(connection: { projectSlug: string; projectId?: string }, store: SnapshotStore | null, force = false, fetcher: typeof fetch = fetch, now = Date.now()): Promise<SnapshotResult> {
  let previous: Snapshot | null = null;
  try { previous = await store?.read(connection.projectSlug) || null; } catch { /* live refresh remains usable */ }
  if (previous && (!connection.projectId || previous.project.id === connection.projectId) && !force && now - Date.parse(previous.fetchedAt) < SNAPSHOT_TTL_MS) {
    return { snapshot: previous, stale: false, persistence: 'available' };
  }
  try {
    const project = await fetchModrinthPublication(connection.projectSlug, fetcher);
    if (connection.projectId && project.id !== connection.projectId) throw new Error('Modrinth project identity changed');
    if (project.slug !== connection.projectSlug) throw new Error('Modrinth project slug changed');
    const snapshot = { project, fetchedAt: new Date(now).toISOString() };
    let persistence: SnapshotResult['persistence'] = store ? 'available' : 'unavailable';
    try { await store?.write(connection.projectSlug, snapshot); } catch { persistence = 'unavailable'; }
    return { snapshot, stale: false, persistence };
  } catch (error) {
    if (previous && (!connection.projectId || previous.project.id === connection.projectId)) return { snapshot: previous, stale: true, persistence: 'available' };
    throw error;
  }
}
