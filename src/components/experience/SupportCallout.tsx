import { Coffee, ExternalLink } from 'lucide-react';
import { publicSettings } from '@/content/publicResolver';
import { useI18n } from '@/lib/i18n';

export default function SupportCallout() {
  const { t } = useI18n();
  const url = publicSettings()?.supportUrl;
  if (!url) return null;
  return <aside className="experience-support-callout"><Coffee size={27} aria-hidden="true"/><div><strong>{t('kofi.title')}</strong><p>{t('kofi.body')}</p></div><a className="experience-button experience-button-soft" href={url} target="_blank" rel="noopener noreferrer">Ko-fi <ExternalLink size={16}/></a></aside>;
}
