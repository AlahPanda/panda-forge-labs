import { createContext, useContext, useEffect, useLayoutEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';
const STORAGE_KEY = 'apl.theme';

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch { /* Private browsing may disable storage. */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.toggle('dark', theme === 'dark');
    body.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121c2b' : '#f6f0e6');
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = () => {
      try { if (window.localStorage.getItem(STORAGE_KEY)) return; } catch { /* Continue with system preference. */ }
      setThemeState(media.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = (t: Theme) => {
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch { /* Toggle still works for this session. */ }
    setThemeState(t);
  };
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return <Ctx.Provider value={{ theme, setTheme, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
