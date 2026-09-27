import { ZodError } from 'zod';

export function ownerError(error: unknown, fallback: string) {
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
