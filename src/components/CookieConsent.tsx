import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

// Disclosure only. Inherited HTML loads third-party scripts before React mounts.
// This control therefore must not pretend to grant or withhold consent.
const KEY = 'apl.privacy-notice.v2';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try { setOpen(!localStorage.getItem(KEY)); } catch { setOpen(true); }
  }, []);
  const dismiss = () => {
    try { localStorage.setItem(KEY, 'dismissed'); } catch { /* Still close this notice. */ }
    setOpen(false);
  };
  if (!open) return null;
  return <aside className="experience-privacy-notice" aria-label="Privacy information">
    <Cookie size={24} aria-hidden="true" />
    <div><strong>Privacy information</strong><p>This site may load third-party analytics and advertising scripts. This notice does not control them. Read the <a href="/legal/privacy">privacy policy</a> for more information.</p></div>
    <button type="button" className="experience-privacy-close" onClick={dismiss} aria-label="Close privacy information"><X size={20}/></button>
  </aside>;
}
