import { motion } from 'framer-motion';
import Seo from '@/components/Seo';
import LauncherListCard from '@/components/launchers/LauncherListCard';
import { publicLaunchers } from '@/content/publicResolver';
import { PublicV2Card } from '@/components/PublicV2Card';

export default function Launchers() {
  const items = publicLaunchers();

  return (
    <>
      <Seo
        title="Launchers — AlahPanda Labs"
        description="Browse Minecraft launchers and reviewed official links."
      />

      <section className="border-b border-hairline relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-[0.42] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(70% 55% at 75% -15%, hsla(42, 92%, 55%, 0.11), transparent 68%)',
          }}
        />

        <div className="container relative py-16 md:py-20 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0)' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="label-mono">08 — Launchers</div>
            <h1 className="mt-3 text-5xl md:text-6xl font-semibold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text">
              Launcher lab
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Browse launchers and their available details. Official links are shown for entries that have been reviewed.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container py-14 pb-28">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((entry, i) => entry.source === 'v2' ? <PublicV2Card key={entry.slug} item={entry.item} section="launchers" /> : <LauncherListCard key={entry.slug} launcher={entry.item} index={i} />)}
        </div>
      </section>
    </>
  );
}
