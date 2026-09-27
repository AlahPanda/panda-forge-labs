import { previewOrigin } from './adminApi';

export type PreviewCommit = { sha: string; url?: string; branch: string; kind: string; slug: string };
const KEY = 'apl.admin.preview-commit';

export function rememberPreviewCommit(commit: PreviewCommit) {
  if (commit.branch === 'v2/full-redesign' && /^[a-f0-9]{40}$/.test(commit.sha)) sessionStorage.setItem(KEY, JSON.stringify(commit));
}
export function pendingPreviewCommit(): PreviewCommit | null {
  try {
    const result = JSON.parse(sessionStorage.getItem(KEY) || 'null') as PreviewCommit | null;
    return result?.branch === 'v2/full-redesign' && /^[a-f0-9]{40}$/.test(result.sha) ? result : null;
  } catch { return null; }
}
export async function isPreviewReady(commit: PreviewCommit): Promise<boolean> {
  const origin = previewOrigin();
  if (!origin || commit.branch !== 'v2/full-redesign' || !/^[a-f0-9]{40}$/.test(commit.sha)) return false;
  try {
    const response = await fetch(`${origin}/preview-build.json`, { cache: 'no-store' });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) return false;
    const build = await response.json();
    return build.branch === commit.branch && build.sha === commit.sha;
  } catch { return false; }
}
