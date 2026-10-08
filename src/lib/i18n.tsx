import { createContext, useContext, useCallback, useEffect, useLayoutEffect, useMemo, useState, ReactNode } from 'react';
import { i18n, LOCALES, type Locale } from '@/content';

interface I18nCtx {
  locale: Locale;
  preference: LocalePreference;
  setPreference: (preference: LocalePreference) => void;
  setLocale: (l: Locale) => void;
  t: (key: string, values?: Record<string, string>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = 'apl.locale';

export type LocalePreference = Locale | 'system';

export function detectBrowserLocale(languages: readonly string[], language = 'en'): Locale {
  for (const value of [...languages, language]) {
    const code = value.toLowerCase();
    if (code === 'pt-br' || code.startsWith('pt-br-')) return 'pt-BR';
    if (code === 'pt' || code.startsWith('pt-')) return 'pt-PT';
    if (code === 'en' || code.startsWith('en-')) return 'en';
    if (code === 'es' || code.startsWith('es-')) return 'es';
  }
  return 'en';
}
const browserLocale = () => typeof navigator === 'undefined' ? 'en' : detectBrowserLocale(navigator.languages || [], navigator.language);
function storedPreference(): LocalePreference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (LOCALES.includes(value as Locale)) return value as Locale;
  } catch { /* Session preferences still work without storage. */ }
  return 'system';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LocalePreference>(storedPreference);
  const [systemLocale, setSystemLocale] = useState<Locale>(browserLocale);
  const locale = preference === 'system' ? systemLocale : preference;
  const setPreference = useCallback((next: LocalePreference) => {
    setPreferenceState(next);
    if (next === 'system') setSystemLocale(browserLocale());
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch { /* Preserve the in-session choice. */ }
  }, []);
  const setLocale = useCallback((next: Locale) => setPreference(next), [setPreference]);
  useEffect(() => {
    const changed = () => setSystemLocale(browserLocale());
    window.addEventListener('languagechange', changed);
    return () => window.removeEventListener('languagechange', changed);
  }, []);
  useLayoutEffect(() => { document.documentElement.lang = locale; }, [locale, preference]);

  const value = useMemo<I18nCtx>(() => {
    const dict = i18n[locale] ?? i18n.en;
    const fallback = i18n.en;
    const t = (key: string, values?: Record<string, string>) => {
      const phrase = dict[key] ?? fallback[key];
      // Unknown keys are a developer error; show a neutral localized label.
      if (!phrase) return dict['ui.unavailable'] ?? fallback['ui.unavailable'] ?? 'Content unavailable';
      return phrase.replace(/\{([a-zA-Z]+)\}/g, (match, name: string) => values?.[name] ?? match);
    };
    return { locale, preference, setLocale, setPreference, t };
  }, [locale, preference, setLocale, setPreference]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
