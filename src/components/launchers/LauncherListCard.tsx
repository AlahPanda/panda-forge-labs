import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LauncherItem } from '@/lib/launchers';
import LauncherLogo from './LauncherLogo';
import LauncherGlassDownload from './LauncherGlassDownload';
import LauncherStars from './LauncherStars';

export default function LauncherListCard({
  launcher,
  index = 0,
}: {
  launcher: LauncherItem;
  index?: number;
}) {
  const isPick = launcher.recommended === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      transition={{
        duration: 0.55,
        delay: Math.min(index * 0.07, 0.45),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        scale: 1.02,
        y: -3,
        transition: { type: 'spring', stiffness: 380, damping: 22 },
      }}
      className="h-full origin-center"
    >
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-2xl border border-hairline overflow-hidden bg-gradient-to-b from-white/[0.06] via-elev/50 to-background/95',
          'shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.06)] transition-shadow duration-300',
          isPick &&
            'border-orange-400/45 shadow-[0_0_0_1px_hsla(28,95%,55%,0.25),0_0_48px_-8px_hsla(28,95%,53%,0.45)] ring-2 ring-orange-400/20'
        )}
      >
        {isPick && (
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-80"
            style={{
              background:
                'linear-gradient(135deg, hsla(32, 100%, 55%, 0.35), transparent 42%, hsla(280, 70%, 55%, 0.12) 85%)',
              maskImage: 'linear-gradient(#000, #000)',
              WebkitMaskImage: 'linear-gradient(#000, #000)',
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_85%_-20%,hsl(var(--signal)/0.12),transparent_65%)] opacity-70" />

        <Link
          to={`/launchers/${launcher.id}`}
          className={cn(
            'relative z-[1] block p-5 pb-4',
            'after:absolute after:inset-0 after:rounded-t-2xl after:transition-opacity group-hover:after:opacity-100 after:opacity-0 after:bg-gradient-to-br after:from-signal/[0.07] after:to-transparent'
          )}
        >
          <div className="relative flex gap-4">
            <LauncherLogo launcher={launcher} size={62} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 gap-y-1.5">
                <h2 className="text-lg font-semibold tracking-tight group-hover:text-signal transition-colors">{launcher.name}</h2>

                {isPick ? (
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider',
                      'border-amber-300/60 bg-gradient-to-r from-amber-400/25 to-orange-500/20 text-amber-50 shadow-[0_0_20px_-4px_rgba(251,191,36,0.55)]'
                    )}
                  >
                    Our pick
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <LauncherStars rating={launcher.communityRating} />
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {launcher.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md border border-hairline bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="font-mono text-[11px] text-muted-foreground/90 truncate mt-2">{launcher.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{launcher.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-signal/95">
                Open showcase <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </div>
          </div>
        </Link>

        <div className="relative z-[2] px-5 pb-5 mt-auto space-y-3">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-hairline to-transparent opacity-70" />

          <LauncherGlassDownload launcher={launcher} variant="compact" compactMeta />

          <p className="text-[11px] text-muted-foreground text-center px-2">
            Or open the{' '}
            <Link to={`/launchers/${launcher.id}`} className="text-signal/90 underline-offset-4 hover:underline font-medium">
              full page
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
