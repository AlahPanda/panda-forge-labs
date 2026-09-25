import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { PandaMark } from '@/components/design-system/PandaMark';
import { useI18n } from '@/lib/i18n';
import { LOCALES, LOCALE_LABEL, type Locale } from '@/content';
import { useTheme } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';
import { site } from '@/content';
import { publicSettings } from '@/content/publicResolver';

export default function SiteHeader() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/modpacks', label: t('nav.modpacks') },
    { to: '/launchers', label: t('nav.launchers') },
    { to: '/news', label: t('nav.news') },
    { to: '/about', label: t('nav.about') },
    { to: '/faq', label: t('nav.faq') },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group rounded-md focus-visible:outline-offset-4">
          <PandaMark className="h-8 w-8 text-foreground transition-transform group-hover:rotate-[4deg] motion-reduce:transform-none" />
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight">{publicSettings()?.name || site.name}</span>
            <span className="label-mono text-[9px] mt-0.5">{site.tagline}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'text-foreground bg-secondary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="text-xs bg-transparent border border-hairline rounded-md px-2 py-1.5 text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Language"
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-hairline text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-95"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href={site.discordUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-signal text-primary-foreground hover:bg-signal/90 transition-colors active:scale-[0.97]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {t('nav.discord')}
          </a>
        </div>

        <button
          className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md border border-hairline"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile overlay menu — full screen, easily clickable */}
      {open && (
        <div
          className="md:hidden fixed inset-0 top-16 z-50 bg-background animate-in fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="container py-6 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-4 text-base font-medium rounded-md border border-hairline transition-colors active:scale-[0.98] ${
                    isActive
                      ? 'text-foreground bg-secondary border-signal/40'
                      : 'text-foreground bg-elev/40 hover:bg-secondary'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            <a
              href={site.discordUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-4 rounded-md bg-signal text-primary-foreground font-medium active:scale-[0.98]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {t('nav.discord')}
            </a>

            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-hairline">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="flex-1 h-11 text-sm bg-elev border border-hairline rounded-md px-3"
                aria-label="Language"
              >
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_LABEL[l]}
                  </option>
                ))}
              </select>
              <button
                onClick={toggle}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                className="h-11 w-11 inline-flex items-center justify-center rounded-md border border-hairline bg-elev"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
