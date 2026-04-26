import { Link } from 'react-router-dom';
import { site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { Lock, Coffee } from 'lucide-react';

export default function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline mt-24">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="text-sm font-semibold tracking-tight">AlahPanda Labs</div>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">{t('footer.tagline')}</p>

          {site.ads.showSupportButton && (
            <a
              href={site.supportUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 px-4 h-10 rounded-md bg-signal/10 border border-signal/30 text-signal font-medium hover:bg-signal/20 transition-colors active:scale-[0.97]"
            >
              <Coffee className="h-4 w-4" /> Support on Ko-fi
            </a>
          )}
        </div>
        <div>
          <div className="label-mono mb-3">Hub</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/modpacks" className="hover:text-signal transition-colors">{t('nav.modpacks')}</Link></li>
            <li><Link to="/news" className="hover:text-signal transition-colors">{t('nav.news')}</Link></li>
            <li><Link to="/about" className="hover:text-signal transition-colors">{t('nav.about')}</Link></li>
            <li><Link to="/faq" className="hover:text-signal transition-colors">{t('nav.faq')}</Link></li>
            <li><Link to="/support" className="hover:text-signal transition-colors">Support</Link></li>
          </ul>
        </div>
        <div>
          <div className="label-mono mb-3">{t('footer.legal')}</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/legal?kind=privacy" className="text-zinc-400 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
            <li><Link to="/legal?kind=terms" className="text-zinc-400 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
            <li><a href={`mailto:${site.contactEmail}`} className="hover:text-signal transition-colors">{site.contactEmail}</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="container py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              aria-label="Lab access"
              title="Lab access"
              className="inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground/40 hover:text-signal hover:bg-secondary/60 transition-colors"
            >
              <Lock className="h-3 w-3" />
            </Link>
            <span className="font-mono text-[11px] text-muted-foreground/70">
              © {year} AlahPanda Labs · {t('footer.rights')}
            </span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground/60">
            v2.1 · build.{year}
          </div>
        </div>
      </div>
    </footer>
  );
}
