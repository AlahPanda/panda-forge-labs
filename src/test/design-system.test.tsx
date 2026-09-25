import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { ProjectStatusBadge } from '@/components/design-system/ProjectStatus';
import { IconButton } from '@/components/design-system/Primitives';

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
});
