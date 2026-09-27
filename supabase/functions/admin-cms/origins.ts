/** Exact HTTPS origins only. No wildcards, paths, credentials, or inferred Vercel hosts. */
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

export function originAllowed(origin: string | null, allowed: readonly string[]): boolean {
  return origin !== null && allowed.includes(origin);
}
