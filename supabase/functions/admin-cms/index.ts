import { ALLOWED_PATHS, validateContent, validateClaims, canSave } from "./policy.ts";
// Admin CMS edge function
// - POST /login         { password } -> { token }
// - POST /read          { path } (Bearer token) -> current JSON and blob SHA
// - POST /save          { path, content, sha } (Bearer token) -> commits to GitHub branch
// - POST /redeploy      (Bearer token) -> hits Vercel deploy hook
//
// Secrets required:
//   ADMIN_PASSWORD, ADMIN_JWT_SECRET, ADMIN_ORIGIN, GITHUB_TOKEN, GITHUB_REPO,
//   GITHUB_BRANCH; optional VERCEL_DEPLOY_HOOK (preview-only for preview config)

const ADMIN_ORIGIN = Deno.env.get('ADMIN_ORIGIN') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': ADMIN_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') ?? '';
const JWT_SECRET = Deno.env.get('ADMIN_JWT_SECRET') ?? '';
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN') ?? '';
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') ?? '';
const GITHUB_BRANCH = Deno.env.get('GITHUB_BRANCH') ?? '';
const VERCEL_DEPLOY_HOOK = Deno.env.get('VERCEL_DEPLOY_HOOK') ?? '';

// ---------- Minimal HMAC-SHA256 JWT (HS256) ----------
function b64url(input: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof input === 'string'
    ? new TextEncoder().encode(input)
    : input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}
