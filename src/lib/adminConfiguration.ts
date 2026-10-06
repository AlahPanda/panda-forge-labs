type Status = 'present' | 'missing' | 'invalid-format';

/** Public configuration only. Never return key values in diagnostics. */
export function adminConfiguration(urlValue = import.meta.env.VITE_SUPABASE_URL, keyValue = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  let url: string | undefined;
  let urlStatus: Status = urlValue ? 'invalid-format' : 'missing';
  try {
    const parsed = new URL(urlValue);
    if (parsed.protocol === 'https:' && !parsed.username && !parsed.password && parsed.pathname === '/' && !parsed.search && !parsed.hash) {
      url = parsed.origin;
      urlStatus = 'present';
    }
  } catch { /* Invalid public URL fails before transmitting credentials. */ }
  const keyStatus: Status = typeof keyValue === 'string' && keyValue.trim() ? 'present' : 'missing';
  return { url, key: keyStatus === 'present' ? keyValue : undefined, status: { VITE_SUPABASE_URL: urlStatus, VITE_SUPABASE_PUBLISHABLE_KEY: keyStatus }, ready: urlStatus === 'present' && keyStatus === 'present' };
}
