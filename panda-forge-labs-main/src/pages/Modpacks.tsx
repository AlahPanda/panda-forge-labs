import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import ModpackCard from '@/components/ModpackCard';
import TagChip from '@/components/TagChip';
import { modpacks } from '@/content';
import { useI18n } from '@/lib/i18n';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const FILTER_TAGS = ['Mac', 'Windows', 'Fabric', 'Forge'] as const;
type Tag = (typeof FILTER_TAGS)[number];

export default function Modpacks() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Set<Tag>>(new Set());

  // Keyboard "/" focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        document.getElementById('modpack-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (tag: Tag) => {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modpacks.filter((m) => {
      if (q) {
        const hay = `${m.name} ${m.tagline} ${m.summary} ${m.tags.join(' ')} ${m.loader}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (active.size) {
        const tagsLower = m.tags.map((x) => x.toLowerCase());
        const loaderLower = m.loader.toLowerCase();
        for (const a of active) {
          const al = a.toLowerCase();
          const matches = tagsLower.includes(al) || loaderLower.includes(al);
          if (!matches) return false;
        }
      }
      return true;
    });
  }, [query, active]);

  return (
    <SiteLayout>
      <Seo title="Modpacks — AlahPanda Labs" description="Browse the full AlahPanda Labs modpack catalog. Performance-tuned, version-pinned, and shipped with a lockfile." />

      {/* Hero search section */}
      <section className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(60% 40% at 50% 0%, hsl(var(--signal) / 0.10), transparent 70%)' }}
        />
        <div className="container relative py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 label-mono">
              <span className="signal-dot" />
              <span>01 — Catalog</span>
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">{t('nav.modpacks')}</h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Every pack is version-pinned, profiled, and shipped with a lockfile.
            </p>

            {/* Big centered search */}
            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative block mt-10 max-w-2xl mx-auto"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="modpack-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modpacks, loaders, tags…"
                className="w-full h-14 pl-14 pr-28 rounded-xl border border-hairline bg-background/80 backdrop-blur-md text-base
                           focus:outline-none focus:border-signal focus:shadow-[0_0_0_4px_hsl(var(--signal)/0.15)]
                           transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <kbd className="hidden md:inline-flex h-7 px-2 items-center font-mono text-[10px] uppercase tracking-wider border border-hairline rounded text-muted-foreground bg-elev">
                  /
                </kbd>
              </div>
            </motion.label>

            {/* Tag chips */}
            <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground mr-1">
                <SlidersHorizontal className="h-3 w-3" /> Filter
              </span>
              {FILTER_TAGS.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  active={active.has(tag)}
                  onClick={() => toggle(tag)}
                />
              ))}
              {active.size > 0 && (
                <button
                  onClick={() => setActive(new Set())}
                  className="px-3 h-8 rounded-full text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="label-mono">
            <span className="text-foreground tabular">{filtered.length}</span> of <span className="tabular">{modpacks.length}</span> packs
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m, i) => <ModpackCard key={m.slug} modpack={m} index={i} />)}
        </div>

        {filtered.length === 0 && (
          <div className="mt-8 border border-dashed border-hairline rounded-lg p-12 text-center">
            <div className="label-mono">No matches</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing filters or search for a different term.
            </p>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
