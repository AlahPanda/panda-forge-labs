import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { LauncherItem } from '@/lib/launchers';
import pandaLogo from '@/assets/logo.png';

interface Props {
  launcher: LauncherItem;
  size?: number;
  className?: string;
}

export default function LauncherLogo({ launcher, size = 56, className }: Props) {
  const [err, setErr] = useState(false);
  const isAstral = launcher.id === 'astralrinth';

  if (isAstral) {
    return (
      <img
        src={pandaLogo}
        alt=""
        width={size}
        height={size}
        className={cn('rounded-2xl object-cover ring-2 ring-signal/30 shadow-lg shadow-black/20', className)}
      />
    );
  }

  if (launcher.logoUrl && !err) {
    return (
      <img
        src={launcher.logoUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setErr(true)}
        className={cn(
          'rounded-2xl object-contain bg-white/[0.06] ring-1 ring-white/10 p-2 shadow-inner',
          className
        )}
      />
    );
  }

  const initials = launcher.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-elev font-mono text-sm font-bold text-foreground ring-1 ring-white/10',
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials.slice(0, 2)}
    </div>
  );
}
