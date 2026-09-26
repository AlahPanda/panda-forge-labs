import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Search, Moon, Sun, Monitor, MessageCircle } from 'lucide-react';
import { BrandSymbol } from '@/components/design-system/BrandSymbol';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { site, LOCALES, LOCALE_LABEL, type Locale } from '@/content';
import { useI18n } from '@/lib/i18n';
import { useTheme, type ThemePreference } from '@/lib/theme';
import { publicSettings } from '@/content/publicResolver';

export const siteLinks = [
  { to: '/', key: 'nav.home' }, { to: '/projects', key: 'nav.projects' },
  { to: '/modpacks', key: 'nav.modpacks' }, { to: '/launchers', key: 'nav.launchers' },
  { to: '/news', key: 'nav.news' }, { to: '/guides', key: 'nav.guides' },
  { to: '/about', key: 'nav.about' }, { to: '/faq', key: 'nav.faq' },
] as const;

function Preferences() {
  const { locale, setLocale } = useI18n();
  const { preference, setPreference } = useTheme();
  return <div className="experience-preferences">
    <label><span className="sr-only">Language</span><select aria-label="Language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>{LOCALES.map((value) => <option key={value} value={value}>{LOCALE_LABEL[value]}</option>)}</select></label>
    <label className="experience-theme-select">{preference === 'dark' ? <Moon size={17} /> : preference === 'light' ? <Sun size={17} /> : <Monitor size={17} />}<span className="sr-only">Theme</span><select aria-label="Theme" value={preference} onChange={(event) => setPreference(event.target.value as ThemePreference)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
  </div>;
}

export default function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return <header className="experience-header">
    <div className="container experience-header-inner">
      <Link to="/" className="experience-brand" aria-label="AlahPanda Labs — Home"><BrandSymbol className="experience-brand-symbol"/><span>{publicSettings()?.name || site.name}</span></Link>
      <nav className="experience-desktop-nav" aria-label="Main navigation">{siteLinks.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({isActive}) => 'experience-nav-link' + (isActive ? ' is-active' : '')}>{t(link.key)}</NavLink>)}</nav>
      <div className="experience-header-actions"><div className="experience-desktop-actions"><Preferences/><a className="experience-button experience-button-primary" href={site.discordUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>{t('nav.discord')}</a></div>
        <Link to="/projects" className="experience-mobile-icon" aria-label="Explore projects"><Search size={21}/></Link>
        <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><button className="experience-mobile-icon" aria-label="Open menu" aria-expanded={open}><Menu size={23}/></button></SheetTrigger>
          <SheetContent side="right" className="experience-drawer"><SheetHeader><SheetTitle className="experience-brand"><BrandSymbol className="experience-brand-symbol"/><span>AlahPanda Labs</span></SheetTitle></SheetHeader>
            <nav aria-label="Mobile navigation" className="experience-drawer-nav">{siteLinks.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)} className={({isActive}) => 'experience-drawer-link' + (isActive ? ' is-active' : '')}>{t(link.key)}</NavLink>)}</nav>
            <div className="experience-drawer-bottom"><Preferences/><a className="experience-button experience-button-primary" href={site.discordUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>{t('nav.discord')}</a></div>
          </SheetContent></Sheet>
      </div>
    </div>
  </header>;
}
