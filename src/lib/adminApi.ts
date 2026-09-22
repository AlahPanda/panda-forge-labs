const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-cms`;
const TOKEN_KEY = 'apl.admin.token';

export const adminAuth = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!sessionStorage.getItem(TOKEN_KEY),
};

async function call<T>(action: string, body: unknown = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  if (auth) {
    const token = adminAuth.getToken();
    if (!token) throw new Error('Not authenticated');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${FN_BASE}/${action}`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) adminAuth.clear();
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const adminApi = {
  login: (password: string) => call<{ token: string }>('login', { password }, false),
  me: () => call<{ ok: true }>('me'),
  read: (path: string) => call<{ content: string; sha: string }>('read', { path }),
  save: (path: string, content: string, sha: string, commitMessage?: string) =>
    call<{ ok: true; sha: string; url: string }>('save', { path, content, sha, commitMessage }),
  redeploy: () => call<{ ok: true }>('redeploy'),
};
