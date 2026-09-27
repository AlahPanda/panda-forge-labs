import { ZodError } from 'zod';
import { AdminApiError } from '@/lib/adminApi';

export function ownerError(error: unknown, fallback: string) {
  if (error instanceof AdminApiError) {
    const safe: Record<string, string> = { origin: 'Preview origin rejected by the Edge allowlist.', 'missing-config': 'Supabase Preview configuration is missing.', 'session-invalid': 'CMS session expired. Sign in again.', 'github-config': 'GitHub token or repository configuration is invalid.', network: 'Cannot reach the Preview CMS API. Check network and ADMIN_ORIGINS.' };
    return safe[error.code] || fallback;
  }
  if (error instanceof ZodError) {
    const issue = error.issues[0];
    return issue ? `${issue.path.join('.') || 'item'}: ${issue.message}` : fallback;
  }
  if (error instanceof SyntaxError) return fallback;
  // The Edge can return server details in an error message. Expose only actionable,
  // known conflicts and validation errors in the owner UI.
  if (error instanceof Error && /^(Content changed on GitHub|Draft identity mismatch|Draft not found|A private draft already exists)/.test(error.message)) return error.message;
  return fallback;
}
