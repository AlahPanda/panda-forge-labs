/** Exact HTTPS origins only. No wildcards, paths or credentials in configured values. */
export function allowedAdminOrigins(list: string | undefined, legacy: string | undefined): string[] | null {
  const raw = list === undefined || list.trim() === '' ? legacy : list;
  if (!raw) return null;
  const entries = raw.split(',').map((part) => part.trim());
  if (entries.length > 12 || entries.some((part) => !part)) return null;
  for (const origin of entries) {
    try {
      const url = new URL(origin);
      if (url.protocol !== 'https:' || url.origin !== origin || origin.includes('*') || url.pathname !== '/' || url.search || url.hash || url.username || url.password) return null;
    } catch { return null; }
  }
  return [...new Set(entries)];
}

// Generated deployment URLs for this one Vercel project and scope only.
// A host name is not proof of a Preview deployment; Vercel Authentication and
// the CMS JWT remain mandatory, and GitHub writes stay pinned to the Preview branch.
const PROJECT_DEPLOYMENT_HOST = /^alahpanda-labs-[a-z0-9]{8,32}-alahpandas-projects\.vercel\.app$/;

export function isAllowedAdminOrigin(origin: string | null, allowed: readonly string[], alias?: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin || url.pathname !== '/' || url.search || url.hash || url.username || url.password) return false;
    return allowed.includes(origin) || alias === origin || (url.port === '' && PROJECT_DEPLOYMENT_HOST.test(url.hostname));
  } catch { return false; }
}
