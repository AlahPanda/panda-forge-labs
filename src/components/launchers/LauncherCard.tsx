import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LauncherItem } from '@/lib/launchers';
import LauncherFeaturesTable from './LauncherFeaturesTable';
import AstralDownloadDialog from './AstralDownloadDialog';

export default function LauncherCard({ launcher }: { launcher: LauncherItem }) {
  const isFeatured = launcher.recommended === true;

  return (
    <article
      className={cn(
        'rounded-lg border border-hairline bg-elev/40 overflow-hidden',
        isFeatured &&
          'lg:col-span-3 md:col-span-2 border-signal/60 shadow-[0_0_0_1px_hsl(var(--signal)/0.35),0_28px_80px_-48px_hsl(var(--signal)/0.45)] ring-2 ring-signal/25',
      )}
      style={
        isFeatured
          ? {
              background:
                'radial-gradient(75% 55% at 85% -10%, hsl(var(--signal) / 0.14), transparent 65%), hsl(var(--surface-elev))',
            }
          : undefined
      }
    >
      <div className="p-6">
        <div className="flex flex-wrap items-start gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{launcher.name}</h2>
          {launcher.trendingLabel && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-emerald-500/45 text-emerald-400 bg-emerald-500/10">
              {launcher.trendingLabel}
            </span>
          )}
          {launcher.secondaryBadge && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-signal/50 text-signal bg-signal/10">
              {launcher.secondaryBadge}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{launcher.description}</p>

        <div className="mt-6">
          {launcher.recommended && launcher.ouoDownloads ? (
            <AstralDownloadDialog downloads={launcher.ouoDownloads} buttonLabel="Download" />
          ) : launcher.officialDownloadUrl ? (
            <a
              href={launcher.officialDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-hairline hover:bg-secondary/60 transition-colors active:scale-[0.98]"
            >
              Download <span className="text-muted-foreground">· official site</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
            </a>
          ) : null}
        </div>

        <LauncherFeaturesTable features={launcher.features} />
      </div>
    </article>
  );
}
