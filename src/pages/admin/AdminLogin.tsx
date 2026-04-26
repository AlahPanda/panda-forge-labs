import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { adminApi, adminAuth } from '@/lib/adminApi';
import { useI18n } from '@/lib/i18n';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const { token } = await adminApi.login(password);
      adminAuth.setToken(token);
      nav('/admin/editor', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <Seo title="Admin — AlahPanda Labs" description="Authorized access only." />
      <section className="container max-w-md py-24">
        <div className="glass-card rounded-lg p-8">
          <div className="flex items-center gap-2 label-mono">
            <Lock className="h-3.5 w-3.5" /> Restricted
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t('admin.title')}</h1>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="pw" className="label-mono block mb-2">{t('admin.password')}</label>
              <input
                id="pw"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-md bg-background border border-hairline focus:border-signal focus:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 font-mono"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 transition-colors disabled:opacity-60 active:scale-[0.98]"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('admin.signin')}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
