import { motion } from 'framer-motion';
import Seo from '@/components/Seo';
import LauncherListCard from '@/components/launchers/LauncherListCard';
import { launchersForList } from '@/lib/launchers';

export default function Launchers() {
  const items = launchersForList();

  return (
    <>
      <Seo
        title="Launchers — AlahPanda Labs"
        description="Interactive Minecraft launcher gallery — ratings, tags, and a focused path to AstralRinth plus trusted third-party clients."
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
              Cards surface community-style ratings and functional tags. AstralRinth is highlighted as our pick — open any tile for a
              software-style showcase or a technical dossier with compare tables.
            </p>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-7 max-w-2xl text-sm rounded-2xl border border-orange-500/25 px-5 py-4 bg-orange-500/[0.08] shadow-[inset_0_1px_0_0_hsla(0,0%,100%,0.08)] leading-relaxed text-foreground/90"
            >
              <span className="font-semibold text-amber-200/95">Momentum check:</span> AstralRinth remains the launcher players heat-map
              alongside our docs — browse the grid fairly, then dive into the page that matches your workflow.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="container py-14 pb-28">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((launcher, i) => (
            <LauncherListCard key={launcher.id} launcher={launcher} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
