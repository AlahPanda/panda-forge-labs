import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider, useI18n } from '@/lib/i18n';

function LanguageProbe() {
  const { locale, setLocale, t } = useI18n();
  return <><output>{locale}: {t('support.install')}</output><button onClick={() => setLocale('pt-PT')}>Português</button><button onClick={() => setLocale('es')}>Español</button><span>{t('untranslated.key')}</span></>;
}
afterEach(() => { cleanup(); localStorage.removeItem('apl.locale'); });
describe('public interface language', () => {
  it('persists locale, updates labels and falls back safely for missing keys', () => {
    localStorage.setItem('apl.locale', 'en');
    render(<I18nProvider><LanguageProbe/></I18nProvider>);
    expect(screen.getByText('en: Installing Mac Native')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Português' }));
    expect(screen.getByText('pt-PT: Instalar Mac Native')).toBeInTheDocument();
    expect(localStorage.getItem('apl.locale')).toBe('pt-PT');
    fireEvent.click(screen.getByRole('button', { name: 'Español' }));
    expect(screen.getByText('es: Instalar Mac Native')).toBeInTheDocument();
    expect(screen.getByText('untranslated.key')).toBeInTheDocument();
  });
});
