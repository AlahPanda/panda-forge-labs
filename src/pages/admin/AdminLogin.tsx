import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { AdminApiError, adminApi, adminAuth, previewOrigin } from '@/lib/adminApi';
import { useI18n } from '@/lib/i18n';
import { Lock, Loader2 } from 'lucide-react';
import { useAdminText } from './adminText';

const loginErrorKey = (error: unknown) => {
  if (!(error instanceof AdminApiError)) return 'loginFailure' as const;
  return ({ origin: 'loginorigin', 'invalid-password': 'logininvalidPassword', 'missing-config': 'loginmissingConfig', 'session-invalid': 'loginsessionInvalid', 'github-config': 'logingithubConfig', network: 'loginnetwork', 'rate-limit': 'loginrateLimit', unknown: 'loginFailure' } as const)[error.code];
};

export default function AdminLogin() {
  const { t } = useI18n();
  const a = useAdminText();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originHelp, setOriginHelp] = useState(false);
  const [checking, setChecking] = useState(() => adminAuth.isLoggedIn());

  useEffect(() => {
    if (!adminAuth.isLoggedIn()) return;
    let active = true;
    adminApi.me().then(() => { if (active) nav('/admin/editor', { replace: true }); }).catch((err: unknown) => {
      if (active) { if (err instanceof AdminApiError && err.code === 'session-invalid') adminAuth.clear(); setError(a(loginErrorKey(err))); setOriginHelp(err instanceof AdminApiError && ['origin','network'].includes(err.code)); setChecking(false); }
    });
    return () => { active = false; };
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setOriginHelp(false);
    try {
      const { token } = await adminApi.login(password);
      adminAuth.setToken(token);
      nav('/admin/editor', { replace: true });
    } catch (err) {
      setError(a(loginErrorKey(err)));
      setOriginHelp(err instanceof AdminApiError && ['origin','network'].includes(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <Seo title={`${a('ownerTitle')} — AlahPanda Labs`} noindex />
      <section className="container max-w-md py-24">
        <div className="glass-card rounded-lg p-8">
          <div className="flex items-center gap-2 label-mono">
            <Lock className="h-3.5 w-3.5" /> {a('checked')}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t('admin.title')}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{a('cmsIntro')}</p>

          {checking ? <p className="mt-6" role="status">{a('checking')}</p> : <form onSubmit={submit} className="mt-6 space-y-4">
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
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {originHelp && <p className="text-xs break-words text-muted-foreground">{a('receivedOrigin')}: <code>{window.location.origin}</code>. {previewOrigin() ? <>{a('expectedOrigin')}: <code>{previewOrigin()}</code>. </> : <>{a('aliasOptional')} </>}{a('originAllowlistHelp')}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 transition-colors disabled:opacity-60 active:scale-[0.98]"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('admin.signin')}
            </button>
          </form>}
          <Link to="/" className="mt-6 inline-block text-sm text-signal underline">{a('backToSite')}</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
