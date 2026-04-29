import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LauncherItem } from '@/lib/launchers';

export default function LauncherListCard({ launcher }: { launcher: LauncherItem }) {
  const subtle = launcher.recommended === true;

  return (
    <Link
      to={`/launchers/${launcher.id}`}
      className={cn(
        'group block rounded-lg border border-hairline bg-elev/40 overflow-hidden transition-all duration-200',
        'hover:border-signal/35 hover:bg-elev hover:shadow-[0_18px_48px_-24px_hsl(var(--signal)/0.25)] active:scale-[0.995]',
        subtle && 'border-signal/25 bg-signal/[0.03] ring-1 ring-signal/15'
      )}
    >
      <div className={cn('p-5', subtle && 'border-l-2 border-l-signal/50')}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight group-hover:text-signal transition-colors">
                {launcher.name}
              </h2>
              {subtle && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-signal/90 px-1.5 py-0.5 rounded border border-signal/25 bg-signal/10">
                  Our pick
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{launcher.summary}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-signal transition-colors mt-0.5" aria-hidden />
        </div>
        <div className="mt-4 label-mono text-[10px] text-muted-foreground/80">Open details · downloads · comparison</div>
      </div>
    </Link>
  );
}
