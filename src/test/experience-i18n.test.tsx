import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { i18n, LOCALES } from '@/content';
import { localizeItem } from '@/content/v2/localize';
import { projectSchema } from '@/content/v2/schema';
import { readFileSync } from 'node:fs';

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
    expect(screen.queryByText('untranslated.key')).not.toBeInTheDocument();
    expect(screen.getByText('Contenido no disponible')).toBeInTheDocument();
  });

  it('provides a nonempty translation for every shared UI key in all four locales', () => {
    const expected = Object.keys(i18n.en).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(i18n[locale]).sort()).toEqual(expected);
      expect(Object.values(i18n[locale]).every((value) => typeof value === 'string' && value.trim().length > 0)).toBe(true);
    }
  });

  it('covers every literal public UI key referenced by the mounted public components', () => {
    for (const path of ['src/pages/PublicExperience.tsx', 'src/pages/Legal.tsx', 'src/components/experience/Shared.tsx', 'src/components/experience/MacNativeProduct.tsx', 'src/components/layout/SiteHeader.tsx', 'src/components/layout/SiteFooter.tsx', 'src/components/CookieConsent.tsx']) {
      const source = readFileSync(path, 'utf8');
      const used = [...source.matchAll(/\bt\(['"]([^'"]+)['"]/g)].map((match) => match[1]);
      for (const key of used) for (const locale of LOCALES) {
        if (key.endsWith('.')) expect(Object.keys(i18n[locale]).some((candidate) => candidate.startsWith(key)), `${path}: ${locale}/${key}*`).toBe(true);
        else expect(i18n[locale][key], `${path}: ${locale}/${key}`).toBeTruthy();
      }
    }
  });

  it('overlays only approved editorial fields and retains the original when missing or blank', () => {
    const item = projectSchema.parse({ slug: 'example', name: 'Original name', summary: 'Original summary', description: 'Original detail', sourceLocale: 'pt-PT', status: 'development', releaseSlugs: [], translations: { en: { state: 'partial', fields: { name: 'Translated name', description: '   ' } } } });
    expect(localizeItem(item, 'en')).toMatchObject({ slug: 'example', name: 'Translated name', summary: 'Original summary', description: 'Original detail' });
    expect(localizeItem(item, 'es')).toEqual(item);
    expect(localizeItem(item, 'pt-PT')).toEqual(item);
  });
});
