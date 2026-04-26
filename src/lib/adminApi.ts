import { supabase } from '@/integrations/supabase/client';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-cms`;
const TOKEN_KEY = 'apl.admin.token';

export const adminAuth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

function toStdBase64Utf8(input: string): string {
  // GitHub Contents API expects standard base64 of UTF-8 bytes.
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function githubPutJsonFile(params: {
  path: string;
  content: string;
  commitMessage?: string;
}): Promise<{ ok: true; sha: string; url: string } | { ok: false; error: string }> {
  const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  if (!token) return { ok: false, error: 'Missing VITE_GITHUB_TOKEN' };

  // Keep repo explicit (per request) and only vary the path.
  const repo = 'AlahPanda/panda-forge-labs';
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeURI(params.path)}`;

  const headersGet: Record<string, string> = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const headersPut: Record<string, string> = {
    ...headersGet,
    'Content-Type': 'application/json',
  };

  // Validate JSON before committing
  try {
    JSON.parse(params.content);
  } catch {
    return { ok: false, error: 'Content is not valid JSON' };
  }

  // GitHub requires `sha` for updates (optional for creates).
  let sha: string | undefined;
  const head = await fetch(apiUrl, { headers: headersGet });
  if (head.status === 200) {
    const j = (await head.json()) as { sha?: string };
    sha = j.sha;
  } else if (head.status !== 404) {
    return { ok: false, error: `GitHub GET ${head.status}: ${await head.text()}` };
  }

  const put = await fetch(apiUrl, {
    method: 'PUT',
    headers: headersPut,
    body: JSON.stringify({
      message: params.commitMessage || `chore(cms): update ${params.path}`,
      content: toStdBase64Utf8(params.content),
      sha,
    }),
  });
  if (!put.ok) return { ok: false, error: `GitHub PUT ${put.status}: ${await put.text()}` };

  const data = (await put.json()) as { content?: { sha?: string; html_url?: string } };
  const outSha = data.content?.sha;
  const outUrl = data.content?.html_url;
  if (!outSha || !outUrl) return { ok: false, error: 'GitHub response missing content.sha/html_url' };
  return { ok: true, sha: outSha, url: outUrl };
}

async function call<T = any>(action: string, body?: any, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
  if (auth) {
    const t = adminAuth.getToken();
    if (!t) throw new Error('Not authenticated');
    headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${FN_BASE}/${action}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

export const adminApi = {
  login: (password: string) => call<{ token: string }>('login', { password }, false),
  // Bypass the Supabase edge function entirely for saving content.
  // We commit straight to GitHub via Contents API, using VITE_GITHUB_TOKEN.
  save: async (path: string, content: string, commitMessage?: string) => {
    const r = await githubPutJsonFile({ path, content, commitMessage });
    if (!r.ok) throw new Error(r.error);
    return r;
  },
  redeploy: () => call('redeploy'),
  diag: () => call('diag'),
};

// Suppress unused warning — import kept for future supabase usage
void supabase;
