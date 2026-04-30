import { useState } from 'react';
import type { LauncherItem } from '@/lib/launchers';
import { cn } from '@/lib/utils';
import { Download, ExternalLink } from 'lucide-react';

interface Props {
  launcher: LauncherItem;
  /** Glass card (modpack-style) vs compact outline button */
  variant?: 'hero' | 'compact';
  /** When true, hides subline about mirror count — used on listing cards */
  compactMeta?: boolean;
  /** Stop bubbling so parent Link does not activate */
  onInteraction?: () => void;
}

/** Multi-option download (mirror chooser modal) vs single-tab open */
export function launcherNeedsMirrorModal(launcher: LauncherItem): boolean {
  return launcher.downloads.length > 1;
}

export default function LauncherGlassDownload({
  launcher,
  variant = 'hero',
  compactMeta = false,
  onInteraction,
}: Props) {
  const [open, setOpen] = useState(false);
  const multi = launcherNeedsMirrorModal(launcher);
  const primary = launcher.downloads[0];

  const openMirrorsOrDirect = () => {
    onInteraction?.();
    if (multi) {
      setOpen(true);
      return;
    }
    if (primary?.url) {
      window.open(primary.url, '_blank', 'noopener,noreferrer');
    }
  };

  const isHero = variant === 'hero';

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openMirrorsOrDirect();
        }}
        className={cn(
          'group/download w-full rounded-xl text-left transition-all active:scale-[0.99]',
          isHero
            ? 'glass-card p-6 hover:shadow-[0_28px_64px_-32px_hsl(var(--signal)/0.42)] shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)] border border-white/[0.08]'
            : 'border border-hairline bg-elev/80 px-4 py-3.5 hover:border-signal/40 hover:bg-secondary/30'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="label-mono">Download</div>
          <Download className="h-4 w-4 shrink-0 text-signal transition-transform group-hover/download:translate-y-[-1px]" />
        </div>
        <div className={cn('font-semibold tracking-tight', isHero ? 'mt-3 text-xl md:text-2xl' : 'mt-1.5 text-sm')}>
          {multi ? launcher.name : `Install ${launcher.name}`}
        </div>
        {!compactMeta && (
          <p className={cn('text-muted-foreground', isHero ? 'mt-2 text-xs leading-relaxed' : 'mt-1 text-[11px]')}>
            {multi
              ? `${launcher.downloads.length} builds · Pick your OS`
              : 'Opens the official downloads page'}
          </p>
        )}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-signal font-medium mt-5',
            isHero ? 'text-sm' : 'mt-3 text-xs'
          )}
        >
          {multi ? (
            <>
              Choose option <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </>
          ) : (
            <>
              Open in new tab <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </>
          )}
        </div>
      </button>

      {multi && open && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-labelledby="launcher-mirror-title"
            className="w-full max-w-md glass-card rounded-xl p-6 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="label-mono">Choose platform</div>
            <h2 id="launcher-mirror-title" className="mt-2 text-2xl font-semibold tracking-tight">
              {launcher.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Mirrors open in a new tab ({launcher.id === 'astralrinth' ? 'via ouo.io' : ''}).
            </p>
            <div className="mt-6 space-y-2">
              {launcher.downloads.map((d) => (
                <a
                  key={d.url + d.label}
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 rounded-lg border border-hairline bg-background/60 hover:border-signal hover:bg-secondary/45 transition-colors text-left active:scale-[0.99]"
                >
                  <span className="font-medium">{d.label}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full h-10 rounded-md border border-hairline text-sm text-muted-foreground hover:bg-secondary/50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