async function signJwt(payload: Record<string, unknown>): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = b64url(await hmac(JWT_SECRET, `${header}.${body}`));
  return `${header}.${body}.${sig}`;
}
async function verifyJwt(token: string): Promise<Record<string, unknown> | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    if (!(await crypto.subtle.verify('HMAC', key, b64urlDecode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`)))) return null;
  } catch { return null; }
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1]))) as Record<string, unknown>;
    if (!validateClaims(payload)) return null;
    return payload;
  } catch { return null; }
}

// ---------- GitHub commit ----------
function ghHeaders(extra: Record<string, string> = {}) {
  // GitHub accepts both "token <PAT>" (classic) and "Bearer <PAT>" (fine-grained / GitHub App).
  // "token" works for both, so we use it for maximum compatibility.
  return {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'AlahPanda-Admin-CMS',
    ...extra,
  };
}

function toStdBase64(s: string): string {
  // UTF-8 safe standard base64 (what GitHub Contents API expects)
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function verifyGithubToken(): Promise<{ ok: true; login: string } | { ok: false; error: string }> {
  if (!GITHUB_TOKEN) return { ok: false, error: 'GITHUB_TOKEN secret is missing' };
  if (!GITHUB_BRANCH || !/^[a-zA-Z0-9._/-]+$/.test(GITHUB_BRANCH)) return { ok: false, error: 'GITHUB_BRANCH is not configured' };
  if (!GITHUB_REPO || !/^[^/\s]+\/[^/\s]+$/.test(GITHUB_REPO)) {
    return { ok: false, error: `GITHUB_REPO must be "owner/repo" (got: "${GITHUB_REPO}")` };
  }
  const r = await fetch('https://api.github.com/user', { headers: ghHeaders() });
  if (r.status === 401) {
    return { ok: false, error: 'GitHub token is invalid or expired (401 from /user). Update the GITHUB_TOKEN secret with a valid PAT that has "repo" scope.' };
  }
  if (!r.ok) return { ok: false, error: `GitHub /user ${r.status}: ${await r.text()}` };
  const j = await r.json();
  // Also verify repo access
  const rr = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, { headers: ghHeaders() });
  if (rr.status === 404) return { ok: false, error: `Repo "${GITHUB_REPO}" not found or token lacks access. Ensure PAT has "repo" scope (classic) or Contents:write (fine-grained) on this repo.` };
  if (!rr.ok) return { ok: false, error: `GitHub /repos ${rr.status}: ${await rr.text()}` };
  return { ok: true, login: j.login };
}

async function commitFile(path: string, content: string, message: string, expectedSha: string): Promise<{ sha: string; url: string }> {
  const check = await verifyGithubToken();
  if (!check.ok) throw new Error(check.error);

  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURI(path)}`;
  const fileUrl = `${apiBase}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  // Get current sha
  const head = await fetch(fileUrl, { headers: ghHeaders() });
  let sha: string | undefined;
  if (head.status === 200) {
    const j = await head.json();
    sha = j.sha;
  } else if (head.status !== 404) {
    throw new Error(`GitHub HEAD ${head.status}: ${await head.text()}`);
  }

  if (!canSave(expectedSha, sha)) throw new ConflictError();
  const put = await fetch(apiBase, {
    method: 'PUT',
    headers: ghHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      message,
      content: toStdBase64(content),
      sha,
      branch: GITHUB_BRANCH,
      committer: { name: 'AlahPanda Admin', email: 'admin@alahpandalabs.dev' },
    }),
  });
  if (put.status === 409) throw new ConflictError();
  if (!put.ok) throw new Error(`GitHub PUT ${put.status}: ${await put.text()}`);
  const j = await put.json();
  return { sha: j.content.sha, url: j.content.html_url };
}

async function triggerRedeploy(): Promise<{ ok: boolean; status: number; body: string }> {
  if (!VERCEL_DEPLOY_HOOK) return { ok: false, status: 0, body: 'VERCEL_DEPLOY_HOOK not configured' };
  const r = await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

class ConflictError extends Error { constructor() { super('Content changed on GitHub. Reload before saving.'); } }

// Best-effort per-instance limiter; add an external limiter for distributed production.
const attempts = new Map<string, { count: number; until: number }>();

// ---------- Router ----------
Deno.serve(async (req) => {
  if (!ADMIN_ORIGIN || !JWT_SECRET) return json({ error: 'Server not configured' }, 500);
  if (req.headers.get('Origin') && req.headers.get('Origin') !== ADMIN_ORIGIN) return json({ error: 'Forbidden origin' }, 403);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  // Path looks like /admin-cms/login (function name prefix is included)
  const segments = url.pathname.split('/').filter(Boolean);
  const action = segments[segments.length - 1];

  try {
    if (action === 'login') {
      const client = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const previous = attempts.get(client);
      if (previous && previous.until > Date.now() && previous.count >= 5) return json({ error: 'Too many attempts' }, 429);
      const { password } = await req.json().catch(() => ({}));
      if (!ADMIN_PASSWORD || !JWT_SECRET) {
        return json({ error: 'Server not configured' }, 500);
      }
      if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
        // Constant-ish delay to slow brute force a touch
        const now = Date.now();
        const current = previous && previous.until > now ? previous : { count: 0, until: now + 15 * 60_000 };
        attempts.set(client, { ...current, count: current.count + 1 });
        await new Promise((r) => setTimeout(r, 400));
        return json({ error: 'Invalid password' }, 401);
      }
      attempts.delete(client);
      const token = await signJwt({
        sub: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8h
      });
      return json({ token });
    }

    // All other actions require auth
    const auth = req.headers.get('Authorization') ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const claims = token ? await verifyJwt(token) : null;
    if (!claims) return json({ error: 'Unauthorized' }, 401);

    if (action === 'read') {
      const { path } = await req.json().catch(() => ({}));
      if (typeof path !== 'string' || !ALLOWED_PATHS.has(path)) return json({ error: 'Invalid path' }, 400);
      const check = await verifyGithubToken();
      if (!check.ok) throw new Error(check.error);
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURI(path)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, { headers: ghHeaders() });
      if (!response.ok) throw new Error(`GitHub read ${response.status}`);
      const file = await response.json();
      const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, '')), (c: string) => c.charCodeAt(0));
      return json({ content: new TextDecoder().decode(bytes), sha: file.sha });
    }

    if (action === 'save') {
      const { path, content, sha, commitMessage } = await req.json().catch(() => ({}));
      const invalid = validateContent(path, content);
      if (invalid) return json({ error: invalid }, 400);
      if (typeof sha !== 'string' || !sha) return json({ error: 'Missing version' }, 400);
      const result = await commitFile(path, content, commitMessage || `chore(cms): update ${path}`, sha);
      return json({ ok: true, ...result });
    }

    if (action === 'redeploy') {
      const r = await triggerRedeploy();
      return json({ ok: r.ok, status: r.status, body: r.body }, r.ok ? 200 : 502);
    }

    if (action === 'me') {
      return json({ ok: true, sub: claims.sub, exp: claims.exp });
    }

    return json({ error: 'Unknown action' }, 404);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('admin-cms error:', msg);
    return json({ error: e instanceof ConflictError ? msg : 'Request failed' }, e instanceof ConflictError ? 409 : 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
