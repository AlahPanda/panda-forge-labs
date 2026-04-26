// Admin CMS edge function
// - POST /login         { password } -> { token }
// - POST /save          { path, content } (Bearer token) -> commits to GitHub
// - POST /redeploy      (Bearer token) -> hits Vercel deploy hook
//
// Secrets required:
//   ADMIN_PASSWORD, ADMIN_JWT_SECRET, GITHUB_TOKEN, GITHUB_REPO (e.g. "owner/repo"),
//   VERCEL_DEPLOY_HOOK (full URL)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') ?? '';
const JWT_SECRET = Deno.env.get('ADMIN_JWT_SECRET') ?? '';
const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN') ?? '';
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') ?? '';
const VERCEL_DEPLOY_HOOK = Deno.env.get('VERCEL_DEPLOY_HOOK') ?? '';

const ALLOWED_PATHS = new Set([
  'src/content/site.json',
  'src/content/modpacks.json',
  'src/content/news.json',
  'src/content/faq.json',
  'src/content/i18n.json',
  'src/content/reviews.json',
]);

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
  const expected = b64url(await hmac(JWT_SECRET, `${parts[0]}.${parts[1]}`));
  if (expected !== parts[2]) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1]))) as Record<string, unknown>;
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
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

async function commitFile(path: string, content: string, message: string): Promise<{ sha: string; url: string }> {
  const check = await verifyGithubToken();
  if (!check.ok) throw new Error(check.error);

  const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURI(path)}`;
  // Get current sha
  const head = await fetch(apiBase, { headers: ghHeaders() });
  let sha: string | undefined;
  if (head.status === 200) {
    const j = await head.json();
    sha = j.sha;
  } else if (head.status !== 404) {
    throw new Error(`GitHub HEAD ${head.status}: ${await head.text()}`);
  }

  const put = await fetch(apiBase, {
    method: 'PUT',
    headers: ghHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      message,
      content: toStdBase64(content),
      sha,
      committer: { name: 'AlahPanda Admin', email: 'admin@alahpandalabs.dev' },
    }),
  });
  if (!put.ok) throw new Error(`GitHub PUT ${put.status}: ${await put.text()}`);
  const j = await put.json();
  return { sha: j.content.sha, url: j.content.html_url };
}

async function triggerRedeploy(): Promise<{ ok: boolean; status: number; body: string }> {
  if (!VERCEL_DEPLOY_HOOK) return { ok: false, status: 0, body: 'VERCEL_DEPLOY_HOOK not configured' };
  const r = await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
  return { ok: r.ok, status: r.status, body: await r.text() };
}

// ---------- Router ----------
Deno.serve(async (req) => {
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
      const { password } = await req.json().catch(() => ({}));
      if (!ADMIN_PASSWORD || !JWT_SECRET) {
        return json({ error: 'Server not configured' }, 500);
      }
      if (typeof password !== 'string' || password !== ADMIN_PASSWORD) {
        // Constant-ish delay to slow brute force a touch
        await new Promise((r) => setTimeout(r, 400));
        return json({ error: 'Invalid password' }, 401);
      }
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

    if (action === 'save') {
      const { path, content, commitMessage } = await req.json().catch(() => ({}));
      if (typeof path !== 'string' || !ALLOWED_PATHS.has(path)) {
        return json({ error: 'Invalid path' }, 400);
      }
      if (typeof content !== 'string' || content.length > 1_000_000) {
        return json({ error: 'Invalid content' }, 400);
      }
      // Validate JSON
      try { JSON.parse(content); } catch { return json({ error: 'Content is not valid JSON' }, 400); }
      const result = await commitFile(path, content, commitMessage || `chore(cms): update ${path}`);
      return json({ ok: true, ...result });
    }

    if (action === 'redeploy') {
      const r = await triggerRedeploy();
      return json({ ok: r.ok, status: r.status, body: r.body }, r.ok ? 200 : 502);
    }

    if (action === 'me') {
      return json({ ok: true, sub: claims.sub, exp: claims.exp });
    }

    if (action === 'diag') {
      const check = await verifyGithubToken();
      return json({
        github: check,
        repo: GITHUB_REPO || null,
        hasToken: !!GITHUB_TOKEN,
        tokenLen: GITHUB_TOKEN ? GITHUB_TOKEN.length : 0,
        hasDeployHook: !!VERCEL_DEPLOY_HOOK,
      });
    }

    return json({ error: 'Unknown action' }, 404);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('admin-cms error:', msg);
    return json({ error: msg }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
