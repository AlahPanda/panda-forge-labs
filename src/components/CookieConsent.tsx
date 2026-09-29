import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

// Disclosure only. Inherited HTML loads third-party scripts before React mounts.
// This control therefore must not pretend to grant or withhold consent.
const KEY = 'apl.privacy-notice.v2';

export default function CookieConsent() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { setOpen(!localStorage.getItem(KEY)); } catch { setOpen(true); }
  }, []);
  const dismiss = () => {
    try { localStorage.setItem(KEY, 'dismissed'); } catch { /* Still close this notice. */ }
    setOpen(false);
  };
  if (!open) return null;
  return <aside className="experience-privacy-notice" aria-label={t('ui.privacyNotice')}>
    <Cookie size={24} aria-hidden="true" />
    <div><strong>{t('ui.privacyNotice')}</strong><p>{t('ui.privacyBody')} <a href="/legal/privacy">{t('footer.privacy')}</a></p></div>
    <button type="button" className="experience-privacy-close" onClick={dismiss} aria-label={t('ui.dismissPrivacy')}><X size={20}/></button>
  </aside>;
}
