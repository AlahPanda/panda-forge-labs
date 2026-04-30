import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Fixed 0–5 community-style rating rendered as filled / half / empty stars */
export default function LauncherStars({ rating, className }: { rating: number; className?: string }) {
  const clamped = Math.max(0, Math.min(5, rating));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.45 && full < 5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} aria-label={`Rating ${clamped} out of 5`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} aria-hidden />
      ))}
      {hasHalf ? (
        <span className="relative h-3.5 w-3.5 inline-block" aria-hidden>
          <Star className="absolute inset-0 h-3.5 w-3.5 text-muted-foreground/40" strokeWidth={1.2} />
          <span className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
          </span>
        </span>
      ) : null}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-3.5 w-3.5 text-muted-foreground/35" strokeWidth={1.2} aria-hidden />
      ))}
      <span className="ml-1.5 text-[11px] font-mono tabular text-muted-foreground">{clamped.toFixed(1)}</span>
    </div>
  );
}
