import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
export type ThemePreference = Theme | 'system';
const STORAGE_KEY = 'apl.theme';

interface ThemeCtx {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (theme: Theme) => void;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}
const Ctx = createContext<ThemeCtx | null>(null);
const systemIsDark = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch { /* Storage can be unavailable. */ }
    return 'system';
  });
  const [systemDark, setSystemDark] = useState(systemIsDark);
  const theme: Theme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121c2b' : '#f6f0e6');
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next);
    } catch { /* Theme still works in this session. */ }
  };
  return <Ctx.Provider value={{ theme, preference, setTheme: setPreference, setPreference, toggle: () => setPreference(theme === 'dark' ? 'light' : 'dark') }}>{children}</Ctx.Provider>;
}
export function useTheme() {
  const context = useContext(Ctx);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
