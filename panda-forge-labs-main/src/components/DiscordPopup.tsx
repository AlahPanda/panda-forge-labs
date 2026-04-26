import { site } from '@/content';
import { useI18n } from '@/lib/i18n';
import { useEffect } from 'react';

export default function DiscordPopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-card rounded-lg p-7 animate-in zoom-in-95"
      >
        <div className="label-mono flex items-center gap-2">
          <span className="signal-dot" /> Community
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">{t('discord.title')}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{t('discord.body')}</p>
        <div className="mt-6 flex items-center gap-3">
          <a
            href={site.discordUrl}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center px-4 h-11 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 transition-colors active:scale-[0.97]"
          >
            {t('discord.cta')}
          </a>
          <button
            onClick={onClose}
            className="px-4 h-11 rounded-md border border-hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            {t('discord.skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
