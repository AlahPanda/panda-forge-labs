import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { IconButton } from '@/components/design-system/Primitives';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.removeItem('apl.theme'); document.documentElement.classList.remove('dark'); delete document.documentElement.dataset.themeTransition; });

describe('design system', () => {
  it('hides the internal prototype terminology on public badges', () => {
    render(<ProjectStatusBadge status="internal-prototype" />);
    expect(screen.getByText('In Development')).toBeInTheDocument();
    expect(screen.queryByText(/internal.prototype/i)).not.toBeInTheDocument();
  });

  it('provides an accessible name for icon-only controls', () => {
    render(<IconButton aria-label="Open options">⋯</IconButton>);
    expect(screen.getByRole('button', { name: 'Open options' })).toBeInTheDocument();
  });

  it('follows a stored choice and persists an explicit theme change', () => {
    localStorage.setItem('apl.theme', 'dark');
    function Control() { const { theme, toggle } = useTheme(); return <button onClick={toggle}>{theme}</button>; }
    render(<ThemeProvider><Control /></ThemeProvider>);
    expect(document.documentElement).toHaveClass('dark');
    fireEvent.click(screen.getByRole('button', { name: 'dark' }));
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('apl.theme')).toBe('light');
  });

  it('holds the old landscape until the new artwork loads, then dissolves', () => {
    localStorage.setItem('apl.theme', 'dark');
    const pending: Array<{ onload: null | (() => void); src: string }> = [];
    class DeferredImage {
      onload: null | (() => void) = null;
      complete = false;
      naturalWidth = 0;
      set src(value: string) { pending.push({ onload: () => this.onload?.(), src: value }); }
    }
    vi.stubGlobal('Image', DeferredImage);
    function Control() { const { toggle } = useTheme(); return <button onClick={toggle}>Change moment</button>; }
    const { container } = render(<ThemeProvider><HeroLandscape /><Control /></ThemeProvider>);
    expect(container.querySelectorAll('picture img')).toHaveLength(1);
    expect(container.querySelector('picture img')).toHaveAttribute('src', '/brand/overlook-night.webp');
    expect(container.querySelector('picture source')).toHaveAttribute('srcset', '/brand/overlook-night-mobile.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Change moment' }));
    expect(container.querySelectorAll('picture')).toHaveLength(1);
    expect(pending[0].src).toBe('/brand/overlook-day.webp');
    act(() => pending[0].onload?.());
    expect(container.querySelectorAll('picture')).toHaveLength(2);
    expect(container.querySelector('picture:last-child img')).toHaveAttribute('src', '/brand/overlook-day.webp');
    expect(container.querySelector('picture:last-child source')).toHaveAttribute('srcset', '/brand/overlook-day-mobile.webp');
  });

  it('switches between system and explicit preferences as the system changes', () => {
    let dark = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() { return query === '(prefers-color-scheme: dark)' && dark; },
      addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
    }));
    function Control() { const { theme, preference, setPreference } = useTheme(); return <><span>{theme}:{preference}</span><button onClick={() => setPreference('light')}>Light</button><button onClick={() => setPreference('dark')}>Dark</button><button onClick={() => setPreference('system')}>System</button></>; }
    render(<ThemeProvider><Control /></ThemeProvider>);
    act(() => { dark = true; listeners.forEach((listener) => listener()); });
    expect(screen.getByText('dark:system')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    expect(screen.getByText('light:light')).toBeInTheDocument();
    expect(document.documentElement).not.toHaveClass('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('apl.theme')).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'System' }));
    expect(localStorage.getItem('apl.theme')).toBeNull();
    act(() => { dark = false; listeners.forEach((listener) => listener()); });
    expect(screen.getByText('light:system')).toBeInTheDocument();
  });

  it('selects a different illustration for a different public route', () => {
    const { container } = render(<ThemeProvider><HeroLandscape scene="projects" /></ThemeProvider>);
    expect(container.querySelector('picture img')).toHaveAttribute('src', '/brand/projects-day.webp');
    expect(container.querySelector('picture source')).toHaveAttribute('srcset', '/brand/projects-day-mobile.webp');
  });
});
