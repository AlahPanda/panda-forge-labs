import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { IconButton } from '@/components/design-system/Primitives';
import { HeroLandscape } from '@/components/design-system/HeroLandscape';

afterEach(() => { cleanup(); localStorage.removeItem('apl.theme'); document.documentElement.classList.remove('dark'); });

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

  it('loads only the active moment of the same landscape', () => {
    localStorage.setItem('apl.theme', 'dark');
    function Control() { const { toggle } = useTheme(); return <button onClick={toggle}>Change moment</button>; }
    const { container } = render(<ThemeProvider><HeroLandscape /><Control /></ThemeProvider>);
    expect(container.querySelectorAll('picture img')).toHaveLength(1);
    expect(container.querySelector('picture img')).toHaveAttribute('src', '/brand/overlook-night.webp');
    expect(container.querySelector('picture source')).toHaveAttribute('srcset', '/brand/overlook-night-mobile.webp');
    fireEvent.click(screen.getByRole('button', { name: 'Change moment' }));
    expect(container.querySelector('picture img')).toHaveAttribute('src', '/brand/overlook-day.webp');
    expect(container.querySelector('picture source')).toHaveAttribute('srcset', '/brand/overlook-day-mobile.webp');
  });

  it('selects a different illustration for a different public route', () => {
    const { container } = render(<ThemeProvider><HeroLandscape scene="projects" /></ThemeProvider>);
    expect(container.querySelector('picture img')).toHaveAttribute('src', '/brand/projects-day.webp');
    expect(container.querySelector('picture source')).toHaveAttribute('srcset', '/brand/projects-day-mobile.webp');
  });
});
