import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type Modpack } from '@/content';
import { ArrowUpRight, Download } from 'lucide-react';
import SmartImage from './SmartImage';
import TagChip from './TagChip';

interface Props {
  modpack: Modpack;
  index?: number;
}

export default function ModpackCard({ modpack, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.02 }}
      style={{ ['--card-accent' as any]: `hsl(${modpack.accent})` }}
    >
      <Link
        to={`/modpacks/${modpack.slug}`}
        className="group glass-card rounded-lg p-5 block transition-shadow duration-300
                   hover:shadow-[0_0_0_1px_hsl(var(--signal)/0.5),0_24px_64px_-16px_hsl(var(--signal)/0.35)]
                   hover:border-signal/40"
      >
        <div className="flex items-start gap-4">
          {/* 1:1 cover */}
          <div className="w-20 shrink-0">
            {modpack.image ? (
              <SmartImage src={modpack.image} alt={modpack.name} aspect="aspect-square" rounded="rounded-md" />
            ) : (
              <div
                className="aspect-square rounded-md grid-bg-fine border border-hairline relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, hsl(${modpack.accent} / 0.18), transparent 70%)` }}
              >
                <span
                  className="absolute top-2 left-2 inline-block h-2 w-2 rounded-full"
                  style={{ background: `hsl(${modpack.accent})`, boxShadow: `0 0 0 4px hsl(${modpack.accent} / 0.18)` }}
                />
                <div className="absolute bottom-1 right-2 font-mono text-[10px] text-muted-foreground/70 tabular">
                  v{modpack.version}
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="label-mono">{modpack.loader.split(' ')[0]}</div>
                <h3 className="mt-1 text-xl font-semibold tracking-tight truncate">{modpack.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{modpack.tagline}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-signal transition-colors shrink-0" />
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-foreground/80 line-clamp-2">{modpack.summary}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {modpack.tags.slice(0, 4).map((tag) => (
            <TagChip key={tag} label={tag} size="sm" />
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            <span className="font-mono tabular">{modpack.downloads}</span>
            <span>·</span>
            <span className="font-mono tabular">★ {modpack.rating}</span>
            <span>·</span>
            <span className="font-mono tabular">{modpack.modCount} mods</span>
          </div>
          {modpack.trending && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-signal border border-signal/40 rounded px-1.5 py-0.5">
              Trending
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
