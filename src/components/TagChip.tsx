import { motion } from 'framer-motion';
import { Apple, Monitor, Cog, Box, Sparkles, Tag as TagIcon, Gauge, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Icon resolver — case-insensitive match against known tags. */
function iconFor(tag: string) {
  const t = tag.toLowerCase();
  if (t === 'mac' || t === 'macos' || t === 'apple') return Apple;
  if (t === 'windows' || t === 'pc') return Monitor;
  if (t === 'forge' || t === 'neoforge') return Cog;
  if (t === 'fabric') return Box;
  if (t === 'aesthetic' || t === 'shaders') return Sparkles;
  if (t === 'performance') return Gauge;
  if (t === 'exploration') return Compass;
  return TagIcon;
}

interface Props {
  label: string;
  active?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  asButton?: boolean;
}

export default function TagChip({ label, active = false, onClick, size = 'md', asButton = false }: Props) {
  const Icon = iconFor(label);
  const cls = cn(
    'inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-wider transition-colors select-none',
    size === 'sm' ? 'h-7 px-2.5 text-[10px]' : 'h-8 px-3 text-[11px]',
    active
      ? 'bg-signal text-primary-foreground border-signal shadow-[0_0_0_4px_hsl(var(--signal)/0.18)]'
      : 'bg-elev/60 border-hairline text-muted-foreground hover:text-foreground hover:border-foreground/40'
  );

  const inner = (
    <>
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      <span>{label}</span>
    </>
  );

  if (onClick || asButton) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className={cls}
      >
        {inner}
      </motion.button>
    );
  }

  return <span className={cls}>{inner}</span>;
}
