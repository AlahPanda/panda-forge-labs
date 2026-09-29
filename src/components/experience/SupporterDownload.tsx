import { useState } from 'react';
import { Download, ArrowRight } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useI18n } from '@/lib/i18n';

export type SupporterConfig = { enabled?: boolean; url?: string; label?: string; message?: string };
export const resolveSupporterConfiguration = (project?: SupporterConfig, global?: SupporterConfig) => project === undefined ? global : project;
export function supporterUrl(config?: SupporterConfig): string | undefined {
  if (!config?.enabled || !config.url) return undefined;
  try { const url = new URL(config.url); return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
export function SupporterDownload({ normalUrl, configuration, label }: { normalUrl: string; configuration?: SupporterConfig; label: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const alternate = supporterUrl(configuration);
  if (!alternate) return <a className="experience-button experience-button-primary" href={normalUrl}><Download size={18}/> {label} <ArrowRight size={17}/></a>;
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><button type="button" className="experience-button experience-button-primary"><Download size={18}/> {label} <ArrowRight size={17}/></button></Dialog.Trigger>
    <Dialog.Portal><Dialog.Overlay className="supporter-overlay"/><Dialog.Content className="supporter-dialog" aria-describedby="supporter-description">
      <Dialog.Title>{t('supporter.title')}</Dialog.Title><Dialog.Description id="supporter-description">{configuration?.message || t('supporter.message')}</Dialog.Description>
      <div className="experience-card-actions"><a className="experience-button experience-button-primary" href={alternate} rel="noopener noreferrer">{configuration?.label || t('supporter.alternate')}</a><a className="experience-button experience-button-soft" href={normalUrl}>{t('supporter.normal')}</a></div>
      <Dialog.Close className="experience-text-link" type="button">{t('supporter.close')}</Dialog.Close>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
