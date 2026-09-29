export type Connection = { provider?: string; projectId?: string; projectSlug?: string };
export function duplicateModrinthConnection(candidate: Connection, others: { upstream?: Connection }[]): boolean {
  if (candidate.provider !== 'modrinth' || !candidate.projectSlug) return false;
  return others.some(({ upstream }) => upstream?.provider === 'modrinth' && (upstream.projectSlug === candidate.projectSlug || !!candidate.projectId && upstream.projectId === candidate.projectId));
}
