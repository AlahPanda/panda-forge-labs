import type { ContentKind } from '@/content/v2/schema';

const TOKEN_KEY = 'apl.admin.token';

export type AdminErrorCode = 'origin' | 'invalid-password' | 'missing-config' | 'session-invalid' | 'github-config' | 'network' | 'rate-limit' | 'unknown';
export class AdminApiError extends Error {
  constructor(public readonly code: AdminErrorCode, message: string) { super(message); this.name = 'AdminApiError'; }
}

export function previewOrigin(): string | null {
  try {
    const configured = import.meta.env.VITE_PREVIEW_ORIGIN;
    if (typeof configured !== 'string' || !configured) return null;
    const url = new URL(configured);
    return url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash && configured === url.origin ? url.origin : null;
  } catch { return null; }
}

export function classifyAdminError(status: number, error: string, action: string, auth: boolean): AdminErrorCode {
  if (status === 403 && error === 'Forbidden origin') return 'origin';
  if (status === 401) return auth ? 'session-invalid' : 'invalid-password';
  if (status === 429) return 'rate-limit';
  if (error === 'Server not configured' || error === 'Private draft storage is not configured' || error === 'Supabase configuration is missing') return 'missing-config';
  if (action === 'login' && status === 404) return 'missing-config';
  if (error === 'GitHub configuration is invalid' || error === 'GitHub access is unavailable') return 'github-config';
  if (action === 'login' && status === 403) return 'origin';
  return 'unknown';
}

export const adminAuth = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!sessionStorage.getItem(TOKEN_KEY),
};

async function call<T>(action: string, body: unknown = {}, auth = true): Promise<T> {
  const supabase = import.meta.env.VITE_SUPABASE_URL;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabase || !apikey || !/^https:\/\/[^/]+$/.test(supabase)) throw new AdminApiError('missing-config', 'Supabase Preview configuration is missing.');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey,
  };
  if (auth) {
    const token = adminAuth.getToken();
    if (!token) throw new AdminApiError('session-invalid', 'Not authenticated');
    headers.Authorization = `Bearer ${token}`;
  }
  let res: Response;
  try { res = await fetch(`${supabase}/functions/v1/admin-cms/${action}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  }); } catch { throw new AdminApiError('network', 'Could not reach the Preview CMS API. Check network, CORS, and ADMIN_ORIGINS.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) adminAuth.clear();
    const message = typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`;
    throw new AdminApiError(classifyAdminError(res.status, message, action, auth), message);
  }
  return data as T;
}

export const adminApi = {
  login: (password: string) => call<{ token: string }>('login', { password }, false),
  me: () => call<{ ok: true }>('me'),
  modrinthLookup: (reference: string) => call<{ project: import('./modrinthProject').UpstreamProject }>('modrinth-lookup', { reference }),
  read: (path: string) => call<{ content: string; sha: string }>('read', { path }),
  save: (path: string, content: string, sha: string, commitMessage?: string) =>
    call<{ ok: true; sha: string; url: string }>('save', { path, content, sha, commitMessage }),
  draftList: () => call<{ drafts: Array<{ kind: ContentKind; slug: string; revision: number; updated_at: string }> }>('draft-list'),
  draftRead: (kind: ContentKind, slug: string) => call<{ draft: { content: unknown; base_sha: string; revision: number } }>('draft-read', { kind, slug }),
  draftSave: (kind: ContentKind, slug: string, item: unknown, baseSha: string, revision: number | null) =>
    call<{ draft: { content: unknown; base_sha: string; revision: number } }>('draft-save', { kind, slug, item, baseSha, revision }),
  draftPublish: (kind: ContentKind, slug: string, revision: number) =>
    call<{ ok: true; sha: string; url: string; commitSha?: string; commitUrl?: string; branch: string }>('draft-publish', { kind, slug, revision }),
  draftDelete: (kind: ContentKind, slug: string, revision: number) =>
    call<{ ok: true }>('draft-delete', { kind, slug, revision }),
  status: () => call<{ repo: string; branch: string; githubAccess: boolean; draftStorageConfigured: boolean; deployHookConfigured: boolean }>('status'),
  redeploy: () => call<{ ok: true }>('redeploy'),
};
