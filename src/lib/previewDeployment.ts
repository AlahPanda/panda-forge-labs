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
  if (commit.branch !== 'v2/full-redesign' || !/^[a-f0-9]{40}$/.test(commit.sha)) return false;
  const origins = [...new Set([window.location.origin, previewOrigin()].filter((origin): origin is string => !!origin))];
  for (const origin of origins) {
    try {
      const response = await fetch(`${origin}/preview-build.json`, { cache: 'no-store' });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) continue;
      const build = await response.json();
      if (build.branch === commit.branch && build.sha === commit.sha) return true;
    } catch { /* Protected or unavailable alias: try the other explicitly configured origin. */ }
  }
  return false;
}
